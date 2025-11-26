import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function buildSimplePdf(data) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = margin;

  // Cabecera
  doc.setFillColor(0, 168, 150);
  doc.rect(0, 0, pageWidth, 60, "F");
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("HISTORIA CLÍNICA - ANÁLISIS SIMPLE", pageWidth / 2, 38, { align: "center" });
  y += 30;

  // Datos del paciente
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
    headStyles: { fillColor: [200, 245, 240], textColor: [0, 125, 106], fontStyle: "bold" },
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

    doc.setFillColor(200, 245, 240);
    doc.rect(margin, y - lineHeight, usableWidth, lineHeight + 6, "F");
    doc.setTextColor(0, 125, 106);
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
    "3. Descripción de Síntomas",
    data?.enfermedad_actual?.descripción ?? "-"
  );

  addSection(
    "4. Antecedentes",
    `Personales: ${data?.antecedentes?.personales ?? "-"}\nAlergias: ${data?.antecedentes?.alergias ?? "-"}\nMedicamentos: ${data?.antecedentes?.medicamentos ?? "-"}\nFamiliares: ${data?.antecedentes?.familiares ?? "-"}\nQuirúrgicos: ${data?.antecedentes?.intervenciones_quirúrgicas ?? "-"}\nCoagulación: ${data?.antecedentes?.problemas_coagulación ?? "-"}\nAnestésicos: ${data?.antecedentes?.problemas_anestésicos ?? "-"}\nCardiovasculares: ${data?.antecedentes?.problemas_cardiovasculares ?? "-"}\nFuma: ${data?.antecedentes?.fuma ?? "-"}\nAlcohol: ${data?.antecedentes?.alcohol ?? "-"}`
  );

  addSection(
    "5. Signos Vitales",
    `FR: ${data?.signos_vitales?.frecuencia_respiratoria ?? "-"}\nFC: ${data?.signos_vitales?.frecuencia_cardíaca ?? "-"}\nPA: ${data?.signos_vitales?.presión_arterial ?? "-"}\nSat O₂: ${data?.signos_vitales?.saturación_oxígeno ?? "-"}\nTemp: ${data?.signos_vitales?.temperatura_c ?? "-"}`
  );

  const ef = data?.examen_físico || {};
  addSection(
    "6. Examen Físico",
    `Peso (kg): ${ef.peso_kg ?? "-"}\nAltura (cm): ${ef.altura_cm ?? "-"}\nCabeza y cuello: ${ef.cabeza_cuello ?? "-"}\nTórax: ${ef.tórax ?? "-"}\nRSCS: ${ef.rscs ?? "-"}\nAbdomen: ${ef.abdomen ?? "-"}\nExtremidades: ${ef.extremidades ?? "-"}`
  );

  const imc = data?.IMC || {};
  if (imc.valor || imc.clasificacion) {
    addSection(
      "7. Índice de Masa Corporal (IMC)",
      `Valor: ${imc.valor ?? "-"}\nClasificación: ${imc.clasificacion ?? "-"}`
    );
  }

  // Nota informativa
  if (y > doc.internal.pageSize.getHeight() - 100) {
    doc.addPage();
    y = margin;
  }
  doc.setFillColor(255, 243, 224);
  doc.rect(margin, y, pageWidth - margin * 2, 60, "F");
  doc.setTextColor(230, 126, 34);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("NOTA:", margin + 10, y + 15);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0);
  const noteText = "Este documento contiene únicamente datos extraídos de la consulta médica. No incluye diagnósticos presuntivos, recomendaciones de tratamiento ni posibles enfermedades.";
  const noteLines = doc.splitTextToSize(noteText, pageWidth - margin * 2 - 20);
  noteLines.forEach((line, idx) => {
    doc.text(line, margin + 10, y + 30 + idx * 12);
  });

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
