<<<<<<< HEAD
import { LandingPage } from "@/components/home/landing-page"

export default function HomePage() {
  return <LandingPage />
}
=======
"use client";

import { LandingPage } from "@/components/home/landing-page";
import LiveUpdates from "@/components/LiveUpdates";

export default function HomePage() {
  return (
    <div>
      <LandingPage />
      <h1>Gaming Gear Ranked by Gamers</h1>
      <LiveUpdates />
    </div>
  );
}
>>>>>>> 64d0ba3 (fix: update materialized view configuration and client handling for product rankings)
