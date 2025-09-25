import { memo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Chart = memo(({ type = 'line', data = [], dataKey, xKey = 'name', color = '#2563eb', height = 300 }) => {
  if (!data.length) return null;

  const first = data[0] || {};
  const numericKeys = Object.keys(first).filter(
    (k) => k !== xKey && typeof first[k] === 'number'
  );
  const usedKey = dataKey || numericKeys[0];
  if (!usedKey) return null;

  const ChartComponent = type === 'bar' ? BarChart : LineChart;
  const DataComponent = type === 'bar' ? Bar : Line;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ChartComponent data={data}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis 
          dataKey={xKey} 
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
        <DataComponent
          dataKey={usedKey}
          stroke={color}
          fill={color}
          strokeWidth={2}
          dot={type === 'line' ? { fill: color, strokeWidth: 2, r: 4 } : false}
        />
      </ChartComponent>
    </ResponsiveContainer>
  );
});
