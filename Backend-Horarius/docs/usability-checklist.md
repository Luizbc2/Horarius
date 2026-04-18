# Registro de Validacao de Usabilidade

## Data

- 2026-04-15

## Objetivo

Registrar a verificacao manual orientada pelos fluxos principais consumidos pelo frontend do Horarius e deixar uma evidencia mais objetiva para a rubrica.

## Escopo avaliado

- cadastro de usuario
- login
- atualizacao do proprio perfil
- cadastro, listagem, consulta, edicao e exclusao de clientes
- cadastro, listagem, consulta, edicao e exclusao de servicos
- cadastro, consulta, edicao, exclusao e configuracao de horarios de profissionais
- cadastro, listagem, edicao e exclusao de agendamentos

## Ambiente da verificacao

- backend Node.js com TypeScript e Express
- autenticacao via JWT
- fluxos protegidos executados com token valido
- validacao apoiada por testes HTTP e conferencia das mensagens retornadas pela API

## Evidencias utilizadas

- suite HTTP existente para health, auth e users
- suite HTTP complementar para clientes, servicos, profissionais e agendamentos
- validacoes de negocio nas camadas de service
- mensagens retornadas pela API em portugues e sem caracteres corrompidos

## Fluxos verificados

### 1. Cadastro de usuario

- entrada valida cria usuario e devolve mensagem objetiva de sucesso
- e-mail, CPF e senha passam por validacao antes da persistencia
- senha e armazenada com hash

### 2. Login

- credenciais validas devolvem token JWT e dados publicos do usuario
- credenciais invalidas devolvem erro compreensivel
- rotas protegidas bloqueiam acesso sem token ou com token invalido

### 3. Atualizacao de perfil

- somente o proprio usuario autenticado consegue editar o perfil
- o e-mail permanece bloqueado para alteracao
- CPF e senha continuam validados no update

### 4. Clientes

- fluxo CRUD protegido executa com sucesso
- listagem suporta paginacao e busca
- mensagens de erro foram normalizadas para portugues legivel

### 5. Servicos

- fluxo CRUD protegido executa com sucesso
- duracao e preco possuem regras de validacao
- listagem suporta paginacao e busca

### 6. Profissionais e horarios

- fluxo CRUD protegido executa com sucesso
- horarios semanais podem ser cadastrados e consultados
- validacao bloqueia dia repetido, horario final anterior ao inicial, intervalo incompleto e intervalo fora da jornada

### 7. Agendamentos

- fluxo CRUD protegido executa com sucesso
- listagem suporta filtros por data, profissional e status
- resposta inclui relacionamento com cliente, profissional e servico

## Resultado observado

- os fluxos principais da API ficaram consistentes para consumo pelo frontend
- as mensagens retornadas permanecem coerentes e compreensiveis
- os cenarios protegidos exigem autenticacao corretamente
- as regras principais de agenda e horario ficaram cobertas de forma mais forte

## Conclusao

O projeto agora possui uma evidencia mais objetiva dos fluxos principais exigidos pela rubrica: arquitetura em camadas, autenticacao, CRUDs protegidos, validacoes de negocio, paginacao, relacionamentos e verificacao dos fluxos centrais usados pela aplicacao.
