"use client";
import { useEffect, useState, ReactNode } from "react";
import { useAppStore } from "@/lib/store";
export default function StorageGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    Promise.resolve(useAppStore.persist.rehydrate()).finally(() => setReady(true));
  }, []);
  if (!ready) return <main className="min-h-screen grid place-items-center text-navy" role="status">Memuatkan studio...</main>;
  return <>{children}</>;
}
