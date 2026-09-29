const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getMousePosition: () => ipcRenderer.invoke("get-mouse-position"),

  onPetStateChange: (callback) => {
    ipcRenderer.on("pet-state", (event, state) => {
      callback(state);
    });
  },

  onPetDirectionChange: (callback) => {
    ipcRenderer.on("pet-direction", (event, direction) => {
      callback(direction);
    });
  },

  setTyping: () => ipcRenderer.send("pet-typing"),

  sleepAnimationComplete: () => ipcRenderer.send("sleep-animation-complete"),
});
