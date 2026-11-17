export type Recipe = {
  name: string;
  inputs: Record<string, number>;
  output: { item: string; count: number };
};

/* recipe creation */
/* Can change these to more fantasy like recipes later */
export const CAPSTONE = "Fish Sandwich";
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
  {
    name: "Raft",
    inputs: { "stone": 2, "wood log": 2, "rope": 2 },
    output: { item: "raft", count: 1 },
  },
  {
    name: "Fish Sandwich",
    inputs: { "fish": 1, "wood log": 2, "grass": 3, "stone": 2 },
    output: { item: "fish sandwich", count: 1 },
  },
];
