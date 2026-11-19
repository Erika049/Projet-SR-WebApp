import { SubmitButton } from "./submit-button";
import type { Taille, Variante } from "./button";

/** Bouton qui déclenche une Server Action (liée à ses arguments via .bind). Fonctionne sans JavaScript. */
export function ActionButton({
  action,
  children,
  variante = "secondaire",
  taille = "sm",
  confirmation,
  champs,
  className,
}: {
  action: (fd: FormData) => void | Promise<void>;
  children: React.ReactNode;
  variante?: Variante;
  taille?: Taille;
  confirmation?: string;
  champs?: Record<string, string>;
  className?: string;
}) {
  return (
    <form action={action} className="inline-flex">
      {champs && Object.entries(champs).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <SubmitButton variante={variante} taille={taille} confirmation={confirmation} className={className}>
        {children}
      </SubmitButton>
    </form>
  );
}
