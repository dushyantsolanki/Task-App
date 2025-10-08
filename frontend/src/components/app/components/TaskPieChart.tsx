import { type ChartConfig } from '@/components/ui/chart';
import AxiousInstance from '@/helper/AxiousInstance';
import React, { useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { PieChartComponent } from '@/charts/PieChartComponent';
import useNotify from '@/hooks/useNotify';

const chartConfig = {
  count: {
    label: 'Tasks',
  },
  pending: {
    label: 'Pending',
    color: 'var(--chart-1)',
  },
  processing: {
    label: 'Processing',
    color: 'var(--chart-3)',
  },
  success: {
    label: 'Success',
    color: ' var(--chart-2)',
  },
  failed: {
    label: 'Failed',
    color: 'var(--chart-5)',
  },
} satisfies ChartConfig;

export function TaskPieChart() {
  const [data, setData] = React.useState<any>([]);
  const { on, off } = useSocket();
  const toast = useNotify()
  const [loading, setLoading] = useState(false)

  const getChartData = async () => {
    try {
      setLoading(true)
      const response = await AxiousInstance.get('/task/status-lookup-pie');
      const task = await response.data.data;
      if (response.status === 200) {
        setData(
          Object.entries(task).map(([status, count]) => ({
            status,
            count,
            fill: `var(--color-${status})`,
          })),
        );
      }
    } catch (error: any) {
      toast.error(error.response.data.message || 'Failed to fetch chart data');
    }
    finally {
      setLoading(false)
    }
  };
  React.useEffect(() => {
    getChartData();
  }, []);

  React.useEffect(() => {
    if (!on) return;

    const handleTaskUpdate = ({ type }: any) => {
      if (type === 'refresh') {
        getChartData();
      }
    };

    on('task_update', handleTaskUpdate);

    return () => {
      off('task_update', handleTaskUpdate);
    };
  }, [on, off]);
  return (
    <PieChartComponent
      title={'Task Distribution'}
      chartConfig={chartConfig}
      data={data}
      nameKey={'status'}
      loading={loading}
    />
  );
}
