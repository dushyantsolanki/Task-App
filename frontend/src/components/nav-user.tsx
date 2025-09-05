import { LogOut, ChevronsUpDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuthStore } from '@/store/authStore';
import { useSocket } from '@/hooks/useSocket';

import AxiousInstance from '@/helper/AxiousInstance';
import useNotify from '@/hooks/useNotify';

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
    role?: string;
  };
}) {
  const { isMobile } = useSidebar();
  const { disconnect } = useSocket();
  const { logout } = useAuthStore();
  const toast = useNotify()

  const handleLogout = async () => {
    try {
      const response = await AxiousInstance.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'}/auth/logout`,
      );
      if (response.status === 200) {
        logout();
        disconnect();
        window.location.href = '/login';
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Internal Server Error');
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="flex h-10 w-10 items-center justify-center rounded-full border">
                <AvatarImage
                  src={
                    user.avatar?.startsWith('https://')
                      ? user.avatar
                      : import.meta.env.VITE_IMAGE_BASE_URL + user.avatar
                  }
                  alt={user.name}
                  className="max-h-full max-w-full object-contain"
                />
                <AvatarFallback className="rounded-full">
                  {user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="flex h-10 w-10 items-center justify-center rounded-full border">
                  <AvatarImage
                    src={
                      user.avatar?.startsWith('https://')
                        ? user.avatar
                        : import.meta.env.VITE_IMAGE_BASE_URL + user.avatar
                    }
                    alt={user.name}
                    className="max-h-full max-w-full object-contain"
                  />
                  <AvatarFallback className="rounded-full">
                    {user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>

                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 hover:cursor-pointer focus:bg-red-50 focus:text-red-600">
              <div className="flex items-center gap-2" onClick={handleLogout}>
                <LogOut className="ml-1.5" />
                Log out
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
