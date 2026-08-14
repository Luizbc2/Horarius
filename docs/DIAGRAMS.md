# Diagramas do Schedra

Os diagramas abaixo usam Mermaid e são renderizados diretamente pelo GitHub. Cada fluxo representa funcionalidades implementadas no projeto.

## 1. Diagrama entidade-relacionamento

O DER destaca o núcleo funcional usado pelo aplicativo. As tabelas complementares da plataforma estão catalogadas em `SCHEDRA_PRODUCT_ARCHITECTURE.md`.

```mermaid
erDiagram
    USERS ||--o{ CLIENTS : possui
    USERS ||--o{ SERVICES : oferece
    USERS ||--o{ PROFESSIONALS : gerencia
    USERS ||--o{ PERSONAL_EVENTS : organiza
    USERS ||--o{ ORGANIZATIONS : administra
    USERS ||--o{ MEMBERSHIPS : participa
    USERS ||--o{ NOTIFICATIONS : recebe
    CLIENTS ||--o{ APPOINTMENTS : agenda
    SERVICES ||--o{ APPOINTMENTS : define
    PROFESSIONALS ||--o{ APPOINTMENTS : realiza
    PROFESSIONALS ||--o{ PROFESSIONAL_WORK_DAYS : possui
    ORGANIZATIONS ||--o{ LOCATIONS : possui
    ORGANIZATIONS ||--o{ ROLES : configura
    ORGANIZATIONS ||--o{ MEMBERSHIPS : agrega
    ROLES ||--o{ MEMBERSHIPS : autoriza
    ROLES ||--o{ ROLE_PERMISSIONS : possui
    PERMISSIONS ||--o{ ROLE_PERMISSIONS : compoe
    APPOINTMENTS ||--o{ PAYMENTS : gera
    APPOINTMENTS ||--o{ APPOINTMENT_NOTES : recebe
    APPOINTMENTS ||--o{ APPOINTMENT_STATUS_HISTORY : registra

    USERS {
        int id PK
        string name
        string email UK
        string cpf UK
        string password
        enum accountType
        enum role
        boolean active
        string avatarUrl
    }
    CLIENTS {
        int id PK
        int userId FK
        string name
        string email
        string phone
        string cpf
        text notes
    }
    SERVICES {
        int id PK
        int userId FK
        string name
        int durationMinutes
        decimal price
    }
    PROFESSIONALS {
        int id PK
        int userId FK
        string name
        string email
        string phone
    }
    PROFESSIONAL_WORK_DAYS {
        int id PK
        int professionalId FK
        int weekday
        time startsAt
        time endsAt
    }
    APPOINTMENTS {
        int id PK
        int userId FK
        int clientId FK
        int serviceId FK
        int professionalId FK
        datetime startsAt
        string status
        text notes
    }
    PERSONAL_EVENTS {
        int id PK
        int userId FK
        string title
        string location
        datetime startsAt
        text notes
    }
    ORGANIZATIONS {
        int id PK
        int ownerUserId FK
        string name
        string slug UK
    }
    LOCATIONS {
        int id PK
        int organizationId FK
        string name
        string timezone
    }
    ROLES {
        int id PK
        int organizationId FK
        string name
    }
    PERMISSIONS {
        int id PK
        string code UK
    }
    ROLE_PERMISSIONS {
        int id PK
        int roleId FK
        int permissionId FK
    }
    MEMBERSHIPS {
        int id PK
        int organizationId FK
        int userId FK
        int roleId FK
    }
    PAYMENTS {
        int id PK
        int appointmentId FK
        decimal amount
        string status
    }
    NOTIFICATIONS {
        int id PK
        int userId FK
        string channel
        string status
    }
    APPOINTMENT_NOTES {
        int id PK
        int appointmentId FK
        text content
    }
    APPOINTMENT_STATUS_HISTORY {
        int id PK
        int appointmentId FK
        string fromStatus
        string toStatus
    }
```

## 2. Caso de uso - operação empresarial

```mermaid
flowchart LR
    Gestor([Gestor empresarial])
    Profissional([Profissional])
    UC1((Autenticar))
    UC2((Gerenciar clientes))
    UC3((Gerenciar agenda))
    UC4((Selecionar serviço))
    UC5((Selecionar profissional))
    UC6((Atualizar perfil e avatar))
    UC7((Consultar atendimentos))

    Gestor --- UC1
    Gestor --- UC2
    Gestor --- UC3
    Gestor --- UC6
    Gestor --- UC7
    Profissional --- UC1
    Profissional --- UC7
    UC3 -. inclui .-> UC4
    UC3 -. inclui .-> UC5
```

## 3. Caso de uso - conta pessoal e administração

