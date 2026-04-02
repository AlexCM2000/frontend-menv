export const formatCurrency = (price) =>
  Number(price).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

/**
 * Construye el nombre completo a partir de los campos separados.
 * Formato: "PrimerApellido SegundoApellido Nombres"
 */
export const fullName = (obj) =>
  [obj?.primerApellido, obj?.segundoApellido, obj?.nombres]
    .filter(Boolean)
    .join(" ");

  export const list = [
    {id:"P",text:"Pendiente"}, 
    {id:"R",text:"Reprogramada"}, 
    {id:"CA",text:"Cancelada"}, 
    {id:"CO",text:"Completada"}, 
    {id:"CO",text:"Completada"}, 
    {id:"NA",text:"No asistio"}, 
]