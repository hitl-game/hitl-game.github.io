import { browserVisibility } from '../../platform';
import { createDispatch } from './createDispatch';
import { createPresentLoop } from './createPresentLoop';
import { createSessionSignals } from './createSessionSignals';
import type { Session, SessionOptions } from './session';
import { updatePauseReasons } from './updatePauseReasons';

export function createSession(options: SessionOptions): Session {
  const { visibility = browserVisibility } = options;
  const signals = createSessionSignals({
    state: options.state,
    isAwaitingDeploy: options.isAwaitingDeploy ?? true,
    isVisible: visibility.isDocumentVisible(),
  });
  const loop = createPresentLoop(signals, options.tuning, options.clockSources);
  // Hidden time is dropped until Story 3.5 simulates it as an absence.
  const unwatchVisibility = visibility.watchVisibility((isVisible) => {
    signals.isVisible.value = isVisible;
  });

  return {
    state: signals.state,
    pauseReasons: signals.pauseReasons,
    isAwaitingDeploy: signals.isAwaitingDeploy,
    isClockRunning: signals.isClockRunning,
    dispatch: createDispatch(signals, loop),
    pause: (reason) => {
      updatePauseReasons(signals.pauseReasons, reason, true);
    },
    resume: (reason) => {
      updatePauseReasons(signals.pauseReasons, reason, false);
    },
    markDeployed: () => {
      signals.isAwaitingDeploy.value = false;
    },
    dispose: () => {
      unwatchVisibility();
      loop.dispose();
    },
  };
}
