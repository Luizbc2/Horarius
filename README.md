# Schedra

Documentação acadêmica e rastreabilidade da rubrica: [`docs/README.md`](docs/README.md).

[![Site](https://img.shields.io/badge/Link-Projeto-7dffb7?style=for-the-badge&logo=vercel&logoColor=0b1510&labelColor=0b1510)](https://schedra.app/login)

Sistema full stack de agenda com autenticação, painel interno e gerenciamento de clientes, profissionais e serviços. O projeto foi pensado como produto real para organizar a operação do dia a dia.

## Stack

- Frontend: React, Vite, Tailwind CSS, Radix UI
- Backend: Node.js, TypeScript, Express, Sequelize
- Banco de dados: PostgreSQL

## Acesso de teste

- E-mail: `admin@schedra.com`
- Senha: `123456`

Também é possível criar uma conta nova pelo fluxo do sistema.

## Estrutura

```bash
Frontend-Schedra/
Backend-Schedra/
```

## O que o projeto entrega

- Login e autenticação
- Painel com visão da agenda
- Cadastro de clientes, profissionais e serviços
- Estrutura separada entre frontend e backend

## Como rodar localmente

### Entrega da rubrica 2026 com Docker

```bash
copy .env.example .env
npm install
npm run compose:up
npm run test:e2e
```

Para HTTPS local, gere certificados com `mkcert` em `infra/nginx/certs` e cadastre `127.0.0.1 schedra.app` no arquivo de hosts do sistema. O mapeamento completo da rubrica esta em `docs/RUBRICA_2026.md`.

### Frontend

```bash
cd Frontend-Schedra
npm install
npm run dev
```

### Backend

```bash
cd Backend-Schedra
npm install
npm run dev
```

## Autor

**Luiz Otávio**

- GitHub: https://github.com/Luizbc2
- LinkedIn: https://www.linkedin.com/in/luiz-otavio-mello-de-campos-66699224b/
