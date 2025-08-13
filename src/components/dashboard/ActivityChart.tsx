'use client';

import { useEffect, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { ChartTooltip, ChartTooltipContent, ChartContainer } from '@/components/ui/chart';
import { Skeleton } from '../ui/skeleton';

const chartData = [
  { month: 'Jan', requests: 0 },
  { month: 'Feb', requests: 0 },
  { month: 'Mar', requests: 0 },
  { month: 'Apr', requests: 0 },
  { month: 'May', requests: 0 },
  { month: 'Jun', requests: 0 },
  { month: 'Jul', requests: 0 },
  { month: 'Aug', requests: 0 },
  { month: 'Sep', requests: 0 },
  { month: 'Oct', requests: 0 },
  { month: 'Nov', requests: 0 },
  { month: 'Dec', requests: 0 },
];

const chartConfig = {
  requests: {
    label: 'Requests',
    color: 'hsl(var(--primary))',
  },
};

export function ActivityChart() {
  const [data, setData] = useState(chartData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setData(
      chartData.map((item) => ({
        ...item,
        requests: Math.floor(Math.random() * 4000) + 1000,
      }))
    );
    setLoading(false);
  }, []);

  if (loading) {
    return (
        <Card className="glass-card h-full">
            <CardHeader>
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-[300px] w-full" />
            </CardContent>
        </Card>
    )
  }

  return (
    <Card className="glass-card h-full">
      <CardHeader>
        <CardTitle>RADIUS Requests</CardTitle>
        <CardDescription>Total requests over the last 12 months.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} accessibilityLayer>
              <XAxis
                dataKey="month"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value / 1000}k`}
              />
              <ChartTooltip
                cursor={{ fill: 'hsl(var(--accent) / 0.2)' }}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="requests" fill="var(--color-requests)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
