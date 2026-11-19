import { cn } from "@/lib/utils";

export function Field({
  label,
  erreur,
  aide,
  children,
  className,
}: {
  label: string;
  erreur?: string;
  aide?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      {children}
      {aide && !erreur && <span className="mt-1 block text-xs text-muted">{aide}</span>}
      {erreur && <span className="mt-1 block text-xs font-medium text-red-600">{erreur}</span>}
    </label>
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("input", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("input min-h-28", className)} {...props} />;
}

export function Select({
  options,
  className,
  vide,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[]; vide?: string }) {
  return (
    <select className={cn("input", className)} {...props}>
      {vide !== undefined && <option value="">{vide}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** Groupe de cases/boutons radio présentés comme des pastilles (« Tous les parents | Une classe | Enseignants »). */
export function Choix({
  name,
  type = "radio",
  options,
  defaut,
}: {
  name: string;
  type?: "radio" | "checkbox";
  options: { value: string; label: string }[];
  defaut?: string | string[];
}) {
  const coche = (v: string) => (Array.isArray(defaut) ? defaut.includes(v) : defaut === v);
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <label
          key={o.value}
          className="cursor-pointer rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-medium text-ink transition has-checked:border-navy-700 has-checked:bg-navy-700 has-checked:text-white"
        >
          <input type={type} name={name} value={o.value} defaultChecked={coche(o.value)} className="sr-only" />
          {o.label}
        </label>
      ))}
    </div>
  );
}
