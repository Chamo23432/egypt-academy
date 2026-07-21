// Entry point — boots the Three.js scene, renderer, and game loop.
import { createScene } from "./scene.js";
import { createInput } from "./input.js";
import { createPlayerController } from "../player/player-controller.js";
import { createHealthSystem } from "../player/health.js";
import { createFirstPersonArm } from "../player/player-model.js";
import { createFirstPersonArmAnimator } from "../animations/interaction-anims.js";
import { createPauseMenu } from "../ui/pause-menu.js";
import { createDeathScreen, createDamageFlash } from "../ui/death-screen.js";

const uiRoot = document.getElementById("ui-root");
const canvas = document.getElementById("game-canvas");

// Crosshair
const crosshair = document.createElement("div");
crosshair.className = "crosshair";
uiRoot.appendChild(crosshair);

// Health HUD (only HUD element while playing)
const healthHud = document.createElement("div");
healthHud.className = "health-hud";
healthHud.innerHTML = `<div class="health-bar-track"><div class="health-bar-fill" id="health-fill"></div></div>`;
uiRoot.appendChild(healthHud);
const healthFillEl = document.getElementById("health-fill");

const { scene, camera, renderer } = createScene();

// First-person arm, parented to the camera so it moves/rotates with view.
const fpArmPivot = createFirstPersonArm();
camera.add(fpArmPivot);
scene.add(camera);
const fpArmAnimator = createFirstPersonArmAnimator(fpArmPivot);

let paused = false;

const pauseMenu = createPauseMenu(uiRoot, {
  onResume: () => setPaused(false),
});

const damageFlash = createDamageFlash(uiRoot);
const deathScreen = createDeathScreen(uiRoot, {
  onRespawn: () => {
    health.respawn();
    camera.position.set(0, 1.7, 5);
    setPaused(false);
  },
});

const health = createHealthSystem({
  onDamage: (current, max) => {
    healthFillEl.style.width = `${(current / max) * 100}%`;
    damageFlash.trigger();
  },
  onDeath: () => {
    deathScreen.show();
    if (input.isPointerLocked()) input.exitPointerLock();
  },
});

function setPaused(value) {
  if (health.isDead()) return; // death screen takes priority over pause
  paused = value;
  if (paused) {
    pauseMenu.show();
    crosshair.style.display = "none";
    if (input.isPointerLocked()) input.exitPointerLock();
  } else {
    pauseMenu.hide();
    crosshair.style.display = "block";
    canvas.requestPointerLock();
  }
}

const input = createInput(canvas, {
  onPauseToggle: () => setPaused(!paused),
  onToggleInventory: () => {
    // Phase 3 will hook the backpack sequence here.
    console.log("Inventory toggle — not implemented yet (Phase 3).");
  },
  onDrop: () => {
    console.log("Drop item — not implemented yet (Phase 3).");
  },
  isPaused: () => paused || health.isDead(),
});

const playerController = createPlayerController(camera, input);

// Left-click triggers the attack swing (Phase 2 preview — full combat is later).
canvas.addEventListener("mousedown", (e) => {
  if (e.button === 0 && input.isPointerLocked()) {
    fpArmAnimator.triggerSwing();
  }
});

// Debug: press H to take 2 damage, for testing the health/death flow
// until real damage sources (crocodiles, etc.) exist in later phases.
document.addEventListener("keydown", (e) => {
  if (e.code === "KeyH" && !paused) health.takeDamage(2);
});

let lastTime = performance.now();
function animate() {
  requestAnimationFrame(animate);
  const now = performance.now();
  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;

  if (!paused && !health.isDead()) {
    playerController.update(dt);

    const { keys } = input;
    const isMoving = keys.forward || keys.back || keys.left || keys.right;
    fpArmAnimator.update(dt, { isMoving });
  }

  renderer.render(scene, camera);
}
animate();
