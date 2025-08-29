import { AreaChartComponent } from "@/charts/AreaChartComponent";
import BigCalendar from "@/components/app/components/BigCalendar";
import { PieChartComponent } from "@/charts/PieChartComponent";

export function Dashboard() {
    return (
        <div className="flex flex-1 flex-col gap-4  pt-0">

            <AreaChartComponent />
            <div className="grid gap-4 md:grid-cols-2 ">

                <PieChartComponent />
                <PieChartComponent />
            </div>



            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 " >
                <BigCalendar /> </div>
        </div >
    )
}
