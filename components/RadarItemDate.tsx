import { formatIsoDe, formatItemDate, itemSourceDate, type RadarItem } from "@/lib/radar-content";

/** The item's own date: one day, or a range as two <time> elements. */
export function RadarItemDate({ item, className }: { item: Pick<RadarItem, "date" | "dateEnd">; className: string }) {
  if (!item.dateEnd || item.dateEnd === item.date) {
    return (
      <time className={className} dateTime={item.date}>
        {formatIsoDe(item.date)}
      </time>
    );
  }
  const text = formatItemDate(item);
  const [start, end] = text.split("–");
  return (
    <span className={className}>
      <time dateTime={item.date}>{start}</time>–<time dateTime={item.dateEnd}>{end}</time>
    </span>
  );
}

/** "Stadt Offenbach · 23.10.2026", or just the source name when the source page carries no publication date. */
export function RadarSourceLabel({ item }: { item: Pick<RadarItem, "sourceName" | "date" | "sourceDate"> }) {
  const published = itemSourceDate(item);
  return <>{published ? `${item.sourceName} · ${formatIsoDe(published)}` : item.sourceName}</>;
}
