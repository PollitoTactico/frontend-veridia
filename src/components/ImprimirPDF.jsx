import { useCallback, useState } from "react";
import { Button, Tooltip } from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { getLogger } from "../services/logs";
const log = getLogger("ui.print");

export default function ImprimirPDF({ data, editedData, buildPdf = defaultBuildPdf, label = "Imprimir PDF" }) {
  const [busy, setBusy] = useState(false);
  
  // Usar editedData si está disponible, si no, usar data original
  const dataToUse = editedData || data;

  const handleClick = useCallback(async () => {
    if (!dataToUse || busy) return;
    setBusy(true);
    log.info("print_click");

    try {
      const doc = await buildPdf(dataToUse);
      if (typeof doc?.autoPrint !== "function") throw new Error("Invalid jsPDF instance");

      doc.autoPrint();
      const blobUrl = doc.output("bloburl");
      const win = window.open(blobUrl, "_blank");

      if (win) {
        log.info("print_window_opened");
      } else {
        log.warn("popup_blocked_fallback");
        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "0";
        document.body.appendChild(iframe);
        iframe.onload = () => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            log.info("print_iframe_triggered");
          } finally {
            setTimeout(() => iframe.remove(), 1000);
          }
        };
        iframe.src = blobUrl;
      }
    } catch (err) {
      log.error("print_failed", { message: String(err) });
    } finally {
      setBusy(false);
    }
  }, [dataToUse, buildPdf, busy]);

  return (
    <Tooltip title={label}>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={handleClick}
          disabled={!dataToUse || busy}
          aria-label="Imprimir PDF de la historia clínica"
          sx={{
            borderColor: "#00a896",
            color: "#00a896",
            fontWeight: 700,
            borderRadius: 2,
            textTransform: "none",
            fontSize: "1rem",
            px: 3,
            py: 1.5,
            flex: 1,
            boxShadow: "0 4px 12px rgba(0, 168, 150, 0.2)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              borderColor: "#007d6a",
              color: "#007d6a",
              background: "rgba(0, 168, 150, 0.05)",
              boxShadow: "0 6px 16px rgba(0, 168, 150, 0.3)",
            },
            "&:disabled": {
              borderColor: "rgba(0, 0, 0, 0.12)",
              color: "rgba(0, 0, 0, 0.26)",
            },
          }}
        >
          {label}
        </Button>
      </motion.div>
    </Tooltip>
  );
}

