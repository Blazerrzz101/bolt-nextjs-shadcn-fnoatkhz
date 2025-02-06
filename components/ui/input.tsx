<<<<<<< HEAD
import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  // Add any custom props here if needed in the future
  customProp?: never;
}
=======
import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}
>>>>>>> 64d0ba3 (fix: update materialized view configuration and client handling for product rankings)

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
<<<<<<< HEAD
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
=======
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
>>>>>>> 64d0ba3 (fix: update materialized view configuration and client handling for product rankings)
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
<<<<<<< HEAD
Input.displayName = "Input";

export { Input }; 
=======
Input.displayName = 'Input';

export { Input };
>>>>>>> 64d0ba3 (fix: update materialized view configuration and client handling for product rankings)
