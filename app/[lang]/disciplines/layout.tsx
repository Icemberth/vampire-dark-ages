import type { ReactNode } from "react";
import { VampireShell } from "@/app/components/VampireShell";
import { localeParamSchema } from "@/lib/i18n/locale";

export default async function DisciplinesLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = localeParamSchema.parse(lang);
  return <VampireShell locale={locale}>{children}</VampireShell>;
}
