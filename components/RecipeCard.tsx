import React, { useState } from 'react';
import { CreamRecipe } from '../types';

interface RecipeCardProps {
  recipe: CreamRecipe;
  onStartBaking: () => void;
  isSaved: boolean;
  onSave: (recipe: CreamRecipe) => void;
  onDelete: (id: string, e?: React.MouseEvent | React.TouchEvent) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ 
  recipe, 
  onStartBaking, 
  isSaved, 
  onSave, 
  onDelete 
}) => {
  const [copyFeedback, setCopyFeedback] = useState('');

  // 生成要复制的文本内容
  const generateCopyText = () => {
    const ingredientList = recipe.ingredients
      .map(i => `- ${i.item}: ${i.amount}`)
      .join('\n');
    const stepList = recipe.steps
      .map((s, idx) => `${idx + 1}. ${s}`)
      .join('\n');
    
    return `【${recipe.recipeName}】\n\n--- 准备材料 ---\n${ingredientList}\n\n--- 制作步骤 ---\n${stepList}\n\n💡 秘籍：${recipe.textureTips}\n✨ 搭配：${recipe.pairingSuggestions}\n\n(来自 CreamCrafter 奶油实验室)`;
  };

  // 🔥【核心修改】新的组合操作：复制 + 存档
  const handleCopyAndSave = async () => {
    // 1. 执行复制操作
    try {
      await navigator.clipboard.writeText(generateCopyText());
      setCopyFeedback('✅ 复制成功，快去分享吧！');
    } catch (err) {
      setCopyFeedback('❌ 复制失败，请手动复制');
    }

    // 2. 执行存档操作（如果还没存过）
    if (!isSaved) {
      onSave(recipe);
      // 可以选择在这里把提示文案改成 "✅ 复制并存档成功！"
      // 但为了简洁，我们依赖按钮状态的变化来提示用户
      setTimeout(() => setCopyFeedback(''), 2000);
    } else {
      // 如果已经存过了，只提示复制成功
      setTimeout(() => setCopyFeedback(''), 2000);
    }
  };

  return (
    <div className="relative bg-[#FFFDFB] rounded-[2.5rem] p-6 shadow-xl shadow-orange-100/50 border border-orange-50 overflow-hidden">
      
      {/* 顶部装饰和删除按钮 */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-200 to-orange-100" />
      
      {isSaved && (
        <button 
          onClick={(e) => onDelete(recipe.id, e)}
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center bg-red-50 text-red-400 rounded-full opacity-50 hover:opacity-100 hover:bg-red-100 transition-all"
        >
         🗑️
        </button>
      )}

      {/* 卡片 Header */}
      <div className="text-center mt-6 mb-8 animate-in slide-in-from-bottom-4 duration-700">
        <div className="inline-block mb-2 relative">
          <span className="text-4xl">🍦</span>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-orange-200/50 blur-sm rounded-full"></div>
        </div>
        <h2 className="text-[10px] font-black text-orange-300 tracking-[0.3em] uppercase mb-4">Custom Innovation</h2>
        
        {/* 🔥【修改点 1】P1位置：原来的“点击存档”按钮区域 */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {/* 🗑️ 旧的“点击存档”按钮已被删除 */}
          <span className="px-3 py-1 bg-orange-50 rounded-full text-[10px] font-bold text-orange-400 tracking-wider border border-orange-100">
            RECIPE CARD
          </span>
        </div>

        <h1 className="text-3xl font-black text-gray-900 leading-tight mb-3">
          {recipe.recipeName}
        </h1>
        <p className="text-gray-500 text-sm font-medium px-4 leading-relaxed">
          {recipe.summary}
        </p>
      </div>

      {/* 沉浸模式入口 */}
      <button
        onClick={onStartBaking}
        className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-2xl font-black text-lg shadow-lg shadow-orange-200/50 flex items-center justify-center gap-2 active:scale-98 transition-all mb-8 hover:shadow-xl hover:from-orange-600 hover:to-orange-500"
      >
        <span>👩‍🍳 开启沉浸制作模式</span>
      </button>

      {/* 材料清单 */}
      <div className="mb-8 animate-in slide-in-from-bottom-6 duration-700 delay-100">
        <h3 className="flex items-center gap-2text-sm font-bold text-gray-900 mb-4">
          <span className="w-2 h-2 rounded-full bg-orange-400"></span>
          准备材料
        </h3>
        <div className="bg-orange-50/50 rounded-2xl p-4 border border-orange-100/50">
          <ul className="space-y-2">
            {recipe.ingredients.map((ing, idx) => (
              <li key={idx} className="flex justify-between items-center text-sm">
                <span className="text-gray-700 font-medium">{ing.item}</span>
                <span className="text-orange-600 font-bold font-mono">{ing.amount}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 简易步骤 */}
      <div className="mb-8 animate-in slide-in-from-bottom-6 duration-700 delay-200">
        <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-4">
          <span className="w-2 h-2 rounded-full bg-orange-400"></span>
          制作流程预览
        </h3>
        <div className="space-y-3">
          {recipe.steps.map((step, idx) => (
            <div key={idx} className="flex gap-3">
              <span className="flex-shrink-0 w-5 h-5 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center text-xs font-black leading-none mt-0.5">
                {idx + 1}
              </span>
              <p className="text-gray-600 text-sm leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 秘籍与搭配 */}
      <div className="bg-gray-50 p-4 rounded-2xl space-y-3 border border-gray-100 animate-in slide-in-from-bottom-6 duration-700 delay-300">
        <div className="flex gap-2 items-start">
          <span className="text-lg">💡</span>
          <div>
            <h4 className="text-xs font-bold text-gray-900 mb-0.5">制作秘籍</h4>
            <p className="text-xs text-gray-500 leading-relaxed">{recipe.textureTips}</p>
          </div>
        </div>
        <div className="flex gap-2 items-start">
          <span className="text-lg">✨</span>
          <div>
            <h4 className="text-xs font-bold text-gray-900 mb-0.5">推荐搭配</h4>
            <p className="text-xs text-gray-500 leading-relaxed">{recipe.pairingSuggestions}</p>
          </div>
        </div>
      </div>

      {/* 🔥【修改点 2】P2位置：底部大按钮改为“复制+存档” */}
      <div className="mt-8">
        <button
          onClick={handleCopyAndSave}
          // 根据是否已存档，改变按钮样式和文字
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 border-2 ${
            isSaved 
              ? 'bg-green-50 text-green-600 border-green-200' // 已存档：绿色样式
              : 'bg-white text-orange-500 border-orange-200 hover:bg-orange-50' // 未存档：橙色样式
          }`}
        >
          <span>{isSaved ? '✅ 已成功存档并复制' : '📄 复制配方并存档'}</span>
        </button>
        {copyFeedback && !isSaved && (
          <p className="text-center text-xs text-orange-400 mt-2 font-medium animate-in fade-in">
            {copyFeedback}
          </p>
        )}
      </div>

    </div>
  );
};
