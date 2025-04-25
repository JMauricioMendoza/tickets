function verificaDatos(ev, setValor, tipoVerifica) {
  let valor = ev.target.value;

  switch (tipoVerifica) {
    case 0: // Sin espacios
      valor = valor.replace(/\s/g, "");
      break;
    default:
      return null;
  }

  setValor(valor);
  return null;
}

export default verificaDatos;
