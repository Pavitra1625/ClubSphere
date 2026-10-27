import { CalendarDays, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";

const palette = {
  Technology: "blue", Cultural: "pink", Sports: "green",
  Workshop: "purple", Career: "orange", Other: "gray"
};

export default function EventCard({ event }) {
  const date = new Date(event.startDate);
  const registered = event.registeredCount || 0;
  const percent = Math.min(100, Math.round((registered / event.capacity) * 100));
  return (
    <article className="event-card">
      <div className={`event-art art-${palette[event.category] || "blue"}`}>
        <span className="event-category">{event.category}</span>
        <div className="date-tile"><strong>{date.toLocaleDateString("en-IN", { day: "2-digit" })}</strong><span>{date.toLocaleDateString("en-IN", { month: "short" }).toUpperCase()}</span></div>
        <span className="art-symbol">{event.category === "Technology" ? "⌘" : event.category === "Sports" ? "↗" : event.category === "Cultural" ? "✳" : event.category === "Career" ? "↗" : "✦"}</span>
      </div>
      <div className="event-card-body">
        <p className="eyebrow">{event.clubName}</p>
        <h3>{event.title}</h3>
        <p className="event-description">{event.description}</p>
        <div className="event-meta"><span><CalendarDays size={15}/>{date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span><span><MapPin size={15}/>{event.venue}</span></div>
        <div className="capacity-row"><span><Users size={15}/>{registered} / {event.capacity} registered</span><span>{percent}%</span></div>
        <div className="progress"><span style={{ width: `${percent}%` }}/></div>
        <Link to={`/events/${event._id}`} className="button button-outline full-button">View event <span>↗</span></Link>
      </div>
    </article>
  );
}
