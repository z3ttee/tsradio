import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { Future, toFuture } from "src/app/utils/future";
import { environment } from "src/environments/environment";
import { Page, Pageable, isNull } from "@soundcore/common";
import { Channel } from "../entities/channel.entity";
import { CreateChannelDTO } from "../dtos/create-channel.dto";

@Injectable({
    providedIn: "root"
})
export class ChannelService {

    constructor(
        private readonly httpClient: HttpClient
    ) {}

    public findById(id: string): Observable<Future<Channel>> {
        if(isNull(id)) return of(Future.notfound());
        return this.httpClient.get<Channel>(`${environment.api_base_uri}/v1/channels/${id}`).pipe(toFuture());
    }

    public findAll(id: string, pageable: Pageable): Observable<Future<Page<Channel>>> {
        if(isNull(id)) return of(Future.notfound());
        return this.httpClient.get<Page<Channel>>(`${environment.api_base_uri}/v1/channels${pageable.toQuery()}`).pipe(toFuture());
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
}