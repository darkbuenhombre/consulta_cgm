-- Inventario de materiales dentales (solo admin).
-- Idempotente: se puede ejecutar varias veces sin borrar datos (npm run db:migrar).

CREATE TABLE IF NOT EXISTS materials (
  id                SERIAL PRIMARY KEY,
  name              TEXT NOT NULL,
  category          TEXT NOT NULL,
  sku               TEXT UNIQUE,
  unit              TEXT,
  quantity_on_hand  INTEGER NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
  minimum_threshold INTEGER NOT NULL DEFAULT 0 CHECK (minimum_threshold >= 0),
  expiry_date       DATE,
  supplier          TEXT,
  unit_cost         NUMERIC(10, 2) CHECK (unit_cost >= 0),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- SET NULL: "npm run crear-admin" borra y vuelve a crear la cuenta del admin.
  updated_by        INTEGER REFERENCES admin(id) ON DELETE SET NULL
);

-- Historial de cada cambio de stock.
CREATE TABLE IF NOT EXISTS stock_adjustments (
  id          SERIAL PRIMARY KEY,
  material_id INTEGER NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  delta       INTEGER NOT NULL CHECK (delta <> 0),
  reason      TEXT NOT NULL,
  user_id     INTEGER REFERENCES admin(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS stock_adjustments_material ON stock_adjustments (material_id);

-- Materiales de ejemplo (uno bajo el mínimo y uno por vencer, para ver las alertas).
INSERT INTO materials (name, category, sku, unit, quantity_on_hand, minimum_threshold, expiry_date, supplier, unit_cost) VALUES
  ('Resina compuesta A2',          'Resinas',     'RES-A2',   'jeringa', 8,  3,  CURRENT_DATE + 365, 'Dental Chile', 18990),
  ('Lidocaína 2% con epinefrina',  'Anestésicos', 'ANE-LID2', 'caja',    2,  4,  CURRENT_DATE + 200, 'Dental Chile', 24990),
  ('Alginato',                     'Impresión',   'IMP-ALG',  'bolsa',   5,  2,  CURRENT_DATE + 20,  NULL,           8990),
  ('Guantes de nitrilo talla M',   'Desechables', 'DES-GUA-M','caja',    10, 4,  NULL,               NULL,           6990),
  ('Eyectores de saliva',          'Desechables', 'DES-EYE',  'bolsa',   6,  2,  NULL,               NULL,           2990)
ON CONFLICT (sku) DO NOTHING;
