import { z } from "zod";

/** Validação compartilhada entre formulário e servidor. Uma regra, um lugar. */

export const phoneSchema = z
  .string()
  .transform((value) => value.replace(/\D/g, ""))
  .refine((digits) => digits.length === 10 || digits.length === 11, {
    message: "Informe um telefone com DDD",
  });

export const addressSchema = z.object({
  label: z.string().trim().max(40).nullish(),
  street: z.string().trim().min(3, "Informe a rua").max(120),
  number: z.string().trim().min(1, "Informe o número").max(12),
  complement: z.string().trim().max(60).nullish(),
  district: z.string().trim().min(2, "Informe o bairro").max(80),
  city: z.string().trim().min(2, "Informe a cidade").max(80),
  state: z.string().trim().length(2, "UF com 2 letras").toUpperCase(),
  zipCode: z
    .string()
    .trim()
    .transform((value) => value.replace(/\D/g, ""))
    .refine((digits) => digits === "" || digits.length === 8, { message: "CEP inválido" })
    .nullish(),
  reference: z.string().trim().max(120).nullish(),
});

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  /** Só os ids: nome e preço vêm do catálogo no servidor. */
  optionIds: z.array(z.string().min(1)).max(20),
  quantity: z.number().int().min(1).max(99),
  note: z.string().trim().max(180).nullish(),
});

export const checkoutSchema = z
  .object({
    serviceMode: z.enum(["delivery", "pickup"]),
    customerName: z.string().trim().min(2, "Informe seu nome").max(80),
    customerPhone: phoneSchema,
    address: addressSchema.nullish(),
    paymentMethod: z.enum(["pix", "credit", "debit", "cash", "meal_voucher"]),
    /** Em reais, como o cliente digita. Convertido para centavos na ação. */
    changeFor: z.string().trim().max(12).nullish(),
    note: z.string().trim().max(240).nullish(),
    items: z.array(cartItemSchema).min(1, "Sua sacola está vazia"),
  })
  .refine((data) => data.serviceMode !== "delivery" || data.address != null, {
    message: "Informe o endereço de entrega",
    path: ["address"],
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
