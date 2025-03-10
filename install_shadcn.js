/**
 * Script to install basic shadcn/ui components
 * This will create stub components for essential UI elements that seem to be missing
 */

const fs = require('fs');
const path = require('path');

// Target directory
const TARGET_DIR = process.argv[2] || '.';
const COMPONENTS_DIR = path.join(TARGET_DIR, 'components/ui');

// Create directories if they don't exist
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Create the basic button component
function createButtonComponent() {
  const buttonPath = path.join(COMPONENTS_DIR, 'button.tsx');
  const buttonContent = `import * as React from "react";

// Simple button component to use as fallback for missing shadcn/ui
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg';
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', isLoading, children, ...props }, ref) => {
    // Basic styles for a button
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50';
    
    // Size styles
    const sizeStyles = {
      default: 'h-10 py-2 px-4',
      sm: 'h-8 px-3 text-sm',
      lg: 'h-12 px-8 text-lg',
    };
    
    // Variant styles
    const variantStyles = {
      default: 'bg-gray-900 text-white hover:bg-gray-800',
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      outline: 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
      link: 'bg-transparent text-blue-600 underline-offset-4 hover:underline',
    };
    
    // Generate class name
    const buttonClassName = [
      baseStyles,
      sizeStyles[size],
      variantStyles[variant],
      className
    ].filter(Boolean).join(' ');
    
    return (
      <button className={buttonClassName} ref={ref} {...props}>
        {isLoading ? (
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
`;

  fs.writeFileSync(buttonPath, buttonContent);
  console.log(`✅ Created Button component at ${buttonPath}`);
}

// Create a basic card component
function createCardComponent() {
  const cardDir = path.join(COMPONENTS_DIR, 'card');
  ensureDirectoryExists(cardDir);
  
  const cardPath = path.join(cardDir, 'index.tsx');
  const cardContent = `import * as React from "react";

// Card container
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={\`rounded-lg border bg-white shadow-sm \${className || ''}\`}
      {...props}
    />
  )
);
Card.displayName = "Card";

// Card header
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={\`flex flex-col space-y-1.5 p-6 \${className || ''}\`}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

// Card title
const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={\`text-2xl font-semibold \${className || ''}\`}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

// Card description
const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={\`text-sm text-gray-500 \${className || ''}\`}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

// Card content
const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={\`p-6 pt-0 \${className || ''}\`}
      {...props}
    />
  )
);
CardContent.displayName = "CardContent";

// Card footer
const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={\`flex items-center p-6 pt-0 \${className || ''}\`}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
`;

  fs.writeFileSync(cardPath, cardContent);
  console.log(`✅ Created Card components at ${cardPath}`);
}

// Main function
function main() {
  console.log(`🔧 Installing basic shadcn/ui components in ${TARGET_DIR}`);
  
  // Ensure components/ui directory exists
  ensureDirectoryExists(COMPONENTS_DIR);
  
  // Create basic components
  createButtonComponent();
  createCardComponent();
  
  // Done
  console.log('✅ Basic shadcn/ui components created successfully!');
  console.log('You can now create additional components as needed.');
}

// Run the script
main(); 