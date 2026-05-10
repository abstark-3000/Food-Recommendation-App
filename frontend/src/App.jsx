import React, { useState, useRef, useEffect } from "react";

const QUICK_TAGS = [
  "onion", "tomato", "garlic", "potato", "chicken",
  "rice", "eggs", "ginger", "paneer", "lentils",
  "spinach", "butter", "cream", "cumin", "chilli"
];

const CUISINES = ["All", "Indian", "Italian", "Asian", "Mexican", "Mediterranean"];

function MatchRing({ pct }) {
  const r = 22, circ = 2 * Math.PI * r;
  const fill = (pct / 100) * circ;
  const color = pct >= 80 ? "#3a7d44" : pct >= 50 ? "#b45309" : "#b91c1c";
  const bg = pct >= 80 ? "#dcfce7" : pct >= 50 ? "#fef3c7" : "#fee2e2";
  return (
    <svg width="56" height="56" viewBox="0 0 56 56">
      <circle cx="28" cy="28" r={r} fill={bg} stroke="none" />
      <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="4" />
      <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 28 28)" style={{ transition: "stroke-dasharray 0.6s ease" }} />
      <text x="28" y="33" textAnchor="middle" fontSize="11" fontWeight="700"
        fill={color} fontFamily="'Space Grotesk', monospace">{pct}%</text>
    </svg>
  );
}

function Chip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "5px 13px", borderRadius: "999px", fontSize: "12px", fontWeight: 500,
      cursor: "pointer",
      border: active ? "1.5px solid #3a7d44" : "1.5px solid #d6d0c4",
      background: active ? "#3a7d44" : "#faf8f4",
      color: active ? "#fff" : "#78716c",
      transition: "all 0.18s", letterSpacing: "0.02em",
    }}>{label}</button>
  );
}

function Tag({ children, variant = "neutral" }) {
  const styles = {
    neutral: { bg: "#f0ebe3", color: "#78716c" },
    have:    { bg: "#dcfce7", color: "#166534" },
    missing: { bg: "#fee2e2", color: "#991b1b" },
  };
  const s = styles[variant];
  return (
    <span style={{
      padding: "3px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 600,
      background: s.bg, color: s.color, display: "inline-block",
    }}>{children}</span>
  );
}

function MatchBadge({ pct }) {
  const color = pct >= 80 ? "#3a7d44" : pct >= 50 ? "#b45309" : "#b91c1c";
  const bg    = pct >= 80 ? "#dcfce7" : pct >= 50 ? "#fef3c7" : "#fee2e2";
  const label = pct >= 80 ? "Great match" : pct >= 50 ? "Partial match" : "Low match";
  return (
    <span style={{
      padding: "3px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 700,
      background: bg, color: color, letterSpacing: "0.03em",
    }}>{label} · {pct}%</span>
  );
}

