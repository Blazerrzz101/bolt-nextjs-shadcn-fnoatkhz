"use client"

import { HeroSection } from "@/components/home/hero-section"
import { ProductRankings } from "@/components/home/product-rankings"
import { FeaturesSection } from "@/components/home/features-section"
import { Footer } from "@/components/layout/footer"
import { Particles } from "@/components/ui/particles"
import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      <div className="fixed inset-0 overflow-hidden">
        <Particles className="absolute inset-0" quantity={150} />
      </div>
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Product Rankings Section */}
      <section className="relative z-10 border-t border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto max-w-7xl px-6 py-24">
          <div className="mb-12 text-center">
            <h2 className="gradient-text text-3xl font-bold tracking-tight sm:text-4xl">
              Top Ranked Gaming Gear
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse the highest rated products in each category, ranked by our community of passionate gamers
            </p>
          </div>
          <ProductRankings />
        </div>
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* Footer */}
      <Footer />

      <div className="relative flex flex-col items-center justify-center min-h-screen py-2">
        <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
          <h1 className="text-6xl font-bold">
            Welcome to{' '}
            <span className="text-blue-600">
              Tier'd
            </span>
          </h1>

          <p className="mt-3 text-2xl">
            The product ranking platform where your vote matters!
          </p>

          <div className="mt-6 flex max-w-4xl flex-wrap items-center justify-around sm:w-full">
            <Link
              href="/rankings"
              className="p-6 mt-6 text-left border w-96 rounded-xl hover:text-blue-600 focus:text-blue-600"
            >
              <h3 className="text-2xl font-bold">Product Rankings &rarr;</h3>
              <p className="mt-4 text-xl">
                See which products are trending based on user votes.
              </p>
            </Link>

            <Link
              href="/test-vote"
              className="p-6 mt-6 text-left border w-96 rounded-xl hover:text-blue-600 focus:text-blue-600"
            >
              <h3 className="text-2xl font-bold">Test Vote System &rarr;</h3>
              <p className="mt-4 text-xl">
                Try out our voting system to see how it works.
              </p>
            </Link>

            <Link
              href="/test-simple"
              className="p-6 mt-6 text-left border w-96 rounded-xl hover:text-green-600 focus:text-green-600 bg-green-50"
            >
              <h3 className="text-2xl font-bold">Simple Test Page &rarr;</h3>
              <p className="mt-4 text-xl">
                Simplified implementation that works reliably in deployment.
              </p>
            </Link>
          </div>
        </main>
      </div>
    </>
  )
}

