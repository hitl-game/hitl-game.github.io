export function Author({ name }: { name: string | undefined }) {
  return <p>{name ?? 'Anonymous'}</p>;
}
