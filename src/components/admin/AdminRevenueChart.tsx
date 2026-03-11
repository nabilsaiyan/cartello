"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface Props {
  data: { month: string; revenue: number }[]
}

export function AdminRevenueChart({ data }: Props) {
  if (!data.length) return <p className="py-10 text-center text-sm text-neutral-400">No data yet</p>

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#a3a3a3" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#a3a3a3" }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: "12px", border: "1px solid #f5f5f5", fontSize: 12 }}
          formatter={(v) => [`€${Number(v).toFixed(2)}`, "Revenue"]}
        />
        <Bar dataKey="revenue" fill="#171717" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
