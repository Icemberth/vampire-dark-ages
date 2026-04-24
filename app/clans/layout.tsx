import type { ReactNode } from "react";
import { VampireShell } from "@/app/components/VampireShell";

export default function ClansLayout({ children }: { children: ReactNode }) {
  return <VampireShell>{children}</VampireShell>;
}
