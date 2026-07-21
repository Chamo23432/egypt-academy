// Entry point — boots the Three.js scene, renderer, and game loop.
import { createScene } from "./scene.js";
import { createInput } from "./input.js";
import { createPlayerController } from "../player/player-controller.js";
import { createPauseMenu } from "../ui/pause-menu.js";

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

const { scene, camera, renderer } = createScene();

let paused = false;

const pauseMenu = createPauseMenu(uiRoot, {
  onResume: () => setPaused(false),
});

function setPaused(value) {
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
  isPaused: () => paused,
});

const playerController = createPlayerController(camera, input);

let lastTime = performance.now();
function animate() {
  requestAnimationFrame(animate);
  const now = performance.now();
  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;

  if (!paused) {
    playerController.update(dt);
  }

  renderer.render(scene, camera);
}
animate();
