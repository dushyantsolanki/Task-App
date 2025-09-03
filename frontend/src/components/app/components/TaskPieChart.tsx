import {
    type ChartConfig,
} from "@/components/ui/chart";
import AxiousInstance from "@/helper/AxiousInstance";
import React from "react";
import { toast } from "sonner";
import { useSocket } from "@/hooks/useSocket";
import { PieChartComponent } from "@/charts/PieChartComponent";

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
        color: "var(--chart-3)",
    },
    success: {
        label: "Success",
        color: " var(--chart-2)",
    },
    failed: {
        label: "Failed",
        color: "var(--chart-5)",
    },
} satisfies ChartConfig;

export function TaskPieChart() {
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
            }
        }

        on('task_update', handleTaskUpdate)

        return () => {
            off('task_update', handleTaskUpdate)
        }
    }, [on, off])
    return (
        <PieChartComponent
            title={"Task Distribution"}
            chartConfig={chartConfig}
            data={data}
            nameKey={'status'}
        />
    );
}