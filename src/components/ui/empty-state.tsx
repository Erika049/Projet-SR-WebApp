import { Inbox } from "lucide-react";

export function EmptyState({ titre, texte, action }: { titre: string; texte?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <Inbox className="size-8 text-slate-300" />
      <p className="font-semibold text-ink">{titre}</p>
      {texte && <p className="max-w-sm text-sm text-muted">{texte}</p>}
      {action}
    </div>
  );
}
