export function DoorState({ isOpen }: { isOpen: boolean }) {
  return <p>{isOpen ? 'Open' : 'Closed'}</p>;
}
