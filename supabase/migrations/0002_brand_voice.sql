-- ============================================================================
-- Voz da marca no catálogo
--
-- O modelo ganhou dois campos depois da migration inicial, e o banco ficou
-- para trás. São os textos que dão personalidade à loja:
--   stores.headline    → a frase de campanha do topo ("Carne. Chapa. Fogo.")
--   categories.subtitle → a linha que explica a seção ("Hambúrgueres feitos
--                         com carne de verdade")
-- ============================================================================

alter table stores add column headline text;

comment on column stores.headline is
  'Frase de campanha exibida no topo da loja. Distinta de tagline, que é a linha de apoio do logotipo.';

alter table categories add column subtitle text;

comment on column categories.subtitle is
  'Uma linha sobre o que há na categoria. Opcional.';
