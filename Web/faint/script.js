const displayCanvas = document.getElementById("canvas");
const displayCtx = displayCanvas.getContext("2d");
const drawingCanvas = document.getElementById("drawing-canvas");
const drawingCtx = drawingCanvas.getContext("2d");
const hexColorInput = document.getElementById("hex-color-input");
const colorDisplay = document.getElementById("color-display");
const penSize = document.getElementById("pen-size");
const zoomInput = document.getElementById("zoom-input");
const scaleInput = document.getElementById("scale-input");
const canvasWidthInput = document.getElementById("canvas-width-input");
const canvasHeightInput = document.getElementById("canvas-height-input");
const pixelPenToggle = document.getElementById("pixel-pen-toggle");
const penToolRadio = document.getElementById("pen-tool-radio");
const selectionToolRadio = document.getElementById("selection-tool-radio");
const fillToolRadio = document.getElementById("fill-tool-radio");
const eraserToolRadio = document.getElementById("eraser-tool-radio");
const eraserHexColorInput = document.getElementById("eraser-hex-color-input");
const eraserColorDisplay = document.getElementById("eraser-color-display");
const canvasWrapper = document.getElementById("canvas-wrapper");
const closeButton = document.querySelector(".close-button");
const helpModal = document.getElementById("help-modal");
const notificationBox = document.getElementById("notification-box");

const PAN_SPEED_ARROW = 10;
const PAN_SPEED_ARROW_FAST = 100;
const SELECTION_MOVE_SPEED = 1;
const SELECTION_MOVE_SPEED_FAST = 10;
const SCALE_AMOUNT_WHEEL = 1;
const ZOOM_AMOUNT_WHEEL = 0.1;
const PAN_SPEED_WHEEL = 1;

const pressedKeys = new Set();

let mode = "pen";
let isDrawing = false;
let color = "#000000";
let previousColor = "#000000";
let eraserColor = "#FFFFFF";
let isPixelated = false;
let size = 1;
let zoom = 1;
let displayScale = 1;
let panX = 0;
let panY = 0;
let lastX = 0;
let lastY = 0;
let isInputFocused = false;

let isResizing = false;
let resizeDirection = "";
let startResizeX = 0;
let startResizeY = 0;
let startCanvasWidth = 0;
let startCanvasHeight = 0;

let isSelecting = false;
let selectionRect = null;
let selectedCanvasContent = null;
let isDraggingSelection = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let isSelectionLifted = false;
let liftedSelectionCanvas = document.createElement("canvas");
let liftedSelectionCtx = liftedSelectionCanvas.getContext("2d");
let clipboardContent = null;

let previousCanvasWidth = 500;
let previousCanvasHeight = 500;

let history = [];
let historyPointer = -1;
const MAX_HISTORY_STATES = 20;

const toolsContainer = document.querySelector(".tools");

function updateCanvasContainer() {
  const toolsHeight = toolsContainer.offsetHeight;
  document.body.style.paddingTop = `${toolsHeight}px`;
}

function showNotification(message) {
  notificationBox.textContent = message;
  notificationBox.style.display = "block";
  setTimeout(() => {
    notificationBox.style.display = "none";
  }, 3000);
}

function pan() {
  moveSelection();
  if (pressedKeys.has("Shift")) {
    const panSpeed = pressedKeys.has("Control") ? PAN_SPEED_ARROW_FAST : PAN_SPEED_ARROW;
    let dx = 0;
    let dy = 0;
    if (pressedKeys.has("ArrowLeft")) dx += panSpeed;
    if (pressedKeys.has("ArrowRight")) dx -= panSpeed;
    if (pressedKeys.has("ArrowUp")) dy += panSpeed;
    if (pressedKeys.has("ArrowDown")) dy -= panSpeed;

    if (dx !== 0 || dy !== 0) {
      panX += dx;
      panY += dy;
      clampPan();
      redraw();
    }
  }
  requestAnimationFrame(pan);
}

function moveSelection() {
  if (selectionRect && !pressedKeys.has("Shift")) {
    const moveAmount = pressedKeys.has("Control") ? SELECTION_MOVE_SPEED_FAST : SELECTION_MOVE_SPEED;
    let dx = 0;
    let dy = 0;
    if (pressedKeys.has("ArrowLeft")) dx -= moveAmount;
    if (pressedKeys.has("ArrowRight")) dx += moveAmount;
    if (pressedKeys.has("ArrowUp")) dy -= moveAmount;
    if (pressedKeys.has("ArrowDown")) dy += moveAmount;

    if (dx !== 0 || dy !== 0) {
      selectionRect.x += dx;
      selectionRect.y += dy;
      redraw();
    }
  }
}

const cursor = document.createElement("div");
cursor.style.position = "absolute";
cursor.style.pointerEvents = "none";
document.body.appendChild(cursor);

