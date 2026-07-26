// Keyboard/mouse input handling: WASD, space, shift, e, q, esc, pointer lock.

// Chrome (and some other browsers) enforce a short cooldown after an
// Escape-triggered pointer-lock exit before a new lock request is allowed.
// A request made inside that window fails silently. To make "resume"
// buttons reliable, retry a couple of times with short delays.
function requestLockWithRetry(canvas, attemptsLeft = 4, delayMs = 150) {
  const promise = canvas.requestPointerLock();
  // requestPointerLock() may return a Promise (newer spec) or undefined
  // (older implementations) — handle both without assuming either.
  if (promise && typeof promise.catch === "function") {
    promise.catch(() => {
      if (attemptsLeft > 0) {
        setTimeout(() => requestLockWithRetry(canvas, attemptsLeft - 1, delayMs), delayMs);
      }
    });
  } else if (attemptsLeft > 0) {
    // Fallback for browsers without the Promise-returning API: just check
    // shortly after whether lock actually landed, and retry if not.
    setTimeout(() => {
      if (document.pointerLockElement !== canvas) {
        requestLockWithRetry(canvas, attemptsLeft - 1, delayMs);
      }
    }, delayMs);
  }
}

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
  let intentionalExit = false;
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
        // While pointer-locked, browsers force-exit lock on Escape and may
        // suppress this keydown entirely — the reliable path is detecting
        // the resulting pointerlockchange below. This handles the case
        // where we're NOT locked (e.g. menu already open, toggling closed
        // via Escape) so Escape still works to resume from the pause menu.
        if (!pointerLocked && callbacks.onPauseToggle) callbacks.onPauseToggle();
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
    const wasLocked = pointerLocked;
    pointerLocked = document.pointerLockElement === canvas;
    if (callbacks.onPointerLockChange) callbacks.onPointerLockChange(pointerLocked);

    // If we just lost lock and it wasn't us calling exitPointerLock()
    // ourselves, the browser force-exited it — almost always via Escape.
    // That's our real signal to open the pause menu.
    if (wasLocked && !pointerLocked && !intentionalExit) {
      if (callbacks.onPauseToggle) callbacks.onPauseToggle();
    }
    intentionalExit = false;
  }

  canvas.addEventListener("click", () => {
    if (!pointerLocked && !callbacks.isPaused?.()) {
      requestLockWithRetry(canvas);
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
    requestPointerLock: () => requestLockWithRetry(canvas),
    exitPointerLock: () => {
      intentionalExit = true;
      document.exitPointerLock();
    },
  };
}
