# API de Empréstimo Consignado - Credifit

## Visão Geral

Esta API foi desenvolvida para gerenciar o fluxo de solicitação de empréstimo consignado, permitindo que funcionários de empresas conveniadas solicitem empréstimos com aprovação automática baseada em regras de negócio específicas.

## Funcionalidades Implementadas

### ✅ Autenticação e Autorização
- Registro de empresas conveniadas
- Registro de funcionários
- Login com JWT
- Proteção de rotas com guards

### ✅ Gestão de Empréstimos
- Validação de margem consignável (35% do salário)
- Integração com API de score de crédito (mock)
- Regras de aprovação automática baseadas no salário
- Integração com gateway de pagamentos (mock)
- Geração automática de parcelas com vencimentos mensais
- Listagem de empréstimos aprovados/rejeitados

### ✅ Regras de Negócio
- **Margem Consignável**: 35% do salário do funcionário
- **Score Mínimo por Faixa Salarial**:
  - Até R$ 2.000: score mínimo 400
  - Até R$ 4.000: score mínimo 500
  - Até R$ 8.000: score mínimo 600
  - Até R$ 12.000: score mínimo 700
  - Acima de R$ 12.000: score mínimo 800
- **Parcelamento**: 1 a 4 parcelas
- **Vencimentos**: Mensais, a partir de 1 mês após a solicitação

## Endpoints da API

### Autenticação

#### POST /auth/register/empresa
Registra uma nova empresa conveniada.

**Body:**
```json
{
  "cnpj": "12345678000199",
  "razaoSocial": "Empresa Exemplo LTDA",
  "nomeRepresentante": "João Silva",
  "cpfRepresentante": "12345678901",
  "email": "empresa@exemplo.com",
  "senha": "senha123"
}
```

#### POST /auth/register/funcionario
Registra um novo funcionário.

**Body:**
```json
{
  "nome": "Maria Santos",
  "email": "maria@exemplo.com",
  "senha": "senha123",
  "cpf": "98765432100",
  "salario": 5000,
  "empresaId": 1
}
```

#### POST /auth/login
Realiza login de empresa ou funcionário.

**Body:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "access_token": "jwt-token-aqui"
}
```

### Empréstimos

#### GET /emprestimos/margem-disponivel
Obtém informações sobre a margem disponível para empréstimo.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "salario": 5000,
  "margemMaxima": 1750,
  "valorMaximoEmprestimo": 1750,
  "parcelasDisponiveis": [1, 2, 3, 4]
}
```

#### POST /emprestimos/solicitar
Solicita um novo empréstimo.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "valor": 1000,
  "parcelas": 2
}
```

**Response:**
```json
{
  "id": 1,
  "valor": 1000,
  "parcelas": 2,
  "status": "aprovado",
  "scoreUsado": 650,
  "createdAt": "2025-01-14T10:30:00.000Z",
  "parcelasGeradas": [
    {
      "id": 1,
      "numero": 1,
      "valor": 500,
      "vencimento": "2025-02-14T10:30:00.000Z"
    },
    {
      "id": 2,
      "numero": 2,
      "valor": 500,
      "vencimento": "2025-03-14T10:30:00.000Z"
    }
  ]
}
```

#### GET /emprestimos/meus-emprestimos
Lista os empréstimos do funcionário logado.

**Headers:** `Authorization: Bearer <token>`

#### GET /emprestimos/empresa/:empresaId
Lista os empréstimos de uma empresa específica.

**Headers:** `Authorization: Bearer <token>`

### Empresas

#### GET /empresas/funcionarios
Lista os funcionários da empresa logada.

**Headers:** `Authorization: Bearer <token>`

## Integrações Externas

### API de Score de Crédito
- **URL**: `https://mocki.io/v1/f7b3627c-444a-4d65-b76b-d94a6c63bdcf`
- **Fallback**: Score fixo de 650 quando a API está indisponível
- **Response**: `{"score": 650}`