function startDrawing(e) {
  const canvasRect = displayCanvas.getBoundingClientRect();
  const mouseX = ((e.clientX - canvasRect.left) / displayScale - panX) / zoom;
  const mouseY = ((e.clientY - canvasRect.top) / displayScale - panY) / zoom;

  if (mode === "pen" || mode === "eraser") {
    isDrawing = true;
    lastX = mouseX;
    lastY = mouseY;
    draw(e);
  } else if (mode === "selection") {
    if (
      selectionRect &&
      mouseX >= selectionRect.x &&
      mouseX <= selectionRect.x + selectionRect.width &&
      mouseY >= selectionRect.y &&
      mouseY <= selectionRect.y + selectionRect.height
    ) {
      isDraggingSelection = true;
      dragOffsetX = mouseX - selectionRect.x;
      dragOffsetY = mouseY - selectionRect.y;
    } else {
      isSelecting = true;
      selectionRect = { x: mouseX, y: mouseY, width: 0, height: 0 };

      if (selectedCanvasContent) {
        selectedCanvasContent = null;
        isSelectionLifted = false;
        redraw();
      }
    }
  } else if (mode === "fill") {
    floodFill(mouseX, mouseY, color);
  }
}

function stopDrawing() {
  if (mode === "pen" || mode === "eraser") {
    isDrawing = false;
    drawingCtx.beginPath();
    saveState();
  } else if (mode === "selection") {
    isSelecting = false;
    isDraggingSelection = false;
    if (selectionRect) {
      selectionRect = normalizeRect(selectionRect);

      selectionRect.x = Math.round(selectionRect.x);
      selectionRect.y = Math.round(selectionRect.y);
      selectionRect.width = Math.round(selectionRect.width);
      selectionRect.height = Math.round(selectionRect.height);

      if (selectionRect.width === 0 || selectionRect.height === 0) {
        selectionRect = null;
      }
    }
    redraw();
  }
}

function draw(e) {
  const canvasRect = displayCanvas.getBoundingClientRect();
  const mouseX = ((e.clientX - canvasRect.left) / displayScale - panX) / zoom;
  const mouseY = ((e.clientY - canvasRect.top) / displayScale - panY) / zoom;

  if (mode === "pen" || mode === "eraser") {
    if (!isDrawing) return;

    const currentStrokeStyle = mode === "eraser" ? eraserColor : color;
    const currentFillStyle = mode === "eraser" ? eraserColor : color;

    if (isPixelated) {
      drawLine(lastX, lastY, mouseX, mouseY, currentFillStyle);
    } else {
      drawingCtx.lineWidth = size;
      drawingCtx.lineCap = "round";
      drawingCtx.strokeStyle = currentStrokeStyle;

      drawingCtx.lineTo(mouseX, mouseY);
      drawingCtx.stroke();
      drawingCtx.beginPath();
      drawingCtx.moveTo(mouseX, mouseY);
    }

    lastX = mouseX;
    lastY = mouseY;

    redraw();
  } else if (mode === "selection") {
    if (isSelecting) {
      selectionRect.width = mouseX - selectionRect.x;
      selectionRect.height = mouseY - selectionRect.y;
      redraw();
    } else if (isDraggingSelection) {
      selectionRect.x = mouseX - dragOffsetX;
      selectionRect.y = mouseY - dragOffsetY;
      redraw();
    }
  }
}

function drawPixel(x, y, fillStyle) {
  drawingCtx.fillStyle = fillStyle;
  drawingCtx.fillRect(x - Math.floor(size / 2), y - Math.floor(size / 2), size, size);
}

function drawLine(x0, y0, x1, y1, fillStyle) {
  let ix0 = Math.round(x0);
  let iy0 = Math.round(y0);
  let ix1 = Math.round(x1);
  let iy1 = Math.round(y1);

  const dx = Math.abs(ix1 - ix0);
  const dy = Math.abs(iy1 - iy0);
  const sx = ix0 < ix1 ? 1 : -1;
  const sy = iy0 < iy1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    drawPixel(ix0, iy0, fillStyle);

    if (ix0 === ix1 && iy0 === iy1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      ix0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      iy0 += sy;
    }
  }
}

function redraw() {
  displayCtx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
  displayCtx.save();
  displayCtx.translate(panX, panY);
  displayCtx.scale(zoom, zoom);

  if (isSelectionLifted && selectedCanvasContent && selectionRect) {
    displayCtx.drawImage(drawingCanvas, 0, 0, drawingCanvas.width, drawingCanvas.height);

    liftedSelectionCtx.putImageData(selectedCanvasContent, 0, 0);
    displayCtx.drawImage(liftedSelectionCanvas, selectionRect.x, selectionRect.y);
  } else {
    displayCtx.drawImage(drawingCanvas, 0, 0);
  }

  if (selectionRect) {
    displayCtx.strokeStyle = "blue";
    displayCtx.setLineDash([5, 5]);
    displayCtx.lineWidth = 1;

    displayCtx.strokeRect(selectionRect.x, selectionRect.y, selectionRect.width, selectionRect.height);
    displayCtx.setLineDash([]);
  }

  displayCtx.restore();
}

