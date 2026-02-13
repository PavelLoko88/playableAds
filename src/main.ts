import { initHandClick } from "./utils/hand";
import { toggleIntro } from "./utils/toggleIntro";
import initTrajectoryDrawing from "./utils/trajectory";
import initInactivityTimer from "./utils/userNoActive";

initHandClick();
initInactivityTimer(toggleIntro, 20000);
initTrajectoryDrawing();
