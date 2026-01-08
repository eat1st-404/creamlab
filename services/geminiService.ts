import { CreamRecipe, UserPreferences } from '../types';

// ========================================
// 安全配置
// ========================================
// 👇 把这里换成你刚才在 Cloudflare 部署后获得的那个 URL
// 注意：结尾不要带 /
const WORKER_URL = "https://creamlab20.cathwhite404.workers.dev"; 

export const generateCreamRecipe = async (prefs: UserPreferences): Promise<CreamRecipe> => {
  // 1. 构建提示词 (Prompt)
  // (这部分逻辑不变，还是由前端生成提示词)
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
    // 2. 发送请求给 Cloudflare Worker
    // 注意：这里不再需要 API Key 了！因为 Key 在 Worker 里。
    const response = await fetch(WORKER_URL, {
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
      throw new Error(`Worker 请求失败: ${response.status}`);
    }

    const data = await response.json();

    // 3. 解析结果 (跟以前一样)
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
