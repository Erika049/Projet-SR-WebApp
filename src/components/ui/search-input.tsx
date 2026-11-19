import { Search } from "lucide-react";

/** Recherche par formulaire GET (?q=) : fonctionne sans JavaScript, idéal en 3G. */
export function SearchInput({
  defaut,
  placeholder,
  conserver = {},
  libelleBouton,
}: {
  defaut?: string;
  placeholder: string;
  conserver?: Record<string, string | undefined>;
  libelleBouton: string;
}) {
  return (
    <form method="get" className="flex w-full max-w-md items-center gap-2">
      {Object.entries(conserver).map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={v} /> : null))}
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input name="q" defaultValue={defaut} placeholder={placeholder} className="input pl-9" />
      </div>
      <button type="submit" className="rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold text-navy-700 hover:bg-navy-50">
        {libelleBouton}
      </button>
    </form>
  );
}
