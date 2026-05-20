const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export async function uploadEegCsv(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/api/eeg/upload`, {
    method: "POST",
    body: formData
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.detail || "Unable to parse the EEG CSV file.");
  }

  return payload;
}
