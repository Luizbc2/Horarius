# Rastreabilidade da rubrica mobile 2026

## Desenvolvimento para Dispositivos Móveis

| Item | Valor | Status | Evidência |
| --- | ---: | --- | --- |
| Arquitetura e padronização | 0,5 | Atendido | `Aplicativo-Schedra/src` organizado por feature, shared, navigation e theme |
| Componentização e clean code | 1,0 | Atendido | Componentes compartilhados, APIs, tipos e validações isoladas |
| CRUD aplicativo x API x banco | 1,0 | Atendido | CRUD completo de clientes no aplicativo e backend |
| Regras de negócio | 0,5 | Atendido | `REQUIREMENTS.md`, serviços do backend e validações mobile |
| Usabilidade, compatibilidade e segurança | 1,0 | Atendido com roteiro | `MOBILE_VALIDATION.md`, SecureStore, JWT, RBAC e bundles multiplataforma |

## Engenharia e Análise de Projeto de Software

| Item | Valor | Status | Evidência |
| --- | ---: | --- | --- |
| Contextualização e evolução | 1,0 | Atendido | `PRODUCT_EVOLUTION.md` |
| Diagrama entidade-relacionamento | 0,5 | Atendido | `DIAGRAMS.md`, seção 1 |
| Requisitos funcionais e não funcionais | 1,0 | Atendido | `REQUIREMENTS.md` |
| Dois diagramas de casos de uso | 0,5 | Atendido | `DIAGRAMS.md`, seções 2 e 3 |
| Dois diagramas de atividades | 0,5 | Atendido | `DIAGRAMS.md`, seções 4 e 5 |
| Dois diagramas de sequência | 0,5 | Atendido | `DIAGRAMS.md`, seções 6 e 7 |

## Tech Forge

| Item | Valor | Status | Evidência |
| --- | ---: | --- | --- |
| Receber e salvar imagens com Multer | 1,0 | Atendido | `avatar-upload.ts`, rota de avatar e ProfileScreen |
| Validar extensão, tamanho e colisão | 1,0 | Atendido | MIME + extensão, limite de 5 MB, UUID e testes Jest |
| Controle funcional admin e usuário | 2,0 | Atendido | Middleware authorize, rotas admin, painel mobile e testes |

## Evolução do projeto

| Critério | Status | Evidência |
| --- | --- | --- |
| Conexão com persona/cliente | Atendido | Três personas e necessidades em `PRODUCT_EVOLUTION.md` |
| Itens marcados como NSA na rubrica | Não aplicável | O documento original não apresenta descrição para esses itens |

## Checklist de entrega

- [x] Aplicativo Expo no repositório.
- [x] API e banco integrados.
- [x] CRUD completo demonstrável.
- [x] Upload de avatar demonstrável.
- [x] Controle admin/usuário demonstrável.
- [x] Requisitos e regras documentados.
- [x] DER documentado.
- [x] Dois casos de uso documentados.
- [x] Dois diagramas de atividades documentados.
- [x] Dois diagramas de sequência documentados.
- [x] Personas e evolução documentadas.
- [x] Roteiro de testes mobile documentado.
- [ ] Reexecutar o roteiro manual no aparelho imediatamente antes da apresentação.
