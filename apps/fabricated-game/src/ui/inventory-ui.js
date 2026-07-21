// Inventory grid UI shown after the backpack-open sequence.

export function createInventoryUI(uiRoot, inventory, { onClose } = {}) {
  const overlay = document.createElement("div");
  overlay.className = "inventory-overlay";
  overlay.style.display = "none";

  const panel = document.createElement("div");
  panel.className = "inventory-panel";

  const title = document.createElement("div");
  title.className = "inventory-title";
  title.textContent = "Backpack";
  panel.appendChild(title);

  const grid = document.createElement("div");
  grid.className = "inventory-grid";
  grid.style.gridTemplateColumns = `repeat(${inventory.getBackpackCols()}, 1fr)`;

  const slotEls = [];
  for (let i = 0; i < inventory.getBackpackSlotCount(); i++) {
    const slot = document.createElement("div");
    slot.className = "inventory-slot";
    grid.appendChild(slot);
    slotEls.push(slot);
  }
  panel.appendChild(grid);

  const hint = document.createElement("div");
  hint.className = "inventory-hint";
  hint.textContent = "Press E to close";
  panel.appendChild(hint);

  overlay.appendChild(panel);
  uiRoot.appendChild(overlay);

  function render() {
    slotEls.forEach((slotEl, i) => {
      const item = inventory.getBackpackSlot(i);
      slotEl.classList.toggle("filled", !!item);
      slotEl.textContent = item ? (item.name?.[0] ?? "?") : "";
    });
  }

  return {
    show: () => { render(); overlay.style.display = "flex"; },
    hide: () => {
      overlay.style.display = "none";
      if (onClose) onClose();
    },
    isVisible: () => overlay.style.display !== "none",
    render,
  };
}
