function obtenerValorSet(set) {
  return parseInt(set.currentKey ?? Array.from(set)[0], 10);
}

export default obtenerValorSet;
