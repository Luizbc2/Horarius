import { DataTypes, Model, type ModelStatic, type Sequelize } from "sequelize";

type PlatformModelDefinition = {
  modelName: string;
  tableName: string;
  purpose: string;
  attributes: Record<string, unknown>;
  indexes?: Array<{ unique?: boolean; fields: string[] }>;
};

const id = () => ({
  type: DataTypes.INTEGER,
  autoIncrement: true,
  primaryKey: true,
});

const foreignKey = (tableName: string, allowNull = false) => ({
  type: DataTypes.INTEGER,
  allowNull,
  references: { model: tableName, key: "id" },
  onUpdate: "CASCADE",
  onDelete: allowNull ? "SET NULL" : "CASCADE",
});

const definitions: PlatformModelDefinition[] = [
  {
    modelName: "Organization",
    tableName: "organizations",
    purpose: "Dados da empresa e isolamento entre operações.",
    attributes: {
      id: id(), ownerUserId: foreignKey("users"), name: { type: DataTypes.STRING, allowNull: false },
      slug: { type: DataTypes.STRING, allowNull: false, unique: true }, status: { type: DataTypes.STRING, allowNull: false, defaultValue: "active" },
    },
  },
  {
    modelName: "Location",
    tableName: "locations",
    purpose: "Unidades físicas de uma organização.",
    attributes: {
      id: id(), organizationId: foreignKey("organizations"), name: { type: DataTypes.STRING, allowNull: false },
      timezone: { type: DataTypes.STRING, allowNull: false, defaultValue: "America/Sao_Paulo" }, phone: { type: DataTypes.STRING, allowNull: true },
      addressLine: { type: DataTypes.STRING, allowNull: true }, city: { type: DataTypes.STRING, allowNull: true }, state: { type: DataTypes.STRING(2), allowNull: true },
    },
  },
  {
    modelName: "Role",
    tableName: "roles",
    purpose: "Papéis de acesso configuráveis.",
    attributes: {
      id: id(), organizationId: foreignKey("organizations"), name: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.STRING, allowNull: true }, isSystem: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
    indexes: [{ unique: true, fields: ["organizationId", "name"] }],
  },
  {
    modelName: "Permission",
    tableName: "permissions",
    purpose: "Permissões atômicas disponíveis no sistema.",
    attributes: {
      id: id(), code: { type: DataTypes.STRING, allowNull: false, unique: true }, description: { type: DataTypes.STRING, allowNull: false },
    },
  },
  {
    modelName: "RolePermission",
    tableName: "role_permissions",
    purpose: "Relação entre papéis e permissões.",
    attributes: { id: id(), roleId: foreignKey("roles"), permissionId: foreignKey("permissions") },
    indexes: [{ unique: true, fields: ["roleId", "permissionId"] }],
  },
  {
    modelName: "Membership",
    tableName: "memberships",
    purpose: "Vínculo de usuários com organizações, unidades e papéis.",
    attributes: {
      id: id(), organizationId: foreignKey("organizations"), userId: foreignKey("users"), roleId: foreignKey("roles"),
      locationId: foreignKey("locations", true), status: { type: DataTypes.STRING, allowNull: false, defaultValue: "active" },
    },
    indexes: [{ unique: true, fields: ["organizationId", "userId"] }],
  },
  {
    modelName: "ServiceCategory",
    tableName: "service_categories",
    purpose: "Categorias usadas para organizar o catálogo.",
    attributes: {
      id: id(), userId: foreignKey("users"), name: { type: DataTypes.STRING, allowNull: false }, color: { type: DataTypes.STRING(7), allowNull: true },
    },
    indexes: [{ unique: true, fields: ["userId", "name"] }],
  },
  {
    modelName: "ProfessionalService",
    tableName: "professional_services",
    purpose: "Serviços executados por cada profissional.",
    attributes: {
      id: id(), professionalId: foreignKey("professionals"), serviceId: foreignKey("services"),
      customDurationMinutes: { type: DataTypes.INTEGER, allowNull: true }, customPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    },
    indexes: [{ unique: true, fields: ["professionalId", "serviceId"] }],
  },
  {
    modelName: "ClientAddress",
    tableName: "client_addresses",
    purpose: "Endereços de clientes para atendimento e cobrança.",
    attributes: {
      id: id(), clientId: foreignKey("clients"), label: { type: DataTypes.STRING, allowNull: false, defaultValue: "principal" },
      postalCode: { type: DataTypes.STRING(9), allowNull: true }, street: { type: DataTypes.STRING, allowNull: false }, number: { type: DataTypes.STRING, allowNull: true },
      complement: { type: DataTypes.STRING, allowNull: true }, city: { type: DataTypes.STRING, allowNull: false }, state: { type: DataTypes.STRING(2), allowNull: false },
    },
  },
  {
    modelName: "ClientPreference",
    tableName: "client_preferences",
    purpose: "Preferências de contato e atendimento do cliente.",
    attributes: {
      id: id(), clientId: foreignKey("clients"), contactChannel: { type: DataTypes.STRING, allowNull: false, defaultValue: "whatsapp" },
      acceptsMarketing: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }, reminderHours: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 24 },
    },
  },
  {
    modelName: "Room",
    tableName: "rooms",
    purpose: "Salas e espaços reserváveis por unidade.",
    attributes: {
      id: id(), locationId: foreignKey("locations"), name: { type: DataTypes.STRING, allowNull: false }, capacity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
  },
  {
    modelName: "Resource",
    tableName: "resources",
    purpose: "Equipamentos e recursos compartilhados.",
    attributes: {
      id: id(), locationId: foreignKey("locations"), name: { type: DataTypes.STRING, allowNull: false },
      quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 }, active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
  },
  {
    modelName: "AppointmentResource",
    tableName: "appointment_resources",
    purpose: "Recursos reservados para um agendamento.",
    attributes: { id: id(), appointmentId: foreignKey("appointments"), resourceId: foreignKey("resources"), quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 } },
    indexes: [{ unique: true, fields: ["appointmentId", "resourceId"] }],
  },
  {
    modelName: "AppointmentStatusHistory",
    tableName: "appointment_status_history",
    purpose: "Linha do tempo de alterações de status.",
    attributes: {
      id: id(), appointmentId: foreignKey("appointments"), changedByUserId: foreignKey("users", true),
      fromStatus: { type: DataTypes.STRING, allowNull: true }, toStatus: { type: DataTypes.STRING, allowNull: false }, reason: { type: DataTypes.STRING, allowNull: true },
    },
  },
  {
    modelName: "AppointmentNote",
    tableName: "appointment_notes",
    purpose: "Notas internas e observações do atendimento.",
    attributes: {
      id: id(), appointmentId: foreignKey("appointments"), authorUserId: foreignKey("users", true),
      content: { type: DataTypes.TEXT, allowNull: false }, visibility: { type: DataTypes.STRING, allowNull: false, defaultValue: "internal" },
    },
  },
  {
    modelName: "PaymentMethod",
    tableName: "payment_methods",
    purpose: "Formas de pagamento aceitas por organização.",
    attributes: {
      id: id(), organizationId: foreignKey("organizations"), name: { type: DataTypes.STRING, allowNull: false },
      type: { type: DataTypes.STRING, allowNull: false }, active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
  },
  {
    modelName: "Payment",
    tableName: "payments",
    purpose: "Pagamentos vinculados a atendimentos.",
    attributes: {
      id: id(), appointmentId: foreignKey("appointments"), paymentMethodId: foreignKey("payment_methods", true),
      amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, status: { type: DataTypes.STRING, allowNull: false, defaultValue: "pending" },
      paidAt: { type: DataTypes.DATE, allowNull: true }, externalReference: { type: DataTypes.STRING, allowNull: true },
    },
  },
  {
    modelName: "Invoice",
    tableName: "invoices",
    purpose: "Comprovantes e documentos financeiros.",
    attributes: {
      id: id(), paymentId: foreignKey("payments"), number: { type: DataTypes.STRING, allowNull: false, unique: true },
      status: { type: DataTypes.STRING, allowNull: false, defaultValue: "issued" }, issuedAt: { type: DataTypes.DATE, allowNull: false }, url: { type: DataTypes.TEXT, allowNull: true },
    },
  },
  {
    modelName: "Coupon",
    tableName: "coupons",
    purpose: "Cupons e campanhas promocionais.",
    attributes: {
      id: id(), organizationId: foreignKey("organizations"), code: { type: DataTypes.STRING, allowNull: false },
      discountType: { type: DataTypes.STRING, allowNull: false }, discountValue: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      startsAt: { type: DataTypes.DATE, allowNull: true }, endsAt: { type: DataTypes.DATE, allowNull: true }, active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    indexes: [{ unique: true, fields: ["organizationId", "code"] }],
  },
  {
    modelName: "Notification",
    tableName: "notifications",
    purpose: "Notificações transacionais e operacionais.",
    attributes: {
      id: id(), userId: foreignKey("users"), channel: { type: DataTypes.STRING, allowNull: false }, type: { type: DataTypes.STRING, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false }, content: { type: DataTypes.TEXT, allowNull: false }, status: { type: DataTypes.STRING, allowNull: false, defaultValue: "pending" }, sentAt: { type: DataTypes.DATE, allowNull: true },
    },
  },
  {
    modelName: "AuditLog",
    tableName: "audit_logs",
    purpose: "Rastro de segurança para ações sensíveis.",
    attributes: {
      id: id(), organizationId: foreignKey("organizations"), userId: foreignKey("users", true), action: { type: DataTypes.STRING, allowNull: false },
      entityType: { type: DataTypes.STRING, allowNull: false }, entityId: { type: DataTypes.STRING, allowNull: true }, metadata: { type: DataTypes.JSON, allowNull: true }, ipAddress: { type: DataTypes.STRING, allowNull: true },
    },
  },
  {
    modelName: "WaitlistEntry",
    tableName: "waitlist_entries",
    purpose: "Fila de espera para horários indisponíveis.",
    attributes: {
      id: id(), userId: foreignKey("users"), clientId: foreignKey("clients"), serviceId: foreignKey("services", true), professionalId: foreignKey("professionals", true),
      preferredDate: { type: DataTypes.DATEONLY, allowNull: false }, period: { type: DataTypes.STRING, allowNull: true }, status: { type: DataTypes.STRING, allowNull: false, defaultValue: "waiting" },
    },
  },
  {
    modelName: "ProfessionalTimeOff",
    tableName: "professional_time_off",
    purpose: "Férias, bloqueios e ausências profissionais.",
    attributes: {
      id: id(), professionalId: foreignKey("professionals"), startsAt: { type: DataTypes.DATE, allowNull: false },
      endsAt: { type: DataTypes.DATE, allowNull: false }, reason: { type: DataTypes.STRING, allowNull: true }, allDay: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
  },
  {
    modelName: "DeviceToken",
    tableName: "device_tokens",
    purpose: "Dispositivos autorizados para notificações do app.",
    attributes: {
      id: id(), userId: foreignKey("users"), platform: { type: DataTypes.STRING, allowNull: false }, token: { type: DataTypes.STRING(512), allowNull: false, unique: true },
      lastSeenAt: { type: DataTypes.DATE, allowNull: false }, active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
  },
];

export const PLATFORM_TABLES = definitions.map(({ tableName, purpose }) => ({ tableName, purpose }));

export const initializePlatformModels = (sequelize: Sequelize): Record<string, ModelStatic<Model>> => {
  return Object.fromEntries(
    definitions.map((definition) => {
      const model = sequelize.define(
        definition.modelName,
        definition.attributes as never,
        {
          tableName: definition.tableName,
          timestamps: true,
          indexes: definition.indexes,
        },
      );

      return [definition.modelName, model];
    }),
  );
};
