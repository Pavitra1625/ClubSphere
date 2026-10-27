import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Users, CalendarDays, CheckCircle2, XCircle } from "lucide-react";
import api, { errorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";

export function ManageEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const load = () => api.get("/events/manage").then(({ data }) => setEvents(data.events)).catch(err => setError(errorMessage(err)));
  useEffect(() => { load(); }, []);
  return <main className="content-page"><div className="manage-heading"><div><span className="eyebrow">YOUR ORGANIZER SPACE</span><h1 className="page-title">Organizer dashboard<span>.</span></h1><p className="page-intro">Create events, track registrations, and manage your campus activities.</p></div><Link className="button button-primary" to="/manage/new"><Plus size={17}/> Create event</Link></div>
    {error && <div className="notice notice-error">{error}</div>}
    <div className="manage-stats"><div><CalendarDays/><span><strong>{events.length}</strong><small>Total events</small></span></div><div><Users/><span><strong>{events.reduce((n,e) => n + (e.registeredCount || 0),0)}</strong><small>Registrations</small></span></div><div><CheckCircle2/><span><strong>{events.filter(e => e.status === "approved").length}</strong><small>Approved</small></span></div></div>
    {events.length ? <div className="manage-table"><div className="table-head organizer-table-head"><span>EVENT</span><span>DATE</span><span>REGISTRATIONS</span><span>STATUS</span></div>{events.map(e => <div className="table-row organizer-table-row" key={e._id}><div><Link to={`/events/${e._id}`}><strong>{e.title}</strong></Link><small>{e.clubName} · {e.category}</small></div><span>{new Date(e.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span><span>{e.registeredCount || 0} / {e.capacity}</span><span className={`status status-${e.status}`}>{e.status}</span></div>)}</div> : <div className="empty-state"><h3>Your first event starts here.</h3><p>Create an event and invite your campus community.</p><Link className="button button-primary" to="/manage/new">Create event</Link></div>}

  </main>;
}

export function EventForm() {
  const [form, setForm] = useState({ title:"", description:"", category:"Technology", venue:"", startDate:"", registrationDeadline:"", capacity:50, clubName:"" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setError(""); setSuccess(""); setBusy(true);
    try {
      const payload = { ...form, capacity: Number(form.capacity), startDate: new Date(form.startDate).toISOString(), registrationDeadline: new Date(form.registrationDeadline).toISOString() };
      const { data } = await api.post("/events", payload);
      setSuccess(data.message);
      setForm({ title:"", description:"", category:"Technology", venue:"", startDate:"", registrationDeadline:"", capacity:50, clubName:"" });
    } catch (err) { setError(errorMessage(err)); }
    finally { setBusy(false); }
  }
  const field = (key, label, type="text", required=true) => <label>{label}<input type={type} required={required} value={form[key]} onChange={e => setForm(prev => ({...prev, [key]:e.target.value}))}/></label>;
  return <main className="content-page form-page"><span className="eyebrow">MAKE IT HAPPEN</span><h1 className="page-title">Create an event<span>.</span></h1><p className="page-intro">Give your campus something to look forward to.</p>
    <form className="event-form" onSubmit={submit}>
      {field("title","Event title")}
      <label>Category<select value={form.category} onChange={e => setForm(p => ({...p, category:e.target.value}))}>{["Technology","Cultural","Sports","Workshop","Career","Other"].map(c => <option key={c}>{c}</option>)}</select></label>
      {field("clubName","Club / organizing team")}
      {field("venue","Venue")}
      <label>Description<textarea required maxLength={3000} rows={4} value={form.description} onChange={e => setForm(p => ({...p, description:e.target.value}))}/></label>
      {field("startDate","Event date & time","datetime-local")}
      {field("registrationDeadline","Registration deadline","datetime-local")}
      {field("capacity","Maximum participants","number")}
      {error && <div className="notice notice-error">{error}</div>}{success && <div className="notice notice-success">{success}</div>}
      <button disabled={busy} className="button button-primary">{busy ? "Creating…" : "Create event"} <Plus size={17}/></button>
    </form>
  </main>;
}

export function AdminPage() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const load = () => api.get("/events/manage").then(({ data }) => setEvents(data.events)).catch(err => setError(errorMessage(err)));
  useEffect(() => {
    load();
  }, []);
  async function moderate(id, status) {
    try { await api.patch(`/events/${id}/approve`, { status }); load(); }
    catch (err) { setError(errorMessage(err)); }
  }
  return <main className="content-page"><span className="eyebrow">PLATFORM CONTROL</span><h1 className="page-title">Admin dashboard<span>.</span></h1><p className="page-intro">Review submissions and keep campus activities safe and organized.</p>
    {error && <div className="notice notice-error">{error}</div>}
    <div className="manage-stats"><div><CalendarDays/><span><strong>{events.length}</strong><small>All events</small></span></div><div><CheckCircle2/><span><strong>{events.filter(e => e.status === "approved").length}</strong><small>Approved</small></span></div><div><Users/><span><strong>{events.filter(e => e.status === "pending").length}</strong><small>Awaiting review</small></span></div></div>
    <h2 className="section-title">Events awaiting approval</h2><div className="review-list">{events.filter(e => e.status === "pending").map(e => <article className="review-card" key={e._id}><div><span className="event-category inline-category">{e.category}</span><h3>{e.title}</h3><p>{e.clubName} · {e.venue}</p><small>{new Date(e.startDate).toLocaleString("en-IN")}</small></div><div className="review-actions"><button className="button button-primary" onClick={() => moderate(e._id, "approved")}><CheckCircle2 size={16}/> Approve</button><button className="button button-outline" onClick={() => moderate(e._id, "rejected")}><XCircle size={16}/> Reject</button></div></article>)}</div>
    {!events.some(e => e.status === "pending") && <div className="empty-state"><h3>You're all caught up.</h3><p>No events are waiting for review.</p></div>}

  </main>;
}
