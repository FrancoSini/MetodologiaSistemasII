export interface ResultadoPago {
  aprobado: boolean;
  mensaje: string;
}

export interface PaymentStrategy {
  procesarPago(
    total: number,
    simularRechazo?: boolean
  ): Promise<ResultadoPago>;
}
