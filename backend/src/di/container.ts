import { TravelPlanRepository } from "../repositories/travel-plan";
import { TravelPlanService } from "../services/travel-plan";
import { TravelPlanController } from "../http/controllers/travel-plan";
import { PrismaClient } from "../generated/client";
import { GeminiService } from "../services/ai/gemini";

export class DIContainer {
  private static instance: DIContainer;
  private prisma: PrismaClient;
  private travelPlanRepository: TravelPlanRepository;
  private geminiService: GeminiService;
  private travelPlanService: TravelPlanService;
  private travelPlanController: TravelPlanController;

  private constructor() {
    this.prisma = new PrismaClient();
    this.travelPlanRepository = new TravelPlanRepository(this.prisma);
    this.geminiService = new GeminiService();
    this.travelPlanService = new TravelPlanService(
      this.travelPlanRepository,
      this.geminiService
    );
    this.travelPlanController = new TravelPlanController(this.travelPlanService);
  }

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  getTravelPlanController(): TravelPlanController {
    return this.travelPlanController;
  }
}
