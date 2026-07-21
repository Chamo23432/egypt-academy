// Attack swing, use item, place/break animations. First-person arm bob.
// Rigid Minecraft-style motion — snap poses driven by simple timers, no easing curves.

const BOB_SPEED = 9;
const BOB_AMOUNT = 0.04;
const SWING_DURATION = 0.25; // seconds for a full attack swing

export function createFirstPersonArmAnimator(armPivot) {
  const restPosition = armPivot.position.clone();
  const restRotation = armPivot.rotation.clone();

  let bobTime = 0;
  let swingTimer = 0; // > 0 while an attack swing is playing

  function triggerSwing() {
    swingTimer = SWING_DURATION;
  }

  function update(dt, { isMoving }) {
    // Movement bob
    if (isMoving) {
      bobTime += dt * BOB_SPEED;
    } else {
      bobTime += dt * BOB_SPEED * 0.15; // near-still when idle
    }
    const bobX = Math.sin(bobTime) * BOB_AMOUNT;
    const bobY = Math.abs(Math.cos(bobTime)) * BOB_AMOUNT;

    armPivot.position.x = restPosition.x + bobX;
    armPivot.position.y = restPosition.y + bobY;

    // Attack swing overrides rotation while active — rigid snap-forward-and-back
    if (swingTimer > 0) {
      swingTimer = Math.max(0, swingTimer - dt);
      const t = 1 - swingTimer / SWING_DURATION; // 0 -> 1 over swing
      // Snap out then back — two rigid segments, no smoothing curve
      const swingAngle = t < 0.5 ? (t / 0.5) * -0.9 : ((1 - t) / 0.5) * -0.9;
      armPivot.rotation.x = restRotation.x + swingAngle;
    } else {
      armPivot.rotation.x = restRotation.x;
    }
  }

  return { update, triggerSwing };
}
