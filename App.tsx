import React, { useState, useEffect } from 'react';
import { generateCreamRecipe } from './services/geminiService';
import { FlavorPreference, UserPreferences, CreamRecipe } from './types';
import { RecipeCard } from './components/RecipeCard';
import { BakingMode } from './components/BakingMode';

const App: React.FC = () => {
  const [formData, setFormData] = useState<UserPreferences>({
    ingredients: '',
    flavorLevels: {
      [FlavorPreference.SWEET]: 30,
      [FlavorPreference.SOUR]: 0,
      [FlavorPreference.BITTER]: 0,
      [FlavorPreference.SALTY]: 0,
      [FlavorPreference.CREAMY]: 50,
      [FlavorPreference.INNOVATION]: 20,
    },
    texture: ''
  });
  const [loading, setLoading] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<CreamRecipe | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<CreamRecipe[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isBakingMode, setIsBakingMode] = useState(false);
  const [view, setView] = useState<'create' | 'archives'>('create');

  // Load saved recipes from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('cream_crafter_collection');
    if (saved) {
      try { 
        setSavedRecipes(JSON.parse(saved)); 
      } catch (e) { 
        console.error("Failed to load collection", e); 
      }
    }
  }, []);

  const saveToCollection = (recipe: CreamRecipe) => {
    const alreadyExists = savedRecipes.some(r => r.id === recipe.id);
    if (alreadyExists) return;
    
    setSavedRecipes(prev => {
      const updated = [recipe, ...prev];
      localStorage.setItem('cream_crafter_collection', JSON.stringify(updated));
      return updated;
    });
  };

  // --- 🔥 核心修复区域：handleDelete ---
  const handleDelete = (id: string, e?: React.MouseEvent | React.TouchEvent) => {
    // 1. 阻止事件冒泡
    if (e) {
      e.stopPropagation();
    }

    // 2. 确认弹窗
    if (!window.confirm("确定要删除这份配方吗？删除后无法找回哦。")) return;
    
    // 3. 关键判断：我们现在是否正在看这张要删除的卡片？
    // 如果是，删完之后必须把屏幕清空，否则卡片会卡在界面上
    const isDeletingCurrentView = currentRecipe?.id === id;

    // 4. 更新数据源
    setSavedRecipes(prev => {
      const updated = prev.filter(r => r.id !== id);
      localStorage.setItem('cream_crafter_collection', JSON.stringify(updated));
      return updated;
    });
    
    // 5. 强制刷新 UI
    if (isDeletingCurrentView) {
      setCurrentRecipe(null); // 这行代码会让当前卡片消失，回到输入界面
    }
  };
  // ------------------------------------

  const handleFlavorChange = (flavor: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      flavorLevels: { ...prev.flavorLevels, [flavor]: value }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ingredients.trim()) {
      alert("请写下你手里的材料吧~");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const submitData = { ...formData, texture: formData.texture.trim() || "顺滑细腻" };
      const result = await generateCreamRecipe(submitData);
      setCurrentRecipe(result);
      setView('create');
    } catch (err: any) {
      setError("AI 走神了，请再试一次吧。");
    } finally {
      setLoading(false);
    }
  };

  const getIntensityLabel = (val: number) => {
    if (val === 0) return '无';
    if (val < 30) return '微量';
    if (val < 70) return '适中';
    return '极高';
  };

  const isAlreadySaved = (recipe: CreamRecipe | null) => 
    recipe ? savedRecipes.some(r => r.id === recipe.id) : false;

  return (
    <div className="min-h-screen bg-[#FFFDFB] text-gray-800 pb-12 overflow-x-hidden">
      {isBakingMode && currentRecipe && (
        <BakingMode recipe={currentRecipe} onExit={() => setIsBakingMode(false)} />
      )}

      {/* 顶部标题栏 */}
      <nav className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl px-6 py-4 flex justify-between items-center border-b border-orange-50/50">
        <h1 
          className="text-xl font-black tracking-tight text-gray-900 cursor-pointer"
          onClick={() => { setView('create'); setCurrentRecipe(null); }}
        >
          Cream<span className="text-orange-500">Crafter</span>
        </h1>
        <button 
          onClick={() => setView(view === 'create' ? 'archives' : 'create')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${view === 'archives' ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600'}`}
        >
          {view === 'archives' ? '✨ 去创作' : `📚 我的存档 (${savedRecipes.length})`}
        </button>
      </nav>

      <div className="max-w-md mx-auto px-6 pt-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 animate-in fade-in zoom-in duration-300">
            <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center animate-bounce mb-8">
              <span className="text-5xl">🍥</span>
            </div>
            <p className="text-xl font-black text-gray-800">正在创新口味...</p>
            <p className="text-gray-400 text-sm mt-2 font-medium">寻找最简单的制作方法</p>
          </div>
        ) : view === 'archives' ? (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
            <header className="py-2">
              <h2 className="text-2xl font-black text-gray-900 leading-tight">配方档案库</h2>
              <p className="text-gray-400 text-sm mt-1">这里存放着你所有的口味创新</p>
            </header>

            {savedRecipes.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="text-6xl grayscale opacity-30">📖</div>
                <p className="text-gray-400 font-medium">目前还没有存档哦</p>
                <button 
                  onClick={() => setView('create')}
                  className="text-orange-500 font-bold text-sm"
                >
                  去尝试第一次创作吧 →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {savedRecipes.map((recipe) => (
                  <div 
                    key={recipe.id}
                    onClick={() => { setCurrentRecipe(recipe); setView('create'); }}
                    className="group relative bg-white p-4 rounded-[1.5rem] border border-orange-50 shadow-sm flex items-center gap-4 active:scale-95 transition-all cursor-pointer"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-orange-50 overflow-hidden flex-shrink-0">
                      <div className="w-full h-full flex items-center justify-center text-xl">🍦</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 truncate">{recipe.recipeName}</h3>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                        {new Date(recipe.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    {/* 列表里的删除按钮 */}
                    <button 
                      onClick={(e) => handleDelete(recipe.id, e)}
                      className="relative z-10 w-10 h-10 flex items-center justify-center rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90"
                    >
                      <span className="text-lg">🗑️</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : currentRecipe ? (
          <div className="animate-in slide-in-from-bottom-8 duration-500">
            <div className="mb-6">
              <button 
                onClick={() => setCurrentRecipe(null)}
                className="px-4 py-2 bg-gray-100 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-widest active:scale-95 transition-all"
              >
                ← 返回重新输入
              </button>
            </div>
            <RecipeCard 
              recipe={currentRecipe} 
              onStartBaking={() => setIsBakingMode(true)} 
              isSaved={isAlreadySaved(currentRecipe)}
              onSave={saveToCollection}
              onDelete={handleDelete}
            />
          </div>
        ) : (
          <div className="space-y-8 pb-12 animate-in fade-in duration-500">
            <header className="py-2">
              <h2 className="text-3xl font-black text-gray-900 leading-tight">做一份<br/><span className="text-orange-500 underline decoration-orange-200 decoration-4">不麻烦</span>的奶油。</h2>
            </header>

            <div className="space-y-6">
              <section className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400">1. 手边材料</label>
                <textarea
                  className="w-full h-24 p-5 bg-white border border-orange-50 rounded-[1.5rem] shadow-sm focus:border-orange-200 outline-none transition-all text-base"
                  placeholder="草莓、牛奶、糖..."
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                />
              </section>

              <section className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400">2. 深度偏好设定</label>
                <div className="bg-white p-5 rounded-[2rem] border border-orange-50 shadow-sm space-y-6">
                  <div className="grid grid-cols-1 gap-5">
                    {[FlavorPreference.SWEET, FlavorPreference.SOUR, FlavorPreference.BITTER, FlavorPreference.SALTY].map((flavor) => (
                      <div key={flavor} className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-gray-700">{flavor}度</span>
                          <span className="text-orange-500 font-black">{getIntensityLabel(formData.flavorLevels[flavor])}</span>
                        </div>
                        <input
                          type="range"
                          min="0" max="100" step="10"
                          value={formData.flavorLevels[flavor]}
                          onChange={(e) => handleFlavorChange(flavor, parseInt(e.target.value))}
                          className="w-full h-1.5 bg-orange-50 rounded-full appearance-none accent-orange-500 cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="h-px bg-orange-50" />

                  <div className="grid grid-cols-1 gap-5">
                    {[FlavorPreference.CREAMY, FlavorPreference.INNOVATION].map((flavor) => (
                      <div key={flavor} className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-gray-800">{flavor}度指数</span>
                          <span className="text-orange-600 font-black">{getIntensityLabel(formData.flavorLevels[flavor])}</span>
                        </div>
                        <input
                          type="range"
                          min="0" max="100" step="10"
                          value={formData.flavorLevels[flavor]}
                          onChange={(e) => handleFlavorChange(flavor, parseInt(e.target.value))}
                          className="w-full h-1.5 bg-orange-100 rounded-full appearance-none accent-orange-600 cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400">3. 口感想象</label>
                <input
                  type="text"
                  className="w-full px-5 py-4 bg-white border border-orange-50 rounded-full shadow-sm focus:border-orange-200 outline-none text-sm font-medium"
                  placeholder="如：轻盈、像雪一样"
                  value={formData.texture}
                  onChange={(e) => setFormData({ ...formData, texture: e.target.value })}
                />
              </section>

              <button
                onClick={handleSubmit}
                className="w-full py-5 bg-orange-500 text-white rounded-[1.5rem] font-black text-lg hover:bg-orange-600 active:scale-95 transition-all shadow-xl shadow-orange-100"
              >
                生成我的专属方子 ✨
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-500 rounded-2xl text-center text-xs font-bold border border-red-100">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;