import { StreamQueue } from "./stream-queue";
import { ReadStream, createReadStream } from "node:fs";
import Throttle from "throttle";
import { PassThrough } from "node:stream";
import { ffprobe } from "@dropb/ffprobe";
import { Logger } from "@nestjs/common";
import { BehaviorSubject, Observable, Subject, catchError, debounceTime, distinctUntilChanged, from, map, of, switchMap, takeUntil, tap, throwError } from "rxjs";
import ffprobeStatic from "ffprobe-static";
import { Channel } from "../../channel/entities/channel.entity";
import { isNull, randomString, toVoid } from "@tsa/utilities";
import { Track } from "../../track";
import { readID3Tags } from "../../metadata";

ffprobe.path = ffprobeStatic.path;

export class Listener {
    public readonly id: string = randomString(32);
    public readonly client: PassThrough = new PassThrough();
}

export enum StreamStatus {
    OFFLINE = "offline",
    STARTING = "starting",
    ONLINE = "online",
    EMPTY_PLAYLIST = "empty_playlist",
    ERRORED = "errored"
}

export class Stream {
    private readonly logger = new Logger(`${Stream.name}-${this._channel.name}`);

    private readonly queue: StreamQueue = new StreamQueue(this._channel);
    private readonly listeners: Map<string, Listener> = new Map();

    private readonly _destroySubject: Subject<void> = new Subject();
    public readonly $onDestroyed = this._destroySubject.asObservable().pipe(takeUntil(this._destroySubject));

    private readonly _errorSubject = new Subject<Error>();
    public readonly $onError = this._errorSubject.asObservable().pipe(takeUntil(this._destroySubject), distinctUntilChanged());

    private readonly _statusSubject = new Subject<StreamStatus>();
    public readonly $status = this._statusSubject.asObservable().pipe(takeUntil(this._destroySubject), distinctUntilChanged(), debounceTime(100));

    private readonly _onChannelUpdatedSubj: Subject<void> = new Subject();
    public readonly $onChannelUpdated = this._onChannelUpdatedSubj.asObservable().pipe(takeUntil(this._destroySubject));

    private stream: ReadStream;
    private throttle: Throttle;

    private _currentFile: string = null;

    private readonly _currentTrackSubject: BehaviorSubject<Track> = new BehaviorSubject(null);
    public readonly $currentTrack = this._currentTrackSubject.asObservable().pipe(takeUntil(this._destroySubject), distinctUntilChanged());

    private readonly _listenerCountSubj: BehaviorSubject<number> = new BehaviorSubject(0);
    public readonly $listenerCount = this._listenerCountSubj.asObservable().pipe(takeUntil(this._destroySubject), distinctUntilChanged());

    constructor(private _channel: Channel) {
        this.$onError.pipe(takeUntil(this._destroySubject)).subscribe(() => {
            this.setStatus(StreamStatus.ERRORED);
        });
        this.$status.pipe(takeUntil(this._destroySubject)).subscribe((status) => {
            this._channel.status = status;
        });
    }

    public getChannel() {
        return this._channel;
    }

    public setChannel(val: Channel) {
        // Copy previous values to val
        val.status = this._channel?.status ?? val.status;
        val.currentTrack = this._channel?.currentTrack ?? val.currentTrack;

        this._channel = val;
        this._onChannelUpdatedSubj.next();
    }

    /**
     * Check if the stream already started streaming
     */
    public get started() {
        return this.stream && this.throttle && this._currentFile;
    }

    public get id() {
        return this._channel.id;
    }

    /**
     * Get name of the channel
     */
    public get name() {
        return this._channel.name;
    }

    /**
     * Skip current track.
     */
    public skip(): Observable<void> {
        return new Observable((subscriber) => {
            this._currentFile = null;
            this.throttle?.end();
            this.throttle = null;

            subscriber.next();
            subscriber.complete();
        }).pipe(
            catchError((error: Error) => {
                this.publishError(error);
                this.logger.error(`Error while skipping current track: ${error.message}`, error);
                return throwError(() => error);
            }),
            toVoid(),
        );
    }

    private next(): Observable<void> {
        return of(this.queue.getNext()).pipe(
            switchMap((nextFile) => this.setCurrentlyStreaming(nextFile)),
            switchMap((currentFile) => {
                if(isNull(currentFile)) return of(true);
                return this.loadStream(currentFile).pipe(map((isStreaming) => {
                    if(isStreaming) {
                        this.setStatus(StreamStatus.ONLINE);
                    }
                    return !isStreaming;
                }), catchError(() => of(false)));
            }),
            tap((isEmpty) => {
                if(isEmpty) {
                    this.setStatus(StreamStatus.EMPTY_PLAYLIST)
                }
            }),
            toVoid()
        );
    }

