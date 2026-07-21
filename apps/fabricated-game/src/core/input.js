// Keyboard/mouse input handling: WASD, space, shift, e, q, esc, pointer lock.

export function createInput(canvas, callbacks = {}) {
  const keys = {
    forward: false,
    back: false,
    left: false,
    right: false,
    jump: false,
    crouch: false,
  };

  let pointerLocked = false;
  let yaw = 0;
  let pitch = 0;
  const PITCH_LIMIT = Math.PI / 2 - 0.05;

  function onKeyDown(e) {
    switch (e.code) {
      case "KeyW": keys.forward = true; break;
      case "KeyS": keys.back = true; break;
      case "KeyA": keys.left = true; break;
      case "KeyD": keys.right = true; break;
      case "Space": keys.jump = true; e.preventDefault(); break;
      case "ShiftLeft":
      case "ShiftRight": keys.crouch = true; break;
      case "KeyE":
        if (callbacks.onToggleInventory) callbacks.onToggleInventory();
        break;
      case "KeyQ":
        if (callbacks.onDrop) callbacks.onDrop();
        break;
      case "Escape":
        if (callbacks.onPauseToggle) callbacks.onPauseToggle();
        break;
    }
  }

  function onKeyUp(e) {
    switch (e.code) {
      case "KeyW": keys.forward = false; break;
      case "KeyS": keys.back = false; break;
      case "KeyA": keys.left = false; break;
      case "KeyD": keys.right = false; break;
      case "Space": keys.jump = false; break;
      case "ShiftLeft":
      case "ShiftRight": keys.crouch = false; break;
    }
  }

  function onMouseMove(e) {
    if (!pointerLocked) return;
    const sensitivity = 0.0022;
    yaw -= e.movementX * sensitivity;
    pitch -= e.movementY * sensitivity;
    pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, pitch));
  }

  function onPointerLockChange() {
    pointerLocked = document.pointerLockElement === canvas;
    if (callbacks.onPointerLockChange) callbacks.onPointerLockChange(pointerLocked);
  }

  canvas.addEventListener("click", () => {
    if (!pointerLocked && !callbacks.isPaused?.()) {
      canvas.requestPointerLock();
    }
  });

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("pointerlockchange", onPointerLockChange);

  return {
    keys,
    getYaw: () => yaw,
    getPitch: () => pitch,
    isPointerLocked: () => pointerLocked,
    exitPointerLock: () => document.exitPointerLock(),
  };
}
