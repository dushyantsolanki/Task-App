import { AreaChartComponent } from '@/charts/AreaChartComponent';
import BigCalendar from '@/components/app/components/BigCalendar';
import { TaskPieChart } from './TaskPieChart';
import { LeadPieChart } from './LeadPieChart';
import SEO from './SEO';

export function Dashboard() {
  return (
    <>
      <SEO
        title="TaskMate | Dashboard"
        description="Your personal TaskMate dashboard to manage tasks, track progress, and collaborate with your team."
        url="https://taskmate.dushyantportfolio.store/dashboard"
        type="website"
      />
      <div className="flex flex-1 flex-col gap-4 pt-0">
        <AreaChartComponent />
        <div className="grid gap-4 md:grid-cols-2">
          <TaskPieChart />
          <LeadPieChart />
        </div>

        <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl">
          <BigCalendar />{' '}
        </div>
      </div>
    </>
  );
}
