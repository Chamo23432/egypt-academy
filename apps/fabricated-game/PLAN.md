# Unreleased Egypt Game — Build Plan

3D browser voxel-style game (Three.js), Minecraft-inspired. Built in phases —
each phase is a separate working milestone, not all at once.

## Confirmed design decisions so far

### HUD (in-game UI while playing)
- Just health — nothing else on screen during normal play

### Spawn / Portals
- Player spawns at a hub with 2 portals
- Portal A → Pyramids world (desert)
- Portal B → Nile world (forest → riverbank)

### Player
- Default skin resembles Steve (blocky humanoid)
- 2 hotbar slots only: main hand + off hand
- Backpack item found on ground after spawning into a world; picking it up
  unlocks full inventory storage (separate from hotbar)

### Controls
- WASD — move
- Space — jump
- Shift — crouch
- E — open inventory (see Backpack Sequence below)
- Q — drop item
- Mouse — look (pointer lock, Minecraft-style crosshair)
- Esc — pause/options menu

### Pause Menu (Esc)
Sections (contents TBD, placeholders for now):
- Save and Exit
- Video
- Audio
- Gameplay
- Controls

### World: Pyramids (desert theme)
- Trail leads from spawn point to the pyramids
- Right-click a pyramid → unique per-pyramid cutscene → enter interior
  - Cutscene flow: screen fades to black → cutscene (3rd person-ish view of
    player looking at / walking into the pyramid) → fades back to normal FPV
  - Each pyramid has its own distinct cutscene

### World: Nile
- Player spawns in a forest, follows a trail to reach the riverbank
- Can swim in the Nile (Minecraft-style swim stroke animation)
- Right-click the Nile → interaction TBD
- Lotus flowers on the grass beside the river, right-clickable
- Crocodiles roam and chase/attack the player

### Animations (rigid limb-swing style, Minecraft-like — no smooth blending)
- Movement: walk, run, jump, crouch
- Combat/interaction: attack swing, use item, place/break
- First-person arm view synced to actions/movement (classic FPS arm bob)
- Idle: TBD (static vs subtle sway)
- Swimming: vanilla Minecraft-style stroke cycle
- Damage/death: health bar depletes on hit; death screen on 0 HP
- Backpack inventory sequence (on E):
  1. Player removes backpack
  2. Places it on the ground
  3. Bends down toward it
  4. Unzips it
  5. Inventory UI appears
  6. On close: zips backpack, re-equips it
- Portal entry: TBD (instant vs fade/swirl)
- Pyramid door interaction: covered by cutscene above

## Still open / to decide later
- What right-clicking the Nile itself does
- Pause menu section contents
- Sprint input (double-tap W? Ctrl?)
- Left/right click roles (attack vs use/place)
- Idle animation style
- Portal visual/transition effect

## Phases

### Phase 1 — Core engine skeleton ✅ DONE
- Three.js scene, camera, renderer boot-up
- Pointer lock + crosshair
- Basic ground plane + skybox placeholder
- WASD movement + jump + crouch (no animation yet, just camera/capsule movement)
- Esc pause menu shell (sections present, empty content)

### Phase 2 — Player rig & core animations ✅ DONE
- Steve-like blocky player model/rig (full body, for future third-person use)
- First-person right arm + hand visible to the player (Minecraft-style)
- Walk/idle rigid limb-swing animation (movement-anims.js) for the full-body rig
- First-person arm bob synced to movement + rigid attack-swing on left-click
- Health system (20-point scale), damage flash vignette, death screen + respawn
- Debug: press H to take test damage (temporary, remove once real damage
  sources like crocodiles exist in Phase 6)

