import { StrictMode, useEffect, useState } from 'react'
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
  X,
} from 'lucide-react'
import { supabase } from './lib/supabase'
import './styles.css'
import './glass-overrides.css'

const feedTabs = ['Pour toi', 'Tendance', 'Récent']

const legalContent = {
  privacy: {
    title: 'Politique de confidentialité',
    intro: 'Ton identité publique reste sous ton contrôle. VEIL ne vend pas tes données et ne partage pas volontairement ton identité avec les autres utilisateurs.',
    sections: [
      ['Anonymat', 'Les autres utilisateurs voient ton pseudonyme, ton numéro VEIL et les informations que tu choisis d’afficher. Anonyme pour les autres ne signifie pas invisible pour VEIL : certaines données techniques peuvent être conservées pour sécuriser le service, prévenir les fraudes et traiter les signalements.'],
      ['Données collectées', 'VEIL peut traiter ton nom d’inscription, ton e-mail, les informations d’authentification, ton identifiant VEIL, tes contenus, ainsi que des données techniques nécessaires au fonctionnement et à la sécurité du service.'],
      ['Ce que nous ne faisons pas', 'Nous ne vendons pas tes données personnelles, ton nom, ton adresse e-mail ou ton identité aux autres utilisateurs. Nous ne vendons pas le contenu de tes conversations à des annonceurs.'],
      ['Tes droits', 'Tu peux demander l’accès, la rectification, la mise à jour ou la suppression de tes données dans les conditions prévues par la loi. Contact : privacy@veil.app.'],
    ],
  },
  terms: {
    title: 'Conditions d’utilisation',
    intro: 'VEIL est un espace social anonyme. En créant un compte, tu acceptes de protéger les autres utilisateurs et de respecter les règles de la plateforme.',
    sections: [
      ['Compte et anonymat', 'Tu dois fournir des informations exactes pour sécuriser ton compte. Ton identité réelle n’est pas affichée automatiquement, mais l’anonymat ne constitue pas une garantie d’impunité en cas d’abus, de fraude ou d’obligation légale.'],
      ['Contenus et comportements', 'Le harcèlement, les menaces, le doxxing, le chantage, l’usurpation d’identité, les contenus illégaux, le spam et la manipulation des Coins sont interdits.'],
      ['Coins et fonctionnalités numériques', 'Les Coins sont des unités virtuelles utilisables dans VEIL. Ils ne constituent pas de l’argent, ne sont pas retirables et les transferts confirmés peuvent être définitifs.'],
      ['Modération', 'VEIL peut supprimer un contenu, limiter une fonctionnalité, suspendre ou supprimer un compte lorsque cela est nécessaire pour la sécurité du service.'],
    ],
  },
}

function Logo({ compact = false }) {
  return (
    <a className={`logo ${compact ? 'logo-compact' : ''}`} href="#top" aria-label="VEIL, accueil">
      <img src="/logo-veil.png" alt="" />
      <span>VEIL</span>
    </a>
  )
}

