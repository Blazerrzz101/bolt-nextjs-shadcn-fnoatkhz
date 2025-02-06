<<<<<<< HEAD
"use client";

import { useState, type ChangeEvent } from 'react';
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchProps {
  className?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}

export const Search = ({
  className,
  placeholder = "Search here...",
  onChange
}: SearchProps) => {
  const [value, setValue] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange?.(newValue);
  };

  return (
    <div className={cn("search-container", className)}>
      <Input
        type="search"
        value={value}
        onChange={handleChange}
        className="search-input"
        placeholder={placeholder}
        aria-label="Search input"
      />
    </div>
  );
}; 
=======
"use client"

import * as React from "react"
import { Search as SearchIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface SearchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch: (value: string) => void
}

export function Search({ className, onSearch, ...props }: SearchProps) {
  const [value, setValue] = React.useState("")

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value)
    }, 300)

    return () => clearTimeout(timer)
  }, [value, onSearch])

  return (
    <div className={cn("relative", className)}>
      <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        {...props}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-9"
        placeholder="Search products..."
      />
    </div>
  )
}
>>>>>>> 64d0ba3 (fix: update materialized view configuration and client handling for product rankings)
