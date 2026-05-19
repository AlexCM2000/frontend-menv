import { jsPDF } from "jspdf";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("es-BO", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

const fullName = (p) =>
  p ? [p.primerApellido, p.segundoApellido, p.nombres].filter(Boolean).join(" ") : "—";

const fmtFreq = (f) => {
  if (f === null || f === undefined || f === "") return "—";
  return typeof f === "number" ? `cada ${f}h` : String(f);
};

const fmtDur = (d) => {
  if (d === null || d === undefined || d === "") return "—";
  return typeof d === "number" ? `${d} días` : String(d);
};

const patientName = fullName;

const doctorName = (rx) => {
  const pb = rx.prescribedBy;
  if (pb?.primerApellido || pb?.nombres) return fullName(pb);
  return rx.doctor?.name ?? "—";
};

export async function generatePrescriptionPdf(rx) {
  const doc = new jsPDF({ format: "a5", unit: "mm", orientation: "portrait" });
  const W = 148;
  let y = 0;

  // ── Encabezado institucional ──────────────────────────────
  doc.setDrawColor(30, 30, 30);
  doc.setLineWidth(0.8);
  doc.line(10, 6, W - 10, 6);

  y = 13;
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("G.A.M.P.A. — SISTEMA DE SALUD MUNICIPAL", W / 2, y, { align: "center" });

  y += 4.5;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.text(rx.health?.name ?? "Centro de Salud", W / 2, y, { align: "center" });

  y += 3.5;
  doc.setLineWidth(0.4);
  doc.setDrawColor(160, 160, 160);
  doc.line(10, y, W - 10, y);

  y += 6;

  // ── Título + código + fecha ───────────────────────────────
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 20, 20);
  doc.text("RECETA MÉDICA", 10, y);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.text(`Fecha: ${fmtDate(rx.date)}`, W - 10, y, { align: "right" });

  y += 4;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.text(`Código: ${rx.code}`, 10, y);

  y += 5;
  doc.setDrawColor(160, 160, 160);
  doc.setLineWidth(0.3);
  doc.line(10, y, W - 10, y);
  y += 5;

  // ── Datos del paciente ────────────────────────────────────
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80, 80, 80);
  doc.text("PACIENTE", 10, y);
  y += 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(20, 20, 20);
  doc.text(`Nombre: ${patientName(rx.patient)}`, 10, y);
  y += 4;
  doc.text(`Código SUS: ${rx.patient?.susCode ?? "—"}`, 10, y);

  y += 6;

  // ── Datos del médico ──────────────────────────────────────
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80, 80, 80);
  doc.text("MÉDICO PRESCRIPTOR", 10, y);
  y += 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(20, 20, 20);
  doc.text(`Dr./Dra.: ${doctorName(rx)}`, 10, y);
  doc.text(`Esp.: ${rx.doctor?.specialty ?? "—"}`, W - 10, y, { align: "right" });
  y += 4;
  if (rx.doctor?.licenseNumber) {
    doc.text(`Matrícula: ${rx.doctor.licenseNumber}`, 10, y);
    y += 4;
  }

  y += 1;
  doc.setDrawColor(160, 160, 160);
  doc.setLineWidth(0.3);
  doc.line(10, y, W - 10, y);
  y += 5;

  // ── Medicamentos ──────────────────────────────────────────
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80, 80, 80);
  doc.text("MEDICAMENTOS PRESCRITOS", 10, y);
  y += 4;

  rx.items?.forEach((item, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(10, y - 3, W - 20, 14, "F");
    }

    doc.setTextColor(20, 20, 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text(`${idx + 1}. ${item.medicationName}`, 12, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(60, 60, 60);
    y += 3.5;
    doc.text(`Dosis: ${item.dose}`, 14, y);
    doc.text(`Frecuencia: ${fmtFreq(item.frequency)}`, 60, y);
    doc.text(`Duración: ${fmtDur(item.duration)}`, W - 10, y, { align: "right" });
    y += 3.5;
    doc.text(`Cantidad a despachar: ${item.quantityToDispense} ${item.stock?.unit ?? ""}`, 14, y);
    y += 5;
  });

  // ── Notas ─────────────────────────────────────────────────
  if (rx.notes) {
    doc.setDrawColor(160, 160, 160);
    doc.setLineWidth(0.3);
    doc.line(10, y, W - 10, y);
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(80, 80, 80);
    doc.text("NOTAS:", 10, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(20, 20, 20);
    const noteLines = doc.splitTextToSize(rx.notes, W - 20);
    doc.text(noteLines, 10, y);
    y += noteLines.length * 3.5;
  }

  // ── Firma del médico ──────────────────────────────────────
  const signY = Math.max(y + 10, 170);
  doc.setDrawColor(80, 80, 80);
  doc.setLineWidth(0.4);
  doc.line(10, signY, 65, signY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text("Firma y sello del médico", 37.5, signY + 4, { align: "center" });

  // ── Footer ────────────────────────────────────────────────
  doc.setDrawColor(160, 160, 160);
  doc.setLineWidth(0.3);
  doc.line(10, 202, W - 10, 202);
  doc.setFontSize(6);
  doc.setTextColor(120, 120, 120);
  doc.text(`Generado por SIGMED-PA · ${new Date().toLocaleString("es-BO")}`, W / 2, 206, { align: "center" });

  const url = doc.output("bloburl");
  window.open(url, "_blank");
}
