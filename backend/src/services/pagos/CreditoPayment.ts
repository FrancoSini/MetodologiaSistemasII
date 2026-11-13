
import type {
  PaymentStrategy,
  ResultadoPago,
} from "./PaymentStrategy";

export class CreditoPayment implements PaymentStrategy {
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
        mensaje: "El pago con crédito fue rechazado",
      };
    }

    return {
      aprobado: true,
      mensaje: "Pago con crédito aprobado correctamente",
    };
  }
}


