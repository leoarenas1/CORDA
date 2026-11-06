// SobreCorda.jsx — Sección "Sobre CORDA": Misión · Visión · Valores
// Basado estrictamente en el Brand Book de CORDA.
// Requiere: styles/tokens.css (tokens del brand book) y ./sobre-corda.css
// Fuentes: Space Grotesk (500, 600, 700) y DM Sans (400, 500, 600) de Google Fonts.

import { useState } from "react";
import "./sobre-corda.css";

const TABS = [
  { id: "mision", label: "Misión" },
  { id: "vision", label: "Visión" },
  { id: "valores", label: "Valores" },
];

const PILARES_MISION = [
  {
    icon: "target",
    titulo: "Qué sigue",
    texto: "Tu próxima sesión, tu objetivo y tu próximo torneo, siempre a la vista.",
  },
  {
    icon: "message",
    titulo: "Por qué",
    texto: "Feedback de tu coach que explica cada ajuste.",
  },
  {
    icon: "chart",
    titulo: "Cómo vas",
    texto: "Tu progreso medido mes a mes, con datos reales.",
  },
];

const CAMINO_VISION = [
  { punto: "lleno", titulo: "Hoy", texto: "Piloto con coaches y jugadores de Mouratoglou Guadalajara." },
  { punto: "medio", titulo: "Siguiente", texto: "Academias de alto rendimiento en todo México." },
  { punto: "vacio", titulo: "La meta", texto: "Ser la referencia del tenis competitivo en Latinoamérica." },
];

const VALORES = [
  {
    n: "01",
    arquetipo: "Mentor",
    nombre: "Dirección",
    frase: "Siempre hay un siguiente paso.",
    texto: "Cada pantalla te dice qué sigue: tu próxima sesión, tu próximo torneo, tu próxima meta.",
  },
  {
    n: "02",
    arquetipo: "Mentor",
    nombre: "Precisión",
    frase: "Medimos para mejorar.",
    texto: "Decidimos con datos: asistencia, resultados, WTN y el feedback de tu coach.",
  },
  {
    n: "03",
    arquetipo: "Héroe",
    nombre: "Constancia",
    frase: "Cada sesión cuenta.",
    texto: "El alto rendimiento se construye semana a semana, y tu historial lo demuestra.",
  },
  {
    n: "04",
    arquetipo: "Mentor + Héroe",
    nombre: "Equipo",
    frase: "Nadie juega solo.",
    texto: "Jugador, coach, familia y academia empujan juntos hacia la misma meta.",
  },
  {
    n: "05",
    arquetipo: "Héroe",
    nombre: "Respeto por el juego",
    frase: "Competimos con integridad.",
    texto: "Honramos el tenis, a nuestros rivales y la forma de trabajar de cada academia.",
  },
];

