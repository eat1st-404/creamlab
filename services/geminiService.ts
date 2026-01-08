import { CreamRecipe, UserPreferences } from '../types';

// ========================================
// 环境变量配置 (DMXAPI 直连模式)
// ========================================

const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  console.error("❌ 错误：未找到 API Key。");
  console.error("请确保在 .env 文件(本地) 或 Cloudflare Pages 环境变量(线上) 中配置了 VITE_API_KEY");
}

const MODEL = "gemini-2.5-flash";
const API_URL = `https://www.dmxapi.cn/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

export const generateCreamRecipe = async (prefs: UserPreferences): Promise<CreamRecipe> => {
  const flavorDesc = Object.entries(prefs.flavorLevels)
    .filter(([_, val]) => val > 0)
    .map(([key, val]) => `${key}: ${val}%`)
    .join(', ');

  // 🔥 核心修改：在提示词中强制要求步骤包含用量
  const prompt = `
    你是一位极简主义风格的甜点研发大师。请根据用户提供的材料和口味偏好，设计一款创意奶油配方。

    [用户输入]
    - 手边材料: ${prefs.ingredients}
    - 口味偏好: ${flavorDesc}
    - 期望口感: ${prefs.texture}

    [严格约束 - 必须遵守]
    1. **语言**：必须使用**纯简体中文**。
    2. **风格**：言简意赅，像老配方单一样干脆。
    3. **关键要求**：
       - "recipeName" (名称)：10字以内，好听。
       - "summary" (简介)：20字以内，一句话概括。
       - "steps" (步骤)：**这是最重要的！在每一个步骤中，提到材料时必须带上具体用量。** - ❌ 错误写法："混合淡奶油和糖。"
         - ✅ 正确写法："将200克淡奶油与15克细砂糖混合倒入盆中。"
         - 保持动词开头，尽量精简，不要废话。
       - "textureTips" (秘籍)：一句话点破关键。
       - "pairingSuggestions" (搭配)：简短列举2-3种。

    [输出格式]
    请严格只返回一段合法的 JSON 代码，不要包含 markdown 格式标记。
    JSON 格式必须包含以下字段：
    {
      "id": "UUID",
      "recipeName": "名称",
      "summary": "简介",
      "ingredients": [{"item": "材料名", "amount": "精准用量"}],
      "steps": ["步骤1", "步骤2", "步骤3"],
      "textureTips": "秘籍",
      "pairingSuggestions": "搭配建议",
      "timestamp": ${Date.now()}
    }
  `;

  try {
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
