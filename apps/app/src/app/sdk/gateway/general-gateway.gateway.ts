import { Injectable } from "@angular/core";
import { TSRAuthenticatedGateway } from "./gateway";
import { Subject } from "rxjs";
import { Channel } from "../channel";
import { GATEWAY_EVENT_CHANNEL_CREATED, GATEWAY_EVENT_CHANNEL_DELETED, GATEWAY_EVENT_CHANNEL_STATUS_CHANGED, GATEWAY_EVENT_CHANNEL_UPDATED } from "../constants";
import { SSOService } from "../../modules/sso/services/sso.service";
import { environment } from "../../../environments/environment";
import { StreamStatus } from "../stream";

@Injectable({
  providedIn: "root"
})
export class SDKStreamCoordinatorGateway extends TSRAuthenticatedGateway {

  private readonly _onChannelUpdatedSubj: Subject<Channel> = new Subject();
  private readonly _onChannelDeletedSubj: Subject<string> = new Subject();
  private readonly _onChannelCreatedSubj: Subject<Channel> = new Subject();

  public readonly $onChannelUpdated = this._onChannelUpdatedSubj.asObservable();
  public readonly $onChannelDeleted = this._onChannelDeletedSubj.asObservable();
  public readonly $onChannelCreated = this._onChannelCreatedSubj.asObservable();

  constructor(
    ssoService: SSOService,
  ) {
    super(new URL(`${environment.api_base_uri}/coordinator`), ssoService);
  }

  protected registerEvents(): void {
    this.socket.on(GATEWAY_EVENT_CHANNEL_UPDATED, (channel: Channel) => this.handleChannelUpdated(channel));
    this.socket.on(GATEWAY_EVENT_CHANNEL_DELETED, (channelId: string) => this.handleChannelDeleted(channelId));
    this.socket.on(GATEWAY_EVENT_CHANNEL_CREATED, (channel: Channel) => this.handleChannelCreated(channel));
    this.socket.on(GATEWAY_EVENT_CHANNEL_STATUS_CHANGED, (channelId: string, status: StreamStatus) => this.handleChannelStatusChanged(channelId, status));
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
    console.log(`[Websocket] Received channel create event`, channelId, status);
    // this._onChannelUpdatedSubj.next(channel);
  }

}