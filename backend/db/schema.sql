-- Esquema de la base de datos de la consulta.
-- Ejecutar con: npm run db:init  (borra y vuelve a crear todas las tablas)

DROP TABLE IF EXISTS stock_adjustments, materials, reservas, pacientes, servicios, horario_semanal, dias_bloqueados, admin CASCADE;

CREATE TABLE servicios (
  id           SERIAL PRIMARY KEY,
  codigo       TEXT NOT NULL UNIQUE,
  nombre       TEXT NOT NULL,
  duracion_min INTEGER NOT NULL DEFAULT 30 CHECK (duracion_min > 0),
  precio       INTEGER CHECK (precio >= 0),
  activo       BOOLEAN NOT NULL DEFAULT TRUE
);

-- Tramos de atención por día de la semana (1 = lunes ... 6 = sábado).
-- Cada tramo se divide en bloques de "intervalo_min" minutos.
CREATE TABLE horario_semanal (
  id            SERIAL PRIMARY KEY,
  dia_semana    SMALLINT NOT NULL CHECK (dia_semana BETWEEN 1 AND 6),
  hora_inicio   TIME NOT NULL,
  hora_fin      TIME NOT NULL,
  intervalo_min INTEGER NOT NULL DEFAULT 30 CHECK (intervalo_min > 0),
  CHECK (hora_fin > hora_inicio)
);

-- Feriados, vacaciones, etc.: ese día no se puede reservar.
CREATE TABLE dias_bloqueados (
  fecha  DATE PRIMARY KEY,
  motivo TEXT
);

CREATE TABLE pacientes (
  id               SERIAL PRIMARY KEY,
  rut              TEXT NOT NULL UNIQUE,
  nombre           TEXT NOT NULL,
  apellido_paterno TEXT NOT NULL,
  apellido_materno TEXT NOT NULL,
  telefono         TEXT NOT NULL,
  email            TEXT NOT NULL,
  creado_en        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE reservas (
  id                SERIAL PRIMARY KEY,
  paciente_id       INTEGER NOT NULL REFERENCES pacientes(id),
  servicio_id       INTEGER NOT NULL REFERENCES servicios(id),
  fecha             DATE NOT NULL,
  hora              TIME NOT NULL,
  estado            TEXT NOT NULL DEFAULT 'pendiente'
                    CHECK (estado IN ('pendiente', 'confirmada', 'cancelada', 'completada')),
  token_cancelacion UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  creado_en         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Impide que dos reservas activas ocupen el mismo bloque (aunque lleguen al mismo tiempo).
CREATE UNIQUE INDEX reservas_bloque_unico ON reservas (fecha, hora) WHERE estado <> 'cancelada';

CREATE TABLE admin (
  id            SERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL
);
