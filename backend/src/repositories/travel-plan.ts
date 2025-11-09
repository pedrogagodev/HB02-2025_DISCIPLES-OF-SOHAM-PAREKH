import { PrismaClient } from "../generated/client";
import { TravelPlanEntity, TravelPlanRequest } from "../interfaces/travel-plan";

export class TravelPlanRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: {
    clerkUserId: string;
    destination: string;
    type: 'VACATION' | 'RELOCATION';
    budgetLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    days?: number;
    budget?: number;
    itinerary: any;
    costSummary?: any;
    additionalInfo?: any;
  }): Promise<TravelPlanEntity> {
    return this.prisma.travelPlan.create({
      data: {
        clerkUserId: data.clerkUserId,
        destination: data.destination,
        type: data.type,
        budgetLevel: data.budgetLevel,
        days: data.days,
        budget: data.budget,
        itinerary: data.itinerary,
        costSummary: data.costSummary,
        additionalInfo: data.additionalInfo,
      },
    });
  }

  async findByUserId(clerkUserId: string): Promise<TravelPlanEntity[]> {
    return this.prisma.travelPlan.findMany({
      where: { clerkUserId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        destination: true,
        type: true,
        budgetLevel: true,
        days: true,
        createdAt: true,
        updatedAt: true,
        clerkUserId: true,
        budget: true,
        costSummary: true,
        additionalInfo: false,
        itinerary: false,
      },
    });
  }

  async findByIdAndUserId(id: string, clerkUserId: string): Promise<TravelPlanEntity | null> {
    return this.prisma.travelPlan.findFirst({
      where: { id, clerkUserId },
    });
  }

  async updateByIdAndUserId(
    id: string, 
    clerkUserId: string, 
    data: Partial<TravelPlanRequest>
  ): Promise<TravelPlanEntity> {
    return this.prisma.travelPlan.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async deleteByIdAndUserId(id: string, clerkUserId: string): Promise<TravelPlanEntity> {
    return this.prisma.travelPlan.delete({
      where: { id, clerkUserId },
    });
  }

  async existsByIdAndUserId(id: string, clerkUserId: string): Promise<boolean> {
    const plan = await this.prisma.travelPlan.findFirst({
      where: { id, clerkUserId },
      select: { id: true },
    });
    return !!plan;
  }
}
