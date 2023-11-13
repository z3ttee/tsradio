import { Injectable } from "@angular/core";
import { TSRAuthenticatedGateway } from "./gateway";
import { Subject } from "rxjs";
import { Channel } from "../channel";
import { GATEWAY_EVENT_CHANNEL_CREATED, GATEWAY_EVENT_CHANNEL_DELETED, GATEWAY_EVENT_CHANNEL_LISTENERS_CHANGED, GATEWAY_EVENT_CHANNEL_STATUS_CHANGED, GATEWAY_EVENT_CHANNEL_TRACK_CHANGED, GATEWAY_EVENT_CHANNEL_UPDATED } from "../constants";
import { SSOService } from "../../modules/sso/services/sso.service";
import { environment } from "../../../environments/environment";
import { StreamStatus } from "../stream";
import { Track } from "../track";

export interface OnChannelTrackChangedEvent {
  readonly channelId: string;
  readonly track: Track;
}

export interface OnChannelStatusChangedEvent {
  readonly channelId: string;
  readonly status: StreamStatus;
}

export interface OnChannelListenersChangedEvent {
  readonly channelId: string;
  readonly listeners: number;
}

@Injectable({
  providedIn: "root"
})
export class SDKStreamCoordinatorGateway extends TSRAuthenticatedGateway {

  private readonly _onChannelUpdatedSubj: Subject<Channel> = new Subject();
  private readonly _onChannelDeletedSubj: Subject<string> = new Subject();
  private readonly _onChannelCreatedSubj: Subject<Channel> = new Subject();
  private readonly _onChannelTrackChangedSubj: Subject<OnChannelTrackChangedEvent> = new Subject();
  private readonly _onChannelStatusChangedSubj: Subject<OnChannelStatusChangedEvent> = new Subject();
  private readonly _onChannelListenersChangedSubj: Subject<OnChannelListenersChangedEvent> = new Subject();

  public readonly $onChannelUpdated = this._onChannelUpdatedSubj.asObservable();
  public readonly $onChannelDeleted = this._onChannelDeletedSubj.asObservable();
  public readonly $onChannelCreated = this._onChannelCreatedSubj.asObservable();
  public readonly $onChannelTrackChanged = this._onChannelTrackChangedSubj.asObservable();
  public readonly $onChannelStatusChanged = this._onChannelStatusChangedSubj.asObservable();
  public readonly $onChannelListenersChanged = this._onChannelListenersChangedSubj.asObservable();

  constructor(
    ssoService: SSOService,
  ) {
    super(new URL(`${environment.api_base_uri}/coordinator`), ssoService);
  }

  protected registerEvents(): void {
    this.socket.on(GATEWAY_EVENT_CHANNEL_UPDATED, (channel: Channel) => this.handleChannelUpdated(channel));
    this.socket.on(GATEWAY_EVENT_CHANNEL_DELETED, (channelId: string) => this.handleChannelDeleted(channelId));
    this.socket.on(GATEWAY_EVENT_CHANNEL_CREATED, (channel: Channel) => this.handleChannelCreated(channel));
    this.socket.on(GATEWAY_EVENT_CHANNEL_TRACK_CHANGED, (channelId: string, track: Track) => this.handleChannelTrackChanged(channelId, track));
    this.socket.on(GATEWAY_EVENT_CHANNEL_STATUS_CHANGED, (channelId: string, status: StreamStatus) => this.handleChannelStatusChanged(channelId, status));
    this.socket.on(GATEWAY_EVENT_CHANNEL_LISTENERS_CHANGED, (channelId: string, listeners: number) => this.handleChannelListenersChanged(channelId, listeners));
  }

  private handleChannelUpdated(channel: Channel) {
    console.log(`[Websocket] Received channel update event`);
    this._onChannelUpdatedSubj.next(channel);
  }

  private handleChannelDeleted(channelId: string) {
    console.log(`[Websocket] Received channel delete event`);
    this._onChannelDeletedSubj.next(channelId);
  }

  private handleChannelCreated(channel: Channel) {
    console.log(`[Websocket] Received channel create event`);
    this._onChannelUpdatedSubj.next(channel);
  }

  private handleChannelStatusChanged(channelId: string, status: StreamStatus) {
    console.log(`[Websocket] Received channel status changed event`);
    this._onChannelStatusChangedSubj.next({ channelId, status });
  }

  private handleChannelTrackChanged(channelId: string, track: Track) {
    console.log(`[Websocket] Received channel track changed event`);
    this._onChannelTrackChangedSubj.next({ channelId, track });
  }

  private handleChannelListenersChanged(channelId: string, listeners: number) {
    console.log(`[Websocket] Received channel listeners changed event`);
    this._onChannelListenersChangedSubj.next({ channelId, listeners });
  }

}