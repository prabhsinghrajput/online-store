-- Create reviews table
create table public.reviews (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  user_email text, -- Optional: store email for easier display if profiles table isn't fully set up
  rating integer check (rating >= 1 and rating <= 5) not null,
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(product_id, user_id) -- Ensure one review per product per user
);

-- Enable RLS
alter table public.reviews enable row level security;

-- Policies
create policy "Reviews are viewable by everyone"
  on public.reviews for select
  using ( true );

create policy "Users can insert their own reviews"
  on public.reviews for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own reviews"
  on public.reviews for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own reviews"
  on public.reviews for delete
  using ( auth.uid() = user_id );
