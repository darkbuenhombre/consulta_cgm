import assert from "node:assert/strict"
import { test } from "node:test"
import { calcularDv, formatearRut, validarRut } from "../src/utils/rut.js"

test("calcula el dígito verificador", () => {
  assert.equal(calcularDv("11111111"), "1")
  assert.equal(calcularDv("12345678"), "5")
  assert.equal(calcularDv("10000013"), "K")
})

test("acepta RUT válidos en distintos formatos", () => {
  assert.ok(validarRut("12.345.678-5"))
  assert.ok(validarRut("123456785"))
  assert.ok(validarRut("10.000.013-k"))
})

test("rechaza RUT inválidos", () => {
  assert.ok(!validarRut("12.345.678-9"))
  assert.ok(!validarRut("abc"))
  assert.ok(!validarRut(""))
  assert.ok(!validarRut("123-4"))
})

test("normaliza el formato", () => {
  assert.equal(formatearRut("12.345.678-5"), "12345678-5")
  assert.equal(formatearRut("10000013k"), "10000013-K")
})
