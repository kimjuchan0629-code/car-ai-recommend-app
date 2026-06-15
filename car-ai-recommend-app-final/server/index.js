import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY가 .env 파일에 없습니다.");
  process.exit(1);
}

const MODEL_CANDIDATES = [
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
];

function buildPrompt({ lifestyle, budget, carType }) {
  return `
너는 자동차 구매 상담 전문가야.

사용자의 라이프스타일, 예산, 선호 차종을 분석해서 현실적인 자동차를 추천해줘.

조건:
- 한국 시장 기준으로 추천해줘.
- 추천 차량은 3대만 제시해줘.
- 신차와 중고차 중 더 현실적인 선택이 있으면 구분해서 말해줘.
- 예산을 초과하는 차량은 무리하게 추천하지 마.
- 유지비, 연비, 보험료, 수리비, 감가상각, 실용성을 고려해줘.
- 자동차를 잘 모르는 사람도 이해할 수 있게 쉽게 설명해줘.
- 마지막에는 최종 추천 1대를 골라줘.
- 실제 구매 전에는 시세, 보험료, 정비 이력, 사고 이력 확인이 필요하다고 안내해줘.

사용자 정보:
라이프스타일: ${lifestyle}
예산: ${budget}
선호 차종: ${carType}

출력 형식:

[AI 자동차 추천 결과]

1순위:
차량명:
추천 형태: 신차 / 중고차 / 둘 다 가능
추천 이유:
장점:
단점:
주의할 점:

2순위:
차량명:
추천 형태:
추천 이유:
장점:
단점:
주의할 점:

3순위:
차량명:
추천 형태:
추천 이유:
장점:
단점:
주의할 점:

최종 추천:
구매 전 확인해야 할 것:
`;
}

function extractGeminiText(data) {
  return (
    data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim() || ""
  );
}

async function callGeminiModel(model, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": process.env.GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.4,
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const message =
      data?.error?.message || `Gemini API 오류: ${response.status}`;
    throw new Error(message);
  }

  const text = extractGeminiText(data);

  if (!text) {
    throw new Error("Gemini 응답이 비어 있습니다.");
  }

  return text;
}

async function generateWithFallback(prompt) {
  let lastError = null;

  for (const model of MODEL_CANDIDATES) {
    try {
      console.log(`Trying Gemini model: ${model}`);

      const text = await callGeminiModel(model, prompt);

      return {
        text,
        modelUsed: model,
      };
    } catch (error) {
      lastError = error;
      console.error(`Model failed: ${model}`);
      console.error(error?.message || error);
    }
  }

  throw lastError || new Error("모든 Gemini 모델 호출에 실패했습니다.");
}

app.get("/", (req, res) => {
  res.send("AI 자동차 추천 서버가 실행 중입니다.");
});

app.post("/recommend", async (req, res) => {
  try {
    const { lifestyle, budget, carType } = req.body;

    if (!lifestyle || !budget || !carType) {
      return res.status(400).json({
        error: "라이프스타일, 예산, 선호 차종을 모두 입력해주세요.",
      });
    }

    const prompt = buildPrompt({ lifestyle, budget, carType });
    const result = await generateWithFallback(prompt);

    res.json({
      recommendation: result.text,
      modelUsed: result.modelUsed,
    });
  } catch (error) {
    console.error("Recommendation error:", error);

    res.status(500).json({
      error: "AI 추천 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      detail: error?.message || String(error),
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});