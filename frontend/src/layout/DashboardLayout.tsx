import { AppSidebar } from "@/components/app-sidebar"
// import { XBreadcrumb } from "@/components/custom/XBreadcrumb"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"

import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Outlet } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import Calendar from "@/components/app/components/Calendar"
import Notification from "@/components/app/components/Notification"


export default function Page() {
    const { user } = useAuthStore()
    return (
        <SidebarProvider>
            <AppSidebar greeting="Good Evening" />
            <SidebarInset>
                <header className="mb-4 flex h-20 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-18 sticky top-0 z-10 bg-background/50 backdrop-blur-sm shadow-sm border-b border-muted/50">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1 " />
                    </div>
                    {/* <XBreadcrumb
                        items={[
                            { label: "Dashboard", link: "/dashboard" },
                        ]}
                    /> */}

                    {/* Right side content */}
                    <div className="ml-auto flex items-center gap-2 sm:gap-4 pr-4">

                        {/* Notifications */}
                        <Notification />
                        {/* User Profile */}
                        <div className="flex items-center gap-2 mr-2">
                            <div className="hidden sm:block text-right">
                                <div className="text-sm font-medium leading-none">{user.name}</div>
                                <div className="text-xs text-muted-foreground mt-1">{user.role}</div>
                            </div>

                            <Avatar className="h-12 w-12">
                                <AvatarImage src={user?.avatar || ''} alt={user?.name || ''} />
                                <AvatarFallback>
                                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                        </div>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                        <div className="aspect-video rounded-xl bg-muted/50" />
                        <div className="aspect-video rounded-xl bg-muted/50" />
                        <div className="aspect-video rounded-xl bg-muted/50" />
                    </div>
                    <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 " />
                    <Outlet />
                    <Calendar />
                </div>

            </SidebarInset >
        </SidebarProvider >
    )
}