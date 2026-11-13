
import type { MedioPago } from "../../models/Compra";
import type { PaymentStrategy } from "./PaymentStrategy";

import { DebitoPayment } from "./DebitoPayment";
import { CreditoPayment } from "./CreditoPayment";
import { EfectivoPayment } from "./EfectivoPayment";
import { AppError } from "../../utils/AppError";

export class PaymentFactory {
  static obtenerEstrategia(medioPago: MedioPago): PaymentStrategy {
    switch (medioPago) {
      case "debito":
        return new DebitoPayment();

      case "credito":
        return new CreditoPayment();

      case "efectivo":
        return new EfectivoPayment();

      default:
        throw new AppError("Medio de pago no válido", 400);
    }
  }
}


