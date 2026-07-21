// Death screen shown when health reaches 0.

export function createDeathScreen(uiRoot, { onRespawn } = {}) {
  const overlay = document.createElement("div");
  overlay.className = "death-overlay";
  overlay.style.display = "none";

  const title = document.createElement("h1");
  title.textContent = "You Died";
  overlay.appendChild(title);

  const respawnBtn = document.createElement("button");
  respawnBtn.className = "death-respawn-btn";
  respawnBtn.textContent = "Respawn";
  respawnBtn.addEventListener("click", () => {
    overlay.style.display = "none";
    if (onRespawn) onRespawn();
  });
  overlay.appendChild(respawnBtn);

  uiRoot.appendChild(overlay);

  return {
    show: () => { overlay.style.display = "flex"; },
    hide: () => { overlay.style.display = "none"; },
  };
}

// Brief red vignette flash on taking damage.
export function createDamageFlash(uiRoot) {
  const flash = document.createElement("div");
  flash.className = "damage-flash";
  uiRoot.appendChild(flash);

  let timeout = null;
  function trigger() {
    flash.classList.remove("active");
    // eslint-disable-next-line no-unused-expressions
    flash.offsetHeight; // force reflow so the animation restarts
    flash.classList.add("active");
    clearTimeout(timeout);
    timeout = setTimeout(() => flash.classList.remove("active"), 300);
  }

  return { trigger };
}
