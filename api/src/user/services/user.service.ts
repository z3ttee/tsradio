import { Injectable, Logger } from "@nestjs/common";
import { User } from "../entities/user.entity";
import { KeycloakTokenPayload } from "src/authentication/entities/oidc-token.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class UserService {
    private readonly logger: Logger = new Logger(UserService.name);

    constructor(@InjectRepository(User) public readonly repository: Repository<User>) {}

    public async findById(id: string): Promise<User> {
        return this.repository.findOneOrFail({
            where: {
                id: id
            }
        });
    }

    public async findOrCreateByTokenPayload(token: KeycloakTokenPayload): Promise<User> {
        if(!token) return null;

        // Find in database and return if found
        const existingUser = await this.findById(token.sub);
        if(existingUser) {
            if(this.hasUpdated(token, existingUser)) {
                // Update username (currently the only thing that can change which is important)
                existingUser.name = token.preferred_username?.trim();
                return this.repository.save(existingUser).catch((error) => {
                    this.logger.error(`Could not update user object, using old account data: ${error.message}`, error.stack);
                    return existingUser;
                })
            }
            
            return existingUser
        }

        // Build new database entry
        const user = new User();
        user.id = token.sub;
        user.name = token.name ?? token.preferred_username?.trim();

        return this.createIfNotExists(user);
    }

    public async createIfNotExists(user: User): Promise<User> {
        return this.repository.createQueryBuilder("user")
            .insert()
            .values(user)
            .orUpdate(["name"], ["id"], { skipUpdateIfNoValuesChanged: true })
            .returning(["id"])
            .execute().then((insertResult) => {
                const id = insertResult.raw[0]?.["id"];
                return this.findById(id);
            });
    }

    private hasUpdated(token: KeycloakTokenPayload, existingUser: User): boolean {
        if(token.sub != existingUser.id) return false;
        return token.preferred_username !== existingUser.name;
    }

}