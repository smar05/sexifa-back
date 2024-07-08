export class Helpers {
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

  /**
   * Validar que dos objetos sean iguales en propiedades
   *
   * @static
   * @param {object} obj1
   * @param {object} obj2
   * @return {*}  {boolean}
   * @memberof Functions
   */
  static areObjectsEqual(obj1: object, obj2: object): boolean {
    // Verificar si ambos son nulos o indefinidos
    if (obj1 == null && obj2 == null) return true;

    // Verificar si solo uno es nulo o indefinido
    if (obj1 == null || obj2 == null) return false;

    // Verificar si ambos no son objetos
    if (typeof obj1 !== "object" || typeof obj2 !== "object") {
      return obj1 === obj2;
    }

    // Obtener las claves de ambos objetos
    let keys1 = Object.keys(obj1);
    let keys2 = Object.keys(obj2);

    // Verificar si tienen la misma cantidad de propiedades
    if (keys1.length !== keys2.length) return false;

    // Verificar recursivamente cada propiedad
    for (let key of keys1) {
      if (
        !keys2.includes(key) ||
        !this.areObjectsEqual((obj1 as any)[key], (obj2 as any)[key])
      ) {
        return false;
      }
    }

    return true;
  }
}
