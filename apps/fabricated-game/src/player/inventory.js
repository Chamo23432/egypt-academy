// Hotbar (2 slots) + backpack storage grid logic.

const BACKPACK_ROWS = 4;
const BACKPACK_COLS = 6;
const BACKPACK_SLOTS = BACKPACK_ROWS * BACKPACK_COLS;

export function createInventory() {
  // Hotbar: index 0 = main hand, index 1 = off hand.
  const hotbar = [null, null];

  // Backpack storage — flat array of slots, each either null or an item object.
  const backpack = new Array(BACKPACK_SLOTS).fill(null);

  let hasBackpack = false;

  function pickUpBackpack() {
    hasBackpack = true;
  }

  function setHotbarItem(slotIndex, item) {
    if (slotIndex !== 0 && slotIndex !== 1) return;
    hotbar[slotIndex] = item;
  }

  function getHotbarItem(slotIndex) {
    return hotbar[slotIndex] ?? null;
  }

  function dropHotbarItem(slotIndex) {
    const item = hotbar[slotIndex] ?? null;
    hotbar[slotIndex] = null;
    return item;
  }

  function setBackpackSlot(slotIndex, item) {
    if (slotIndex < 0 || slotIndex >= BACKPACK_SLOTS) return;
    backpack[slotIndex] = item;
  }

  function getBackpackSlot(slotIndex) {
    return backpack[slotIndex] ?? null;
  }

  function findFirstEmptyBackpackSlot() {
    return backpack.findIndex((slot) => slot === null);
  }

  function addItemToBackpack(item) {
    const emptyIndex = findFirstEmptyBackpackSlot();
    if (emptyIndex === -1) return false; // backpack full
    backpack[emptyIndex] = item;
    return true;
  }

  return {
    hasBackpack: () => hasBackpack,
    pickUpBackpack,
    getHotbarItem,
    setHotbarItem,
    dropHotbarItem,
    getBackpackSlot,
    setBackpackSlot,
    addItemToBackpack,
    getBackpackSlotCount: () => BACKPACK_SLOTS,
    getBackpackRows: () => BACKPACK_ROWS,
    getBackpackCols: () => BACKPACK_COLS,
  };
}
