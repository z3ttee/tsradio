import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, from, map, of, switchMap, tap } from "rxjs";
import { Channel } from "../../channel";
import { HttpClient } from "@angular/common/http";
import { TSRStreamCoordinatorGateway } from "../../gateway";
import { VolumeManager } from "../managers/volume-manager";
import { Platform } from "@angular/cdk/platform";
import { SSOService } from "../../../modules/sso/services/sso.service";
import { environment } from "../../../../environments/environment";
import { Future, toFuture } from "../../../utils/future";
import { isNull } from "@tsa/utilities";

@Injectable({
    providedIn: "root"
})
export class TSRStreamService {
    private readonly audio: HTMLAudioElement = new Audio();

    private readonly _channel = new BehaviorSubject<Channel>(null);
    public readonly $currentChannel = this._channel.asObservable();

    private readonly _playing: BehaviorSubject<boolean> = new BehaviorSubject(false);
    public readonly $isPlaying = this._playing.asObservable();

    private readonly _loadingSubject = new BehaviorSubject<boolean>(false);
    public readonly $isLoading = this._loadingSubject.asObservable();

    private readonly volumeManager = new VolumeManager(this.platform, this.audio);

    public readonly $volume = this.volumeManager.$volume;
    public readonly $isMuted = this.volumeManager.$muted;

    constructor(
        private readonly platform: Platform,
        private readonly httpClient: HttpClient,
        private readonly ssoService: SSOService,
        private readonly coordinator: TSRStreamCoordinatorGateway
    ) {
        this.registerEvents();
        // Subscribe to channel updates
        this.coordinator.$onChannelUpdated.subscribe((channel) => {
            // Check if the received update concerns current channel
            if(this._channel.getValue()?.id === channel?.id) {
                // If true, push channel data
                this._channel.next(channel);
            }
        });
    }

    /**
     * Get the currently playing channel
     */
    public get channel() {
        return this._channel.getValue();
    }

    /**
     * Mute or unmute the audio 
     * based on current state
     */
    public toggleMute() {
        this.volumeManager.toggleMute();
    }

    /**
     * Update the volume of the audio
     * @param volume Updated volume
     */
    public setVolume(volume: number): void {
        this.volumeManager.setVolume(volume);
    }

    public forceSkip(): Observable<Future<boolean>> {
        const channel = this._channel.getValue();
        if(isNull(channel)) return of(Future.notfound());
        return this.httpClient.get<boolean>(`${environment.api_base_uri}/v1/streams/${channel.id}/skip`).pipe(toFuture());
    }

    public play(channel: Channel): Observable<string> {
        return this.resolveStreamUrl(channel).pipe(
            // Update playing channel
            tap(() => this._channel.next(channel)),
            // Print to console for debug purposes
            tap((url) => console.log(`Now streaming channel '${channel.name}' on ${url}`)),
            // Update audio src
            switchMap((url) => this.setSource(url))
        );
    }

    private setSource(url: string): Observable<string> {
        return from(this.ssoService.getAccessToken()).pipe(
            map((token) => `${url}?token=${token}`),
            tap((authenticatedUrl) => this.audio.src = authenticatedUrl),
            switchMap(() => from(this.audio.play()).pipe(map(() => url))),
        );
    }

    /**
     * Toggle playback state
     * @returns True, if audio is now paused. Otherwise false
     */
    public togglePause(): Observable<boolean> {
        return new Observable<boolean>((subscriber) => {
            if(this.audio.paused) {
                subscriber.add(this.play(this._channel.getValue()).subscribe((url) => {
                    subscriber.next(false);
                    subscriber.complete();
                }));
            } else {
                this.audio.pause();
                subscriber.next(true);
                subscriber.complete();
            }
        });
    }

    private resolveStreamUrl(channel: Channel): Observable<string> {
        return new Observable<string>((subscriber) => {
            subscriber.next(`${environment.api_base_uri}/v1/streams/${channel.id}`);
            subscriber.complete();
        });
    }

    private registerEvents() {
        this.audio.onplaying = () => {
            this._playing.next(true);
        };
        this.audio.onpause = () => {
            this.audio.src = '';
            this._playing.next(false);
        };

        this.audio.onloadstart = () => this.setLoading(true);
        this.audio.onloadeddata = () => this.setLoading(false);

        this.audio.onerror = (err) => this.publishError(err);
    }

    private setLoading(loading: boolean) {
        this._loadingSubject.next(loading ?? false);
    }

    private publishError(error: string | Event) {
        if(typeof error === "string") {
            console.error(error);
            return;
        }

        this._playing.next(false);
        this.setLoading(false);

        const target: HTMLAudioElement = error.target as HTMLAudioElement;
        const err = target.error;

        switch (err.code) {
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                return;

            case MediaError.MEDIA_ERR_DECODE:
                console.warn(`Failed decoding media: ${err.message}`);
                this.play(this.channel).subscribe();
                return;

            case MediaError.MEDIA_ERR_NETWORK:
                console.error(`Connection failed: ${err.message}`);
                this.play(this.channel).subscribe();
                return;

            default:
                console.error(target);
                console.log(err);
                break;
        }
    }

}