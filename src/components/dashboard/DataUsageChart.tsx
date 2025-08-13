
'use client';

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { ChartTooltip, ChartTooltipContent, ChartContainer } from '@/components/ui/chart';

const chartData = [
  { date: '2024-07-01', upload: 222, download: 540 },
  { date: '2024-07-02', upload: 280, download: 680 },
  { date: '2024-07-03', upload: 340, download: 720 },
  { date: '2024-07-04', upload: 310, download: 810 },
  { date: '2024-07-05', upload: 450, download: 980 },
  { date: '2024-07-06', upload: 420, download: 1100 },
  { date: '2024-07-07', upload: 510, download: 1250 },
];

const chartConfig = {
  upload: {
    label: 'Upload',
    color: 'hsl(var(--chart-2))',
  },
  download: {
    label: 'Download',
    color: 'hsl(var(--chart-1))',
  },
};

export function DataUsageChart() {
  return (
    <Card className="glass-card h-full">
      <CardHeader>
        <CardTitle>Data Usage Trends</CardTitle>
        <CardDescription>Upload and download traffic over the last 7 days.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `${value} GB`}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <defs>
                <linearGradient id="fillDownload" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-download)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-download)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillUpload" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-upload)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-upload)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area
                dataKey="download"
                type="natural"
                fill="url(#fillDownload)"
                stroke="var(--color-download)"
                stackId="a"
              />
              <Area
                dataKey="upload"
                type="natural"
                fill="url(#fillUpload)"
                stroke="var(--color-upload)"
                stackId="a"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
