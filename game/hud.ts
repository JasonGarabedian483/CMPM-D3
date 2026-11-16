import { type GameEvent, type GameState, terrainAt } from "../core/mod.ts";

/* Emojis to add to item names */
const ITEM_EMOJI: Record<string, string> = {
  rock: "🪨",
  "wood log": "🪵",
  "wood plank": "🟫",
  "crafting kit": "🛠️",
};

function element(id: string): HTMLElement {
  return document.getElementById(id)!;
}

function describe(event: GameEvent): string {
  switch (event.type) {
    case "moved":
      return `moved to ${event.to.x}, ${event.to.y}`;
    case "blocked":
      return `blocked by ${event.terrain} at ${event.toward.x}, ${event.toward.y}`;
    case "gathered":
      return `gathered ${event.item}`;
    case "gatherFailed":
      return `nothing to gather here.`;
    case "crafted":
      return `crafted ${event.recipe}`;
    case "craftFailed":
      return `cannot craft: ${
        Object.entries(event.missing)
          .map(([item, count]) => `${item}: ${count}`)
          .join(", ") || "unknown recipe"
      }`;
  }
}

// The readout, as ordinary page elements that CSS can style and that assistive
// tools can read. It changes only as events play.
export class Hud {
  private readonly seed: number;
  private collectedCells = new Set<string>();
  private inventory: Record<string, number>;

  constructor(state: GameState) {
    this.seed = state.seed;
    this.inventory = { ...state.inventory };
    this.showPosition(state.player.x, state.player.y);
    this.showInventory();
  }

  show(event: GameEvent) {
    element("live").textContent = describe(event);
    if (event.type === "moved") this.showPosition(event.to.x, event.to.y);
    if (event.type === "gathered") {
      this.inventory[event.item] = (this.inventory[event.item] ?? 0) + 1;
      this.collectedCells.add(`${event.at.x}, ${event.at.y}`);
      this.showPosition(event.at.x, event.at.y);
      this.showInventory();
    }
    if (event.type === "crafted") {
      this.inventory = { ...event.inventory };
      this.showInventory();
    }
  }

  private showInventory() {
    const list = element("inventory");
    list.replaceChildren();

    for (const [item, count] of Object.entries(this.inventory)) {
      const entry = document.createElement("li");
      entry.textContent = `${ITEM_EMOJI[item] ?? ""} ${item}: ${count}`.trim();
      list.appendChild(entry);
    }
  }

  private showPosition(x: number, y: number) {
    element("position").textContent = `${x}, ${y}`;

    const terrain = terrainAt(this.seed, x, y);
    const key = `${x}, ${y}`;
    if (this.collectedCells.has(key)) {
      element("terrain").textContent = `${terrain} (collected)`;
    } else {
      element("terrain").textContent = terrain;
    }
  }
}
