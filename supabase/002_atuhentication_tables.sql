-- 1. Add user_id to tables
alter table blueprints add column user_id uuid references auth.users default auth.uid();
alter table library_items add column user_id uuid references auth.users default auth.uid();

-- 2. Enable Row Level Security (RLS)
alter table blueprints enable row level security;
alter table library_items enable row level security;

-- 3. Create RLS Policies for Blueprints
create policy "Users can see only their own blueprints" 
on blueprints for select using (auth.uid() = user_id);

create policy "Users can create their own blueprints" 
on blueprints for insert with check (auth.uid() = user_id);

create policy "Users can delete their own blueprints" 
on blueprints for delete using (auth.uid() = user_id);

-- 4. Create RLS Policies for Library Items
create policy "Users can see only their own library items" 
on library_items for select using (auth.uid() = user_id);

create policy "Users can create their own library items" 
on library_items for insert with check (auth.uid() = user_id);

create policy "Users can delete their own library items" 
on library_items for delete using (auth.uid() = user_id);
