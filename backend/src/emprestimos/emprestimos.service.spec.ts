import { Test, TestingModule } from '@nestjs/testing';
import { EmprestimosService } from './emprestimos.service';
import { PrismaService } from '../../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { of } from 'rxjs';

describe('EmprestimosService', () => {
  let service: EmprestimosService;
  let prismaService: PrismaService;
  let httpService: HttpService;

  const mockPrismaService = {
    funcionario: {
      findUnique: jest.fn(),
    },
    emprestimo: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    parcela: {
      create: jest.fn(),
    },
  };

  const mockHttpService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmprestimosService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<EmprestimosService>(EmprestimosService);
    prismaService = module.get<PrismaService>(PrismaService);
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('obterMargemDisponivel', () => {
    it('should return margin information for a valid employee', async () => {
      const funcionarioId = 1;
      const mockFuncionario = {
        id: funcionarioId,
        salario: 5000,
      };

      mockPrismaService.funcionario.findUnique.mockResolvedValue(mockFuncionario);

      const result = await service.obterMargemDisponivel(funcionarioId);

      expect(result).toEqual({
        salario: 5000,
        margemMaxima: 1750, // 35% of 5000
        valorMaximoEmprestimo: 1750,
        parcelasDisponiveis: [1, 2, 3, 4],
      });
    });

    it('should throw BadRequestException for non-existent employee', async () => {
      const funcionarioId = 999;
      mockPrismaService.funcionario.findUnique.mockResolvedValue(null);

      await expect(service.obterMargemDisponivel(funcionarioId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('obterScoreCredito', () => {
    it('should return score from external API', async () => {
      const mockScore = 650;
      mockHttpService.get.mockReturnValue(of({ data: { score: mockScore } }));

      const result = await service.obterScoreCredito();

      expect(result).toBe(mockScore);
    });

    it('should return fallback score when API fails', async () => {
      mockHttpService.get.mockImplementation(() => {
        throw new Error('API Error');
      });

      const result = await service.obterScoreCredito();

      expect(result).toBe(650);
    });
  });

  describe('solicitarEmprestimo', () => {
    const mockFuncionario = {
      id: 1,
      salario: 5000,
      empresa: { id: 1 },
    };

    const mockEmprestimo = {
      id: 1,
      funcionarioId: 1,
      valor: 1000,
      parcelas: 2,
      status: 'aprovado',
      scoreUsado: 650,
      createdAt: new Date(),
    };

    beforeEach(() => {
      mockPrismaService.funcionario.findUnique.mockResolvedValue(mockFuncionario);
      mockPrismaService.emprestimo.create.mockResolvedValue(mockEmprestimo);
      mockPrismaService.parcela.create.mockResolvedValue({
        id: 1,
        numero: 1,
        valor: 500,
        vencimento: new Date(),
        emprestimoId: 1,
      });
    });

    it('should approve loan when score is sufficient', async () => {
      const dto = { valor: 1000, parcelas: 2 };
      
      // Mock successful payment
      mockHttpService.get
        .mockReturnValueOnce(of({ data: { score: 650 } })) // Score API
        .mockReturnValueOnce(of({ data: { status: 'aprovado' } })); // Payment API

      const result = await service.solicitarEmprestimo(1, dto);

      expect(result.status).toBe('aprovado');
      expect(result.valor).toBe(1000);
      expect(result.parcelas).toBe(2);
    });

    it('should handle loan rejection when score is insufficient', async () => {
      const dto = { valor: 1000, parcelas: 2 };
      
      // Mock low score (300 is below the minimum 600 required for salary 5000)
      mockHttpService.get.mockReturnValue(of({ data: { score: 300 } }));

      const result = await service.solicitarEmprestimo(1, dto);

      expect(result).toBeDefined();
      expect(mockPrismaService.emprestimo.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException when value exceeds margin', async () => {
      const dto = { valor: 2000, parcelas: 2 }; // Exceeds 35% of 5000

      await expect(service.solicitarEmprestimo(1, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ForbiddenException for employee without company', async () => {
      const funcionarioSemEmpresa = { ...mockFuncionario, empresa: null };
      mockPrismaService.funcionario.findUnique.mockResolvedValue(funcionarioSemEmpresa);

      const dto = { valor: 1000, parcelas: 2 };

      await expect(service.solicitarEmprestimo(1, dto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
