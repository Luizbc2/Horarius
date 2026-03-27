# Backend Horarius

Base inicial do backend em Node.js com TypeScript, Express, Sequelize e PostgreSQL.

## Stack

- Node.js
- TypeScript
- Express
- Sequelize
- PostgreSQL

## Estrutura atual

- servidor Express configurado
- CORS liberado para o front
- conexao com PostgreSQL via Sequelize
- tabela `users` sincronizada no startup
- seed inicial de usuario para autenticacao
- senha armazenada com hash `scrypt`
- validacao de e-mail no login
- retorno JWT no login
- rota `GET /api/health`

## Como rodar

1. Instale as dependencias com `npm install`
2. Crie o arquivo `.env` com base em `.env.example`
3. Rode em desenvolvimento com `npm run dev`

## Rotas atuais

- `GET /api/health`
- `POST /api/auth/login`

Corpo esperado para login:

```json
{
  "email": "admin@horarius.com",
  "password": "123456"
}
```

Resposta de sucesso:

```json
{
  "message": "Login successful.",
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

- o usuario inicial de autenticacao e criado a partir das variaveis `AUTH_USER_*`
- o token JWT usa `JWT_SECRET` e `JWT_EXPIRES_IN`
