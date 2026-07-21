// Rigid limb-swing animations: walk, run, jump, crouch, idle.
// Minecraft-style — no blending, just direct sine-driven rotations.

const SWING_SPEED = 8;   // radians/sec multiplier while moving
const MAX_SWING = 0.7;   // max limb swing angle (radians)
const IDLE_SWAY_SPEED = 1.2;
const IDLE_SWAY_AMOUNT = 0.03;

export function createMovementAnimator(playerParts) {
  let swingTime = 0;

  function update(dt, { isMoving, isCrouching }) {
    const { leftArmPivot, rightArmPivot, leftLegPivot, rightLegPivot } = playerParts;

    if (isMoving) {
      swingTime += dt * SWING_SPEED;
      const swing = Math.sin(swingTime) * MAX_SWING;
      // Opposite arm/leg pairs swing in opposition (classic walk cycle)
      leftArmPivot.rotation.x = swing;
      rightArmPivot.rotation.x = -swing;
      leftLegPivot.rotation.x = -swing;
      rightLegPivot.rotation.x = swing;
    } else {
      // Idle: settle limbs back to rest, with a very subtle sway
      swingTime += dt * IDLE_SWAY_SPEED;
      const sway = Math.sin(swingTime) * IDLE_SWAY_AMOUNT;
      leftArmPivot.rotation.x = sway;
      rightArmPivot.rotation.x = -sway;
      leftLegPivot.rotation.x = 0;
      rightLegPivot.rotation.x = 0;
    }

    // Crouch posture: hunch arms/legs slightly inward, rigid (no blending)
    const crouchTilt = isCrouching ? 0.15 : 0;
    leftArmPivot.rotation.z = crouchTilt;
    rightArmPivot.rotation.z = -crouchTilt;
  }

  return { update };
}
