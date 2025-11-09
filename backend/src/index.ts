import "dotenv/config";
import express from "express";
import setupRoutes from "./routes/router";
import { env } from "./env";

const app = express();
setupRoutes(app);

// Listen on 0.0.0.0 to accept connections from Fly.io proxy
app.listen(env.PORT, "0.0.0.0", () => {
	console.log(`Server is running on port ${env.PORT}`);
});
