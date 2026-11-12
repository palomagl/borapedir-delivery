# Compatibilidade do deploy BRUTO

Não edite o projeto aqui. A fonte principal está em [`../bruto-hamburgueria`](../bruto-hamburgueria).

A Vercel existente ainda usa Root Directory `bruto`. `prepare.cjs` copia a fonte principal durante a instalação/build; as cópias geradas ficam fora do Git. Isso permite renomear a pasta do projeto sem interromper o deploy. Em uma configuração nova, use `bruto-hamburgueria` diretamente. As dependências deste manifesto devem acompanhar o package.json principal.
