export const formatCurrency = (price) =>
  Number(price).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  export const list = [
    {id:"P",text:"Pendiente"}, 
    {id:"R",text:"Reprogramada"}, 
    {id:"CA",text:"Cancelada"}, 
    {id:"CO",text:"Completada"}, 
    {id:"CO",text:"Completada"}, 
    {id:"NA",text:"No asistio"}, 
]