import { ForbiddenException, Injectable, Logger } from "@nestjs/common";
import { User } from "../entities/user.entity";
import { KeycloakTokenPayload } from "src/authentication/entities/oidc-token.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Page, isNull } from "@soundcore/common";
import { Channel } from "src/channel/entities/channel.entity";
import { AddToHistoryDTO } from "../dtos/add-to-history.dto";

@Injectable()
export class UserService {
    private readonly logger: Logger = new Logger(UserService.name);

    constructor(@InjectRepository(User) public readonly repository: Repository<User>) {}

    public async findById(id: string): Promise<User> {
        return this.repository.findOne({
            where: {
                id: id
            }
        });
    }

    public async findChannelHistoryIds(userId: string): Promise<string[]> {
        return this.repository.findOne({
            where: {
                id: userId
            },
            relations: {
                history: true
            }
        }).then((result) => {
            const channels = result.history ?? [];
            return channels.map((c) => c.id);
        });
    }

    public async findChannelHistoryByCurrentUser(userId: string): Promise<Page<Channel>> {
        return this.repository.findOne({
            where: {
                id: userId
            },
            relations: {
                history: true
            }
        }).then((result) => {
            const channels = result.history ?? [];
            return Page.of(channels, Math.min(3, channels.length));
        });
    }

    public async addChannelToHistory(userId: string, channelId: string): Promise<boolean> {
        const user = await this.findById(userId);
        if(isNull(user)) throw new ForbiddenException("Invalid user");

        const history = (await this.findChannelHistoryByCurrentUser(userId))?.items ?? [];

        // Check if channel already exists in history of user
        if(history.findIndex((c) => c.id === channelId) != -1) {
            return false;
        }

        // Remove random entry from history if 
        // already 3 channels registered
        if(history.length >= 3) {
            const rnd = Math.random() * history.length;
            history.splice(rnd, 1);
        }

        // Add channel
        history.push({ id: channelId } as Channel);
        // Update history
        user.history = history;
        // Save to 
        return this.repository.save(user).then(() => true);
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