
import React, { useState } from 'react';
import { CreamRecipe } from '../types';

interface BakingModeProps {
  recipe: CreamRecipe;
  onExit: () => void;
}

export const BakingMode: React.FC<BakingModeProps> = ({ recipe, onExit }) => {
  const [currentStep, setCurrentStep] = useState(-1);

  const stepsCount = recipe.steps.length;
  const isPreparation = currentStep === -1;
  const isFinished = currentStep === stepsCount;

  const nextStep = () => {
    if (currentStep < stepsCount) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > -1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FFFDFB] flex flex-col animate-in fade-in slide-in-from-bottom-full duration-500">
      {/* 顶部简易进度条 - 针对手机优化，减少视觉干扰 */}
      <div className="px-6 pt-12 pb-4 flex items-center gap-4">
        <button onClick={onExit} className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-lg">✕</button>
        <div className="flex-1 h-1.5 bg-orange-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-orange-500 transition-all duration-500 ease-out" 
            style={{ width: `${((currentStep + 1) / (stepsCount + 1)) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* 主体内容 - 针对手机大字号、沉浸感优化 */}
      <div className="flex-1 px-8 flex flex-col items-center justify-center">
        {isPreparation ? (
          <div className="w-full space-y-6 animate-in zoom-in duration-300">
            <h2 className="text-3xl font-black text-gray-900 text-center">准备好材料了吗？</h2>
            <div className="space-y-3 bg-white p-6 rounded-[2.5rem] shadow-sm border border-orange-50">
              {recipe.ingredients.map((ing, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-orange-50 last:border-0">
                  <span className="text-gray-600 font-medium">{ing.item}</span>
                  <span className="text-orange-600 font-bold">{ing.amount}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-gray-400 text-sm">确认无误后，点击下方开始 👇</p>
          </div>
        ) : isFinished ? (
          <div className="w-full space-y-6 text-center animate-in zoom-in duration-300">
            <div className="text-7xl mb-4">🥳</div>
            <h2 className="text-3xl font-black text-gray-900">搞定啦！</h2>
            <p className="text-gray-500 text-base px-4">{recipe.pairingSuggestions}</p>
            <div className="inline-block px-6 py-3 bg-orange-50 rounded-2xl text-orange-700 text-sm font-bold">
              ✨ 尝一口你的杰作吧
            </div>
          </div>
        ) : (
          <div key={currentStep} className="w-full space-y-8 animate-in slide-in-from-right-8 duration-300">
            <div className="text-xs font-black text-orange-400 tracking-[0.2em] uppercase text-center">Step {currentStep + 1}</div>
            <div className="min-h-[200px] flex items-center justify-center">
              <h3 className="text-3xl font-bold text-gray-800 leading-snug text-center px-2">
                {recipe.steps[currentStep]}
              </h3>
            </div>
            {currentStep === stepsCount - 1 && (
              <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100/50">
                <p className="text-orange-500 text-xs text-center font-bold">
                  💡 秘籍：{recipe.textureTips}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 底部导航 - 针对大拇指操作优化的超大按钮 */}
      <div className="p-8 pb-12 flex flex-col gap-3">
        <button 
          onClick={isFinished ? onExit : nextStep}
          className="w-full py-5 rounded-[1.5rem] font-black text-white bg-orange-500 shadow-xl shadow-orange-200/50 active:scale-95 transition-all text-lg"
        >
          {isPreparation ? '现在出发' : isFinished ? '太棒了，完成' : '下一步'}
        </button>
        {!isPreparation && !isFinished && (
          <button 
            onClick={prevStep}
            className="w-full py-4 text-gray-400 font-bold text-sm"
          >
            返回上一步
          </button>
        )}
      </div>
    </div>
  );
};
