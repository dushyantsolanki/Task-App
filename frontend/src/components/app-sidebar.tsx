
import {
  LayoutDashboard,
  ListTodo,
  Search,
  GalleryVerticalEnd,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useAuthStore } from "@/store/authStore"
import Greeting from "./app/Greeting"



const data = {
  // ...user and company as before
  company: {
    name: "Task Mate",
    logo: () => <GalleryVerticalEnd className="size-4" />,
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "AI Search",
      url: "/search",
      icon: Search,
    },

    {
      title: "ToDo",
      url: "/todo",
      icon: ListTodo,
    },
    // {
    //   title: "Settings",
    //   // url: "/settings",
    //   icon: Settings2,
    //   items: [

    //     {
    //       title: "Profile",
    //       url: "/settings/profile",
    //     },
    //     {
    //       title: "Security",
    //       url: "/settings/security",
    //     },
    //   ],
    // }
  ],
}

// // This is sample data.
// const data = {
//   user: {
//     name: "shadcn",
//     email: "m@example.com",
//     avatar: "/avatars/shadcn.jpg",
//   },
//   company: {
//     name: "Task Mate",
//     logo: () => <GalleryVerticalEnd className="size-4" />,
//   },
//   navMain: [
//     {
//       title: "Playground",
//       url: "#",
//       icon: SquareTerminal,
//       isActive: true,
//       items: [
//         {
//           title: "History",
//           url: "#",
//         },
//         {
//           title: "Starred",
//           url: "#",
//         },
//         {
//           title: "Settings",
//           url: "#",
//         },
//       ],
//     },
//     {
//       title: "Models",
//       url: "#",
//       icon: Bot,
//     },
//     {
//       title: "Documentation",
//       url: "#",
//       icon: BookOpen,

//     },
//     {
//       title: "Settings",
//       url: "#",
//       icon: Settings2,

//     },
//   ],

//   projects: [
//     {
//       name: "Design Engineering",
//       url: "#",
//       icon: Frame,
//     },
//     {
//       name: "Sales & Marketing",
//       url: "#",
//       icon: PieChart,
//     },
//     {
//       name: "Travel",
//       url: "#",
//       icon: Map,
//     },
//   ],
// }


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthStore()

  console.log('user ', user)

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <data.company.logo />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{data.company.name}</span>
            <Greeting />
          </div>

        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain as any} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user as any} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
