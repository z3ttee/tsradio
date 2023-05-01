import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, combineLatest, firstValueFrom, from, map, of, switchMap, take, tap, zip } from "rxjs";
import { Channel } from "../../channel";
import { environment } from "src/environments/environment";
import { isNull } from "@soundcore/common";
import { SSOService } from "src/app/modules/sso/services/sso.service";

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
        private readonly ssoService: SSOService
    ) {
        console.log("stream instance")
        this.registerEvents();
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
            let result: boolean;

            if(this.audio.paused) {
                this.audio.play();
                result = false;
            } else {
                this.audio.pause();
                result = true;
            }

            subscriber.next(result);
            subscriber.complete();
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

    private registerEvents() {
        this.audio.onplaying = () => this._playing.next(true);
        this.audio.onpause = () => this._playing.next(false);

        this.audio.onloadstart = () => this._loadingSubject.next(true);
        this.audio.onloadeddata = () => this._loadingSubject.next(false);
    }

}