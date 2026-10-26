import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {foodRole, totalNutrient, meetsChallenge} from '../src/game/nutritionRules.ts';
const make = (code, category, protein, sodium, kcal = 150) => ({
  food_code: code, category, protein_g: protein, sodium_mg: sodium, energy_kcal: kcal,
  carbohydrate_g: 20, fat_g: 5, sugar_g: 2,
});
const rice = make('R', '밥류', 5, 150), soup = make('S', '국류', 8, 450), side = make('D', '조림류', 12, 350);
const candidates = [rice,soup,side];
test('meal roles and nutrient sums', () => {
  assert.deepEqual(candidates.map(foodRole), ['밥', '국', '반찬']);
  assert.equal(totalNutrient(candidates, 'protein_g'), 25);
});
test('level 1 selects an actual maximum candidate', () => {
  const mission = {stage:1,label:'protein',key:'protein_g',op:'max'};
  assert.equal(meetsChallenge(mission,candidates,[side]),true);
  assert.equal(meetsChallenge(mission,candidates,[rice]),false);
  assert.equal(meetsChallenge(mission,candidates,[make('X','조림류',999,0)]),false);
});
test('meal challenge requires all three roles', () => {
  const mission = {stage:2,label:'protein',key:'protein_g',op:'gte',target:18};
  assert.equal(meetsChallenge(mission,candidates,candidates),true);
  assert.equal(meetsChallenge(mission,candidates,[rice,soup,soup]),false);
});
test('level 3 checks combined protein and energy', () => {
  const mission = {stage:3,label:'energy',key:'energy_kcal',op:'lte',target:800};
  assert.equal(meetsChallenge(mission,candidates,candidates),true);
  const low=[make('R2','밥류',1,100),make('S2','국류',1,100),make('D2','조림류',1,100)];
  assert.equal(meetsChallenge(mission,low,low),false);
});
test('published food data and image paths are valid', () => {
  const foods = JSON.parse(fs.readFileSync(new URL('../data/foods.json',import.meta.url),'utf8'));
  assert.ok(foods.length>=30);
  assert.equal(new Set(foods.map(food=>food.food_code)).size,foods.length);
  for(const food of foods){
    assert.match(food.image,/^\/foods\/[a-z0-9-]+\.png$/i);
    assert.ok(fs.existsSync(path.join(process.cwd(),'public',food.image.slice(1))),food.image);
    for(const key of ['energy_kcal','protein_g','sodium_mg'])
      assert.ok(Number.isFinite(food[key])&&food[key]>=0,food.food_code+'/'+key);
  }
});
