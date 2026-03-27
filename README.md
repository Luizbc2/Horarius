# Backend Horarius

Base inicial do backend em Node.js com TypeScript, Express, Sequelize e PostgreSQL.

## Stack

- Node.js
- TypeScript
- Express
- Sequelize
- PostgreSQL

## Estrutura inicial

- servidor Express configurado
- CORS liberado para o front
- rota `GET /api/health`
- Sequelize preparado para PostgreSQL
- conexao com banco opcional ate a configuracao real

## Como rodar

1. Instale as dependencias com `npm install`
2. Crie o arquivo `.env` com base em `.env.example`
3. Rode em desenvolvimento com `npm run dev`

## Primeira rota

- `GET /api/health`

## Login inicial

- `POST /api/auth/login`
- corpo esperado:

```json
{
  "email": "admin@horarius.com",
  "password": "123456"
}
```

- usuario temporario lido do `.env` ate a etapa de banco/cadastro
