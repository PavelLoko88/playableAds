export function initInactivityTimer(
  toggleIntro: () => void,
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
        console.log(`🕒 Бездействие ${timeout / 1000}с — запуск toggleIntro()`);
        toggleIntro();
      }
    }, timeout);
  };

  const stopTimer = (): void => {
    isActive = false;
    if (timerId) clearTimeout(timerId);

    activityEvents.forEach((event) => {
      window.removeEventListener(event, resetTimer);
    });

    console.log("⏹️ Детектор бездействия остановлен");
  };

  const startTimer = (): void => {
    if (isActive) return;

    isActive = true;

    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();
    console.log("▶️ Детектор бездействия запущен");
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
