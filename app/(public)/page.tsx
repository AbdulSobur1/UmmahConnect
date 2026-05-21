"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Landing } from "@/components/Landing";
import { PreviewToggle } from "@/components/PreviewToggle";
import { HomeFeed } from "@/components/screens/HomeFeed";

export default function PublicHomePage() {
  const [visitor, setVisitor] = useState(true);
  const router = useRouter();

  async function toggle() {
    if (!visitor) {
      setVisitor(true);
      return;
    }
    if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
      setVisitor(false);
      return;
    }
    const response = await fetch("/api/users/me");
    if (!response.ok) {
      router.push("/login");
      return;
    }
    setVisitor(false);
  }

  return (
    <>
      {visitor ? (
        <Landing />
      ) : (
        <AppShell>
          <HomeFeed />
        </AppShell>
      )}
      <PreviewToggle isVisitor={visitor} onToggle={toggle} />
    </>
  );
}
