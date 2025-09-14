import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { emprestimoService } from '../services/api';
import type { MargemDisponivel, Emprestimo } from '../types';
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  LogOut, 
  Plus,
  CheckCircle,
  XCircle
} from 'lucide-react';
import SolicitarEmprestimoModal from './SolicitarEmprestimoModal';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [margem, setMargem] = useState<MargemDisponivel | null>(null);
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [margemData, emprestimosData] = await Promise.all([
        emprestimoService.obterMargemDisponivel(),
        emprestimoService.listarMeusEmprestimos(),
      ]);
      setMargem(margemData);
      setEmprestimos(emprestimosData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmprestimoSolicitado = () => {
    setShowModal(false);
    loadData(); // Recarregar dados após solicitação
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-primary-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Credifit</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Olá, {user?.email}
              </span>
              <button
                onClick={logout}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Salário</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {margem ? formatCurrency(margem.salario) : '--'}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-success-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Margem Disponível</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {margem ? formatCurrency(margem.margemMaxima) : '--'}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Empréstimos</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {emprestimos.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="mb-8">
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Solicitar Empréstimo
          </button>
        </div>

        {/* Lista de Empréstimos */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Meus Empréstimos
          </h2>
          
          {emprestimos.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum empréstimo encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {emprestimos.map((emprestimo) => (
                <div
                  key={emprestimo.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {emprestimo.status === 'aprovado' ? (
                        <CheckCircle className="h-5 w-5 text-success-600 mr-3" />
                      ) : (
                        <XCircle className="h-5 w-5 text-danger-600 mr-3" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {formatCurrency(emprestimo.valor)} - {emprestimo.parcelas}x
                        </p>
                        <p className="text-sm text-gray-600">
                          Solicitado em {formatDate(emprestimo.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          emprestimo.status === 'aprovado'
                            ? 'bg-success-100 text-success-800'
                            : 'bg-danger-100 text-danger-800'
                        }`}
                      >
                        {emprestimo.status === 'aprovado' ? 'Aprovado' : 'Rejeitado'}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        Score: {emprestimo.scoreUsado}
                      </p>
                    </div>
                  </div>
                  
                  {emprestimo.status === 'aprovado' && emprestimo.parcelasGeradas.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">Parcelas:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                        {emprestimo.parcelasGeradas.map((parcela) => (
                          <div
                            key={parcela.id}
                            className="bg-gray-50 rounded-lg p-3"
                          >
                            <p className="text-sm font-medium text-gray-900">
                              {parcela.numero}ª parcela
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatCurrency(parcela.valor)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Vence: {formatDate(parcela.vencimento)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Solicitação */}
      {showModal && (
        <SolicitarEmprestimoModal
          margem={margem}
          onClose={() => setShowModal(false)}
          onSuccess={handleEmprestimoSolicitado}
        />
      )}
    </div>
  );
};

export default Dashboard;
