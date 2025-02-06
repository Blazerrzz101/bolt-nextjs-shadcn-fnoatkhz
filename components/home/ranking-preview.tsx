<<<<<<< HEAD
"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { products } from "@/lib/data";
import Image from "next/image";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { type MouseEvent } from "react";
import { fadeInVariants, slideUpVariants, pulseVariants } from "@/components/animations";

export function RankingPreview() {
  const topProduct = products[0];

  const handleVote = (type: 'up' | 'down') => (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // Handle vote logic here
  };

  if (!topProduct) {
    return null;
  }
=======
```tsx
"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { products } from "@/lib/data"
import Image from "next/image"
import { ThumbsUp, ThumbsDown } from "lucide-react"

export function RankingPreview() {
  const topProduct = products[0]
>>>>>>> 64d0ba3 (fix: update materialized view configuration and client handling for product rankings)

  return (
    <div className="container py-24">
      <motion.div
<<<<<<< HEAD
        variants={fadeInVariants}
        initial="initial"
        animate="animate"
        exit="exit"
=======
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
>>>>>>> 64d0ba3 (fix: update materialized view configuration and client handling for product rankings)
        className="text-center"
      >
        <h2 className="text-3xl font-bold">How Rankings Work</h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Our community-driven ranking system ensures the best products rise to the top
        </p>
      </motion.div>

      <div className="mt-16">
        <motion.div
<<<<<<< HEAD
          variants={slideUpVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="relative mx-auto max-w-3xl"
        >
          <Card className={cn("ranking-card overflow-hidden")}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
            
            <div className="relative z-10 flex items-center gap-6 p-8">
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-7xl font-bold text-transparent">
=======
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative mx-auto max-w-3xl"
        >
          <Card className="ranking-card overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
            
            <div className="relative z-10 flex items-center gap-6 p-8">
              <div className="warm-text-gradient text-7xl font-bold">
>>>>>>> 64d0ba3 (fix: update materialized view configuration and client handling for product rankings)
                #1
              </div>

              <div className="relative h-32 w-32 overflow-hidden rounded-lg">
                <Image
                  src={topProduct.imageUrl}
                  alt={topProduct.name}
                  fill
                  className="object-cover"
<<<<<<< HEAD
                  priority
=======
>>>>>>> 64d0ba3 (fix: update materialized view configuration and client handling for product rankings)
                />
              </div>

              <div className="flex-1">
                <h3 className="text-2xl font-bold">{topProduct.name}</h3>
                <p className="mt-2 text-muted-foreground">
                  {topProduct.description}
                </p>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
<<<<<<< HEAD
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleVote('down')}
                    className={cn(
                      "hover:bg-destructive/10",
                      topProduct.userVote === "down" && "text-destructive"
                    )}
                    type="button"
                  >
                    <ThumbsDown className="h-6 w-6" />
                  </Button>
                  <span className="min-w-[3ch] text-center text-xl font-bold">
                    {topProduct.votes}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleVote('up')}
                    className={cn(
                      "hover:bg-primary/10",
                      topProduct.userVote === "up" && "text-primary"
                    )}
                    type="button"
                  >
                    <ThumbsUp className="h-6 w-6" />
                  </Button>
=======
                  <button className="vote-button">
                    <ThumbsDown className="h-6 w-6" />
                  </button>
                  <span className="min-w-[3ch] text-center text-xl font-bold">
                    {topProduct.votes}
                  </span>
                  <button className="vote-button active">
                    <ThumbsUp className="h-6 w-6" />
                  </button>
>>>>>>> 64d0ba3 (fix: update materialized view configuration and client handling for product rankings)
                </div>
              </div>
            </div>
          </Card>

<<<<<<< HEAD
          <motion.div
            className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-primary/10"
            variants={pulseVariants}
            animate="animate"
          />
          <motion.div
            className="absolute -bottom-4 -left-4 h-8 w-8 rounded-full bg-primary/20"
            variants={pulseVariants}
            animate="animate"
=======
          {/* Floating Elements */}
          <motion.div
            className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-primary/10"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-4 -left-4 h-8 w-8 rounded-full bg-primary/20"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
>>>>>>> 64d0ba3 (fix: update materialized view configuration and client handling for product rankings)
          />
        </motion.div>
      </div>
    </div>
<<<<<<< HEAD
  );
} 
=======
  )
}
```
>>>>>>> 64d0ba3 (fix: update materialized view configuration and client handling for product rankings)
