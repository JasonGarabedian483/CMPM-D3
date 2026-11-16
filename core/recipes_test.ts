import { assertEquals } from "@std/assert";
import {
  apply,
  missingIngredients,
  newGame,
  recipes,
  terrainYield,
} from "./mod.ts";

Deno.test("checks what a recipe is missing", () => {
  const state = newGame(121);
  const recipe = recipes[0];

  assertEquals(missingIngredients(state, recipe), recipe.inputs);

  state.inventory = { ...recipe.inputs };
  assertEquals(missingIngredients(state, recipe), {});
});

Deno.test("crafting makes the recipe output", () => {
  const state = newGame(121);
  const recipe = recipes[0];
  state.inventory = { ...recipe.inputs };

  apply(state, { type: "craft", recipe: 0 });

  assertEquals(state.inventory.rope, 0);
  assertEquals(state.inventory["wood log"], 0);
  assertEquals(state.inventory[recipe.output.item], recipe.output.count);
});

Deno.test("failed crafting changes nothing", () => {
  const state = newGame(121);
  const before = JSON.parse(JSON.stringify(state));

  const events = apply(state, { type: "craft", recipe: 0 });

  assertEquals(state, before);
  assertEquals(events, [{
    type: "craftFailed",
    recipe: 0,
    missing: recipes[0].inputs,
  }]);
});

Deno.test("crafting rope gives the recipe output", () => {
  const state = newGame(121);
  const recipe = recipes[1];
  state.inventory = { ...recipe.inputs };

  apply(state, { type: "craft", recipe: 1 });

  assertEquals(state.inventory[recipe.output.item], recipe.output.count);
});

Deno.test("a craft event keeps its inventory after another craft", () => {
  const state = newGame(121);
  const recipe = recipes[0];

  for (const [item, count] of Object.entries(recipe.inputs)) {
    state.inventory[item] = count * 2;
  }

  const first = apply(state, { type: "craft", recipe: 0 });
  const snapshot = JSON.parse(JSON.stringify(first));

  apply(state, { type: "craft", recipe: 0 });

  assertEquals(first, snapshot);
});

Deno.test("every recipe ingredient has a source", () => {
  const sources = new Set([
    ...Object.values(terrainYield),
    ...recipes.map((recipe) => recipe.output.item),
  ]);

  for (const recipe of recipes) {
    for (const item of Object.keys(recipe.inputs)) {
      assertEquals(sources.has(item), true, `${item} has no source`);
    }
  }
});
