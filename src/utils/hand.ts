export function initHandClick(): void {
  const game = document.querySelector(".game") as HTMLElement;

  const events = ["click", "touchstart", "mousedown", "pointerdown"];

  const handler = (): void => {
    const hand = document.querySelector(".hand") as HTMLElement | null;
    hand?.classList.add("disable");
  };

  events.forEach((event) => {
    game.addEventListener(event, handler);
  });
}
