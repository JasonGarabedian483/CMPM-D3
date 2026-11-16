export type Recipe = {
  name: string;
  inputs: Record<string, number>;
  output: { item: string; count: number };
};

/* recipe creation */
/* Can change these to more fantasy like recipes later */
export const recipes: Recipe[] = [
  {
    name: "Crafting kit",
    inputs: { rock: 2, "wood log": 2 },
    output: { item: "crafting kit", count: 1 },
  },
  {
    name: "Wood planks",
    inputs: { "wood log": 2 },
    output: { item: "wood plank", count: 4 },
  },
];
