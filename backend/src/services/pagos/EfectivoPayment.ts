
import type {
  PaymentStrategy,
  ResultadoPago,
} from "./PaymentStrategy";

export class EfectivoPayment implements PaymentStrategy {
  async procesarPago(
    total: number,
    simularRechazo = false
  ): Promise<ResultadoPago> {
    if (total <= 0) {
      return {
        aprobado: false,
        mensaje: "El importe del pago debe ser mayor a cero",
      };
    }

    if (simularRechazo) {
      return {
        aprobado: false,
        mensaje: "El pago en efectivo fue rechazado",
      };
    }

    return {
      aprobado: true,
      mensaje: "Pago en efectivo aprobado correctamente",
    };
  }
}

