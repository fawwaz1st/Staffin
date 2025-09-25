import React from 'react';
import { Card } from './Card';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  color = 'coffee' 
}) {
  const colorClasses = {
    coffee: 'bg-coffee-50 text-coffee',
    green: 'bg-pastel-green bg-opacity-20 text-green-700',
    blue: 'bg-pastel-blue bg-opacity-20 text-blue-700',
    yellow: 'bg-pastel-yellow bg-opacity-20 text-yellow-700',
    red: 'bg-pastel-red bg-opacity-20 text-red-700',
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-ink-light font-medium">{title}</p>
          <h3 className="text-3xl font-bold text-ink mt-2 font-display">{value}</h3>
          {trend && (
            <div className="flex items-center mt-3 gap-1">
              {trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-pastel-green" />
              ) : (
                <TrendingDown className="h-4 w-4 text-pastel-red" />
              )}
              <span className={`text-sm font-medium ${
                trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}
