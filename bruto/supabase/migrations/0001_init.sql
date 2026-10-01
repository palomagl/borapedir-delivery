-- ============================================================================
-- Bora pedir — esquema inicial
--
-- Princípios:
--   1. Toda tabela de conteúdo carrega store_id. Multi-loja não é um "depois".
--   2. Dinheiro é integer em centavos. Nunca float, nunca numeric implícito.
--   3. Pedido é imutável: guarda nome e preço do momento da compra.
--   4. RLS ligada em tudo. O acesso público é a exceção declarada, não o padrão.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------------- Enums --

create type service_mode  as enum ('delivery', 'pickup');
create type payment_method as enum ('pix', 'credit', 'debit', 'cash', 'meal_voucher');
create type store_role    as enum ('owner', 'manager', 'staff');
create type order_status  as enum (
  'pending', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'canceled'
);

-- ------------------------------------------------------------------- Lojas --

create table stores (
  id                   uuid primary key default gen_random_uuid(),
  slug                 text not null unique,
  name                 text not null,
  tagline              text,
  logo_url             text,
  cover_url            text,
  brand_color          text not null default 'oklch(60.5% 0.192 33)',
  brand_contrast_color text not null default 'oklch(100% 0 0)',
  phone                text,
  address              text,
  service_modes        service_mode[] not null default '{delivery,pickup}',
  delivery_fee_cents   integer not null default 0 check (delivery_fee_cents >= 0),
  min_order_cents      integer not null default 0 check (min_order_cents >= 0),
  delivery_eta_min     integer not null default 30 check (delivery_eta_min >= 0),
  delivery_eta_max     integer not null default 60 check (delivery_eta_max >= 0),
  pickup_eta_min       integer not null default 10 check (pickup_eta_min >= 0),
  pickup_eta_max       integer not null default 25 check (pickup_eta_max >= 0),
  payment_methods      payment_method[] not null default '{pix,credit,debit,cash}',
  accepting_orders     boolean not null default true,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint eta_delivery_ordered check (delivery_eta_max >= delivery_eta_min),
  constraint eta_pickup_ordered   check (pickup_eta_max >= pickup_eta_min)
);

comment on column stores.slug is 'Identificador na URL: /brasa-burger';

create table store_opening_hours (
  id        uuid primary key default gen_random_uuid(),
  store_id  uuid not null references stores(id) on delete cascade,
  weekday   smallint not null check (weekday between 0 and 6),
  opens_at  time not null,
  closes_at time not null
);

create index on store_opening_hours (store_id, weekday);

