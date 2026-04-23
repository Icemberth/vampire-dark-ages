import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/auth";
import { getCharactersForUser } from "@/db/queries";

export default async function CharactersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-zinc-950 px-5 text-zinc-100">
        <p className="text-center text-zinc-300">
          Sign in to see your characters.
        </p>
        <Link
          href="/"
          className="mt-4 text-sm font-semibold text-[rgb(200,36,52)] hover:underline"
        >
          Back to home
        </Link>
      </div>
    );
  }

  const list = await getCharactersForUser(session.user.id);

  return (
    <div
      className="relative min-h-svh overflow-x-hidden text-zinc-100"
      style={{
        backgroundImage: "url(/icons/castlebackground.png)",
        backgroundSize: "cover",
        backgroundPosition: "center 28%",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.75),rgba(0,0,0,0.88))]" />
      <div className="relative z-10 mx-auto max-w-2xl px-5 py-10">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-wide text-[rgb(200,36,52)] sm:text-4xl">
            Your characters
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Signed in as {session.user.name ?? session.user.email}
          </p>
        </header>

        {list.length === 0 ? (
          <p className="rounded-xl border border-zinc-800 bg-black/40 p-6 text-center text-sm text-zinc-400">
            No characters yet. Create one when that flow is available.
          </p>
        ) : (
          <ul className="space-y-3">
            {list.map((c) => (
              <li
                key={c.id}
                className="rounded-xl border border-zinc-800 bg-black/50 p-4 shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-100">
                      {c.name}
                    </h2>
                    {c.clanName ? (
                      <p className="mt-0.5 text-sm text-[rgb(200,36,52)]/90">
                        {c.clanName}
                      </p>
                    ) : null}
                    {c.concept ? (
                      <p className="mt-2 line-clamp-2 text-sm text-zinc-400">
                        {c.concept}
                      </p>
                    ) : null}
                  </div>
                  {c.generation != null ? (
                    <span className="shrink-0 text-xs text-zinc-500">
                      Gen {c.generation}
                    </span>
                  ) : null}
                </div>
                {(c.nature || c.demeanor) && (
                  <p className="mt-3 text-xs text-zinc-500">
                    {c.nature && <span>Nature: {c.nature}</span>}
                    {c.nature && c.demeanor ? " · " : null}
                    {c.demeanor && <span>Demeanor: {c.demeanor}</span>}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}

        <p className="mt-8 text-center">
          <Link
            href="/clans"
            className="text-sm font-medium text-zinc-400 hover:text-zinc-200"
          >
            Browse clans
          </Link>
        </p>
      </div>
    </div>
  );
}
