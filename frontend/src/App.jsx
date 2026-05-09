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
  const color = pct >= 80 ? "#4ade80" : pct >= 50 ? "#facc15" : "#f87171";
  return (
    <svg width="56" height="56" viewBox="0 0 56 56">
      <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
      <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 28 28)" style={{ transition: "stroke-dasharray 0.6s ease" }} />
      <text x="28" y="33" textAnchor="middle" fontSize="11" fontWeight="700"
        fill={color} fontFamily="'DM Mono', monospace">{pct}%</text>
    </svg>
  );
}

function Chip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "5px 13px", borderRadius: "999px", fontSize: "12px", fontWeight: 500,
      cursor: "pointer", border: active ? "1.5px solid #a3e635" : "1px solid rgba(255,255,255,0.12)",
      background: active ? "rgba(163,230,53,0.15)" : "rgba(255,255,255,0.04)",
      color: active ? "#a3e635" : "rgba(255,255,255,0.55)",
      transition: "all 0.18s", letterSpacing: "0.02em",
    }}>{label}</button>
  );
}

function Tag({ children, variant = "neutral" }) {
  const styles = {
    neutral: { bg: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)" },
    have: { bg: "rgba(74,222,128,0.12)", color: "#4ade80" },
    missing: { bg: "rgba(248,113,113,0.12)", color: "#f87171" },
  };
  const s = styles[variant];
  return (
    <span style={{
      padding: "3px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 500,
      background: s.bg, color: s.color, display: "inline-block",
    }}>{children}</span>
  );
}

function RecipeCard({ recipe, selected, onClick, userIngredients }) {
  const pct = Math.round(recipe.similarity);
  const missing = (recipe.missing_ingredients || []).length;
  return (
    <div onClick={onClick} style={{
      background: selected ? "rgba(163,230,53,0.07)" : "rgba(255,255,255,0.03)",
      border: selected ? "1px solid rgba(163,230,53,0.4)" : "1px solid rgba(255,255,255,0.08)",
      borderRadius: "16px", padding: "18px", cursor: "pointer",
      transition: "all 0.2s", position: "relative", overflow: "hidden",
    }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
    >
      <div style={{ position: "absolute", top: 0, right: 0, width: "80px", height: "80px",
        background: pct >= 80 ? "radial-gradient(circle at top right, rgba(74,222,128,0.08), transparent 70%)"
          : pct >= 50 ? "radial-gradient(circle at top right, rgba(250,204,21,0.08), transparent 70%)"
          : "radial-gradient(circle at top right, rgba(248,113,113,0.08), transparent 70%)",
        pointerEvents: "none" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "4px",
            fontFamily: "'Playfair Display', serif", lineHeight: 1.3 }}>{recipe.name}</div>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "10px" }}>
            {(recipe.ingredients || []).length} ingredients · {missing} missing
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
            {(recipe.ingredients || []).slice(0, 4).map((ing, i) => (
              <Tag key={i} variant="neutral">{ing}</Tag>
            ))}
            {(recipe.ingredients || []).length > 4 && (
              <Tag variant="neutral">+{(recipe.ingredients || []).length - 4}</Tag>
            )}
          </div>
        </div>
        <MatchRing pct={pct} />
      </div>
    </div>
  );
}