### Gateway de Pagamentos
- **URL**: `https://mocki.io/v1/386c594b-d42f-4d14-8036-508a0cf1264c`
- **Fallback**: Status "aprovado" quando a API está indisponível
- **Response**: `{"status": "aprovado"}`

## Modelo de Dados

### Empresa
```typescript
{
  id: number;
  cnpj: string;
  razaoSocial: string;
  nomeRepresentante: string;
  cpfRepresentante: string;
  email: string;
  senha: string; // hashed
}
```

### Funcionário
```typescript
{
  id: number;
  nome: string;
  cpf: string;
  email: string;
  senha: string; // hashed
  salario: number;
  empresaId: number;
}
```

### Empréstimo
```typescript
{
  id: number;
  funcionarioId: number;
  valor: number;
  parcelas: number;
  status: "aprovado" | "rejeitado";
  scoreUsado: number;
  createdAt: Date;
}
```

### Parcela
```typescript
{
  id: number;
  numero: number;
  valor: number;
  vencimento: Date;
  emprestimoId: number;
}
```

## Códigos de Status HTTP

- **200**: Sucesso
- **201**: Criado com sucesso
- **400**: Bad Request (dados inválidos, margem excedida)
- **401**: Unauthorized (token inválido)
- **403**: Forbidden (empresa não conveniada)
- **404**: Not Found
- **500**: Internal Server Error

## Exemplos de Uso

### Fluxo Completo de Solicitação

1. **Registrar Empresa:**
```bash
curl -X POST http://localhost:3000/auth/register/empresa \
  -H "Content-Type: application/json" \
  -d '{
    "cnpj": "12345678000199",
    "razaoSocial": "Empresa Exemplo LTDA",
    "nomeRepresentante": "João Silva",
    "cpfRepresentante": "12345678901",
    "email": "empresa@exemplo.com",
    "senha": "senha123"
  }'
```

2. **Registrar Funcionário:**
```bash
curl -X POST http://localhost:3000/auth/register/funcionario \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Maria Santos",
    "email": "maria@exemplo.com",
    "senha": "senha123",
    "cpf": "98765432100",
    "salario": 5000,
    "empresaId": 1
  }'
```

3. **Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria@exemplo.com",
    "password": "senha123"
  }'
```

4. **Verificar Margem:**
```bash
curl -X GET http://localhost:3000/emprestimos/margem-disponivel \
  -H "Authorization: Bearer <token>"
```

5. **Solicitar Empréstimo:**
```bash
curl -X POST http://localhost:3000/emprestimos/solicitar \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "valor": 1000,
    "parcelas": 2
  }'
```

## Testes

O projeto inclui testes automatizados para:
- Validação de usuários
- Lógica de aprovação de empréstimos
- Integração com APIs externas
- Tratamento de erros

Execute os testes com:
```bash
npm test
```

## Tecnologias Utilizadas

- **NestJS**: Framework Node.js
- **Prisma**: ORM para banco de dados
- **PostgreSQL**: Banco de dados
- **JWT**: Autenticação
- **bcrypt**: Hash de senhas
- **Jest**: Testes automatizados
- **Axios**: Cliente HTTP para integrações

## Estrutura do Projeto

```
src/
├── auth/                 # Módulo de autenticação
├── emprestimos/          # Módulo de empréstimos
├── empresas/             # Módulo de empresas
├── usuario/              # Módulo de usuários (legado)
├── app.module.ts         # Módulo principal
└── main.ts              # Arquivo de inicialização

prisma/
├── schema.prisma        # Schema do banco de dados
└── prisma.service.ts    # Serviço do Prisma
```

## Próximos Passos

Para completar a solução, seria necessário:

1. **Frontend**: Desenvolver interface web com React/Vue.js
2. **Validações**: Adicionar validação de CPF/CNPJ
3. **Logs**: Implementar sistema de logs
4. **Monitoramento**: Adicionar métricas e health checks
5. **Deploy**: Configurar ambiente de produção
6. **Documentação**: Swagger/OpenAPI
7. **Segurança**: Rate limiting, CORS, etc.
