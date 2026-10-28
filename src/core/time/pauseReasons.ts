// The vocabulary only: the live set of active reasons is session state in app/session.
export const pauseReasons = [
  'heavyDecision',
  'awayReport',
  'settings',
  'shortcutOverlay',
  'backlog',
] as const;

export type PauseReason = (typeof pauseReasons)[number];
