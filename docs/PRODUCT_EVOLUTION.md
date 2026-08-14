# Evolução do produto Schedra

## 1. Contexto do problema

Prestadores de serviço e pequenas equipes costumam distribuir sua operação entre agendas pessoais, mensagens, planilhas e anotações. Essa fragmentação dificulta enxergar horários livres, evita pouco os conflitos de agenda e torna o histórico do cliente dependente da memória de quem realizou o atendimento.

Para uma pessoa que administra apenas os próprios compromissos, ferramentas empresariais também criam complexidade desnecessária. Ela precisa registrar academia, consultas, estudos e outros eventos sem cadastrar profissionais, serviços ou uma estrutura comercial.

O Schedra resolve esses dois contextos com uma única plataforma de agenda:

- perfil empresarial para clientes, profissionais, serviços e atendimentos;
- perfil pessoal para compromissos individuais;
- experiência web e aplicativo móvel consumindo a mesma API;
- controle administrativo de usuários, papéis e contas bloqueadas.

## 2. Objetivo do produto

Centralizar a rotina de agenda em uma experiência rápida e segura, reduzindo conflitos de horário e mantendo os dados operacionais sincronizados entre aplicativo, API e banco de dados.

## 3. Personas

### Persona 1 - Gestora de negócio

**Marina, 34 anos, proprietária de um salão.** Organiza quatro profissionais e atende clientes durante o dia. Precisa visualizar ocupação, localizar clientes e impedir que horários conflitantes sejam cadastrados.

Necessidades atendidas:

- agenda empresarial consolidada;
- cadastro e pesquisa de clientes;
- vínculo entre cliente, profissional e serviço;
- controle de usuários e permissões administrativas.

### Persona 2 - Profissional autônomo

**Carlos, 29 anos, barbeiro autônomo.** Trabalha sozinho, mas precisa manter clientes e atendimentos organizados pelo celular. Valoriza ações rápidas e uma interface que funcione com uma mão.

Necessidades atendidas:

- CRUD de clientes no aplicativo;
- novo agendamento pelo botão flutuante;
- navegação inferior com os módulos principais;
- perfil e foto de identificação.

### Persona 3 - Usuária pessoal

**Ana, 22 anos, estudante.** Quer organizar academia, psicólogo, provas e compromissos sem configurar uma empresa.

Necessidades atendidas:

- conta do tipo pessoal;
- compromissos com título, local, data, horário e observações;
- interface sem profissionais e serviços;
- isolamento entre agenda pessoal e empresarial.

## 4. Evolução por entregas

| Etapa | Evolução | Resultado verificável |
| --- | --- | --- |
| 1. Fundação web | Login, agenda, clientes, profissionais e serviços | Aplicação web funcional integrada à API |
| 2. Infraestrutura | Docker Compose, MySQL, Nginx, HTTPS e GitFlow | Ambiente reproduzível e proxy reverso seguro |
| 3. Identidade | Horarius foi reposicionado como Schedra | Nova marca, tema claro/escuro e interface responsiva |
| 4. Modelo de plataforma | Expansão para 30 tabelas | Estrutura preparada para organizações, financeiro e auditoria |
| 5. Aplicativo móvel | Expo, React Native e navegação própria | Aplicativo compartilhando contratos com a API |
| 6. Perfis de uso | Cadastro e login pessoal/empresarial | Experiência adaptada ao contexto do usuário |
| 7. Funcionalidades móveis | Agenda, CRUD de clientes, perfil e avatar | Fluxos principais executáveis no celular |
| 8. Segurança funcional | Papéis admin/usuário e bloqueio de contas | Rotas administrativas protegidas no backend e na interface |
| 9. Qualidade | Testes, documentação e rastreabilidade | Evidências diretamente ligadas à rubrica acadêmica |

## 5. Decisões de produto

1. A API REST é a fonte única de regras e dados para web e aplicativo.
2. O tipo de conta é escolhido no cadastro e conferido no login.
3. Usuários comuns não recebem controles administrativos.
4. Uma conta bloqueada perde acesso mesmo que possua um token antigo.
5. O aplicativo prioriza navegação inferior e ações rápidas em telas pequenas.
6. Notificações remotas foram retiradas do escopo atual por não fazerem parte da rubrica e exigirem uma development build específica.

## 6. Conexão com o cliente

As funcionalidades não foram escolhidas apenas pela capacidade técnica. Cada uma responde a uma dor das personas: fragmentação de dados, excesso de passos no celular, mistura entre vida pessoal e trabalho e ausência de controle sobre usuários da equipe. O produto pode ser demonstrado por jornadas completas, desde o cadastro até a persistência de um cliente ou compromisso.

## 7. Próximas evoluções

- concluir o CRUD visual de serviços no aplicativo;
- implementar troca de unidade e membros por organização;
- adicionar auditoria visual de ações administrativas;
- executar testes automatizados de interface em dispositivos reais;
- avaliar notificações locais e remotas em uma development build futura.
