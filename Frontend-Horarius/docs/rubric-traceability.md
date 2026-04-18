# Rastreabilidade da Rubrica

## Front-end autenticacao

- tela de login com validacao de e-mail e senha: `src/app/pages/Login.tsx`
- persistencia do token no navegador: `src/app/lib/auth-storage.ts`
- contexto global de autenticacao: `src/app/auth/AuthContext.tsx`
- tratamento amigavel de erros da API: `src/app/lib/api-error.ts`
- guarda de rotas e redirecionamento: `src/app/routes.tsx`

## Front-end cadastro e edicao de usuario

- cadastro de usuario com validacao de CPF, e-mail, senha e confirmacao: `src/app/pages/CadastroUsuario.tsx`
- edicao do proprio perfil: `src/app/pages/Perfil.tsx`
- bloqueio de alteracao do e-mail: `src/app/components/profile/ProfileIdentitySection.tsx`
- validacao de senha no perfil: `src/app/components/profile/ProfileSecuritySection.tsx`

## Front-end CRUDs completos

- clientes: `src/app/pages/Clientes.tsx` e `src/app/pages/ClienteFormulario.tsx`
- servicos: `src/app/pages/Servicos.tsx` e `src/app/pages/ServicoFormulario.tsx`
- profissionais: `src/app/pages/Profissionais.tsx`, `src/app/pages/ProfissionalFormulario.tsx` e `src/app/pages/ProfissionalHorarios.tsx`
- agenda e agendamentos: `src/app/pages/AgendaTimeline.tsx` e `src/app/pages/AgendaLista.tsx`
- servicos de integracao com a API: `src/app/services`

## Componentizacao e visual

- layout principal compartilhado: `src/app/components/Layout.tsx`
- shell reutilizavel das paginas: `src/app/components/PageShell.tsx`
- grade e dialogos da timeline extraidos para a feature: `src/app/features/agenda`
- componentes de UI reutilizaveis: `src/app/components/ui`
- tema e identidade visual: `src/styles/theme.css`

## Evidencias de teste

- validacao da pagina de login: `src/app/pages/Login.spec.tsx`
- guarda de rotas publicas e protegidas: `src/app/routes.spec.tsx`
- servico autenticado de clientes: `src/app/services/clients.spec.ts`
- setup do ambiente de testes: `src/test/setup.ts`
- suite automatizada: `npm test`
- build de producao: `npm run build`

## Observacao

Este arquivo concentra onde cada criterio principal do frontend pode ser encontrado, ajudando na apresentacao e na conferencia da rubrica.
