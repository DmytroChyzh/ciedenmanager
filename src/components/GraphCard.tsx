import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';
import React from 'react';

interface GraphCardProps {
  title: string;
  value: number;
  data: { day: string; date: string; value: number }[];
  type?: 'line' | 'bar';
  icon: React.ReactNode;
  percent: number;
  color?: string; // hex або tailwind клас
}

// Додаю 25 до тіксів
const yTicks = [0, 5, 10, 15, 20, 25];

export default function GraphCard({ title, value, data, type = 'line', icon, percent, color = '#651FFF' }: GraphCardProps) {
  const up = percent >= 0;
  return (
    <div className="bg-white rounded-2xl border border-[#ede7ff] flex flex-col p-8 min-w-[260px] min-h-[260px]">{/* Видалено всі класи тіні */}
      <div className="flex items-center gap-3 mb-2">
        <span className="w-7 h-7 flex items-center justify-center">{icon}</span>
        <span className="text-[#651FFF] font-bold text-lg md:text-xl">{title}</span>
      </div>
      <div className="flex items-end gap-3 mb-2">
        <span className="text-3xl md:text-4xl font-extrabold text-[#222]">{value}</span>
        <span className={`flex items-center gap-1 text-base font-semibold ${up ? 'text-green-500' : 'text-red-500'}`}>{up ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg> : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>}{Math.abs(percent)}% <span className="text-[#8B97B0] font-normal ml-1">за тиждень</span></span>
      </div>
      <div className="w-full min-h-[200px] animate-fadeIn">
        <ResponsiveContainer width="100%" height={200}>
          {type === 'bar' ? (
            <BarChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#E0E3E7" vertical={false} horizontal={true} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} stroke="#8B97B0" fontSize={13} />
              <YAxis domain={[0, 25]} ticks={yTicks} interval={0} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8B97B0', fontWeight: 500 }} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #ede7ff', borderRadius: 12, color: color }} />
              <Bar dataKey="value" fill={color} radius={[8, 8, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#E0E3E7" vertical={false} horizontal={true} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} stroke="#8B97B0" fontSize={13} />
              <YAxis domain={[0, 25]} ticks={yTicks} interval={0} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8B97B0', fontWeight: 500 }} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #ede7ff', borderRadius: 12, color: color }} />
              <Line type="monotone" dataKey="value" stroke={color} strokeWidth={3} dot={{ r: 5, fill: color }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
} 