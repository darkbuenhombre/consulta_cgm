-- Eliminar un material lo desactiva en vez de borrarlo, para conservar su historial de movimientos.
-- Idempotente: se puede ejecutar varias veces sin borrar datos (npm run db:migrar).

ALTER TABLE materials ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;
