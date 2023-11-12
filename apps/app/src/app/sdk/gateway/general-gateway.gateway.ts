import { Injectable } from "@angular/core";
import { TSRAuthenticatedGateway } from "./gateway";
import { BehaviorSubject, Observable, Subject, combineLatest, map, startWith } from "rxjs";
import { Channel } from "../channel";
import { GATEWAY_EVENT_CHANNEL_DELETED, GATEWAY_EVENT_CHANNEL_PUSH_HISTORY, GATEWAY_EVENT_CHANNEL_PUSH_LIST, GATEWAY_EVENT_CHANNEL_UPDATED } from "../constants";
import { SSOService } from "../../modules/sso/services/sso.service";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root"
})
export class TSRStreamCoordinatorGateway extends TSRAuthenticatedGateway {

  private readonly _onChannelUpdatedSubj: Subject<Channel> = new Subject();
  private readonly _onChannelDeletedSubj: Subject<string> = new Subject();
  private readonly _onChannelCreatedSubj: Subject<Channel> = new Subject();

  public readonly $onChannelUpdated = this._onChannelUpdatedSubj.asObservable();
  public readonly $onChannelDeleted = this._onChannelDeletedSubj.asObservable();
  public readonly $onChannelCreated = this._onChannelCreatedSubj.asObservable();

  private readonly _featuredChannels: Map<string, Channel> = new Map();
  private readonly _channels: Map<string, Channel> = new Map();
  private readonly _history: Map<string, string> = new Map();

  private readonly _featuredChannelsSubj: BehaviorSubject<Channel[]> = new BehaviorSubject(Array.from(this._featuredChannels.values()));
  private readonly _channelsSubj: BehaviorSubject<Channel[]> = new BehaviorSubject(Array.from(this._channels.values()));
  private readonly _historySubj: BehaviorSubject<string[]> = new BehaviorSubject(Array.from(this._history.values()));

  public readonly $featuredChannels = this._featuredChannelsSubj.asObservable();
  public readonly $channels = this._channelsSubj.asObservable();

  public readonly $allChannels = combineLatest([
    this.$featuredChannels,
    this.$channels
  ]).pipe(map(([featured, other]) => [...featured, ...other]));

  public readonly $history: Observable<Channel[]> = combineLatest([
    this.$allChannels.pipe(startWith([])),
    this._historySubj.asObservable(),
  ]).pipe(
    map(([allChannels, _]) => allChannels.filter((c) => this._history.has(c.id)))
  );

  constructor(
    ssoService: SSOService,
  ) {
    super(new URL(`${environment.api_base_uri}/coordinator`), ssoService);
  }

  protected registerEvents(): void {
    this.socket.on(GATEWAY_EVENT_CHANNEL_UPDATED, (channel: Channel) => this.handleChannelUpdated(channel));
    this.socket.on(GATEWAY_EVENT_CHANNEL_DELETED, (channelId: string) => this.handleChannelDeleted(channelId));
    this.socket.on(GATEWAY_EVENT_CHANNEL_UPDATED, (channel: Channel) => this.handleChannelCreated(channel));
    this.socket.on(GATEWAY_EVENT_CHANNEL_PUSH_LIST, (channels: Channel[]) => this.handlePushList(channels));
    this.socket.on(GATEWAY_EVENT_CHANNEL_PUSH_HISTORY, (channelIds: string[]) => this.handlePushHistory(channelIds));
  }

  private handleChannelUpdated(channel: Channel) {
    this._onChannelUpdatedSubj.next(channel);

    if(!channel.featured) {
      // Handle not featured channel
      // Check if was featured before
      if(this._featuredChannels.has(channel.id)) {
        // Remove from featured
        this._featuredChannels.delete(channel.id);
        // Update featured channels
        this.pushFeaturedChannels();
      }

      // Now set entry in channels map
      this._channels.set(channel.id, channel);
      // Trigger channels update
      this.pushChannels();
      return;
    }

    // Otherwise handle featured channel
    // Check if was not featured before
    if(this._channels.has(channel.id)) {
      // Remove from channels
      this._channels.delete(channel.id);
      // Update channels
      this.pushChannels();
    }

    // Now set entry in featured channels map
    this._featuredChannels.set(channel.id, channel);
    // Trigger channels update
    this.pushFeaturedChannels();
  }

  private handleChannelDeleted(channelId: string) {
    this._onChannelDeletedSubj.next(channelId);

    if(this._featuredChannels.has(channelId)) {
      this._featuredChannels.delete(channelId);
      this.pushFeaturedChannels();
    }

    if(this._channels.has(channelId)) {
      this._channels.delete(channelId);
      this.pushChannels();
    }
  }

  private handleChannelCreated(channel: Channel) {
    this._onChannelUpdatedSubj.next(channel);

    if(channel.featured) {
      this._featuredChannels.set(channel.id, channel);
      this.pushFeaturedChannels();
      return;
    }

    this._channels.set(channel.id, channel);
    this.pushChannels();
  }

  private handlePushList(allChannels: Channel[]) {
    console.log(`Server pushed ${allChannels.length} channels to client`);

    this._featuredChannels.clear();
    this._channels.clear();

    for(const channel of allChannels) {
      if(channel.featured) {
        this._featuredChannels.set(channel.id, channel);
      } else {
        this._channels.set(channel.id, channel);
      }
    }

    this.pushAll();
  }

  private handlePushHistory(channelIds: string[]) {
    console.log(`Server pushed ${channelIds.length} channels to history`);

    this._history.clear();

    for(const id of channelIds) {
      this._history.set(id, id);
    }

    this.pushHistory();
  }

  private pushFeaturedChannels() {
    this._featuredChannelsSubj.next(Array.from(this._featuredChannels.values()));
  }

  private pushChannels() {
    this._channelsSubj.next(Array.from(this._channels.values()));
  }

  private pushAll() {
    this._featuredChannelsSubj.next(Array.from(this._featuredChannels.values()));
    this._channelsSubj.next(Array.from(this._channels.values()));
  }

  private pushHistory() {
    this._historySubj.next(Array.from(this._history.values()));
  }

}