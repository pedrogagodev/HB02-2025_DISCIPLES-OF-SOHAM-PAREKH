import { Request, Response } from "express";
import { TravelPlanService } from "../../services/travel-plan";
import { createTravelPlanSchema } from "../../schemas/travel-plan";
import { getAuth } from "@clerk/express";
import { ErrorHandler } from "../../utils/error-handler";

export class TravelPlanController {
  constructor(private travelPlanService: TravelPlanService) { }

  async createPlan(req: Request, res: Response): Promise<void> {
    try {
      const validationResult = createTravelPlanSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: "Invalid data",
          message: "Invalid data",
          details: validationResult.error.errors,
        });
        return;
      }

      const { userId } = getAuth(req);
      if (!userId) {
        res.status(401).json({ 
          success: false,
          error: "User not authenticated",
          message: "User not authenticated"
        });
        return;
      }

      const result = await this.travelPlanService.createTravelPlan(
        userId,
        validationResult.data
      );

      res.status(201).json({
        success: true,
        data: result,
        message: 'Travel plan created successfully'
      });
    } catch (error) {
      ErrorHandler.handle(error, res, 'create plan', req);
    }
  }

  async getUserPlans(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = getAuth(req);
      if (!userId) {
        res.status(401).json({ 
          success: false,
          error: "User not authenticated",
          message: "User not authenticated"
        });
        return;
      }

      const plans = await this.travelPlanService.getUserTravelPlans(userId);
      res.json({
        success: true,
        data: {
          travelPlans: plans,
          total: plans.length,
          page: 1,
          limit: plans.length
        },
        message: 'Travel plans retrieved successfully'
      });
    } catch (error) {
      ErrorHandler.handle(error, res, 'get user plans', req);
    }
  }

  async getPlanById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { userId } = getAuth(req);

      if (!userId) {
        res.status(401).json({ 
          success: false,
          error: "User not authenticated",
          message: "User not authenticated"
        });
        return;
      }

      const plan = await this.travelPlanService.getTravelPlanById(id, userId);

      if (!plan) {
        res.status(404).json({ 
          success: false,
          error: "Plan not found",
          message: "Plan not found"
        });
        return;
      }

      res.json({
        success: true,
        data: plan,
        message: 'Travel plan retrieved successfully'
      });
    } catch (error) {
      ErrorHandler.handle(error, res, 'get plan by id', req);
    }
  }

  async updatePlan(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { userId } = getAuth(req);

      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const result = await this.travelPlanService.updateTravelPlan(id, userId, req.body);
      res.json({
        success: true,
        data: result,
        message: 'Travel plan updated successfully'
      });
    } catch (error) {
      ErrorHandler.handle(error, res, 'update plan', req);
    }
  }

  async deletePlan(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { userId } = getAuth(req);

      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      await this.travelPlanService.deleteTravelPlan(id, userId);
      res.status(200).json({
        success: true,
        data: null,
        message: 'Travel plan deleted successfully'
      });
    } catch (error) {
      ErrorHandler.handle(error, res, 'delete plan', req);
    }
  }
}
