import {describe,it,expect} from "vitest";
import {existsSync} from "node:fs";
import {join} from "node:path";
import {seedProducts} from "@/server/data/seed/catalog";
import {ingredientPhoto,parsePhoto} from "@/lib/roxo-media";
describe("regras e fotos ROXO",()=>{
 it("tem foto correspondente para todos os produtos",()=>{for(const p of seedProducts){expect(p.imageUrl,p.slug).toBeTruthy();expect(existsSync(join(process.cwd(),"public",parsePhoto(p.imageUrl!).src)),p.slug).toBe(true);}});
 it("tem foto de cada ingrediente, creme, cobertura e fruta",()=>{for(const p of seedProducts)for(const g of p.optionGroups){if(!/base|creme|extra|inclus|cobertura|frutas|caldo/i.test(g.name))continue;for(const o of g.options){const photo=ingredientPhoto(o.name);expect(photo,`${p.slug}: ${o.name}`).not.toBeNull();expect(existsSync(join(process.cwd(),"public",photo!.src)),o.name).toBe(true);}}});
 it("separa os cremes pagos dos acompanhamentos grátis e outros extras",()=>{for(const p of seedProducts.filter(p=>p.categoryId==="cat_copos")){const g=p.optionGroups;expect(g.find(g=>g.name==="Cremes pagos")?.options.every(o=>o.priceDeltaCents>0)).toBe(true);expect(g.find(g=>g.name==="Extras pagos")?.options.every(o=>o.priceDeltaCents>0)).toBe(true);expect(g.find(g=>g.name==="Acompanhamentos inclusos")?.options.every(o=>o.priceDeltaCents===0)).toBe(true);}});
 it("barca e felicidade têm 1 creme e até 3 adicionais; só a barca leva açaí na base",()=>{for(const slug of ["barca-1500","copo-felicidade"]){const p=seedProducts.find(p=>p.slug===slug)!;expect(p.optionGroups.some(g=>g.name==="Base de açaí")).toBe(slug==="barca-1500");const cream=p.optionGroups.find(g=>g.name==="Seu creme incluso")!;expect([cream.minSelect,cream.maxSelect]).toEqual([1,1]);expect(cream.options.every(o=>o.priceDeltaCents===0)).toBe(true);expect(p.optionGroups.find(g=>g.name==="Adicionais inclusos")?.maxSelect).toBe(3);}});
 it("salada vai no copo em 300, 500, 700 ml e 1 litro com opção de suco",()=>{const salads=seedProducts.filter(p=>p.categoryId==="cat_frutas");expect(salads.map(p=>p.slug)).toEqual(["salada-frutas-300","salada-frutas-500","salada-frutas-700","salada-frutas-1000"]);for(const p of salads){expect(p.optionGroups.find(g=>g.name==="Caldo da salada")?.options.some(o=>o.name==="Com suco de laranja")).toBe(true);expect(p.optionGroups.find(g=>g.name==="Cremes pagos")?.minSelect).toBe(0);}});
});
