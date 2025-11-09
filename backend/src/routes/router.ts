import cors from "cors";
import express, {
	type Express,
	Router,
	type Request,
	type Response,
	type NextFunction,
} from "express";
import travelPlansRoutes from "./travel-plans";
import { clerkMiddleware } from "@clerk/express";
import { env } from "../env";

// Store allowed origins for use in error handlers
let allowedOrigins: string[] = [];

const setupRoutes = (app: Express) => {
	// Configure CORS with proper origin handling
	allowedOrigins = [
		env.CORS_ORIGIN,
		env.FRONTEND_URL,
	].filter((origin): origin is string => Boolean(origin));

	// Log CORS configuration in development
	if (env.NODE_ENV === "development") {
		console.log("CORS allowed origins:", allowedOrigins);
		console.log("Frontend URL:", env.FRONTEND_URL);
		console.log("CORS Origin:", env.CORS_ORIGIN);
	}

	const corsOptions: cors.CorsOptions = {
		origin: (origin, callback) => {
			// Allow requests with no origin (like mobile apps or curl requests)
			if (!origin) {
				return callback(null, true);
			}

			// Check if the origin is in the allowed list
			if (allowedOrigins.includes(origin)) {
				return callback(null, true);
			}

			// Allow requests from localhost in development
			if (env.NODE_ENV === "development" && origin.startsWith("http://localhost")) {
				return callback(null, true);
			}

			// Reject other origins
			callback(new Error("Not allowed by CORS"));
		},
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
		allowedHeaders: [
			"Content-Type",
			"Authorization",
			"X-Requested-With",
			"Accept",
			"Origin",
		],
		credentials: true,
		preflightContinue: false,
		optionsSuccessStatus: 204,
	};

	// Apply CORS middleware before other middleware
	app.use(cors(corsOptions));

	// Handle preflight requests explicitly
	app.options("*", cors(corsOptions));

	app.use(express.json());

	// Health check endpoint (no auth required, for Fly.io health checks)
	app.get("/health", (req: Request, res: Response) => {
		res.status(200).json({
			status: "ok",
			timestamp: new Date().toISOString(),
		});
	});

	const appRouter = Router();
	
	appRouter.use(clerkMiddleware());

	appRouter.use('/travel-plans', travelPlansRoutes);

	appRouter.get('/', (req, res) => {
		res.status(401).json({ 
			error: 'Unauthorized', 
			message: 'Authentication required. Please provide valid Clerk authentication headers.' 
		});
	});

	app.use("/api", appRouter);

	// 404 handler - ensure CORS headers are included
	app.use((req: Request, res: Response) => {
		const origin = req.headers.origin;
		if (origin && (allowedOrigins.includes(origin) || (env.NODE_ENV === "development" && origin.startsWith("http://localhost")))) {
			res.setHeader("Access-Control-Allow-Origin", origin);
			res.setHeader("Access-Control-Allow-Credentials", "true");
			res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
			res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin");
		}
		res.status(404).json({
			error: "Not Found",
			message: "The requested resource was not found",
		});
	});

	// Global error handler - ensure CORS headers are always included
	app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
		// Set CORS headers even on errors
		const origin = req.headers.origin;
		if (origin && (allowedOrigins.includes(origin) || (env.NODE_ENV === "development" && origin.startsWith("http://localhost")))) {
			res.setHeader("Access-Control-Allow-Origin", origin);
			res.setHeader("Access-Control-Allow-Credentials", "true");
			res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
			res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin");
		}

		// Don't send error response if headers already sent
		if (res.headersSent) {
			return next(err);
		}

		console.error("Error:", err);
		res.status(500).json({
			error: "Internal Server Error",
			message: env.NODE_ENV === "development" ? err.message : "An error occurred",
		});
	});
};

// Export helper function to set CORS headers in error responses
export const setCorsHeaders = (req: Request, res: Response): void => {
	const origin = req.headers.origin;
	if (origin && (allowedOrigins.includes(origin) || (env.NODE_ENV === "development" && origin.startsWith("http://localhost")))) {
		res.setHeader("Access-Control-Allow-Origin", origin);
		res.setHeader("Access-Control-Allow-Credentials", "true");
		res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
		res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin");
	}
};

export default setupRoutes;
