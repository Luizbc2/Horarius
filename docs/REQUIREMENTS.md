# Requisitos do Schedra

## 1. Requisitos funcionais

| Código | Requisito | Perfil | Evidência principal |
| --- | --- | --- | --- |
| RF01 | Permitir cadastro com nome, CPF, e-mail, senha e tipo de conta | Público | Tela de cadastro e `POST /api/users` |
| RF02 | Autenticar por e-mail, senha e tipo de conta | Público | Tela de login e `POST /api/auth/login` |
| RF03 | Manter a sessão autenticada no aplicativo | Todos | `AuthProvider` e Expo SecureStore |
| RF04 | Exibir agenda correspondente ao tipo da conta | Todos | Agenda empresarial ou pessoal |
| RF05 | Criar, listar, editar e excluir clientes | Empresarial | CRUD mobile de clientes |
| RF06 | Pesquisar clientes por dados cadastrais | Empresarial | Campo de busca de clientes |
| RF07 | Criar, listar, editar e excluir agendamentos | Empresarial | Agenda e API de appointments |
| RF08 | Vincular cliente, profissional e serviço ao agendamento | Empresarial | Editor de agendamento |
| RF09 | Criar, listar, editar e excluir compromissos pessoais | Pessoal | Agenda e API de personal events |
| RF10 | Atualizar os dados do próprio perfil | Todos | Perfil e `PUT /api/users/me` |
| RF11 | Selecionar e enviar uma foto de perfil | Todos | Expo ImagePicker, Multer e avatar do usuário |
| RF12 | Alternar entre tema claro e escuro | Todos | ThemeProvider persistente |
| RF13 | Listar usuários para administração | Admin | Painel administrativo |
| RF14 | Promover ou rebaixar outro usuário | Admin | Controle de papel e rota protegida |
| RF15 | Bloquear, reativar ou excluir outro usuário | Admin | Controles administrativos |
| RF16 | Encerrar a sessão do usuário | Todos | Ação Sair da conta |

## 2. Requisitos não funcionais

| Código | Requisito | Critério de aceitação |
| --- | --- | --- |
| RNF01 | Segurança de credenciais | Senhas armazenadas com hash e token JWT com expiração |
| RNF02 | Armazenamento seguro no dispositivo | Token salvo pelo Expo SecureStore, não em texto aberto |
| RNF03 | Autorização | Rotas administrativas retornam `403` para usuário comum |
| RNF04 | Compatibilidade | Bundle gerado para Android, iOS e web sem erro de tipagem |
| RNF05 | Responsividade | Conteúdo utilizável em larguras móveis e desktop sem sobreposição |
| RNF06 | Usabilidade | Navegação principal acessível em até um toque pela barra inferior |
| RNF07 | Integridade de upload | Somente JPG, JPEG, PNG ou WEBP de até 5 MB |
| RNF08 | Ausência de colisão | Cada avatar recebe nome com timestamp e UUID |
| RNF09 | Manutenibilidade | Código TypeScript organizado por feature e responsabilidades |
| RNF10 | Persistência | Dados permanecem no banco após reinício da API |
| RNF11 | Disponibilidade local | Docker Compose inicia banco, backend, frontend e proxy |
| RNF12 | Qualidade | Backend coberto por Jest e contratos principais por Playwright |

## 3. Regras de negócio

| Código | Regra |
| --- | --- |
| RN01 | E-mail e CPF devem ser únicos entre os usuários. |
| RN02 | A senha deve ter no mínimo oito caracteres, maiúscula, minúscula, número e caractere especial. |
| RN03 | O tipo selecionado no login deve corresponder ao tipo cadastrado na conta. |
| RN04 | Conta pessoal acessa compromissos pessoais e não depende de profissionais ou serviços. |
| RN05 | Conta empresarial pode gerenciar clientes e agendamentos operacionais. |
| RN06 | Apenas administradores acessam e alteram usuários. |
| RN07 | Um administrador não pode rebaixar, bloquear ou excluir a própria conta. |
| RN08 | Usuário bloqueado não pode autenticar nem reutilizar privilégios antigos. |
| RN09 | Um usuário somente pode editar o próprio perfil. |
| RN10 | Avatar deve possuir extensão e MIME compatíveis e respeitar o limite de 5 MB. |
| RN11 | Dados de clientes e agenda são filtrados pelo proprietário autenticado. |
| RN12 | Agendamentos empresariais exigem cliente, profissional, serviço, data e horário válidos. |

## 4. Critérios de aceite da funcionalidade principal

1. O usuário empresarial autentica no aplicativo.
2. Cadastra um cliente com dados válidos.
3. O aplicativo envia os dados para a API.
4. A API valida a regra e persiste o registro no banco.
5. O cliente aparece imediatamente na listagem.
6. O usuário edita o cliente e a alteração permanece após recarregar.
7. O usuário exclui o cliente e ele deixa de aparecer.
8. Tentativas inválidas exibem mensagem e não alteram o banco.