function DetailPanel({ recipe, userIngredients, onClose }) {
  const pct = Math.round(recipe.similarity);
  const userSet = new Set(userIngredients.map(i => i.toLowerCase().trim()));

  return (
    <div style={{
      background: "rgba(15,15,20,0.97)", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "20px", padding: "28px", position: "relative",
      backdropFilter: "blur(20px)",
    }}>
      <button onClick={onClose} style={{
        position: "absolute", top: "16px", right: "16px",
        background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "8px", color: "rgba(255,255,255,0.6)", cursor: "pointer",
        width: "30px", height: "30px", fontSize: "16px", display: "flex",
        alignItems: "center", justifyContent: "center",
      }}>×</button>

      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", marginBottom: "20px" }}>
        <MatchRing pct={pct} />
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px",
            fontWeight: 700, color: "#fff", marginBottom: "4px" }}>{recipe.name}</div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
            {(recipe.ingredients || []).length} ingredients · {(recipe.missing_ingredients || []).length} missing
          </div>
          <div style={{ marginTop: "8px", height: "4px", width: "200px",
            background: "rgba(255,255,255,0.08)", borderRadius: "999px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, borderRadius: "999px",
              background: pct >= 80 ? "#4ade80" : pct >= 50 ? "#facc15" : "#f87171",
              transition: "width 0.6s ease" }} />
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "14px" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: "10px" }}>
            Ingredients
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {(recipe.ingredients || []).map((ing, i) => (
              <Tag key={i} variant={userSet.has(ing.toLowerCase()) ? "have" : "missing"}>{ing}</Tag>
            ))}
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "14px" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: "10px" }}>
            Missing ({(recipe.missing_ingredients || []).length})
          </div>
          {(recipe.missing_ingredients || []).length === 0 ? (
            <div style={{ fontSize: "12px", color: "#4ade80", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>✓</span> You have everything!
            </div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
              {(recipe.missing_ingredients || []).map((ing, i) => (
                <Tag key={i} variant="missing">{ing}</Tag>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "14px", marginBottom: "16px" }}>
        <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em",
          color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: "10px" }}>
          Instructions
        </div>
        <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)", lineHeight: 1.8,
          maxHeight: "160px", overflowY: "auto", whiteSpace: "pre-line" }}>
          {recipe.instructions || "No instructions available."}
        </div>
      </div>

      <a href={recipe.youtube_link || "#"} target="_blank" rel="noreferrer" style={{
        display: "inline-flex", alignItems: "center", gap: "8px",
        padding: "10px 20px", borderRadius: "10px",
        background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
        color: "#f87171", fontSize: "13px", fontWeight: 600, textDecoration: "none",
        transition: "all 0.2s",
      }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.25)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.56V6.8a4.85 4.85 0 01-1.07-.11z"/>
        </svg>
        Watch on YouTube
      </a>
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
      background: "#0a0a0f",
      color: "#fff",
      fontFamily: "'DM Sans', sans-serif",
      display: "grid",
      gridTemplateColumns: "280px 1fr",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        textarea:focus, input:focus { outline: none; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0%,100% { opacity:0.4; } 50% { opacity:0.9; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .recipe-card-anim { animation: fadeUp 0.3s ease both; }
      `}</style>

      {/* Background glows */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "500px", height: "500px",
          background: "radial-gradient(circle, rgba(163,230,53,0.04) 0%, transparent 70%)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: "600px", height: "600px",
          background: "radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)", borderRadius: "50%" }} />
      </div>

      {/* ── SIDEBAR ── */}
      <aside style={{
        borderRight: "1px solid rgba(255,255,255,0.06)",
        padding: "24px 18px",
        display: "flex", flexDirection: "column", gap: "24px",
        background: "rgba(255,255,255,0.015)",
        position: "relative", zIndex: 1, overflowY: "auto",
      }}>
        {/* Brand */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "10px",
              background: "linear-gradient(135deg, #a3e635, #4ade80)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>🍽</div>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: 800, color: "#fff" }}>
                RecipeMatch
              </div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.05em" }}>
                AI-POWERED KITCHEN
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />

        {/* Ingredient Input */}
        <div>
          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em",
            color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: "8px" }}>
            Your Ingredients
          </div>
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="onion, tomato, garlic…"
            rows={3}
            style={{
              width: "100%", resize: "none", padding: "12px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px", color: "#fff", fontSize: "13px",
              fontFamily: "'DM Sans', sans-serif",
              transition: "border-color 0.2s",
            }}
            onFocus={e => e.target.style.borderColor = "rgba(163,230,53,0.4)"}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSearch())}
          />
          <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
            <button onClick={() => { setInputValue(""); setActiveChips([]); }}
              style={{ padding: "9px 14px", borderRadius: "10px", fontSize: "12px", fontWeight: 600,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.5)", cursor: "pointer", transition: "all 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
            >Clear</button>
            <button onClick={handleSearch} disabled={loading || ingCount === 0}
              style={{ flex: 1, padding: "9px", borderRadius: "10px", fontSize: "13px", fontWeight: 700,
                background: ingCount > 0 ? "linear-gradient(135deg, #a3e635, #4ade80)" : "rgba(255,255,255,0.05)",
                border: "none", color: ingCount > 0 ? "#0a0a0f" : "rgba(255,255,255,0.2)",
                cursor: ingCount > 0 ? "pointer" : "not-allowed", transition: "all 0.2s",
                letterSpacing: "0.02em",
              }}>
              {loading ? "Searching…" : "Find Recipes →"}
            </button>
          </div>
        </div>

        {/* Quick add */}
        <div>
          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em",
            color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: "8px" }}>
            Quick Add
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {QUICK_TAGS.map(tag => (
              <Chip key={tag} label={tag} active={activeChips.includes(tag)}
                onClick={() => toggleChip(tag)} />
            ))}
          </div>
        </div>

        {/* Cuisine */}
        <div>
          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em",
            color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: "8px" }}>
            Cuisine
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {CUISINES.map(c => (
              <Chip key={c} label={c} active={cuisine === c} onClick={() => setCuisine(c)} />
            ))}
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em",
              color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: "8px" }}>
              Recent Searches
            </div>
            {history.map((h, i) => (
              <div key={i} onClick={() => { setInputValue(h); }}
                style={{ padding: "7px 10px", borderRadius: "8px", fontSize: "12px",
                  color: "rgba(255,255,255,0.45)", cursor: "pointer", transition: "all 0.15s",
                  display: "flex", alignItems: "center", gap: "8px" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
              >
                <span style={{ opacity: 0.4, fontSize: "11px" }}>↺</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h}</span>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* ── MAIN ── */}
      <main style={{ padding: "28px 28px", display: "flex", flexDirection: "column", gap: "20px",
        position: "relative", zIndex: 1, overflowY: "auto", maxHeight: "100vh" }}>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px" }}>
          {[
            { label: "Recipes Found", value: recipes.length || "—" },
            { label: "Best Match", value: bestMatch ? `${Math.round(bestMatch)}%` : "—" },
            { label: "Ingredients", value: ingCount || "—" },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "14px", padding: "16px 18px",
            }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "24px", fontWeight: 700,
                color: "#a3e635", marginBottom: "2px" }}>{value}</div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.04em" }}>{label}</div>
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 800, color: "#fff" }}>
              {searched ? (loading ? "Searching…" : `${sorted.length} recipe${sorted.length !== 1 ? "s" : ""} found`) : "Recommended Recipes"}
            </div>
            {ingCount > 0 && (
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>
                Matching against {ingCount} ingredient{ingCount !== 1 ? "s" : ""}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            {[["match", "Best Match"], ["az", "A–Z"], ["missing", "Fewest Missing"]].map(([val, label]) => (
              <button key={val} onClick={() => setSort(val)} style={{
                padding: "6px 13px", borderRadius: "999px", fontSize: "11px", fontWeight: 600,
                cursor: "pointer", border: sort === val ? "1px solid rgba(163,230,53,0.4)" : "1px solid rgba(255,255,255,0.08)",
                background: sort === val ? "rgba(163,230,53,0.1)" : "transparent",
                color: sort === val ? "#a3e635" : "rgba(255,255,255,0.4)",
                transition: "all 0.15s",
              }}>{label}</button>
            ))}
          </div>
        </div>

        {/* Loading spinner */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px",
            color: "rgba(255,255,255,0.4)", gap: "14px" }}>
            <div style={{ width: "36px", height: "36px", border: "2.5px solid rgba(163,230,53,0.2)",
              borderTopColor: "#a3e635", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <div style={{ fontSize: "13px" }}>Finding the best recipes for you…</div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !searched && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "60px 0", gap: "16px", color: "rgba(255,255,255,0.2)" }}>
            <div style={{ fontSize: "52px", animation: "shimmer 3s ease infinite" }}>🥘</div>
            <div style={{ fontSize: "14px", fontFamily: "'Playfair Display', serif" }}>
              Enter ingredients to discover recipes
            </div>
            <div style={{ fontSize: "12px" }}>Use the sidebar to add what you have in your kitchen</div>
          </div>
        )}

        {!loading && searched && sorted.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "60px 0", gap: "12px", color: "rgba(255,255,255,0.3)" }}>
            <div style={{ fontSize: "40px" }}>🔍</div>
            <div style={{ fontSize: "14px" }}>No recipes found for these ingredients</div>
          </div>
        )}

        {/* Cards grid */}
        {!loading && sorted.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "12px" }}>
            {sorted.map((recipe, i) => (
              <div key={i} className="recipe-card-anim" style={{ animationDelay: `${i * 0.05}s` }}>
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