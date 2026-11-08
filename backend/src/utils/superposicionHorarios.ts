
export function haySuperposicionHorarios(
  inicioNuevo: number,
  finNuevo: number,
  inicioExistente: number,
  finExistente: number
): boolean {
  return (
    inicioNuevo < finExistente &&
    finNuevo > inicioExistente
  );
}
