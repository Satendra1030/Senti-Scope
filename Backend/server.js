import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { GoogleGenerativeAI } from "@google/generative-ai";
dotenv.config();


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "SentiScope Backend Running 🚀"
    });
});

app.post("/analyze", async (req, res) => {

    const { text } = req.body;

    if (!text) {
        return res.status(400).json({
            error: "Text is required"
        });
    }

    const lower = text.toLowerCase();

    let score = 0;

    if (
        lower.includes("love") ||
        lower.includes("good") ||
        lower.includes("great") ||
        lower.includes("amazing")
    ) {
        score += 75;
    }

    if (
        lower.includes("terrible") ||
        lower.includes("bad") ||
        lower.includes("frustrated") ||
        lower.includes("waste")
    ) {
        score -= 80;
    }

    if (score === 0) {
        score = 5;
    }

    const positive = score > 20;

    const result = {
        score,

        tone:
            score > 60
                ? "Very Positive"
                : score > 20
                    ? "Positive"
                    : score > -20
                        ? "Neutral"
                        : score > -60
                            ? "Negative"
                            : "Very Negative",

        description: positive
            ? "The text expresses positive emotion."
            : "The text expresses negative emotion.",

        emotions: {
            joy: positive ? 82 : 12,
            sadness: positive ? 8 : 70,
            anger: positive ? 6 : 86,
            fear: positive ? 12 : 42,
            surprise: 40,
            trust: positive ? 88 : 20
        },

        keywords: positive
            ? ["good", "great", "love"]
            : ["bad", "terrible", "frustrated"]
    };

    res.json(result);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});