function AuthModal({ mode, onClose, onModeChange, onLegal }) {
  const [form, setForm] = useState({ email: '', password: '', displayName: '', accepted: false })
  const [status, setStatus] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)

  const isSignup = mode === 'signup'
  const updateField = (event) => setForm({ ...form, [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value })

  const submit = async (event) => {
    event.preventDefault()
    if (isSignup && !form.accepted) {
      setStatus({ type: 'error', message: 'Tu dois accepter les conditions et la politique de confidentialité.' })
      return
    }
    if (!supabase) {
      setStatus({ type: 'error', message: 'Supabase n’est pas encore configuré. Ajoute les variables VITE_SUPABASE dans ton environnement.' })
      return
    }
    setLoading(true)
    setStatus({ type: '', message: '' })
    const result = isSignup
      ? await supabase.auth.signUp({ email: form.email, password: form.password, options: { data: { display_name: form.displayName }, emailRedirectTo: `${window.location.origin}/` } })
      : await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
    setLoading(false)
    if (result.error) {
      setStatus({ type: 'error', message: result.error.message })
      return
    }
    setStatus({ type: 'success', message: isSignup ? 'Compte créé. Vérifie ton e-mail pour confirmer ton accès.' : 'Connexion réussie. Bienvenue derrière le voile.' })
  }

  return <div className="auth-backdrop" role="dialog" aria-modal="true" aria-labelledby="auth-title">
    <div className="auth-modal glass-card">
      <button className="auth-close" onClick={onClose} aria-label="Fermer"><X size={20} /></button>
      <div className="auth-kicker"><span className="eyebrow-dot" /> VEIL · espace privé</div>
      <div className="auth-symbol"><img src="/logo-veil.png" alt="" /></div>
      <h2 id="auth-title">{isSignup ? 'Entre derrière le voile.' : 'Ravi de te revoir.'}</h2>
      <p className="auth-intro">{isSignup ? 'Crée ton espace social. Ton identité publique reste anonyme.' : 'Retrouve tes conversations, tes communautés et ta voix.'}</p>
      <div className="privacy-banner"><LockKeyhole size={16} /><span><strong>Ton compte reste anonyme.</strong><small>Aucune donnée personnelle ne sera partagée avec les autres utilisateurs.</small></span></div>
      <form className="auth-form" onSubmit={submit}>
        {isSignup && <label>Pseudonyme<input name="displayName" value={form.displayName} onChange={updateField} placeholder="Comment veux-tu être appelé ?" required /></label>}
        <label>Adresse e-mail<input type="email" name="email" value={form.email} onChange={updateField} placeholder="toi@exemple.com" required /></label>
        <label>Mot de passe<input type="password" name="password" value={form.password} onChange={updateField} placeholder="6 caractères minimum" minLength="6" required /></label>
        {isSignup && <label className="check-label"><input type="checkbox" name="accepted" checked={form.accepted} onChange={updateField} /><span>J’accepte les <button type="button" onClick={() => onLegal('terms')}>conditions d’utilisation</button> et la <button type="button" onClick={() => onLegal('privacy')}>politique de confidentialité</button>.</span></label>}
        {status.message && <div className={`auth-status ${status.type}`}>{status.message}</div>}
        <button className="button button-primary auth-submit" disabled={loading}>{loading ? 'Un instant…' : isSignup ? 'Créer mon compte' : 'Se connecter'} <ArrowUpRight size={17} /></button>
      </form>
      <div className="auth-switch">{isSignup ? 'Tu as déjà un compte ?' : 'Pas encore de compte ?'} <button onClick={() => onModeChange(isSignup ? 'login' : 'signup')}>{isSignup ? 'Se connecter' : 'Créer mon compte'}</button></div>
    </div>
  </div>
}

