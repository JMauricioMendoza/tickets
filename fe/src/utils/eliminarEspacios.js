function eliminarEspacios(ev, setValor) {
  let valor = ev.target.value;

  valor = valor.replace(/\s/g, "");

  setValor(valor);
  return null;
}

export default eliminarEspacios;