### Phase 3 — Inventory & backpack sequence ✅ DONE (Phase 3 baseline)
- Hotbar (2 slots: main hand, off hand) UI, bottom-center
- Backpack pickup item placed in the world; walking near it grants
  inventory access (E does nothing until it's picked up)
- E-press backpack sequence: status-text stand-in for the 3D animation
  (take off / place down / unzip, then reverse on close) — swap in the real
  3D backpack-drop animation once a visible third-person model + world-space
  backpack prop exists
- Inventory UI: grid overlay (4x6 backpack slots)
- Q drops whatever's in the main hand slot

### Integration notes
- Egypt Academy now hides the sidebar/topbar/user-topbar when the
  Fabricated view is active, and the game iframe goes truly fullscreen
- Pointer lock hides the OS cursor natively; a `body.pointer-locked` CSS
  class + `cursor: none` is added as a fallback
- Pause menu restyled to look like vanilla Minecraft's pause screen
  (beveled gray buttons, dark dim backdrop, monospace font)

### Phase 4 — Hub + Portals ✅ DONE (Phase 4 baseline)
- Spawn hub with two glowing portal archways, positioned left/right, each
  with a floating text label ("Pyramids" / "The Nile") and a distinct
  glow color (warm sand vs cool teal) so they read as different destinations
- Walking within ~1.3 units of a portal triggers a fade-to-black transition
- On fade midpoint the camera teleports to a placeholder area (no real
  terrain yet — that's Phase 5/6). Real per-world spawn points get wired in
  once those worlds exist
- Fade transition system (portal-transition.js) is generic/reusable —
  the pyramid cutscene system in Phase 5 can build on the same pattern

### Bugfix — Pause menu not opening
- Root cause: while pointer-locked, browsers force-exit lock on Escape and
  can suppress the Escape `keydown` event entirely, so the old
  `onPauseToggle` (wired only to keydown) never fired
- Fix: input.js now distinguishes an intentional `exitPointerLock()` call
  from the browser's own forced exit. On an unintentional loss of lock
  (i.e. the player pressed Escape), it fires `onPauseToggle` itself. The
  keydown Escape handler still covers the case where Escape is pressed
  while NOT locked (e.g. closing the menu after it's already open)

### Bugfix round 2 — portal not triggering, "Back to Game" not re-locking, no auto-lock
- **Portal not working**: the proximity check used full 3D distance
  between the camera and the portal's base position. Since the portal
  base sits at y=0 and the camera sits at eye height (~1.7), that vertical
  offset alone exceeded the trigger radius, so it could never fire. Fixed
  by switching to horizontal (XZ-plane) distance and widening the radius.
  Same fix applied to the pyramid right-click interaction check.
- **"Back to Game" not re-locking the cursor**: Chrome (and some other
  browsers) enforce a short cooldown after an Escape-triggered pointer
  unlock before allowing a new lock request — a request inside that
  window fails silently. Added `requestLockWithRetry` in input.js, which
  retries a few times with short delays if the lock doesn't land. All
  `requestPointerLock` calls in the game (resume, respawn, after
  inventory close, after portal transition) now go through
  `input.requestPointerLock()` instead of calling the canvas method
  directly.
- **No auto-lock without opening/closing the pause menu**: browsers don't
  allow pointer lock without a direct user gesture, so a true "lock
  itself on load" isn't possible — but the existing canvas click-to-lock
  listener now also uses the retry helper, so the very first click
  anywhere on the canvas reliably locks (previously a raw one-shot
  request could silently fail under the same cooldown/edge cases as
  above).

### Phase 5 — Pyramids world ✅ DONE (Phase 5 baseline)
- Desert ground plane + a visible trail strip from the hub-facing spawn
  point toward the pyramid cluster
- 3 pyramids (cone-with-4-sides geometry), each with a distinct name:
  Pyramid of the Dawn, Great Pyramid, Pyramid of the Dusk
- Right-click near a pyramid (within interact range) triggers entry
- Cutscene system: each pyramid has its own distinct scripted camera path
  (different angles/approach per the "each cutscene is different" request),
  built on top of the same fade-to-black transition used for portals
- Pyramid interiors are still placeholder (camera just ends up just inside
  the doorway) — actual interior geometry/rooms are a later polish pass
- World visibility is toggled (pyramidsWorld.setActive) rather than the
  hub and pyramids both always existing in the scene at once

### Phase 6 — Nile world
- Forest spawn + trail to riverbank
- Nile river with swim mechanics
- Lotus flowers (right-clickable interactive props)
- Crocodile AI: wander → detect player → chase → attack

### Phase 7 — Polish pass
- Fill in pause menu sections (video/audio/gameplay/controls settings)
- Decide + implement remaining open items above
- Bug fixing, performance pass

---
*This file is the source of truth for scope — update it as decisions are made
in future sessions so context isn't lost between conversations.*
