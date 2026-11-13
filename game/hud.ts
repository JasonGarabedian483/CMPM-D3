import { type GameEvent, type GameState, terrainAt } from "../core/mod.ts";

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
      return `failed to gather. already gathered at this cell.`;
  }
}

// The readout, as ordinary page elements that CSS can style and that assistive
// tools can read. It changes only as events play.
export class Hud {
  private readonly seed: number;
  private collectedCells = new Set<string>();

  constructor(state: GameState) {
    this.seed = state.seed;
    this.showPosition(state.player.x, state.player.y);
  }

  show(event: GameEvent) {
    element("live").textContent = describe(event);
    if (event.type === "moved") this.showPosition(event.to.x, event.to.y);
    if (event.type === "gathered") {
      this.collectedCells.add(`${event.at.x}, ${event.at.y}`);
      this.showPosition(event.at.x, event.at.y);
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
