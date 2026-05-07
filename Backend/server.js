import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* =========================
   MIDDLEWARE
========================= */

app.use(cors());
app.use(express.json());

/* =========================
   HOME ROUTE
========================= */

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "SentiScope AI Backend Running 🚀"
    });

});

/* =========================
   ANALYZE ROUTE
========================= */

app.post("/analyze", async (req, res) => {

    try {

        const { text } = req.body;

        /* =========================
           VALIDATION
        ========================= */

        if (!text || text.trim() === "") {

            return res.status(400).json({
                success: false,
                error: "Text is required"
            });

        }

        /* =========================
           HUGGING FACE API CALL
        ========================= */

        const response = await axios.post(

            "https://router.huggingface.co/hf-inference/models/cardiffnlp/twitter-roberta-base-sentiment"

            {
                inputs: text
            },

            {
                headers: {
                    Authorization: `Bearer ${process.env.HF_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }

        );

        /* =========================
           AI RESULT
        ========================= */

        const prediction = response.data[0];

        let best = prediction[0];

        for (const item of prediction) {

            if (item.score > best.score) {
                best = item;
            }

        }

        /* =========================
           SENTIMENT LOGIC
        ========================= */

        let tone = "Neutral";
        let score = 0;
        let description = "";

        if (best.label === "LABEL_2") {

            tone = "Positive";
            score = Math.round(best.score * 100);

            description =
                "The text expresses positive emotions and optimism.";

        }

        else if (best.label === "LABEL_0") {

            tone = "Negative";
            score = -Math.round(best.score * 100);

            description =
                "The text expresses negative emotions or dissatisfaction.";

        }

        else {

            tone = "Neutral";
            score = 0;

            description =
                "The text appears emotionally neutral.";

        }

        /* =========================
           EMOTION ESTIMATION
        ========================= */

        const emotions = {

            joy:
                tone === "Positive"
                    ? 85
                    : tone === "Negative"
                        ? 10
                        : 40,

            sadness:
                tone === "Negative"
                    ? 78
                    : 15,

            anger:
                tone === "Negative"
                    ? 72
                    : 8,

            fear:
                tone === "Negative"
                    ? 45
                    : 18,

            surprise: 35,

            trust:
                tone === "Positive"
                    ? 88
                    : 30
        };

        /* =========================
           KEYWORDS
        ========================= */

        const keywords = text
            .split(" ")
            .filter(word => word.length > 3)
            .slice(0, 5);

        /* =========================
           FINAL RESPONSE
        ========================= */

        res.json({

            success: true,

            tone,
            score,
            description,

            emotions,

            keywords,

            ai: {
                label: best.label,
                confidence: `${Math.round(best.score * 100)}%`
            }

        });

    }

    catch (error) {

        console.error(
            "AI ERROR:",
            error.response?.data || error.message
        );

        res.status(500).json({

            success: false,

            error:
                "AI sentiment analysis failed"

        });

    }

});

/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {

    console.log(`🚀 Server running on port ${PORT}`);

});