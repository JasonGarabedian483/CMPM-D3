import { assertEquals } from "@std/assert";
import { apply, type Command, type GameEvent, newGame } from "./rules.ts";
import { CAPSTONE, recipes } from "./recipes.ts";

// Found by what it makes, not by a hard-coded position in the list.
const capstoneIndex = recipes.findIndex((r) => r.name === CAPSTONE);
const capstone = recipes[capstoneIndex];

function endedGame() {
  const state = newGame(1);
  for (const [item, amount] of Object.entries(capstone.inputs)) {
    state.inventory[item] = amount;
  }
  const events = apply(state, { type: "craft", recipe: capstoneIndex });
  return { state, events };
}

Deno.test("capstone recipe exists", () => {
  assertEquals(capstoneIndex >= 0, true);
});

Deno.test("crafting the capstone ends the game", () => {
  const { state, events } = endedGame();

  const expected: GameEvent[] = [
    {
      type: "crafted",
      recipe: capstone.name,
      inventory: { ...state.inventory },
    },
    { type: "gameEnded" },
  ];
  assertEquals(events, expected);
  assertEquals(state.hasWon, true);
});

Deno.test("after the ending, apply changes nothing", () => {
  const { state } = endedGame();
  const before = JSON.parse(JSON.stringify(state));

  const commands: Command[] = [
    { type: "move", direction: "east" },
    { type: "gather" },
    { type: "craft", recipe: capstoneIndex },
  ];

  for (const command of commands) {
    assertEquals(apply(state, command), [], `${command.type} returned events`);
    assertEquals(state, before, `${command.type} changed the state`);
  }
});
