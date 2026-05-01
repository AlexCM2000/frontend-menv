import QRCode from "qrcode";

function formatDateLong(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("es-BO", {
    timeZone: "UTC",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getPatientName(appointment) {
  const src = appointment.patient ?? appointment.user;
  if (!src) return "—";
  return [src.primerApellido, src.segundoApellido, src.nombres]
    .filter(Boolean)
    .join(" ");
}

function dashes(n = 40) {
  return "-".repeat(n);
}

export async function printReceipt(appointment) {
  const qrText = `SIGMED-PA-${appointment._id}`;
  const qrDataUrl = await QRCode.toDataURL(qrText, {
    width: 200,
    margin: 1,
    color: { dark: "#000000", light: "#ffffff" },
  });

  const patientName = getPatientName(appointment);
  const susCode =
    appointment.patient?.susCode ?? appointment.user?.susCode ?? "—";
  const date = formatDateLong(appointment.date);
  const time = appointment.time ?? "—";
  const serviceName = appointment.services?.[0]?.name ?? "—";
  const category = appointment.services?.[0]?.category ?? "—";
  const doctorName = appointment.doctor?.name ?? "Sin asignar";
  const healthCenter = appointment.health?.name ?? "—";
  const state = appointment.state ?? "—";
  const code = appointment._id?.slice(-8).toUpperCase() ?? "—";

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Ticket · ${patientName}</title>
  <style>
    /* Rollo térmico 80mm — blanco y negro */
    @page {
      size: 80mm auto;
      margin: 0;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 8pt;
      background: #fff;
      color: #000;
      width: 80mm;
    }

    .no-print {
      position: fixed; top: 8px; right: 8px;
      background: #000; color: #fff;
      border: none; border-radius: 4px;
      padding: 6px 14px; font-size: 12px; font-weight: 700;
      cursor: pointer; z-index: 9999;
    }
    @media print { .no-print { display: none !important; } }

    .ticket {
      width: 80mm;
      padding: 3mm 4mm 4mm;
    }

    /* Centrado genérico */
    .c { text-align: center; }
    .b { font-weight: bold; }
    .big { font-size: 11pt; }
    .sm { font-size: 6.5pt; }

    /* Separadores */
    .sep { margin: 2mm 0; white-space: pre; }

    /* Filas de campo */
    .row {
      display: flex;
      justify-content: space-between;
      gap: 2mm;
      margin: 1mm 0;
    }
    .row .lbl { color: #000; flex-shrink: 0; }
    .row .val { text-align: right; font-weight: bold; word-break: break-word; max-width: 52mm; }

    /* QR */
    .qr-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 3mm 0 2mm;
      gap: 1.5mm;
    }
    .qr-wrap img { width: 38mm; height: 38mm; }
    .qr-wrap .qr-label { font-size: 6pt; text-align: center; }
    .qr-wrap .qr-code  { font-size: 6.5pt; font-weight: bold; letter-spacing: 1px; }
  </style>
</head>
<body>
  <button class="no-print" onclick="window.print()">Imprimir</button>

  <div class="ticket">

    <!-- Encabezado -->
    <div class="c b big">SIGMED-PA</div>
    <div class="c sm">COMPROBANTE DE CITA MEDICA</div>
    <div class="sep c">${dashes(36)}</div>

    <!-- Centro de salud -->
    <div class="c b">${healthCenter.toUpperCase()}</div>
    <div class="sep c">${dashes(36)}</div>

    <!-- Paciente -->
    <div class="row">
      <span class="lbl">PACIENTE</span>
    </div>
    <div class="b" style="margin:0.5mm 0 0.5mm">${patientName}</div>
    <div class="sm">Cod. SUS: ${susCode}</div>
    <div class="sep c">${dashes(36)}</div>

    <!-- Fecha y hora -->
    <div class="row">
      <span class="lbl">FECHA</span>
      <span class="val">${date}</span>
    </div>
    <div class="row">
      <span class="lbl">HORA</span>
      <span class="val">${time} hrs.</span>
    </div>
    <div class="sep c">${dashes(36)}</div>

    <!-- Servicio -->
    <div class="row">
      <span class="lbl">ESPECIALIDAD</span>
      <span class="val">${category}</span>
    </div>
    <div class="row">
      <span class="lbl">SERVICIO</span>
      <span class="val">${serviceName}</span>
    </div>
    <div class="row">
      <span class="lbl">MEDICO</span>
      <span class="val">${doctorName}</span>
    </div>
    <div class="sep c">${dashes(36)}</div>

    <!-- Estado -->
    <div class="row">
      <span class="lbl">ESTADO</span>
      <span class="val b">${state.toUpperCase()}</span>
    </div>
    <div class="row">
      <span class="lbl">REF.</span>
      <span class="val">#${code}</span>
    </div>
    <div class="sep c">${dashes(36)}</div>

    <!-- QR -->
    <div class="qr-wrap">
      <img src="${qrDataUrl}" alt="QR cita" />
      <div class="qr-label">Presente este codigo al ingresar</div>
      <div class="qr-code">SIGMED-${code}</div>
    </div>

    <div class="sep c">${dashes(36)}</div>
    <div class="c sm">Llegue 10 minutos antes de su cita.</div>
    <div class="c sm">Gracias por su preferencia.</div>
    <div style="height:5mm"></div>

  </div>
</body>
</html>`;

  const win = window.open("", "_blank", "width=400,height=700");
  win.document.write(html);
  win.document.close();
  win.onload = () => {
    win.focus();
    setTimeout(() => win.print(), 350);
  };
}
