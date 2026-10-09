"use client";

import dynamic from 'next/dynamic';

const HabitsClient = dynamic(() => import('./habits-client'), { ssr: false });

export default function HabitsPage() {
  return <HabitsClient />;
}
