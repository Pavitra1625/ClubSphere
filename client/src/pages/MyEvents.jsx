import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, MapPin, QrCode, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import api, { errorMessage } from "../services/api";

export default function MyEvents() {
  const [registrations, setRegistrations] = useState([]);
  const [error, setError] = useState("");
  const [expandedQr, setExpandedQr] = useState(null);
  useEffect(() => { api.get("/registrations/mine").then(({ data }) => setRegistrations(data.registrations)).catch(err => setError(errorMessage(err))); }, []);
  return <main className="content-page">
    <span className="eyebrow">YOUR CAMPUS PLANS</span>
    <h1 className="page-title">My registrations<span>.</span></h1>
    <p className="page-intro">All the things you said yes to, in one place.</p>
    {error && <div className="notice notice-error">{error}</div>}
    {registrations.length ? <div className="simple-list">{registrations.map(reg => <Link to={`/events/${reg.event._id}`} className="simple-list-item" key={reg._id}>
      <div className="simple-date"><strong>{new Date(reg.event.startDate).getDate()}</strong><span>{new Date(reg.event.startDate).toLocaleString("en-IN", { month: "short" })}</span></div>
      <div className="simple-list-copy"><h3>{reg.event.title}</h3><p>{reg.event.clubName} · {reg.event.category}</p><span><MapPin size={14}/>{reg.event.venue}</span><small className={`attendance-pill attendance-${reg.attendanceStatus || "not-marked"}`}>{reg.attendanceStatus === "attended" ? "Attendance confirmed" : "Not checked in yet"}</small></div>
      <div className="registration-qr" role="button" tabIndex={0} aria-label={`Expand entry QR for ${reg.event.title}`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpandedQr(reg); }} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); setExpandedQr(reg); } }}>
        <QRCodeSVG value={reg.checkInToken || reg._id} size={86} level="M" includeMargin/><span><QrCode size={12}/> Click to enlarge</span>
      </div>
    </Link>)}</div> : !error && <div className="empty-state"><h3>Your calendar is wide open.</h3><p>Explore events and register for something that sparks your interest.</p><Link className="button button-primary" to="/">Explore events</Link></div>}
    {expandedQr && <div className="qr-modal-backdrop" role="presentation" onClick={() => setExpandedQr(null)}>
      <section className="qr-modal" role="dialog" aria-modal="true" aria-labelledby="expanded-qr-title" onClick={(e) => e.stopPropagation()}>
        <button className="qr-modal-close" type="button" aria-label="Close enlarged QR code" onClick={() => setExpandedQr(null)}><X size={21}/></button>
        <span className="eyebrow">EVENT ENTRY PASS</span>
        <h2 id="expanded-qr-title">{expandedQr.event.title}</h2>
        <p>{expandedQr.event.venue}</p>
        <div className="registration-qr-large"><QRCodeSVG value={expandedQr.checkInToken || expandedQr._id} size={260} level="H" includeMargin/></div>
        <strong className="qr-modal-hint">Show this QR code to the event organizer at check-in.</strong>
        <button className="button button-primary qr-modal-done" type="button" onClick={() => setExpandedQr(null)}>Done</button>
      </section>
    </div>}
  </main>;
}
