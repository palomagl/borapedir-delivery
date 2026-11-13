export interface PhotoSpec { src: string; columns: number; rows: number; index: number }
const atlas=(name:string, columns:number, rows:number,index:number):PhotoSpec=>({src:`/acai/ingredients/${name}.png`,columns,rows,index});
const photos:Record<string,PhotoSpec>={};
["Banana","Morango","Manga","Uva","Kiwi","Abacaxi","Mamão","Melancia","Maçã","Laranja","Pera","Melão"].forEach((name,i)=>photos[name]=atlas("fruits",4,3,i));
["Granola tradicional","Granola sem açúcar","Aveia","Coco ralado","Paçoca","Amendoim","Chocoball","Flocos de arroz","Confete","Biscoito triturado","Gotas de chocolate","Leite em pó"].forEach((name,i)=>photos[name]=atlas("crunch",4,3,i));
["Creme de avelã","Creme de pistache","Creme de leite em pó","Doce de leite","Creme de amendoim","Brigadeiro","Creme de coco","Creme de chocolate branco","Creme de morango"].forEach((name,i)=>photos[name]=atlas("creams",3,3,i));
["Açaí tradicional","Cupuaçu","Meio açaí, meio cupuaçu","Leite condensado","Calda de chocolate","Calda de morango","Mel","Brownie em pedaços","Chocolate branco","Whey de baunilha","Frutas sortidas"].forEach((name,i)=>photos[name]=atlas("bases",4,3,i));
["Oreo","M&M's","Bis","Chocoball","Ovomaltine","Paçoca","Trento","Leite em pó","Leite condensado"].forEach((name,i)=>photos[name]=atlas("toppings-real",3,3,i));
["Brigadeiro de colher","Chocolate branco","Chocolate branco com avelã","Creme de avelã","Creme de morango","Creme de Ninho","Creme de Oreo","Creme de paçoca","Nutella"].forEach((name,i)=>photos[name]=atlas("creams-real",3,3,i));
const aliases:Record<string,string>={"Granola":"Granola tradicional","Com suco de laranja":"Laranja","Só o caldo das frutas":"Frutas sortidas","Açaí sem adição de xarope":"Açaí tradicional","Morango extra":"Morango","Banana extra":"Banana","Granola extra":"Granola tradicional","Paçoca extra":"Paçoca"};
export function ingredientPhoto(name:string):PhotoSpec|null{return photos[aliases[name]??name]??null;}
export function productImage(slug:string):string|null{
 if(slug.startsWith("salada-frutas-"))return "/acai/salada.png";
 const images:Record<string,string>={"copo-300":"berry.png","copo-500":"berry.png","copo-700":"berry.png","copo-1000":"litro.png","dupla-300":"combo.png","dupla-500":"combo.png","trio-300":"trio.png","trio-500":"trio.png","copo-felicidade":"felicidade.png","barca-1500":"barca.png","bowl-700":"bowl.png","box-familia":"box.png","salada-frutas":"salada.png",agua:"drinks.png#2x2:0",refrigerante:"drinks.png#2x2:1",suco:"drinks.png#2x2:2","agua-coco":"drinks.png#2x2:3"};
 return images[slug]?`/acai/${images[slug]}`:null;
}
export function parsePhoto(src:string):PhotoSpec{const [file,fragment]=src.split("#");const m=fragment?.match(/^(\d+)x(\d+):(\d+)$/);return m?{src:file,columns:Number(m[1]),rows:Number(m[2]),index:Number(m[3])}:{src:file,columns:1,rows:1,index:0};}
