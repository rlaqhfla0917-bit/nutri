/** Pure game rules for the current five-challenge recovery demo. */
export type Nutrient = "energy_kcal" | "carbohydrate_g" | "protein_g" | "fat_g" | "sugar_g" | "sodium_mg";
export type Stage = 1 | 2 | 3;
export type FoodLike = { food_code: string; category: string } & Record<Nutrient, number>;
export type Challenge = {stage: Stage; label: string; key: Nutrient; op: "max" | "min" | "gte" | "lte"; target?: number};
export function foodRole(food: Pick<FoodLike, "category">): "밥" | "국" | "반찬" {
  const c = food.category;
  if (c.includes("밥") || c.includes("면") || c.includes("죽")) return "밥";
  if (c.includes("국") || c.includes("탕") || c.includes("찌개")) return "국";
  return "반찬";
}
export function totalNutrient(items: FoodLike[], key: Nutrient): number {
  return items.reduce((n, food) => n + Number(food[key] || 0), 0);
}
export function meetsChallenge(challenge: Challenge, candidates: FoodLike[], chosen: FoodLike[]): boolean {
  if (challenge.stage === 1) {
    if (chosen.length !== 1 || candidates.length === 0) return false;
    if (!candidates.some(food => food.food_code === chosen[0].food_code)) return false;
    const values = candidates.map(food => food[challenge.key]);
    const expected = challenge.op === "max" ? Math.max(...values) : Math.min(...values);
    return chosen[0][challenge.key] === expected;
  }
  if (chosen.length !== 3 || new Set(chosen.map(foodRole)).size !== 3) return false;
  if (!chosen.every(food => candidates.some(candidate => candidate.food_code === food.food_code))) return false;
  const total = totalNutrient(chosen, challenge.key);
  const primary = challenge.op === "gte" ? total >= (challenge.target ?? 0) :
    challenge.op === "lte" ? total <= (challenge.target ?? 0) : false;
  return primary && (challenge.stage !== 3 || totalNutrient(chosen, "protein_g") >= 18);
}
