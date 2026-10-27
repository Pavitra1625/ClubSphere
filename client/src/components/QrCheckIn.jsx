import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { CheckCircle2, ScanLine } from "lucide-react";
import api, { errorMessage } from "../services/api";

export default function QrCheckIn({ eventId, onCheckedIn }) {
  const scannerRef = useRef(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!scannerOpen) return undefined;
    const scanner = new Html5QrcodeScanner(`qr-reader-${eventId}`, { fps: 10, qrbox: { width: 230, height: 230 }, rememberLastUsedCamera: true }, false);
    scannerRef.current = scanner;
    scanner.render(async (decodedText) => {
      if (busy) return;
      setBusy(true); setError(""); setResult(null);
      try {
        const { data } = await api.post(`/events/${eventId}/check-in`, { token: decodedText.trim() });
        setResult(data);
        await scanner.clear();
        setScannerOpen(false);
        onCheckedIn?.(data);
      } catch (err) {
        setError(errorMessage(err));
      } finally { setBusy(false); }
    }, () => {});
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [scannerOpen, eventId]);

  return <section className="qr-checkin-panel">
    <div className="qr-checkin-heading"><div><span className="eyebrow">EVENT CHECK-IN</span><h2>Scan attendee QR</h2><p className="page-intro">Use your device camera to verify a registered student and mark attendance.</p></div><ScanLine size={25}/></div>
    {!scannerOpen && <button className="button button-primary" onClick={() => { setResult(null); setError(""); setScannerOpen(true); }}><ScanLine size={16}/> Open QR scanner</button>}
    {scannerOpen && <><div id={`qr-reader-${eventId}`} className="qr-reader"/><button className="button button-ghost" onClick={() => setScannerOpen(false)}>Close scanner</button></>}
    {busy && <p className="small-muted">Verifying QR code…</p>}
    {error && <div className="notice notice-error">{error}</div>}
    {result && <div className="qr-success"><CheckCircle2 size={22}/><div><strong>{result.student?.name} checked in</strong><span>{result.student?.email}</span><small>{result.message}</small></div></div>}
  </section>;
}