-- Quem pode administrar qual loja. Usuário autenticado sem linha aqui é cliente.
create table store_users (
  store_id   uuid not null references stores(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       store_role not null default 'staff',
  created_at timestamptz not null default now(),
  primary key (store_id, user_id)
);

create index on store_users (user_id);

-- --------------------------------------------------------------- Catálogo --

create table categories (
  id         uuid primary key default gen_random_uuid(),
  store_id   uuid not null references stores(id) on delete cascade,
  slug       text not null,
  name       text not null,
  sort_order integer not null default 0,
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  unique (store_id, slug)
);

create index on categories (store_id, sort_order);

create table products (
  id                uuid primary key default gen_random_uuid(),
  store_id          uuid not null references stores(id) on delete cascade,
  category_id       uuid not null references categories(id) on delete restrict,
  slug              text not null,
  name              text not null,
  description       text,
  image_url         text,
  price_cents       integer not null check (price_cents >= 0),
  promo_price_cents integer check (promo_price_cents >= 0),
  available         boolean not null default true,
  featured          boolean not null default false,
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (store_id, slug),
  -- Promoção só existe se for menor que o preço cheio.
  constraint promo_below_price check (promo_price_cents is null or promo_price_cents < price_cents)
);

create index on products (store_id, category_id, sort_order);
create index on products (store_id, featured) where featured;

-- Um grupo cobre variação E adicional. A diferença é só a cardinalidade:
--   min 1 / max 1  -> escolha obrigatória (tamanho, sabor, ponto da carne)
--   min 0 / max N  -> adicionais opcionais
create table option_groups (
  id          uuid primary key default gen_random_uuid(),
  store_id    uuid not null references stores(id) on delete cascade,
  product_id  uuid not null references products(id) on delete cascade,
  name        text not null,
  helper_text text,
  min_select  smallint not null default 0 check (min_select >= 0),
  max_select  smallint not null default 1 check (max_select >= 1),
  sort_order  integer not null default 0,
  constraint select_range_ordered check (max_select >= min_select)
);

create index on option_groups (product_id, sort_order);

create table options (
  id                uuid primary key default gen_random_uuid(),
  store_id          uuid not null references stores(id) on delete cascade,
  group_id          uuid not null references option_groups(id) on delete cascade,
  name              text not null,
  price_delta_cents integer not null default 0,
  available         boolean not null default true,
  sort_order        integer not null default 0
);

create index on options (group_id, sort_order);

-- --------------------------------------------------------------- Clientes --

create table customers (
  id         uuid primary key default gen_random_uuid(),
  store_id   uuid not null references stores(id) on delete cascade,
  -- Preenchido quando o cliente cria conta; nulo em pedido de convidado.
  user_id    uuid references auth.users(id) on delete set null,
  name       text not null,
  phone      text not null,
  email      text,
  created_at timestamptz not null default now(),
  unique (store_id, phone)
);

create index on customers (store_id);
create index on customers (user_id);

create table customer_addresses (
  id          uuid primary key default gen_random_uuid(),
  store_id    uuid not null references stores(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  label       text,
  street      text not null,
  number      text not null,
  complement  text,
  district    text not null,
  city        text not null,
  state       text not null,
  zip_code    text,
  reference   text,
  created_at  timestamptz not null default now()
);

create index on customer_addresses (customer_id);

-- ---------------------------------------------------------------- Pedidos --

create table orders (
  id                 uuid primary key default gen_random_uuid(),
  store_id           uuid not null references stores(id) on delete cascade,
  -- Sequencial por loja: é o número que a cozinha grita.
  number             integer not null,
  status             order_status not null default 'pending',
  service_mode       service_mode not null,

  customer_id        uuid references customers(id) on delete set null,
  customer_name      text not null,
  customer_phone     text not null,

  -- Endereço congelado. O cliente pode editar o cadastro depois; o pedido não muda.
  address_street     text,
  address_number     text,
  address_complement text,
  address_district   text,
  address_city       text,
  address_state      text,
  address_zip_code   text,
  address_reference  text,
  address_label      text,

  payment_method     payment_method not null,
  change_for_cents   integer check (change_for_cents >= 0),

  subtotal_cents     integer not null check (subtotal_cents >= 0),
  delivery_fee_cents integer not null default 0 check (delivery_fee_cents >= 0),
  discount_cents     integer not null default 0 check (discount_cents >= 0),
  total_cents        integer not null check (total_cents >= 0),

  note               text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  unique (store_id, number),
  -- Entrega exige endereço; retirada não pode ter.
  constraint address_matches_mode check (
    (service_mode = 'delivery' and address_street is not null and address_number is not null)
    or (service_mode = 'pickup' and address_street is null)
  )
);

create index on orders (store_id, created_at desc);
create index on orders (store_id, status) where status in ('pending', 'accepted', 'preparing', 'ready');
create index on orders (customer_id);

create table order_items (
  id                uuid primary key default gen_random_uuid(),
  store_id          uuid not null references stores(id) on delete cascade,
  order_id          uuid not null references orders(id) on delete cascade,
  -- Nulo se o produto for excluído do catálogo: o item do pedido permanece.
  product_id        uuid references products(id) on delete set null,
  product_name      text not null,
  product_image_url text,
  quantity          smallint not null check (quantity > 0),
  unit_price_cents  integer not null check (unit_price_cents >= 0),
  total_cents       integer not null check (total_cents >= 0),
  note              text,
  sort_order        integer not null default 0
);

create index on order_items (order_id, sort_order);

create table order_item_options (
  id                uuid primary key default gen_random_uuid(),
  store_id          uuid not null references stores(id) on delete cascade,
  order_item_id     uuid not null references order_items(id) on delete cascade,
  option_id         uuid references options(id) on delete set null,
  group_name        text not null,
  option_name       text not null,
  price_delta_cents integer not null default 0,
  sort_order        integer not null default 0
);

create index on order_item_options (order_item_id, sort_order);

-- ------------------------------------------------ Numeração do pedido ------

-- Contador por loja. Evita a corrida do "max(number) + 1" sob concorrência.
create table store_order_counters (
  store_id   uuid primary key references stores(id) on delete cascade,
  last_number integer not null default 1000
);

create or replace function assign_order_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into store_order_counters (store_id, last_number)
  values (new.store_id, 1001)
  on conflict (store_id) do update
    set last_number = store_order_counters.last_number + 1
  returning last_number into new.number;

  return new;
end;
$$;

create trigger orders_assign_number
  before insert on orders
  for each row
  when (new.number is null)
  execute function assign_order_number();

-- orders.number é NOT NULL, mas o trigger preenche antes da checagem.
alter table orders alter column number drop not null;
alter table orders add constraint number_present check (number is not null) not valid;

-- ------------------------------------------------------- updated_at -------

create or replace function touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger stores_touch   before update on stores   for each row execute function touch_updated_at();
create trigger products_touch before update on products for each row execute function touch_updated_at();
create trigger orders_touch   before update on orders   for each row execute function touch_updated_at();

-- =========================================================== RLS ==========

alter table stores              enable row level security;
alter table store_opening_hours enable row level security;
alter table store_users         enable row level security;
alter table categories          enable row level security;
alter table products            enable row level security;
alter table option_groups       enable row level security;
alter table options             enable row level security;
alter table customers           enable row level security;
alter table customer_addresses  enable row level security;
alter table orders              enable row level security;
alter table order_items         enable row level security;
alter table order_item_options  enable row level security;
alter table store_order_counters enable row level security;

-- É membro administrativo desta loja?
create or replace function is_store_member(target_store uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from store_users
    where store_users.store_id = target_store
      and store_users.user_id = auth.uid()
  );
$$;

-- --- Catálogo: leitura pública, escrita só de quem administra a loja -------

create policy "catálogo é público" on stores
  for select using (true);

create policy "loja administrada pelos seus membros" on stores
  for all using (is_store_member(id)) with check (is_store_member(id));

create policy "horários são públicos" on store_opening_hours
  for select using (true);
create policy "horários geridos pela loja" on store_opening_hours
  for all using (is_store_member(store_id)) with check (is_store_member(store_id));

create policy "categorias ativas são públicas" on categories
  for select using (active or is_store_member(store_id));
create policy "categorias geridas pela loja" on categories
  for all using (is_store_member(store_id)) with check (is_store_member(store_id));

create policy "produtos são públicos" on products
  for select using (true);
create policy "produtos geridos pela loja" on products
  for all using (is_store_member(store_id)) with check (is_store_member(store_id));

create policy "grupos de opção são públicos" on option_groups
  for select using (true);
create policy "grupos geridos pela loja" on option_groups
  for all using (is_store_member(store_id)) with check (is_store_member(store_id));

create policy "opções são públicas" on options
  for select using (true);
create policy "opções geridas pela loja" on options
  for all using (is_store_member(store_id)) with check (is_store_member(store_id));

-- --- Equipe ----------------------------------------------------------------

create policy "membro vê a própria equipe" on store_users
  for select using (user_id = auth.uid() or is_store_member(store_id));

-- --- Clientes: a loja vê os seus; o cliente vê a si mesmo ------------------

create policy "loja vê seus clientes" on customers
  for select using (is_store_member(store_id) or user_id = auth.uid());
create policy "cliente mantém o próprio cadastro" on customers
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "loja gere seus clientes" on customers
  for all using (is_store_member(store_id)) with check (is_store_member(store_id));

create policy "endereços do próprio cliente" on customer_addresses
  for all
  using (
    is_store_member(store_id)
    or exists (select 1 from customers c where c.id = customer_id and c.user_id = auth.uid())
  )
  with check (
    is_store_member(store_id)
    or exists (select 1 from customers c where c.id = customer_id and c.user_id = auth.uid())
  );

-- --- Pedidos ---------------------------------------------------------------
--
-- A loja enxerga tudo. O cliente autenticado enxerga os seus.
-- O acompanhamento de pedido feito como convidado passa pelo servidor, que
-- consulta por id usando a service role — o id é uuid e não é enumerável.

create policy "loja vê seus pedidos" on orders
  for select using (
    is_store_member(store_id)
    or exists (select 1 from customers c where c.id = customer_id and c.user_id = auth.uid())
  );

create policy "loja atualiza seus pedidos" on orders
  for update using (is_store_member(store_id)) with check (is_store_member(store_id));

create policy "itens seguem o pedido" on order_items
  for select using (
    is_store_member(store_id)
    or exists (
      select 1 from orders o
      join customers c on c.id = o.customer_id
      where o.id = order_id and c.user_id = auth.uid()
    )
  );

create policy "opções seguem o item" on order_item_options
  for select using (
    is_store_member(store_id)
    or exists (
      select 1 from order_items oi
      join orders o on o.id = oi.order_id
      join customers c on c.id = o.customer_id
      where oi.id = order_item_id and c.user_id = auth.uid()
    )
  );

-- Escrita de pedido acontece no servidor (service role), que valida preços
-- contra o catálogo antes de gravar. Não há policy de insert para o cliente:
-- deixar o navegador inserir pedido é deixar o navegador escolher o preço.

create policy "contador é interno" on store_order_counters
  for select using (is_store_member(store_id));
