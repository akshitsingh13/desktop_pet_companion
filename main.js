import { mouse, sleep } from "@nut-tree-fork/nut-js";
import { app, BrowserWindow, ipcMain, screen } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const states = {
  idle: "idle",
  walk: "walk",
  typing: "typing",
  sleep: "sleep",
  idleToSleep: "idleToSleep",
  wakeup: "wakeup",
};

const direction = {
  right: "right",
  left: "left",
};

let win;

let catX = 0;
let catY = 0;

let prevX = null;
let prevY = null;

let currentState = states.idle;
let currentDirection = direction.right;

let idleTimer = null;
let typingTimer = null;

let isTyping = false;

function createWindow() {
  win = new BrowserWindow({
    width: 96,
    height: 96,
    frame: false,
    transparent: true,
    resizable: false,

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile("src/index.html");

  win.webContents.once("did-finish-load", () => {
    [catX, catY] = win.getPosition();

    win.webContents.send("pet-state", currentState);
    win.webContents.send("pet-direction", currentDirection);

    setInterval(() => {
      moveCat();
    }, 16);
  });
}

async function getMousePosition() {
  const position = await mouse.getPosition();

  return {
    x: position.x,
    y: position.y,
  };
}

async function moveCat() {
  const position = await mouse.getPosition();

  const dipPosition = screen.screenToDipPoint({
    x: position.x,
    y: position.y,
  });

  const mouseX = dipPosition.x;
  const mouseY = dipPosition.y;

  const mouseMoved = prevX !== null && (prevX !== mouseX || prevY !== mouseY);

  if (isTyping) {
  } else if (mouseMoved) {
    clearTimeout(idleTimer);
    idleTimer = null;

    if (prevX !== null) {
      if (mouseX > prevX) {
        if (currentDirection !== direction.right) {
          currentDirection = direction.right;

          win.webContents.send("pet-direction", currentDirection);
        }
      } else if (mouseX < prevX) {
        if (currentDirection !== direction.left) {
          currentDirection = direction.left;

          win.webContents.send("pet-direction", currentDirection);
        }
      }
    }

    if (currentState !== states.walk) {
      currentState = states.walk;

      win.webContents.send("pet-state", currentState);
    }
  } else {
    if (currentState === states.walk && idleTimer === null) {
      idleTimer = setTimeout(() => {
        if (!isTyping) {
          currentState = states.idle;

          win.webContents.send("pet-state", currentState);
        }

        idleTimer = null;
      }, 1000);
    }
  }

  prevX = mouseX;
  prevY = mouseY;

  const distanceX = mouseX - catX;
  const distanceY = mouseY - catY;

  catX += distanceX * 0.2;
  catY += distanceY * 0.2;

  win.setPosition(Math.round(catX), Math.round(catY));
}

ipcMain.on("pet-typing", async () => {
  isTyping = true;

  clearTimeout(typingTimer);

  if (currentState !== states.typing) {
    currentState = states.typing;

    win.webContents.send("pet-state", currentState);
  }

  typingTimer = setTimeout(async () => {
    isTyping = false;
    typingTimer = null;

    const position = await mouse.getPosition();

    const dipPosition = screen.screenToDipPoint({
      x: position.x,
      y: position.y,
    });

    const mouseX = dipPosition.x;
    const mouseY = dipPosition.y;

    const mouseMoved = prevX !== null && (prevX !== mouseX || prevY !== mouseY);

    if (mouseMoved) {
      currentState = states.walk;

      win.webContents.send("pet-state", currentState);
    } else {
      currentState = states.idle;

      win.webContents.send("pet-state", currentState);
    }
  }, 1000);
});

ipcMain.handle("get-mouse-position", async () => {
  return await getMousePosition();
});

app.whenReady().then(createWindow);
