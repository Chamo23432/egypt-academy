// Desert terrain, trail, pyramid exteriors + interiors.
import * as THREE from "three";

const PYRAMID_POSITIONS = [
  { x: -8, z: -30, size: 6, name: "Pyramid of the Dawn" },
  { x: 0, z: -38, size: 8, name: "Great Pyramid" },
  { x: 9, z: -30, size: 5, name: "Pyramid of the Dusk" },
];

const INTERACT_DISTANCE = 4.5;

function buildDesertGround() {
  const geo = new THREE.PlaneGeometry(200, 200, 1, 1);
  const mat = new THREE.MeshStandardMaterial({ color: 0xd9c07a });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  return mesh;
}

function buildTrail() {
  // A simple visible trail strip leading from the hub spawn toward the
  // pyramid cluster — a slightly darker sand-colored path.
  const geo = new THREE.PlaneGeometry(3, 40);
  const mat = new THREE.MeshStandardMaterial({ color: 0xc2a15b });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(0, 0.01, -20);
  mesh.receiveShadow = true;
  return mesh;
}

function buildPyramid({ x, z, size }) {
  const geo = new THREE.ConeGeometry(size, size * 0.75, 4);
  const mat = new THREE.MeshStandardMaterial({ color: 0xc9a15c, flatShading: true });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, (size * 0.75) / 2, z);
  mesh.rotation.y = Math.PI / 4; // square base aligned to axes
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function createPyramidsWorld(scene) {
  const group = new THREE.Group();
  group.visible = false; // hidden until the player actually enters this world

  const ground = buildDesertGround();
  const trail = buildTrail();
  group.add(ground, trail);

  const pyramids = PYRAMID_POSITIONS.map((p) => {
    const mesh = buildPyramid(p);
    group.add(mesh);
    return { mesh, name: p.name, entered: false };
  });

  scene.add(group);

  function setActive(active) {
    group.visible = active;
  }

  // Right-click (contextmenu, since that's how "right click" is captured
  // in a pointer-locked canvas) near a pyramid triggers its entry.
  function checkInteraction(cameraPosition, isRightClickPressed, onEnterPyramid) {
    if (!group.visible || !isRightClickPressed) return;
    for (const p of pyramids) {
      const dist = cameraPosition.distanceTo(p.mesh.position);
      if (dist < INTERACT_DISTANCE + Math.max(p.mesh.geometry.parameters.radius, 0)) {
        onEnterPyramid(p);
        return;
      }
    }
  }

  return { group, pyramids, setActive, checkInteraction, spawnPoint: new THREE.Vector3(0, 1.7, -8) };
}
