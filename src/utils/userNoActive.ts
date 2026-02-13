export function initInactivityTimer(
  toggleIntro: (noActive: boolean) => void,
  timeout: number = 30000,
): {
  reset: () => void;
  stop: () => void;
  start: () => void;
} {
  let timerId: ReturnType<typeof setTimeout> | null = null;

  let isActive: boolean = true;
  const activityEvents: string[] = [
    "mousemove",
    "keydown",
    "click",
    "scroll",
    "touchstart",
    "wheel",
  ];

  const resetTimer = (): void => {
    if (!isActive) return;

    if (timerId) clearTimeout(timerId);

    timerId = setTimeout(() => {
      if (isActive) {
        toggleIntro(true);
      }
    }, timeout);
  };

  const stopTimer = (): void => {
    isActive = false;
    if (timerId) clearTimeout(timerId);

    activityEvents.forEach((event) => {
      window.removeEventListener(event, resetTimer);
    });
  };

  const startTimer = (): void => {
    if (isActive) return;

    isActive = true;

    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();
  };

  activityEvents.forEach((event) => {
    window.addEventListener(event, resetTimer);
  });

  resetTimer();

  return {
    reset: resetTimer,
    stop: stopTimer,
    start: startTimer,
  };
}

export default initInactivityTimer;
