import React from 'react';
import { CATEGORIES_DATA } from '../data/categoriesData';
import {
  Grid,
  ShoppingBag,
  Car,
  Home,
  Briefcase,
  Wrench,
  Smartphone,
  Armchair,
  HelpCircle,
  Wheat,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface CategoryBarProps {
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  selectedCategory,
  onSelectCategory
}) => {

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Car': return <Car className="w-4 h-4" />;
      case 'Home': return <Home className="w-4 h-4" />;
      case 'Briefcase': return <Briefcase className="w-4 h-4" />;
      case 'Wrench': return <Wrench className="w-4 h-4" />;
      case 'Smartphone': return <Smartphone className="w-4 h-4" />;
      case 'Armchair': return <Armchair className="w-4 h-4" />;
      case 'HelpCircle': return <HelpCircle className="w-4 h-4" />;
      case 'Wheat': return <Wheat className="w-4 h-4" />;
      case 'ExternalLink': return <ExternalLink className="w-4 h-4" />;
      default: return <ShoppingBag className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-3 shadow-xs sticky top-20 z-30 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-2.5 min-w-max">
        
        {/* All Button */}
        <button
          onClick={() => onSelectCategory('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all ${
            selectedCategory === 'all'
              ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/30'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60'
          }`}
        >
          <Grid className="w-4 h-4 text-amber-500" />
          <span>الجميع</span>
        </button>

        {/* Dynamic Categories */}
        {CATEGORIES_DATA.map((cat) => {
          const isSelected = selectedCategory === cat.id;

          if (cat.id === 'affiliate') {
            return (
              <a
                key={cat.id}
                href="https://sawa9ly.app/?r=97834"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 transition-all shadow-2xs"
              >
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span>التسويق بالعمولة</span>
                <ExternalLink className="w-3 h-3 text-orange-600 ml-0.5" />
              </a>
            );
          }

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all ${
                isSelected
                  ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/30'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60'
              }`}
            >
              {renderIcon(cat.icon)}
              <span>{cat.nameAr}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
