
import { describe, it, expect } from "vitest";
import { haySuperposicionHorarios } from "../src/utils/superposicionHorarios";

const MINUTO = 60_000;

function hora(horas: number, minutos = 0): number {
  return (horas * 60 + minutos) * MINUTO;
}

describe("Validación de superposición de funciones", () => {

  it("rechaza una función que comienza durante otra", () => {
    const resultado = haySuperposicionHorarios(
      hora(21),
      hora(23),
      hora(20),
      hora(22)
    );

    expect(resultado).toBe(true);
  });

  it("permite una función que comienza cuando termina otra", () => {
    const resultado = haySuperposicionHorarios(
      hora(22),
      hora(24),
      hora(20),
      hora(22)
    );

    expect(resultado).toBe(false);
  });

  it("permite funciones en horarios separados", () => {
    const resultado = haySuperposicionHorarios(
      hora(15),
      hora(17),
      hora(20),
      hora(22)
    );

    expect(resultado).toBe(false);
  });

  it("detecta cuando una función contiene completamente a otra", () => {
    const resultado = haySuperposicionHorarios(
      hora(19),
      hora(23),
      hora(20),
      hora(22)
    );

    expect(resultado).toBe(true);
  });

  it("detecta superposición cuando una función cruza la medianoche", () => {
    const resultado = haySuperposicionHorarios(
      hora(23),
      hora(25),
      hora(22),
      hora(24)
    );

    expect(resultado).toBe(true);
  });

  it("permite funciones cuando la nueva termina antes de la existente", () => {
    const resultado = haySuperposicionHorarios(
      hora(18),
      hora(20),
      hora(20),
      hora(22)
    );

    expect(resultado).toBe(false);
  });

});
