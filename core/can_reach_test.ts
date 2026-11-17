import { assertEquals } from "@std/assert";
import { canReach } from "./can_reach.ts";
import { recipes } from "./recipes.ts";

Deno.test("current recipe list works", () => {
  assertEquals(canReach(recipes), new Set());
});
Deno.test("current recipe list works", () => {
  const crappyrecipe = new Set(recipes);
  crappyrecipe.delete([...crappyrecipe][2]);
  assertEquals(canReach(Array.from(crappyrecipe)), new Set(["Fish Sandwich"]));
});
