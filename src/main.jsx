import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  ArrowUpRight,
  ChevronRight,
  CircleUserRound,
  Gift,
  Heart,
  LockKeyhole,
  Menu,
  MessageCircle,
  Play,
  Sparkles,
  UsersRound,
  X,
} from 'lucide-react'
import './styles.css'

const feedTabs = ['Pour toi', 'Tendance', 'Récent']

function Logo({ compact = false }) {
  return (
    <a className={`logo ${compact ? 'logo-compact' : ''}`} href="#top" aria-label="VEIL, accueil">
      <img src="/logo-veil.png" alt="" />
      <span>VEIL</span>
    </a>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('Pour toi')
  const [liked, setLiked] = useState(false)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const closeMenu = () => setMenuOpen(false)
  const submitWaitlist = (event) => {
    event.preventDefault()
    if (email.trim()) setSubmitted(true)
  }

  return (
    <main id="top">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="site-header shell">
        <Logo />
        <nav className={menuOpen ? 'nav open' : 'nav'} aria-label="Navigation principale">
          <a href="#vision" onClick={closeMenu}>La vision</a>
          <a href="#experience" onClick={closeMenu}>L'expérience</a>
          <a href="#communities" onClick={closeMenu}>Communautés</a>
          <a href="#waitlist" onClick={closeMenu}>Accès anticipé</a>
        </nav>
        <a className="header-cta" href="#waitlist">Rejoindre VEIL <ArrowUpRight size={16} /></a>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Ouvrir le menu">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      <section className="hero shell">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> Le réseau social qui change la conversation</div>
          <h1>Dis ce que tu penses.<br /><em>Pas qui tu es.</em></h1>
          <p className="hero-text">Un espace social anonyme pour laisser ta personnalité parler avant ton identité. Publie, échange et crée des liens qui commencent par le vrai.</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#waitlist">Entrer dans VEIL <ArrowUpRight size={17} /></a>
            <a className="text-link" href="#experience"><span className="play-icon"><Play size={11} fill="currentColor" /></span> Voir comment ça marche</a>
          </div>
          <div className="hero-proof"><div className="avatar-stack"><span className="avatar avatar-a">M</span><span className="avatar avatar-b">S</span><span className="avatar avatar-c">A</span><span className="avatar avatar-d">+</span></div><span>Les premières voix arrivent déjà.</span></div>
        </div>

        <div className="hero-visual" aria-label="Aperçu d'une publication VEIL">
          <div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" />
          <div className="hero-glow" />
          <div className="phone-frame">
            <div className="phone-top"><span>9:41</span><span className="phone-status">● ●</span></div>
            <div className="phone-content">
              <div className="phone-nav"><Logo compact /><span className="phone-coins">◈ 200</span></div>
              <div className="feed-heading"><span>Ton espace</span><span className="tiny-dot" /></div>
              <div className="feed-card">
                <div className="post-meta"><span className="tiny-avatar">◌</span><span>@Nocturne</span><span className="post-time">il y a 2 min</span></div>
                <p>« Les personnes les plus intéressantes sont souvent celles qu'on n'avait pas pensé à écouter. »</p>
                <div className="post-actions"><button className={liked ? 'like-button liked' : 'like-button'} onClick={() => setLiked(!liked)}><Heart size={15} fill={liked ? 'currentColor' : 'none'} /> {liked ? '129' : '128'}</button><span><MessageCircle size={15} /> 24</span><span className="gift-action"><Gift size={15} /> Offrir</span></div>
              </div>
              <div className="secret-card"><div className="secret-icon"><LockKeyhole size={17} /></div><div><strong>Un Secret t'attend</strong><span>Quelqu'un pense à toi.</span></div><ChevronRight size={18} /></div>
              <div className="mini-post"><div className="mini-avatar">✦</div><div><div className="mini-line" /><div className="mini-line short" /></div></div>
            </div>
            <div className="phone-tabs"><span className="active">⌂</span><span>◌</span><span className="create">＋</span><span>♡</span><span>◉</span></div>
          </div>
          <div className="float-card float-secret"><span className="float-card-icon purple"><LockKeyhole size={15} /></span><span><b>Secret reçu</b><small>Il y a 1 min</small></span></div>
          <div className="float-card float-coins"><span className="float-card-icon gold">◈</span><span><b>+ 200 Coins</b><small>Bienvenue dans VEIL</small></span></div>
        </div>
      </section>

      <div className="ticker"><div className="ticker-inner"><span>ANONYMAT</span><i>✦</i><span>EXPRESSION</span><i>✦</i><span>CONNEXIONS</span><i>✦</i><span>ANONYMAT</span><i>✦</i><span>EXPRESSION</span><i>✦</i><span>CONNEXIONS</span></div></div>

      <section className="manifesto shell" id="vision">
        <div className="section-label">01 — La vision</div>
        <div className="manifesto-grid"><h2>Et si on se rencontrait<br /><span>avant de se reconnaître ?</span></h2><div className="manifesto-copy"><p>VEIL est né d'une idée simple : quand le nom, le statut et l'apparence disparaissent, il reste l'essentiel. Une pensée. Une voix. Une vraie connexion.</p><a className="text-link" href="#experience">Découvrir la vision <ArrowUpRight size={16} /></a></div></div>
      </section>

      <section className="experience shell" id="experience">
        <div className="section-intro"><div><div className="section-label">02 — Ton espace</div><h2>Un monde à découvrir<br /><span>derrière le voile.</span></h2></div><p>Des pensées sans filtre, des conversations inattendues et des communautés qui te ressemblent. Tout commence sans étiquette.</p></div>
        <div className="experience-layout">
          <div className="feed-demo"><div className="demo-top"><div className="demo-brand"><img src="/logo-veil.png" alt="" /><span>VEIL</span></div><div className="demo-user">@shadow <CircleUserRound size={18} /></div></div><div className="feed-tabs">{feedTabs.map((tab) => <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>{tab}</button>)}</div><div className="demo-post"><div className="demo-post-head"><span className="large-avatar">☾</span><div><b>@Lueur <span className="verified">✦</span></b><small>Communauté · Pensées</small></div><span className="more">···</span></div><p>Je crois qu'on ne cherche pas toujours des réponses.<br />Parfois, on cherche juste quelqu'un qui comprend la question.</p><div className="demo-reactions"><span>♡ 342</span><span>◌ 61</span><span>🎁 12</span><span className="share">↗</span></div></div><div className="demo-prompt"><Sparkles size={18} /><span>Qu'est-ce que tu n'oserais pas dire ailleurs ?</span><button>Publier</button></div></div>
          <div className="feature-list"><article><span className="feature-number">01</span><div><h3>Une voix, pas une étiquette</h3><p>Ton identité VEIL est la personne que tu choisis d'être ici. Ton vrai nom reste à toi.</p></div></article><article><span className="feature-number">02</span><div><h3>Des liens qui se dévoilent</h3><p>Conversations anonymes, Secrets et révélations volontaires. La confiance se construit à ton rythme.</p></div></article><article><span className="feature-number">03</span><div><h3>Une place pour chaque pensée</h3><p>Rejoins les communautés qui te donnent envie de parler, d'écouter et de rester.</p></div></article></div>
        </div>
      </section>

      <section className="communities shell" id="communities"><div className="section-label">03 — Les communautés</div><div className="community-heading"><h2>Ta place est<br /><span>quelque part ici.</span></h2><p>Des espaces vivants pour tes humeurs, tes obsessions et tout ce que tu gardes habituellement pour toi.</p></div><div className="community-cards"><div className="community-card card-confessions"><span className="community-symbol">◌</span><b>Confessions</b><small>12.4k voix</small><span className="card-arrow">↗</span></div><div className="community-card card-debats"><span className="community-symbol">✦</span><b>Débats</b><small>8.8k voix</small><span className="card-arrow">↗</span></div><div className="community-card card-pensees"><span className="community-symbol">☾</span><b>Pensées</b><small>16.2k voix</small><span className="card-arrow">↗</span></div><div className="community-card card-humour"><span className="community-symbol">⌁</span><b>Humour</b><small>21.1k voix</small><span className="card-arrow">↗</span></div></div></section>

      <section className="waitlist shell" id="waitlist"><div className="waitlist-orb" /><div className="waitlist-content"><div className="section-label">04 — Accès anticipé</div><h2>Le voile se lève<br /><em>bientôt.</em></h2><p>VEIL arrive bientôt. Rejoins la liste d'attente et sois parmi les premiers à entrer dans cet espace.</p>{submitted ? <div className="success-message">✦ Tu es sur la liste. À très vite derrière le voile.</div> : <form onSubmit={submitWaitlist}><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ton@email.com" aria-label="Ton adresse email" required /><button className="button button-primary" type="submit">Je veux entrer <ArrowUpRight size={17} /></button></form>}<small className="privacy-note">Pas de spam. Juste une invitation quand le moment sera venu.</small></div><div className="waitlist-mark"><img src="/logo-veil.png" alt="" /><span>VEIL</span></div></section>

      <footer className="site-footer shell"><Logo /><span>Dis ce que tu penses. Pas qui tu es.</span><div className="footer-links"><a href="#vision">La vision</a><a href="#experience">L'expérience</a><a href="#waitlist">Contact</a></div><span className="copyright">© 2025 VEIL</span></footer>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