```mermaid
flowchart LR
    Pessoal([Usuário pessoal])
    Admin([Administrador])
    UC1((Cadastrar conta pessoal))
    UC2((Autenticar))
    UC3((Gerenciar compromissos))
    UC4((Alternar tema))
    UC5((Enviar avatar))
    UC6((Listar usuários))
    UC7((Alterar papel))
    UC8((Bloquear ou reativar))
    UC9((Excluir usuário))

    Pessoal --- UC1
    Pessoal --- UC2
    Pessoal --- UC3
    Pessoal --- UC4
    Pessoal --- UC5
    Admin --- UC2
    Admin --- UC6
    Admin --- UC7
    Admin --- UC8
    Admin --- UC9
    UC7 -. exige .-> UC6
    UC8 -. exige .-> UC6
    UC9 -. exige .-> UC6
```

## 4. Atividade - cadastrar cliente pelo aplicativo

```mermaid
flowchart TD
    A([Início]) --> B[Usuário abre Clientes]
    B --> C[Toca em Novo cliente]
    C --> D[Preenche os dados]
    D --> E{Validação local aprovada?}
    E -- Não --> F[Exibir erros no formulário]
    F --> D
    E -- Sim --> G[Enviar POST para a API]
    G --> H{Token e dados válidos?}
    H -- Não --> I[API retorna erro sem persistir]
    I --> J[Aplicativo exibe mensagem]
    J --> D
    H -- Sim --> K[Persistir cliente no banco]
    K --> L[Retornar cliente criado]
    L --> M[Atualizar listagem]
    M --> N([Fim])
```

## 5. Atividade - enviar foto de perfil

```mermaid
flowchart TD
    A([Início]) --> B[Usuário abre Perfil]
    B --> C[Seleciona imagem na galeria]
    C --> D[Aplicativo solicita permissão]
    D --> E{Permissão concedida?}
    E -- Não --> F[Informar que o acesso é necessário]
    F --> Z([Fim])
    E -- Sim --> G[Recortar e preparar imagem]
    G --> H[Enviar multipart para a API]
    H --> I{Extensão e MIME compatíveis?}
    I -- Não --> J[Rejeitar com HTTP 400]
    I -- Sim --> K{Tamanho até 5 MB?}
    K -- Não --> L[Rejeitar com HTTP 413]
    K -- Sim --> M[Gerar nome com timestamp e UUID]
    M --> N[Salvar arquivo com Multer]
    N --> O[Atualizar avatarUrl no banco]
    O --> P[Exibir nova foto]
    J --> Z
    L --> Z
    P --> Z
```

## 6. Sequência - autenticação e autorização administrativa

```mermaid
sequenceDiagram
    actor U as Usuário
    participant A as Aplicativo Expo
    participant API as API Express
    participant DB as Banco de dados

    U->>A: Informa e-mail, senha e tipo de conta
    A->>API: POST /api/auth/login
    API->>DB: Buscar usuário por e-mail
    DB-->>API: Usuário, hash, tipo, papel e status
    API->>API: Validar senha, tipo e conta ativa
    alt credenciais inválidas
        API-->>A: 401 ou 403 + mensagem
        A-->>U: Exibe erro
    else credenciais válidas
        API->>API: Gerar JWT com papel
        API-->>A: Token e usuário
        A->>A: Salvar token no SecureStore
        A-->>U: Abrir agenda
        opt acesso ao painel Admin
            A->>API: GET /api/admin/users + Bearer token
            API->>DB: Revalidar papel e status atuais
            DB-->>API: Usuário administrador ativo
            API-->>A: Lista de usuários
        end
    end
```

## 7. Sequência - CRUD completo de clientes

```mermaid
sequenceDiagram
    actor G as Gestor
    participant APP as Aplicativo Expo
    participant API as API Express
    participant S as Serviço de clientes
    participant DB as MySQL/PostgreSQL

    G->>APP: Cadastrar cliente
    APP->>APP: Validar campos
    APP->>API: POST /api/clients
    API->>S: Criar cliente do usuário autenticado
    S->>DB: INSERT
    DB-->>S: Cliente persistido
    S-->>API: DTO do cliente
    API-->>APP: 201 Created
    APP-->>G: Atualizar listagem

    G->>APP: Editar cliente
    APP->>API: PUT /api/clients/:id
    API->>S: Validar propriedade e atualizar
    S->>DB: UPDATE por id e userId
    DB-->>APP: 200 OK via API

    G->>APP: Excluir cliente
    APP->>API: DELETE /api/clients/:id
    API->>S: Validar propriedade e excluir
    S->>DB: DELETE por id e userId
    DB-->>APP: 200 OK via API
    APP-->>G: Remover item da listagem
```

## 8. Rastreabilidade dos diagramas

| Exigência | Diagramas apresentados |
| --- | --- |
| Diagrama entidade-relacionamento | Seção 1 |
| Dois casos de uso | Seções 2 e 3 |
| Dois diagramas de atividades | Seções 4 e 5 |
| Dois diagramas de sequência | Seções 6 e 7 |
