
import { GoogleGenAI, Type } from "@google/genai";
import { UserPreferences, CreamRecipe } from "../types";

// 初始化 AI 实例。
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateCreamRecipe = async (prefs: UserPreferences): Promise<CreamRecipe> => {
  const ai = getAI();
  
  const flavorIntensityDesc = Object.entries(prefs.flavorLevels)
    .map(([flavor, level]) => `${flavor}: ${level}%`)
    .join(', ');

  const textPrompt = `
    你是一位专门为初学者设计配方的烘焙博主。请根据以下极简要求设计一个极其简单的创意奶油配方：
    
    用户提供的核心材料: ${prefs.ingredients}
    多维度风味/指数要求: ${flavorIntensityDesc}
    口感描述: ${prefs.texture}
    
    输出严格要求：
    1. 步骤数量必须控制在 3-5 步。
    2. 每一步都要简短、直接，字数控制在 30 字以内，适配手机全屏沉浸阅读。
    3. 做法必须是“居家零难度”：仅需简单的搅拌、混合、冷藏或小火加热。无需昂贵的专业设备。
    4. 材料清单需要有准确的家用量具单位（如克g、勺spoon、毫升ml）。
    5. 必须紧扣用户的偏好，例如：如果创新度指数高，请给出一个出人意料的组合；如果丝滑度高，请强调过滤或搅拌技巧。
  `;

  const textResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: textPrompt,
    config: {
      systemInstruction: "你是一个极简主义烘焙助手。你的任务是把奶油制作简化为手机上几秒钟就能读完的简单步骤。避开所有专业术语，使用最通俗的词汇。即使偏好很复杂，你的方案也要保持极简可行。",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          recipeName: { type: Type.STRING },
          summary: { type: Type.STRING },
          ingredients: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                item: { type: Type.STRING },
                amount: { type: Type.STRING }
              },
              required: ["item", "amount"]
            }
          },
          steps: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          textureTips: { type: Type.STRING },
          pairingSuggestions: { type: Type.STRING },
          flavorProfile: {
            type: Type.OBJECT,
            properties: {
              sweetness: { type: Type.NUMBER },
              acidity: { type: Type.NUMBER },
              complexity: { type: Type.NUMBER },
              creaminess: { type: Type.NUMBER },
              innovation: { type: Type.NUMBER }
            },
            required: ["sweetness", "acidity", "complexity", "creaminess", "innovation"]
          }
        },
        required: ["recipeName", "summary", "ingredients", "steps", "textureTips", "pairingSuggestions", "flavorProfile"]
      }
    }
  });

  const recipeData = JSON.parse(textResponse.text || "{}");

  // 根据用户要求，不再生成实物图片，使用空字符串作为标识，UI 将显示默认图标。
  const imageUrl = "";

  return {
    ...recipeData,
    id: Math.random().toString(36).substr(2, 9),
    timestamp: Date.now(),
    imageUrl
  } as CreamRecipe;
};
