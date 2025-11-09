import { TravelPlanRepository } from "../repositories/travel-plan";
import { GeminiService } from "./ai/gemini";
import {
  TravelPlanRequest,
  VacationResponse,
  RelocationResponse,
  TravelPlanEntity
} from "../interfaces/travel-plan";

export class TravelPlanService {
  constructor(
    private travelPlanRepository: TravelPlanRepository,
    private geminiService: GeminiService
  ) {}

  async createTravelPlan(
    userId: string,
    request: TravelPlanRequest
  ): Promise<VacationResponse | RelocationResponse> {
    try {
      const startTime = Date.now();
      let structuredData: any;
      
      if (request.type === 'VACATION') {
        structuredData = await this.geminiService.generateVacationPlan(
          request.destination,
          request.days || 7,
          request.budgetLevel
        );
      } else {
        structuredData = await this.geminiService.generateRelocationPlan(
          request.destination
        );
      }

      const generationTime = Date.now() - startTime;
      
      // Obtém o modelo que foi realmente usado (pode ter mudado devido ao fallback)
      const modelUsed = this.geminiService.getCurrentModel();

      const savedPlan = await this.travelPlanRepository.create({
        clerkUserId: userId,
        destination: request.destination,
        type: request.type,
        budgetLevel: request.budgetLevel,
        days: request.days,
        budget: request.budget,
        itinerary: structuredData,
        costSummary: structuredData.costs || structuredData.costOfLiving,
        additionalInfo: { 
          model: modelUsed,
          sdk: "@google/generative-ai",
          generationTime,
        },
      });

      return this.formatResponse(savedPlan, structuredData, request);
    } catch (error) {
      console.error("Error creating travel plan:", error);
      throw error;
    }
  }

  async getUserTravelPlans(userId: string): Promise<TravelPlanEntity[]> {
    return this.travelPlanRepository.findByUserId(userId);
  }

  async getTravelPlanById(id: string, userId: string): Promise<VacationResponse | RelocationResponse | null> {
    const plan = await this.travelPlanRepository.findByIdAndUserId(id, userId);
    if (!plan) return null;
    return this.formatResponseFromEntity(plan);
  }

  async updateTravelPlan(id: string, userId: string, updates: Partial<TravelPlanEntity>): Promise<TravelPlanEntity> {
    return this.travelPlanRepository.updateByIdAndUserId(id, userId, updates);
  }

  async deleteTravelPlan(id: string, userId: string): Promise<void> {
    const exists = await this.travelPlanRepository.existsByIdAndUserId(id, userId);
    if (!exists) {
      throw new Error("Travel plan not found or access denied");
    }
    await this.travelPlanRepository.deleteByIdAndUserId(id, userId);
  }

  private formatResponse(
    savedPlan: TravelPlanEntity,
    structuredData: any,
    request: TravelPlanRequest
  ): VacationResponse | RelocationResponse {
    const baseResponse = {
      id: savedPlan.id,
      destination: request.destination,
      type: request.type,
      budgetLevel: request.budgetLevel,
      ...structuredData,
      metadata: {
        generatedAt: savedPlan.createdAt,
      },
    };

    if (request.type === 'VACATION') {
      return {
        ...baseResponse,
        days: request.days!,
        metadata: {
          ...baseResponse.metadata,
          estimatedTotalCost: this.calculateEstimatedCost(structuredData, request.days),
        },
      } as VacationResponse;
    } else {
      return baseResponse as RelocationResponse;
    }
  }

  private formatResponseFromEntity(plan: TravelPlanEntity): VacationResponse | RelocationResponse {
    const baseResponse = {
      id: plan.id,
      destination: plan.destination,
      type: plan.type,
      budgetLevel: plan.budgetLevel,
      ...(plan.itinerary || {}),
      metadata: {
        generatedAt: plan.createdAt,
      },
    };

    if (plan.type === 'VACATION') {
      return {
        ...baseResponse,
        days: plan.days!,
        metadata: {
          ...baseResponse.metadata,
          estimatedTotalCost: this.calculateEstimatedCost(plan.itinerary, plan.days),
        },
      } as VacationResponse;
    } else {
      return baseResponse as RelocationResponse;
    }
  }

  private calculateEstimatedCost(data: any, days?: number): number | undefined {
    if (!days || !data?.costs?.totalDaily) return undefined;
    const avgCost = (data.costs.totalDaily.min + data.costs.totalDaily.max) / 2;
    return Math.round(avgCost * days);
  }
}
