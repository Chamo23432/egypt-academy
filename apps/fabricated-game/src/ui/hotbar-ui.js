// 2-slot hotbar UI (main hand, off hand).

export function createHotbarUI(uiRoot, inventory) {
  const bar = document.createElement("div");
  bar.className = "hotbar";

  const slots = [0, 1].map((i) => {
    const slot = document.createElement("div");
    slot.className = "hotbar-slot";
    slot.dataset.slot = i;
    const label = document.createElement("span");
    label.className = "hotbar-slot-label";
    label.textContent = i === 0 ? "Main" : "Off";
    slot.appendChild(label);
    bar.appendChild(slot);
    return slot;
  });

  uiRoot.appendChild(bar);

  function render() {
    slots.forEach((slotEl, i) => {
      const item = inventory.getHotbarItem(i);
      slotEl.classList.toggle("filled", !!item);
      const existingIcon = slotEl.querySelector(".hotbar-slot-icon");
      if (existingIcon) existingIcon.remove();
      if (item) {
        const icon = document.createElement("div");
        icon.className = "hotbar-slot-icon";
        icon.textContent = item.name?.[0] ?? "?";
        slotEl.appendChild(icon);
      }
    });
  }

  render();
  return { render };
}
