# Backend Horarius

Backend academico do projeto Horarius desenvolvido com Node.js, TypeScript, Express, Sequelize e PostgreSQL.

## Stack

- Node.js
- TypeScript
- Express
- Sequelize
- PostgreSQL
- JWT
- `scrypt` para hash de senha
- Jest
- Supertest

## O que ja cobre

- login com e-mail e senha
- senha criptografada no banco
- validacao de e-mail
- retorno de JWT
- cadastro de usuario com nome, e-mail, CPF e senha
- validacao de CPF
- validacao de forca da senha
- edicao do proprio perfil com rota autenticada
- bloqueio de alteracao de e-mail
- CRUD autenticado de clientes
- CRUD autenticado de servicos
- CRUD autenticado de profissionais
- horarios semanais de profissionais
- CRUD autenticado de agendamentos
- paginacao nas listagens
- relacionamento entre agendamento, cliente, profissional e servico

## Estrutura

O projeto esta organizado em camadas:

- `config`
- `controllers`
- `modules`
- `repositories`
- `routes`
- `services`
- `shared`
- `test`

## Como rodar

1. Instale as dependencias com `npm install`
2. Crie o arquivo `.env` com base em `.env.example`
3. Rode em desenvolvimento com `npm run dev`

Para build de producao:

```bash
npm run build
npm start
```

## Testes

Rodar a suite automatizada:

```bash
npm test
```

Hoje a suite cobre:

- autenticacao
- usuario
- clientes
- servicos
- profissionais
- horarios de profissionais
- agendamentos
- testes funcionais
- testes de integracao HTTP
- teste de sistema com fluxo completo
- teste basico de seguranca
- teste basico de performance

Documentacao de usabilidade:

- `docs/usability-checklist.md`
- `docs/rubric-traceability.md`

## Rotas principais

- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/users`
- `PUT /api/users/me`
- `GET /api/clients`
- `GET /api/clients/:id`
- `POST /api/clients`
- `PUT /api/clients/:id`
- `DELETE /api/clients/:id`
- `GET /api/services`
- `GET /api/services/:id`
- `POST /api/services`
- `PUT /api/services/:id`
- `DELETE /api/services/:id`
- `GET /api/professionals`
- `GET /api/professionals/:id`
- `POST /api/professionals`
- `PUT /api/professionals/:id`
- `DELETE /api/professionals/:id`
- `GET /api/professionals/:id/work-days`
- `PUT /api/professionals/:id/work-days`
- `GET /api/appointments`
- `POST /api/appointments`
- `PUT /api/appointments/:id`
- `DELETE /api/appointments/:id`

## Exemplo de login

Corpo:

```json
{
  "email": "admin@horarius.com",
  "password": "123456"
}
```

Resposta:

```json
{
  "message": "Login realizado com sucesso.",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "Usuario Horarius",
    "email": "admin@horarius.com",
    "cpf": "52998224725"
  }
}
```

## Observacoes

- o usuario seed de autenticacao e criado a partir das variaveis `AUTH_USER_*`
- o token JWT usa `JWT_SECRET` e `JWT_EXPIRES_IN`
- o Sequelize sincroniza as tabelas no startup
