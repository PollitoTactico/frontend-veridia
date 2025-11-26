import { Button } from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { getLogger } from "../services/logs";
const log = getLogger("pdf.generate.simple");

const GenerarPDFSimple = ({ data, editedData }) => {
  // Usar editedData si está disponible, si no, usar data original
  const dataToUse = editedData || data;

  const crearPDF = () => {
    try {
      const keys = dataToUse ? Object.keys(dataToUse).length : 0;
      log.info("pdf_generate_simple_start", { keys, useEdited: !!editedData });

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

      // 1. Datos del paciente (tabla)
      const dp = dataToUse.datos_personales || {};
      const dpRows = [
        ["Nombre", dp.nombre || "-"],
        ["Apellido", dp.apellido || "-"],
        ["Cédula", dp.cédula || "-"],
        ["Sexo", dp.sexo || "-"],
        ["Tipo de sangre", dp.tipo_sangre || "-"],
        ["Fecha nacimiento", dp.fecha_nacimiento || "-"],
        ["Edad", dp.edad || "-"],
        ["Teléfono", dp.teléfono || "-"],
        ["Móvil", dp.móvil || "-"],
        ["Fecha consulta", dp.fecha_consulta || "-"],
      ];
      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        head: [["Campo", "Valor"]],
        body: dpRows,
        theme: "grid",
        headStyles: {
          fillColor: [200, 245, 240],
          textColor: [0, 125, 106],
          fontStyle: "bold",
        },
        styles: { fontSize: 11, cellPadding: 4 },
        columnStyles: {
          0: { cellWidth: 120, fontStyle: "bold" },
          1: { cellWidth: "auto" },
        },
      });
      y = doc.lastAutoTable.finalY + 20;

      // Helper: sección con fondo y separación
      const agregarSeccion = (titulo, texto) => {
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
        const lines = doc.splitTextToSize(texto, usableWidth);
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

      // 2. Motivo de Consulta
      agregarSeccion(
        "2. Motivo de Consulta",
        `Motivo: ${dataToUse.motivo_consulta?.motivo || "-"}\nLugar: ${
          dataToUse.motivo_consulta?.lugar || "-"
        }`
      );

      // 3. Descripción de Síntomas (Enfermedad Actual - solo hechos)
      agregarSeccion(
        "3. Descripción de Síntomas",
        dataToUse.enfermedad_actual?.descripción || "-"
      );

      // 4. Antecedentes
      agregarSeccion(
        "4. Antecedentes",
        `Personales: ${dataToUse.antecedentes?.personales || "-"}\nAlergias: ${
          dataToUse.antecedentes?.alergias || "-"
        }\nMedicamentos: ${
          dataToUse.antecedentes?.medicamentos || "-"
        }\nFamiliares: ${dataToUse.antecedentes?.familiares || "-"}\nQuirúrgicos: ${
          dataToUse.antecedentes?.intervenciones_quirúrgicas || "-"
        }\nCoagulación: ${
          dataToUse.antecedentes?.problemas_coagulación || "-"
        }\nAnestésicos: ${
          dataToUse.antecedentes?.problemas_anestésicos || "-"
        }\nCardiovasculares: ${
          dataToUse.antecedentes?.problemas_cardiovasculares || "-"
        }\nFuma: ${dataToUse.antecedentes?.fuma || "-"}\nAlcohol: ${
          dataToUse.antecedentes?.alcohol || "-"
        }`
      );

      // 5. Signos Vitales
      agregarSeccion(
        "5. Signos Vitales",
        `FR: ${dataToUse.signos_vitales?.frecuencia_respiratoria || "-"}\nFC: ${
          dataToUse.signos_vitales?.frecuencia_cardíaca || "-"
        }\nPA: ${dataToUse.signos_vitales?.presión_arterial || "-"}\nSat O₂: ${
          dataToUse.signos_vitales?.saturación_oxígeno || "-"
        }\nTemp: ${dataToUse.signos_vitales?.temperatura_c || "-"}`
      );

      // 6. Examen Físico
      const ef = dataToUse.examen_físico || {};
      agregarSeccion(
        "6. Examen Físico",
        `Peso (kg): ${ef.peso_kg || "-"}\nAltura (cm): ${ef.altura_cm || "-"}\nCabeza y cuello: ${
          ef.cabeza_cuello || "-"
        }\nTórax: ${ef.tórax || "-"}\nRSCS: ${ef.rscs || "-"}\nAbdomen: ${
          ef.abdomen || "-"
        }\nExtremidades: ${ef.extremidades || "-"}`
      );

      // 7. IMC
      const imc = dataToUse.IMC || {};
      if (imc.valor || imc.clasificacion) {
        agregarSeccion(
          "7. Índice de Masa Corporal (IMC)",
          `Valor: ${imc.valor || "-"}\nClasificación: ${imc.clasificacion || "-"}`
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

      // Pie de página
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

      doc.save("Historia_Clinica_Simple.pdf");
      log.info("pdf_generate_simple_done");
    } catch (err) {
      log.error("pdf_generate_simple_failed", { message: String(err) });
    }
  };

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Button
        variant="contained"
        startIcon={<PictureAsPdfIcon />}
        onClick={crearPDF}
        sx={{
          background: "linear-gradient(135deg, #00a896 0%, #007d6a 100%)",
          color: "white",
          fontWeight: 700,
          borderRadius: 2,
          textTransform: "none",
          fontSize: "1rem",
          px: 3,
          py: 1.5,
          flex: 1,
          boxShadow: "0 4px 12px rgba(0, 168, 150, 0.3)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            background: "linear-gradient(135deg, #007d6a 0%, #005d52 100%)",
            boxShadow: "0 6px 16px rgba(0, 168, 150, 0.4)",
          },
        }}
      >
        Descargar PDF
      </Button>
    </motion.div>
  );
};

export default GenerarPDFSimple;
