import { assertEquals } from "@std/assert";
import { apply, type Command, type GameEvent, newGame } from "./mod.ts";
import { CAPSTONE } from "./recipes.ts";
import run from "./run.json" with { type: "json" };
const commands = run.commands as Command[];

Deno.test("recorded run ends the game", () => {
  const state = newGame(run.seed);
  const events: GameEvent[] = [];

  for (const command of commands) {
    events.push(...apply(state, command));
  }

  assertEquals(state.hasWon, true);
  assertEquals(events.at(-1), { type: "gameEnded" });

  // The sandwich is what ended it, not something else.
  const beforeEnd = events.at(-2);
  assertEquals(beforeEnd?.type, "crafted");
  assertEquals(
    beforeEnd?.type === "crafted" ? beforeEnd.recipe : null,
    CAPSTONE,
  );
});

Deno.test("recorded run does not end early", () => {
  const state = newGame(run.seed);

  for (const command of commands.slice(0, -1)) {
    apply(state, command);
  }

  assertEquals(state.hasWon, false);
});

Deno.test("recorded run emits gameEnded exactly once", () => {
  const state = newGame(run.seed);
  const events: GameEvent[] = [];

  for (const command of commands) {
    events.push(...apply(state, command));
  }

  assertEquals(events.filter((e) => e.type === "gameEnded").length, 1);
});
