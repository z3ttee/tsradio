import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, from, map, of, switchMap, take, tap, zip } from "rxjs";
import { Channel } from "../../channel";
import { environment } from "src/environments/environment";
import { isNull } from "@soundcore/common";
import { SSOService } from "src/app/modules/sso/services/sso.service";
import { Future, toFuture } from "src/app/utils/future";
import { HttpClient } from "@angular/common/http";

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

    constructor(
        private readonly httpClient: HttpClient,
        private readonly ssoService: SSOService
    ) {
        console.log("stream instance")
        this.registerEvents();
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
        this.audio.src = url;
        return from(this.audio.play()).pipe(map(() => url));
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
                }))
            } else {
                this.audio.pause();
                subscriber.next(true);
                subscriber.complete();
            }
            
        });
    }

    private resolveStreamUrl(channel: Channel): Observable<string> {
        return zip([ of(channel), this.ssoService.$token ]).pipe(
            map(([ c, token ]) => {
                if(isNull(c)) return null;
                return `${environment.api_base_uri}/v1/streams/${channel.id}?token=${token}`;
            }),
            take(1)
        );
    }

    private publishError(error: string | Event) {
        this._loadingSubject.next(false);
        console.error(error);
    }

    private registerEvents() {
        this.audio.onplaying = () => {
            this._playing.next(true);
        };
        this.audio.onpause = () => {
            this.audio.src = '';
            this._playing.next(false)
        };

        this.audio.onloadstart = () => this._loadingSubject.next(true);
        this.audio.onloadeddata = () => this._loadingSubject.next(false);

        this.audio.onerror = (err) => this.publishError(err)
    }

}