import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../services/api";

export default function Auth({ mode }) {
  const isRegister = mode === "register";
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault(); setBusy(true); setError("");
    try {
      if (isRegister) await register({ name, email, password });
      else await login({ email, password });
      navigate("/", { replace: true });
    } catch (err) { setError(errorMessage(err)); }
    finally { setBusy(false); }
  }

  return <main className="auth-page">
    <div className="auth-decoration"><div className="auth-decoration-inner"><span className="hero-kicker"><Sparkles size={14}/> YOUR CAMPUS, MORE CONNECTED</span><h1>Find the<br/><em>people &</em><br/>moments that<br/>make it yours.</h1><p>One campus. A thousand possibilities. Your next story starts here.</p><div className="auth-decoration-mark">✳</div></div></div>
    <div className="auth-form-wrap">
      <Link to="/" className="brand auth-brand"><span className="brand-mark"><CalendarDays size={21}/></span>Club<span className="brand-accent">Sphere</span></Link>
      <div className="auth-form-card"><span className="eyebrow">{isRegister ? "JOIN THE COMMUNITY" : "WELCOME BACK"}</span><h2>{isRegister ? "Create your account" : "Good to see you."}</h2><p>{isRegister ? "Your campus life is about to get a little more interesting." : "Log in to pick up where your campus story left off."}</p>
        <form onSubmit={submit}>
          {isRegister && <label>Full name<input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Pavitra Patel" maxLength={80}/></label>}
          <label>Email address<input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@college.edu"/></label>
          <label>Password<input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters"/></label>
          {error && <div className="notice notice-error">{error}</div>}
          <button className="button button-primary auth-submit" disabled={busy}>{busy ? "Please wait…" : isRegister ? "Create account" : "Log in"} <ArrowRight size={17}/></button>
        </form>
        <div className="auth-switch">{isRegister ? "Already part of the community?" : "New to ClubSphere?"} <Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Log in" : "Create account"}</Link></div>
      </div>
      <span className="auth-footnote">Built for the moments between classes.</span>
    </div>
  </main>;
}
