export function toggleIntro(): void {
  const intro = document.querySelector(".intro") as HTMLElement;
  intro.classList.add("introActive");
}
