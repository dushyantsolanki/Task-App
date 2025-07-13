import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    type ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import AxiousInstance from "@/helper/AxiousInstance"
import { toast } from "sonner"
import { useSocket } from "@/hooks/useSocket"


const chartConfig = {
    tasks: {
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
        color: "var(--chart-5)",
    },
} satisfies ChartConfig

export function AreaChartComponent() {
    const [timeRange, setTimeRange] = React.useState<string>("year");
    const [filteredData, setFilteredData] = React.useState([]);
    const [data, setData] = React.useState<any>([]);
    const { on, off } = useSocket()


    const getChartData = async () => {
        try {
            const response = await AxiousInstance.get('/task/status-lookup-area');
            const task = await response.data.data
            if (response.status === 200) {
                setData(task);
            }
        } catch (error: any) {
            toast.error(error.response.data.message || "Failed to fetch chart data");
        }
    }

    React.useEffect(() => {
        getChartData();
    }, []);

    React.useEffect(() => {
        const referenceDate = new Date();
        let startDate = new Date(referenceDate);

        switch (timeRange) {

            case "week":
                startDate.setDate(referenceDate.getDate() - 6); // Last 7 days (today + 6 previous)
                break;
            case "month":
                startDate.setMonth(referenceDate.getMonth() - 1); // Last 30 days approx
                break;
            case "year":
                startDate.setFullYear(referenceDate.getFullYear() - 1);
                break;
            default:
                startDate.setMonth(referenceDate.getMonth() - 1);
        }
        const filtered = data.filter((item: any) => {
            const itemDate = new Date(item.date);
            return itemDate >= startDate && itemDate <= referenceDate;
        });

        setFilteredData(filtered);
    }, [timeRange, data]);


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
        <Card className="pt-0">
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                <div className="grid flex-1 gap-1">
                    <CardTitle className="text-xl md:text-2xl">Task Status </CardTitle>

                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger
                        className=" w-34 rounded-lg sm:ml-auto sm:flex"
                        aria-label="Select a time range"
                    >
                        <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="week" className="rounded-lg">This Week</SelectItem>
                        <SelectItem value="month" className="rounded-lg">This Month</SelectItem>
                        <SelectItem value="year" className="rounded-lg">This Year</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                >
                    <AreaChart data={filteredData}>
                        <defs>
                            <linearGradient id="fillPending" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-pending)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-pending)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                            <linearGradient id="fillProcessing" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-processing)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-processing)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                            <linearGradient id="fillSuccess" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-success)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-success)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                            <linearGradient id="fillFailed" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-failed)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-failed)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value)
                                return date.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })
                            }}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value) => {
                                        return new Date(value).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })
                                    }}
                                    indicator="dot"
                                />
                            }
                        />
                        <Area
                            dataKey="pending"
                            type="natural"
                            fill="url(#fillPending)"
                            stroke="var(--color-pending)"
                            stackId="a"
                        />
                        <Area
                            dataKey="processing"
                            type="natural"
                            fill="url(#fillProcessing)"
                            stroke="var(--color-processing)"
                            stackId="a"
                        />
                        <Area
                            dataKey="success"
                            type="natural"
                            fill="url(#fillSuccess)"
                            stroke="var(--color-success)"
                            stackId="a"
                        />
                        <Area
                            dataKey="failed"
                            type="natural"
                            fill="url(#fillFailed)"
                            stroke="var(--color-failed)"
                            stackId="a"
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}