import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock, MapPin, Users, Mail } from "lucide-react";
import api, { errorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import QrCheckIn from "../components/QrCheckIn";

export default function EventDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [participants, setParticipants] = useState([]);
  const [participantsError, setParticipantsError] = useState("");
  const [participantsLoading, setParticipantsLoading] = useState(false);

  useEffect(() => {
    setEvent(null);
    api.get(`/events/${id}`).then(({ data }) => setEvent(data.event)).catch(err => setError(errorMessage(err)));
  }, [id]);

  useEffect(() => {
    if (!event || !["admin", "organizer"].includes(user?.role)) return;
    let active = true;
    setParticipantsLoading(true);
    api.get(`/events/${id}/registrations`)
      .then(({ data }) => { if (active) setParticipants(data.registrations || []); })
      .catch(err => { if (active) setParticipantsError(errorMessage(err)); })
      .finally(() => { if (active) setParticipantsLoading(false); });
    return () => { active = false; };
  }, [event, id, user?.role]);

  async function register() {
    if (!user) return navigate("/login", { state: { from: `/events/${id}` } });
    setBusy(true); setError(""); setMessage("");
    try { const { data } = await api.post(`/events/${id}/register`); setMessage(data.message); setEvent(prev => ({ ...prev, registeredCount: prev.registeredCount + 1 })); window.dispatchEvent(new Event("notifications-updated")); }
    catch (err) { setError(errorMessage(err)); }
    finally { setBusy(false); }
  }

  if (error && !event) return <main className="content-page"><Link to="/" className="back-link"><ArrowLeft size={16}/> Back to events</Link><div className="notice notice-error">{error}</div></main>;
  if (!event) return <div className="page-loader">Loading event…</div>;
  const date = new Date(event.startDate);
  return <main className="content-page detail-page">
    <Link to="/" className="back-link"><ArrowLeft size={16}/> Back to events</Link>
    <div className={`detail-banner art-${event.category === "Cultural" ? "pink" : event.category === "Sports" ? "green" : event.category === "Workshop" ? "purple" : event.category === "Career" ? "orange" : "blue"}`}><span className="event-category">{event.category}</span><span className="detail-banner-symbol">✳</span><div><span className="eyebrow">PRESENTED BY {event.clubName.toUpperCase()}</span><h1>{event.title}</h1></div></div>
    <div className="detail-layout"><section className="detail-copy"><span className="eyebrow">ABOUT THIS EVENT</span><p className="detail-description">{event.description}</p><h3>What you need to know</h3><div className="detail-info"><div><CalendarDays/><span><small>DATE & TIME</small><strong>{date.toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" })}</strong></span></div><div><MapPin/><span><small>LOCATION</small><strong>{event.venue}</strong></span></div><div><Clock/><span><small>REGISTRATION DEADLINE</small><strong>{new Date(event.registrationDeadline).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</strong></span></div></div></section>
      <aside className="registration-panel"><span className="eyebrow">SAVE YOUR SPOT</span><h2>Be part of it.</h2><p>Meet people, learn something, and make a memory worth keeping.</p><div className="seats-number"><Users size={18}/><strong>{event.capacity - (event.registeredCount || 0)}</strong><span>seats remaining</span></div><div className="progress"><span style={{ width: `${Math.min(100, (event.registeredCount || 0) / event.capacity * 100)}%` }}/></div>
        {user?.role === "student" ? <button disabled={busy || event.registeredCount >= event.capacity} onClick={register} className="button button-primary full-button">{busy ? "Registering…" : event.registeredCount >= event.capacity ? "Event full" : "Register for event"} <span>→</span></button> : !user ? <button onClick={register} className="button button-primary full-button">Log in to register <span>→</span></button> : <p className="small-muted">Organizer/admin accounts cannot register as students.</p>}
        {message && <div className="notice notice-success">{message}</div>}{error && <div className="notice notice-error">{error}</div>}
      </aside></div>
    {["admin", "organizer"].includes(user?.role) && <QrCheckIn eventId={id} onCheckedIn={() => api.get(`/events/${id}/registrations`).then(({ data }) => setParticipants(data.registrations || [])).catch(() => {})} />}
    {["admin", "organizer"].includes(user?.role) && <section className="participants-panel event-participants-panel">
      <div className="participants-heading"><div><span className="eyebrow">EVENT PARTICIPANTS</span><h2>Registered students</h2><p className="page-intro">Names and email addresses for this event only.</p></div><span className="participant-count">{participants.length} registered</span></div>
      {participantsLoading && <p className="small-muted">Loading registered students…</p>}
      {participantsError && <div className="notice notice-error">{participantsError}</div>}
      {!participantsLoading && !participantsError && participants.length === 0 && <div className="empty-state"><h3>No registrations yet</h3><p>Student names will appear here after they register for this event.</p></div>}
      {!participantsLoading && participants.length > 0 && <div className="manage-table"><div className="table-head participant-table-head"><span>STUDENT NAME</span><span>EMAIL</span><span>REGISTERED ON</span><span>ATTENDANCE</span></div>{participants.map(r => <div className="table-row participant-table-row" key={r._id}><strong>{r.student?.name || "Student"}</strong><span className="participant-email"><Mail size={13}/>{r.student?.email || "Email unavailable"}</span><span>{new Date(r.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}</span><span className={`attendance-pill attendance-${r.attendanceStatus || "not-marked"}`}>{r.attendanceStatus === "attended" ? "Attended" : "Not marked"}</span></div>)}</div>}
    </section>}
  </main>;
}
