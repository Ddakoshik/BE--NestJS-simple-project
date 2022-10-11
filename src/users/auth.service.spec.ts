import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];
    fakeUsersService = {
      find: (email) => {
        const filteredUsers = users.filter(user => user.email === email);
        return Promise.resolve(filteredUsers)
      },
      create: (email: string, password: string) => {
        const user = {id: new Date().valueOf(), email, password} as User
        users.push(user);
        return Promise.resolve(user);
      }
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create new user with a salted and hashed password', async () => {
    const user = await service.signup('asdf@asdf.comm', 'asdf');
    expect(user.password).not.toEqual('asdf');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throw an error if user signs up with email that is use', async () => {
    await service.signup('asdf@asdf.com', 'asdf');
    await expect(service.signup('asdf@asdf.com', 'asdf')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws if signin is called with an  unused email', async () => {
    await expect(service.signin('asdf@asdf.com', 'asdf')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws if an invalid password is provided', async () => {
    await service.signup('asdf@asdf.com', 'asdf1')
    await expect(service.signin('asdf@asdf.com', 'asdf2')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('returns a user if correct password is provided', async () => {
    await service.signup('asdf@asdf.com', 'asdf');
    const user = await service.signin('asdf@asdf.com', 'asdf');
    expect(user).toBeDefined();
  });
});
