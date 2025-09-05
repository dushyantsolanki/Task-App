import { AppSidebar } from '@/components/app-sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import Notification from '@/components/app/components/Notification';
import { ThemeSwitcher } from '@/components/app/components/ThemeSwitcher';

export default function DashboardLayout() {
  const { user } = useAuthStore();
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="bg-background/50 border-muted/50 sticky top-0 z-10 mb-4 flex h-20 shrink-0 items-center gap-2 border-b shadow-sm backdrop-blur-sm transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-18">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>

          {/* Right side content */}
          <div className="ml-auto flex items-center gap-2 pr-4 sm:gap-4">
            <ThemeSwitcher />

            {/* Notifications */}
            <Notification />

            {/* User Profile */}
            <div className="mr-2 flex items-center gap-2">
              <div className="hidden text-right sm:block">
                <div className="text-sm leading-none font-medium">{user.name}</div>
                <div className="text-muted-foreground mt-1 text-xs">{user.email}</div>
              </div>

              <Avatar className="flex h-12 w-12 items-center justify-center rounded-full border">
                <AvatarImage
                  src={
                    user.avatar?.startsWith('https://')
                      ? user.avatar
                      : import.meta.env.VITE_IMAGE_BASE_URL + user.avatar
                  }
                  alt={user.name as any}
                  className="max-h-full max-w-full object-contain"
                />
                <AvatarFallback className="rounded-full">
                  {user?.name
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>
        <div className="p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
