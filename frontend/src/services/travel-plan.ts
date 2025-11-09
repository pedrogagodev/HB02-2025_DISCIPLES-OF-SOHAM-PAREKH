import api from '../axios';
import type {
  CreateTravelPlanRequest,
  UpdateTravelPlanRequest,
  TravelPlanResponse,
  TravelPlansListResponse,
} from './types/travel-plan.types';
import type { TravelPlanFilters } from './types/api.types';
import type { TravelPlanApiResponse } from './types/travel-plan.types';

class TravelPlanService {
  private readonly baseUrl = '/api/travel-plans';

  /**
   * Create a new travel plan
   */
  async createTravelPlan(data: CreateTravelPlanRequest): Promise<TravelPlanResponse> {
    try {
      const response = await api.post<TravelPlanApiResponse<TravelPlanResponse>>(
        this.baseUrl,
        data
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error creating travel plan');
      }
      
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error creating travel plan'
      );
    }
  }

  /**
   * Get all travel plans for the user
   */
  async getTravelPlans(filters?: TravelPlanFilters): Promise<TravelPlansListResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (value instanceof Date) {
              params.append(key, value.toISOString());
            } else {
              params.append(key, String(value));
            }
          }
        });
      }

      const response = await api.get<TravelPlanApiResponse<TravelPlansListResponse>>(
        `${this.baseUrl}?${params.toString()}`
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error getting travel plans');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Error getting travel plans:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error getting travel plans'
      );
    }
  }

  /**
   * Get a specific travel plan by ID
   */
  async getTravelPlan(id: string): Promise<TravelPlanResponse> {
    try {
      const response = await api.get<TravelPlanApiResponse<TravelPlanResponse>>(
        `${this.baseUrl}/${id}`
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error getting travel plan');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Error getting travel plan:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error getting travel plan'
      );
    }
  }

  /**
   * Update a travel plan
   */
  async updateTravelPlan(id: string, data: UpdateTravelPlanRequest): Promise<TravelPlanResponse> {
    try {
      const response = await api.put<TravelPlanApiResponse<TravelPlanResponse>>(
        `${this.baseUrl}/${id}`,
        data
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error updating travel plan');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Error updating travel plan:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error updating travel plan'
      );
    }
  }

  /**
   * Delete a travel plan
   */
  async deleteTravelPlan(id: string): Promise<void> {
    try {
      const response = await api.delete<TravelPlanApiResponse<void>>(`${this.baseUrl}/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error deleting travel plan');
      }
    } catch (error: any) {
      console.error('Error deleting travel plan:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error deleting travel plan'
      );
    }
  }
}

export const travelPlanService = new TravelPlanService(); 