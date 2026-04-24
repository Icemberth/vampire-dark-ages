import type { ReactNode } from "react";
import "./list-frame.css";
import { VampireShell } from "@/app/components/VampireShell";

export default function CharactersLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <VampireShell constrainContentWidth>{children}</VampireShell>
  );
}
