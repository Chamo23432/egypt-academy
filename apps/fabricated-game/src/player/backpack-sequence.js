// The E-press animation sequence: remove backpack, place on ground, bend,
// unzip, show inventory UI, then reverse on close.
//
// Phase 3: since the player is first-person-only right now (no visible full
// body / world-space backpack prop yet — that's a Phase 5+/world-integration
// concern), this drives the sequence through timed stages using the FP arm
// as the visual stand-in (reaches down out of view) plus status text, and
// calls back at the right moment to actually show/hide the inventory UI.
// The real "backpack drops to the ground and unzips" 3D animation gets
// swapped in once the third-person model is wired into the main scene.

const STAGE_DURATION = 450; // ms per stage, rigid/snappy rather than eased

const OPEN_STAGES = ["Taking off backpack...", "Placing it down...", "Opening zipper..."];
const CLOSE_STAGES = ["Closing zipper...", "Picking backpack back up...", "Putting it on..."];

export function createBackpackSequence(fpArmPivot, statusEl) {
  let busy = false;

  function runStages(stages, armDownAngle) {
    return new Promise((resolve) => {
      let i = 0;
      function next() {
        if (i >= stages.length) {
          resolve();
          return;
        }
        statusEl.textContent = stages[i];
        statusEl.style.display = "block";
        i++;
        setTimeout(next, STAGE_DURATION);
      }
      // Arm reaches down as a simple visual cue while stages play out.
      if (fpArmPivot) fpArmPivot.rotation.x = armDownAngle;
      next();
    });
  }

  async function playOpen() {
    if (busy) return;
    busy = true;
    await runStages(OPEN_STAGES, 0.9);
    statusEl.style.display = "none";
    busy = false;
  }

  async function playClose() {
    if (busy) return;
    busy = true;
    await runStages(CLOSE_STAGES, 0.9);
    statusEl.style.display = "none";
    if (fpArmPivot) fpArmPivot.rotation.x = 0.3; // back to rest pose
    busy = false;
  }

  return { playOpen, playClose, isBusy: () => busy };
}