export function defaultBuildPdf(data) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = margin;

  doc.setFillColor(10, 60, 120);
  doc.rect(0, 0, pageWidth, 60, "F");
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("HISTORIA CLÍNICA", pageWidth / 2, 38, { align: "center" });
  y += 30;

  const dp = data?.datos_personales || {};
  const dpRows = [
    ["Nombre", dp.nombre ?? "-"],
    ["Apellido", dp.apellido ?? "-"],
    ["Cédula", dp.cédula ?? "-"],
    ["Sexo", dp.sexo ?? "-"],
    ["Tipo de sangre", dp.tipo_sangre ?? "-"],
    ["Fecha nacimiento", dp.fecha_nacimiento ?? "-"],
    ["Edad", dp.edad ?? "-"],
    ["Teléfono", dp.teléfono ?? "-"],
    ["Móvil", dp.móvil ?? "-"],
    ["Fecha consulta", dp.fecha_consulta ?? "-"],
  ];
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Campo", "Valor"]],
    body: dpRows,
    theme: "grid",
    headStyles: { fillColor: [220, 235, 247], textColor: [20, 50, 100], fontStyle: "bold" },
    styles: { fontSize: 11, cellPadding: 4 },
    columnStyles: { 0: { cellWidth: 120, fontStyle: "bold" }, 1: { cellWidth: "auto" } },
  });
  y = doc.lastAutoTable.finalY + 20;

  const addSection = (titulo, texto) => {
    const usableWidth = pageWidth - margin * 2;
    const lineHeight = 14;

    doc.setDrawColor(200);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    doc.setFillColor(220, 235, 247);
    doc.rect(margin, y - lineHeight, usableWidth, lineHeight + 6, "F");
    doc.setTextColor(20, 50, 100);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(titulo, margin + 4, y);
    y += lineHeight + 10;

    doc.setTextColor(0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(texto ?? "-", usableWidth);
    lines.forEach((line) => {
      if (y + lineHeight > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    });
    y += 10;
  };

  addSection(
    "2. Motivo de Consulta",
    `Motivo: ${data?.motivo_consulta?.motivo ?? "-"}\nLugar: ${data?.motivo_consulta?.lugar ?? "-"}`
  );

  addSection(
    "3. Enfermedad Actual",
    `Descripción: ${data?.enfermedad_actual?.descripción ?? "-"}\nTratamiento: ${data?.enfermedad_actual?.tratamiento ?? "-"}\nExámenes: ${data?.enfermedad_actual?.examenes_requeridos ?? "-"}\nDerivación: ${data?.enfermedad_actual?.derivacion_especialista ?? "-"}\nRecomendaciones: ${data?.enfermedad_actual?.recomendaciones ?? "-"}`
  );

  // Ahora posibles_enfermedades es un array, no un objeto
  const peEntries = Array.isArray(data?.posibles_enfermedades) 
    ? data.posibles_enfermedades 
    : [];
  const peTexto = peEntries.length
    ? peEntries
        .map(
          (v, i) =>
            `Posible Enfermedad ${i + 1}: ${v.nombre ?? "-"}\nDescripción: ${v.description ?? "-"}\nTratamiento: ${v.tratamiento ?? "-"}\nExámenes: ${v.examenes_requeridos ?? "-"}\nDerivación: ${v.derivacion_especialista ?? "-"}\nRecomendaciones: ${v.recomendaciones ?? "-"}`
        )
        .join("\n\n")
    : "-";
  addSection("4. Posibles Enfermedades", peTexto);

  addSection(
    "5. Antecedentes",
    `Personales: ${data?.antecedentes?.personales ?? "-"}\nAlergias: ${data?.antecedentes?.alergias ?? "-"}\nMedicamentos: ${data?.antecedentes?.medicamentos ?? "-"}\nFamiliares: ${data?.antecedentes?.familiares ?? "-"}\nQuirúrgicos: ${data?.antecedentes?.intervenciones_quirúrgicas ?? "-"}\nCoagulación: ${data?.antecedentes?.problemas_coagulación ?? "-"}\nAnestésicos: ${data?.antecedentes?.problemas_anestésicos ?? "-"}\nCardiovasculares: ${data?.antecedentes?.problemas_cardiovasculares ?? "-"}\nFuma: ${data?.antecedentes?.fuma ?? "-"}\nAlcohol: ${data?.antecedentes?.alcohol ?? "-"}`
  );

  addSection(
    "6. Signos Vitales",
    `FR: ${data?.signos_vitales?.frecuencia_respiratoria ?? "-"}\nFC: ${data?.signos_vitales?.frecuencia_cardíaca ?? "-"}\nPA: ${data?.signos_vitales?.presión_arterial ?? "-"}\nSat O₂: ${data?.signos_vitales?.saturación_oxígeno ?? "-"}\nTemp: ${data?.signos_vitales?.temperatura_c ?? "-"}`
  );

  const ef = data?.examen_físico || {};
  addSection(
    "7. Examen Físico",
    `Peso (kg): ${ef.peso_kg ?? "-"}\nAltura (cm): ${ef.altura_cm ?? "-"}\nCabeza y cuello: ${ef.cabeza_cuello ?? "-"}\nTórax: ${ef.tórax ?? "-"}\nRSCS: ${ef.rscs ?? "-"}\nAbdomen: ${ef.abdomen ?? "-"}\nExtremidades: ${ef.extremidades ?? "-"}`
  );

  const imc = data?.IMC || {};
  addSection("8. Índice de Masa Corporal", `Valor: ${imc.valor ?? "-"}\nClasificación: ${imc.clasificacion ?? "-"}`);

  doc.addPage();
  y = margin;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("9. Diagnóstico Presuntivo", margin, y);
  doc.text("10. Tratamiento", pageWidth / 2 + margin, y);
  y += 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const dx = doc.splitTextToSize(
    data?.diagnóstico_tratamiento?.diagnóstico_presuntivo ?? "-",
    pageWidth / 2 - margin
  );
  const tx = doc.splitTextToSize(data?.diagnóstico_tratamiento?.tratamiento ?? "-", pageWidth / 2 - margin);
  const maxL = Math.max(dx.length, tx.length);
  for (let i = 0; i < maxL; i++) {
    let posY = y + i * 14;
    if (posY > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
      posY = y + i * 14;
    }
    if (dx[i]) doc.text(dx[i], margin, posY);
    if (tx[i]) doc.text(tx[i], pageWidth / 2 + margin, posY);
  }

  const pageCount = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
      `Página ${p} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 20,
      { align: "center" }
    );
  }

  return doc;
}
