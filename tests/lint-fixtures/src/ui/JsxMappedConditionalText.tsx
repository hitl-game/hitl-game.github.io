export function Tasks({ items, isDone }: { items: readonly string[]; isDone: boolean }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item}>{isDone ? 'Done' : 'Open'}</li>
      ))}
    </ul>
  );
}
