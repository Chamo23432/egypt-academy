// Spawn hub with the two portals (pyramids / Nile) and transition logic.
import * as THREE from "three";

const PORTAL_WIDTH = 2.2;
const PORTAL_HEIGHT = 3.4;
const TRIGGER_DISTANCE = 1.3;

function buildPortalFrame(color) {
  const group = new THREE.Group();

  const frameMat = new THREE.MeshStandardMaterial({ color: 0x2b2b2b });
  const frameThickness = 0.25;

  // Simple rectangular arch made of 4 beams
  const topBeam = new THREE.Mesh(
    new THREE.BoxGeometry(PORTAL_WIDTH + frameThickness * 2, frameThickness, frameThickness),
    frameMat
  );
  topBeam.position.y = PORTAL_HEIGHT;
  group.add(topBeam);

  const bottomBeam = topBeam.clone();
  bottomBeam.position.y = 0;
  group.add(bottomBeam);

  const leftBeam = new THREE.Mesh(
    new THREE.BoxGeometry(frameThickness, PORTAL_HEIGHT, frameThickness),
    frameMat
  );
  leftBeam.position.set(-PORTAL_WIDTH / 2 - frameThickness / 2, PORTAL_HEIGHT / 2, 0);
  group.add(leftBeam);

  const rightBeam = leftBeam.clone();
  rightBeam.position.x = PORTAL_WIDTH / 2 + frameThickness / 2;
  group.add(rightBeam);

  // Glowing portal surface
  const surfaceMat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.9,
    side: THREE.DoubleSide,
  });
  const surface = new THREE.Mesh(
    new THREE.PlaneGeometry(PORTAL_WIDTH, PORTAL_HEIGHT),
    surfaceMat
  );
  surface.position.y = PORTAL_HEIGHT / 2;
  group.add(surface);

  [topBeam, bottomBeam, leftBeam, rightBeam].forEach((b) => {
    b.castShadow = true;
    b.receiveShadow = true;
  });

  return { group, surface };
}

function makeLabel(text) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f2d98b";
  ctx.font = "bold 56px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(2.4, 0.6, 1);
  return sprite;
}

export function createHubPortals(scene, { onEnterPyramids, onEnterNile } = {}) {
  // Pyramids portal — warm sandy/orange glow
  const pyramidsPortal = buildPortalFrame(0xe0a53c);
  pyramidsPortal.group.position.set(-4, 0, -6);
  pyramidsPortal.group.rotation.y = Math.PI / 8;
  const pyramidsLabel = makeLabel("Pyramids");
  pyramidsLabel.position.set(-4, PORTAL_HEIGHT + 0.6, -6);
  scene.add(pyramidsPortal.group, pyramidsLabel);

  // Nile portal — cool blue-green glow
  const nilePortal = buildPortalFrame(0x2f9e8f);
  nilePortal.group.position.set(4, 0, -6);
  nilePortal.group.rotation.y = -Math.PI / 8;
  const nileLabel = makeLabel("The Nile");
  nileLabel.position.set(4, PORTAL_HEIGHT + 0.6, -6);
  scene.add(nilePortal.group, nileLabel);

  let time = 0;
  let triggered = false;

  function update(dt, cameraPosition) {
    time += dt;
    // Gentle pulsing glow on both portal surfaces
    const pulse = 0.7 + Math.sin(time * 2) * 0.2;
    pyramidsPortal.surface.material.emissiveIntensity = pulse;
    nilePortal.surface.material.emissiveIntensity = pulse;

    if (triggered) return;

    const distToPyramids = cameraPosition.distanceTo(pyramidsPortal.group.position);
    const distToNile = cameraPosition.distanceTo(nilePortal.group.position);

    if (distToPyramids < TRIGGER_DISTANCE) {
      triggered = true;
      if (onEnterPyramids) onEnterPyramids();
    } else if (distToNile < TRIGGER_DISTANCE) {
      triggered = true;
      if (onEnterNile) onEnterNile();
    }
  }

  function resetTrigger() {
    triggered = false;
  }

  return { update, resetTrigger };
}
