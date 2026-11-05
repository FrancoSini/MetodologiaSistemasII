
-- Migración 001: estado de las funciones
-- Permite cancelar funciones sin eliminar su historial.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'enum_funciones_estado'
  ) THEN
    CREATE TYPE enum_funciones_estado
      AS ENUM ('programada', 'cancelada');
  END IF;
END
$$;

ALTER TABLE funciones
ADD COLUMN IF NOT EXISTS estado enum_funciones_estado
NOT NULL DEFAULT 'programada';
