import { Bell, X } from "lucide-react"
import { useEffect, useState } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

import { useSocket } from "@/hooks/useSocket"
import AxiousInstance from "@/helper/AxiousInstance"
import moment from "moment"
import { useNavigate } from "react-router-dom"

interface NotificationProps {
    className?: string
}

interface NotificationItem {
    _id: string
    type: string
    title: string
    body: string
    path: string
    createdAt: string
}

export default function Notification({ className = "" }: NotificationProps) {
    const { on, off, enableSound } = useSocket()
    const [notificationData, setNotificationData] = useState<NotificationItem[]>([])
    const navigate = useNavigate()

    const getAllNotification = async () => {
        try {
            const response = await AxiousInstance.get('/notification')
            if (response.status === 200) {
                setNotificationData(response.data.notifications)

            }
        } catch (error: any) {
            console.log('Error ', error)
        }
    }

    useEffect(() => {
        getAllNotification()
    }, [])

    useEffect(() => {
        if (!on) return

        const handleNotification = (newNotification: any) => {
            enableSound()
            setNotificationData((prev) => [...prev, newNotification])
        }

        on('notification', handleNotification)

        return () => {
            off('notification', handleNotification)
        }
    }, [on, off, enableSound])

    const handleNotificationClick = (notification: NotificationItem) => {
        if (notification.path) {
            navigate(notification.path)
        }
    }

    const handleClearNotification = async (id: string) => {
        try {
            const response = await AxiousInstance.delete(`/notification/${id}`)
            if (response.status === 200) {
                setNotificationData((prev) => prev.filter((notif) => notif._id !== id))
            }
        } catch (error) {
            console.error("Failed to delete notification", error)
        }


    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className={`relative cursor-pointer p-2 rounded-md hover:bg-accent hover:text-accent-foreground hover:scale-110 transition-all duration-200 flex items-center justify-center ${className}`}>
                    <Bell className={`h-6 w-6 ${notificationData.length > 0 ? "animate-bell-shake" : ""}`} />
                    {notificationData.length > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center animate-badge-scale">
                            {notificationData.length}
                        </span>
                    )}
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="mt-5.5 w-80 max-h-84 scrollbar-hide">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notificationData.length > 0 ? (
                    notificationData.map((notification) => (
                        <DropdownMenuItem
                            key={notification._id}
                            className="flex flex-col items-start p-3 cursor-pointer hover:bg-accent relative"
                        >
                            {/* Header Row: Title + Badge + X Icon */}
                            <div className="w-full flex justify-between">
                                <Badge variant='outline' className="text-xs rounded-sm  capitalize">
                                    {notification.type}
                                </Badge>
                                <button
                                    type="button"
                                    className="p-1 text-muted-foreground hover:text-destructive border hover:bg-amber-50 dark:hover:bg-amber-50/20 rounded-md cursor-pointer "
                                    data-disabled // prevents dropdown close
                                    tabIndex={-1}   // removes focusable behavior
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        e.preventDefault()
                                        handleClearNotification(notification._id)
                                    }}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex items-center justify-between w-full ">
                                <div className="font-medium">{notification.title}</div>
                            </div>

                            <div
                                className="w-full"
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="text-sm text-muted-foreground mb-1">{notification.body}</div>
                                <div className="text-xs text-muted-foreground">
                                    {moment(notification.createdAt).format('DD MMM YYYY, hh:mm A')}

                                </div>

                            </div>
                        </DropdownMenuItem>
                    ))
                ) : (
                    <DropdownMenuItem disabled>No new notifications</DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
