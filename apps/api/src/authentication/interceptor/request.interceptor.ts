import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { KeycloakTokenPayload } from "../entities/oidc-token.entity";
import { OIDC_REQUEST_MAPPING } from "../oidc.constants";
import { UserService } from "../../user/services/user.service";

@Injectable()
export class RequestInterceptor implements NestInterceptor {

    constructor(private readonly service: UserService) {}
    
    public async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
        const request = context.switchToHttp()?.getRequest();
        const authentication: KeycloakTokenPayload = request[OIDC_REQUEST_MAPPING];

        if(authentication) {
            request[OIDC_REQUEST_MAPPING] = await this.service.findOrCreateByTokenPayload(authentication)
        }

        return next.handle()
    }

}