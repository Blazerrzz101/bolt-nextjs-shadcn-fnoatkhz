<<<<<<< HEAD
"use client"

import { useState, useEffect } from "react"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ContributionMetrics } from "@/components/profile/contribution-metrics"
import { ActivityFeed } from "@/components/profile/activity-feed"
import { ProfileSidebar } from "@/components/profile/profile-sidebar"

export default function ProfilePage() {
=======
"use client";

import { useState, useEffect } from "react";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ContributionMetrics } from "@/components/profile/contribution-metrics";
import { ActivityFeed } from "@/components/profile/activity-feed";
import { ProfileSidebar } from "@/components/profile/profile-sidebar";

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      // Fetch data from the /api/profile route
      const data = await fetch("/api/profile").then((res) => res.json());
      setProfileData(data);
    }

    fetchData();
  }, []);

  const activityLog = profileData?.activityLog || []; // Safe fallback

>>>>>>> 64d0ba3 (fix: update materialized view configuration and client handling for product rankings)
  return (
    <div className="container py-8">
      <ProfileHeader />
      
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr,300px]">
        <div className="space-y-8">
          <ContributionMetrics />
<<<<<<< HEAD
          <ActivityFeed />
=======
          <ActivityFeed profileData={{ activityLog }} />
>>>>>>> 64d0ba3 (fix: update materialized view configuration and client handling for product rankings)
        </div>
        <ProfileSidebar />
      </div>
    </div>
<<<<<<< HEAD
  )
}
=======
  );
}
>>>>>>> 64d0ba3 (fix: update materialized view configuration and client handling for product rankings)
