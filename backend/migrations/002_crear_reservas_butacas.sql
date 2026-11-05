
-- Migracion 002: crear tabla de reservas de butacas

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'enum_reservas_butacas_estado'
  ) THEN
    CREATE TYPE enum_reservas_butacas_estado
    AS ENUM (
      'activa',
      'liberada',
      'vencida',
      'consumida'
    );
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS reservas_butacas (
  id SERIAL PRIMARY KEY,

  compra_id INTEGER NOT NULL
    REFERENCES compras(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  funcion_butaca_id INTEGER NOT NULL
    REFERENCES funcion_butacas(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  vence_en TIMESTAMP WITH TIME ZONE NOT NULL,

  estado enum_reservas_butacas_estado
    NOT NULL DEFAULT 'activa',

  "createdAt" TIMESTAMP WITH TIME ZONE
    NOT NULL DEFAULT NOW(),

  "updatedAt" TIMESTAMP WITH TIME ZONE
    NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS
  reservas_butacas_unica_activa
ON reservas_butacas (funcion_butaca_id)
WHERE estado = 'activa';

-- Corregir claves foraneas si la tabla ya existia.
-- Garantiza ON UPDATE CASCADE y ON DELETE RESTRICT.

DO $$
DECLARE
  relacion RECORD;
  fk RECORD;
  tiene_correcta BOOLEAN;
BEGIN
  FOR relacion IN
    SELECT *
    FROM (
      VALUES
        ('compra_id', 'compras'),
        ('funcion_butaca_id', 'funcion_butacas')
    ) AS datos(columna, tabla_referenciada)
  LOOP
    tiene_correcta := FALSE;

    FOR fk IN
      SELECT
        c.conname,
        c.confdeltype,
        c.confupdtype,
        c.confrelid
      FROM pg_constraint c
      JOIN pg_attribute a
        ON a.attrelid = c.conrelid
       AND a.attnum = c.conkey[1]
      WHERE c.conrelid = 'reservas_butacas'::regclass
        AND c.contype = 'f'
        AND cardinality(c.conkey) = 1
        AND a.attname = relacion.columna
    LOOP
      IF fk.confdeltype = 'r'
         AND fk.confupdtype = 'c'
         AND fk.confrelid =
             to_regclass(relacion.tabla_referenciada)
      THEN
        tiene_correcta := TRUE;
      ELSE
        EXECUTE format(
          'ALTER TABLE reservas_butacas DROP CONSTRAINT %I',
          fk.conname
        );
      END IF;
    END LOOP;

    IF NOT tiene_correcta THEN
      EXECUTE format(
        'ALTER TABLE reservas_butacas
         ADD CONSTRAINT %I
         FOREIGN KEY (%I)
         REFERENCES %I(id)
         ON UPDATE CASCADE
         ON DELETE RESTRICT',
        'reservas_butacas_' || relacion.columna || '_fkey',
        relacion.columna,
        relacion.tabla_referenciada
      );
    END IF;
  END LOOP;
END
$$;
