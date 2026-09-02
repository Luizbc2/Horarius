# Revisão de segurança

## Controles implementados

- Sessões revogáveis com refresh token aleatório armazenado somente como hash SHA-256.
- Access tokens curtos, rotação de refresh token e revogação no logout, bloqueio e alteração de papel.
- A troca de senha revoga todas as outras sessões ativas da conta.
- Tokens de produção sem sessão persistida são recusados; a troca de refresh usa compare-and-swap para impedir reutilização concorrente.
- O navegador recebe o refresh token somente em cookie `HttpOnly`, `SameSite=Strict` e `Secure` em produção; o app usa armazenamento seguro nativo.
- Isolamento de dados por organização e permissões atômicas por vínculo.
- Profissionais acessam apenas os próprios agendamentos, enquanto gestores seguem o escopo integral permitido pelo tenant.
- Agendamentos protegidos por transação serializável, controle de versão e slots únicos por profissional.
- Exclusão lógica de clientes, profissionais, serviços e agendamentos, com snapshots históricos da reserva.
- Upload de avatar reprocessado para WEBP, sem metadados, com limite de bytes, pixels e dimensões.
- Avatares permanecem em volume Docker dedicado; a troca remove o arquivo anterior e compensa falhas de banco.
- Rate limiting, limite de JSON, CORS restrito em produção, cabeçalhos de segurança e request ID.
- Exclusão administrativa lógica, proteção do último administrador e trilha de auditoria.
- O administrador inicial é opt-in em produção e nunca é reativado automaticamente durante o bootstrap normal.
- Health, readiness, métricas Prometheus protegidas e logs HTTP estruturados.
- Migrations versionadas em `schema_migrations` e CI para backend, web e mobile.

## Dependências

Auditoria verificada em 1 de setembro de 2026:

| Componente | Resultado | Decisão |
| --- | --- | --- |
| Web | 0 vulnerabilidades | Sem ação pendente |
| Backend de produção | 2 moderadas, 0 altas, 0 críticas | `uuid` transitivo do Sequelize 6; a correção sugerida rebaixa para Sequelize 3 e é incompatível |
| Aplicativo Expo | 14 moderadas, 9 altas, 0 críticas | Alertas transitivos do Expo 54, Metro, PostCSS e React Navigation; a correção disponível exige Expo 57 ou ainda não foi publicada |

Os alertas de maior severidade do app concentram-se na cadeia de build e desenvolvimento do Expo/Metro. A migração para Expo 57 deve ocorrer separadamente porque altera SDK, React Native e compatibilidade com Expo Go. Até lá, o CI bloqueia vulnerabilidades críticas e o app não processa conteúdo CSS ou arquivos arbitrários vindos de terceiros por essa cadeia.

Não executar `npm audit fix --force`: as correções propostas trocam linhas principais do ORM e do SDK mobile.
