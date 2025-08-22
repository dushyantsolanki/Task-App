import { AppSidebar } from "@/components/app-sidebar"
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
import Notification from "@/components/app/components/Notification"
import { ThemeSwitcher } from "@/components/app/components/ThemeSwitcher"



export default function DashboardLayout() {
    const { user } = useAuthStore()
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="mb-4 flex h-20 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-18 sticky top-0 z-10 bg-background/50 backdrop-blur-sm shadow-sm border-b border-muted/50">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1 " />
                    </div>


                    {/* Right side content */}
                    <div className="ml-auto flex items-center gap-2 sm:gap-4 pr-4">
                        <ThemeSwitcher />

                        {/* Notifications */}
                        <Notification />

                        {/* User Profile */}
                        <div className="flex items-center gap-2 mr-2">
                            <div className="hidden sm:block text-right">
                                <div className="text-sm font-medium leading-none">{user.name}</div>
                                <div className="text-xs text-muted-foreground mt-1">{user.email}</div>
                            </div>

                            <Avatar className="h-12 w-12 rounded-full border flex items-center justify-center ">
                                <AvatarImage
                                    src={user.avatar?.startsWith('https://') ? user.avatar : import.meta.env.VITE_IMAGE_BASE_URL + user.avatar}
                                    alt={user.name as any}
                                    className="object-contain max-w-full max-h-full"
                                />
                                <AvatarFallback className="rounded-full">
                                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                            </Avatar>


                        </div>
                    </div>
                </header>
                <div className="p-4">
                    <Outlet />
                </div>

            </SidebarInset >
        </SidebarProvider >
    )
}