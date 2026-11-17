// The rules of the game. There is no clock here: a command updates the state at
// once, and the events it returns are a record of what happened. Whoever called
// apply() decides how, or whether, to show them over time.

import {
  hasItemSpawn,
  isPassable,
  type Terrain,
  terrainAt,
  terrainYield,
} from "./terrain.ts";
import { CAPSTONE, type Recipe, recipes } from "./recipes.ts";

export type Cell = { x: number; y: number };

export type Direction = "north" | "south" | "east" | "west";

// Plain data that survives JSON. Terrain is absent because the seed can recompute
// it: besides the seed, only what the player has caused belongs here.
export type GameState = {
  seed: number;
  player: Cell;
  inventory: Record<string, number>;
  collectedCells: Record<string, boolean>;
  hasWon: boolean;
};

// Command: https://gameprogrammingpatterns.com/command.html
export type Command =
  | { type: "move"; direction: Direction }
  | { type: "gather" }
  | { type: "craft"; recipe: number };

// Domain Event: https://martinfowler.com/eaaDev/DomainEvent.html
export type GameEvent =
  | { type: "moved"; from: Cell; to: Cell }
  | { type: "blocked"; at: Cell; toward: Cell; terrain: Terrain }
  | { type: "gathered"; at: Cell; item: string }
  | { type: "gatherFailed"; at: Cell }
  | { type: "crafted"; recipe: string; inventory: Record<string, number> }
  | { type: "craftFailed"; recipe: number; missing: Record<string, number> }
  | { type: "gameEnded" };

const STEPS: Record<Direction, Cell> = {
  north: { x: 0, y: -1 },
  south: { x: 0, y: 1 },
  east: { x: 1, y: 0 },
  west: { x: -1, y: 0 },
};

// Singleton, avoided on purpose: tests make as many games as they need. https://gameprogrammingpatterns.com/singleton.html
export function newGame(seed: number): GameState {
  return {
    seed,
    player: { x: 0, y: 0 },
    inventory: {},
    collectedCells: {},
    hasWon: false,
  };
}

export function missingIngredients(
  state: GameState,
  recipe: Recipe,
): Record<string, number> {
  const missing: Record<string, number> = {};

  for (const [item, needed] of Object.entries(recipe.inputs)) {
    const shortfall = needed - (state.inventory[item] ?? 0);
    if (shortfall > 0) missing[item] = shortfall;
  }

  return missing;
}

// The single way in. It updates the state it is given and returns the events.
export function apply(state: GameState, command: Command): GameEvent[] {
  if (state.hasWon) return [];
  switch (command.type) {
    case "move":
      return move(state, command.direction);

    case "gather":
      return gather(state);

    case "craft":
      return craft(state, command.recipe);
  }
}

function craft(state: GameState, recipeIndex: number): GameEvent[] {
  const recipe = recipes[recipeIndex];
  if (!recipe) {
    return [{ type: "craftFailed", recipe: recipeIndex, missing: {} }];
  }

  const missing = missingIngredients(state, recipe);
  if (Object.keys(missing).length > 0) {
    return [{ type: "craftFailed", recipe: recipeIndex, missing }];
  }

  for (const [item, amount] of Object.entries(recipe.inputs)) {
    state.inventory[item] -= amount;
  }
  const { item, count } = recipe.output;
  state.inventory[item] = (state.inventory[item] ?? 0) + count;

  if (recipe.name == CAPSTONE) {
    state.hasWon = true;
  }

  return state.hasWon
    ? [{
      type: "crafted",
      recipe: recipe.name,
      inventory: { ...state.inventory },
    }, { type: "gameEnded" }]
    : [{
      type: "crafted",
      recipe: recipe.name,
      inventory: { ...state.inventory },
    }];
}

// Item gathering function
function gather(state: GameState): GameEvent[] {
  const { x, y } = state.player;
  const key = `${x}, ${y}`;
  const { item } = cellAt(state, state.player);

  if (item === null || state.collectedCells[key]) {
    return [{ type: "gatherFailed", at: { x, y } }];
  }

  state.inventory[item] = (state.inventory[item] ?? 0) + 1;
  state.collectedCells[key] = true;
  return [{ type: "gathered", at: { x, y }, item }];
}

// Checks what items are available at cells
function cellAt(state: GameState, cell: Cell) {
  const terrain = terrainAt(state.seed, cell.x, cell.y);
  const key = `${cell.x}, ${cell.y}`;
  const item =
    state.collectedCells[key] || !hasItemSpawn(state.seed, cell.x, cell.y)
      ? null
      : terrainYield[terrain];
  return { terrain, item };
}

function move(state: GameState, direction: Direction): GameEvent[] {
  const step = STEPS[direction];
  // Events are retained and played back later, while state keeps changing. So an
  // event gets cells of its own, never an object that state still holds.
  // Aliasing Bug: https://martinfowler.com/bliki/AliasingBug.html
  // Cells in events act as a Value Object: https://martinfowler.com/bliki/ValueObject.html
  const from = { ...state.player };
  const to = { x: from.x + step.x, y: from.y + step.y };
  const terrain = terrainAt(state.seed, to.x, to.y);
  if (!isPassable(terrain, state.inventory)) {
    return [{ type: "blocked", at: from, toward: to, terrain }];
  }
  state.player.x = to.x;
  state.player.y = to.y;
  return [{ type: "moved", from, to }];
}
