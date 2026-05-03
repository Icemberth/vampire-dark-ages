import { notFound } from "next/navigation";
import { localeParamSchema } from "@/lib/i18n/locale";

export default async function LangLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  if (!localeParamSchema.safeParse(lang).success) {
    notFound();
  }
  return children;
}
