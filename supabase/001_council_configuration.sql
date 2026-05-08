-- Table for saving Council configurations (Neural Blueprints)
create table blueprints (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  nodes jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table for saving Session logs and Code (Intellectual Assets)
create table library_items (
  id uuid default gen_random_uuid() primary key,
  type text not null, -- 'session' or 'code'
  title text not null,
  content text not null,
  timestamp bigint not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Realtime for these tables (Optional but recommended)
alter publication supabase_realtime add table blueprints;
alter publication supabase_realtime add table library_items;
