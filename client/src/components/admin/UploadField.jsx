import { useState } from "react";
import { api } from "../../api.js";

export default function UploadField({
  label,
  value,
  onChange,
  accept = "image/jpeg,image/png,image/webp,image/gif",
  isImage = true,
  hint,
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets her pick the same file again later
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setError("File is too large (4MB max).");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const { url } = await api.upload(file);
      onChange(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="field">
      <span className="field-label">{label}</span>

      {value && isImage && <img src={value} alt="" className="upload-preview" />}
      {value && !isImage && (
        <a href={value} target="_blank" rel="noreferrer">Current file ↗</a>
      )}

      <div className="upload-actions">
        <label className="btn btn-outline btn-sm">
          {busy ? "Uploading…" : value ? "Replace file" : "Choose file"}
          <input type="file" accept={accept} onChange={handleFile} disabled={busy} hidden />
        </label>
        {value && !busy && (
          <button type="button" className="link-btn danger" onClick={() => onChange("")}>
            Remove
          </button>
        )}
      </div>

      {hint && <small className="muted">{hint}</small>}
      {error && <small className="error">{error}</small>}
    </div>
  );
}