#!/bin/bash

# File Structure Fix Script for Tier'd
# This script checks and fixes issues with component imports and file structure

echo "🔍 Tier'd File Structure Check"
echo "============================="

# Check if we're in the right directory
if [ -f "package.json" ]; then
  echo "✅ Found package.json in current directory"
else
  # Try to find the fresh_tier_d directory
  if [ -d "fresh_tier_d" ]; then
    echo "📂 Found fresh_tier_d directory, changing to it"
    cd fresh_tier_d
  else
    echo "❌ Could not find package.json or fresh_tier_d directory"
    echo "Please run this script from the project root or fresh_tier_d directory"
    exit 1
  fi
fi

# Step 1: Check for main-layout component
echo "🔍 Checking for home/main-layout component..."
if [ ! -d "components/home" ]; then
  echo "📁 Creating components/home directory"
  mkdir -p components/home
fi

# Create main-layout component if missing
if [ ! -f "components/home/main-layout.tsx" ]; then
  echo "📝 Creating main-layout.tsx component"
  cat > components/home/main-layout.tsx << 'EOL'
import React from "react";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 container mx-auto px-4 py-8">
        {children}
      </div>
    </main>
  );
}
EOL
  echo "✅ Created components/home/main-layout.tsx"
fi

# Step 2: Check for client-wrapper component
echo "🔍 Checking for client-wrapper component..."
if [ ! -f "components/client-wrapper.tsx" ]; then
  echo "📝 Creating client-wrapper.tsx component"
  mkdir -p components
  cat > components/client-wrapper.tsx << 'EOL'
"use client";

import React from "react";

interface ClientWrapperProps {
  children: React.ReactNode;
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
  return <>{children}</>;
}
EOL
  echo "✅ Created components/client-wrapper.tsx"
fi

# Step 3: Create common layout components if missing
echo "🔍 Checking for common layout components..."

# Ensure ui directory exists
if [ ! -d "components/ui" ]; then
  echo "📁 Creating components/ui directory"
  mkdir -p components/ui
fi

# Create any missing UI components referenced in the code
declare -a ui_components=("button" "card" "container" "input" "label" "heading")

for component in "${ui_components[@]}"; do
  if [ ! -f "components/ui/${component}.tsx" ]; then
    echo "📝 Creating basic ${component}.tsx component"
    
    case $component in
      "button")
        cat > components/ui/button.tsx << 'EOL'
import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg';
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', isLoading, children, ...props }, ref) => {
    // Simplified button with basic styling
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-md font-medium transition-colors
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 
          disabled:opacity-50 ${className || ''}`}
        {...props}
      >
        {isLoading && <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
EOL
        ;;
      
      "container")
        cat > components/ui/container.tsx << 'EOL'
import * as React from "react";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={`container mx-auto px-4 ${className || ''}`}>
      {children}
    </div>
  );
}
EOL
        ;;
      
      "heading")
        cat > components/ui/heading.tsx << 'EOL'
import * as React from "react";

interface HeadingProps {
  title: string;
  description?: string;
  className?: string;
}

export function Heading({ title, description, className }: HeadingProps) {
  return (
    <div className={`space-y-2 ${className || ''}`}>
      <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  );
}
EOL
        ;;
      
      "input")
        cat > components/ui/input.tsx << 'EOL'
import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm
          file:border-0 file:bg-transparent file:text-sm file:font-medium
          placeholder:text-muted-foreground focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed
          disabled:opacity-50 ${className || ''}`}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
EOL
        ;;
      
      "label")
        cat > components/ui/label.tsx << 'EOL'
import * as React from "react";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed
          peer-disabled:opacity-70 ${className || ''}`}
        {...props}
      />
    );
  }
);

Label.displayName = "Label";

export { Label };
EOL
        ;;
      
      "card")
        cat > components/ui/card.tsx << 'EOL'
import * as React from "react";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className || ''}`}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`flex flex-col space-y-1.5 p-6 ${className || ''}`}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={`text-2xl font-semibold leading-none tracking-tight ${className || ''}`}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={`text-sm text-muted-foreground ${className || ''}`}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`p-6 pt-0 ${className || ''}`}
      {...props}
    />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`flex items-center p-6 pt-0 ${className || ''}`}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
EOL
        ;;
      
      *) # Default case for any other component
        cat > components/ui/${component}.tsx << EOL
import * as React from "react";

export default function ${component^}({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props}>
      {children}
    </div>
  );
}
EOL
        ;;
    esac
    
    echo "✅ Created components/ui/${component}.tsx"
  fi
done

# Step 4: Check page imports and fix if needed
echo "🔍 Checking app directory structure..."

# Ensure app directory exists (for Next.js app router)
if [ ! -d "app" ]; then
  echo "⚠️ Missing app directory - this should be part of a Next.js app router project"
  echo "Creating minimal app structure..."
  mkdir -p app
  
  # Create basic page.tsx
  cat > app/page.tsx << 'EOL'
import MainLayout from "@/components/home/main-layout";

export default function HomePage() {
  return (
    <MainLayout>
      <h1 className="text-3xl font-bold">Welcome to Tier'd</h1>
      <p className="mt-4">Your application is now properly set up.</p>
    </MainLayout>
  );
}
EOL
  
  # Create layout.tsx
  cat > app/layout.tsx << 'EOL'
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tier'd",
  description: "Tier'd Application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
EOL
  
  # Create globals.css
  cat > app/globals.css << 'EOL'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOL
  
  echo "✅ Created basic app directory structure"
fi

echo "🔍 Checking if next-env.d.ts exists..."
if [ ! -f "next-env.d.ts" ]; then
  echo "Creating next-env.d.ts..."
  cat > next-env.d.ts << 'EOL'
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
EOL
  echo "✅ Created next-env.d.ts"
fi

# Fix .env.local file if needed
echo "🔍 Checking .env.local file..."
if grep -q "ADMIN_PASSWORD=admin123MOCK_DB=false" .env.local; then
  echo "⚠️ Found error in .env.local file, fixing..."
  sed -i -e 's/ADMIN_PASSWORD=admin123MOCK_DB=false/ADMIN_PASSWORD=admin123\n\n# This value is correctly set above\n# MOCK_DB=false/' .env.local
  echo "✅ Fixed .env.local file"
else
  echo "✅ .env.local file looks good"
fi

echo ""
echo "✅ File structure check and fixes completed!"
echo "🚀 Your application structure should now be ready for building and deployment."
echo ""
echo "Next steps:"
echo "1. Run 'npm run build' to verify all components are found"
echo "2. If build is successful, deploy with 'npx vercel --prod'" 