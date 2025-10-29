-- Agregar nuevos campos a la tabla patients
ALTER TABLE public.patients 
ADD COLUMN sexo TEXT,
ADD COLUMN direccion_fisica TEXT,
ADD COLUMN persona_rescate_nombre TEXT,
ADD COLUMN persona_rescate_telefono TEXT,
ADD COLUMN persona_rescate_email TEXT;;
