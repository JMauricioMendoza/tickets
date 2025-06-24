/**
 * eliminaEspacios elimina todos los espacios en blanco de un input controlado.
 * Útil para campos donde no se permiten espacios (ej. usuario, password).
 *
 * @param {object} ev - Evento onChange del input.
 * @param {function} setValor - Setter de estado para actualizar el valor limpio.
 */
function eliminarEspacios(ev, setValor) {
  let valor = ev.target.value;

  // Elimina todos los espacios (incluye espacios intermedios y finales).
  valor = valor.replace(/\s/g, "");

  setValor(valor);
  return null;
}

export default eliminarEspacios;
