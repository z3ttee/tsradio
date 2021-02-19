import axios from "axios"
import config from "../config/config"
import { TrustedError } from "../error/trustedError"
import { Member } from "./member"

export class Alliance {

    private static instance: Alliance = undefined

    /**
     * Try to load member data from TSAlliance using auth token
     * @param token JWT token
     * @returns Member or TrustedError
     */
    public async authenticateMemberByToken(token: string): Promise<Member | TrustedError> {
        return new Promise<Member | TrustedError>(async(resolve) => {
            axios.get(config.tsalliance.baseUrl + "/members/@me", {
                headers: {
                    'Authorization': 'Bearer '+token
                }
            }).then((response) => {
                if(response.status != 200) {
                    resolve(this.transformError(response))
                } else {
                    let data = response.data.data

                    resolve(new Member(
                        data.uuid,
                        data.name,
                        data.email,
                        new Member.Role(data.role.uuid, data.role.name, data.role.permissions, data.role.hierarchy),
                        data.avatar    
                    ))
                }
            }).catch((error) => {
                resolve(this.transformError(error))
            })
        })
    }

    /**
     * Load a members profile
     * @param memberId Member's uuid
     * 
     * @returns Member.Profile or null
     */
    public async getMemberProfile(memberId: string): Promise<Member.Profile> {
        return new Promise<Member.Profile>(async(resolve) => {
            axios.get(config.tsalliance.baseUrl + "/profiles/"+memberId).then((response) => {
                if(response.status != 200) {
                    resolve(null)
                } else {
                    let data = response.data.data
                    resolve(new Member.Profile(data?.uuid, data?.name, data?.avatar))
                }
            }).catch(() => {
                resolve(null)
            })
        })
    }

    private transformError(error): TrustedError {
        if(error.data || error.response) {
            // Is response object
            let response = (error.data ? error.data.data : error.response.data)
            return TrustedError.create(response?.statusCode, response?.message, response?.errorId)
        } else {
            // No response at all
            return TrustedError.get(TrustedError.Errors.INTERNAL_ERROR)
        }
    }

    public static getInstance() {
        if(!this.instance) this.instance = new Alliance()
        return this.instance
    }
}