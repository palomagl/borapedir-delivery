-- Server-owned loyalty ledger. No client can mark stamps or spend another card.
create table roxo_loyalty_accounts (
 id uuid primary key default gen_random_uuid(), store_id uuid not null references stores(id) on delete cascade,
 token_hash text not null unique, created_at timestamptz not null default now()
);
create table roxo_loyalty_redemptions (
 id uuid primary key default gen_random_uuid(), account_id uuid not null references roxo_loyalty_accounts(id) on delete cascade,
 store_id uuid not null references stores(id) on delete cascade,
 state text not null default 'reserved' check (state in ('reserved','used','released')),
 expires_at timestamptz not null default now()+interval '15 minutes',
 order_id uuid unique references orders(id) on delete set null, created_at timestamptz not null default now()
);
alter table orders add column loyalty_account_id uuid references roxo_loyalty_accounts(id);
alter table orders add column loyalty_redemption_id uuid unique references roxo_loyalty_redemptions(id);
create table roxo_loyalty_credits (
 order_id uuid primary key references orders(id) on delete cascade,
 account_id uuid not null references roxo_loyalty_accounts(id) on delete cascade,
 store_id uuid not null references stores(id) on delete cascade, created_at timestamptz not null default now()
);
create index roxo_loyalty_credit_account on roxo_loyalty_credits(account_id,store_id);
create index roxo_loyalty_reward_account on roxo_loyalty_redemptions(account_id,store_id);
alter table roxo_loyalty_accounts enable row level security;
alter table roxo_loyalty_redemptions enable row level security;
alter table roxo_loyalty_credits enable row level security;

create function roxo_reserve_reward(p_account uuid,p_store uuid) returns uuid
language plpgsql security definer set search_path=public as $$
declare credits int; spent int; reward uuid;
begin
 perform 1 from roxo_loyalty_accounts where id=p_account and store_id=p_store for update;
 if not found then raise exception 'Invalid loyalty account'; end if;
 select count(*) into credits from roxo_loyalty_credits where account_id=p_account and store_id=p_store;
 select count(*) into spent from roxo_loyalty_redemptions where account_id=p_account and store_id=p_store and (state='used' or (state='reserved' and expires_at>now()));
 if credits/10-spent<1 then raise exception 'No reward available'; end if;
 insert into roxo_loyalty_redemptions(account_id,store_id) values(p_account,p_store) returning id into reward;
 return reward;
end $$;
revoke all on function roxo_reserve_reward(uuid,uuid) from public,anon,authenticated;
grant execute on function roxo_reserve_reward(uuid,uuid) to service_role;

create function roxo_validate_reward() returns trigger language plpgsql security definer set search_path=public as $$
declare reward roxo_loyalty_redemptions%rowtype;
begin
 if new.loyalty_account_id is not null then
  perform 1 from roxo_loyalty_accounts where id=new.loyalty_account_id and store_id=new.store_id for update;
  if not found then raise exception 'Invalid loyalty account'; end if;
 end if;
 if new.loyalty_redemption_id is not null then
  select * into reward from roxo_loyalty_redemptions where id=new.loyalty_redemption_id for update;
  if not found or reward.account_id is distinct from new.loyalty_account_id or reward.store_id<>new.store_id or reward.state<>'reserved' or reward.expires_at<=clock_timestamp() then raise exception 'Invalid loyalty reward'; end if;
 end if;
 return new;
end $$;
create trigger roxo_reward_validate before insert on orders for each row execute function roxo_validate_reward();

create function roxo_record_loyalty() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if tg_op='INSERT' and new.loyalty_redemption_id is not null then
  update roxo_loyalty_redemptions set state='used',order_id=new.id where id=new.loyalty_redemption_id;
 end if;
 if new.status='canceled' then delete from roxo_loyalty_credits where order_id=new.id; end if;
 if new.status='canceled' and new.loyalty_redemption_id is not null then
  update roxo_loyalty_redemptions set state='released' where id=new.loyalty_redemption_id;
 end if;
 if new.status='delivered' and new.loyalty_account_id is not null and new.loyalty_redemption_id is null and new.total_cents>0 then
  insert into roxo_loyalty_credits(order_id,account_id,store_id) values(new.id,new.loyalty_account_id,new.store_id) on conflict(order_id) do nothing;
 end if;
 return new;
end $$;
create trigger roxo_loyalty_record after insert or update of status on orders for each row execute function roxo_record_loyalty();
create function roxo_restore_deleted_reward() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if old.loyalty_redemption_id is not null then update roxo_loyalty_redemptions set state='released' where id=old.loyalty_redemption_id; end if;
 return old;
end $$;
create trigger roxo_loyalty_rollback after delete on orders for each row execute function roxo_restore_deleted_reward();
