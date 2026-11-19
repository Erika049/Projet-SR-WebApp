"use client";

import { useT } from "@/lib/i18n/client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useT();
  return (
    <div className="grid min-h-[60vh] place-items-center p-6 text-center">
      <div className="max-w-md">
        <h1 className="text-xl font-bold text-navy-800">{t("Une erreur est survenue", "Something went wrong")}</h1>
        <p className="mt-2 text-sm text-muted">{error.message}</p>
        <button onClick={reset} className="mt-6 rounded-lg bg-navy-700 px-4 py-2 text-sm font-semibold text-white">
          {t("Réessayer", "Try again")}
        </button>
      </div>
    </div>
  );
}