function updateCursor(e) {
  cursor.style.display = "block";

  if (mode === "selection") {
    cursor.style.backgroundColor = "transparent";
    cursor.style.border = "1px solid blue";
    cursor.style.width = "16px";
    cursor.style.height = "16px";
    cursor.style.transform = "translate(-50%, -50%)";
    cursor.style.backgroundImage = "none";
  } else if (mode === "fill") {
    cursor.style.backgroundColor = "#000000";
    cursor.style.border = "1px solid red";
    cursor.style.width = "16px";
    cursor.style.height = "16px";
    cursor.style.transform = "translate(-50%, -50%)";
    cursor.style.backgroundImage = "none";
  } else {
    const cursorSize = size * zoom * displayScale;
    const cursorCanvas = document.createElement("canvas");
    const cursorCtx = cursorCanvas.getContext("2d");
    cursorCanvas.width = cursorSize;
    cursorCanvas.height = cursorSize;

    const cursorColor = mode === "eraser" ? eraserColor : color;

    if (isPixelated) {
      cursorCtx.fillStyle = cursorColor;
      cursorCtx.fillRect(0, 0, cursorSize, cursorSize);
    } else {
      cursorCtx.fillStyle = cursorColor;
      cursorCtx.beginPath();
      cursorCtx.arc(cursorSize / 2, cursorSize / 2, cursorSize / 2, 0, 2 * Math.PI);
      cursorCtx.fill();
    }

    cursor.style.width = `${cursorSize}px`;
    cursor.style.height = `${cursorSize}px`;
    cursor.style.backgroundColor = "transparent";
    cursor.style.border = "none";
    cursor.style.borderRadius = "0";
    cursor.style.backgroundImage = `url(${cursorCanvas.toDataURL()})`;

    if (size === 1) {
      cursor.style.transform = "translate(0, 0)";
    } else {
      cursor.style.transform = "translate(-50%, -50%)";
    }
  }

  if (e) {
    cursor.style.left = `${e.clientX + window.scrollX}px`;
    cursor.style.top = `${e.clientY + window.scrollY}px`;
  }
}

function parseHexColor(hex) {
  hex = hex.replace("#", "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (hex.length === 6) {
    return `#${hex}`;
  }
  return null;
}

function updateColorDisplay() {
  colorDisplay.style.backgroundColor = color;
  eraserColorDisplay.style.backgroundColor = eraserColor;
}

function updatePixelateButtonState() {
  if (isPixelated) {
    pixelPenToggle.style.backgroundColor = "blue";
    pixelPenToggle.style.color = "white";
  } else {
    pixelPenToggle.style.backgroundColor = "gray";
    pixelPenToggle.style.color = "black";
  }
}

function setupCanvas(width, height) {
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");
  tempCanvas.width = drawingCanvas.width;
  tempCanvas.height = drawingCanvas.height;
  tempCtx.drawImage(drawingCanvas, 0, 0);

  drawingCanvas.width = width;
  drawingCanvas.height = height;

  drawingCtx.fillStyle = eraserColor;
  drawingCtx.fillRect(0, 0, width, height);

  canvasWrapper.style.width = `${width * displayScale}px`;
  canvasWrapper.style.height = `${height * displayScale}px`;

  displayCanvas.width = width;
  displayCanvas.height = height;

  displayCanvas.style.width = `${drawingCanvas.width * displayScale}px`;
  displayCanvas.style.height = `${drawingCanvas.height * displayScale}px`;

  drawingCtx.drawImage(tempCanvas, 0, 0);
  drawingCtx.imageSmoothingEnabled = false;
  displayCtx.imageSmoothingEnabled = false;
  clampPan();
  redraw();

  canvasWidthInput.value = width;
  canvasHeightInput.value = height;
  saveState();

  previousCanvasWidth = width;
  previousCanvasHeight = height;
}

function clampPan() {
  const minPanX = displayCanvas.width - drawingCanvas.width * zoom;
  const maxPanX = 0;
  const minPanY = displayCanvas.height - drawingCanvas.height * zoom;
  const maxPanY = 0;

  panX = Math.max(minPanX, Math.min(maxPanX, panX));
  panY = Math.max(minPanY, Math.min(maxPanY, panY));
}

function normalizeRect(rect) {
  const normalized = {
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
  };
  if (normalized.width < 0) {
    normalized.x += normalized.width;
    normalized.width = -normalized.width;
  }
  if (normalized.height < 0) {
    normalized.y += normalized.height;
    normalized.height = -normalized.height;
  }
  return normalized;
}

const RESIZE_HANDLE_SIZE = 10;

function getResizeDirection(e) {
  const rect = canvasWrapper.getBoundingClientRect();
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  const atRightEdge = Math.abs(mouseX - rect.right) < RESIZE_HANDLE_SIZE;
  const atBottomEdge = Math.abs(mouseY - rect.bottom) < RESIZE_HANDLE_SIZE;

  if (atRightEdge && atBottomEdge) return "corner";
  if (atRightEdge) return "right";
  if (atBottomEdge) return "bottom";
  return "";
}

