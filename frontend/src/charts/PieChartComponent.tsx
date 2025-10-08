import { Pie, PieChart, LabelList } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';
import { Spinner } from '@/components/ui/kibo-ui/spinner';

interface Props {
  title: string;
  chartConfig: ChartConfig;
  data: any;
  nameKey: string;
  trend?: { value: string; className?: string }; // Optional trend prop
  loading: boolean
}

export function PieChartComponent({ title, chartConfig, data, nameKey, trend, loading }: Props) {
  function isAllCountsZero(data: { status: string; count: number; fill: string }[]): boolean {
    return data.every(item => item.count === 0);
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-center text-xl font-medium md:text-2xl">
          {title}
          {trend && (
            <Badge
              variant="outline"
              className={trend.className || 'text-green-500 bg-green-500/10 border-none ml-2'}
            >
              <TrendingUp className="h-4 w-4" />
              <span>{trend.value}</span>
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[300px]"
        >
          {loading ? <div className='h-full w-full flex items-center justify-center'> <Spinner className="text-primary h-8 w-8" /> </div> : data?.length && !isAllCountsZero(data) ? (
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={data}
                dataKey="count"
                nameKey={nameKey}
                innerRadius={30}
                cornerRadius={8}
                paddingAngle={4}
              >
                <LabelList
                  dataKey="count"
                  stroke="none"
                  fontSize={12}
                  fontWeight={500}
                  fill="currentColor"
                  formatter={(value: number) => value.toString()}
                />
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey={nameKey} />}
                className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
              />
            </PieChart>
          ) : (
            <h3 className="h-full flex items-center text-2xl font-medium justify-center">
              No Data Available
            </h3>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}