import { Button } from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { getLogger } from "../services/logs";
const log = getLogger("pdf.generate");

const GenerarPDF = ({ data, editedData }) => {
  // Usar editedData si está disponible, si no, usar data original
  const dataToUse = editedData || data;

  const crearPDF = () => {
    try {
      const keys = dataToUse ? Object.keys(dataToUse).length : 0;
      log.info("pdf_generate_start", { keys, useEdited: !!editedData });

      const doc = new jsPDF({ unit: "pt", format: "letter" });
      const margin = 40;
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = margin;

      // Cabecera
      doc.setFillColor(10, 60, 120);
      doc.rect(0, 0, pageWidth, 60, "F");
      doc.setTextColor(255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("HISTORIA CLÍNICA", pageWidth / 2, 38, { align: "center" });
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
          fillColor: [220, 235, 247],
          textColor: [20, 50, 100],
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

      // 3. Enfermedad Actual
      agregarSeccion(
        "3. Enfermedad Actual",
        `Descripción: ${
          dataToUse.enfermedad_actual?.descripción || "-"
        }\nTratamiento: ${
          dataToUse.enfermedad_actual?.tratamiento || "-"
        }\nExámenes: ${
          dataToUse.enfermedad_actual?.examenes_requeridos || "-"
        }\nDerivación: ${
          dataToUse.enfermedad_actual?.derivacion_especialista || "-"
        }\nRecomendaciones: ${dataToUse.enfermedad_actual?.recomendaciones || "-"}`
      );

      // 4. Posibles Enfermedades (numeradas)
      // Ahora posibles_enfermedades es un array, no un objeto
      const peEntries = Array.isArray(dataToUse.posibles_enfermedades) 
        ? dataToUse.posibles_enfermedades 
        : [];
      const peTexto = peEntries.length
        ? peEntries
            .map(
              (v, idx) =>
                `Posible Enfermedad ${idx + 1}: ${
                  v.nombre || "-"
                }\nDescripción: ${
                  v.description || "-"
                }\nTratamiento: ${v.tratamiento || "-"}\nExámenes: ${
                  v.examenes_requeridos || "-"
                }\nDerivación: ${
                  v.derivacion_especialista || "-"
                }\nRecomendaciones: ${v.recomendaciones || "-"}`
            )
            .join("\n\n")
        : "-";
      agregarSeccion("4. Posibles Enfermedades", peTexto);

      // 5. Antecedentes
      agregarSeccion(
        "5. Antecedentes",
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

      // 6. Signos Vitales
      agregarSeccion(
        "6. Signos Vitales",
        `FR: ${dataToUse.signos_vitales?.frecuencia_respiratoria || "-"}\nFC: ${
          dataToUse.signos_vitales?.frecuencia_cardíaca || "-"
        }\nPA: ${dataToUse.signos_vitales?.presión_arterial || "-"}\nSat O₂: ${
          dataToUse.signos_vitales?.saturación_oxígeno || "-"
        }\nTemp: ${dataToUse.signos_vitales?.temperatura_c || "-"}`
      );

      // 7. Diagnóstico y Tratamiento lado a lado
      doc.addPage();
      y = margin;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("7. Diagnóstico Presuntivo", margin, y);
      doc.text("8. Tratamiento", pageWidth / 2 + margin, y);
      y += 20;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      const dx = doc.splitTextToSize(
        dataToUse.diagnóstico_tratamiento?.diagnóstico_presuntivo || "-",
        pageWidth / 2 - margin
      );
      const tx = doc.splitTextToSize(
        dataToUse.diagnóstico_tratamiento?.tratamiento || "-",
        pageWidth / 2 - margin
      );
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

      doc.save("Historia_Clinica.pdf");
      log.info("pdf_generate_done");
    } catch (err) {
      log.error("pdf_generate_failed", { message: String(err) });
    }
  };

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Button
        variant="contained"
        startIcon={<PictureAsPdfIcon />}
        onClick={crearPDF}
        sx={{
          background: "linear-gradient(135deg, #0066cc 0%, #0052a3 100%)",
          color: "white",
          fontWeight: 700,
          borderRadius: 2,
          textTransform: "none",
          fontSize: "1rem",
          px: 3,
          py: 1.5,
          flex: 1,
          boxShadow: "0 4px 12px rgba(0, 102, 204, 0.3)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            background: "linear-gradient(135deg, #0052a3 0%, #003d7a 100%)",
            boxShadow: "0 6px 16px rgba(0, 102, 204, 0.4)",
          },
        }}
      >
        Descargar PDF
      </Button>
    </motion.div>
  );
};

export default GenerarPDF;
