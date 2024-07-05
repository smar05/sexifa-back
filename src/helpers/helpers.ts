export class Functions {
  /**
   * Incrementar la fecha x cantidad de meses
   *
   * @static
   * @param {Date} fecha
   * @param {number} meses
   * @return {*}  {Date}
   * @memberof Functions
   */
  static incrementarMeses(fecha: Date, meses: number): Date {
    // Clonamos la fecha original para evitar modificarla directamente
    const fechaClonada: Date = new Date(fecha);

    // Obtenemos el mes actual y lo incrementamos según la cantidad de meses
    const mesActual: number = fechaClonada.getMonth();
    fechaClonada.setMonth(mesActual + meses);

    return fechaClonada;
  }
}
