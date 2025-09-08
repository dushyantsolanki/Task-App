import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import React from 'react';

interface XInputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode; // like a button or icon
  error?: string | boolean | null | undefined;
  className?: string;
  containerClassName?: string;
}

export const XInputField = ({
  label,
  icon,
  error,
  className,
  rightElement,
  containerClassName,
  ...props
}: XInputFieldProps) => {
  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <Label htmlFor={props.id} className="mb-2.5 block">
          {label}
        </Label>
      )}
      <div className="relative w-full">
        {icon && (
          <div className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
            {icon}
          </div>
        )}

        <Input
          {...props}
          className={cn(
            icon && 'pl-10',
            rightElement && 'pr-12',
            error && 'border-red-500 ring-1 ring-red-500',
            className

          )}
        />

        {rightElement && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
            {rightElement}
          </span>
        )}
      </div>
      {error && <p className="mt-1.5 ml-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};
