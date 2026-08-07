# Rastreabilidade da Rubrica

## Back-end autenticacao

- login por e-mail e senha: `src/modules/auth/services/login.service.ts`
- senha criptografada: `src/modules/auth/utils/password.util.ts`
- validacao de e-mail: `src/shared/utils/email.util.ts`
- retorno JWT: `src/modules/auth/utils/jwt.util.ts`
- protecao de rotas: `src/modules/auth/middlewares/auth.middleware.ts`

## Back-end cadastro e edicao de usuario

- cadastro com nome, e-mail, CPF e senha: `src/modules/users/services/create-user.service.ts`
- validacao de CPF: `src/shared/utils/cpf.util.ts`
- validacao de senha forte: `src/shared/utils/password-strength.util.ts`
- edicao apenas do proprio perfil: `src/modules/users/services/update-user-profile.service.ts`
- bloqueio de alteracao de e-mail: `src/modules/users/services/update-user-profile.service.ts`

## Back-end CRUDs completos

- clientes: `src/modules/clients`
- servicos: `src/modules/services`
- profissionais: `src/modules/professionals`
- agendamentos: `src/modules/appointments`
- relacoes entre entidades: `src/config/database.ts`
- paginacao e filtros: services de listagem em cada modulo

## Regras de negocio

- horarios de profissionais com validacao de jornada e intervalo: `src/modules/professionals/services/update-professional-work-days.service.ts`
- validacao de duracao e preco de servicos: `src/modules/services/services/create-service.service.ts`
- validacao de status, data e relacionamentos de agendamento: `src/modules/appointments/services/create-appointment.service.ts`

## Evidencias de teste

- testes unitarios por modulo: arquivos `*.spec.ts` em `src/modules`
- testes HTTP de auth, users e CRUDs protegidos: `src/test/http`
- fluxo protegido complementar: `src/test/http/protected-crud.integration.spec.ts`
- build TypeScript: `npm run build`
- suite automatizada: `npm test`

## Evidencia de usabilidade

- validacao manual consolidada: `docs/usability-checklist.md`

## Observacao

Este arquivo existe para acelerar a conferencia da rubrica e apontar rapidamente onde cada requisito do backend esta implementado ou validado.
