import { GoogleGenerativeAI } from '@google/generative-ai';
import { vacationAIResponseSchema, relocationAIResponseSchema } from '../../schemas/travel-plan';
import { 
  VacationAIResponseData,
  RelocationAIResponseData,
} from '../../interfaces/travel-plan';
import { env } from '../../env';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(env.GOOGLE_API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 4096,
      },
    });
  }

  async generateVacationPlan(
    destination: string, 
    days: number, 
    budgetLevel: string
  ): Promise<VacationAIResponseData> {
    const prompt = this.getVacationPrompt(destination, days, budgetLevel);
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonData = this.parseAndValidateJSON(text, 'vacation');
      
      return jsonData;
    } catch (error) {
      console.error('Error generating vacation plan with Gemini:', error);
      throw new Error('Failed to generate vacation plan');
    }
  }

  async generateRelocationPlan(destination: string): Promise<RelocationAIResponseData> {
    const prompt = this.getRelocationPrompt(destination);
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonData = this.parseAndValidateJSON(text, 'relocation');
      
      return jsonData;
    } catch (error) {
      console.error('Error generating relocation plan with Gemini:', error);
      throw new Error('Failed to generate relocation plan');
    }
  }

  private parseAndValidateJSON(text: string, type: 'vacation' | 'relocation'): any {
    try {
      let cleanText = text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      const jsonStart = cleanText.indexOf('{');
      const jsonEnd = cleanText.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        cleanText = cleanText.slice(jsonStart, jsonEnd + 1);
      }

      const parsed = JSON.parse(cleanText);
      
      if (type === 'relocation') {
        this.fixRelocationDataTypes(parsed);
      }
      
      if (type === 'vacation') {
        this.fixVacationDataTypes(parsed);
        return vacationAIResponseSchema.parse(parsed);
      } else {
        return relocationAIResponseSchema.parse(parsed);
      }
      
    } catch (error) {
      console.error('Failed to parse JSON response:', error);
      console.error('Raw text:', text);
      throw new Error(`Invalid JSON response from Gemini for ${type} plan`);
    }
  }

  private fixRelocationDataTypes(data: any): void {
    if (data.taxation?.socialSecurity?.employeeRate) {
      data.taxation.socialSecurity.employeeRate = this.convertToNumber(data.taxation.socialSecurity.employeeRate);
    }
    if (data.taxation?.socialSecurity?.employerRate) {
      data.taxation.socialSecurity.employerRate = this.convertToNumber(data.taxation.socialSecurity.employerRate);
    }
    
    if (data.jobMarket?.workCulture?.vacationDays) {
      data.jobMarket.workCulture.vacationDays = this.convertToNumber(data.jobMarket.workCulture.vacationDays);
    }
    
    if (data.overview?.population && typeof data.overview.population === 'number') {
      data.overview.population = data.overview.population.toString();
    }
  }

  private fixVacationDataTypes(data: any): void {
    if (data.attractions && Array.isArray(data.attractions)) {
      data.attractions.forEach((attraction: any) => {
        if (attraction.category) {
          const category = attraction.category.toLowerCase();
          if (category.includes('free')) {
            attraction.category = 'free';
          } else if (category.includes('paid')) {
            attraction.category = 'paid';
          } else if (category.includes('optional')) {
            attraction.category = 'optional';
          } else {
            attraction.category = 'paid';
          }
        }
      });
    }
  }

  private convertToNumber(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const cleaned = value.replace(/[^\d.-]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  private getVacationPrompt(destination: string, days: number, budgetLevel: string): string {
    const budgetContext = this.getBudgetContext(budgetLevel);
    
    return `You are an expert travel planner. Create a comprehensive ${days}-day travel plan for ${destination} with a ${budgetLevel} budget.

BUDGET CONTEXT: ${budgetContext}

STRICT REQUIREMENTS:
1. Research current information about ${destination}
2. Create exactly ${days} days in the itinerary
3. All content must be in ENGLISH
4. Return ONLY valid JSON - no additional text, explanations, or markdown
5. Use specific numerical costs (no ranges, use separate min/max)
6. CRITICAL: For attractions category, use ONLY: "free", "paid", or "optional" - no additional text or descriptions

JSON STRUCTURE REQUIRED:
{
  "overview": {
    "climate": "Brief climate description",
    "bestTime": "Best time to visit", 
    "characteristics": "Key destination characteristics"
  },
  "itinerary": [
    {
      "day": 1,
      "morning": {
        "name": "Activity name",
        "location": "Specific location",
        "cost": 0,
        "duration": "2-3 hours",
        "description": "What you'll do"
      },
      "afternoon": {
        "name": "Activity name", 
        "location": "Specific location",
        "cost": 15,
        "duration": "3-4 hours",
        "description": "Activity description"
      },
      "evening": {
        "name": "Activity name",
        "location": "Specific location", 
        "cost": 10,
        "duration": "2 hours",
        "description": "Evening activity"
      },
      "dailyCost": 25,
      "notes": ["Tip 1", "Tip 2"]
    }
  ],
  "costs": {
    "accommodation": { "min": 15, "max": 25, "notes": "Budget options" },
    "food": { "min": 10, "max": 15, "notes": "Local food" },
    "transportation": { "min": 5, "max": 7, "notes": "Public transport" },
    "attractions": { "min": 0, "max": 10, "notes": "Entry fees" },
    "miscellaneous": { "min": 3, "max": 5, "notes": "Extras" },
    "totalDaily": { "min": 33, "max": 62 }
  },
  "attractions": [
    {
      "name": "Attraction name",
      "cost": 0,
      "category": "free",
      "description": "What makes it special",
      "tips": ["Tip 1", "Tip 2"]
    }
  ],
  "tips": [
    {
      "category": "transportation",
      "title": "Getting Around", 
      "content": "How to move efficiently"
    }
  ],
  "comparisons": [
    {
      "destination": "Similar city",
      "dailyBudget": { "min": 25, "max": 40 },
      "notes": "Why it's similar/different"
    }
  ]
}

Create the plan for ${destination} with ${days} days and ${budgetLevel} budget. Return ONLY the JSON object.`;
  }

  private getRelocationPrompt(destination: string): string {
    return `You are an international relocation expert. Create a comprehensive relocation guide for moving to ${destination}.

STRICT REQUIREMENTS:
1. Research current 2024-2025 information about ${destination}
2. All content must be in ENGLISH
3. Return ONLY valid JSON - no additional text, explanations, or markdown
4. Provide specific numerical data where possible
5. CRITICAL: All rate fields (employeeRate, employerRate, vacationDays) must be NUMBERS, not strings
6. CRITICAL: All percentage and rate values must be numbers (e.g., 8.5 not "8.5")

JSON STRUCTURE REQUIRED:
{
  "overview": {
    "population": "Population number",
    "language": "Official language(s)",
    "currency": "Currency code and name",
    "timeZone": "Time zone",
    "generalInfo": "Key information about the country/city"
  },
  "costOfLiving": {
    "housing": { "min": 500, "max": 1200, "notes": "Rental costs explanation" },
    "utilities": { "min": 80, "max": 150, "notes": "Electricity, water, internet" },
    "food": { "min": 200, "max": 400, "notes": "Grocery costs" },
    "transportation": { "min": 50, "max": 100, "notes": "Public transport costs" },
    "healthcare": { "min": 30, "max": 80, "notes": "Healthcare costs" },
    "entertainment": { "min": 100, "max": 300, "notes": "Leisure activities" },
    "totalMonthly": { "min": 960, "max": 2230 }
  },
  "visaRequirements": {
    "touristVisa": {
      "required": true,
      "duration": "90 days",
      "process": "How to apply"
    },
    "workVisa": {
      "types": ["Type 1", "Type 2"],
      "requirements": ["Requirement 1", "Requirement 2"],
      "processingTime": "Processing time"
    },
    "residency": {
      "requirements": ["Requirement 1"],
      "processingTime": "Time needed",
      "cost": 500
    },
    "citizenship": {
      "available": true,
      "requirements": ["Requirement 1"],
      "timeRequired": "Years needed"
    }
  },
  "taxation": {
    "incomeTax": {
      "rate": "Tax rate description",
      "brackets": [
        { "min": 0, "max": 25000, "rate": 10 },
        { "min": 25000, "max": null, "rate": 20 }
      ]
    },
    "propertyTax": { "rate": "Rate info", "notes": "Property tax details" },
    "vatSalesTax": { "rate": 20, "notes": "VAT information" },
    "socialSecurity": {
      "employeeRate": 8,
      "employerRate": 12,
      "notes": "Social security details"
    }
  },
  "climate": {
    "averageTemperature": {
      "summer": { "min": 20, "max": 30 },
      "winter": { "min": 5, "max": 15 }
    },
    "sunnyDaysPerYear": 200,
    "rainyDaysPerYear": 120,
    "humidity": "Humidity description",
    "bestMonths": ["Month 1", "Month 2"]
  },
  "jobMarket": {
    "unemploymentRate": 5.2,
    "averageSalary": { "min": 30000, "max": 60000, "currency": "USD" },
    "inDemandSkills": ["Skill 1", "Skill 2"],
    "majorIndustries": ["Industry 1", "Industry 2"],
    "workCulture": {
      "workingHours": "40 hours/week",
      "vacationDays": 25,
      "workLifeBalance": "Balance description"
    }
  },
  "lifestyle": {
    "safetyIndex": 8.5,
    "healthcareQuality": "Healthcare quality description",
    "educationSystem": {
      "quality": "Education quality",
      "publicSchools": true,
      "internationalSchools": true
    },
    "transportation": {
      "publicTransport": "Transport description",
      "carOwnership": "Car ownership info",
      "walkability": "Walking friendliness"
    },
    "culture": {
      "socialLife": "Social life description",
      "expatCommunity": "Expat community info",
      "languageBarrier": "Language barrier info"
    }
  },
  "banking": {
    "requirements": ["Requirement 1", "Requirement 2"],
    "majorBanks": ["Bank 1", "Bank 2"],
    "services": ["Service 1", "Service 2"],
    "tips": ["Tip 1", "Tip 2"]
  },
  "comparisons": [
    {
      "destination": "Similar country",
      "monthlyCost": { "min": 800, "max": 1500 },
      "climate": "Climate comparison",
      "safety": "Safety comparison", 
      "languageBarrier": "Language comparison",
      "jobMarket": "Job market comparison",
      "notes": "Additional notes"
    }
  ]
}

Create the relocation guide for ${destination}. Return ONLY the JSON object.`;
  }

  private getBudgetContext(level: string): string {
    const contexts = {
      LOW: "up to $50/day - hostels, public transport, local food, free attractions",
      MEDIUM: "$50-150/day - mid-range hotels, mixed transport, local restaurants, paid attractions", 
      HIGH: "$150+/day - premium hotels, private transport, fine dining, exclusive experiences"
    };
    return contexts[level as keyof typeof contexts] || contexts.MEDIUM;
  }

  async generateVacationPlanStream(
    destination: string,
    days: number, 
    budgetLevel: string,
    onChunk?: (text: string) => void
  ): Promise<VacationAIResponseData> {
    const prompt = this.getVacationPrompt(destination, days, budgetLevel);
    
    try {
      const result = await this.model.generateContentStream(prompt);
      let fullResponse = '';
      
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;
        
        if (onChunk) {
          onChunk(chunkText);
        }
      }
      
      return this.parseAndValidateJSON(fullResponse, 'vacation');
    } catch (error) {
      console.error('Error with streaming vacation plan:', error);
      throw new Error('Failed to generate vacation plan with streaming');
    }
  }
}
