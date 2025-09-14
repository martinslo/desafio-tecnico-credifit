# Frontend - Sistema de Empréstimo Consignado

## Visão Geral

Frontend desenvolvido em React com TypeScript para o sistema de empréstimo consignado da Credifit. Focado no fluxo de login de funcionários e solicitação de empréstimos.

## Funcionalidades Implementadas

### ✅ Autenticação
- Tela de login para funcionários
- Gerenciamento de estado de autenticação com Context API
- Proteção de rotas
- Logout automático em caso de token inválido

### ✅ Dashboard do Funcionário
- Visualização do salário atual
- Margem disponível para empréstimo (35% do salário)
- Contador de empréstimos realizados
- Interface moderna e responsiva

### ✅ Solicitação de Empréstimo
- Modal para solicitação de empréstimo
- Validação de valor máximo baseado na margem
- Seleção de número de parcelas (1 a 4)
- Cálculo automático do valor da parcela
- Integração com API de score e pagamentos

### ✅ Listagem de Empréstimos
- Visualização de todos os empréstimos do funcionário
- Status de aprovação/rejeição
- Detalhes das parcelas (quando aprovado)
- Datas de vencimento
- Score utilizado na análise

## Tecnologias Utilizadas

- **React 19** - Framework principal
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones
- **Vite** - Build tool

## Estrutura do Projeto

```
src/
├── components/           # Componentes React
│   ├── Dashboard.tsx    # Dashboard principal
│   ├── LoginForm.tsx    # Formulário de login
│   ├── SolicitarEmprestimoModal.tsx  # Modal de solicitação
│   └── ProtectedRoute.tsx  # Rota protegida
├── contexts/            # Contextos React
│   └── AuthContext.tsx  # Contexto de autenticação
├── services/            # Serviços
│   └── api.ts          # Cliente da API
├── types/              # Definições de tipos
│   └── index.ts        # Tipos TypeScript
├── App.tsx             # Componente principal
└── main.tsx            # Ponto de entrada
```

## Como Executar

### Pré-requisitos
- Node.js 18+
- Backend rodando na porta 3000

### Instalação
```bash
npm install
```

### Desenvolvimento
```bash
npm run dev
```

### Build para Produção
```bash
npm run build
```

### Preview da Build
```bash
npm run preview
```

## Fluxo de Uso

### 1. Login
- O funcionário acessa a aplicação
- Insere email e senha
- Sistema valida credenciais com o backend
- Token JWT é armazenado no localStorage

### 2. Dashboard
- Visualização de informações resumidas
- Salário atual e margem disponível
- Botão para solicitar novo empréstimo

### 3. Solicitação de Empréstimo
- Modal com formulário de solicitação
- Validação de valor máximo (35% do salário)
- Seleção de parcelas (1 a 4)
- Cálculo automático do valor da parcela
- Envio para análise automática

### 4. Resultado
- Empréstimo aprovado ou rejeitado
- Se aprovado: parcelas são geradas automaticamente
- Histórico completo na listagem

## Integração com Backend

A aplicação se conecta com a API RESTful do backend através dos seguintes endpoints:

- `POST /auth/login` - Autenticação
- `GET /emprestimos/margem-disponivel` - Consultar margem
- `POST /emprestimos/solicitar` - Solicitar empréstimo
- `GET /emprestimos/meus-emprestimos` - Listar empréstimos

## Design System

### Cores
- **Primary**: Azul (#3b82f6)
- **Success**: Verde (#22c55e)
- **Danger**: Vermelho (#ef4444)
- **Gray**: Tons de cinza para textos e backgrounds

### Componentes
- **Botões**: Classes utilitárias do Tailwind
- **Inputs**: Estilização consistente com focus states
- **Cards**: Sombras sutis e bordas arredondadas
- **Modais**: Overlay com backdrop blur

### Responsividade
- Design mobile-first
- Breakpoints do Tailwind CSS
- Layout adaptativo para diferentes telas

## Tratamento de Erros

- Validação de formulários
- Mensagens de erro amigáveis
- Loading states durante requisições
- Fallback para APIs indisponíveis
- Redirecionamento automático em caso de token inválido

## Próximos Passos

Para completar a solução, seria interessante:

1. **Validações**: Adicionar validação de CPF/CNPJ no frontend
2. **Testes**: Implementar testes unitários e de integração
3. **PWA**: Transformar em Progressive Web App
4. **Notificações**: Sistema de notificações push
5. **Temas**: Suporte a tema escuro/claro
6. **Acessibilidade**: Melhorar acessibilidade (ARIA, keyboard navigation)
7. **Performance**: Lazy loading e code splitting
8. **Monitoramento**: Integração com ferramentas de monitoramento

## Screenshots

### Tela de Login
- Formulário limpo e moderno
- Validação em tempo real
- Feedback visual para erros

### Dashboard
- Cards informativos
- Botão de ação principal
- Lista de empréstimos

### Modal de Solicitação
- Formulário intuitivo
- Validação de margem
- Resumo da solicitação