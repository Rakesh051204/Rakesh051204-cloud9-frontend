import jsPDF from "jspdf";

export function exportAnswerAsPDF(title, content) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 48;
  let y = 64;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(title || "Stoic Answer", marginX, y);
  y += 28;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const lines = doc.splitTextToSize(content, 500);
  lines.forEach((line) => {
    if (y > 760) { doc.addPage(); y = 64; }
    doc.text(line, marginX, y);
    y += 16;
  });

  doc.save(`${(title || "stoic-answer").replace(/\s+/g, "-").toLowerCase()}.pdf`);
}
