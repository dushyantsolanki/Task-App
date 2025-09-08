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
                   backdrop-blur-xl bg-white/10 dark:bg-black/30 
                   border ${colors.border}
                   overflow-hidden transition-all duration-300 `}
      >
        {/* Liquid Glass Reflection: flowing gradient sweep */}
        <div
          className="absolute inset-0 -z-10 opacity-60 dark:opacity-30 transition-transform duration-1000"
          style={{
            background: `
              linear-gradient(-45deg, 
                transparent 0%, 
                ${colors.gradientLight} 30%, 
                ${colors.gradient} 50%, 
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
                     w-8 h-8 cursor-pointer rounded-md transition-all duration-200 
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
        border: 'border-green-300/50 dark:border-green-900/50',
        gradient: 'rgba(16, 185, 129, 0.15)',
        gradientLight: 'rgba(16, 185, 129, 0.05)',
        accent: 'from-green-500 to-green-600',
        iconColor: 'text-green-600 dark:text-green-500',
        titleColor: 'text-green-600 dark:text-green-500'
      }
    );
  };

  const error = (message = "Something went wrong.", title = "Error") => {
    return createToast(
      title,
      message,
      <XCircle />,
      {
        border: 'border-red-300/50 dark:border-red-900/50',
        gradient: 'rgba(239, 68, 68, 0.15)',
        gradientLight: 'rgba(239, 68, 68, 0.05)',
        accent: 'from-red-500 to-red-600',
        iconColor: 'text-red-600 dark:text-red-500',
        titleColor: 'text-red-600 dark:text-red-500'
      }
    );
  };

  const info = (message = "Here's some useful information.", title = "Information") => {
    return createToast(
      title,
      message,
      <Info />,
      {
        border: 'border-blue-300/50 dark:border-blue-900/50',
        gradient: 'rgba(59, 130, 246, 0.15)',
        gradientLight: 'rgba(59, 130, 246, 0.05)',
        accent: 'from-blue-500 to-blue-600',
        iconColor: 'text-blue-600 dark:text-blue-500',
        titleColor: 'text-blue-600 dark:text-blue-500'
      }
    );
  };

  const warning = (message = "Please check your input.", title = "Warning") => {
    return createToast(
      title,
      message,
      <AlertTriangle />,
      {
        border: 'border-yellow-300/50 dark:border-yellow-900/50',
        gradient: 'rgba(245, 158, 11, 0.15)',
        gradientLight: 'rgba(245, 158, 11, 0.05)',
        accent: 'from-yellow-500 to-yellow-600',
        iconColor: 'text-yellow-600 dark:text-yellow-500',
        titleColor: 'text-yellow-600 dark:text-yellow-500'
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