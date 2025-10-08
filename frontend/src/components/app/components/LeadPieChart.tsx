import { type ChartConfig } from '@/components/ui/chart';
import AxiousInstance from '@/helper/AxiousInstance';
import React, { useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { PieChartComponent } from '@/charts/PieChartComponent';
import useNotify from '@/hooks/useNotify';

const chartConfig = {
  count: {
    label: 'Leads',
  },
  new: {
    label: 'New',
    color: 'var(--chart-7)',
  },
  contacted: {
    label: 'Contacted',
    color: 'var(--chart-8)',
  },
  interested: {
    label: 'Interested',
    color: ' var(--chart-10)',
  },
  lost: {
    label: 'Lost',
    color: 'var(--chart-9) ',
  },
  'follow up': {
    label: 'Follow Up',
    color: 'var(--chart-11)',
  },
} satisfies ChartConfig;

const statusMap: Record<string, string> = {
  new: 'new',
  lost: "lost",
  contacted: 'contacted',
  interested: 'interested',
  'follow-up later': 'follow up',
};

export function LeadPieChart() {
  const [data, setData] = React.useState<any>([]);
  const { on, off } = useSocket();
  const toast = useNotify()
  const [loading, setLoading] = useState(false)

  const getChartData = async () => {
    try {
      setLoading(true)
      const response = await AxiousInstance.get('/lead/pie-chart');
      const lead = await response.data.data;

      if (response.status === 200) {
        setData(() => {
          return Object.keys(chartConfig)
            .filter((key): key is Exclude<keyof typeof chartConfig, 'count'> => key !== 'count')
            .map((key) => {
              const apiItem = lead.find((item: any) => statusMap[item.leadStatus] === key);
              return {
                status: key,
                count: apiItem ? apiItem.count : 0,
                fill: chartConfig[key].color,
              };
            });
        });
      }
    } catch (error: any) {
      toast.error(error.response.data.message || 'Failed to fetch chart data');
    } finally {
      setLoading(false)
    }
  };
  React.useEffect(() => {
    getChartData();
  }, []);

  React.useEffect(() => {
    if (!on) return;

    const handleLeadUpdate = ({ type }: any) => {
      if (type === 'refresh') {
        getChartData();
      }
    };

    on('lead_update', handleLeadUpdate);

    return () => {
      off('lead_update', handleLeadUpdate);
    };
  }, [on, off]);
  return (
    <PieChartComponent
      title={'Lead Distribution'}
      chartConfig={chartConfig}
      data={data}
      nameKey={'status'}
      loading={loading}
    />
  );
}
