import express from "express";
import cors from "cors";

import apiRoutes from "./routes/api.js";
import { asyncHandler } from "./utils/asyncHandler.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { getProvider } from "./agent/providers/index.js";
import { sendSuccess } from "./utils/response.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", apiRoutes);

app.get(
    "/health",
    asyncHandler(async (req, res) => {
        const provider = getProvider();
        const health = {
            status: 'ok',
            server: 'up',
            provider: provider.name,
            llm: 'unknown',
            timestamp: new Date().toISOString(),
        };

        const pingPromise = provider.send([
            { role: 'user', content: 'ping - reply with the single word pong' },
        ]);
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('LLM ping timeout')), 5000)
        );
        await Promise.race([pingPromise, timeoutPromise]);
        health.llm = 'reachable';

        sendSuccess(res, health);
    })
);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: "Not found",
    });
});

app.use(errorHandler);

export default app;