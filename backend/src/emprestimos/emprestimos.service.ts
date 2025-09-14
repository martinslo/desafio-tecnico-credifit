import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SolicitarEmprestimoDto } from './dto/solicitar-emprestimo.dto';
import { EmprestimoResponseDto, ParcelaResponseDto } from './dto/emprestimo-response.dto';
import { MargemDisponivelDto } from './dto/margem-disponivel.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EmprestimosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async obterMargemDisponivel(funcionarioId: number): Promise<MargemDisponivelDto> {
    const funcionario = await this.prisma.funcionario.findUnique({
      where: { id: funcionarioId },
    });

    if (!funcionario) {
      throw new BadRequestException('Funcionário não encontrado');
    }

    const margemMaxima = funcionario.salario * 0.35; // 35% do salário
    const parcelasDisponiveis = [1, 2, 3, 4];

    return {
      salario: funcionario.salario,
      margemMaxima,
      valorMaximoEmprestimo: margemMaxima,
      parcelasDisponiveis,
    };
  }

  async obterScoreCredito(): Promise<number> {
    try {
      const response = await firstValueFrom(
        this.httpService.get('https://mocki.io/v1/f7b3627c-444a-4d65-b76b-d94a6c63bdcf')
      );
      return response.data.score;
    } catch (error) {
      // Fallback para o mock local caso a API esteja indisponível
      return 650;
    }
  }

  private obterScoreMinimoPorSalario(salario: number): number {
    if (salario <= 2000) return 400;
    if (salario <= 4000) return 500;
    if (salario <= 8000) return 600;
    if (salario <= 12000) return 700;
    return 800; // Para salários acima de R$ 12.000
  }

  async processarPagamento(): Promise<{ status: string }> {
    try {
      const response = await firstValueFrom(
        this.httpService.get('https://mocki.io/v1/386c594b-d42f-4d14-8036-508a0cf1264c')
      );
      return response.data;
    } catch (error) {
      // Fallback para o mock local caso a API esteja indisponível
      return { status: 'aprovado' };
    }
  }

  private calcularVencimentos(dataSolicitacao: Date, numeroParcelas: number): Date[] {
    const vencimentos: Date[] = [];
    const dataBase = new Date(dataSolicitacao);
    
    for (let i = 1; i <= numeroParcelas; i++) {
      const vencimento = new Date(dataBase);
      vencimento.setMonth(vencimento.getMonth() + i);
      vencimentos.push(vencimento);
    }
    
    return vencimentos;
  }

  async solicitarEmprestimo(
    funcionarioId: number,
    dto: SolicitarEmprestimoDto,
  ): Promise<EmprestimoResponseDto> {
    // Verificar se o funcionário existe
    const funcionario = await this.prisma.funcionario.findUnique({
      where: { id: funcionarioId },
      include: { empresa: true },
    });

    if (!funcionario) {
      throw new BadRequestException('Funcionário não encontrado');
    }

    // Verificar se a empresa está conveniada
    if (!funcionario.empresa) {
      throw new ForbiddenException('Apenas funcionários de empresas conveniadas podem solicitar empréstimos');
    }

    // Verificar margem disponível
    const margemDisponivel = await this.obterMargemDisponivel(funcionarioId);
    if (dto.valor > margemDisponivel.valorMaximoEmprestimo) {
      throw new BadRequestException(
        `Valor solicitado excede a margem disponível de R$ ${margemDisponivel.valorMaximoEmprestimo.toFixed(2)}`
      );
    }

    // Obter score de crédito
    const scoreCredito = await this.obterScoreCredito();
    const scoreMinimo = this.obterScoreMinimoPorSalario(funcionario.salario);

    let status = 'rejeitado';
    let parcelasGeradas: any[] = [];

    // Verificar aprovação automática
    if (scoreCredito >= scoreMinimo) {
      // Processar pagamento
      const resultadoPagamento = await this.processarPagamento();
      
      if (resultadoPagamento.status === 'aprovado') {
        status = 'aprovado';
        
        // Criar empréstimo
        const emprestimo = await this.prisma.emprestimo.create({
          data: {
            funcionarioId,
            valor: dto.valor,
            parcelas: dto.parcelas,
            status,
            scoreUsado: scoreCredito,
          },
        });

        // Gerar parcelas
        const valorParcela = dto.valor / dto.parcelas;
        const vencimentos = this.calcularVencimentos(new Date(), dto.parcelas);

        for (let i = 0; i < dto.parcelas; i++) {
          const parcela = await this.prisma.parcela.create({
            data: {
              numero: i + 1,
              valor: valorParcela,
              vencimento: vencimentos[i],
              emprestimoId: emprestimo.id,
            },
          });
          parcelasGeradas.push(parcela);
        }

        return {
          id: emprestimo.id,
          valor: emprestimo.valor,
          parcelas: emprestimo.parcelas,
          status: emprestimo.status,
          scoreUsado: emprestimo.scoreUsado,
          createdAt: emprestimo.createdAt,
          parcelasGeradas: parcelasGeradas.map(p => ({
            id: p.id,
            numero: p.numero,
            valor: p.valor,
            vencimento: p.vencimento,
          })),
        };
      }
    }

    // Empréstimo rejeitado - ainda criar registro para histórico
    const emprestimo = await this.prisma.emprestimo.create({
      data: {
        funcionarioId,
        valor: dto.valor,
        parcelas: dto.parcelas,
        status,
        scoreUsado: scoreCredito,
      },
    });

    return {
      id: emprestimo.id,
      valor: emprestimo.valor,
      parcelas: emprestimo.parcelas,
      status: emprestimo.status,
      scoreUsado: emprestimo.scoreUsado,
      createdAt: emprestimo.createdAt,
      parcelasGeradas: [],
    };
  }

  async listarEmprestimos(funcionarioId: number): Promise<EmprestimoResponseDto[]> {
    const emprestimos = await this.prisma.emprestimo.findMany({
      where: { funcionarioId },
      include: { parcelasGeradas: true },
      orderBy: { createdAt: 'desc' },
    });

    return emprestimos.map(emprestimo => ({
      id: emprestimo.id,
      valor: emprestimo.valor,
      parcelas: emprestimo.parcelas,
      status: emprestimo.status,
      scoreUsado: emprestimo.scoreUsado,
      createdAt: emprestimo.createdAt,
      parcelasGeradas: emprestimo.parcelasGeradas.map(p => ({
        id: p.id,
        numero: p.numero,
        valor: p.valor,
        vencimento: p.vencimento,
      })),
    }));
  }

  async listarEmprestimosPorEmpresa(empresaId: number): Promise<EmprestimoResponseDto[]> {
    const emprestimos = await this.prisma.emprestimo.findMany({
      where: {
        funcionario: {
          empresaId,
        },
      },
      include: { 
        funcionario: true,
        parcelasGeradas: true 
      },
      orderBy: { createdAt: 'desc' },
    });

    return emprestimos.map(emprestimo => ({
      id: emprestimo.id,
      valor: emprestimo.valor,
      parcelas: emprestimo.parcelas,
      status: emprestimo.status,
      scoreUsado: emprestimo.scoreUsado,
      createdAt: emprestimo.createdAt,
      parcelasGeradas: emprestimo.parcelasGeradas.map(p => ({
        id: p.id,
        numero: p.numero,
        valor: p.valor,
        vencimento: p.vencimento,
      })),
    }));
  }
}
