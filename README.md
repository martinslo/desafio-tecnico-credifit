# 💻 Desafio Técnico – Credifit

Este repositório contém a implementação do **desafio técnico** para a vaga de desenvolvedor na **Credifit**.  
O desafio consiste na criação de uma plataforma para **gerenciamento de empréstimos consignados**.

👉 Protótipo fornecido pela empresa: [Figma](https://figma.com/file/ZRxcqJazkv7uq6Sr9AZRMU/Desafio-Técnico-2024---Credifit-LinkPJ?type=design&node-id=0%3A1&mode=design&t=kSrpj667QaFUp7Yf-1)

---

## 📂 Estrutura do Projeto

O projeto foi organizado como um **monorepo**, permitindo concentrar o código em um único repositório.  
Ele contém duas pastas principais:

- **`backend/`** → API responsável pela lógica de negócios e persistência de dados.  
- **`frontend/`** → Interface web para interação do usuário.  

---

## ⚙️ Tecnologias Utilizadas

### 🔹 Backend
- [NestJS](https://nestjs.com/) – Framework Node.js modular e escalável.  
- [Prisma](https://www.prisma.io/) – ORM moderno e tipado para acesso ao banco de dados.  
- **PostgreSQL** – Banco de dados relacional robusto e confiável.  

### 🔹 Frontend
- [React](https://react.dev/) – Biblioteca para construção de interfaces reativas.  
- [Tailwind CSS](https://tailwindcss.com/) – Framework utilitário para estilização rápida e responsiva.  

---

## 🧩 Decisões Técnicas

- **PostgreSQL** foi escolhido por ser um banco de dados relacional sólido, com suporte a **transações complexas**, **tipos avançados** (UUID, JSONB, Arrays) e por sua confiabilidade em produção.  
- **Prisma** foi adotado como ORM pela sua **integração com TypeScript**, **migrations seguras** e **API intuitiva**, reduzindo boilerplate em comparação a alternativas como TypeORM ou Sequelize.  
- **NestJS** foi escolhido como framework backend pela sua **arquitetura modular**, **injeção de dependências** nativa e alinhamento com boas práticas (SOLID, Clean Architecture).  
- **React** foi selecionado para o frontend devido ao seu **grande ecossistema**, **reutilização de componentes** e curva de aprendizado acessível.  
- **Tailwind CSS** foi utilizado para estilização por permitir **rapidez no desenvolvimento** e **consistência visual** através de utilitários prontos, sem perder flexibilidade.  

---