function RecipeCard({ recipe, selected, onClick, userIngredients }) {
  const pct = Math.round(recipe.similarity);
  const missing = (recipe.missing_ingredients || []).length;
  const total = (recipe.ingredients || []).length;
  const have = total - missing;

  return (
    <div onClick={onClick} style={{
      background: selected ? "#f0fdf4" : "#fff",
      border: selected ? "2px solid #3a7d44" : "1.5px solid #e7e2d9",
      borderRadius: "16px", padding: "20px", cursor: "pointer",
      transition: "all 0.2s", boxShadow: selected ? "0 0 0 4px rgba(58,125,68,0.08)" : "0 1px 3px rgba(0,0,0,0.06)",
    }}
      onMouseEnter={e => { if (!selected) { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"; e.currentTarget.style.borderColor = "#c4bfb5"; }}}
      onMouseLeave={e => { if (!selected) { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)"; e.currentTarget.style.borderColor = "#e7e2d9"; }}}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#1c1917",
            fontFamily: "'Playfair Display', serif", lineHeight: 1.3, marginBottom: "6px" }}>
            {recipe.name}
          </div>
          <MatchBadge pct={pct} />
          <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "4px" }}>
            {(recipe.ingredients || []).slice(0, 4).map((ing, i) => (
              <Tag key={i} variant="neutral">{ing}</Tag>
            ))}
            {(recipe.ingredients || []).length > 4 && (
              <Tag variant="neutral">+{(recipe.ingredients || []).length - 4} more</Tag>
            )}
          </div>
        </div>
        <MatchRing pct={pct} />
      </div>

      {/* Progress bar */}
      <div style={{ marginTop: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
          <span style={{ fontSize: "11px", color: "#a8a29e" }}>
            {have} of {total} ingredients
          </span>
          {missing > 0 && (
            <span style={{ fontSize: "11px", color: "#b91c1c", fontWeight: 600 }}>
              {missing} missing
            </span>
          )}
        </div>
        <div style={{ height: "5px", background: "#f0ebe3", borderRadius: "999px", overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${(have / total) * 100}%`,
            background: pct >= 80 ? "#3a7d44" : pct >= 50 ? "#d97706" : "#b91c1c",
            borderRadius: "999px", transition: "width 0.6s ease",
          }} />
        </div>
      </div>
    </div>
  );
}

function DetailPanel({ recipe, userIngredients, onClose }) {
  const pct = Math.round(recipe.similarity);
  const userSet = new Set(userIngredients.map(i => i.toLowerCase().trim()));
  const total = (recipe.ingredients || []).length;
  const missing = (recipe.missing_ingredients || []).length;
  const have = total - missing;

  return (
    <div style={{
      background: "#fffef9",
      border: "1.5px solid #e7e2d9",
      borderRadius: "20px",
      padding: "0",
      overflow: "hidden",
      boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
    }}>
      {/* Header */}
      <div style={{
        background: pct >= 80 ? "#f0fdf4" : pct >= 50 ? "#fffbeb" : "#fff1f2",
        borderBottom: "1.5px solid #e7e2d9",
        padding: "22px 24px",
        display: "flex", gap: "16px", alignItems: "flex-start",
      }}>
        <MatchRing pct={pct} />
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "22px", fontWeight: 800,
            color: "#1c1917", marginBottom: "4px", lineHeight: 1.2,
          }}>{recipe.name}</div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "6px" }}>
            <MatchBadge pct={pct} />
            <Tag variant="neutral">{total} ingredients</Tag>
            {missing === 0
              ? <Tag variant="have">✓ All in stock</Tag>
              : <Tag variant="missing">{missing} to buy</Tag>}
          </div>
          {/* Progress */}
          <div style={{ marginTop: "12px" }}>
            <div style={{ height: "6px", width: "260px", background: "#e7e2d9", borderRadius: "999px", overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${(have / total) * 100}%`,
                background: pct >= 80 ? "#3a7d44" : pct >= 50 ? "#d97706" : "#b91c1c",
                borderRadius: "999px", transition: "width 0.6s ease",
              }} />
            </div>
            <div style={{ fontSize: "11px", color: "#a8a29e", marginTop: "4px" }}>
              {have} of {total} ingredients available
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{
          background: "#f0ebe3", border: "none",
          borderRadius: "10px", color: "#78716c", cursor: "pointer",
          width: "32px", height: "32px", fontSize: "18px", display: "flex",
          alignItems: "center", justifyContent: "center", flexShrink: 0,
          transition: "background 0.15s",
        }}
          onMouseEnter={e => e.currentTarget.style.background = "#e7e2d9"}
          onMouseLeave={e => e.currentTarget.style.background = "#f0ebe3"}
        >×</button>
      </div>

      {/* Body */}
      <div style={{ padding: "24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {/* Ingredients you have */}
        <div style={{ background: "#f9fdf9", border: "1.5px solid #bbf7d0", borderRadius: "14px", padding: "16px" }}>
          <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.1em",
            color: "#3a7d44", textTransform: "uppercase", marginBottom: "10px",
            display: "flex", alignItems: "center", gap: "6px" }}>
            <span>✓</span> You have ({have})
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {(recipe.ingredients || [])
              .filter(ing => userSet.has(ing.toLowerCase()))
              .map((ing, i) => <Tag key={i} variant="have">{ing}</Tag>)}
            {have === 0 && <span style={{ fontSize: "12px", color: "#a8a29e" }}>None yet</span>}
          </div>
        </div>

        {/* Missing */}
        <div style={{
          background: missing === 0 ? "#f0fdf4" : "#fff8f8",
          border: `1.5px solid ${missing === 0 ? "#bbf7d0" : "#fecaca"}`,
          borderRadius: "14px", padding: "16px",
        }}>
          <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.1em",
            color: missing === 0 ? "#3a7d44" : "#b91c1c", textTransform: "uppercase", marginBottom: "10px",
            display: "flex", alignItems: "center", gap: "6px" }}>
            {missing === 0 ? "✓ Complete" : `✗ Missing (${missing})`}
          </div>
          {missing === 0 ? (
            <span style={{ fontSize: "13px", color: "#3a7d44", fontWeight: 600 }}>
              You have everything!
            </span>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
              {(recipe.missing_ingredients || []).map((ing, i) => (
                <Tag key={i} variant="missing">{ing}</Tag>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div style={{ gridColumn: "1 / -1", background: "#faf8f4", border: "1.5px solid #e7e2d9",
          borderRadius: "14px", padding: "16px" }}>
          <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.1em",
            color: "#78716c", textTransform: "uppercase", marginBottom: "10px" }}>
            Instructions
          </div>
          <div style={{
            fontSize: "13px", color: "#44403c", lineHeight: 1.9,
            maxHeight: "160px", overflowY: "auto",
            whiteSpace: "pre-line", fontFamily: "'Lora', serif",
          }}>
            {recipe.instructions || "No instructions available."}
          </div>
        </div>

        {/* Watch button */}
        <div style={{ gridColumn: "1 / -1" }}>
          <a href={recipe.youtube_link || "#"} target="_blank" rel="noreferrer" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "11px 22px", borderRadius: "10px",
            background: "#dc2626", border: "none",
            color: "#fff", fontSize: "13px", fontWeight: 700, textDecoration: "none",
            transition: "all 0.2s", letterSpacing: "0.02em",
            boxShadow: "0 2px 8px rgba(220,38,38,0.25)",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "#b91c1c"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#dc2626"; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.56V6.8a4.85 4.85 0 01-1.07-.11z"/>
            </svg>
            Watch on YouTube
          </a>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [inputValue, setInputValue] = useState("");
  const [activeChips, setActiveChips] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState("match");
  const [cuisine, setCuisine] = useState("All");
  const [history, setHistory] = useState([]);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef(null);

  const getUserIngredients = () => {
    const fromInput = inputValue.split(",").map(i => i.trim()).filter(Boolean);
    return [...new Set([...fromInput, ...activeChips])];
  };

  const toggleChip = (label) => {
    setActiveChips(prev =>
      prev.includes(label) ? prev.filter(c => c !== label) : [...prev, label]
    );
  };

  const getIngredientCount = () => getUserIngredients().length;

  const getSorted = (list) => {
    const r = [...list];
    if (sort === "match") return r.sort((a, b) => b.similarity - a.similarity);
    if (sort === "az") return r.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "missing") return r.sort((a, b) =>
      (a.missing_ingredients || []).length - (b.missing_ingredients || []).length);
    return r;
  };

  const handleSearch = async () => {
    const ings = getUserIngredients();
    if (!ings.length) return;
    setLoading(true);
    setSearched(true);
    setSelected(null);
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: ings }),
      });
      const data = await response.json();
      setRecipes(data);
      const key = ings.join(", ");
      setHistory(prev => [key, ...prev.filter(h => h !== key)].slice(0, 4));
    } catch (err) {
      console.error(err);
      setRecipes([]);
    }
    setLoading(false);
  };

  const sorted = getSorted(recipes);
  const bestMatch = recipes.length ? Math.max(...recipes.map(r => r.similarity)) : null;
  const ingCount = getIngredientCount();

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f5f0e8",
      color: "#1c1917",
      fontFamily: "'DM Sans', sans-serif",
      display: "grid",
      gridTemplateColumns: "300px 1fr",
      position: "relative",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Lora:wght@400;500&family=DM+Sans:wght@400;500;600&family=Space+Grotesk:wght@500;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #f0ebe3; }
        ::-webkit-scrollbar-thumb { background: #c4bfb5; border-radius: 4px; }
        textarea:focus, input:focus { outline: none; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0%,100% { opacity:0.5; } 50% { opacity:1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.03); } }
        .recipe-card-anim { animation: fadeUp 0.3s ease both; }
      `}</style>

      {/* Subtle texture overlay */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='1' height='1' fill='rgba(0,0,0,0.025)'/%3E%3C/svg%3E")`,
      }} />

      {/* ── SIDEBAR ── */}
      <aside style={{
        borderRight: "1.5px solid #e7e2d9",
        padding: "28px 20px",
        display: "flex", flexDirection: "column", gap: "24px",
        background: "#fffef9",
        position: "relative", zIndex: 1, overflowY: "auto",
        boxShadow: "2px 0 12px rgba(0,0,0,0.04)",
      }}>
        {/* Brand */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "12px",
              background: "#3a7d44",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "20px", boxShadow: "0 2px 8px rgba(58,125,68,0.3)",
            }}>🍽</div>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 800, color: "#1c1917" }}>
                RecipeMatch
              </div>
              <div style={{ fontSize: "10px", color: "#a8a29e", letterSpacing: "0.08em", fontWeight: 600 }}>
                AI-POWERED KITCHEN
              </div>
            </div>
          </div>
        </div>

        <div style={{ height: "1px", background: "#e7e2d9" }} />

        {/* Ingredient Input */}
        <div>
          <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.12em",
            color: "#a8a29e", textTransform: "uppercase", marginBottom: "8px" }}>
            Your Ingredients
          </div>
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="e.g. onion, tomato, garlic…"
            rows={3}
            style={{
              width: "100%", resize: "none", padding: "12px 14px",
              background: "#faf8f4",
              border: "1.5px solid #d6d0c4",
              borderRadius: "12px", color: "#1c1917", fontSize: "13px",
              fontFamily: "'DM Sans', sans-serif",
              transition: "border-color 0.2s",
              lineHeight: 1.6,
            }}
            onFocus={e => e.target.style.borderColor = "#3a7d44"}
            onBlur={e => e.target.style.borderColor = "#d6d0c4"}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSearch())}
          />

          {/* Ingredient count pill */}
          {ingCount > 0 && (
            <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "12px", color: "#3a7d44", fontWeight: 600 }}>
                {ingCount} ingredient{ingCount !== 1 ? "s" : ""} ready
              </span>
            </div>
          )}

          <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
            <button onClick={() => { setInputValue(""); setActiveChips([]); }}
              style={{ padding: "10px 14px", borderRadius: "10px", fontSize: "12px", fontWeight: 600,
                background: "#f0ebe3", border: "1.5px solid #d6d0c4",
                color: "#78716c", cursor: "pointer", transition: "all 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#e7e2d9"}
              onMouseLeave={e => e.currentTarget.style.background = "#f0ebe3"}
            >Clear</button>
            <button onClick={handleSearch} disabled={loading || ingCount === 0}
              style={{ flex: 1, padding: "10px", borderRadius: "10px", fontSize: "13px", fontWeight: 700,
                background: ingCount > 0 ? "#3a7d44" : "#e7e2d9",
                border: "none",
                color: ingCount > 0 ? "#fff" : "#a8a29e",
                cursor: ingCount > 0 ? "pointer" : "not-allowed", transition: "all 0.2s",
                letterSpacing: "0.02em",
                boxShadow: ingCount > 0 ? "0 2px 8px rgba(58,125,68,0.3)" : "none",
              }}
              onMouseEnter={e => { if (ingCount > 0) e.currentTarget.style.background = "#2d6436"; }}
              onMouseLeave={e => { if (ingCount > 0) e.currentTarget.style.background = "#3a7d44"; }}
            >
              {loading ? "Searching…" : "Find Recipes →"}
            </button>
          </div>
        </div>

        {/* Quick add */}
        <div>
          <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.12em",
            color: "#a8a29e", textTransform: "uppercase", marginBottom: "8px" }}>
            Quick Add
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {QUICK_TAGS.map(tag => (
              <Chip key={tag} label={tag} active={activeChips.includes(tag)} onClick={() => toggleChip(tag)} />
            ))}
          </div>
        </div>

        {/* Cuisine */}
        <div>
          <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.12em",
            color: "#a8a29e", textTransform: "uppercase", marginBottom: "8px" }}>
            Cuisine Filter
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {CUISINES.map(c => (
              <Chip key={c} label={c} active={cuisine === c} onClick={() => setCuisine(c)} />
            ))}
          </div>
        </div>

        {/* Match legend */}
        <div style={{ background: "#faf8f4", borderRadius: "12px", padding: "14px", border: "1.5px solid #e7e2d9" }}>
          <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.12em",
            color: "#a8a29e", textTransform: "uppercase", marginBottom: "10px" }}>
            Match Guide
          </div>
          {[
            { color: "#3a7d44", bg: "#dcfce7", label: "80–100%", desc: "Great match" },
            { color: "#b45309", bg: "#fef3c7", label: "50–79%",  desc: "Partial match" },
            { color: "#b91c1c", bg: "#fee2e2", label: "0–49%",   desc: "Low match" },
          ].map(({ color, bg, label, desc }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />
              <span style={{ fontSize: "12px", color: "#78716c" }}>
                <b style={{ color: "#44403c" }}>{label}</b> · {desc}
              </span>
            </div>
          ))}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div>
            <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.12em",
              color: "#a8a29e", textTransform: "uppercase", marginBottom: "8px" }}>
              Recent Searches
            </div>
            {history.map((h, i) => (
              <div key={i} onClick={() => setInputValue(h)}
                style={{ padding: "8px 10px", borderRadius: "8px", fontSize: "12px",
                  color: "#78716c", cursor: "pointer", transition: "all 0.15s",
                  display: "flex", alignItems: "center", gap: "8px" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#f0ebe3"; e.currentTarget.style.color = "#1c1917"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#78716c"; }}
              >
                <span style={{ opacity: 0.5, fontSize: "13px" }}>↺</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h}</span>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* ── MAIN ── */}
      <main style={{
        padding: "32px",
        display: "flex", flexDirection: "column", gap: "24px",
        position: "relative", zIndex: 1, overflowY: "auto", maxHeight: "100vh",
      }}>

        {/* Page title */}
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "30px", fontWeight: 900,
            color: "#1c1917", margin: 0, lineHeight: 1.2 }}>
            What's in your kitchen?
          </h1>
          <p style={{ fontSize: "14px", color: "#a8a29e", margin: "4px 0 0", fontFamily: "'Lora', serif" }}>
            Add your ingredients and discover recipes you can make right now.
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px" }}>
          {[
            { label: "Recipes Found", value: recipes.length || "—", icon: "📋", color: "#3a7d44" },
            { label: "Best Match",    value: bestMatch ? `${Math.round(bestMatch)}%` : "—", icon: "🎯", color: "#b45309" },
            { label: "Ingredients",   value: ingCount || "—", icon: "🧺", color: "#7c3aed" },
          ].map(({ label, value, icon, color }) => (
            <div key={label} style={{
              background: "#fffef9", border: "1.5px solid #e7e2d9",
              borderRadius: "16px", padding: "18px 20px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              display: "flex", alignItems: "center", gap: "14px",
            }}>
              <div style={{ fontSize: "28px", animation: "pulse 3s ease infinite" }}>{icon}</div>
              <div>
                <div style={{
                  fontFamily: "'Space Grotesk', monospace", fontSize: "26px", fontWeight: 700,
                  color, marginBottom: "1px", lineHeight: 1,
                }}>{value}</div>
                <div style={{ fontSize: "11px", color: "#a8a29e", fontWeight: 600, letterSpacing: "0.04em" }}>
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ animation: "fadeUp 0.25s ease" }}>
            <DetailPanel recipe={selected} userIngredients={getUserIngredients()} onClose={() => setSelected(null)} />
          </div>
        )}

        {/* Results header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 800, color: "#1c1917" }}>
              {searched
                ? (loading ? "Searching…" : `${sorted.length} recipe${sorted.length !== 1 ? "s" : ""} found`)
                : "Recommended Recipes"}
            </div>
            {ingCount > 0 && (
              <div style={{ fontSize: "12px", color: "#a8a29e", marginTop: "2px" }}>
                Matching against {ingCount} ingredient{ingCount !== 1 ? "s" : ""}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            {[["match", "Best Match"], ["az", "A–Z"], ["missing", "Fewest Missing"]].map(([val, label]) => (
              <button key={val} onClick={() => setSort(val)} style={{
                padding: "7px 14px", borderRadius: "999px", fontSize: "12px", fontWeight: 600,
                cursor: "pointer",
                border: sort === val ? "1.5px solid #3a7d44" : "1.5px solid #d6d0c4",
                background: sort === val ? "#3a7d44" : "#fffef9",
                color: sort === val ? "#fff" : "#78716c",
                transition: "all 0.15s",
              }}>{label}</button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px",
            color: "#a8a29e", gap: "14px" }}>
            <div style={{ width: "36px", height: "36px",
              border: "3px solid #e7e2d9", borderTopColor: "#3a7d44",
              borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <div style={{ fontSize: "14px", fontFamily: "'Lora', serif", fontStyle: "italic" }}>
              Finding the best recipes for you…
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !searched && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "64px 0", gap: "16px",
            background: "#fffef9", borderRadius: "20px",
            border: "1.5px dashed #d6d0c4",
          }}>
            <div style={{ fontSize: "56px", animation: "shimmer 3s ease infinite" }}>🥘</div>
            <div style={{ fontSize: "17px", fontFamily: "'Playfair Display', serif", color: "#44403c", fontWeight: 700 }}>
              Enter ingredients to discover recipes
            </div>
            <div style={{ fontSize: "13px", color: "#a8a29e", fontFamily: "'Lora', serif", fontStyle: "italic" }}>
              Use the sidebar to add what you have in your kitchen
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap", justifyContent: "center" }}>
              {["onion", "tomato", "garlic", "paneer"].map(tag => (
                <span key={tag} onClick={() => { toggleChip(tag); }}
                  style={{ padding: "6px 14px", borderRadius: "999px", fontSize: "12px", fontWeight: 600,
                    background: "#f0ebe3", color: "#78716c", cursor: "pointer",
                    border: "1.5px solid #d6d0c4", transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#3a7d44"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#3a7d44"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#f0ebe3"; e.currentTarget.style.color = "#78716c"; e.currentTarget.style.borderColor = "#d6d0c4"; }}
                >+ {tag}</span>
              ))}
            </div>
          </div>
        )}

        {!loading && searched && sorted.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "60px 0", gap: "12px",
            background: "#fffef9", borderRadius: "20px", border: "1.5px dashed #d6d0c4",
          }}>
            <div style={{ fontSize: "40px" }}>🔍</div>
            <div style={{ fontSize: "15px", color: "#44403c", fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
              No recipes found
            </div>
            <div style={{ fontSize: "13px", color: "#a8a29e" }}>
              Try adding more common ingredients
            </div>
          </div>
        )}

        {/* Cards grid */}
        {!loading && sorted.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "14px" }}>
            {sorted.map((recipe, i) => (
              <div key={i} className="recipe-card-anim" style={{ animationDelay: `${i * 0.04}s` }}>
                <RecipeCard
                  recipe={recipe}
                  selected={selected?.name === recipe.name}
                  userIngredients={getUserIngredients()}
                  onClick={() => setSelected(selected?.name === recipe.name ? null : recipe)}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}