import React from 'react';
import { X, Clock, Flame, Sparkles, Scale, AlertCircle, ChefHat } from 'lucide-react';

export interface RecipeData {
  name: string;
  category: string;
  prepTime: number;
  station: string;
  image: string;
  ingredients: { name: string; amount: string }[];
  allergens: string[];
  steps: string[];
}

interface RecipeSpecDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: RecipeData | null;
}

export const RecipeSpecDrawer: React.FC<RecipeSpecDrawerProps> = ({
  isOpen,
  onClose,
  recipe,
}) => {
  if (!isOpen || !recipe) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/60">
          <div>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100/70 border border-amber-200/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {recipe.category} Spec Sheet
            </span>
            <h2 className="text-xl font-serif font-bold text-slate-900 mt-1.5">{recipe.name}</h2>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" /> {recipe.prepTime}m Cook Time
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-rose-500" /> Station: {recipe.station}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Plating Banner */}
          <div className="relative h-44 rounded-2xl overflow-hidden shadow-inner bg-slate-100 border border-slate-200/80">
            <img
              src={recipe.image}
              alt={recipe.name}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold rounded-lg flex items-center gap-1.5 border border-white/10">
              <Sparkles className="w-3 h-3 text-amber-400" /> Executive Plating Standard
            </span>
          </div>

          {/* Portioned Ingredients */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-amber-600" /> Portioned Ingredients
            </h3>
            <div className="space-y-1.5 text-xs">
              {recipe.ingredients.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/70"
                >
                  <span className="font-semibold text-slate-800">{item.name}</span>
                  <span className="font-bold text-slate-600">{item.amount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Allergens Notice */}
          <div className="p-3.5 rounded-2xl bg-rose-50/90 border border-rose-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 uppercase tracking-wider">
              <AlertCircle className="w-4 h-4 text-rose-600" /> Critical Allergens
            </div>
            <p className="text-xs text-rose-950 font-medium leading-relaxed">
              {recipe.allergens.join(', ')}
            </p>
          </div>

          {/* Preparation Directives */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <ChefHat className="w-3.5 h-3.5 text-amber-600" /> Execution Directives
            </h3>
            <ol className="list-decimal list-inside text-xs text-slate-600 space-y-2 leading-relaxed">
              {recipe.steps.map((step, idx) => (
                <li key={idx} className="pl-1">
                  <span className="font-medium text-slate-700">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition"
          >
            Close Recipe Spec
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeSpecDrawer;