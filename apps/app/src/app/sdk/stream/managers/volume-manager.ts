import { isNull } from "@soundcore/common";
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, map, skip } from "rxjs";
import { DEFAULT_VOLUME, LOCALSTORAGE_VOLUME_KEY } from "../../constants";
import { Platform } from "@angular/cdk/platform";
import { isMobilePlatform } from "../../../utils/helpers/isMobile";

export class VolumeManager {
    private readonly defaultVolume = DEFAULT_VOLUME/100;

    private readonly _volume: BehaviorSubject<number> = new BehaviorSubject(this.read());
    private readonly mute: BehaviorSubject<boolean> = new BehaviorSubject(false);

    public readonly $volume = this._volume.asObservable().pipe(
        map((val) => val * 100),
        distinctUntilChanged()
    );
    public readonly $muted = combineLatest([
        this._volume.asObservable(),
        this.mute.asObservable()
    ]).pipe(
        map(([volume, isMuted]) => volume <= 0 || isMuted), 
        distinctUntilChanged()
    );
    
    constructor(
        private readonly platform: Platform,
        private readonly audio: HTMLAudioElement,
    ) {
        this.audio.volume = Math.max(0, Math.min(1, this.volume));
        this.$volume.pipe(skip(1), debounceTime(300)).subscribe((vol) => {
            this.persist(vol);
        });
    }

    public get volume() {
        return this._volume.getValue();
    }

    public setVolume(volume: number) {
        this.audio.volume = Math.max(0, Math.min(100, (volume / 100)));
        this._volume.next(this.audio.volume);
    }

    public toggleMute() {
        const isMuted = this.mute.getValue();

        if(isMuted) {
            // Reset to previous volume and
            // push new muted state
            this.audio.volume = this._volume.getValue();
            this.mute.next(false);
            return;
        }
        
        // Otherwise set volume to 0 and
        // push new muted state
        this.audio.volume = 0;
        this.mute.next(true);
    }

    private persist(volume: number) {
        // Check if localStorage API is supported by browser
        if(isNull(localStorage)) {
            // If not supported, return and print message in console for debugging
            console.log("LocalStorage is not supported by browser. Cannot persist volume state.");
            return;
        }

        // Save to localStorage
        localStorage.setItem(LOCALSTORAGE_VOLUME_KEY, `${volume/100}`);
    }

    private read(): number {
        if(isMobilePlatform(this.platform)) {
            return 100;
        }

        // Check if localStorage API is supported by browser
        if(isNull(localStorage)) {
            // If not supported, return and print message in console for debugging
            console.log("LocalStorage is not supported by browser. Cannot read volume state.");
            return this.defaultVolume;
        }

        // Read persisted volume
        const volume = localStorage.getItem(LOCALSTORAGE_VOLUME_KEY);

        // Check if value exists, if not, return default volume
        if(isNull(volume)) return this.defaultVolume;
        
        // Return value read from localStorage
        return Math.max(0, Math.min(100, Number(volume)));
    }

}