import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    password: 'hashed-password',
    firstName: 'John',
    lastName: 'Doe',
    role: 'CLIENT',
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);

    // Configuration des mocks par défaut
    configService.get.mockImplementation((key: string) => {
      const configs = {
        'JWT_EXPIRES_IN': '15m',
        'JWT_REFRESH_EXPIRES_IN': '7d',
        'JWT_REFRESH_SECRET': 'refresh-secret',
      };
      return configs[key];
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user data when credentials are valid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toEqual({
        id: 'user-id',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'CLIENT',
        isActive: true,
      });
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('password', 'hashed-password');
    });

    it('should return null when user does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toBeNull();
      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null when user is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      usersService.findByEmail.mockResolvedValue(inactiveUser);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toBeNull();
      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null when password is incorrect', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      const result = await service.validateUser('test@example.com', 'wrong-password');

      expect(result).toBeNull();
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('wrong-password', 'hashed-password');
    });
  });

  describe('login', () => {
    it('should return access and refresh tokens', async () => {
      const user = { ...mockUser };
      jwtService.signAsync.mockResolvedValueOnce('access-token');
      jwtService.signAsync.mockResolvedValueOnce('refresh-token');

      const result = await service.login(user);

      expect(result).toEqual({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        user: {
          id: 'user-id',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'CLIENT',
        },
      });

      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('register', () => {
    it('should register a new user and return tokens', async () => {
      const registerData = {
        email: 'new@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+1234567890',
      };

      usersService.findByEmail.mockResolvedValue(null); // User doesn't exist
      mockedBcrypt.hash.mockResolvedValue('hashed-password' as never);
      usersService.create.mockResolvedValue({ ...mockUser, ...registerData });
      jwtService.signAsync.mockResolvedValueOnce('access-token');
      jwtService.signAsync.mockResolvedValueOnce('refresh-token');

      const result = await service.register(registerData);

      expect(result).toEqual({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        user: {
          id: 'user-id',
          email: 'new@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          role: 'CLIENT',
        },
      });

      expect(mockedBcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(usersService.create).toHaveBeenCalledWith({
        ...registerData,
        password: 'hashed-password',
      });
    });

    it('should throw BadRequestException when user already exists', async () => {
      const registerData = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      usersService.findByEmail.mockResolvedValue(mockUser); // User exists

      await expect(service.register(registerData)).rejects.toThrow(BadRequestException);
      expect(usersService.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when password is too short', async () => {
      const registerData = {
        email: 'new@example.com',
        password: '123', // Too short
        firstName: 'Jane',
        lastName: 'Smith',
      };

      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.register(registerData)).rejects.toThrow(BadRequestException);
      expect(usersService.create).not.toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('should return new access token when refresh token is valid', async () => {
      const refreshToken = 'valid-refresh-token';
      const payload = {
        sub: 'user-id',
        email: 'test@example.com',
        role: 'CLIENT',
        type: 'refresh',
      };

      jwtService.verifyAsync.mockResolvedValue(payload);
      usersService.findById.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValue('new-access-token');

      const result = await service.refreshToken(refreshToken);

      expect(result).toEqual({ access_token: 'new-access-token' });
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(refreshToken, {
        secret: 'refresh-secret',
      });
      expect(usersService.findById).toHaveBeenCalledWith('user-id');
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      const refreshToken = 'invalid-refresh-token';

      jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      const refreshToken = 'valid-refresh-token';
      const payload = {
        sub: 'user-id',
        email: 'test@example.com',
        role: 'CLIENT',
        type: 'refresh',
      };

      jwtService.verifyAsync.mockResolvedValue(payload);
      usersService.findById.mockResolvedValue(null);

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when token type is not refresh', async () => {
      const refreshToken = 'valid-refresh-token';
      const payload = {
        sub: 'user-id',
        email: 'test@example.com',
        role: 'CLIENT',
        type: 'access', // Wrong type
      };

      jwtService.verifyAsync.mockResolvedValue(payload);

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      usersService.findById.mockResolvedValue(mockUser);

      await expect(service.logout('user-id')).resolves.toBeUndefined();
      expect(usersService.findById).toHaveBeenCalledWith('user-id');
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(service.logout('user-id')).rejects.toThrow(UnauthorizedException);
    });
  });
});
