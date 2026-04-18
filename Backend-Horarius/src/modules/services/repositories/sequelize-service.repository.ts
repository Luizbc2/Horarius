import { Op } from "sequelize";

import {
  CreateServiceRequestDto,
  ServiceDto,
  UpdateServiceRequestDto,
} from "../dtos/service.dto";
import { ServiceModel } from "../models/service.model";
import { ListServicesRepositoryResult, ServiceRepository } from "./service.repository";

type ListServicesInput = {
  page: number;
  limit: number;
  search: string;
};

export class SequelizeServiceRepository implements ServiceRepository {
  public async findById(userId: number, id: number): Promise<ServiceDto | null> {
    const service = await ServiceModel.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!service) {
      return null;
    }

    return this.toServiceDto(service);
  }

  public async list(userId: number, query: ListServicesInput): Promise<ListServicesRepositoryResult> {
    const page = Math.max(1, query.page);
    const limit = Math.max(1, query.limit);
    const search = query.search.trim().toLowerCase();

    const { rows, count } = await ServiceModel.findAndCountAll({
      where: {
        userId,
        ...(search
          ? {
              [Op.or]: [
                {
                  name: {
                    [Op.iLike]: `%${search}%`,
                  },
                },
                {
                  category: {
                    [Op.iLike]: `%${search}%`,
                  },
                },
                {
                  description: {
                    [Op.iLike]: `%${search}%`,
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
      services: rows.map((service) => this.toServiceDto(service)),
      totalItems: count,
    };
  }

  public async create(userId: number, input: CreateServiceRequestDto): Promise<ServiceDto> {
    const service = await ServiceModel.create({
      userId,
      name: input.name,
      category: input.category,
      durationMinutes: input.durationMinutes,
      price: input.price,
      description: input.description,
    });

    return this.toServiceDto(service);
  }

  public async update(userId: number, id: number, input: UpdateServiceRequestDto): Promise<ServiceDto | null> {
    const service = await ServiceModel.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!service) {
      return null;
    }

    service.name = input.name;
    service.category = input.category;
    service.durationMinutes = input.durationMinutes;
    service.price = input.price;
    service.description = input.description;

    await service.save();

    return this.toServiceDto(service);
  }

  public async delete(userId: number, id: number): Promise<boolean> {
    const deletedCount = await ServiceModel.destroy({
      where: {
        id,
        userId,
      },
    });

    return deletedCount > 0;
  }

  private toServiceDto(service: ServiceModel): ServiceDto {
    return {
      id: service.id,
      name: service.name,
      category: service.category,
      durationMinutes: service.durationMinutes,
      price: Number(service.price),
      description: service.description,
    };
  }
}