    private streamCurrentFile(): Observable<void> {
        return new Observable<void>((subscriber) => {
            const file = this._currentFile;
            if (isNull(file)) {
                subscriber.next();
                subscriber.complete();
            } else {
                this.getTrackBitrate(file).then((bitrate) => {
                    this.throttle = new Throttle(bitrate / 8);
        
                    this.stream
                        .pipe(this.throttle)
                        .on("data", (chunk) => this.broadcast(chunk))
                        .on("end", () => this.streamNext().subscribe())
                        .on("error", () => this.streamNext().subscribe());
                }).then(() => {
                    subscriber.next();
                }).catch((error: Error) => {
                    subscriber.error(error);
                }).finally(() => {
                    subscriber.complete();
                });         
            }
        }).pipe(catchError((err: Error) => {
            this.publishError(err);
            return of();
        }));
    }

    /**
     * Start the stream if not already streaming
     */
    public start(): Observable<void> {
        if(this.started) return of(null);
        return this.streamNext();
    }

    /**
     * Shutdown the stream
     */
    public shutdown(): Observable<void> {
        return this.setCurrentlyStreaming(null).pipe(
            tap(() => {
                this.throttle?.destroy();
                this.stream?.destroy();
                this.setStatus(StreamStatus.OFFLINE);
                this._statusSubject.next(StreamStatus.OFFLINE);
                this.listeners.clear();
                this.queue.clear();
                this._destroySubject.next();
                this._destroySubject.complete();
            }),
            toVoid()
        );
    }

    /**
     * Internal method to start playing
     * next track in queue
     */
    private streamNext(): Observable<void> {
        return this.next().pipe(switchMap(() => this.streamCurrentFile()));
    }

    /**
     * Internal method to calculate bitrate from track
     * @param filepath Path to the mp3 file
     * @returns Bitrate in bits/sec
     */
    private async getTrackBitrate(filepath: string) {
        const data = await ffprobe(filepath);
        const bitrate = data?.format?.bit_rate;

        return bitrate ? parseInt(bitrate) : 128000;
    }

    /**
     * Create a read stream and read the file contents and update
     * the stream instance
     * @param file File to read
     * @returns True, if read stream was created. Otherwise false (will throw error)
     */
    private loadStream(file: string): Observable<boolean> {
        return new Observable<boolean>((subscriber) => {
            try {
                if(!isNull(file)) {
                    this.stream = createReadStream(file);
                }

                subscriber.next(true);
            } catch (error) {
                subscriber.error(error);

                if(error instanceof Error) {
                    this.logger.error(`Error occured while loading stream for file '${file}': ${error.message}`, error);
                }
            } finally {
                subscriber.complete();
            }
        });
    }

    /**
     * Internal method to broadcast a chunk
     * for the stream to all connected clients
     * @param chunk Chunk of data
     */
    private async broadcast(chunk) {
        this.listeners.forEach((listener, id) => {
            const client = listener.client;

            try {
                // Write chunk to client 
                client.write(chunk);
            } catch (err) {
                // Handle exceptions
                if(err instanceof Error) {
                    // End client stream
                    client.end();
                    // Remove listener
                    this.removeListener(id);
                }
            }
        });
    }

    private publishError(error: Error): void {
        this._errorSubject.next(error);
    }

    /**
     * Set status of the stream
     * @param status Updated status
     */
    private setStatus(status: StreamStatus): void {
        this._channel.status = status;
        this._statusSubject.next(status);
    }

    /**
     * Updated currently streaming file
     * @param file File that is currently streaming
     */
    private setCurrentlyStreaming(file: string): Observable<string> {
        return new Observable<string>((subscriber) => {
            this._currentFile = file;

            subscriber.add(from(readID3Tags(file)).pipe(catchError((err: Error) => {
                this.publishError(err);
                return of(null);
            })).pipe(
                switchMap((track) => this.setTrack(track))
            ).subscribe(() => {
                subscriber.next(file);
                subscriber.complete();
            }));
        });
    }

    /**
     * Update currently playing track metadata
     * @param track Updated track metadata to set
     */
    private setTrack(track: Track): Observable<void> {
        return new Observable((subscriber) => {
            this._channel.currentTrack = track;
            this._currentTrackSubject.next(track);

            subscriber.next();
            subscriber.complete();
        });
    }

    /**
     * Create a new listener instance.
     * This will generate an id and a passthrough 
     * object to pipe streams.
     * @param listener Add an existing listener to the stream. If `null`, a new listener will be created
     * @returns Listener
     */
    public addListener(listener?: Listener): Listener {
        const _listener = listener ?? new Listener();

        this.listeners.set(_listener.id, _listener);
        this.logger.log(`Listener connected (${this.listeners.size}) to '${this.name}'`);
        this.emitListenerCount();

        return _listener;
    }

    /**
     * Remove an existing listener from the stream to
     * end the stream
     * @param id Id of the listener object
     */
    public removeListener(listenerId: string): void {
        this.listeners.delete(listenerId);
        this.logger.log(`Listener disconnected (${this.listeners.size}) from '${this.name}'`);
        this.emitListenerCount();
    }

    /**
     * Push a new listener count value to the subject
     * to trigger an update event for the listener
     * count
     */
    private emitListenerCount(): void {
        const listeners = this.listeners.size ?? 0;
        this._listenerCountSubj.next(listeners);
    }
}