import React from 'react';
import { ChevronRight } from 'lucide-react';

const Breadcrumbs = ({ items = [] }) => {
  return (
    <nav className="flex items-center gap-2 mb-6 text-sm">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && (
            <ChevronRight size={16} className="text-gray-400" />
          )}
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className="text-[#9FB9B3] hover:underline font-medium"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-gray-600 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
