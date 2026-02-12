export function initHandClick(): void {
  const game = document.querySelector(".game") as HTMLElement;
  game.addEventListener("click", (e: MouseEvent) => {
    const hand = document.querySelector(".hand") as HTMLElement | null;
    hand?.classList.add("disable");
  });
}
