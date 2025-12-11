-- Crear tabla de miembros de equipo
create table if not exists team_members (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references auth.users(id) not null,
  member_id uuid references auth.users(id), -- Puede ser null si aún no aceptó la invitación
  member_email text not null,
  status text check (status in ('active', 'pending', 'disabled')) default 'pending',
  credits_allocated int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Habilitar RLS
alter table team_members enable row level security;

-- Políticas de seguridad
create policy "Admin manages their team" on team_members
  for all using (auth.uid() = owner_id);

create policy "Member views their status" on team_members
  for select using (auth.uid() = member_id);

-- Función RPC para transferencia segura de créditos
create or replace function transfer_credits(
  p_owner_id uuid,
  p_member_email text,
  p_amount int
) returns json language plpgsql security definer as $$
declare
  owner_credits int;
  target_member_id uuid;
  target_row_id uuid;
begin
  -- 1. Verificar créditos del Admin (bloqueo de fila para evitar race conditions)
  select credits into owner_credits from profiles where id = p_owner_id for update;
  
  if owner_credits is null then
    return json_build_object('success', false, 'message', 'Perfil de admin no encontrado');
  end if;

  if owner_credits < p_amount then
    return json_build_object('success', false, 'message', 'Saldo insuficiente');
  end if;

  -- 2. Buscar al miembro en la tabla team_members del propietario
  select id, member_id into target_row_id, target_member_id 
  from team_members 
  where owner_id = p_owner_id and member_email = p_member_email;

  if target_row_id is null then
    return json_build_object('success', false, 'message', 'Miembro no encontrado en tu equipo');
  end if;

  -- 3. Lógica de transferencia
  -- Restamos siempre al admin
  update profiles set credits = credits - p_amount where id = p_owner_id;

  -- Si el usuario ya está registrado (member_id existe), le sumamos los créditos inmediatamente
  if target_member_id is not null then
    update profiles set credits = credits + p_amount where id = target_member_id;
  else
    -- Si no está registrado, los créditos se quedan "reservados" en la tabla team_members 
    -- (deberás implementar un trigger al registro de usuario para asignarlos después)
  end if;
  
  -- 4. Actualizar registro histórico en team_members
  update team_members 
  set credits_allocated = credits_allocated + p_amount,
      updated_at = now()
  where id = target_row_id;

  return json_build_object('success', true, 'new_balance', owner_credits - p_amount);
end;
$$
