import { createContext } from 'react';
import { socketManager } from '@/helper/socket';
import Notification_Sound from '../assets/taskmate_notification.mp3'
import type { Socket } from 'socket.io-client';

interface SocketContextType {
    socket: Socket | null;
    connect: (token: string) => void;
    disconnect: () => void;
    emit: (event: string, data?: any) => void;
    on: (event: string, callback: (...args: any[]) => void) => void;
    off: (event: string, callback?: (...args: any[]) => void) => void;
    enableSound: () => void
}

export const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const sound = new Audio(Notification_Sound)
    const socket = socketManager.socket
    const connect = (token: string) => socketManager.connect(token);
    const disconnect = () => socketManager.disconnect();
    const emit = (event: string, data?: any) => socketManager.emit(event, data);
    const on = (event: string, callback: (...args: any[]) => void) =>
        socketManager.on(event, callback);
    const off = (event: string, callback?: (...args: any[]) => void) =>
        socketManager.off(event, callback);

    const enableSound = () => {
        // setIsSoundEnabled(true)
        sound.play().catch((error) => {
            console.log('Failed to play notification sound:', error)
        })
    }


    return (
        <SocketContext.Provider
            value={{ socket, connect, disconnect, emit, on, off, enableSound }}
        >
            {children}
        </SocketContext.Provider>
    );
};
