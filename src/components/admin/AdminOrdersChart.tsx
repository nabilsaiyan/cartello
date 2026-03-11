"use client"

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface Props {
  data: { month: string; orders: number }[]
}

export function AdminOrdersChart({ data }: Props) {
  if (!data.length) return <p className="py-10 text-center text-sm text-neutral-400">No data yet</p>

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#a3a3a3" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#a3a3a3" }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: "12px", border: "1px solid #f5f5f5", fontSize: 12 }}
          formatter={(v) => [String(v), "Orders"]}
        />
        <Line type="monotone" dataKey="orders" stroke="#171717" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
