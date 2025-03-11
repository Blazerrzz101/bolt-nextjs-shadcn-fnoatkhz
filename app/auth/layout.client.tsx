"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"
import { ProductCategories } from "@/types/product"

interface AuthLayoutClientProps {
  children: ReactNode
}

const testimonials = [
  {
    quote: "This platform has completely transformed how I discover and discuss gaming gear. The community insights are invaluable.",
    author: "Sofia Davis",
    role: "Pro Gamer"
  },
  {
    quote: "The detailed product comparisons and real user reviews helped me make much better purchasing decisions.",
    author: "Marcus Chen",
    role: "Tech Reviewer"
  },
  {
    quote: "I love how easy it is to track and compare different gaming peripherals. The ranking system is spot on!",
    author: "Alex Thompson",
    role: "Esports Coach"
  }
]

const categories = Object.values(ProductCategories).map(category => ({
  name: category,
  icon: "🎮"
}))

export function AuthLayoutClient({ children }: AuthLayoutClientProps) {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      {/* Left Side - Branding and Categories */}
      <div className="hidden lg:block bg-muted relative overflow-hidden">
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 bg-grid-white/10 bg-[size:30px_30px]" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3E%3Cpath d='M0 0h30v30H0z' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='1'/%3E%3C/svg%3E")`,
            maskImage: 'linear-gradient(to bottom, transparent, black, transparent)'
          }}
        />

        {/* Content */}
        <div className="relative z-10 h-full p-10 flex flex-col">
          {/* Logo */}
          <div className="flex items-center gap-2 text-lg font-bold">
            <span className="text-2xl">🎮</span> Tierd
          </div>

          {/* Categories */}
          <div className="mt-10">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              Featured Categories
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {categories.map((category, i) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-2 p-4 rounded-lg bg-black/20 hover:bg-black/30 transition-colors"
                >
                  <span className="text-xl">{category.icon}</span>
                  <span className="text-sm font-medium">{category.name}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="mt-auto">
            <div className="space-y-6">
              {testimonials.map((testimonial, i) => (
                <motion.div
                  key={testimonial.author}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.2 }}
                  className="space-y-2"
                >
                  <p className="text-lg font-medium leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex items-center justify-center p-6 md:p-8 relative">
        {/* Subtle background pattern for the right side */}
        <div 
          className="absolute inset-0 bg-grid-white/5 bg-[size:20px_20px] opacity-30" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cpath d='M0 0h20v20H0z' fill='none' stroke='rgba(255,255,255,0.05)' stroke-width='1'/%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/50 via-background/70 to-background/90" />
        
        {/* Content container with improved width */}
        <div className="relative z-10 w-full max-w-md mx-auto flex flex-col justify-center space-y-6">
          {children}
        </div>
      </div>
    </div>
  )
} 