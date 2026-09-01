import { AUDIENCE_OPTIONS, CATEGORY_LABELS, RADAR_CATEGORIES, RADAR_URGENCIES, URGENCY_LABELS } from "@/lib/radar/validation";

type DefaultValues = {
  category?: string;
  headlineDe?: string;
  summaryDe?: string;
  actionDe?: string;
  sourceName?: string;
  sourceUrl?: string;
  urgency?: string;
  deadline?: string | null;
  audience?: string[];
  streets?: string[];
};

/**
 * Field markup shared by the compose and edit forms — not a <form> itself,
 * each caller wraps its own with its own server action. Every control is
 * large enough to hit one-handed on a phone: this exists so a board member
 * can approve or compose an item standing in their shop, not at a desk.
 */
export function ItemFormFields({ defaultValues = {}, errors = {} }: { defaultValues?: DefaultValues; errors?: Record<string, string> }) {
  const fieldClass = "w-full border bg-paper px-4 py-4 font-display text-[16px]";
  const labelClass = "font-mono text-[12px] uppercase tracking-[0.1em] text-muted";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="category" className={labelClass}>
          Rubrik
        </label>
        <select
          id="category"
          name="category"
          defaultValue={defaultValues.category}
          className={fieldClass}
          style={{ borderColor: errors.category ? "var(--c-accent)" : "var(--c-line)" }}
        >
          {RADAR_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
        {errors.category && <p className="font-mono text-[12px] text-accent">{errors.category}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="headlineDe" className={labelClass}>
          Überschrift
        </label>
        <input
          id="headlineDe"
          name="headlineDe"
          type="text"
          maxLength={140}
          defaultValue={defaultValues.headlineDe}
          className={fieldClass}
          style={{ borderColor: errors.headlineDe ? "var(--c-accent)" : "var(--c-line)" }}
        />
        {errors.headlineDe && <p className="font-mono text-[12px] text-accent">{errors.headlineDe}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="summaryDe" className={labelClass}>
          Zusammenfassung
        </label>
        <textarea
          id="summaryDe"
          name="summaryDe"
          rows={4}
          defaultValue={defaultValues.summaryDe}
          className={fieldClass}
          style={{ borderColor: errors.summaryDe ? "var(--c-accent)" : "var(--c-line)" }}
        />
        {errors.summaryDe && <p className="font-mono text-[12px] text-accent">{errors.summaryDe}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="actionDe" className={labelClass}>
          Was das heißt
        </label>
        <textarea
          id="actionDe"
          name="actionDe"
          rows={3}
          defaultValue={defaultValues.actionDe}
          className={fieldClass}
          style={{ borderColor: errors.actionDe ? "var(--c-accent)" : "var(--c-line)" }}
        />
        <p className="text-[13px] text-muted">
          Sagt, was zu prüfen ist und wo — keine Rechts-, Steuer- oder Finanzberatung, keine Frist nennen, die die
          Quelle nicht selbst nennt.
        </p>
        {errors.actionDe && <p className="font-mono text-[12px] text-accent">{errors.actionDe}</p>}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="sourceName" className={labelClass}>
            Quelle — Name
          </label>
          <input
            id="sourceName"
            name="sourceName"
            type="text"
            defaultValue={defaultValues.sourceName}
            className={fieldClass}
            style={{ borderColor: errors.sourceName ? "var(--c-accent)" : "var(--c-line)" }}
          />
          {errors.sourceName && <p className="font-mono text-[12px] text-accent">{errors.sourceName}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="sourceUrl" className={labelClass}>
            Quelle — Link
          </label>
          <input
            id="sourceUrl"
            name="sourceUrl"
            type="url"
            defaultValue={defaultValues.sourceUrl}
            className={fieldClass}
            style={{ borderColor: errors.sourceUrl ? "var(--c-accent)" : "var(--c-line)" }}
          />
          {errors.sourceUrl && <p className="font-mono text-[12px] text-accent">{errors.sourceUrl}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className={labelClass}>Dringlichkeit</span>
        <div className="flex flex-wrap gap-3">
          {RADAR_URGENCIES.map((u) => (
            <label
              key={u}
              className="flex items-center gap-2 border px-4 py-3 font-display text-[15px]"
              style={{ borderColor: "var(--c-line)" }}
            >
              <input type="radio" name="urgency" value={u} defaultChecked={defaultValues.urgency === u || (!defaultValues.urgency && u === "mid")} />
              {URGENCY_LABELS[u]}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="deadline" className={labelClass}>
          Frist (nur falls die Quelle ausdrücklich eine nennt)
        </label>
        <input
          id="deadline"
          name="deadline"
          type="date"
          defaultValue={defaultValues.deadline ?? ""}
          className={fieldClass}
          style={{ borderColor: "var(--c-line)", maxWidth: "220px" }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className={labelClass}>Zielgruppe</span>
        <div className="flex flex-wrap gap-3">
          {AUDIENCE_OPTIONS.map((a) => (
            <label
              key={a}
              className="flex items-center gap-2 border px-4 py-3 font-display text-[14px]"
              style={{ borderColor: "var(--c-line)" }}
            >
              <input type="checkbox" name="audience" value={a} defaultChecked={defaultValues.audience?.includes(a)} />
              {a}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="streets" className={labelClass}>
          Betroffene Straßen (mit Komma getrennt, nur bei Baustellen relevant)
        </label>
        <input
          id="streets"
          name="streets"
          type="text"
          defaultValue={defaultValues.streets?.join(", ")}
          className={fieldClass}
          style={{ borderColor: "var(--c-line)" }}
        />
      </div>
    </div>
  );
}
