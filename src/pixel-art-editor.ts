import { colorPalette, dimensionSize, canvasSize } from "./constants";

const canvases = document.querySelectorAll(".pixel-art-canvas");

const state = {
  cursor: {
    x: 0,
    y: 0,
    onScreen: true,
  },

  pixels: Array(dimensionSize * dimensionSize).fill(0) as number[],
  penRadius: 2,
  colorIndex: 4,
};

const submitButton = document.getElementById("submit-button");
if (!(submitButton instanceof HTMLButtonElement)) {
  throw new Error("failed to get submit button");
}

submitButton.onclick = async () => {
  // POST /api/submit
  const response = await fetch("/api/submit", {
    method: "POST",
    body: JSON.stringify({ pixels: state.pixels }),
  });
  const data = await response.json();
  // redirect to home
  window.location.href = "/";
};

// D - cycle up colors
// A - cycle down colors
// W - increase brush size
// S - decrease brush size
// E - pick color
// Q - fill

document.onkeydown = (e) => {
  if (e.key === "d") {
    state.colorIndex = (state.colorIndex + 1) % colorPalette.length;
  } else if (e.key === "a") {
    state.colorIndex =
      (state.colorIndex - 1 + colorPalette.length) % colorPalette.length;
  } else if (e.key === "w") {
    state.penRadius = Math.min(50, state.penRadius + 1);
  } else if (e.key === "s") {
    state.penRadius = Math.max(1, state.penRadius - 1);
  } else if (e.key === "e") {
    // pick color from canvas
    if (state.cursor.onScreen) {
      const index = state.cursor.y * dimensionSize + state.cursor.x;
      // state.colorIndex = colorPalette.indexOf(state.pixels[index])
      state.colorIndex = state.pixels[index]!;
    }
  } else if (e.key === "q") {
    const index = state.cursor.y * dimensionSize + state.cursor.x;
    const targetColor = state.pixels[index];
    const stack = [index];
    const seen = new Set<number>();

    while (stack.length > 0) {
      const currentIndex = stack.pop()!;
      seen.add(currentIndex);

      if (state.pixels[currentIndex] !== targetColor) {
        continue;
      }
      state.pixels[currentIndex] = state.colorIndex;
      const x = currentIndex % dimensionSize;
      const y = Math.floor(currentIndex / dimensionSize);
      if (x > 0) {
        if (!seen.has(currentIndex - 1)) {
          stack.push(currentIndex - 1);
        }
      }
      if (x < dimensionSize - 1) {
        if (!seen.has(currentIndex + 1)) {
          stack.push(currentIndex + 1);
        }
      }
      if (y > 0) {
        if (!seen.has(currentIndex - dimensionSize)) {
          stack.push(currentIndex - dimensionSize);
        }
      }
      if (y < dimensionSize - 1) {
        if (!seen.has(currentIndex + dimensionSize)) {
          stack.push(currentIndex + dimensionSize);
        }
      }
    }
  }
};

canvases.forEach((canvas) => {
  if (!(canvas instanceof HTMLCanvasElement)) {
    return;
  }

  function draw() {
    if (!(canvas instanceof HTMLCanvasElement)) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("failed to get ctx");
    }

    canvas.style.width = canvasSize + "px";
    canvas.style.height = canvasSize + "px";
    canvas.width = dimensionSize;
    canvas.height = dimensionSize;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    state.pixels.forEach((color, i) => {
      const x = i % dimensionSize;
      const y = Math.floor(i / dimensionSize);
      ctx.fillStyle = colorPalette[color]!;
      ctx.fillRect(
        (x * canvas.width) / dimensionSize,
        (y * canvas.height) / dimensionSize,
        canvas.width / dimensionSize,
        canvas.height / dimensionSize
      );
    });

    ctx.fillStyle = colorPalette[state.colorIndex]!;

    if (state.cursor.onScreen) {
      for (
        let x = state.cursor.x - state.penRadius;
        x <= state.cursor.x + state.penRadius;
        x++
      ) {
        for (
          let y = state.cursor.y - state.penRadius;
          y <= state.cursor.y + state.penRadius;
          y++
        ) {
          if (x >= 0 && x < dimensionSize && y >= 0 && y < dimensionSize) {
            const distance = Math.sqrt(
              (x - state.cursor.x + 0.5) ** 2 + (y - state.cursor.y + 0.5) ** 2
            );
            if (distance > state.penRadius) {
              continue;
            }
            ctx.fillRect(
              (x * canvas.width) / dimensionSize,
              (y * canvas.height) / dimensionSize,
              canvas.width / dimensionSize,
              canvas.height / dimensionSize
            );
          }
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();

  canvas.onpointermove = (e) => {
    state.cursor.onScreen = true;
    const gridX = Math.floor(e.offsetX / (canvasSize / dimensionSize));
    const gridY = Math.floor(e.offsetY / (canvasSize / dimensionSize));
    state.cursor.x = gridX;
    state.cursor.y = gridY;

    if (e.buttons === 1) {
      drawPen();
    }
  };

  canvas.onpointerleave = () => {
    state.cursor.onScreen = false;
  };

  canvas.onclick = () => {
    drawPen();
  };

  function drawPen() {
    for (
      let x = state.cursor.x - state.penRadius;
      x <= state.cursor.x + state.penRadius;
      x++
    ) {
      for (
        let y = state.cursor.y - state.penRadius;
        y <= state.cursor.y + state.penRadius;
        y++
      ) {
        if (x >= 0 && x < dimensionSize && y >= 0 && y < dimensionSize) {
          const distance = Math.sqrt(
            (x - state.cursor.x + 0.5) ** 2 + (y - state.cursor.y + 0.5) ** 2
          );
          if (distance > state.penRadius) {
            continue;
          }
          state.pixels[y * dimensionSize + x] = state.colorIndex;
        }
      }
    }
  }
});
