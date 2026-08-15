import { Wedding } from "@/types/wedding";

export const DEFAULT_MEAL_OPTIONS = ["Chicken", "Beef", "Fish", "Vegetarian", "Vegan", "No preference"];

export function mealOptionsFor(wedding: Pick<Wedding, "meal_options">): string[] {
  return wedding.meal_options && wedding.meal_options.length > 0
    ? wedding.meal_options
    : DEFAULT_MEAL_OPTIONS;
}
