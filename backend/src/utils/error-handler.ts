import { Request, Response } from 'express';
import { env } from '../env';

export class ErrorHandler {
  private static setCorsHeaders(req: Request, res: Response): void {
    const origin = req.headers.origin;
    if (!origin) return;

    const allowedOrigins = [
      env.CORS_ORIGIN,
      env.FRONTEND_URL,
    ].filter((o): o is string => Boolean(o));

    // Check if origin is allowed
    if (allowedOrigins.includes(origin) || 
        (env.NODE_ENV === "development" && origin.startsWith("http://localhost"))) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin");
    }
  }

  static handle(error: unknown, res: Response, operation: string = 'operation', req?: Request): void {
    console.error(`Error in ${operation}:`, error);
    
    // Set CORS headers if request is provided
    if (req) {
      this.setCorsHeaders(req, res);
    }
    
    if (error instanceof Error) {
      if (error.message.includes('API')) {
        res.status(503).json({
          success: false,
          error: 'External API temporarily unavailable',
          message: 'Please try again later'
        });
        return;
      }
      
      if (error.message.includes('validation')) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          message: error.message
        });
        return;
      }

      if (error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          error: 'Resource not found',
          message: error.message
        });
        return;
      }
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Something went wrong'
    });
  }
}
