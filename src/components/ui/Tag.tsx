export function Tag({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-line bg-surface-2 px-3 py-1 text-xs font-medium text-muted">
      {children}
    </span>
  );
}

export function TagList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item}>
          <Tag>{item}</Tag>
        </li>
      ))}
    </ul>
  );
}
