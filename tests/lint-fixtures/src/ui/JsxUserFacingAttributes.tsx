export function Attributes() {
  return (
    <div aria-description="Panel" aria-roledescription="Board" title="Board">
      <img src="board.png" alt="Board" />
      <input aria-placeholder="Search" placeholder="Search" aria-label="Search" />
      <div role="slider" aria-valuenow={1} aria-valuetext="Low" tabIndex={0} />
      <select aria-label={'Pick'}>
        <option label="One" value="1" />
      </select>
    </div>
  );
}
