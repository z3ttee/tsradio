import config from '../config/config'
import { TrustedError } from '../error/trustedError';
import { Router } from '../router';
import { Role } from './role';

export class Member {
    public accountType: Member.AccountType = Member.AccountType.ACCOUNT_MEMBER;

    public readonly uuid: string
    public readonly name: string
    public readonly email: string
    public readonly role: Role
    public readonly avatar: string

    constructor() {

    }

    /**
     * Check if account is from type member
     * Returns always true for member classes
     */
    isMember() {
        return this.accountType == Member.AccountType.ACCOUNT_MEMBER
    }

    /**
     * Check if account has a specific permission
     * @param permission Permission string
     * @returns {Boolean} True or False
     */
    hasPermission(permission: String, route?: Router.Route): Boolean {
        if(!permission) return true
        if(this.role?.uuid === "*") return true
        if(route) {
            return route.isOwnResource || this.role?.permissions.includes(permission)
        } else {
            return this.role?.permissions.includes(permission)
        }
    }

    /**
     * Sign in a member account using jsonwebtoken.
     * @param token jsonwebtoken
     * @returns {Member} Member account object or TrustedError
     */
    static async signInWithToken(token: String): Promise<Member | TrustedError> {
        return null
    }

}

export namespace Member {
    export const enum AccountType {
        ACCOUNT_SYSTEM = 1,
        ACCOUNT_MEMBER
    }

    /**
     * Extract session token from request and authenticate requester
     * @param request Express request
     * @returns {Account} Account data or TrustedError
     */
    export async function authenticateRequest(request): Promise<Member | TrustedError> {
        let authorizationHeader = request.headers["authorization"]

        if(authorizationHeader?.startsWith("Bearer")) {
            let token = authorizationHeader.slice(7)
            return Member.signInWithToken(token)
        } else {
            return TrustedError.get(TrustedError.Errors.UNKNOWN_AUTH_METHOD)
        }
    }

    export async function findMember(targetUUID: string): Promise<TrustedError | Member> {
        return null
    }
}