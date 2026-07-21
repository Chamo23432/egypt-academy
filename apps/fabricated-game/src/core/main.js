// Entry point — boots the Three.js scene, renderer, and game loop.
import * as THREE from "three";
import { createScene } from "./scene.js";
import { createInput } from "./input.js";
import { createPlayerController } from "../player/player-controller.js";
import { createHealthSystem } from "../player/health.js";
import { createFirstPersonArm } from "../player/player-model.js";
import { createFirstPersonArmAnimator } from "../animations/interaction-anims.js";
import { createInventory } from "../player/inventory.js";
import { createBackpackSequence } from "../player/backpack-sequence.js";
import { createPauseMenu } from "../ui/pause-menu.js";
import { createDeathScreen, createDamageFlash } from "../ui/death-screen.js";
import { createHotbarUI } from "../ui/hotbar-ui.js";
import { createInventoryUI } from "../ui/inventory-ui.js";
import { createHubPortals } from "../world/hub-portals.js";
import { createPortalTransition } from "../ui/portal-transition.js";

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

// Backpack sequence status text (stand-in visual for Phase 3)
const backpackStatusEl = document.createElement("div");
backpackStatusEl.className = "backpack-status";
uiRoot.appendChild(backpackStatusEl);

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

// --- Inventory / backpack (Phase 3) ---
const inventory = createInventory();
const hotbarUI = createHotbarUI(uiRoot, inventory);
const backpackSequence = createBackpackSequence(fpArmPivot, backpackStatusEl);
let inventoryOpen = false;

const inventoryUI = createInventoryUI(uiRoot, inventory, {
  onClose: () => { inventoryOpen = false; },
});

// Backpack pickup item placed in the world — walk near it and it's picked up.
const backpackPickupGeo = new THREE.BoxGeometry(0.5, 0.4, 0.3);
const backpackPickupMat = new THREE.MeshStandardMaterial({ color: 0x7a4a2a });
const backpackPickupMesh = new THREE.Mesh(backpackPickupGeo, backpackPickupMat);
backpackPickupMesh.position.set(2, 0.3, 2);
backpackPickupMesh.castShadow = true;
scene.add(backpackPickupMesh);

// --- Hub + Portals (Phase 4) ---
const portalTransition = createPortalTransition(uiRoot);
let inTransition = false;

const hubPortals = createHubPortals(scene, {
  onEnterPyramids: () => enterWorld("Pyramids", new THREE.Vector3(-4, 1.7, -20)),
  onEnterNile: () => enterWorld("Nile", new THREE.Vector3(4, 1.7, -20)),
});

async function enterWorld(worldName, destination) {
  if (inTransition) return;
  inTransition = true;
  input.exitPointerLock();
  await portalTransition.playTransition(() => {
    camera.position.copy(destination);
    console.log(
      `Entered the ${worldName} world (placeholder teleport — real terrain arrives in a later phase).`
    );
  });
  canvas.requestPointerLock();
  hubPortals.resetTrigger();
  inTransition = false;
}

async function toggleInventory() {
  if (health.isDead() || paused || inTransition) return;
  if (backpackSequence.isBusy()) return;

  if (!inventory.hasBackpack()) {
    console.log("No backpack yet — find and pick one up first.");
    return;
  }

  if (!inventoryOpen) {
    inventoryOpen = true;
    input.exitPointerLock();
    await backpackSequence.playOpen();
    inventoryUI.show();
  } else {
    inventoryUI.hide();
    await backpackSequence.playClose();
    canvas.requestPointerLock();
  }
}

function dropCurrentItem() {
  if (health.isDead() || paused || inventoryOpen) return;
  const dropped = inventory.dropHotbarItem(0);
  if (dropped) {
    console.log("Dropped:", dropped.name);
    hotbarUI.render();
  } else {
    console.log("Nothing in main hand to drop.");
  }
}

function setPaused(value) {
  if (health.isDead()) return; // death screen takes priority over pause
  if (inventoryOpen) return; // inventory takes priority over pause toggle
  if (inTransition) return; // don't allow pausing mid-portal-transition
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
  onToggleInventory: toggleInventory,
  onDrop: dropCurrentItem,
  isPaused: () => paused || health.isDead() || inventoryOpen || inTransition,
  onPointerLockChange: (locked) => {
    document.body.classList.toggle("pointer-locked", locked);
  },
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

  if (!paused && !health.isDead() && !inventoryOpen) {
    playerController.update(dt);

    const { keys } = input;
    const isMoving = keys.forward || keys.back || keys.left || keys.right;
    fpArmAnimator.update(dt, { isMoving });

    if (!inTransition) {
      hubPortals.update(dt, camera.position);
    }

    // Backpack pickup check — simple distance test against the camera.
    if (backpackPickupMesh.visible && !inventory.hasBackpack()) {
      const dist = camera.position.distanceTo(backpackPickupMesh.position);
      if (dist < 1.2) {
        inventory.pickUpBackpack();
        backpackPickupMesh.visible = false;
        console.log("Picked up the backpack! Press E to open your inventory.");
      }
    }
  }

  renderer.render(scene, camera);
}
animate();
