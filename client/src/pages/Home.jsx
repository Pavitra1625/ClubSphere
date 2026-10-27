import { useEffect, useState } from "react";
import { Search, CalendarDays } from "lucide-react";
import api, { errorMessage } from "../services/api";
import EventCard from "../components/EventCard";

const categories = ["All", "Technology", "Cultural", "Sports", "Workshop", "Career", "Other"];

export default function Home() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("soonest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.get("/events", { params: { search, category, sort } })
      .then(({ data }) => { if (active) { setEvents(data.events || []); setError(""); } })
      .catch((err) => { if (active) setError(errorMessage(err)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [search, category, sort]);

  return <main className="content-page explore-page" id="events">
    <div className="section-heading">
      <div><span className="eyebrow">THE CAMPUS CALENDAR</span><h1 className="page-title">Explore <span>events.</span></h1><p className="page-intro">Discover club activities, workshops, competitions, and campus events in one place.</p></div>
      <div className="event-total"><CalendarDays size={19} style={{ display: "inline", verticalAlign: "-4px", marginRight: 7 }}/>{events.length.toString().padStart(2, "0")}<span>events found</span></div>
    </div>
    <div className="filter-panel">
      <div className="search-box"><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events, clubs, venues…" aria-label="Search events"/></div>
      <select value={sort} onChange={e => setSort(e.target.value)} aria-label="Sort events"><option value="soonest">Soonest first</option><option value="latest">Recently added</option></select>
    </div>
    <div className="category-list">{categories.map(c => <button key={c} onClick={() => setCategory(c)} className={`category-chip ${category === c ? "active" : ""}`}>{c}</button>)}</div>
    {error && <div className="notice notice-error">{error} Make sure the backend is running and MongoDB Atlas is configured.</div>}
    {loading ? <div className="empty-state">Loading campus events…</div> : events.length ? <div className="event-grid">{events.map(event => <EventCard key={event._id} event={event}/>)}</div> : <div className="empty-state"><span className="empty-icon">✳</span><h3>No events found just yet</h3><p>Try another category or search term. New campus activities will appear here once approved.</p></div>}
  </main>;
}
