// Health bar, damage handling, death screen trigger.

const MAX_HEALTH = 20; // classic Minecraft-style 10 hearts / 20 half-points

export function createHealthSystem({ onDeath, onDamage } = {}) {
  let health = MAX_HEALTH;
  let dead = false;

  function takeDamage(amount) {
    if (dead) return;
    health = Math.max(0, health - amount);
    if (onDamage) onDamage(health, MAX_HEALTH);
    if (health <= 0) {
      dead = true;
      if (onDeath) onDeath();
    }
  }

  function heal(amount) {
    if (dead) return;
    health = Math.min(MAX_HEALTH, health + amount);
    if (onDamage) onDamage(health, MAX_HEALTH);
  }

  function respawn() {
    health = MAX_HEALTH;
    dead = false;
    if (onDamage) onDamage(health, MAX_HEALTH);
  }

  return {
    takeDamage,
    heal,
    respawn,
    getHealth: () => health,
    getMaxHealth: () => MAX_HEALTH,
    isDead: () => dead,
  };
}