function LegalModal({ kind, onClose }) {
  const content = legalContent[kind]
  return <div className="auth-backdrop legal-backdrop" role="dialog" aria-modal="true" aria-labelledby="legal-title"><div className="legal-modal glass-card"><button className="auth-close" onClick={onClose} aria-label="Fermer"><X size={20} /></button><div className="auth-kicker"><span className="eyebrow-dot" /> VEIL · transparence</div><h2 id="legal-title">{content.title}</h2><p className="legal-intro">{content.intro}</p><div className="legal-scroll">{content.sections.map(([title, text]) => <section key={title}><h3>{title}</h3><p>{text}</p></section>)}</div><div className="legal-date">Dernière mise à jour : 1 septembre 2026</div></div></div>
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('Pour toi')
  const [liked, setLiked] = useState(false)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [authMode, setAuthMode] = useState(null)
  const [legalMode, setLegalMode] = useState(null)

  useEffect(() => {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          revealObserver.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12 })

    document.querySelectorAll('[data-reveal]').forEach((element) => revealObserver.observe(element))
    return () => revealObserver.disconnect()
  }, [])

  const closeMenu = () => setMenuOpen(false)
  const submitWaitlist = (event) => {
    event.preventDefault()
    if (email.trim()) setSubmitted(true)
  }

  return (
    <main id="top">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="site-header shell" data-reveal>
        <Logo />
        <nav className={menuOpen ? 'nav open' : 'nav'} aria-label="Navigation principale">
          <a href="#vision" onClick={closeMenu}>La vision</a>
          <a href="#experience" onClick={closeMenu}>L'expérience</a>
          <a href="#communities" onClick={closeMenu}>Communautés</a>
          <a href="#waitlist" onClick={closeMenu}>Accès anticipé</a>
        </nav>
        <button className="header-cta header-auth-button" onClick={() => setAuthMode('login')}>Se connecter <ArrowUpRight size={16} /></button>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Ouvrir le menu">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      <section className="hero shell">
        <div className="hero-copy" data-reveal>
          <div className="eyebrow"><span className="eyebrow-dot" /> Le réseau social qui change la conversation</div>
          <h1>Dis ce que tu penses.<br /><em>Pas qui tu es.</em></h1>
          <p className="hero-text">Un espace social anonyme pour laisser ta personnalité parler avant ton identité. Publie, échange et crée des liens qui commencent par le vrai.</p>
          <div className="hero-actions">
            <button className="button button-primary" onClick={() => setAuthMode('signup')}>Entrer dans VEIL <ArrowUpRight size={17} /></button>
            <a className="text-link" href="#experience"><span className="play-icon"><Play size={11} fill="currentColor" /></span> Voir comment ça marche</a>
          </div>
          <div className="hero-proof"><div className="avatar-stack"><span className="avatar avatar-a">M</span><span className="avatar avatar-b">S</span><span className="avatar avatar-c">A</span><span className="avatar avatar-d">+</span></div><span>Des voix différentes. Une même envie de vrai.</span></div>
        </div>

        <div className="hero-visual" aria-label="Aperçu d'une publication VEIL" data-reveal>
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
          <div className="hero-image-card glass-card"><img src="/community-humour.png" alt="Univers visuel de la communauté Humour" /><span>Une autre façon de se voir.</span></div>
        </div>
      </section>

      <div className="ticker"><div className="ticker-inner"><span>ANONYMAT</span><i>✦</i><span>EXPRESSION</span><i>✦</i><span>CONNEXIONS</span><i>✦</i><span>ANONYMAT</span><i>✦</i><span>EXPRESSION</span><i>✦</i><span>CONNEXIONS</span></div></div>

      <section className="manifesto shell" id="vision" data-reveal>
        <div className="section-label">01 — La vision</div>
        <div className="manifesto-grid"><h2>Et si on se rencontrait<br /><span>avant de se reconnaître ?</span></h2><div className="manifesto-copy"><p>VEIL est né d'une idée simple : quand le nom, le statut et l'apparence disparaissent, il reste l'essentiel. Une pensée. Une voix. Une vraie connexion.</p><a className="text-link" href="#experience">Découvrir la vision <ArrowUpRight size={16} /></a></div></div>
      </section>

      <section className="experience shell" id="experience" data-reveal>
        <div className="section-intro"><div><div className="section-label">02 — Ton espace</div><h2>Un monde à découvrir<br /><span>derrière le voile.</span></h2></div><p>Des pensées sans filtre, des conversations inattendues et des communautés qui te ressemblent. Tout commence sans étiquette.</p></div>
        <div className="experience-layout">
          <div className="feed-demo"><div className="demo-top"><div className="demo-brand"><img src="/logo-veil.png" alt="" /><span>VEIL</span></div><div className="demo-user">@shadow <CircleUserRound size={18} /></div></div><div className="feed-tabs">{feedTabs.map((tab) => <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>{tab}</button>)}</div><div className="demo-post"><div className="demo-post-head"><span className="large-avatar">☾</span><div><b>@Lueur <span className="verified">✦</span></b><small>Communauté · Pensées</small></div><span className="more">···</span></div><p>Je crois qu'on ne cherche pas toujours des réponses.<br />Parfois, on cherche juste quelqu'un qui comprend la question.</p><div className="demo-reactions"><span>♡ 342</span><span>◌ 61</span><span>🎁 12</span><span className="share">↗</span></div></div><div className="demo-prompt"><Sparkles size={18} /><span>Qu'est-ce que tu n'oserais pas dire ailleurs ?</span><button>Publier</button></div></div>
          <div className="experience-image glass-card"><img src="/veil-visual-2.png" alt="Portrait abstrait de l'univers VEIL" /><div><span className="section-label">Sans étiquette</span><strong>Ce que tu partages<br />parle pour toi.</strong></div></div>
          <div className="feature-list"><article><span className="feature-number">01</span><div><h3>Une voix, pas une étiquette</h3><p>Ton identité VEIL est la personne que tu choisis d'être ici. Ton vrai nom reste à toi.</p></div></article><article><span className="feature-number">02</span><div><h3>Des liens qui se dévoilent</h3><p>Conversations anonymes, Secrets et révélations volontaires. La confiance se construit à ton rythme.</p></div></article><article><span className="feature-number">03</span><div><h3>Une place pour chaque pensée</h3><p>Rejoins les communautés qui te donnent envie de parler, d'écouter et de rester.</p></div></article></div>
        </div>
      </section>

      <section className="communities shell" id="communities" data-reveal><div className="section-label">03 — Les communautés</div><div className="community-heading"><h2>Ta place est<br /><span>quelque part ici.</span></h2><p>Des espaces vivants pour tes humeurs, tes obsessions et tout ce que tu gardes habituellement pour toi.</p></div><div className="community-cards"><div className="community-card card-confessions"><img className="community-image" src="/community-confessions.png" alt="Ambiance de la communauté Confessions" /><div className="community-card-copy"><b>Confessions</b><small>12.4k voix</small></div><span className="card-arrow">↗</span></div><div className="community-card card-debats"><img className="community-image" src="/community-debats.png" alt="Ambiance de la communauté Débats" /><div className="community-card-copy"><b>Débats</b><small>8.8k voix</small></div><span className="card-arrow">↗</span></div><div className="community-card card-pensees"><img className="community-image" src="/community-pensees.png" alt="Ambiance de la communauté Pensées" /><div className="community-card-copy"><b>Pensées</b><small>16.2k voix</small></div><span className="card-arrow">↗</span></div><div className="community-card card-humour"><img className="community-image" src="/community-humour.png" alt="Ambiance de la communauté Humour" /><div className="community-card-copy"><b>Humour</b><small>21.1k voix</small></div><span className="card-arrow">↗</span></div></div></section>

      <section className="waitlist shell" id="waitlist" data-reveal><div className="waitlist-orb" /><div className="waitlist-content"><div className="section-label">04 — Rejoins VEIL</div><h2>Le voile se lève<br /><em>avec toi.</em></h2><p>Entre dans un espace où ta voix peut prendre toute sa place. Crée ton compte et garde le contrôle de ton identité.</p><button className="button button-primary" onClick={() => setAuthMode('signup')}>Créer mon compte <ArrowUpRight size={17} /></button><small className="privacy-note">Ton compte reste anonyme. Aucune donnée ne sera partagée avec les autres utilisateurs.</small></div><div className="waitlist-mark"><img src="/logo-veil.png" alt="" /><span>VEIL</span></div></section>

      <footer className="site-footer shell"><Logo /><span>Dis ce que tu penses. Pas qui tu es.</span><div className="footer-links"><a href="#vision">La vision</a><a href="#experience">L'expérience</a><button onClick={() => setLegalMode('privacy')}>Confidentialité</button><button onClick={() => setLegalMode('terms')}>Conditions</button></div><span className="copyright">© 2025 VEIL</span></footer>
      {authMode && <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onModeChange={setAuthMode} onLegal={setLegalMode} />}
      {legalMode && <LegalModal kind={legalMode} onClose={() => setLegalMode(null)} />}
    </main>
  )
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
