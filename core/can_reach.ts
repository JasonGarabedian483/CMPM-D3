import { Recipe } from "./recipes.ts";
import { Terrain, terrainKeys, terrainYield } from "./terrain.ts";

export function canReach(recipes: Recipe[]): Set<string> {
  const reachableItems = new Set<string>();
  const craftable = new Set<string>();

  // Unlock terrain items whose key is null or already reachable.
  const unlockTerrain = (): boolean => {
    let changed = false;
    for (
      const [terrain, item] of Object.entries(terrainYield) as [
        Terrain,
        string | null,
      ][]
    ) {
      if (item === null || reachableItems.has(item)) continue;
      const key = terrainKeys[terrain];
      if (key === null || reachableItems.has(key)) {
        reachableItems.add(item);
        changed = true;
      }
    }
    return changed;
  };

  let changed = true;
  while (changed) {
    changed = unlockTerrain();
    for (const recipe of recipes) {
      if (craftable.has(recipe.name)) continue;
      const canMake = Object.keys(recipe.inputs).every((i) =>
        reachableItems.has(i)
      );
      if (canMake) {
        craftable.add(recipe.name);
        reachableItems.add(recipe.output.item);
        changed = true;
      }
    }
  }

  return new Set(
    recipes.filter((r) => !craftable.has(r.name)).map((r) => r.name),
  );
}
