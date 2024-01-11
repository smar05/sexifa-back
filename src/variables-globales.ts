export type VariablesGlobales = {
  date: Date;
  userId: string;
};

let variablesGlobales: VariablesGlobales = {} as any;

function setVariablesGlobales(a: VariablesGlobales) {
  variablesGlobales = { ...a };
}

function clearVariablesGlobales() {
  variablesGlobales = {} as any;
}

export { variablesGlobales, setVariablesGlobales, clearVariablesGlobales };
