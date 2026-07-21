// Fade-to-black transition used when entering a portal.
// Kept simple: fade out, run a callback (swap world/camera), fade back in.

export function createPortalTransition(uiRoot) {
  const overlay = document.createElement("div");
  overlay.className = "portal-fade";
  uiRoot.appendChild(overlay);

  function playTransition(onMidpoint) {
    return new Promise((resolve) => {
      overlay.classList.add("fade-out");
      setTimeout(() => {
        if (onMidpoint) onMidpoint();
        overlay.classList.remove("fade-out");
        overlay.classList.add("fade-in");
        setTimeout(() => {
          overlay.classList.remove("fade-in");
          resolve();
        }, 500);
      }, 500);
    });
  }

  return { playTransition };
}
