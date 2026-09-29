async function checkMousePosition() {
  const position = await window.electronAPI.getMousePosition();

  console.log("Mouse X : ", position.x);
  console.log("Mouse Y: ", position.y);
}

window.electronAPI.onPetStateChange((state) => {
  const cat = document.querySelector(".cat");

  cat.classList.remove(
    "idle",
    "walk",
    "typing",
    "idleToSleep",
    "sleep",
    "wakeup",
  );

  cat.classList.add(state);

  if (state === "idleToSleep") {
    cat.addEventListener(
      "animationend",
      () => {
        window.electronAPI.sleepAnimationComplete();
      },
      { once: true },
    );
  }

  if (state === "wakeup") {
    cat.addEventListener(
      "animationend",
      () => {
        window.electronAPI.wakeupAnimationComplete();
      },
      { once: true },
    );
  }
});

window.electronAPI.onPetDirectionChange((direction) => {
  const cat = document.querySelector(".cat");

  cat.classList.remove("left", "right");
  cat.classList.add(direction);
});

window.addEventListener("keydown", () => {
  window.electronAPI.setTyping();
});

checkMousePosition();
