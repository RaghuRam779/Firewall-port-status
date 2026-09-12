import PDFDocument from "pdfkit";
import { Response } from "express";
import { IScan } from "../models/Scan";

export function scanToJSON(scan: IScan) {
  return {
    id: scan._id,
    target: scan.target,
    status: scan.status,
    command: scan.command,
    ports: scan.ports,
    hostUp: scan.hostUp,
    osGuess: scan.osGuess,
    latencyMs: scan.latencyMs,
    firewallDetected: scan.firewallDetected,
    riskScore: scan.riskScore,
    recommendations: scan.recommendations,
    durationMs: scan.durationMs,
    createdAt: scan.createdAt,
    completedAt: scan.completedAt
  };
}

export function scanToCSV(scan: IScan): string {
  const header = "port,protocol,state,service,version,risk";
  const csvCell = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const rows = scan.ports.map(
    (p) => `${p.port},${p.protocol},${p.state},${csvCell(p.service)},${csvCell(p.version)},${p.risk}`
  );
  return [header, ...rows].join("\n");
}

export function streamScanPDF(scan: IScan, res: Response): void {
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="scan-${scan._id}.pdf"`);
  doc.pipe(res);

  doc.fontSize(20).text("Firewall Port Status Checker - Scan Report", { underline: true });
  doc.moveDown();

  doc.fontSize(12).text(`Target: ${scan.target}`);
  doc.text(`Scan date: ${scan.createdAt.toISOString()}`);
  doc.text(`Duration: ${scan.durationMs} ms`);
  doc.text(`Firewall detected: ${scan.firewallDetected ? "Yes" : "No"}`);
  doc.text(`Risk score: ${scan.riskScore} / 100`);
  if (scan.osGuess) doc.text(`OS guess: ${scan.osGuess}`);
  doc.moveDown();

  doc.fontSize(14).text("Open / Closed / Filtered Ports", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10);
  scan.ports.forEach((p) => {
    doc.text(
      `${p.port}/${p.protocol}  ${p.state.padEnd(8)}  ${p.service.padEnd(12)}  ${p.version.padEnd(20)}  risk: ${p.risk}`
    );
  });

  doc.moveDown();
  doc.fontSize(14).text("Recommendations", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10);
  scan.recommendations.forEach((r) => doc.text(`- ${r}`));

  doc.moveDown();
  doc
    .fontSize(8)
    .fillColor("gray")
    .text(
      "This report was generated for a target the requesting user attested they own or are explicitly authorized to test."
    );

  doc.end();
}
