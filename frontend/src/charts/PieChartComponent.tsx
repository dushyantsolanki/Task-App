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
import AxiousInstance from "@/helper/AxiousInstance";
import React from "react";
import { toast } from "sonner";
import { useSocket } from "@/hooks/useSocket";




const chartConfig = {
    count: {
        label: "Tasks",
    },
    pending: {
        label: "Pending",
        color: "var(--chart-1)",
    },
    processing: {
        label: "Processing",
        color: "var(--chart-2)",
    },
    success: {
        label: "Success",
        color: "var(--chart-3)",
    },
    failed: {
        label: "Failed",
        color: "var(--chart-4)",
    },
} satisfies ChartConfig;

export function PieChartComponent() {
    const [data, setData] = React.useState<any>([]);
    const { on, off } = useSocket()

    const getChartData = async () => {
        try {
            const response = await AxiousInstance.get('/task/status-lookup-pie');
            const task = await response.data.data
            if (response.status === 200) {
                setData(Object.entries(task).map(([status, count]) => ({
                    status,
                    count,
                    fill: `var(--color-${status})`,
                })));
            }
        } catch (error: any) {
            toast.error(error.response.data.message || "Failed to fetch chart data");
        }
    }
    React.useEffect(() => {
        getChartData();
    }, []);


    React.useEffect(() => {
        if (!on) return

        const handleTaskUpdate = ({ type }: any) => {

            if (type === "refresh") {
                getChartData()
                console.log("Chart data refreshed")
            }
        }

        on('task_update', handleTaskUpdate)

        return () => {
            off('task_update', handleTaskUpdate)
        }
    }, [on, off])
    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle className="text-xl md:text-2xl font-medium text-center">Task Status Distribution</CardTitle>

            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[300px]"
                >
                    <PieChart>
                        <Pie data={data} dataKey="count" label nameKey="status" />
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <ChartLegend
                            content={<ChartLegendContent nameKey="status" />}
                            className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
                        />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}