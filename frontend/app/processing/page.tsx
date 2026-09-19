"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// This page is no longer part of the flow — redirect to home
export default function ProcessingPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/"); }, [router]);
  return null;
}
