import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  create(email: string, password: string) {
    const user = this.repo.create({ email, password });
    return this.repo.save(user);
  }

  async findOne(id: number): Promise<User> {
    if (!id) {
      return null;
    }
    const user = await this.repo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    return user;
  }

  async find(email: string): Promise<User[]> {
    const userlist = await this.repo.find({ where: { email } });
    return userlist;
  }

  async update(id: number, attrs: Partial<User>): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, attrs);
    this.repo.save(user);
    return user;
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    return this.repo.remove(user);
  }
}
