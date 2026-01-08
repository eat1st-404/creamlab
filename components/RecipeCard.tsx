import React, { useState } from 'react';
import { CreamRecipe } from '../types';

interface RecipeCardProps {
  recipe: CreamRecipe;
  onStartBaking: () => void;
  isSaved?: boolean;
  onSave?: (recipe: CreamRecipe) => void;
  onDelete?: (id: string, e?: React.MouseEvent) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ 
  recipe, 
  onStartBaking, 
  isSaved = false, 
  onSave, 
  onDelete 
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const text = `【${recipe.recipeName}】\n${recipe.summary}\n\n[准备材料]\n${recipe.ingredients.map(i => `· ${i.item}: ${i.amount}`).join('\n')}\n\n[制作步骤]\n${recipe.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n[不失败秘籍]\n${recipe.textureTips}`.trim();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 处理删除点击
  const handleDelete = (e: React.MouseEvent) => {
    // 关键：阻止事件冒泡，防止触发外层卡片的点击事件
    e.stopPropagation(); 
    if (onDelete) {
      onDelete(recipe.id, e);
    }
  };

  // 处理收藏/存档点击
  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSave) {
      onSave(recipe);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-orange-50 max-w-xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 顶部预览区 */}
      <div className="w-full aspect-[4/3] bg-orange-50 relative flex items-center justify-center">
        {recipe.imageUrl ? (
          <img src={recipe.imageUrl} alt={recipe.recipeName} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="text-6xl">🍦</div>
            <div className="text-[10px] font-black text-orange-300 uppercase tracking-widest">Custom Innovation</div>
          </div>
        )}
        
        {/* 右下角操作按钮组 */}
        <div className="absolute bottom-4 right-4 flex gap-2 z-10">
          {isSaved && onDelete && (
            <button 
              onClick={handleDelete}
              className="bg-red-500/90 backdrop-blur text-white p-2 rounded-full shadow-lg active:scale-90 transition-all flex items-center gap-2 hover:bg-red-600 border border-red-400/20"
              title="删除配方"
            >
              <span className="text-sm px-2 font-bold flex items-center gap-1">🗑️ 删除存档</span>
            </button>
          )}
          
          {!isSaved && onSave && (
            <button 
              onClick={handleSave}
              className="bg-orange-500/90 backdrop-blur text-white p-2 rounded-full shadow-lg active:scale-90 transition-all flex items-center gap-2 hover:bg-orange-600 border border-orange-400/20"
              title="存档配方"
            >
              <span className="text-sm px-2 font-bold flex items-center gap-1">💾 点击存档</span>
            </button>
          )}
          
          <div className="bg-white/80 backdrop-blur px-3 py-2 rounded-full text-[10px] font-bold text-orange-600 uppercase tracking-widest shadow-sm flex items-center">
            Recipe Card
          </div>
        </div>
      </div>

      {/* 内容区 */}
      <div className="p-6 space-y-8">
        <header className="text-center">
          <h2 className="text-2xl font-black text-gray-800 mb-2">{recipe.recipeName}</h2>
          <p className="text-gray-500 text-sm leading-relaxed px-4">{recipe.summary}</p>
        </header>

        {/* 沉浸式制作按钮 */}
        <button
          onClick={onStartBaking}
          className="w-full py-5 bg-orange-500 text-white rounded-[1.5rem] font-black text-lg hover:bg-orange-600 active:scale-95 transition-all shadow-xl shadow-orange-100 flex items-center justify-center gap-2"
        >
          <span>👩‍🍳 开启沉浸制作模式</span>
        </button>

        {/* 材料清单 */}
        <section>
          <h3 className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span> 准备材料
          </h3>
          <div className="bg-orange-50/50 rounded-2xl p-5 border border-orange-100/50">
            <ul className="grid grid-cols-1 gap-3">
              {recipe.ingredients.map((ing, idx) => (
                <li key={idx} className="flex justify-between items-center text-sm border-b border-orange-100/30 last:border-0 pb-2 last:pb-0">
                  <span className="text-gray-600 font-medium">{ing.item}</span>
                  <span className="font-bold text-gray-800">{ing.amount}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 制作步骤 */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span> 详细制作步骤
          </h3>
          <div className="space-y-6">
            {recipe.steps.map((step, idx) => (
              <div key={idx} className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-black shadow-sm">
                  {idx + 1}
                </span>
                <p className="text-sm text-gray-700 leading-relaxed font-medium pt-1">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 秘籍与建议 */}
        <section className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
           <div className="space-y-4">
             <div>
               <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">💡 制作秘籍</h4>
               <p className="text-xs text-gray-600 leading-relaxed">{recipe.textureTips}</p>
             </div>
             <div>
               <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">✨ 推荐搭配</h4>
               <p className="text-xs text-gray-600 leading-relaxed">{recipe.pairingSuggestions}</p>
             </div>
           </div>
        </section>

        <div className="flex gap-3">
          <button 
            onClick={copyToClipboard}
            className={`flex-1 py-4 rounded-xl font-black text-xs transition-all border ${copied ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-orange-100 text-orange-500 hover:bg-orange-50'}`}
          >
            {copied ? '✓ 配方已复制' : '复制完整配方文字'}
          </button>
        </div>
      </div>
    </div>
  );
};