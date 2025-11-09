import "dotenv/config";
import express from "express";
import setupRoutes from "./routes/router";
import { env } from "./env";

const app = express();
setupRoutes(app);

app.listen(env.PORT, () => {
	console.log(`Server is running on port ${env.PORT}`);
});
