import { Op } from "sequelize";

import { env } from "../../../config/env";
import {
  CreateProfessionalRequestDto,
  ProfessionalWorkDayDto,
  ProfessionalWorkDayInputDto,
  ProfessionalDto,
  UpdateProfessionalRequestDto,
} from "../dtos/professional.dto";
import { ProfessionalModel } from "../models/professional.model";
import { ProfessionalWorkDayModel } from "../models/professional-work-day.model";
import { ListProfessionalsRepositoryResult, ProfessionalRepository } from "./professional.repository";
import { buildTenantOwnership, buildTenantWhere, getActiveOrganizationId } from "../../../shared/data/tenant-scope";
import { database } from "../../../config/database";
import { UserModel } from "../../auth/models/user.model";

type ListProfessionalsInput = {
  page: number;
  limit: number;
  search: string;
};

export class SequelizeProfessionalRepository implements ProfessionalRepository {
  public async findById(userId: number, id: number): Promise<ProfessionalDto | null> {
    const professional = await ProfessionalModel.findOne({
      where: {
        id,
        ...buildTenantWhere(userId),
      },
    });

    if (!professional) {
      return null;
    }

    return this.toProfessionalDto(professional);
  }

  public async findWorkDaysByProfessionalId(
    userId: number,
    professionalId: number,
  ): Promise<ProfessionalWorkDayDto[] | null> {
    const professional = await ProfessionalModel.findOne({
      where: {
        id: professionalId,
        ...buildTenantWhere(userId),
      },
    });

    if (!professional) {
      return null;
    }

    const workDays = await ProfessionalWorkDayModel.findAll({
      where: {
        professionalId,
      },
      order: [["id", "ASC"]],
    });

    return workDays.map((workDay) => this.toProfessionalWorkDayDto(workDay));
  }

  public async list(userId: number, query: ListProfessionalsInput): Promise<ListProfessionalsRepositoryResult> {
    const page = Math.max(1, query.page);
    const limit = Math.max(1, query.limit);
    const search = query.search.trim().toLowerCase();
    const likeOperator = env.database.dialect === "mysql" ? Op.like : Op.iLike;

    const { rows, count } = await ProfessionalModel.findAndCountAll({
      where: {
        ...buildTenantWhere(userId),
        ...(search
          ? {
              [Op.or]: [
                {
                  name: {
                    [likeOperator]: `%${search}%`,
                  },
                },
                {
                  email: {
                    [likeOperator]: `%${search}%`,
                  },
                },
                {
                  phone: {
                    [likeOperator]: `%${search}%`,
                  },
                },
                {
                  specialty: {
                    [likeOperator]: `%${search}%`,
                  },
                },
                {
                  status: {
                    [likeOperator]: `%${search}%`,
                  },
                },
              ],
            }
          : {}),
      },
      limit,
      offset: (page - 1) * limit,
      order: [["createdAt", "DESC"]],
    });

    return {
      professionals: rows.map((professional) => this.toProfessionalDto(professional)),
      totalItems: count,
    };
  }

  public async create(userId: number, input: CreateProfessionalRequestDto): Promise<ProfessionalDto> {
    const professional = await ProfessionalModel.create({
      ...buildTenantOwnership(userId),
      membershipId: await this.resolveMembershipId(input.email),
      name: input.name,
      email: input.email,
      phone: input.phone,
      specialty: input.specialty,
      status: input.status,
    });

    return this.toProfessionalDto(professional);
  }

  public async update(
    userId: number,
    id: number,
    input: UpdateProfessionalRequestDto,
  ): Promise<ProfessionalDto | null> {
    const professional = await ProfessionalModel.findOne({
      where: {
        id,
        ...buildTenantWhere(userId),
      },
    });

    if (!professional) {
      return null;
    }

    professional.name = input.name;
    professional.email = input.email;
    professional.phone = input.phone;
    professional.specialty = input.specialty;
    professional.status = input.status;
    professional.membershipId = await this.resolveMembershipId(input.email);

    await professional.save();

    return this.toProfessionalDto(professional);
  }

  public async replaceWorkDays(
    userId: number,
    professionalId: number,
    workDays: ProfessionalWorkDayInputDto[],
  ): Promise<ProfessionalWorkDayDto[] | null> {
    const professional = await ProfessionalModel.findOne({
      where: {
        id: professionalId,
        ...buildTenantWhere(userId),
      },
    });

    if (!professional) {
      return null;
    }

    const sequelize = ProfessionalModel.sequelize;

    if (!sequelize) {
      throw new Error("Professional model is not connected to Sequelize.");
    }

    await sequelize.transaction(async (transaction) => {
      await ProfessionalWorkDayModel.destroy({
        where: {
          professionalId,
        },
        transaction,
      });

      if (workDays.length === 0) {
        return;
      }

      await ProfessionalWorkDayModel.bulkCreate(
        workDays.map((workDay) => ({
          professionalId,
          dayOfWeek: workDay.dayOfWeek,
          enabled: workDay.enabled,
          startTime: workDay.startTime,
          endTime: workDay.endTime,
          breakStart: workDay.breakStart ?? null,
          breakEnd: workDay.breakEnd ?? null,
        })),
        {
          transaction,
        },
      );
    });

    const savedWorkDays = await ProfessionalWorkDayModel.findAll({
      where: {
        professionalId,
      },
      order: [["id", "ASC"]],
    });

    return savedWorkDays.map((workDay) => this.toProfessionalWorkDayDto(workDay));
  }

  public async delete(userId: number, id: number): Promise<boolean> {
    const deletedCount = await ProfessionalModel.destroy({
      where: {
        id,
        ...buildTenantWhere(userId),
      },
    });

    return deletedCount > 0;
  }

  private toProfessionalDto(professional: ProfessionalModel): ProfessionalDto {
    return {
      id: professional.id,
      name: professional.name,
      email: professional.email,
      phone: professional.phone,
      specialty: professional.specialty,
      status: professional.status,
    };
  }

  private toProfessionalWorkDayDto(workDay: ProfessionalWorkDayModel): ProfessionalWorkDayDto {
    return {
      id: workDay.id,
      professionalId: workDay.professionalId,
      dayOfWeek: workDay.dayOfWeek,
      enabled: workDay.enabled,
      startTime: workDay.startTime,
      endTime: workDay.endTime,
      breakStart: workDay.breakStart,
      breakEnd: workDay.breakEnd,
    };
  }

  private async resolveMembershipId(email: string): Promise<number | null> {
    const organizationId = getActiveOrganizationId();
    if (!organizationId) return null;
    const user = await UserModel.findOne({ where: { email: email.trim().toLowerCase(), active: true } });
    if (!user) return null;
    const Membership = database.getConnection().models.Membership;
    const membership = await Membership?.findOne({ where: { organizationId, userId: user.id, status: "active" } });
    return membership ? Number(membership.get("id")) : null;
  }
}
