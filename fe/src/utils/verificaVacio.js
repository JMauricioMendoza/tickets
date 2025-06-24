/**
 * verificaVacio determina si un input está vacío o solo contiene espacios.
 * Útil para validaciones reactivas en formularios controlados.
 *
 * @param {string} input - Valor del input a validar.
 * @returns {boolean} true si el input está vacío o solo tiene espacios, false en caso contrario.
 */
const verificaVacio = (input) => {
  // Retorna true si el input, tras eliminar espacios, está vacío.
  if (input.trim() === "") return true;
  return false;
};

export default verificaVacio;
