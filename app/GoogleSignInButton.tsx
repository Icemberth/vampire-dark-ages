"use client";

import * as React from "react";
import { signIn } from "next-auth/react";

export function GoogleSignInButton() {
  const [isLoading, setIsLoading] = React.useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        setIsLoading(true);
        try {
          await signIn("google", { callbackUrl: "/characters" });
        } finally {
          setIsLoading(false);
        }
      }}
      className="mt-5 flex w-full items-center justify-center gap-3 rounded-xl border border-[rgb(200,36,52)]/45 bg-black/20 px-4 py-3 text-sm font-semibold text-zinc-100 hover:border-[rgb(200,36,52)]/70 hover:bg-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(200,36,52)]/60"
      aria-label="Continue with Google"
      disabled={isLoading}
    >
      <span
        className="grid h-6 w-6 place-items-center rounded-full border border-zinc-700 bg-zinc-950/40"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21.8 12.24c0-.67-.06-1.32-.17-1.95H12v3.69h5.5a4.71 4.71 0 0 1-2.04 3.09v2.45h3.3c1.93-1.78 3.04-4.4 3.04-7.27Z"
            fill="#4285F4"
          />
          <path
            d="M12 22c2.76 0 5.08-.92 6.78-2.49l-3.3-2.45c-.92.62-2.09.98-3.48.98-2.66 0-4.92-1.79-5.73-4.2H2.86v2.52A10 10 0 0 0 12 22Z"
            fill="#34A853"
          />
          <path
            d="M6.27 13.84A6.01 6.01 0 0 1 5.96 12c0-.64.11-1.26.31-1.84V7.64H2.86A10 10 0 0 0 2 12c0 1.61.38 3.13 1.06 4.36l3.21-2.52Z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.96c1.5 0 2.85.52 3.91 1.53l2.93-2.93C17.08 2.92 14.76 2 12 2A10 10 0 0 0 2.86 7.64l3.41 2.52c.81-2.41 3.07-4.2 5.73-4.2Z"
            fill="#EA4335"
          />
        </svg>
      </span>
      {isLoading ? "Redirecting…" : "Continue with Google"}
    </button>
  );
}
