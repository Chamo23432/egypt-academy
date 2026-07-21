// Movement logic: walk, run, jump, crouch. Phase 1: camera-as-player,
// no visible model or collision mesh yet — just ground-plane physics.
import * as THREE from "three";

const WALK_SPEED = 4.3;
const CROUCH_SPEED = 2.0;
const JUMP_VELOCITY = 6.5;
const GRAVITY = -18;
const STAND_HEIGHT = 1.7;
const CROUCH_HEIGHT = 1.3;

export function createPlayerController(camera, input) {
  let velocityY = 0;
  let onGround = true;
  let currentEyeHeight = STAND_HEIGHT;

  function update(dt) {
    const { keys } = input;

    // Look direction from yaw/pitch
    camera.rotation.order = "YXZ";
    camera.rotation.y = input.getYaw();
    camera.rotation.x = input.getPitch();

    // Movement direction relative to yaw
    const forward = new THREE.Vector3(
      -Math.sin(input.getYaw()),
      0,
      -Math.cos(input.getYaw())
    );
    const right = new THREE.Vector3(
      Math.cos(input.getYaw()),
      0,
      -Math.sin(input.getYaw())
    );

    const moveDir = new THREE.Vector3();
    if (keys.forward) moveDir.add(forward);
    if (keys.back) moveDir.sub(forward);
    if (keys.right) moveDir.add(right);
    if (keys.left) moveDir.sub(right);
    if (moveDir.lengthSq() > 0) moveDir.normalize();

    const speed = keys.crouch ? CROUCH_SPEED : WALK_SPEED;
    camera.position.addScaledVector(moveDir, speed * dt);

    // Crouch eye-height lerp
    const targetHeight = keys.crouch ? CROUCH_HEIGHT : STAND_HEIGHT;
    currentEyeHeight += (targetHeight - currentEyeHeight) * Math.min(1, dt * 10);

    // Jump / gravity (flat ground at y=0 for Phase 1)
    if (keys.jump && onGround) {
      velocityY = JUMP_VELOCITY;
      onGround = false;
    }
    velocityY += GRAVITY * dt;

    let newY = camera.position.y + velocityY * dt;
    const groundY = currentEyeHeight;
    if (newY <= groundY) {
      newY = groundY;
      velocityY = 0;
      onGround = true;
    }
    camera.position.y = newY;
  }

  return { update, isOnGround: () => onGround };
}
