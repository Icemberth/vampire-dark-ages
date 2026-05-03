import { GoogleSignInButton } from "@/app/GoogleSignInButton";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localeParamSchema } from "@/lib/i18n/locale";
import { withLocale } from "@/lib/i18n/paths";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = localeParamSchema.parse(lang);
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    redirect(withLocale(locale, "/characters"));
  }

  const d = await getDictionary(locale);
  const year = String(new Date().getFullYear());

  return (
    <div className="relative h-svh overflow-hidden text-zinc-100">
      <div
        className="absolute inset-0 animate-[vda-heartbeat_2.6s_ease-in-out_infinite]"
        style={{
          backgroundImage: "url(/icons/castlebackground.png)",
          backgroundSize: "cover",
          backgroundPosition: "center 28%",
          backgroundRepeat: "no-repeat",
          filter: "saturate(1.05) contrast(1.05)",
        }}
      />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--vda-blood-18),transparent_55%),radial-gradient(ellipse_at_bottom,var(--vda-blood-22),transparent_60%),linear-gradient(to_bottom,rgba(0,0,0,0.60),rgba(0,0,0,0.55)),linear-gradient(to_bottom,transparent_55%,var(--vda-blood-22)_100%)]" />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-4 rounded-3xl border border-[#c82434]/15" />
        <div className="absolute inset-6 rounded-3xl border border-white/5" />
        <div className="absolute left-4 top-4 h-8 w-8 border-l border-t border-[#c82434]/35" />
        <div className="absolute right-4 top-4 h-8 w-8 border-r border-t border-[#c82434]/35" />
        <div className="absolute left-4 bottom-4 h-8 w-8 border-l border-b border-[#c82434]/35" />
        <div className="absolute right-4 bottom-4 h-8 w-8 border-r border-b border-[#c82434]/35" />
      </div>

      <main className="relative z-10 flex h-full flex-col px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex-1" />

        <section className="mx-auto w-full max-w-2xl text-center">
          <h1 className="text-6xl font-bold tracking-[0.08em] text-[#c82434] drop-shadow-[0_10px_35px_rgba(0,0,0,0.9)] sm:text-7xl lg:text-8xl">
            {d.brand}
          </h1>
          <p className="mt-4 text-sm text-zinc-200/80 drop-shadow-[0_8px_22px_rgba(0,0,0,0.9)] sm:text-base">
            {d.home.tagline}
          </p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5 sm:p-6 shadow-[0_18px_70px_rgba(0,0,0,0.55)]">
            <div className="text-left">
              <h2 className="text-sm font-semibold tracking-wide text-[#c82434]">
                {d.home.signIn}
              </h2>
              <p className="mt-1 text-xs text-zinc-400/90">{d.home.signInHint}</p>
            </div>
            <GoogleSignInButton
              callbackUrl={withLocale(locale, "/characters")}
            />
          </div>
        </section>

        <div className="flex-1" />

        <div className="mx-auto mb-3 h-px w-40 bg-[linear-gradient(to_right,transparent,var(--vda-blood-55),transparent)]" />
        <div className="mx-auto mb-3 h-3 w-3 rotate-45 border border-[#c82434]/50 bg-black/20" />

        <footer className="mx-auto w-full max-w-xl pb-2 text-center text-[11px] text-zinc-400/80">
          {d.home.footer.replace("{year}", year)}
        </footer>
      </main>

      <style>{`
        @keyframes vda-heartbeat {
          0%, 100% { transform: scale(1); }
          18% { transform: scale(1.02); }
          28% { transform: scale(0.995); }
          42% { transform: scale(1.03); }
          56% { transform: scale(1.0); }
        }
      `}</style>
    </div>
  );
}
