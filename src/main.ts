import { initHandClick } from "./utils/hand";
import { toggleIntro } from "./utils/toggleIntro";
import initInactivityTimer from "./utils/userNoActive";

initHandClick();
const timer = initInactivityTimer(toggleIntro, 10000);
