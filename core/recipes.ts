export type Recipe = {
  name: string;
  inputs: Record<string, number>;
  output: { item: string; count: number };
};

/* recipe creation */
/* Can change these to more fantasy like recipes later */
export const recipes: Recipe[] = [
  {
    name: "Ladder",
    inputs: { "rope": 2, "wood log": 2 },
    output: { item: "ladder", count: 1 },
  },
  {
    name: "Rope",
    inputs: { "grass": 2 },
    output: { item: "rope", count: 1 },
  },
];
