import {
  type Command,
  type GameState,
  missingIngredients,
  recipes,
} from "../core/mod.ts";

export class RecipeBook {
  private readonly buttons: HTMLButtonElement[] = [];

  constructor(
    list: HTMLElement,
    private readonly state: GameState,
    send: (command: Command) => void,
  ) {
    recipes.forEach((_recipe, index) => {
      const row = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";

      button.addEventListener("click", (event) => {
        send({ type: "craft", recipe: index });
        if (event.detail > 0) button.blur();
      });

      row.appendChild(button);
      list.appendChild(row);
      this.buttons.push(button);
    });
  }

  update() {
    recipes.forEach((recipe, index) => {
      const missing = missingIngredients(this.state, recipe);
      const details = Object.entries(missing)
        .map(([item, count]) => `${count} ${item}`)
        .join(", ");

      this.buttons[index].textContent = details
        ? `${recipe.name} — missing ${details}`
        : `${recipe.name} — ready`;
    });
  }
}
