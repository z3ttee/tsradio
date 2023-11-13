import { DestroyRef, Injectable, inject } from "@angular/core";
import { BehaviorSubject, Subject, distinctUntilChanged, takeUntil } from "rxjs";
import { Channel, ChannelOverview, SDKChannelService } from "../sdk";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ApiError } from "../utils/error/api-error";
import { isNull } from "@tsa/utilities";
import { SDKStreamCoordinatorGateway } from "../sdk/gateway/general-gateway.gateway";

@Injectable({
    providedIn: "root"
})
export class TSAChannelManager {
    private readonly _destroyRef = inject(DestroyRef);
    private readonly _channelService = inject(SDKChannelService);
    private readonly _coordinator = inject(SDKStreamCoordinatorGateway);
    /**
     * Subject that is internally used
     * to cancel ongoin http requests
     */
    private readonly _cancel = new Subject<void>();

    private readonly _isLoadingSubj = new BehaviorSubject<boolean>(true);
    private readonly _lastError = new BehaviorSubject<ApiError | null>(null);
    private readonly _featuredChannels = new BehaviorSubject<Channel[]>([]);
    private readonly _nonfeaturedChannels = new BehaviorSubject<Channel[]>([]);

    private readonly _channels = new Map<string, Channel>();

    /**
     * Observable that emits the current loading
     * state of the manager. This will always emit true,
     * as soon as the manager makes a request to fetch the current
     * channel overview. This will not emit a value if the manager
     * receives an update by the backend service
     */
    public readonly $loading = this._isLoadingSubj.asObservable().pipe(distinctUntilChanged());
    /**
     * Observable that emits the current error
     * state of the manager. This will emit the last
     * occured error when making the request to fetch
     * the current channel overview
     */
    public readonly $lastError = this._isLoadingSubj.asObservable().pipe(distinctUntilChanged());

    /**
     * Observable that emits the current list
     * of available featured channels
     */
    public readonly $featuredChannels = this._featuredChannels.asObservable().pipe(distinctUntilChanged());
    /**
     * Observable that emits the current list
     * of available non-featured channels
     */
    public readonly $nonfeaturedChannels = this._nonfeaturedChannels.asObservable().pipe(distinctUntilChanged());

    constructor() {
        this.initializeManager();

        // Subscribe to channel create events
        this._coordinator.$onChannelCreated.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((channel) => {
            this.registerChannel(channel);
        });
        // Subscribe to channel delete events
        this._coordinator.$onChannelDeleted.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((channelId) => {
            this.unregisterChannel(channelId);
        });
        // Subscribe to channel update events
        this._coordinator.$onChannelUpdated.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((channel) => {
            this.updateChannel(channel);
        });
        // Subscribe to channel track changed events
        this._coordinator.$onChannelTrackChanged.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((event) => {
            const channel = this.getChannelById(event.channelId);
            if(isNull(channel)) return;
            
            channel.currentTrack = event.track ?? null;
            this.updateChannel(channel);
        });
        // Subscribe to channel listeners changed event
        this._coordinator.$onChannelListenersChanged.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((event) => {
            const channel = this.getChannelById(event.channelId);
            if(isNull(channel)) return;
            
            channel.currentListeners = event.listeners ?? 0;
            this.updateChannel(channel);
        });
    }

    public registerChannel(channel: Channel): void {
        this._channels.set(channel.id, channel);
        this.updateSubjects();
    }

    public unregisterChannel(channelId: string): boolean {
        const result = this._channels.delete(channelId);
        this.updateSubjects();

        return result;
    }

    public updateChannel(channel: Channel): void {
        const channelId = channel.id;
        const localChannel: Channel | null = this._channels.get(channelId);

        const updatedChannel = {
            ...localChannel,
            ...channel
        };

        this._channels.set(channelId, updatedChannel);
        this.updateSubjects();
    }

    /**
     * Get a channel by its id from the local state.
     * @param channelId 
     * @returns Instance of the channel object. Returns `null` if the channel was not found
     */
    public getChannelById(channelId: string): Channel | null {
        return this._channels.get(channelId) ?? null;
    }

    /**
     * Initialize the manager by resetting
     * all states and performing
     * a fetch request to get the latest
     * channel overview.
     */
    private initializeManager(): void {
        // Cancel ongoing http requests
        this._cancel.next();

        // Reset state
        this._channels.clear();
        this._isLoadingSubj.next(true);
        this._lastError.next(null);
        this.updateSubjects();

        // Call service to find a channel
        // overview
        this._channelService.findOverview().pipe(takeUntil(this._cancel), takeUntilDestroyed(this._destroyRef)).subscribe((overview) => {
            // Update loading state
            this._isLoadingSubj.next(overview.loading);
            // Update error state
            this._lastError.next(overview.error ?? null);

            // Update channel lists
            this.setChannels(overview.data);
            this.updateSubjects();
        });
    }

    /**
     * Set the internal channels-map.
     * If null is provided, the map is reset
     * @param overview Channel overview to set as internal map
     */
    private setChannels(overview?: ChannelOverview): void {
        if(isNull(overview)) {
            this._channels.clear();
            return;
        }

        const channels = [
            ...overview.featured,
            ...overview.nonfeatured
        ];

        for(const channel of channels) {
            this._channels.set(channel.id, channel);
        }    
        
        console.log(`[ChannelManager] Updated channel lists. Found ${overview.featured.length + overview.nonfeatured.length} channels`);
    }

    /**
     * Internal function to update the channel subjects
     * and publish changes. This will take the channels-map
     * and filter the values based on featured flag.
     */
    private updateSubjects(): void {
        const channels = this._channels.values();

        const featuredChannels = [];
        const nonfeaturedChannels = [];

        for(const channel of channels) {
            if(channel.featured) {
                featuredChannels.push(channel);
                continue;
            }

            nonfeaturedChannels.push(channel);
        }

        this._featuredChannels.next(featuredChannels);
        this._nonfeaturedChannels.next(nonfeaturedChannels);
    }

}