function floodFill(startX, startY, fillColor) {
  const imageData = drawingCtx.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height);
  const pixels = imageData.data;
  const width = drawingCanvas.width;
  const height = drawingCanvas.height;

  const getPixelColor = (x, y) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return null;
    const index = (y * width + x) * 4;
    return [pixels[index], pixels[index + 1], pixels[index + 2], pixels[index + 3]];
  };

  const setPixelColor = (x, y, r, g, b, a) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const index = (y * width + x) * 4;
    pixels[index] = r;
    pixels[index + 1] = g;
    pixels[index + 2] = b;
    pixels[index + 3] = a;
  };

  const hexToRgba = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b, 255];
  };

  const targetColor = getPixelColor(Math.floor(startX), Math.floor(startY));
  const fillColorRgba = hexToRgba(fillColor);

  if (
    !targetColor ||
    (targetColor[0] === fillColorRgba[0] &&
      targetColor[1] === fillColorRgba[1] &&
      targetColor[2] === fillColorRgba[2] &&
      targetColor[3] === fillColorRgba[3])
  ) {
    return;
  }

  const matchColor = (pixel1, pixel2) => {
    return pixel1[0] === pixel2[0] && pixel1[1] === pixel2[1] && pixel1[2] === pixel2[2] && pixel1[3] === pixel2[3];
  };

  const queue = [];
  queue.push([Math.floor(startX), Math.floor(startY)]);

  while (queue.length > 0) {
    const [x, y] = queue.shift();

    const currentColor = getPixelColor(x, y);
    if (currentColor && matchColor(currentColor, targetColor)) {
      setPixelColor(x, y, fillColorRgba[0], fillColorRgba[1], fillColorRgba[2], fillColorRgba[3]);

      queue.push([x + 1, y]);
      queue.push([x - 1, y]);
      queue.push([x, y + 1]);
      queue.push([x, y - 1]);
    }
  }
  drawingCtx.putImageData(imageData, 0, 0);
  redraw();
  saveState();
}

function saveState() {
  if (historyPointer < history.length - 1) {
    history = history.slice(0, historyPointer + 1);
  }
  const imageData = drawingCtx.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height);
  history.push({
    imageData: imageData,
    width: drawingCanvas.width,
    height: drawingCanvas.height,
  });
  historyPointer++;
  if (history.length > MAX_HISTORY_STATES) {
    history.shift();
    historyPointer--;
  }
}

function restoreState(index) {
  if (index >= 0 && index < history.length) {
    const state = history[index];
    drawingCanvas.width = state.width;
    drawingCanvas.height = state.height;
    displayCanvas.width = state.width;
    displayCanvas.height = state.height;
    drawingCtx.putImageData(state.imageData, 0, 0);
    drawingCtx.imageSmoothingEnabled = false;
    displayCtx.imageSmoothingEnabled = false;
    clampPan();
    redraw();
    canvasWidthInput.value = state.width;
    canvasHeightInput.value = state.height;
  }
}

async function copySelectionToClipboard(imageData) {
  try {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = imageData.width;
    tempCanvas.height = imageData.height;
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.putImageData(imageData, 0, 0);

    const blob = await new Promise((resolve) => tempCanvas.toBlob(resolve, "image/png"));
    await navigator.clipboard.write([
      new ClipboardItem({
        "image/png": blob,
      }),
    ]);
  } catch (err) {
    console.error("Failed to copy image to clipboard:", err);
    showNotification(
      "Failed to copy image to clipboard. Your browser might not support this feature or permission was denied."
    );
  }
}

async function pasteFromClipboard() {
  try {
    const clipboardItems = await navigator.clipboard.read();
    for (const clipboardItem of clipboardItems) {
      for (const type of clipboardItem.types) {
        if (type.startsWith("image/")) {
          const blob = await clipboardItem.getType(type);
          const img = new Image();
          const url = URL.createObjectURL(blob);
          img.src = url;
          await new Promise((resolve) => (img.onload = resolve));

          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = img.width;
          tempCanvas.height = img.height;
          const tempCtx = tempCanvas.getContext("2d");
          tempCtx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          return tempCtx.getImageData(0, 0, img.width, img.height);
        }
      }
    }
    return null;
  } catch (err) {
    console.error("Failed to paste image from clipboard:", err);
    showNotification(
      "Failed to paste image from clipboard. Your browser might not support this feature or permission was denied."
    );
    return null;
  }
}

