# Arquitetura de produto do Schedra

## Direção

O Schedra é uma plataforma de operação e agenda para negócios de serviços. O frontend web continua em React e o futuro aplicativo deve usar React Native com Expo, consumindo a mesma API REST e os mesmos contratos de domínio.

## Identidade visual

| Token | Valor | Uso |
| --- | --- | --- |
| Ink | `#181A20` | Texto e hierarquia principal |
| Canvas | `#F3F3F5` | Fundo da aplicação |
| Framboesa | `#A72C53` | Ações, navegação e estados ativos |
| Lime | `#D7F75B` | Disponibilidade, confirmação e assinatura da marca |
| Coral | `#FF7051` | Prioridade e comunicação |
| Amber | `#F2B84B` | Atenção e indicadores |
| Verde mineral | `#2F8F89` | Categorias e visualizações complementares |
| Charcoal | `#202126` | Navegação lateral e superfícies de contraste |

Os valores exportados em `Frontend-Horarius/src/app/config/brand.ts` são a fonte compartilhável para uma futura biblioteca de design usada pelo app Expo.

Oswald Medium define a hierarquia de títulos e Roboto atende textos, formulários e controles. As fontes são empacotadas localmente no frontend. Os temas claro e escuro usam os mesmos tokens semânticos e a preferência fica persistida no navegador.

## Modelo de dados

O banco passa a ter 30 tabelas: 6 tabelas operacionais existentes e 24 tabelas de plataforma.

### Núcleo existente

`users`, `clients`, `services`, `professionals`, `professional_work_days` e `appointments`.

### Organização e acesso

`organizations`, `locations`, `memberships`, `roles`, `permissions` e `role_permissions`.

### Catálogo e capacidade

`service_categories`, `professional_services`, `rooms`, `resources`, `appointment_resources` e `professional_time_off`.

### Jornada do cliente

`client_addresses`, `client_preferences`, `appointment_status_history`, `appointment_notes` e `waitlist_entries`.

### Financeiro, segurança e mobile

`payment_methods`, `payments`, `invoices`, `coupons`, `notifications`, `audit_logs` e `device_tokens`.

## Preparação para Expo

- A API permanece como fonte única de dados.
- Cores e marca já estão isoladas em TypeScript.
- `device_tokens` suporta push notifications por dispositivo.
- `memberships`, `roles` e `permissions` permitem sessões com escopos adequados no app.
- `locations` prepara seleção e troca de unidade.
- Nenhuma regra de negócio foi movida para componentes visuais.
