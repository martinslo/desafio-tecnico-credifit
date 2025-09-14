import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type {
  LoginRequest,
  LoginResponse,
  MargemDisponivel,
  SolicitarEmprestimoRequest,
  Emprestimo
} from '../types';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await api.post('/auth/login', credentials);
    return response.data;
  },
};

export const emprestimoService = {
  async obterMargemDisponivel(): Promise<MargemDisponivel> {
    const response: AxiosResponse<MargemDisponivel> = await api.get('/emprestimos/margem-disponivel');
    return response.data;
  },

  async solicitarEmprestimo(data: SolicitarEmprestimoRequest): Promise<Emprestimo> {
    const response: AxiosResponse<Emprestimo> = await api.post('/emprestimos/solicitar', data);
    return response.data;
  },

  async listarMeusEmprestimos(): Promise<Emprestimo[]> {
    const response: AxiosResponse<Emprestimo[]> = await api.get('/emprestimos/meus-emprestimos');
    return response.data;
  },
};

export default api;
