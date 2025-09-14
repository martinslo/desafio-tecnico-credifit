export interface User {
  id: number;
  email: string;
  tipo: 'funcionario' | 'empresa';
}

export interface Funcionario {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  salario: number;
  empresaId: number;
}

export interface Empresa {
  id: number;
  cnpj: string;
  razaoSocial: string;
  nomeRepresentante: string;
  cpfRepresentante: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
}

export interface MargemDisponivel {
  salario: number;
  margemMaxima: number;
  valorMaximoEmprestimo: number;
  parcelasDisponiveis: number[];
}

export interface SolicitarEmprestimoRequest {
  valor: number;
  parcelas: number;
}

export interface Parcela {
  id: number;
  numero: number;
  valor: number;
  vencimento: string;
}

export interface Emprestimo {
  id: number;
  valor: number;
  parcelas: number;
  status: 'aprovado' | 'rejeitado';
  scoreUsado: number;
  createdAt: string;
  parcelasGeradas: Parcela[];
}

export interface ApiError {
  message: string;
  statusCode: number;
}
