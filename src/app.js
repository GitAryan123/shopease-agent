import express from "express";
import cors from "cors";

import apiRoutes from "./routes/api.js";
import { asyncHandler } from "./utils/asyncHandler.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "hey!!",
    });
});

app.use("/api", apiRoutes);

app.get(
    "/health",
    asyncHandler(async (req, res) => {
        res.json({
            status: "ok",
            server: "up",
            timestamp: new Date().toISOString(),
        });
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