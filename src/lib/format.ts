// Formatage localisé. Les dates sont stockées « YYYY-MM-DD » ou « YYYY-MM-DDTHH:mm:ss » (heure du Cameroun).
import type { Locale } from "@/types/domain";

const tag = (l: Locale) => (l === "en" ? "en-GB" : "fr-FR");

function versDate(iso: string) {
  const [d, h = "00:00:00"] = iso.split("T");
  const [y, m, j] = d.split("-").map(Number);
  const [hh, mm] = h.split(":").map(Number);
  return new Date(y, m - 1, j, hh, mm);
}

export function nombre(n: number, l: Locale = "fr", decimales = 0) {
  return new Intl.NumberFormat(tag(l), { minimumFractionDigits: decimales, maximumFractionDigits: decimales }).format(n);
}

/** 45 000 FCFA */
export function fcfa(n: number, l: Locale = "fr") {
  return `${nombre(n, l)} FCFA`;
}

/** 101,8 M */
export function millions(n: number, l: Locale = "fr") {
  return `${nombre(n / 1_000_000, l, 1)} M`;
}

export function pourcent(n: number, l: Locale = "fr", decimales = 0) {
  return `${nombre(n, l, decimales)} %`;
}

/** 18/11/2026 */
export function dateCourte(iso: string, l: Locale = "fr") {
  return new Intl.DateTimeFormat(tag(l), { day: "2-digit", month: "2-digit", year: "numeric" }).format(versDate(iso));
}

/** 18 nov. */
export function jourMois(iso: string, l: Locale = "fr") {
  return new Intl.DateTimeFormat(tag(l), { day: "2-digit", month: "short" }).format(versDate(iso));
}

/** mercredi 18 novembre 2026 */
export function dateLongue(iso: string, l: Locale = "fr") {
  const s = new Intl.DateTimeFormat(tag(l), { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(versDate(iso));
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** 09:42 */
export function heure(iso: string) {
  return iso.includes("T") ? iso.split("T")[1].slice(0, 5) : "";
}

/** « 09:42 » si aujourd'hui, « Hier » si hier, sinon « 16 nov. » */
export function quand(iso: string, l: Locale = "fr", reference = new Date()) {
  const d = versDate(iso);
  const ref = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
  const jourD = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const ecart = Math.round((ref.getTime() - jourD.getTime()) / 86_400_000);
  if (ecart === 0) return heure(iso) || (l === "en" ? "Today" : "Aujourd'hui");
  if (ecart === 1) return l === "en" ? "Yesterday" : "Hier";
  return jourMois(iso, l);
}

/** « Aujourd'hui, 07:48 » / « Hier, 16:10 » / « 28 oct. » */
export function derniereConnexion(iso: string | null, l: Locale = "fr") {
  if (!iso) return l === "en" ? "Never" : "Jamais";
  const q = quand(iso, l);
  if (/^\d\d:\d\d$/.test(q)) return `${l === "en" ? "Today" : "Aujourd'hui"}, ${q}`;
  if (q === "Hier" || q === "Yesterday") return `${q}, ${heure(iso)}`;
  return q;
}

/** « il y a 12 min » */
export function ilYa(iso: string, l: Locale = "fr", reference = new Date()) {
  const min = Math.max(0, Math.round((reference.getTime() - versDate(iso).getTime()) / 60_000));
  if (min < 60) return l === "en" ? `${min} min ago` : `il y a ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return l === "en" ? `${h} h ago` : `il y a ${h} h`;
  return quand(iso, l, reference);
}

export function joursEntre(debutIso: string, finIso: string) {
  return Math.round((versDate(finIso).getTime() - versDate(debutIso).getTime()) / 86_400_000);
}

/** « Lun » / « Mon » */
export function jourSemaine(iso: string, l: Locale = "fr") {
  const s = new Intl.DateTimeFormat(tag(l), { weekday: "short" }).format(versDate(iso)).replace(".", "");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** « Sept. » / « Sep » à partir de « 2026-09 » */
export function moisCourt(cle: string, l: Locale = "fr") {
  const s = new Intl.DateTimeFormat(tag(l), { month: "short" }).format(versDate(`${cle}-01`));
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Date du jour « YYYY-MM-DD » en heure locale (et non UTC). */
export function aujourdhuiIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
