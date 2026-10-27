export function runLater(run: () => void): void {
  setTimeout(run, 0);
}
