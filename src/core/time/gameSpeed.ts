// Lives in core/time, not core/run, so the real-window helper can use it without an import
// cycle (core/run already imports core/time).
export const gameSpeeds = ['full', 'half', 'quarter'] as const;

export type GameSpeed = (typeof gameSpeeds)[number];
