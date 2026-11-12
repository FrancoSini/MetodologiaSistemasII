import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import {validarProducto,validarActualizarProducto,} from "../src/middlewares/validarproducto";
import * as productoService from "../src/services/productoService";
import { CompraProducto, Producto } from "../src/models";
import { AppError } from "../src/utils/AppError";

function crearMocksHTTP(body: unknown = {}) {
    const req = { body } as Request;
    const res = {} as Response;
    const next = vi.fn() as unknown as NextFunction;
    return { req, res, next };
}

describe("Candy Bar — Validación y reglas de negocio de Productos", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    describe("validarProducto (POST)", () => {
        it("permite avanzar cuando los datos del producto son válidos", () => {
        const { req, res, next } = crearMocksHTTP({
            nombre: "Pochoclos Grandes",
            precio: 3500,
            stock: 20,
            categoria: "Comida",
        });

        validarProducto(req, res, next);

        expect(next).toHaveBeenCalledOnce();
    });

    it("rechaza precio negativo con AppError 400", () => {
        const { req, res, next } = crearMocksHTTP({
            nombre: "Gaseosa 500ml",
            precio: -100,
            stock: 15,
            categoria: "Bebida",
        });

        expect(() => validarProducto(req, res, next)).toThrow(AppError);
        expect(() => validarProducto(req, res, next)).toThrow(
            "Los datos del producto son inválidos"
        );
        expect(next).not.toHaveBeenCalled();
        });

    it("rechaza stock decimal o negativo", () => {
        const { req, res, next } = crearMocksHTTP({
            nombre: "Combo Pareja",
            precio: 7000,
            stock: 2.5,
            categoria: "Combos",
        });

        expect(() => validarProducto(req, res, next)).toThrow(AppError);
        expect(next).not.toHaveBeenCalled();
        });

    it("rechaza nombre o categoría vacíos", () => {
        const { req, res, next } = crearMocksHTTP({
            nombre: "   ",
            precio: 1500,
            stock: 10,
            categoria: "Golosinas",
        });

        expect(() => validarProducto(req, res, next)).toThrow(AppError);
        expect(next).not.toHaveBeenCalled();
        });
    });

    describe("validarActualizarProducto (PUT)", () => {
        it("permite actualización parcial de precio y stock", () => {
        const { req, res, next } = crearMocksHTTP({
            precio: 4200,
            stock: 50,
        });

        validarActualizarProducto(req, res, next);

        expect(next).toHaveBeenCalledOnce();
    });

    it("rechaza un body vacío", () => {
        const { req, res, next } = crearMocksHTTP({});

        expect(() => validarActualizarProducto(req, res, next)).toThrow(
            "Debe enviar al menos un campo para actualizar"
        );
    });

    it("rechaza campos no permitidos", () => {
        const { req, res, next } = crearMocksHTTP({
            precio: 4000,
            id: 99,
        });

        expect(() => validarActualizarProducto(req, res, next)).toThrow(
            "Campo no permitido: id"
        );
        });
    });

    describe("productoService — Integridad y consultas", () => {
        it("lanza 404 si se consulta un producto inexistente", async () => {
        vi.spyOn(Producto, "findByPk").mockResolvedValue(null);

        await expect(productoService.obtenerProductoPorId(999)).rejects.toThrow(
            "Producto no encontrado"
        );
    });

    it("impide eliminar (409) un producto con compras asociadas", async () => {
        const productoMock = {
            id: 1,
            nombre: "Pochoclos",
            destroy: vi.fn(),
        } as unknown as Producto;

        const sequelize = (await import("../src/config/database")).default;
        vi.spyOn(sequelize, "transaction").mockImplementation(
            async (cb: any) => cb({})
        );
        vi.spyOn(Producto, "findByPk").mockResolvedValue(productoMock);
        vi.spyOn(CompraProducto, "count").mockResolvedValue(3);

        await expect(productoService.eliminarProducto(1)).rejects.toThrow(
            "No se puede eliminar el producto porque tiene compras asociadas"
        );
        expect(productoMock.destroy).not.toHaveBeenCalled();
        });
    });
    });