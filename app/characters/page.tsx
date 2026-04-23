import Image from "next/image";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/auth";
import { getCharactersForUser } from "@/db/queries";

export default async function CharactersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <div className="flex w-full flex-1 flex-col items-center justify-center py-16 text-center">
        <p className="text-zinc-300">
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
    <div className="flex min-h-0 w-full flex-1 flex-col py-8 sm:py-10">
      <header className="mb-8 shrink-0 text-center">
        <h1 className="text-3xl font-bold tracking-wide text-[rgb(200,36,52)] sm:text-4xl">
          Your characters
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Signed in as {session.user.name ?? session.user.email}
        </p>
      </header>

      <div className="characters-list-frame box-border flex min-h-0 flex-1 flex-col overflow-visible rounded-xl bg-black/30 px-4 pb-6 pt-5 sm:px-6 sm:pb-8 sm:pt-6">
        <div className="characters-list-frame-body flex min-h-0 flex-1 flex-col">
          {list.length === 0 ? (
            <p className="flex flex-1 items-center justify-center py-6 text-center text-base text-zinc-300 sm:py-8 sm:text-lg">
              No characters yet. Create one when that flow is available.
            </p>
          ) : (
            <ul className="flex min-h-0 flex-1 flex-wrap content-start justify-start gap-4">
              {list.map((c) => (
                <li
                  key={c.id}
                  className="relative z-2 w-full max-w-md shrink-0 overflow-visible rounded-xl border border-zinc-800/70 shadow-lg"
                >
                  <div
                    aria-hidden
                    className="absolute inset-0 overflow-hidden rounded-xl bg-cover bg-center"
                    style={{
                      backgroundImage: "url(/icons/vtm-marble-red.jpg)",
                    }}
                  />
                  <div className="relative z-10 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-zinc-100 drop-shadow-sm">
                          {c.name}
                        </h2>
                        {c.clanName ? (
                          <p className="mt-0.5 text-sm text-[rgb(200,36,52)] drop-shadow-sm">
                            {c.clanName}
                          </p>
                        ) : null}
                        {c.concept ? (
                          <p className="mt-2 line-clamp-2 text-sm text-zinc-300">
                            {c.concept}
                          </p>
                        ) : null}
                      </div>
                      {c.generation != null ? (
                        <span className="shrink-0 text-xs text-zinc-400">
                          Gen {c.generation}
                        </span>
                      ) : null}
                    </div>
                    {(c.nature || c.demeanor) && (
                      <p className="mt-3 text-xs text-zinc-400">
                        {c.nature && <span>Nature: {c.nature}</span>}
                        {c.nature && c.demeanor ? " · " : null}
                        {c.demeanor && <span>Demeanor: {c.demeanor}</span>}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div
          aria-hidden
          className="characters-list-frame-corner left-[-11px] top-[-11px]"
        >
          <div className="relative h-full w-full">
            <Image
              src="/icons/vtm-corner-tl.png"
              alt=""
              fill
              unoptimized
              className="object-contain object-top-left"
              sizes="96px"
            />
          </div>
        </div>
        <div
          aria-hidden
          className="characters-list-frame-corner right-[-11px] top-[-11px]"
        >
          <div className="relative h-full w-full">
            <Image
              src="/icons/vtm-corner-tr.png"
              alt=""
              fill
              unoptimized
              className="object-contain object-top-right"
              sizes="96px"
            />
          </div>
        </div>
        <div
          aria-hidden
          className="characters-list-frame-corner bottom-[-11px] left-[-11px]"
        >
          <div className="relative h-full w-full">
            <Image
              src="/icons/vtm-corner-bl.png"
              alt=""
              fill
              unoptimized
              className="object-contain object-bottom-left"
              sizes="96px"
            />
          </div>
        </div>
        <div
          aria-hidden
          className="characters-list-frame-corner bottom-[-11px] right-[-11px]"
        >
          <div className="relative h-full w-full">
            <Image
              src="/icons/vtm-corner-br.png"
              alt=""
              fill
              unoptimized
              className="object-contain object-bottom-right"
              sizes="96px"
            />
          </div>
        </div>
      </div>

      <p className="mt-8 text-center">
        <Link
          href="/clans"
          className="text-sm font-medium text-zinc-400 hover:text-zinc-200"
        >
          Browse clans
        </Link>
      </p>
    </div>
  );
}
