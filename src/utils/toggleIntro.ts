export function toggleIntro(noActive: boolean): void {
  const intro = document.querySelector(".intro") as HTMLElement;
  const introFail = document.querySelector(".introFail") as HTMLElement;
  const introLogo = document.querySelector(".introLogo") as HTMLElement;
  const introButton = document.querySelector(".introLink") as HTMLElement;

  intro.classList.add("introActive");

  if (noActive) {
    // Бездействие
    introLogo.classList.add("introLogoActive");
    introButton.classList.add("introButtonActive");
  } else {
    introFail.classList.add("introFailActive");
    setTimeout(() => {
      introFail.classList.remove("introFailActive");

      introLogo.classList.add("introLogoActive");

      introButton.classList.add("introButtonActive");
    }, 3000);
  }
}
