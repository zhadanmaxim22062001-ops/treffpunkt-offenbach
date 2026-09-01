import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OF-Radar Redaktion",
  robots: { index: false, follow: false },
};

export default function AdminRadarLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-paper">{children}</div>;
}
