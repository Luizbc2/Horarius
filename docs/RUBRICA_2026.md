# Rastreabilidade da Rubrica 2026

Este documento mapeia os itens da rubrica para os arquivos da entrega atual.

## DevOps e Cloud Computing

| Item | Onde foi atendido |
| --- | --- |
| Organizacao do `docker-compose.yml` | `docker-compose.yml` separa `mysql`, `backend`, `frontend` e `nginx`, com volumes, redes e variaveis via `.env`. |
| Integracao entre servicos | `backend` usa `mysql` pela rede interna `data`; `frontend` usa `/api`; `nginx` encaminha `/api` para o backend e `/` para o frontend. |
| Persistencia no MySQL | Volume nomeado `mysql_data` montado em `/var/lib/mysql`. |
| Nginx como proxy reverso | `infra/nginx/conf.d/schedra.conf`. |
| Ambiente de desenvolvimento | `.env.example`, Dockerfiles e scripts `compose:up`, `compose:down` no `package.json` da raiz. |

## Sistemas Operacionais, Redes e Cyberseguranca

| Item | Onde foi atendido |
| --- | --- |
| Headers de seguranca HTTP | `X-Frame-Options`, `X-Content-Type-Options`, `Content-Security-Policy`, `Referrer-Policy` e `Permissions-Policy` em `infra/nginx/conf.d/schedra.conf`. |
| Senhas e dados sensiveis | `docker-compose.yml` usa interpolacao `${VAR}` e `env_file`; valores reais ficam no `.env`, ignorado pelo Git. |
| HTTPS com host customizado | Nginx escuta `443` para `schedra.app` e espera certificados em `infra/nginx/certs`. |
| Redirect HTTP para HTTPS | Bloco `server` na porta `80` retorna `301` para `https://$host$request_uri`. |
| Isolamento via Docker Network | Apenas `nginx` publica portas; `mysql`, `backend` e `frontend` ficam em redes Docker internas. A rede `data` e marcada como `internal`. |

## Tech Forge

| Item | Onde foi atendido |
| --- | --- |
| Login sucesso/falha | `tests/e2e/schedra-api.spec.ts`. |
| Criacao de usuario sucesso/falha | `tests/e2e/schedra-api.spec.ts`. |
| CRUD completo 1 | Clientes: cadastrar, editar, listar e excluir, com casos de sucesso e falha. |
| CRUD completo 2 | Servicos: cadastrar, editar, listar e excluir, com casos de sucesso e falha. |
| Husky pre-commit/pre-push | `.husky/commit-msg`, `.husky/pre-commit`, `.husky/pre-push`. |
| Mensagem de commit | `commitlint.config.cjs`. |
| GitFlow | Criar branches `dev` e `feature/rubrica-2026-devops-e2e` antes de publicar a entrega. |

## Como rodar

1. Copie `.env.example` para `.env` e ajuste as senhas.
2. Gere os certificados locais:

```bash
mkcert -install
mkcert -cert-file infra/nginx/certs/schedra.app.pem -key-file infra/nginx/certs/schedra.app-key.pem schedra.app
```

3. Adicione `127.0.0.1 schedra.app` no arquivo de hosts do sistema.
4. Suba a stack:

```bash
npm run compose:up
```

5. Acesse `https://schedra.app`.
6. Rode os testes e2e:

```bash
npm run test:e2e
```
