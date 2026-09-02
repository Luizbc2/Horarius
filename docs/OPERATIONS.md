# Operação e recuperação

## Implantação

1. Copie `.env.example` para `.env` e substitua todos os valores `change_*`.
2. Use `DB_AUTO_SYNC=false` fora do ambiente local.
3. Mantenha `AUTH_SEED_ENABLED=false`; habilite o seed apenas durante um bootstrap controlado e volte a desabilitá-lo.
4. Execute `npm --prefix Backend-Schedra run db:migrate` antes de liberar a nova versão.
5. Suba os serviços com `docker compose up --build -d`.
6. Valide `GET /health`, `GET /ready` e o login antes de direcionar tráfego.

O backend interrompe o bootstrap de produção quando banco, HTTPS, segredo JWT ou token de métricas estiverem inseguros. Se o seed for habilitado explicitamente, sua senha também precisa atender à política de produção.

## Observabilidade

- `/health` informa se o processo está ativo.
- `/ready` consulta o banco e responde `503` quando a instância não deve receber tráfego.
- `/metrics` expõe contadores e duração acumulada no formato Prometheus. Envie `Authorization: Bearer $METRICS_TOKEN`.
- Cada resposta inclui `x-request-id`.
- Cada requisição gera log JSON com método, rota, status, duração, usuário e organização, sem senha ou token.
- Ações de escrita e operações administrativas geram registros em `audit_logs`.

Configure alertas para indisponibilidade de `/ready`, aumento de respostas `5xx`, latência e falhas repetidas de autenticação.

## Backup MySQL

Crie diariamente um dump consistente e uma cópia do volume `avatar_data`. Armazene ambos fora do host da aplicação, cifrados e com retenção definida.

```powershell
docker compose exec -T mysql mysqldump --single-transaction --routines --triggers -u root -p$env:MYSQL_ROOT_PASSWORD $env:MYSQL_DATABASE > schedra.sql
docker run --rm -v schedra_avatar_data:/data -v ${PWD}:/backup alpine tar czf /backup/schedra-avatars.tgz -C /data .
```

## Restauração

Faça a restauração primeiro em ambiente isolado. Nunca teste recuperação diretamente sobre produção.

```powershell
Get-Content schedra.sql | docker compose exec -T mysql mysql -u root -p$env:MYSQL_ROOT_PASSWORD $env:MYSQL_DATABASE
docker run --rm -v schedra_avatar_data:/data -v ${PWD}:/backup alpine sh -c "rm -rf /data/* && tar xzf /backup/schedra-avatars.tgz -C /data"
npm --prefix Backend-Schedra run db:migrate
```

Depois, valide `/ready`, autenticação, isolamento de tenant, consulta de agenda e abertura de avatares. Registre data, duração, responsável e resultado do ensaio. O objetivo inicial é testar restauração trimestralmente, com RPO de 24 horas e RTO de 4 horas.

## Atualização de dependências

```bash
npm --prefix Backend-Schedra audit --omit=dev
npm --prefix Frontend-Schedra audit
npm --prefix Aplicativo-Schedra audit
```

Não use `npm audit fix --force`. Mudanças de Sequelize, Expo ou React Native exigem branch própria, matriz de compatibilidade e teste em dispositivo.

## Checklist de release

- Migrações executadas e registradas em `schema_migrations`.
- `npm run quality` aprovado.
- Testes de integração com PostgreSQL aprovados no CI.
- Auditorias revisadas sem vulnerabilidade crítica.
- Backup recente disponível e restauração ensaiada.
- `/health`, `/ready`, `/metrics` e logs conferidos.
- Segredos fora do repositório e certificados válidos.
