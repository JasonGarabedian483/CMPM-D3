import { assertEquals } from "@std/assert";
import {
  apply,
  GameState,
  hasItemSpawn,
  isPassable,
  newGame,
  recipes,
  terrainAt,
} from "./mod.ts";

const SEED = 121;

function besideRock(): GameState {
  const state = newGame(SEED);
  for (let x = 2; x < 10_000; x++) {
    const here = isPassable(terrainAt(SEED, x, 0), state.inventory);
    const east = terrainAt(SEED, x + 1, 0);
    if (here && east === "rock") {
      state.player = { x, y: 0 };
      return state;
    }
  }
  throw new Error("Found no suitable cell on this row.");
}
function besideRockWithItem(): GameState {
  const state = newGame(SEED);
  for (let x = 2; x < 10_000; x++) {
    const here = isPassable(terrainAt(SEED, x, 0), state.inventory);
    const east = terrainAt(SEED, x + 1, 0);
    if (here && east === "rock" && hasItemSpawn(SEED, x + 1, 0)) {
      state.player = { x, y: 0 };
      return state;
    }
  }
  throw new Error("Found no suitable cell on this row.");
}

Deno.test("crafting ladder gives the recipe output", () => {
  const state = newGame(121);
  const recipe = recipes[0];
  state.inventory = { ...recipe.inputs };

  apply(state, { type: "craft", recipe: 0 });
});

Deno.test("Moving to rock fails without ladder", () => {
  const state = besideRock();
  state.inventory = { ladder: 0 };
  const events = apply(state, { type: "move", direction: "east" });
  assertEquals(events.length, 1);
  assertEquals(events[0].type, "blocked");
});
Deno.test("Moving to rock succeeds with ladder", () => {
  const state = besideRock();
  state.inventory = { ladder: 1 };
  const events = apply(state, { type: "move", direction: "east" });
  assertEquals(events.length, 1);
  assertEquals(events[0].type, "moved");
});
Deno.test("gathering on rock", () => {
  const state = besideRockWithItem();
  state.inventory = { ladder: 1 };
  apply(state, { type: "move", direction: "east" });
  const events = apply(state, { type: "gather" });
  assertEquals(events.length, 1);
  assertEquals(events[0].type, "gathered");
});
