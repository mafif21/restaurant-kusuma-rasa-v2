import { AppShell } from "@/components/app-shell";

export default function CmsLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
