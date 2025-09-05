import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react'; // or your icon library
import type { JSX } from 'react';
import { toast } from 'sonner';

interface ToastProps {
  type: string;
  title: string;
  icon: JSX.Element;
  colors: any;
  message: string
}
const useNotify = () => {
  const createToast = (title: ToastProps['title'], message: ToastProps['message'], icon: ToastProps['icon'], colors: ToastProps['colors']) => {
    return toast.custom((id) => (
      <div
        className={`relative flex items-center gap-4 p-4 rounded-2xl md:w-100 
                   backdrop-blur-xs bg-white/30 dark:bg-black/20 
                   border ${colors.border}
                   overflow-hidden transition-all duration-300 `}
      >
        {/* Liquid Glass Reflection: flowing gradient sweep */}
        <div
          className="absolute inset-0 -z-10 opacity-70 dark:opacity-20 transition-transform duration-1000"
          style={{
            background: `
              linear-gradient(-45deg, 
                transparent 0%, 
                rgba(255, 255, 255, 0.2) 30%, 
                rgba(255, 255, 255, 0.08) 50%, 
                transparent 80%
              ),
              linear-gradient(135deg, 
                ${colors.gradient} 0%, 
                transparent 50%, 
                ${colors.gradientLight} 100%
              )
            `
          }}
        />

        {/* Left Accent Bar */}
        <div
          className={`absolute left-0 top-1/2 w-1 h-6 -translate-y-1/2 
                     bg-gradient-to-b ${colors.accent} rounded-r-full opacity-80`}
        />

        {/* Icon */}
        <div className={`relative z-10 flex-shrink-0 ${colors.iconColor}`}>
          {icon}
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 min-w-0">
          <span className={`block font-semibold ${colors.titleColor}`}>
            {title}
          </span>
          <span className="block text-sm text-gray-600 dark:text-gray-300">
            {message}
          </span>
        </div>

        {/* Close Button */}
        <button
          onClick={() => toast.dismiss(id)}
          className="text-gray-500 hover:text-gray-800 
                     dark:text-gray-400 dark:hover:text-gray-50 
                     hover:bg-black/5 dark:hover:bg-white/10  border
                     w-8 h-8  cursor-pointer rounded-md transition-all duration-200 
                     focus:outline-none focus:ring-0"
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    ));
  };

  const success = (message = "Action is done", title = "Success") => {
    return createToast(

      title,
      message,
      <CheckCircle />,
      {
        border: 'border-green-300/50 dark:border-green-800/40',
        gradient: 'rgba(16, 185, 129, 0.08)',
        gradientLight: 'rgba(16, 185, 129, 0.04)',
        accent: 'from-green-400 to-green-500',
        iconColor: 'text-green-500',
        titleColor: 'text-green-500 dark:text-green-400'
      }
    );
  };

  const error = (message = "Something went wrong.", title = "Error") => {
    return createToast(
      title,
      message,
      <XCircle />,
      {
        border: 'border-red-200/50 dark:border-red-800/50',
        gradient: 'rgba(239, 68, 68, 0.08)',
        gradientLight: 'rgba(239, 68, 68, 0.04)',
        accent: 'from-red-400 to-red-500',
        iconColor: 'text-red-500',
        titleColor: 'text-red-500 dark:text-red-400'
      }
    );
  };

  const info = (message = "Here's some useful information.", title = "Information") => {
    return createToast(

      title,
      message,
      <Info />,
      {
        border: 'border-blue-200/50 dark:border-blue-800/40',
        gradient: 'rgba(59, 130, 246, 0.08)',
        gradientLight: 'rgba(59, 130, 246, 0.04)',
        accent: 'from-blue-400 to-blue-500',
        iconColor: 'text-blue-500',
        titleColor: 'text-blue-500 dark:text-blue-400'
      }
    );
  };

  const warning = (message = "Please check your input.", title = "Warning") => {
    return createToast(

      title,
      message,
      <AlertTriangle />,
      {
        border: 'border-yellow-200/50 dark:border-yellow-800/40',
        gradient: 'rgba(245, 158, 11, 0.08)',
        gradientLight: 'rgba(245, 158, 11, 0.04)',
        accent: 'from-yellow-400 to-yellow-500',
        iconColor: 'text-yellow-500',
        titleColor: 'text-yellow-500 dark:text-yellow-400'
      }
    );
  };

  return {
    success,
    error,
    info,
    warning
  };
};

export default useNotify;
