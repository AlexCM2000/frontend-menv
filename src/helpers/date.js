import {parse,formatISO, parseISO, format} from "date-fns"
import {es} from "date-fns/locale"

export const convertToISO = (date) => {
    const newDate = parse(date, "dd/MM/yyyy", new Date())
    console.log(newDate)
    //date-fns
    return formatISO(newDate)
}

export const displayDate = (date) => {
    const newDate = parseISO(date)
    const formattedDate=format(newDate, "PPPP",{locale:es})
    return formattedDate
}

export const convertToDDMMYYYY=(isoDate)=>
{
    const newDate = new Date(isoDate)
    const formattedDate=format(newDate, "dd/MM/yyyy")
    console.log(formattedDate)
    //date-fns
    return formattedDate
}

export const formatDate=(dateString)=> {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "—";

    const day = date.getUTCDate();
    const month = date.toLocaleString("es-ES", { month: "short" });
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
  }