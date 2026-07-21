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

### Phase 3 — Inventory & backpack sequence
- Hotbar (2 slots: main hand, off hand)
- Backpack pickup item in world
- Full E-press backpack animation sequence (see above)
- Inventory UI (grid) wired to backpack storage
- Q to drop

### Phase 4 — Hub + Portals
- Spawn hub area
- 2 portals with visual identity (pyramids vs Nile)
- Portal transition into each world

### Phase 5 — Pyramids world
- Desert terrain + trail from spawn to pyramids
- Pyramid exteriors (multiple, right-clickable)
- Per-pyramid cutscene system (fade out/in + scripted camera sequence)
- Pyramid interiors (basic empty interior shell first)

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