/* ---------- Íconos (línea, trazo 1.75, estilo Lucide) ---------- */
function Icon({ name, size = 24 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };
  switch (name) {
    case "back":
      return (<svg {...common}><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>);
    case "next":
      return (<svg {...common}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>);
    case "target":
      return (<svg {...common}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2" /></svg>);
    case "message":
      return (<svg {...common}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><path d="M8 9h8M8 13h5" /></svg>);
    case "chart":
      return (<svg {...common}><path d="M3 3v18h18" /><path d="m7 15 4-4 3 3 6-6" /></svg>);
    default:
      return null;
  }
}

/* ---------- Piezas compartidas ---------- */
function Wordmark() {
  return (
    <span className="sc-wordmark" aria-label="CORDA">
      CORDA<span className="sc-wordmark__dot">.</span>
    </span>
  );
}

function Encabezado({ eyebrow, arquetipo }) {
  return (
    <div className="sc-eyebrow-row">
      <span className="sc-eyebrow">{eyebrow}</span>
      {arquetipo && <span className="sc-pill">{arquetipo}</span>}
    </div>
  );
}

/* ---------- Pantallas ---------- */
function Mision({ onNext }) {
  return (
    <>
      <Encabezado eyebrow="NUESTRA MISIÓN" arquetipo="El Mentor" />
      <h1 className="sc-h1">Ponerle dirección a cada entrenamiento.</h1>
      <p className="sc-lead">
        Somos el mentor que acompaña a cada jugador. Convertimos el trabajo de jugadores,
        coaches, familias y academias en un plan claro.
      </p>
      <ul className="sc-pilares">
        {PILARES_MISION.map((p) => (
          <li key={p.titulo} className="sc-pilar">
            <span className="sc-pilar__icon"><Icon name={p.icon} /></span>
            <div>
              <h2 className="sc-h3">{p.titulo}</h2>
              <p className="sc-small">{p.texto}</p>
            </div>
          </li>
        ))}
      </ul>
      <button type="button" className="sc-btn sc-btn--primary" onClick={onNext}>
        Ver nuestra visión <Icon name="next" size={18} />
      </button>
    </>
  );
}

function Vision({ onNext }) {
  return (
    <>
      <Encabezado eyebrow="NUESTRA VISIÓN" arquetipo="El Héroe" />
      <h1 className="sc-h1">
        Que cada jugador llegue <span className="sc-accent">listo</span> a su próximo torneo.
      </h1>
      <p className="sc-lead">
        Queremos impulsar a la próxima generación de tenistas de México y Latinoamérica a
        competir a su máximo nivel, con academias que trabajan como un solo equipo.
      </p>
      <section className="sc-camino" aria-labelledby="sc-camino-titulo">
        <h2 id="sc-camino-titulo" className="sc-eyebrow sc-eyebrow--dark">HACIA DÓNDE VAMOS</h2>
        <ol className="sc-camino__lista">
          {CAMINO_VISION.map((c) => (
            <li key={c.titulo} className="sc-camino__item">
              <span className={`sc-camino__punto sc-camino__punto--${c.punto}`} aria-hidden="true" />
              <div>
                <div className="sc-h3">{c.titulo}</div>
                <div className="sc-small sc-small--dark">{c.texto}</div>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <button type="button" className="sc-btn sc-btn--primary" onClick={onNext}>
        Ver nuestros valores <Icon name="next" size={18} />
      </button>
    </>
  );
}

function Valores({ onNext }) {
  return (
    <>
      <Encabezado eyebrow="NUESTROS VALORES" />
      <h1 className="sc-h1">Cómo jugamos.</h1>
      <p className="sc-lead">
        Cinco principios que guían cada sesión, cada feedback y cada decisión en CORDA.
      </p>
      <ol className="sc-valores">
        {VALORES.map((v) => (
          <li key={v.n} className="sc-valor">
            <div className="sc-valor__top">
              <span className="sc-valor__n">{v.n}</span>
              <span className="sc-pill sc-pill--muted">{v.arquetipo}</span>
            </div>
            <h2 className="sc-h3">{v.nombre}</h2>
            <p className="sc-valor__frase">{v.frase}</p>
            <p className="sc-small">{v.texto}</p>
          </li>
        ))}
      </ol>
      <button type="button" className="sc-btn sc-btn--secondary" onClick={onNext}>
        Volver a la misión
      </button>
      <p className="sc-firma">CORDA. Tu juego, con dirección.</p>
    </>
  );
}

/* ---------- Contenedor ---------- */
export default function SobreCorda({ initialTab = "mision", onBack }) {
  const [tab, setTab] = useState(initialTab);
  const ir = (id) => {
    setTab(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="sc-screen" data-theme="cancha">
      <header className="sc-header">
        <button type="button" className="sc-icon-btn" aria-label="Volver" onClick={onBack}>
          <Icon name="back" size={20} />
        </button>
        <Wordmark />
        <span className="sc-header__spacer" aria-hidden="true" />
      </header>

      <nav className="sc-tabs" aria-label="Sobre CORDA">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`sc-tab ${tab === t.id ? "is-active" : ""}`}
            aria-current={tab === t.id ? "page" : undefined}
            onClick={() => ir(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className={`sc-main sc-main--${tab}`}>
        {tab === "mision" && <Mision onNext={() => ir("vision")} />}
        {tab === "vision" && <Vision onNext={() => ir("valores")} />}
        {tab === "valores" && <Valores onNext={() => ir("mision")} />}
      </main>
    </div>
  );
}
