export function Wrapped({ items, name }: { items: readonly string[]; name: string }) {
  return (
    <div>
      <p>{'Hello' satisfies string}</p>
      <p>{['Yes', 'No']}</p>
      <ul>
        {items.map((item) => (
          <li key={item}>{item + ' pts'}</li>
        ))}
      </ul>
      <p>{'Dear ' + name + ', welcome'}</p>
    </div>
  );
}
