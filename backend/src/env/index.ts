import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	PORT: z.coerce.number().default(3000),
	DATABASE_URL: z.string().url(),
	CORS_ORIGIN: z.string().url().optional(),
	CLERK_SECRET_KEY: z.string(),
	CLERK_PUBLISHABLE_KEY: z.string(),
	GOOGLE_API_KEY: z.string(),
	FRONTEND_URL: z.string().url(),
});

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
	console.error("Environment validation error:", _env.error.format());

	throw new Error("Environment validation error");
}

export const env = _env.data;

export type Environment = z.infer<typeof envSchema>;
