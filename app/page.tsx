import { GoogleSignInButton } from "./GoogleSignInButton";

export default function Home() {
  return (
    <div className="relative h-svh overflow-hidden text-zinc-100">
      {/* Beating-heart background */}
      <div
        className="absolute inset-0 animate-[vda-heartbeat_2.6s_ease-in-out_infinite]"
        style={{
          backgroundImage: "url(/icons/castlebackground.png)",
          backgroundSize: "cover",
          // Shift down a bit so the red area is more visible behind the hero.
          backgroundPosition: "center 28%",
          backgroundRepeat: "no-repeat",
          filter: "saturate(1.05) contrast(1.05)",
        }}
      />

      {/* Dark + blood-red overlay for readability */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(200,36,52,0.18),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(200,36,52,0.22),transparent_60%),linear-gradient(to_bottom,rgba(0,0,0,0.60),rgba(0,0,0,0.55)),linear-gradient(to_bottom,transparent_55%,rgba(200,36,52,0.22)_100%)]" />

      {/* Ornate frame */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-4 rounded-3xl border border-[rgb(200,36,52)]/15" />
        <div className="absolute inset-6 rounded-3xl border border-white/5" />
        {/* corner accents */}
        <div className="absolute left-4 top-4 h-8 w-8 border-l border-t border-[rgb(200,36,52)]/35" />
        <div className="absolute right-4 top-4 h-8 w-8 border-r border-t border-[rgb(200,36,52)]/35" />
        <div className="absolute left-4 bottom-4 h-8 w-8 border-l border-b border-[rgb(200,36,52)]/35" />
        <div className="absolute right-4 bottom-4 h-8 w-8 border-r border-b border-[rgb(200,36,52)]/35" />
      </div>

      <main className="relative z-10 flex h-full flex-col px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex-1" />

        <section className="mx-auto w-full max-w-2xl text-center">
          <h1 className="text-6xl font-bold tracking-[0.08em] text-[rgb(200,36,52)] drop-shadow-[0_10px_35px_rgba(0,0,0,0.9)] sm:text-7xl lg:text-8xl">
            Nocturnus
          </h1>
          <p className="mt-4 text-sm text-zinc-200/80 drop-shadow-[0_8px_22px_rgba(0,0,0,0.9)] sm:text-base">
            Enter the night. Shape your lineage. Build your chronicle.
          </p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5 sm:p-6 shadow-[0_18px_70px_rgba(0,0,0,0.55)]">
            <div className="text-left">
              <h2 className="text-sm font-semibold tracking-wide text-[rgb(200,36,52)]">
                Sign in
              </h2>
              <p className="mt-1 text-xs text-zinc-400/90">
                Continue with Google to begin.
              </p>
            </div>
            {/* Client-side button triggers OAuth */}
            <GoogleSignInButton />
          </div>
        </section>

        <div className="flex-1" />

        <div className="mx-auto mb-3 h-px w-40 bg-[linear-gradient(to_right,transparent,rgba(200,36,52,0.55),transparent)]" />
        <div className="mx-auto mb-3 h-3 w-3 rotate-45 border border-[rgb(200,36,52)]/50 bg-black/20" />

        <footer className="mx-auto w-full max-w-xl pb-2 text-center text-[11px] text-zinc-400/80">
          © {new Date().getFullYear()} Nocturnus
        </footer>
      </main>

      {/* Keyframes (scoped, minimal) */}
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
