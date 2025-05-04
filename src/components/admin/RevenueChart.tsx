
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Props interface for RevenueChart component
 */
interface RevenueChartProps {
  data: { name: string; amount: number }[]; // Array of revenue data points by day
}

/**
 * RevenueChart - Visual representation of revenue data
 * 
 * Displays a responsive area chart showing revenue trends over time.
 * Uses Recharts library to render the visualization.
 */
export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 0,
              }}
            >
              {/* Gradient fill definition for the area chart */}
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#84cc16" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
                </linearGradient>
              </defs>
              {/* Chart grid lines */}
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              {/* X-axis (days) */}
              <XAxis dataKey="name" />
              {/* Y-axis (revenue amount with $ prefix) */}
              <YAxis 
                tickFormatter={(value) => `$${value}`}
                width={45}
              />
              {/* Tooltip for hovering over data points */}
              <Tooltip 
                formatter={(value) => [`$${value}`, "Revenue"]}
                contentStyle={{
                  backgroundColor: 'rgba(24, 24, 27, 0.8)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: 'white'
                }}
              />
              {/* The actual area visualization */}
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#84cc16" 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
