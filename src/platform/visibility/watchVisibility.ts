export interface VisibilitySource {
  readonly isDocumentVisible: () => boolean;
  readonly watchVisibility: (onChange: (isVisible: boolean) => void) => () => void;
}

export const isDocumentVisible = (): boolean => document.visibilityState === 'visible';

export function watchVisibility(onChange: (isVisible: boolean) => void): () => void {
  const notify = (): void => {
    onChange(isDocumentVisible());
  };
  document.addEventListener('visibilitychange', notify);
  return () => {
    document.removeEventListener('visibilitychange', notify);
  };
}

export const browserVisibility: VisibilitySource = { isDocumentVisible, watchVisibility };
