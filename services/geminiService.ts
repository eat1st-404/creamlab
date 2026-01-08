import { CreamRecipe, UserPreferences } from '../types';

// ========================================
// 环境变量配置 (DMXAPI 直连模式)
// ========================================

// 1. 从环境变量中读取 Key
const API_KEY = import.meta.env.VITE_API_KEY;

// 安全检查
if (!API_KEY) {
  console.error("❌ 错误：未找到 API Key。");
  console.error("请确保在 .env 文件(本地) 或 Cloudflare Pages 环境变量(线上) 中配置了 VITE_API_KEY");
}

const MODEL = "gemini-2.5-flash";

// 2. 利用 Key 拼接出 DMXAPI 的请求地址
const API_URL = `https://www.dmxapi.cn/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

export const generateCreamRecipe = async (prefs: UserPreferences): Promise<CreamRecipe> => {
  // 构建口味描述
  const flavorDesc = Object.entries(prefs.flavorLevels)
    .filter(([_, val]) => val > 0)
    .map(([key, val]) => `${key}: ${val}%`)
    .join(', ');

  // 🔥 核心修改：优化了提示词，强制言简意赅 + 全中文
  const prompt = `
    你是一位极简主义风格的甜点研发大师。请根据用户提供的材料和口味偏好，设计一款创意奶油配方。

    [用户输入]
    - 手边材料: ${prefs.ingredients}
    - 口味偏好: ${flavorDesc}
    - 期望口感: ${prefs.texture}

    [严格约束 - 必须遵守]
    1. **语言**：必须使用**纯简体中文**。除了无法翻译的专有名词外，禁止出现英文。
    2. **风格**：**言简意赅，短小精悍**。拒绝花哨的修辞，像老配方单一样干脆。
    3. **篇幅限制**：
       - "recipeName" (名称)：好听但不要太长（10字以内）。
       - "summary" (简介)：**一句话**概括风味特点（20字以内）。
       - "steps" (步骤)：动词开头，每步**不超过15个字**。例如：“混合牛奶和糖，小火加热。”
       - "textureTips" (秘籍)：**一句话**点破关键技巧。
       - "pairingSuggestions" (搭配)：简短列举2-3种适合的食物。

    [输出格式]
    请严格只返回一段合法的 JSON 代码，不要包含 markdown 格式标记（不要写 \`\`\`json）。
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
    // 3. 发送请求
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

    // 清理可能存在的 markdown 标记
    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(textResponse);

  } catch (error) {
    console.error("生成配方出错:", error);
    throw error;
  }
};
