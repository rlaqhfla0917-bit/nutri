import type {Challenge} from "./nutritionRules";

// Published demo missions. Keep these data-only for deterministic rule tests.
export const challenges: Challenge[] = [
 {stage:1,label:"단백질이 가장 많은 음식을 고르세요",key:"protein_g",op:"max"},
 {stage:1,label:"나트륨이 가장 적은 음식을 고르세요",key:"sodium_mg",op:"min"},
 {stage:1,label:"열량이 가장 높은 음식을 고르세요",key:"energy_kcal",op:"max"},
 {stage:2,label:"단백질 18g 이상의 한 끼를 만드세요",key:"protein_g",op:"gte",target:18},
 {stage:2,label:"나트륨 1500mg 이하의 한 끼를 만드세요",key:"sodium_mg",op:"lte",target:1500},
 {stage:2,label:"당류 25g 이하의 한 끼를 만드세요",key:"sugar_g",op:"lte",target:25},
 {stage:3,label:"총열량 800kcal 이하, 단백질 18g 이상을 만족하세요",key:"energy_kcal",op:"lte",target:800},
 {stage:3,label:"나트륨 1200mg 이하, 단백질 18g 이상을 만족하세요",key:"sodium_mg",op:"lte",target:1200},
];
