# Egypt Academy — how this is wired together

## Folder structure
```
index.html          <- shell page, loads styles.css + data + app.js
app.js               <- orchestrator: routing, wallpaper rendering, app loader
styles.css           <- global design system (glass panels, colors, fonts)
data/
  lessons.js         <- registry of wallpapers + hotspots + which app each opens
assets/
  wallpapers/
    pyramids.jpg      <- YOU add this
    nile.jpg          <- YOU add this
apps/
  pyramid-khufu/       <- fully working example app
    index.html         <- HTML fragment (no <html>/<head>, just the content)
    style.css           <- scoped-by-classname CSS for this app only
    script.js            <- wrapped in an IIFE, exposes window.currentAppTeardown
  pyramid-khafre/       <- copy the khufu folder to start these
  pyramid-menkaure/
  nile-river/
  nile-lotus/
  nile-crocodile/
```

## How a click becomes a lesson
1. User clicks a wallpaper card on the dashboard → `openScene(wallpaperId)`
   reads `data/lessons.js` and draws the fullscreen photo + glowing hotspots.
2. User clicks a hotspot → `openLesson(appId, label)` fetches
   `apps/<appId>/index.html`, injects `style.css` as a `<link>`, and injects
   `script.js` as a `<script>` tag into the page.
3. When the user goes back, `cleanupLoadedApp()` removes that `<link>` and
   `<script>` tag and calls `window.currentAppTeardown()` if the app defined
   one — so nothing leaks between lessons.

## Adding a new lesson app
1. Duplicate `apps/pyramid-khufu/` → rename the folder (e.g. `apps/nile-lotus/`).
2. Edit its `index.html`, `style.css`, `script.js` — keep class names scoped
   with a unique prefix (e.g. `.lotus-title`) so styles never collide with
   other apps.
3. In `script.js`, call `window.markLessonComplete("your-app-id")` whenever
   the user finishes, and set `window.currentAppTeardown` if you added any
   event listeners or timers.
4. Register the hotspot in `data/lessons.js`:
   ```js
   {
     id: "lotus",
     label: "Blue Lotus Flower",
     x: 22, y: 78,   // percentage position over the wallpaper image
     appId: "nile-lotus"
   }
   ```
5. Add `"nile-lotus"` to `allLessonIds` in the same file so it counts toward
   the dashboard progress bar.

## Positioning hotspots on your real photos
Open your photo in any image viewer, hover the pyramid/lotus/etc, note the
pixel position, then:
```
x% = (pixel_x / image_width) * 100
y% = (pixel_y / image_height) * 100
```
Put those numbers into `data/lessons.js`. Since hotspots are positioned with
`%`, they'll stay aligned on the photo at any screen size.

## Next steps I'd suggest
- Drop your two real photos into `assets/wallpapers/`
- Copy `pyramid-khufu` five times for the other five lessons
- Tell me the actual content/facts you want in each lesson and I'll write them
