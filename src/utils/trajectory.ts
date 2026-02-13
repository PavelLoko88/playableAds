import { toggleIntro } from "./toggleIntro";

interface Point {
  x: number;
  y: number;
}

type CarColor = "red" | "yellow";

export function initTrajectoryDrawing(): {
  clearTrajectories: () => void;
  activateCar: (car: CarColor) => void;
  startCarsMovement: () => void;
  setToggleIntro: (fn: (noActive: boolean) => void) => void; // Добавить эту строку
} | void {
  const redCar = document.querySelector(
    ".carsInteractive .parkingBoxCar:first-child",
  ) as HTMLElement;
  const yellowCar = document.querySelector(
    ".carsInteractive .parkingBoxCar:last-child",
  ) as HTMLElement;

  const redParkingBlock = document.getElementById("letterRed") as HTMLElement;
  const yellowParkingBlock = document.getElementById(
    "letterYellow",
  ) as HTMLElement;

  if (!redCar || !yellowCar || !redParkingBlock || !yellowParkingBlock) {
    return;
  }

  const originalStyles = {
    red: {
      transform: redCar.style.transform,
      position: redCar.style.position,
      left: redCar.style.left,
      top: redCar.style.top,
      margin: redCar.style.margin,
      opacity: redCar.style.opacity,
    },
    yellow: {
      transform: yellowCar.style.transform,
      position: yellowCar.style.position,
      left: yellowCar.style.left,
      top: yellowCar.style.top,
      margin: yellowCar.style.margin,
      opacity: yellowCar.style.opacity,
    },
  };

  let externalToggleIntro: ((noActive: boolean) => void) | null = null;

  function setToggleIntro(fn: (noActive: boolean) => void): void {
    externalToggleIntro = fn;
  }

  // ========== SVG СЛОЙ ==========
  function createSVGLayer(): SVGSVGElement {
    let svg = document.querySelector(".trajectory-svg") as SVGSVGElement | null;

    if (!svg) {
      svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.classList.add("trajectory-svg");
      svg.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 100;
      `;
      document.querySelector(".game")?.appendChild(svg);
    }

    return svg;
  }

  function getCarCenter(car: HTMLElement): Point {
    const gameRect = document.querySelector(".game")?.getBoundingClientRect();
    const carRect = car.getBoundingClientRect();

    if (!gameRect) return { x: 0, y: 0 };

    return {
      x: carRect.left - gameRect.left + carRect.width / 2,
      y: carRect.top - gameRect.top + carRect.height / 2,
    };
  }

  function getCarTopEdge(car: HTMLElement): Point {
    const gameRect = document.querySelector(".game")?.getBoundingClientRect();
    const carRect = car.getBoundingClientRect();

    if (!gameRect) return { x: 0, y: 0 };

    return {
      x: carRect.left - gameRect.left + carRect.width / 2,
      y: carRect.top - gameRect.top,
    };
  }

  function isPointInBlock(x: number, y: number, block: HTMLElement): boolean {
    const gameRect = document.querySelector(".game")?.getBoundingClientRect();
    const blockRect = block.getBoundingClientRect();

    if (!gameRect) return false;

    const blockLeft = blockRect.left - gameRect.left;
    const blockRight = blockRect.right - gameRect.left;
    const blockTop = blockRect.top - gameRect.top;
    const blockBottom = blockRect.bottom - gameRect.top;

    return (
      x >= blockLeft && x <= blockRight && y >= blockTop && y <= blockBottom
    );
  }

  function checkCollision(pos1: Point, pos2: Point): boolean {
    const distance = Math.hypot(pos1.x - pos2.x, pos1.y - pos2.y);
    return distance < 60; // Дистанция столкновения
  }

  function getClientCoordinates(e: MouseEvent | TouchEvent): Point | null {
    if (e instanceof MouseEvent) {
      return { x: e.clientX, y: e.clientY };
    } else if (e instanceof TouchEvent) {
      if (e.touches.length > 0) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }
    return null;
  }

  let isDrawing: boolean = false;
  let activeCar: CarColor = "red";
  let currentPath: SVGPathElement | null = null;
  let points: Point[] = [];

  let isRedParked: boolean = false;
  let isYellowParked: boolean = false;
  let isCollisionHappened: boolean = false;

  const trajectories: {
    red: Point[];
    yellow: Point[];
  } = {
    red: [],
    yellow: [],
  };

  const colors = {
    red: { stroke: "#d1191f" },
    yellow: { stroke: "#ffc841" },
  };

  function activateCar(car: CarColor): void {
    console.log("click");

    if (
      (car === "red" && isRedParked) ||
      (car === "yellow" && isYellowParked)
    ) {
      return;
    }
    activeCar = car;
  }

  function startDrawing(e: MouseEvent | TouchEvent): void {
    e.preventDefault();

    const target = e.target as HTMLElement;

    if (target.closest(".parkingBoxCar:first-child")) {
      if (isRedParked) return;
      activateCar("red");
    } else if (target.closest(".parkingBoxCar:last-child")) {
      if (isYellowParked) return;
      activateCar("yellow");
    } else {
      return;
    }

    isDrawing = true;
    points = [];

    const car = activeCar === "red" ? redCar : yellowCar;
    const startPos = getCarTopEdge(car);
    points.push(startPos);

    const svg = createSVGLayer();
    currentPath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path",
    );
    currentPath.setAttribute("fill", "none");
    currentPath.setAttribute("stroke", colors[activeCar].stroke);
    currentPath.setAttribute("stroke-width", "6");
    currentPath.setAttribute("stroke-linecap", "round");
    currentPath.setAttribute("stroke-linejoin", "round");
    currentPath.setAttribute("stroke-dasharray", "none");
    currentPath.setAttribute("opacity", "0.9");
    currentPath.setAttribute("d", `M ${startPos.x} ${startPos.y}`);

    svg.appendChild(currentPath);
  }

  // ========== ПРОЦЕСС РИСОВАНИЯ ==========
  function draw(e: MouseEvent | TouchEvent): void {
    if (!isDrawing || !currentPath) return;
    e.preventDefault();

    const coords = getClientCoordinates(e);
    if (!coords) return;

    const gameRect = document.querySelector(".game")?.getBoundingClientRect();
    if (!gameRect) return;

    const x = coords.x - gameRect.left;
    const y = coords.y - gameRect.top;

    points.push({ x, y });

    const parkingBlock =
      activeCar === "red" ? redParkingBlock : yellowParkingBlock;

    if (isPointInBlock(x, y, parkingBlock)) {
      let d = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        d += ` L ${points[i].x} ${points[i].y}`;
      }
      currentPath.setAttribute("d", d);
      finishSuccess();
      return;
    }

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }

    currentPath.setAttribute("d", d);
  }

  function finishSuccess(): void {
    if (!currentPath) return;

    isDrawing = false;
    currentPath.setAttribute("stroke-width", "7");

    if (activeCar === "red") {
      isRedParked = true;
      trajectories.red = [...points];
    } else {
      isYellowParked = true;
      trajectories.yellow = [...points];
    }

    currentPath = null;
    points = [];

    if (isRedParked && isYellowParked) {
      setTimeout(() => startCarsMovement(), 500);
    }
  }

  function stopDrawing(e: MouseEvent | TouchEvent): void {
    if (!isDrawing || !currentPath) return;
    e.preventDefault();

    isDrawing = false;

    const parkingBlock =
      activeCar === "red" ? redParkingBlock : yellowParkingBlock;

    if (points.length === 0) {
      currentPath.remove();
      currentPath = null;
      return;
    }

    const lastPoint = points[points.length - 1];

    if (isPointInBlock(lastPoint.x, lastPoint.y, parkingBlock)) {
      finishSuccess();
    } else {
      currentPath.remove();
    }

    currentPath = null;
    points = [];
  }

  function setCarPosition(
    car: HTMLElement,
    targetX: number,
    targetY: number,
  ): void {
    const gameRect = document.querySelector(".game")?.getBoundingClientRect();
    const carRect = car.getBoundingClientRect();

    if (!gameRect) return;

    const currentCenterX = carRect.left - gameRect.left + carRect.width / 2;
    const currentCenterY = carRect.top - gameRect.top + carRect.height / 2;

    const deltaX = targetX - currentCenterX;
    const deltaY = targetY - currentCenterY;

    let currentTranslateX = 0;
    let currentTranslateY = 0;

    const transform = car.style.transform;
    if (transform && transform.includes("translate")) {
      const match = transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
      if (match) {
        currentTranslateX = parseFloat(match[1]) || 0;
        currentTranslateY = parseFloat(match[2]) || 0;
      }
    }

    car.style.transform = `translate(${currentTranslateX + deltaX}px, ${currentTranslateY + deltaY}px)`;
  }

  function resetCars(): void {
    redCar.style.transform = "none";
    yellowCar.style.transform = "none";

    redCar.style.position = originalStyles.red.position;
    redCar.style.left = originalStyles.red.left;
    redCar.style.top = originalStyles.red.top;
    redCar.style.margin = originalStyles.red.margin;
    redCar.style.opacity = "1";

    yellowCar.style.position = originalStyles.yellow.position;
    yellowCar.style.left = originalStyles.yellow.left;
    yellowCar.style.top = originalStyles.yellow.top;
    yellowCar.style.margin = originalStyles.yellow.margin;
    yellowCar.style.opacity = "1";

    isCollisionHappened = false;
  }

  function handleCollision(): void {
    if (isCollisionHappened) return;

    isCollisionHappened = true;

    const highestId: number = window.requestAnimationFrame(() => {});
    for (let i = highestId; i > 0; i--) {
      window.cancelAnimationFrame(i);
    }

    redCar.style.filter = "brightness(1.2) hue-rotate(0deg)";
    yellowCar.style.filter = "brightness(1.2) hue-rotate(0deg)";

    redCar.style.transform += " rotate(-5deg)";
    yellowCar.style.transform += " rotate(5deg)";

    if (externalToggleIntro) {
      externalToggleIntro(false);
    } else {
      toggleIntro(false);
    }
  }

  async function animateCar(
    car: HTMLElement,
    pathPoints: Point[],
    otherCar: HTMLElement,
    // otherPathPoints: Point[],
    duration: number = 3000,
  ): Promise<void> {
    if (pathPoints.length < 2) return;

    car.style.transform = "none";
    car.style.opacity = "1";

    await new Promise((resolve) => requestAnimationFrame(resolve));

    setCarPosition(car, pathPoints[0].x, pathPoints[0].y);

    await new Promise((resolve) => setTimeout(resolve, 300));

    const startTime = performance.now();

    return new Promise((resolve) => {
      let animationFrame: number;

      const animate = (currentTime: number) => {
        if (isCollisionHappened) {
          cancelAnimationFrame(animationFrame); // ОТМЕНЯЕМ анимацию
          resolve();
          return;
        }

        const elapsed = currentTime - startTime;
        const progress: number = Math.min(elapsed / duration, 1);

        if (progress < 1) {
          const totalPoints = pathPoints.length - 1;
          const index = Math.min(
            Math.floor(progress * totalPoints),
            totalPoints - 1,
          );
          const t = progress * totalPoints - index;

          const p1 = pathPoints[index];
          const p2 = pathPoints[index + 1];

          const x = p1.x + (p2.x - p1.x) * t;
          const y = p1.y + (p2.y - p1.y) * t;

          setCarPosition(car, x, y);

          if (!isCollisionHappened) {
            const otherPos = getCarCenter(otherCar);
            if (checkCollision({ x, y }, otherPos)) {
              handleCollision();
              cancelAnimationFrame(animationFrame); // ОТМЕНЯЕМ анимацию
              resolve();
              return;
            }
          }

          animationFrame = requestAnimationFrame(animate);
        } else {
          const lastPoint = pathPoints[pathPoints.length - 1];
          setCarPosition(car, lastPoint.x, lastPoint.y);
          car.style.opacity = "0.5";
          resolve();
        }
      };

      animationFrame = requestAnimationFrame(animate);
    });
  }

  // ========== ЗАПУСК ДВИЖЕНИЯ ==========
  async function startCarsMovement(): Promise<void> {
    if (isCollisionHappened) return;

    resetCars();
    await new Promise((resolve) => setTimeout(resolve, 200));

    try {
      // Запускаем обе анимации одновременно
      await Promise.all([
        animateCar(
          redCar,
          trajectories.red,
          yellowCar,
          // trajectories.yellow,
          3000,
        ),
        animateCar(
          yellowCar,
          trajectories.yellow,
          redCar,
          // trajectories.red,
          3000,
        ),
      ]);
    } catch (error) {
      console.error("Ошибка анимации:", error);
    }
  }

  // ========== ОЧИСТКА ==========
  function clearTrajectories(): void {
    const svg = document.querySelector(".trajectory-svg");
    if (svg) {
      svg.innerHTML = "";
    }

    isRedParked = false;
    isYellowParked = false;

    trajectories.red = [];
    trajectories.yellow = [];

    resetCars();
  }

  function injectStyles(): void {
    const style = document.createElement("style");
    style.textContent = `
      .trajectory-svg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 100;
      }
      
      .parkingBoxCar {
        cursor: crosshair !important;
        touch-action: none;
        -webkit-tap-highlight-color: transparent;
        transition: opacity 0.3s ease, filter 0.3s ease, transform 0.1s ease;
        will-change: transform;
      }
      
      #letterRed, #letterYellow {
        position: relative;
        z-index: 60;
        pointer-events: none;
      }
      
      body {
        overscroll-behavior: contain;
      }
      
      * {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
        -webkit-tap-highlight-color: transparent;
      }
    `;
    document.head.appendChild(style);
  }

  function init(): void {
    injectStyles();

    redCar.style.transform = "translate(0, 0)";
    yellowCar.style.transform = "translate(0, 0)";

    redCar.addEventListener("mousedown", startDrawing);
    redCar.addEventListener("touchstart", startDrawing, { passive: false });

    yellowCar.addEventListener("mousedown", startDrawing);
    yellowCar.addEventListener("touchstart", startDrawing, { passive: false });

    window.addEventListener("mousemove", draw);
    window.addEventListener("mouseup", stopDrawing);
    window.addEventListener("touchmove", draw, { passive: false });
    window.addEventListener("touchend", stopDrawing);
    window.addEventListener("touchcancel", stopDrawing);

    window.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        clearTrajectories();
      }
    });
  }

  init();

  return {
    clearTrajectories,
    activateCar,
    startCarsMovement,
    setToggleIntro,
  };
}
export default initTrajectoryDrawing;
