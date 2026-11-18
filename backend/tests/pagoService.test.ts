
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from "vitest";

import sequelize from "../src/config/database";
import {
  Compra,
  CompraProducto,
  Producto,
  ReservaButaca,
} from "../src/models";

import { PaymentFactory } from "../src/services/pagos/PaymentFactory";
import { procesarPago } from "../src/services/pagoService";

const transaccionMock = {
  LOCK: {
    UPDATE: "UPDATE",
  },
};

interface OpcionesEscenario {
  estado?: string;
  stock?: number;
  cantidad?: number;
  aprobado?: boolean;
  conProductos?: boolean;
}

function prepararEscenario({
  estado = "pendiente",
  stock = 10,
  cantidad = 3,
  aprobado = true,
  conProductos = true,
}: OpcionesEscenario = {}) {
  const compraMock = {
    id: 1,
    usuarioId: 5,
    medioPago: "efectivo",
    total: 15000,
    estado,
    update: vi.fn().mockResolvedValue(undefined),
  } as unknown as Compra;

  const productoMock = {
    id: 2,
    nombre: "Pochoclos",
    stock,
    update: vi.fn().mockResolvedValue(undefined),
  } as unknown as Producto;

  vi.spyOn(sequelize, "transaction").mockImplementation(
    async (callback: any) => callback(transaccionMock)
  );

  vi.spyOn(Compra, "findOne").mockResolvedValue(
    compraMock
  );

  vi.spyOn(CompraProducto, "findAll").mockResolvedValue(
    conProductos
      ? ([
          {
            compraId: 1,
            productoId: 2,
            cantidad,
          },
        ] as CompraProducto[])
      : []
  );

  vi.spyOn(Producto, "findByPk").mockResolvedValue(
    productoMock
  );

  vi.spyOn(ReservaButaca, "findAll").mockResolvedValue(
    []
  );

  const procesarPagoMock = vi.fn().mockResolvedValue({
    aprobado,
    mensaje: aprobado
      ? "Pago aprobado"
      : "Pago rechazado",
  });

  vi.spyOn(
    PaymentFactory,
    "obtenerEstrategia"
  ).mockReturnValue({
    procesarPago: procesarPagoMock,
  } as unknown as ReturnType<
    typeof PaymentFactory.obtenerEstrategia
  >);

  return {
    compraMock,
    productoMock,
    procesarPagoMock,
  };
}

describe("Candy Bar - procesamiento de pagos", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("descuenta stock cuando el pago es aprobado", async () => {
    // Arrange
    const { productoMock, compraMock } =
      prepararEscenario({
        stock: 10,
        cantidad: 3,
        aprobado: true,
      });

    // Act
    const resultado = await procesarPago({
      compraId: 1,
      usuarioId: 5,
    });

    // Assert
    expect(resultado.aprobado).toBe(true);

    expect(productoMock.update).toHaveBeenCalledWith(
      { stock: 7 },
      { transaction: transaccionMock }
    );

    expect(compraMock.update).toHaveBeenCalledWith(
      { estado: "confirmada" },
      { transaction: transaccionMock }
    );
  });

  it("no descuenta stock cuando se rechaza el pago", async () => {
    // Arrange
    const { productoMock, compraMock } =
      prepararEscenario({
        stock: 10,
        cantidad: 3,
        aprobado: false,
      });

    // Act
    const resultado = await procesarPago({
      compraId: 1,
      usuarioId: 5,
      simularRechazo: true,
    });

    // Assert
    expect(resultado.aprobado).toBe(false);

    expect(productoMock.update).not.toHaveBeenCalled();

    expect(compraMock.update).toHaveBeenCalledWith(
      { estado: "cancelada" },
      { transaction: transaccionMock }
    );
  });

  it("rechaza la compra cuando no hay stock suficiente", async () => {
    // Arrange
    const {
      productoMock,
      compraMock,
      procesarPagoMock,
    } = prepararEscenario({
      stock: 2,
      cantidad: 3,
    });

    // Act y Assert
    await expect(
      procesarPago({
        compraId: 1,
        usuarioId: 5,
      })
    ).rejects.toThrow(
      "Stock insuficiente para Pochoclos"
    );

    expect(productoMock.update).not.toHaveBeenCalled();
    expect(compraMock.update).not.toHaveBeenCalled();

    // No se debe procesar el pago si falta stock.
    expect(procesarPagoMock).not.toHaveBeenCalled();
  });

  it("no permite pagar nuevamente una compra confirmada", async () => {
    // Arrange
    const {
      productoMock,
      procesarPagoMock,
    } = prepararEscenario({
      estado: "confirmada",
    });

    // Act y Assert
    await expect(
      procesarPago({
        compraId: 1,
        usuarioId: 5,
      })
    ).rejects.toThrow(
      "La compra no está pendiente de pago"
    );

    expect(productoMock.update).not.toHaveBeenCalled();
    expect(procesarPagoMock).not.toHaveBeenCalled();
  });

  it("no modifica productos si la compra solo tiene entradas", async () => {
    // Arrange
    const { productoMock, compraMock } =
      prepararEscenario({
        conProductos: false,
      });

    // Act
    const resultado = await procesarPago({
      compraId: 1,
      usuarioId: 5,
    });

    // Assert
    expect(resultado.aprobado).toBe(true);

    expect(productoMock.update).not.toHaveBeenCalled();

    expect(compraMock.update).toHaveBeenCalledWith(
      { estado: "confirmada" },
      { transaction: transaccionMock }
    );
  });
});
