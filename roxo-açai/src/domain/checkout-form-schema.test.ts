import { describe,expect,it } from "vitest";
import { checkoutFormSchema } from "./checkout-form-schema";
import { checkoutSchema } from "./schemas";
const contact={customerName:"Cliente Teste",customerPhone:"51999998888",paymentMethod:"pix"};
describe("checkout ROXO",()=>{
 it("permite retirada com os campos de endereço vazios",()=>{expect(checkoutFormSchema.safeParse({...contact,serviceMode:"pickup",address:{street:"",number:"",district:"",city:"",state:"",zipCode:""}}).success).toBe(true)});
 it("exige endereço válido para entrega",()=>{expect(checkoutFormSchema.safeParse({...contact,serviceMode:"delivery",address:{street:"",number:"",district:"",city:"",state:""}}).success).toBe(false)});
 it("aceita entrega com endereço completo e CEP opcional",()=>{expect(checkoutFormSchema.safeParse({...contact,serviceMode:"delivery",address:{street:"Rua Teste",number:"10",district:"Centro",city:"Porto Alegre",state:"RS",zipCode:""}}).success).toBe(true)});
 it("aceita o tamanho de seleção de um trio completo sem confiar no preço do navegador",()=>{expect(checkoutSchema.safeParse({...contact,serviceMode:"pickup",address:null,items:[{productId:"prd_trio-500",quantity:1,optionIds:Array.from({length:34},(_,i)=>`option_${i}`)}]}).success).toBe(true)});
});
