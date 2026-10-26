import { useMemo, useState } from "react";
import foodsRaw from "../data/foods.json";
import "./style.css";
import {foodRole as role, meetsChallenge} from "./game/nutritionRules";

type Food = { food_code: string; food_name: string; image: string; category: string; energy_kcal: number; carbohydrate_g: number; protein_g: number; fat_g: number; sugar_g: number; sodium_mg: number; };
type Nutrient = "energy_kcal" | "carbohydrate_g" | "protein_g" | "fat_g" | "sugar_g" | "sodium_mg";
type Stage = 1 | 2 | 3;
const foods = foodsRaw as Food[];
const metrics: Record<Nutrient, string> = { energy_kcal:"열량(kcal)", carbohydrate_g:"탄수화물(g)", protein_g:"단백질(g)", fat_g:"지방(g)", sugar_g:"당류(g)", sodium_mg:"나트륨(mg)" };
const challenges: {stage: Stage; label: string; key: Nutrient; op: "max" | "min" | "gte" | "lte"; target?: number}[] = [
 {stage:1,label:"단백질이 가장 많은 음식을 고르세요",key:"protein_g",op:"max"},
 {stage:1,label:"나트륨이 가장 적은 음식을 고르세요",key:"sodium_mg",op:"min"},
 {stage:2,label:"단백질 18g 이상의 한 끼를 만드세요",key:"protein_g",op:"gte",target:18},
 {stage:2,label:"나트륨 1500mg 이하의 한 끼를 만드세요",key:"sodium_mg",op:"lte",target:1500},
 {stage:3,label:"총열량 800kcal 이하, 단백질 18g 이상을 만족하세요",key:"energy_kcal",op:"lte",target:800},
];
function chooseCards(stage: Stage, round: number): Food[] {
 if (stage === 1) return foods.slice(((round - 1) * 3) % Math.max(1, foods.length - 2), ((round - 1) * 3) % Math.max(1, foods.length - 2) + 3);
 return foods;
}
export function App() {
 const [players, setPlayers] = useState(1);
 const [names, setNames] = useState<string[]>(["PLAYER 1","PLAYER 2","PLAYER 3","PLAYER 4"]);
 const [started, setStarted] = useState(false);
 const [turn, setTurn] = useState(0);
 const [round, setRound] = useState(0);
 const [selected, setSelected] = useState<string[]>([]);
 const [scores, setScores] = useState<number[]>([0,0,0,0]);
 const [result, setResult] = useState<string | null>(null);
 const [showValues, setShowValues] = useState(true);
 const challenge = challenges[round % challenges.length];
 const candidates = useMemo(() => chooseCards(challenge.stage, round + 1), [round, challenge.stage]);
 const chosen = candidates.filter(f => selected.includes(f.food_code));
 const currentScore = scores[turn] || 0;
 const completed = round >= challenges.length;
 function toggle(food: Food) {
  if (result) return;
  if (selected.includes(food.food_code)) return setSelected(selected.filter(x => x !== food.food_code));
  if (challenge.stage === 1) return setSelected([food.food_code]);
  const r = role(food);
  if (chosen.some(f => role(f) === r)) return setSelected([...selected.filter(x => role(candidates.find(f => f.food_code === x)!) !== r), food.food_code]);
  if (selected.length < 3) setSelected([...selected, food.food_code]);
 }
 function submit() {
  if (result || (challenge.stage === 1 ? chosen.length !== 1 : chosen.length !== 3)) return;
  const valid = meetsChallenge(challenge, candidates, chosen);
  setScores(prev => prev.map((s, i) => i === turn ? s + (valid ? (challenge.stage === 3 ? 3 : challenge.stage === 2 ? 2 : 1) : 0) : s));
  setResult(valid ? "성공! 점수를 획득했어요." : "아쉬워요. 영양성분을 확인하고 다음 문제에 도전하세요.");
  setShowValues(true);
 }
 function next() {
  setResult(null); setSelected([]); setShowValues(true);
  if (turn + 1 < players) setTurn(turn + 1); else {setTurn(0);setRound(round + 1);}
 }
 function reset() {setStarted(false);setRound(0);setTurn(0);setSelected([]);setResult(null);setScores([0,0,0,0]);setShowValues(true);}
 return <main className="app">
   <header><div className="brand"><img src="/wordmark.png" alt="밥상탐험대" /><span>영양 학습 보드게임 · 복구된 플레이 가능한 데모</span></div><button className="ghost" onClick={reset}>처음으로</button></header>
   {!started ? <section className="hero">
     <h1>먹고, 비교하고, 배우는 영양 게임</h1><p>공공 식품 데이터를 사용해 카드의 영양소를 비교하고, 한 끼의 조건을 맞혀 보세요.</p>
     <label>플레이어 수 <select value={players} onChange={e=>setPlayers(Number(e.target.value))}>{[1,2,3,4].map(n=><option key={n} value={n}>{n}명</option>)}</select></label>
     <div className="names">{names.slice(0,players).map((n,i)=><input aria-label={`플레이어 ${i+1} 이름`} key={i} value={n} maxLength={20} onChange={e=>setNames(prev=>prev.map((x,j)=>i===j?e.target.value:x))}/>)}</div>
     <button className="primary" onClick={()=>setStarted(true)}>게임 시작</button>
     <p className="notice">교육용 가상 플레이 모드이며 실제 건강 상담이나 식단 처방이 아닙니다.</p>
   </section> : completed ? <section className="hero"><h1>게임 완료!</h1>{scores.slice(0,players).map((s,i)=><p key={i}>{names[i]}: <b>{s}점</b></p>)}<button className="primary" onClick={reset}>다시 시작</button></section>
   : <><section className="summary"><div><span>LEVEL {challenge.stage} · 문제 {round+1}/{challenges.length}</span><h1>{challenge.label}</h1><p>{names[turn]} 차례 · 현재 {currentScore}점</p></div><div className="scores">{scores.slice(0,players).map((s,i)=><span key={i}>{names[i]} {s}점</span>)}</div></section>
   <section className="controls"><button className="ghost" onClick={()=>setShowValues(x=>!x)}>{showValues?"영양정보 숨기기":"영양정보 보기"}</button><span>{challenge.stage===1?"음식 하나 선택":"밥·국·반찬 각 1개 선택"} · 선택 {selected.length}/{challenge.stage===1?1:3}</span></section>
   <section className="cards">{candidates.map(food=><button key={food.food_code} className={`food-card ${selected.includes(food.food_code)?"active":""}`} onClick={()=>toggle(food)} aria-pressed={selected.includes(food.food_code)}><img src={food.image} alt="" loading="lazy" onError={e=>{e.currentTarget.style.display="none"}}/><span className="role">{role(food)}</span><strong>{food.food_name}</strong>{showValues && <div className="facts">{Object.entries(metrics).map(([key,label])=><span key={key}>{label}: {food[key as Nutrient]}</span>)}</div>}</button>)}</section>
   <section className="action">{result?<><strong>{result}</strong><button className="primary" onClick={next}>다음</button></>:<button className="primary" disabled={challenge.stage===1?selected.length!==1:selected.length!==3 || new Set(chosen.map(role)).size!==3} onClick={submit}>정답 확인</button>}</section>
   </>}
   <footer>밥상탐험대 · 교육용 포트폴리오 복구 버전</footer>
 </main>;
}
