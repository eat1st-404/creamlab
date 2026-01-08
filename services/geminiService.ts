import { CreamRecipe, UserPreferences } from '../types';

// ========================================
// 环境变量配置 (DMXAPI 直连模式)
// ========================================

// 1. 从环境变量中读取 Key
const API_KEY = import.meta.env.VITE_API_KEY;

// 安全检查：防止 Key 没填导致请求失败
if (!API_KEY) {
  console.error("❌ 错误：未找到 API Key。");
  console.error("请确保在 .env 文件(本地) 或 Cloudflare Pages 环境变量(线上) 中配置了 VITE_API_KEY");
  // 为了不让应用直接崩掉，这里可以不抛出 Error，但在控制台报警
}

const MODEL = "gemini-2.5-flash";

// 2. 关键修改：利用 Key 拼接出 DMXAPI 的请求地址
const API_URL = `https://www.dmxapi.cn/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

export const generateCreamRecipe = async (prefs: UserPreferences): Promise<CreamRecipe> => {
  // 构建提示词 (Prompt) - 保持不变
  const flavorDesc = Object.entries(prefs.flavorLevels)
    .filter(([_, val]) => val > 0)
    .map(([key, val]) => `${key}: ${val}%`)
    .join(', ');

  const prompt = `
    你是一位世界顶级的甜点研发大师。请根据用户提供的材料和口味偏好，设计一款极具创意的奶油配方。
    
    [用户输入]
    - 手边材料: ${prefs.ingredients}
    - 口味偏好: ${flavorDesc}
    - 期望口感: ${prefs.texture}

    [输出要求]
    请严格只返回一段合法的 JSON 代码，不要包含 markdown 格式标记。
    JSON 格式必须包含以下字段：
    {
      "id": "UUID",
      "recipeName": "名称",
      "summary": "简介",
      "ingredients": [{"item": "材料", "amount": "用量"}],
      "steps": ["步骤1", "步骤2"],
      "textureTips": "秘籍",
      "pairingSuggestions": "搭配",
      "timestamp": ${Date.now()}
    }
  `;

  try {
    // 3. 发送请求
    // ✅ 修正点：这里改成 fetch(API_URL)，而不是未定义的 WORKER_URL
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status}`);
    }

    const data = await response.json();

    // 解析结果
    let textResponse = data.contents?.[0]?.parts?.[0]?.text || 
                       data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
      throw new Error("API 返回了空内容");
    }

    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(textResponse);

  } catch (error) {
    console.error("生成配方出错:", error);
    throw error;
  }
};
