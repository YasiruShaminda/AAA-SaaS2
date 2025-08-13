
'use client';

import { Pie, PieChart, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { ChartTooltip, ChartTooltipContent, ChartContainer, ChartLegend, ChartLegendContent } from '@/components/ui/chart';

const chartData = [
  { name: 'Online', value: 45, fill: 'hsl(var(--chart-1))' },
  { name: 'Offline', value: 5, fill: 'hsl(var(--chart-2))' },
  { name: 'Issues', value: 2, fill: 'hsl(var(--chart-5))' },
];

const chartConfig = {
    clients: {
      label: 'Clients',
    },
    Online: {
      label: 'Online',
      color: 'hsl(var(--chart-1))',
    },
    Offline: {
      label: 'Offline',
      color: 'hsl(var(--chart-2))',
    },
    Issues: {
      label: 'Issues',
      color: 'hsl(var(--chart-5))',
    },
};


export function ClientStatusChart() {
  return (
    <Card className="glass-card h-full">
      <CardHeader>
        <CardTitle>Client Status</CardTitle>
        <CardDescription>Distribution of connected clients.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    strokeWidth={5}
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Pie>
                <ChartLegend
                    content={<ChartLegendContent nameKey="name" />}
                    className="-mt-4"
                />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
