import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto } from '../dtos';
import { ErrorCodes } from '../../errorCodes';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly _usersRepository: Repository<User>,
  ) {}

  public async findAll(): Promise<User[]> {
    return this._usersRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  public async findById(id: string): Promise<User> {
    const user = await this._usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(ErrorCodes.USER_NOT_FOUND);
    }
    return user;
  }

  public async findByUsername(username: string): Promise<User | null> {
    return this._usersRepository.findOne({ where: { username } });
  }

  public async findByEmail(email: string): Promise<User | null> {
    return this._usersRepository.findOne({ where: { email } });
  }

  public async create(createUserDto: CreateUserDto): Promise<User> {
    // Check for existing username
    const existingByUsername = await this.findByUsername(
      createUserDto.username,
    );
    if (existingByUsername) {
      throw new ConflictException(ErrorCodes.USERNAME_ALREADY_EXISTS);
    }

    // Check for existing email
    const existingByEmail = await this.findByEmail(createUserDto.email);
    if (existingByEmail) {
      throw new ConflictException(ErrorCodes.EMAIL_ALREADY_EXISTS);
    }

    const user = this._usersRepository.create(createUserDto);
    return this._usersRepository.save(user);
  }

  public async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    // Check for username conflict if updating username
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingByUsername = await this.findByUsername(
        updateUserDto.username,
      );
      if (existingByUsername) {
        throw new ConflictException(ErrorCodes.USERNAME_ALREADY_EXISTS);
      }
    }

    // Check for email conflict if updating email
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingByEmail = await this.findByEmail(updateUserDto.email);
      if (existingByEmail) {
        throw new ConflictException(ErrorCodes.EMAIL_ALREADY_EXISTS);
      }
    }

    Object.assign(user, updateUserDto);
    return this._usersRepository.save(user);
  }

  public async delete(id: string): Promise<void> {
    const user = await this.findById(id);
    await this._usersRepository.remove(user);
  }
}
