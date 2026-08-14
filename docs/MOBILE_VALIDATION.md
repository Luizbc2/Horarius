# Validação do aplicativo móvel

## 1. Escopo

Este documento registra como validar usabilidade, funcionalidade principal, compatibilidade e segurança do aplicativo Schedra. A execução deve ser repetida antes da apresentação sempre que houver alteração funcional relevante.

## 2. Ambientes cobertos

| Ambiente | Evidência técnica | Situação |
| --- | --- | --- |
| iOS | Expo SDK 54, bundle iOS e uso pelo Expo Go | Validado |
| Android | Expo SDK 54 e bundle Android | Validado por compilação |
| Web responsiva | Expo Web em viewport móvel | Validado como apoio |
| API | Node.js, Express, Sequelize e Jest | Validado automaticamente |
| Banco | MySQL no Docker e PostgreSQL/Supabase por configuração | Suportado |

> A apresentação deve priorizar o aparelho iOS usado pela equipe e manter o bundle Android como evidência de compatibilidade. A validação em aparelho Android real é recomendada quando houver um dispositivo disponível.

## 3. Roteiro da funcionalidade principal

### CRUD de clientes

- [ ] Entrar e ativar o modo empresarial pelo switch do cabeçalho.
- [ ] Abrir a aba Clientes.
- [ ] Cadastrar cliente com nome, e-mail e telefone válidos.
- [ ] Confirmar que o cliente aparece imediatamente.
- [ ] Pesquisar pelo nome cadastrado.
- [ ] Editar telefone ou observações.
- [ ] Recarregar e confirmar que a alteração permaneceu no banco.
- [ ] Excluir o cliente e confirmar sua remoção.
- [ ] Tentar cadastrar dados inválidos e conferir a mensagem de erro.

### Agenda pessoal e empresarial

- [ ] Ativar o modo pessoal e criar um compromisso.
- [ ] Editar e excluir o compromisso.
- [ ] Ativar o modo empresarial e criar um agendamento selecionando cliente, profissional e serviço.
- [ ] Confirmar que o formulário preserva o foco durante a digitação.

### Perfil e imagem

- [ ] Selecionar uma imagem JPG, PNG ou WEBP válida.
- [ ] Confirmar atualização do avatar após o upload.
- [ ] Enviar arquivo com extensão proibida e conferir rejeição.
- [ ] Enviar arquivo maior que 5 MB e conferir rejeição.

### Administração

- [ ] Confirmar que usuário comum não visualiza a aba Admin.
- [ ] Confirmar que acesso direto à API administrativa retorna `403`.
- [ ] Promover outro usuário para admin.
- [ ] Bloquear outro usuário e confirmar que ele não autentica.
- [ ] Reativar o usuário.
- [ ] Confirmar que o admin não altera ou exclui a própria conta.

## 4. Checklist de usabilidade

- [x] Navegação principal permanece acessível na barra inferior.
- [x] Botões possuem ícones e estados ativos identificáveis.
- [x] Tema claro e escuro mantêm contraste funcional.
- [x] Campos exibem rótulos e mensagens de validação.
- [x] Senha possui verificação visual em tempo real.
- [x] Ações destrutivas solicitam confirmação.
- [x] Carregamento, lista vazia e falha possuem estados visuais.
- [x] Teclado permanece aberto durante digitação contínua.
- [x] Textos longos usam truncamento ou quebra controlada.
- [x] Fluxos pessoal e empresarial apresentam somente módulos pertinentes.

## 5. Checklist de segurança

- [x] Token armazenado pelo SecureStore no aplicativo.
- [x] Senhas armazenadas com hash no backend.
- [x] JWT obrigatório nas rotas privadas.
- [x] Papel administrativo revalidado no banco.
- [x] Conta bloqueada invalida acesso existente.
- [x] Usuário edita somente o próprio perfil.
- [x] Registros operacionais são associados ao usuário autenticado.
- [x] Upload exige autenticação.
- [x] Extensão e MIME do avatar devem ser compatíveis.
- [x] Upload limitado a 5 MB e um arquivo por requisição.
- [x] Nome de arquivo usa UUID para impedir colisão.

## 6. Comandos de evidência

```powershell
cd C:\facul\Horarius\Aplicativo-Schedra
npm run typecheck
npx expo export --platform ios
npx expo export --platform android
npx expo export --platform web
```

```powershell
cd C:\facul\Horarius\Backend-Schedra
npm test
npm run build
```

```powershell
cd C:\facul\Horarius
npm run test:e2e
```

## 7. Critério de aprovação

A versão está apta para apresentação quando os comandos terminarem sem erro, os testes automatizados estiverem verdes e o roteiro da funcionalidade principal for executado no aparelho usado na demonstração.
