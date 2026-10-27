import { useEffect, useState } from "react";
import { CalendarDays, MapPin, QrCode, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import api, { errorMessage } from "../services/api";

export default function StudentDashboard() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedQr, setExpandedQr] = useState(null);

  useEffect(() => {
    let active = true;
    api.get("/registrations/mine")
      .then(({ data }) => {
        if (active) setRegistrations((data.registrations || []).filter((registration) => registration.event && registration.status !== "cancelled"));
      })
      .catch((err) => { if (active) setError(errorMessage(err)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!expandedQr) return undefined;
    function onKeyDown(event) {
      if (event.key === "Escape") setExpandedQr(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [expandedQr]);

  return <main className="content-page student-dashboard-page">
    <h1 className="page-title">Your event <span>QR codes.</span></h1>
    {error && <div className="notice notice-error">{error}</div>}
    {loading ? <div className="empty-state">Loading your QR codes…</div> : registrations.length ? <div className="simple-list student-qr-list">
      {registrations.map((registration) => {
        const event = registration.event;
        const token = registration.checkInToken || registration._id;
        const startDate = event.startDate ? new Date(event.startDate) : null;
        return <article className="simple-list-item student-qr-item" key={registration._id}>
          {startDate && <div className="simple-date"><strong>{startDate.getDate()}</strong><span>{startDate.toLocaleString("en-IN", { month: "short" })}</span></div>}
          <div className="simple-list-copy">
            <h3>{event.title}</h3>
            <p>{event.clubName || event.category}</p>
            <span><CalendarDays size={14}/>{startDate ? startDate.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Date to be announced"}</span>
            <span><MapPin size={14}/>{event.venue}</span>
          </div>
          <button type="button" className="registration-qr" aria-label={`Expand QR code for ${event.title}`} onClick={() => setExpandedQr(registration)}>
            <QRCodeSVG value={token} size={86} level="M" includeMargin />
            <span><QrCode size={12}/> Click to enlarge</span>
          </button>
        </article>;
      })}
    </div> : !error && <div className="empty-state"><h3>No active event QR codes</h3><p>Your QR codes will appear here after you register for an approved event.</p></div>}

    {expandedQr && <div className="qr-modal-backdrop" role="presentation" onClick={() => setExpandedQr(null)}>
      <section className="qr-modal" role="dialog" aria-modal="true" aria-labelledby="expanded-qr-title" onClick={(event) => event.stopPropagation()}>
        <button className="qr-modal-close" type="button" aria-label="Close enlarged QR code" onClick={() => setExpandedQr(null)}><X size={21}/></button>
        <span className="eyebrow">EVENT ENTRY PASS</span>
        <h2 id="expanded-qr-title">{expandedQr.event.title}</h2>
        <p>{expandedQr.event.venue}</p>
        {expandedQr.event.startDate && <p>{new Date(expandedQr.event.startDate).toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" })}</p>}
        <div className="registration-qr-large"><QRCodeSVG value={expandedQr.checkInToken || expandedQr._id} size={260} level="H" includeMargin /></div>
        <strong className="qr-modal-hint">Show this QR code to the event organizer at check-in.</strong>
        <button className="button button-primary qr-modal-done" type="button" onClick={() => setExpandedQr(null)}>Done</button>
      </section>
    </div>}
  </main>;
}
