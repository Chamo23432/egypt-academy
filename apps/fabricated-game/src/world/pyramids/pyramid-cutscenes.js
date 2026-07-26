// Per-pyramid unique cutscene definitions (camera paths, timing).
//
// Each cutscene: fade to black -> camera takes a short scripted path that
// frames the player looking at, then walking toward, the pyramid entrance
// -> fade back in, now positioned just inside the interior.
//
// Camera paths differ per pyramid so each one feels distinct, per the
// original request. Timing/style stays rigid (no bezier easing) to match
// the game's overall simple/blocky aesthetic.

import * as THREE from "three";

function lerpVec3(a, b, t) {
  return new THREE.Vector3().lerpVectors(a, b, t);
}

// Generic scripted pan: moves the camera through a list of waypoints over
// totalDurationMs, calling render each frame via requestAnimationFrame.
function playCameraPath(camera, waypoints, totalDurationMs) {
  return new Promise((resolve) => {
    const start = performance.now();
    function step(now) {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / totalDurationMs);
      const segment = t * (waypoints.length - 1);
      const idx = Math.min(waypoints.length - 2, Math.floor(segment));
      const segT = segment - idx;

      const from = waypoints[idx];
      const to = waypoints[idx + 1];
      camera.position.copy(lerpVec3(from.position, to.position, segT));
      camera.lookAt(lerpVec3(from.lookAt, to.lookAt, segT));

      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        resolve();
      }
    }
    requestAnimationFrame(step);
  });
}

// Each definition returns the waypoints relative to the pyramid's own
// position, so they work regardless of which of the 3 pyramids is entered.
const CUTSCENE_DEFINITIONS = {
  "Pyramid of the Dawn": (pyramidPos) => [
    {
      position: new THREE.Vector3(pyramidPos.x, 2.2, pyramidPos.z + 10),
      lookAt: pyramidPos,
    },
    {
      position: new THREE.Vector3(pyramidPos.x - 3, 1.9, pyramidPos.z + 5),
      lookAt: pyramidPos,
    },
    {
      position: new THREE.Vector3(pyramidPos.x, 1.7, pyramidPos.z + 1),
      lookAt: new THREE.Vector3(pyramidPos.x, 1.7, pyramidPos.z),
    },
  ],
  "Great Pyramid": (pyramidPos) => [
    {
      position: new THREE.Vector3(pyramidPos.x + 8, 3.5, pyramidPos.z + 12),
      lookAt: pyramidPos,
    },
    {
      position: new THREE.Vector3(pyramidPos.x, 2.5, pyramidPos.z + 8),
      lookAt: pyramidPos,
    },
    {
      position: new THREE.Vector3(pyramidPos.x, 1.7, pyramidPos.z + 1),
      lookAt: new THREE.Vector3(pyramidPos.x, 1.7, pyramidPos.z),
    },
  ],
  "Pyramid of the Dusk": (pyramidPos) => [
    {
      position: new THREE.Vector3(pyramidPos.x - 8, 1.8, pyramidPos.z + 9),
      lookAt: pyramidPos,
    },
    {
      position: new THREE.Vector3(pyramidPos.x + 2, 1.7, pyramidPos.z + 4),
      lookAt: pyramidPos,
    },
    {
      position: new THREE.Vector3(pyramidPos.x, 1.7, pyramidPos.z + 1),
      lookAt: new THREE.Vector3(pyramidPos.x, 1.7, pyramidPos.z),
    },
  ],
};

export async function playPyramidCutscene(camera, pyramid) {
  const def = CUTSCENE_DEFINITIONS[pyramid.name];
  if (!def) return;
  const waypoints = def(pyramid.mesh.position);
  await playCameraPath(camera, waypoints, 2200);
}
