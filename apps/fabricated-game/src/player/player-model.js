// Steve-like blocky player model/rig.
// Phase 2: builds a simple blocky humanoid. Full body is used for third-person
// contexts (cutscenes later); for first-person view we only need the right
// arm + hand, which is what's actually visible to the player.
import * as THREE from "three";

const SKIN_COLOR = 0xc99a6b;
const SHIRT_COLOR = 0x00a86b;
const PANTS_COLOR = 0x3b5aa0;

export function createPlayerModel() {
  const group = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({ color: SKIN_COLOR });
  const shirtMat = new THREE.MeshStandardMaterial({ color: SHIRT_COLOR });
  const pantsMat = new THREE.MeshStandardMaterial({ color: PANTS_COLOR });

  // Head
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), skinMat);
  head.position.y = 1.55;
  head.castShadow = true;
  group.add(head);

  // Torso
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.75, 0.28), shirtMat);
  torso.position.y = 1.02;
  torso.castShadow = true;
  group.add(torso);

  // Arms (pivoted at shoulder so rotation swings naturally)
  function makeArm(side) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.34, 1.35, 0);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.7, 0.22), skinMat);
    arm.position.y = -0.35;
    arm.castShadow = true;
    pivot.add(arm);
    return pivot;
  }
  const leftArmPivot = makeArm(-1);
  const rightArmPivot = makeArm(1);
  group.add(leftArmPivot, rightArmPivot);

  // Legs
  function makeLeg(side) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.13, 0.62, 0);
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.75, 0.22), pantsMat);
    leg.position.y = -0.375;
    leg.castShadow = true;
    pivot.add(leg);
    return pivot;
  }
  const leftLegPivot = makeLeg(-1);
  const rightLegPivot = makeLeg(1);
  group.add(leftLegPivot, rightLegPivot);

  return {
    group,
    parts: { head, leftArmPivot, rightArmPivot, leftLegPivot, rightLegPivot },
  };
}

// A minimal first-person right arm, parented to the camera, so the player
// sees an arm+hand like vanilla Minecraft rather than their whole body.
export function createFirstPersonArm() {
  const skinMat = new THREE.MeshStandardMaterial({ color: SKIN_COLOR });
  const pivot = new THREE.Group();

  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.6, 0.22), skinMat);
  arm.position.set(0, -0.3, 0);
  pivot.add(arm);

  // Positioned bottom-right of view, like the vanilla FP arm.
  pivot.position.set(0.35, -0.45, -0.6);
  pivot.rotation.x = 0.3;
  pivot.rotation.z = -0.15;

  return pivot;
}
