import { Pie, PieChart } from "recharts";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    type ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

interface Props {
    title: string;
    chartConfig: ChartConfig,
    data: any,
    nameKey: string
}
export function PieChartComponent({ title, chartConfig, data, nameKey }: Props) {
    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle className="text-xl md:text-2xl font-medium text-center">{title}</CardTitle>

            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[300px]"
                >
                    <PieChart>
                        <Pie data={data} dataKey="count" label nameKey={nameKey} />
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <ChartLegend
                            content={<ChartLegendContent nameKey={nameKey} />}
                            className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
                        />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}