function init() {
  drawingCtx.imageSmoothingEnabled = false;
  displayCtx.imageSmoothingEnabled = false;

  drawingCtx.fillStyle = "#FFFFFF";
  drawingCtx.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);

  penToolRadio.checked = true;
  mode = "pen";

  hexColorInput.value = color.replace("#", "");
  zoomInput.value = zoom.toFixed(1);
  scaleInput.value = displayScale;
  scaleInput.step = "0.1";
  canvasWidthInput.value = displayCanvas.width;
  canvasHeightInput.value = displayCanvas.height;
  penSize.value = 1;

  previousCanvasWidth = drawingCanvas.width;
  previousCanvasHeight = drawingCanvas.height;

  displayCanvas.style.imageRendering = "pixelated";

  updateCursor();
  redraw();
  updateColorDisplay();
  saveState();
  pan();
  setupCanvas(500, 500);

  canvasWrapper.addEventListener("mousedown", (e) => {
    const direction = getResizeDirection(e);
    if (direction) {
      e.preventDefault();
      isResizing = true;
      resizeDirection = direction;
      startResizeX = e.clientX;
      startResizeY = e.clientY;
      startCanvasWidth = drawingCanvas.width;
      startCanvasHeight = drawingCanvas.height;
      canvasWrapper.style.cursor =
        direction === "corner" ? "nwse-resize" : direction === "right" ? "ew-resize" : "ns-resize";
    }
  });

  canvasWrapper.addEventListener("mousemove", (e) => {
    if (!isResizing) {
      const direction = getResizeDirection(e);
      if (direction) {
        canvasWrapper.style.cursor =
          direction === "corner" ? "nwse-resize" : direction === "right" ? "ew-resize" : "ns-resize";
      } else {
        canvasWrapper.style.cursor = "default";
      }
    }
  });

  hexColorInput.addEventListener("focus", () => (isInputFocused = true));
  hexColorInput.addEventListener("blur", () => (isInputFocused = false));
  penSize.addEventListener("focus", () => (isInputFocused = true));
  penSize.addEventListener("blur", () => (isInputFocused = false));
  zoomInput.addEventListener("focus", () => (isInputFocused = true));
  zoomInput.addEventListener("blur", () => (isInputFocused = false));
  scaleInput.addEventListener("focus", () => (isInputFocused = true));
  scaleInput.addEventListener("blur", () => (isInputFocused = false));
  canvasWidthInput.addEventListener("focus", () => (isInputFocused = true));
  canvasWidthInput.addEventListener("blur", () => (isInputFocused = false));
  canvasHeightInput.addEventListener("focus", () => (isInputFocused = true));
  canvasHeightInput.addEventListener("blur", () => (isInputFocused = false));
  pixelPenToggle.addEventListener("focus", () => (isInputFocused = true));
  pixelPenToggle.addEventListener("blur", () => (isInputFocused = false));
  pixelPenToggle.addEventListener("click", () => {
    isPixelated = !isPixelated;
    updatePixelateButtonState();
    updateCursor();
  });
  eraserHexColorInput.addEventListener("focus", () => (isInputFocused = true));
  eraserHexColorInput.addEventListener("blur", () => (isInputFocused = false));

  function setToolMode(newMode) {
    mode = newMode;
    selectionRect = null;
    selectedCanvasContent = null;
    isSelectionLifted = false;
    redraw();
    updateCursor();
  }

  penToolRadio.addEventListener("change", () => {
    if (penToolRadio.checked) setToolMode("pen");
  });

  selectionToolRadio.addEventListener("change", () => {
    if (selectionToolRadio.checked) setToolMode("selection");
  });

  fillToolRadio.addEventListener("change", () => {
    if (fillToolRadio.checked) setToolMode("fill");
  });

  eraserToolRadio.addEventListener("change", () => {
    if (eraserToolRadio.checked) setToolMode("eraser");
  });

  hexColorInput.addEventListener("input", (e) => {
    let sanitizedHex = e.target.value.replace(/[^0-9a-fA-F]/g, "");
    if (sanitizedHex.length > 6) {
      sanitizedHex = sanitizedHex.substring(0, 6);
    }
    e.target.value = sanitizedHex;

    const newColor = parseHexColor(sanitizedHex);
    if (newColor) {
      previousColor = color;
      color = newColor;
    }
    updateCursor();
    updateColorDisplay();
  });

  hexColorInput.addEventListener("change", (e) => {
    let sanitizedHex = e.target.value.replace(/[^0-9a-fA-F]/g, "");
    const newColor = parseHexColor(sanitizedHex);

    if (newColor) {
      previousColor = color;
      color = newColor;
      hexColorInput.value = newColor.replace("#", "");
    } else {
      color = previousColor;
      hexColorInput.value = previousColor.replace("#", "");
    }
    updateCursor();
    updateColorDisplay();
  });

  eraserHexColorInput.addEventListener("input", (e) => {
    let sanitizedHex = e.target.value.replace(/[^0-9a-fA-F]/g, "");
    if (sanitizedHex.length > 6) {
      sanitizedHex = sanitizedHex.substring(0, 6);
    }
    e.target.value = sanitizedHex;

    const newColor = parseHexColor(sanitizedHex);
    if (newColor) {
      eraserColor = newColor;
    }
    updateCursor();
    updateColorDisplay();
  });

  eraserHexColorInput.addEventListener("change", (e) => {
    let sanitizedHex = e.target.value.replace(/[^0-9a-fA-F]/g, "");
    const newColor = parseHexColor(sanitizedHex);

    if (newColor) {
      eraserColor = newColor;
      eraserHexColorInput.value = newColor.replace("#", "");
    } else {
      eraserColor = "#FFFFFF";
      eraserHexColorInput.value = "FFFFFF";
    }
    updateCursor();
    updateColorDisplay();
  });

  penSize.addEventListener("input", (e) => {
    size = parseInt(e.target.value, 10);
    if (isNaN(size) || size < 1) {
      size = 1;
      penSize.value = 1;
    }
    updateCursor();
  });

  zoomInput.addEventListener("input", (e) => {
    let newZoom = parseFloat(e.target.value);
    if (!isNaN(newZoom) && newZoom >= 1) {
      zoom = newZoom;
      clampPan();
      redraw();
      updateCursor();
    }
  });

  zoomInput.addEventListener("blur", (e) => {
    let newZoom = parseFloat(e.target.value);
    if (isNaN(newZoom) || newZoom < 1) {
      zoom = 1;
      e.target.value = 1;
      clampPan();
      redraw();
      updateCursor();
    }
  });

  scaleInput.addEventListener("input", (e) => {
    let newScale = parseFloat(e.target.value);
    if (!isNaN(newScale) && newScale >= 0.1) {
      displayScale = newScale;
      canvasWrapper.style.width = `${drawingCanvas.width * displayScale}px`;
      canvasWrapper.style.height = `${drawingCanvas.height * displayScale}px`;
      displayCanvas.style.width = `${drawingCanvas.width * displayScale}px`;
      displayCanvas.style.height = `${drawingCanvas.height * displayScale}px`;
      displayCanvas.style.imageRendering = "pixelated";
      clampPan();
      redraw();
      updateCursor();
    }
  });

  scaleInput.addEventListener("blur", (e) => {
    let newScale = parseFloat(e.target.value);
    if (isNaN(newScale) || newScale < 0.1) {
      displayScale = 1;
      e.target.value = 1;
      canvasWrapper.style.width = `${drawingCanvas.width * displayScale}px`;
      canvasWrapper.style.height = `${drawingCanvas.height * displayScale}px`;
      displayCanvas.style.width = `${drawingCanvas.width * displayScale}px`;
      displayCanvas.style.height = `${drawingCanvas.height * displayScale}px`;
      displayCanvas.style.imageRendering = "pixelated";
      clampPan();
      redraw();
      updateCursor();
    }
  });

  canvasWidthInput.addEventListener("change", (e) => {
    const newWidth = parseInt(e.target.value, 10);
    if (!isNaN(newWidth) && newWidth >= 1) {
      setupCanvas(newWidth, drawingCanvas.height);
    } else {
      e.target.value = previousCanvasWidth;
      setupCanvas(previousCanvasWidth, drawingCanvas.height);
    }
  });

  canvasHeightInput.addEventListener("change", (e) => {
    const newHeight = parseInt(e.target.value, 10);
    if (!isNaN(newHeight) && newHeight >= 1) {
      setupCanvas(drawingCanvas.width, newHeight);
    } else {
      e.target.value = previousCanvasHeight;
      setupCanvas(drawingCanvas.width, previousCanvasHeight);
    }
  });

  window.addEventListener("keydown", (e) => {
    if (!isInputFocused) {
      if (e.key.startsWith("Arrow") || e.key === "Shift" || e.key === "Control") {
        e.preventDefault();
        pressedKeys.add(e.key);
      }

      if (e.key === "Delete" && selectionRect) {
        if (selectedCanvasContent) {
          selectedCanvasContent = null;
          isSelectionLifted = false;
        } else {
          const roundedX = Math.round(selectionRect.x);
          const roundedY = Math.round(selectionRect.y);
          const roundedWidth = Math.round(selectionRect.width);
          const roundedHeight = Math.round(selectionRect.height);

          drawingCtx.fillStyle = eraserColor;
          drawingCtx.fillRect(roundedX, roundedY, roundedWidth, roundedHeight);
        }
        selectionRect = null;
        redraw();
      } else if (e.key === "Escape") {
        if (helpModal.style.display === "block") {
          helpModal.style.display = "none";
        } else if (selectionRect) {
          selectionRect = null;
          selectedCanvasContent = null;
          isSelectionLifted = false;
          redraw();
        } else if (mode === "selection") {
          mode = "pen";
          penToolRadio.checked = true;
          updateCursor();
        }
      } else if (e.key === "Enter" && selectionRect) {
        selectionRect = normalizeRect(selectionRect);
        if (!isSelectionLifted) {
          liftedSelectionCanvas.width = selectionRect.width;
          liftedSelectionCanvas.height = selectionRect.height;
          liftedSelectionCtx.drawImage(
            drawingCanvas,
            selectionRect.x,
            selectionRect.y,
            selectionRect.width,
            selectionRect.height,
            0,
            0,
            selectionRect.width,
            selectionRect.height
          );
          drawingCtx.clearRect(selectionRect.x, selectionRect.y, selectionRect.width, selectionRect.height);
          selectedCanvasContent = liftedSelectionCtx.getImageData(0, 0, selectionRect.width, selectionRect.height);
          isSelectionLifted = true;
        } else {
          drawingCtx.putImageData(selectedCanvasContent, selectionRect.x, selectionRect.y);
        }
        redraw();
      } else if (e.key === "h") {
        helpModal.style.display = "block";
      } else if (e.key === "a" && !e.ctrlKey) {
        mode = "pen";
        penToolRadio.checked = true;
        selectionRect = null;
        selectedCanvasContent = null;
        isSelectionLifted = false;
        redraw();
        updateCursor();
      } else if (e.key === "t" && !e.ctrlKey) {
        isPixelated = !isPixelated;
        updatePixelateButtonState();
        updateCursor();
      } else if (e.key === "q" && !e.ctrlKey) {
        size = Math.max(1, size - 1);
        penSize.value = size;
        updateCursor();
      } else if (e.key === "w" && !e.ctrlKey) {
        size = Math.min(100, size + 1);
        penSize.value = size;
        updateCursor();
      } else if (e.key === "r" && !e.ctrlKey) {
        hexColorInput.focus();
      } else if (e.key === "s" && !e.ctrlKey) {
        mode = "selection";
        selectionToolRadio.checked = true;
        updateCursor();
      } else if (e.key === "f" && !e.ctrlKey) {
        mode = "fill";
        fillToolRadio.checked = true;
        selectionRect = null;
        selectedCanvasContent = null;
        isSelectionLifted = false;
        redraw();
        updateCursor();
      } else if (e.key === "e" && !e.ctrlKey) {
        mode = "eraser";
        eraserToolRadio.checked = true;
        selectionRect = null;
        selectedCanvasContent = null;
        isSelectionLifted = false;
        redraw();
        updateCursor();
      } else if (e.ctrlKey && e.key === "c" && selectionRect) {
        e.preventDefault();
        selectionRect = normalizeRect(selectionRect);
        const imageData = drawingCtx.getImageData(
          selectionRect.x,
          selectionRect.y,
          selectionRect.width,
          selectionRect.height
        );
        clipboardContent = imageData;
        copySelectionToClipboard(imageData);
      } else if (e.ctrlKey && e.key === "x" && selectionRect) {
        e.preventDefault();
        selectionRect = normalizeRect(selectionRect);

        const roundedX = Math.round(selectionRect.x);
        const roundedY = Math.round(selectionRect.y);
        const roundedWidth = Math.round(selectionRect.width);
        const roundedHeight = Math.round(selectionRect.height);

        const imageData = drawingCtx.getImageData(roundedX, roundedY, roundedWidth, roundedHeight);
        clipboardContent = imageData;
        copySelectionToClipboard(imageData);
        drawingCtx.fillStyle = eraserColor;
        drawingCtx.fillRect(roundedX, roundedY, roundedWidth, roundedHeight);
        selectionRect = null;
        selectedCanvasContent = null;
        isSelectionLifted = false;
        redraw();
      } else if (e.ctrlKey && e.key === "v") {
        e.preventDefault();
        if (isSelectionLifted) {
          drawingCtx.putImageData(selectedCanvasContent, selectionRect.x, selectionRect.y);

          updateCursor();
          redraw();
          saveState();
        } else {
          pasteFromClipboard().then((imageData) => {
            if (imageData) {
              isSelectionLifted = true;
              selectedCanvasContent = imageData;
              liftedSelectionCanvas.width = imageData.width;
              liftedSelectionCanvas.height = imageData.height;

              const newWidth = Math.max(drawingCanvas.width, imageData.width);
              const newHeight = Math.max(drawingCanvas.height, imageData.height);
              if (newWidth > drawingCanvas.width || newHeight > drawingCanvas.height) {
                setupCanvas(newWidth, newHeight);
              }

              const pasteX = drawingCanvas.width / 2 - imageData.width / 2;
              const pasteY = drawingCanvas.height / 2 - imageData.height / 2;
              selectionRect = { x: pasteX, y: pasteY, width: imageData.width, height: imageData.height };
              mode = "selection";
              selectionToolRadio.checked = true;
              zoom = 1;
              zoomInput.value = zoom.toFixed(1);
              panX = 0;
              panY = 0;
              updateCursor();
              redraw();
              saveState();
            } else if (clipboardContent) {
              isSelectionLifted = true;
              selectedCanvasContent = clipboardContent;
              liftedSelectionCanvas.width = clipboardContent.width;
              liftedSelectionCanvas.height = clipboardContent.height;

              const newWidth = Math.max(drawingCanvas.width, clipboardContent.width);
              const newHeight = Math.max(drawingCanvas.height, clipboardContent.height);
              if (newWidth > drawingCanvas.width || newHeight > drawingCanvas.height) {
                setupCanvas(newWidth, newHeight);
              }

              const pasteX = drawingCanvas.width / 2 - clipboardContent.width / 2;
              selectionRect = { x: pasteX, y: pasteY, width: clipboardContent.width, height: clipboardContent.height };
              mode = "selection";
              selectionToolRadio.checked = true;
              zoom = 1;
              zoomInput.value = zoom.toFixed(1);
              panX = 0;
              panY = 0;
              updateCursor();
              redraw();
              saveState();
            }
          });
        }
      } else if (e.ctrlKey && e.key === "o") {
        e.preventDefault();
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = (event) => {
          const file = event.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const img = new Image();
              img.onload = () => {
                setupCanvas(img.width, img.height);
                drawingCtx.drawImage(img, 0, 0);
                redraw();
                saveState();
              };
              img.src = e.target.result;
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
      } else if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        const dataURL = drawingCanvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = dataURL;
        a.download = "faint-drawing.png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else if (e.ctrlKey && e.key === "a") {
        e.preventDefault();
        mode = "selection";
        selectionToolRadio.checked = true;
        selectionRect = normalizeRect({ x: 0, y: 0, width: drawingCanvas.width, height: drawingCanvas.height });
        redraw();
      } else if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          if (historyPointer < history.length - 1) {
            historyPointer++;
            restoreState(historyPointer);
          }
        } else {
          if (historyPointer > 0) {
            historyPointer--;
            restoreState(historyPointer);
          }
        }
      } else if (e.ctrlKey && e.key === "y") {
        e.preventDefault();

        if (historyPointer < history.length - 1) {
          historyPointer++;
          restoreState(historyPointer);
        }
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      document.activeElement.blur();
      isInputFocused = false;
    }
  });

  window.addEventListener("keyup", (e) => {
    if (!isInputFocused && (e.key.startsWith("Arrow") || e.key === "Shift" || e.key === "Control")) {
      pressedKeys.delete(e.key);
    }
  });

  displayCanvas.addEventListener("mousedown", startDrawing);
  window.addEventListener("mouseup", stopDrawing);
  window.addEventListener("mouseup", () => {
    if (isResizing) {
      isResizing = false;
      canvasWrapper.style.cursor = "default";
      saveState();
    }
  });
  window.addEventListener("mousemove", (e) => {
    if (isResizing) {
      let newWidth = startCanvasWidth;
      let newHeight = startCanvasHeight;

      if (resizeDirection.includes("right") || resizeDirection.includes("corner")) {
        newWidth = startCanvasWidth + (e.clientX - startResizeX);
      }
      if (resizeDirection.includes("bottom") || resizeDirection.includes("corner")) {
        newHeight = startCanvasHeight + (e.clientY - startResizeY);
      }

      newWidth = Math.max(1, newWidth);
      newHeight = Math.max(1, newHeight);

      setupCanvas(newWidth, newHeight);
    } else if (isDrawing || isSelecting || isDraggingSelection) {
      draw(e);
    }
    updateCursor(e);
  });

  window.addEventListener(
    "wheel",
    (e) => {
      if (!isInputFocused) {
        if (e.ctrlKey && e.shiftKey) {
          e.preventDefault();

          const scaleAmount = SCALE_AMOUNT_WHEEL;
          let newDisplayScale = e.deltaY < 0 ? displayScale + scaleAmount : displayScale - scaleAmount;
          newDisplayScale = Math.max(1, newDisplayScale);

          if (newDisplayScale !== displayScale) {
            displayScale = newDisplayScale;
            canvasWrapper.style.width = `${drawingCanvas.width * displayScale}px`;
            canvasWrapper.style.height = `${drawingCanvas.height * displayScale}px`;
            displayCanvas.style.width = `${drawingCanvas.width * displayScale}px`;
            displayCanvas.style.height = `${drawingCanvas.height * displayScale}px`;
            displayCanvas.style.imageRendering = "pixelated";
            clampPan();
            redraw();
            updateCursor(e);
            scaleInput.value = displayScale;
          }
        } else if (e.ctrlKey) {
          e.preventDefault();

          const zoomAmount = ZOOM_AMOUNT_WHEEL;
          const oldZoom = zoom;
          let newZoom = e.deltaY < 0 ? zoom + zoomAmount : zoom - zoomAmount;
          newZoom = Math.max(1, newZoom);

          if (newZoom !== zoom) {
            const mouseX = (e.clientX - displayCanvas.getBoundingClientRect().left) / displayScale;
            const mouseY = (e.clientY - displayCanvas.getBoundingClientRect().top) / displayScale;

            const scaleFactor = newZoom / oldZoom;

            panX = mouseX * (1 - scaleFactor) + panX * scaleFactor;
            panY = mouseY * (1 - scaleFactor) + panY * scaleFactor;

            zoom = newZoom;

            clampPan();
            redraw();
            updateCursor(e);
            zoomInput.value = zoom.toFixed(1);
          }
        } else if (e.altKey && e.shiftKey) {
          e.preventDefault();

          const panSpeed = PAN_SPEED_WHEEL;
          panX -= e.deltaY * panSpeed;
          clampPan();
          redraw();
          updateCursor(e);
        } else if (e.altKey) {
          e.preventDefault();

          const panSpeed = PAN_SPEED_WHEEL;
          panY -= e.deltaY * panSpeed;
          clampPan();
          redraw();
          updateCursor(e);
        } else {
        }
      }
    },
    { passive: false }
  );

  displayCanvas.addEventListener("mouseenter", () => {
    displayCanvas.style.cursor = "crosshair";
    cursor.style.display = "block";
  });

  displayCanvas.addEventListener("mouseleave", () => {
    displayCanvas.style.cursor = "default";
    cursor.style.display = "none";
  });

  closeButton.addEventListener("click", () => {
    helpModal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target == helpModal) {
      helpModal.style.display = "none";
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  init();
  updateCanvasContainer();
  window.addEventListener("resize", updateCanvasContainer);
});
