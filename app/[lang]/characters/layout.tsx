import type { ReactNode } from "react";
import "./list-frame.css";
import { VampireShell } from "@/app/components/VampireShell";
import { localeParamSchema } from "@/lib/i18n/locale";

export default async function CharactersLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = localeParamSchema.parse(lang);
  return (
    <VampireShell locale={locale} constrainContentWidth>
      {children}
    </VampireShell>
  );
}
