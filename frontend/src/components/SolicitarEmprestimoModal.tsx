import React, { useState } from 'react';
import { emprestimoService } from '../services/api';
import type { MargemDisponivel, SolicitarEmprestimoRequest } from '../types';
import { X, DollarSign, Calendar, AlertCircle } from 'lucide-react';

interface SolicitarEmprestimoModalProps {
  margem: MargemDisponivel | null;
  onClose: () => void;
  onSuccess: () => void;
}

const SolicitarEmprestimoModal: React.FC<SolicitarEmprestimoModalProps> = ({
  margem,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<SolicitarEmprestimoRequest>({
    valor: 0,
    parcelas: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await emprestimoService.solicitarEmprestimo(formData);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao solicitar empréstimo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'valor' ? parseFloat(value) || 0 : parseInt(value) || 1,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const valorParcela = formData.valor && formData.parcelas ? formData.valor / formData.parcelas : 0;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Solicitar Empréstimo
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {margem && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center mb-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">
                Margem Disponível
              </span>
            </div>
            <p className="text-sm text-blue-700">
              Você pode solicitar até {formatCurrency(margem.margemMaxima)} 
              (35% do seu salário de {formatCurrency(margem.salario)})
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="valor" className="block text-sm font-medium text-gray-700 mb-1">
              Valor do Empréstimo
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                id="valor"
                name="valor"
                min="1"
                max={margem?.margemMaxima || 999999}
                step="0.01"
                required
                className="input-field pl-10"
                placeholder="0,00"
                value={formData.valor || ''}
                onChange={handleChange}
              />
            </div>
            {margem && (
              <p className="text-xs text-gray-500 mt-1">
                Máximo: {formatCurrency(margem.margemMaxima)}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="parcelas" className="block text-sm font-medium text-gray-700 mb-1">
              Número de Parcelas
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="parcelas"
                name="parcelas"
                required
                className="input-field pl-10"
                value={formData.parcelas}
                onChange={handleChange}
              >
                {margem?.parcelasDisponiveis.map((num) => (
                  <option key={num} value={num}>
                    {num}x
                  </option>
                ))}
              </select>
            </div>
          </div>

          {formData.valor > 0 && formData.parcelas > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Resumo da Solicitação
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor total:</span>
                  <span className="font-medium">{formatCurrency(formData.valor)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Parcelas:</span>
                  <span className="font-medium">{formData.parcelas}x</span>
                </div>
                <div className="flex justify-between border-t pt-1">
                  <span className="text-gray-600">Valor da parcela:</span>
                  <span className="font-medium">{formatCurrency(valorParcela)}</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.valor || formData.valor <= 0}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Solicitando...
                </div>
              ) : (
                'Solicitar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SolicitarEmprestimoModal;
