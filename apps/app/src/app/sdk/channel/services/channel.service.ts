import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { Channel } from "../entities/channel.entity";
import { CreateChannelDTO } from "../../../modules/admin/channels/dtos/create-channel.dto";
import { environment } from "../../../../environments/environment";
import { Future, toFuture } from "../../../utils/future";
import { Artwork } from "../../../modules/artwork/entities/artwork.entity";
import { ChannelOverview } from "../entities/channel-overview.entity";
import { Page, Pageable, isNull } from "@tsa/utilities";

@Injectable()
export class SDKChannelService {

    constructor(
        private readonly httpClient: HttpClient
    ) {}

    public findOverview(): Observable<Future<ChannelOverview>> {
        return this.httpClient.get<ChannelOverview>(`${environment.api_base_uri}/v1/channels/overview`).pipe(toFuture());    
    }

    public findAll(pageable: Pageable): Observable<Future<Page<Channel>>> {
        return this.httpClient.get<Page<Channel>>(`${environment.api_base_uri}/v1/channels${pageable.toQuery()}`).pipe(toFuture());
    }

    public findById(id: string): Observable<Future<Channel>> {
        if(isNull(id)) return of(Future.notfound());
        return this.httpClient.get<Channel>(`${environment.api_base_uri}/v1/channels/${id}`).pipe(toFuture());
    }

    public createIfNotExists(dto: CreateChannelDTO): Observable<Future<Channel>> {
        if(isNull(dto)) return of(Future.notfound());
        return this.httpClient.post<Channel>(`${environment.api_base_uri}/v1/channels`, dto).pipe(toFuture());
    }

    public deleteById(id: string): Observable<Future<boolean>> {
        if(isNull(id)) return of(Future.notfound());
        return this.httpClient.delete<boolean>(`${environment.api_base_uri}/v1/channels/${id}`).pipe(toFuture());
    }

    public updateById(id: string, dto: CreateChannelDTO): Observable<Future<Channel>> {
        if(isNull(id)) return of(Future.notfound());
        return this.httpClient.put<Channel>(`${environment.api_base_uri}/v1/channels/${id}`, dto).pipe(toFuture());
    }

    public setArtwork(id: string, data: FormData): Observable<Future<Artwork>> {
        if(isNull(id)) return of(Future.notfound());
        return this.httpClient.post<Artwork>(`${environment.api_base_uri}/v1/artworks/channel/${id}`, data).pipe(toFuture());
    }

    public restart(id: string): Observable<Future<boolean>> {
        if(isNull(id)) return of(Future.notfound());
        return this.httpClient.get<boolean>(`${environment.api_base_uri}/v1/channels/${id}/restart`).pipe(toFuture());
    }
}