import { z } from "zod"
import { validarRut, formatearRut } from "./utils/rut.js"

export const fechaSchema = z
  .string({ required_error: "La fecha es obligatoria" })
  .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener el formato YYYY-MM-DD")
  .refine(f => !Number.isNaN(Date.parse(f)) && new Date(f).toISOString().startsWith(f), "La fecha no es válida")

export const horaSchema = z
  .string({ required_error: "La hora es obligatoria" })
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "La hora debe tener el formato HH:MM")

const texto = nombre => z.string({ required_error: `${nombre} es obligatorio` }).trim().min(1, `${nombre} es obligatorio`).max(100)

export const reservaSchema = z.object({
  datos: z.object({
    nombre: texto("El nombre"),
    apellido_paterno: texto("El apellido paterno"),
    apellido_materno: texto("El apellido materno"),
    rut: z.string({ required_error: "El RUT es obligatorio" })
      .refine(validarRut, "El RUT no es válido")
      .transform(formatearRut),
    // Acepta "9 1234 5678", "+56 9 1234 5678", "221234567", etc. y lo guarda como "+56912345678".
    telefono: z.string({ required_error: "El teléfono es obligatorio" })
      .transform(t => t.replace(/[\s\-()]/g, "").replace(/^\+?56/, ""))
      .refine(t => /^\d{9}$/.test(t), "El teléfono debe tener 9 dígitos (ej: 9 1234 5678)")
      .transform(t => `+56${t}`),
    email: z.string({ required_error: "El correo es obligatorio" }).trim().toLowerCase().email("El correo no es válido")
  }, { required_error: "Faltan los datos del paciente" }),
  servicio: z.string({ required_error: "Selecciona un servicio" }).min(1, "Selecciona un servicio"),
  fecha: fechaSchema,
  hora: horaSchema
})

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Correo no válido"),
  password: z.string().min(1, "Ingresa la contraseña")
})

export const estadoSchema = z.object({
  estado: z.enum(["pendiente", "confirmada", "cancelada", "completada"])
})

export const servicioSchema = z.object({
  codigo: z.string().trim().regex(/^[a-z0-9_-]+$/, "El código solo puede tener minúsculas, números, - y _"),
  nombre: texto("El nombre"),
  duracion_min: z.coerce.number().int().positive().default(30),
  precio: z.coerce.number().int().nonnegative().nullable().default(null),
  activo: z.boolean().default(true)
})

export const horarioSchema = z.array(
  z.object({
    dia_semana: z.coerce.number().int().min(1).max(6),
    hora_inicio: horaSchema,
    hora_fin: horaSchema,
    intervalo_min: z.coerce.number().int().positive().default(30)
  }).refine(t => t.hora_fin > t.hora_inicio, "La hora de término debe ser posterior a la de inicio")
).max(50, "Máximo 50 tramos de horario") // límite contra el aviso GHSA-mrhx-c7xc-m3w5 de zod

export const bloqueoSchema = z.object({
  fecha: fechaSchema,
  motivo: z.string().trim().max(200).optional().default("")
})

export const tokenSchema = z.string().uuid()

// Texto opcional: "" o ausente se guarda como null.
const opcional = max => z.string().trim().max(max).nullish().transform(t => t || null)

export const materialSchema = z.object({
  name: texto("El nombre"),
  category: texto("La categoría"),
  sku: opcional(50),
  unit: opcional(30),
  quantity_on_hand: z.coerce.number().int("La cantidad debe ser un número entero")
    .nonnegative("La cantidad no puede ser negativa").default(0),
  minimum_threshold: z.coerce.number().int("El mínimo debe ser un número entero")
    .nonnegative("El mínimo no puede ser negativo").default(0),
  expiry_date: z.union([fechaSchema, z.literal(""), z.null()]).optional().transform(f => f || null),
  supplier: opcional(100),
  unit_cost: z.union([z.coerce.number().nonnegative("El costo no puede ser negativo").max(99999999), z.literal(""), z.null()])
    .optional().transform(c => (c === "" || c == null ? null : c))
})

export const ajusteSchema = z.object({
  delta: z.coerce.number({ invalid_type_error: "La cantidad debe ser un número" })
    .int("La cantidad debe ser un número entero").refine(d => d !== 0, "La cantidad no puede ser 0"),
  reason: z.string({ required_error: "El motivo es obligatorio" }).trim()
    .min(1, "El motivo es obligatorio").max(200)
})

export const filtroMaterialesSchema = z.object({
  search: z.string().trim().max(100).optional(),
  category: z.string().trim().max(100).optional(),
  status: z.enum(["low", "out", "expiring"]).optional()
})
