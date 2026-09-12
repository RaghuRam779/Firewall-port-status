import { api } from "./api";

export async function downloadReport(scanId: string, format: "pdf" | "csv" | "json") {
  const response = await api.get(`/report/export/${format}/${scanId}`, {
    responseType: "blob"
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `scan-${scanId}.${format}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
