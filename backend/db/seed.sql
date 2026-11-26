-- Datos iniciales: los mismos servicios y horarios que tenía el frontend.

INSERT INTO servicios (codigo, nombre) VALUES
  ('limpieza',       'Limpieza dental'),
  ('revision',       'Revisión general'),
  ('extraccion',     'Extracción'),
  ('blanqueamiento', 'Blanqueamiento'),
  ('ortodoncia',     'Ortodoncia'),
  ('urgencia',       'Urgencia dental');

-- Lunes a sábado: 09:00–12:30 y 14:00–16:30 en bloques de 30 minutos
-- (el último bloque de cada tramo empieza a las 12:00 y a las 16:00).
INSERT INTO horario_semanal (dia_semana, hora_inicio, hora_fin, intervalo_min)
SELECT dia, tramo.inicio, tramo.fin, 30
FROM generate_series(1, 6) AS dia,
     (VALUES (TIME '09:00', TIME '12:30'), (TIME '14:00', TIME '16:30')) AS tramo(inicio, fin);
