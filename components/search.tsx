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