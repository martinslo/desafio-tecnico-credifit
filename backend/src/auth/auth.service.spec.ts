import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    funcionario: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    empresa: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should validate funcionario successfully', async () => {
      const mockFuncionario = {
        id: 1,
        email: 'funcionario@test.com',
        senha: 'hashedPassword',
        nome: 'João',
        cpf: '12345678901',
        salario: 5000,
        empresaId: 1,
      };

      mockPrismaService.funcionario.findUnique.mockResolvedValue(mockFuncionario);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('funcionario@test.com', 'password');

      expect(result).toEqual(mockFuncionario);
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
    });

    it('should validate empresa successfully', async () => {
      const mockEmpresa = {
        id: 1,
        email: 'empresa@test.com',
        senha: 'hashedPassword',
        cnpj: '12345678000199',
        razaoSocial: 'Empresa Teste',
        nomeRepresentante: 'João Silva',
        cpfRepresentante: '12345678901',
      };

      mockPrismaService.funcionario.findUnique.mockResolvedValue(null);
      mockPrismaService.empresa.findUnique.mockResolvedValue(mockEmpresa);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('empresa@test.com', 'password');

      expect(result).toEqual(mockEmpresa);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockPrismaService.funcionario.findUnique.mockResolvedValue(null);
      mockPrismaService.empresa.findUnique.mockResolvedValue(null);

      await expect(service.validateUser('nonexistent@test.com', 'password')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const mockFuncionario = {
        id: 1,
        email: 'funcionario@test.com',
        senha: 'hashedPassword',
        nome: 'João',
        cpf: '12345678901',
        salario: 5000,
        empresaId: 1,
      };

      mockPrismaService.funcionario.findUnique.mockResolvedValue(mockFuncionario);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.validateUser('funcionario@test.com', 'wrongpassword')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('login', () => {
    it('should generate JWT token', () => {
      const mockUsuario = {
        id: 1,
        email: 'usuario@test.com',
      } as any;

      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = service.login(mockUsuario);

      expect(result).toEqual({ access_token: 'jwt-token' });
      expect(jwtService.sign).toHaveBeenCalled();
    });
  });

  describe('registerFuncionario', () => {
    it('should register funcionario successfully', async () => {
      const registerData = {
        nome: 'João',
        email: 'joao@test.com',
        senha: 'password',
        cpf: '12345678901',
        salario: 5000,
        empresaId: 1,
      };

      const mockCreatedFuncionario = {
        id: 1,
        ...registerData,
        senha: 'hashedPassword',
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockPrismaService.funcionario.create.mockResolvedValue(mockCreatedFuncionario);

      const result = await service.registerFuncionario(registerData);

      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(mockPrismaService.funcionario.create).toHaveBeenCalledWith({
        data: { ...registerData, senha: 'hashedPassword' },
      });
      expect(result.senha).toBeUndefined(); // Password should be excluded from response
    });
  });

  describe('registerEmpresa', () => {
    it('should register empresa successfully', async () => {
      const registerData = {
        cnpj: '12345678000199',
        razaoSocial: 'Empresa Teste',
        nomeRepresentante: 'João Silva',
        cpfRepresentante: '12345678901',
        email: 'empresa@test.com',
        senha: 'password',
      };

      const mockCreatedEmpresa = {
        id: 1,
        ...registerData,
        senha: 'hashedPassword',
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockPrismaService.empresa.create.mockResolvedValue(mockCreatedEmpresa);

      const result = await service.registerEmpresa(registerData);

      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(mockPrismaService.empresa.create).toHaveBeenCalledWith({
        data: { ...registerData, senha: 'hashedPassword' },
      });
      expect(result.senha).toBeUndefined(); // Password should be excluded from response
    });
  });
});
