import Link from "next/link";

export default function DisciplinesPage() {
  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-zinc-950 text-zinc-100">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: "url(/icons/vda-background-img.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center center",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/70 via-black/80 to-black/90" />

      <main className="relative z-10 mx-auto flex min-h-dvh max-w-3xl flex-col px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-bold tracking-wide text-[#c82434] sm:text-4xl">
          Disciplines
        </h1>
        <p className="mt-4 text-sm text-zinc-400 sm:text-base">
          Powers of the blood will be catalogued here. For now, browse clans or
          return to your chronicle.
        </p>
        <p className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link
            href="/clans"
            className="font-medium text-[#c82434] hover:underline"
          >
            Clans
          </Link>
          <Link
            href="/characters"
            className="font-medium text-zinc-400 hover:text-zinc-200"
          >
            Characters
          </Link>
          <Link href="/" className="font-medium text-zinc-400 hover:text-zinc-200">
            Home
          </Link>
        </p>
      </main>
    </div>
  );
}
