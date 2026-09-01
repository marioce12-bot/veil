import { useEffect, useMemo, useState } from 'react'
import {
  Bell,
  ChevronRight,
  Compass,
  Eye,
  Gift,
  Heart,
  Home,
  LockKeyhole,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Send,
  Sparkles,
  Search,
  UserRound,
  X,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import './home.css'

const categories = [
  { id: 'confession', label: 'Confession', icon: '🤫' },
  { id: 'pensee', label: 'Pensée', icon: '💭' },
  { id: 'debat', label: 'Débat', icon: '⚡' },
  { id: 'humour', label: 'Humour', icon: '😂' },
]

const initialPosts = [
  { id: 1, category: 'pensee', time: '12 min', text: 'Je crois que je suis devenu quelqu’un que je n’aime plus.', reactions: 24, comments: 7, felt: 87, liked: false },
  { id: 2, category: 'confession', time: '28 min', text: 'Je fais semblant d’avoir tout compris. En réalité, je cherche encore ma place.', reactions: 42, comments: 12, felt: 126, liked: false },
  { id: 3, category: 'debat', time: '41 min', text: 'Est-ce qu’on doit toujours dire la vérité, même quand elle ne répare rien ?', reactions: 31, comments: 18, felt: 94, liked: false },
]

const trends = ['Les choses qu’on ne dit jamais à ses parents', 'Est-ce qu’on peut aimer deux personnes ?', 'Votre plus grosse erreur ?', 'Une vérité que personne ne veut entendre']

function HomeLogo() {
  return <a className="home-logo" href="#home"><img src="/logo-veil.png" alt="" /><span>VEIL</span></a>
}

export default function VeilHome({ onSignOut, session }) {
  const [activeTab, setActiveTab] = useState('Pour toi')
  const [selectedCategory, setSelectedCategory] = useState('pensee')
  const [composerText, setComposerText] = useState('')
  const [posts, setPosts] = useState(initialPosts)
  const [revealed, setRevealed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)

  const displayName = session?.user?.user_metadata?.display_name || 'toi'
  const visiblePosts = useMemo(() => activeTab === 'Pour toi' ? posts : posts.filter((post) => categories.find((item) => item.label === activeTab)?.id === post.category), [activeTab, posts])

  useEffect(() => {
    if (!toast) return undefined
    const timeout = window.setTimeout(() => setToast(''), 2800)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const publish = (event) => {
    event.preventDefault()
    if (!composerText.trim()) return
    setPosts([{ id: Date.now(), category: selectedCategory, time: 'à l’instant', text: composerText.trim(), reactions: 0, comments: 0, felt: 0, liked: false }, ...posts])
    setComposerText('')
    setToast('Ta pensée a été publiée anonymement.')
  }

  const toggleLike = (id) => setPosts(posts.map((post) => post.id === id ? { ...post, liked: !post.liked, reactions: post.reactions + (post.liked ? -1 : 1) } : post))

  return <div className="home-app" id="home">
    <header className="home-header">
      <div className="home-header-inner">
        <HomeLogo />
        <div className="home-search"><Search size={16} /><input placeholder="Rechercher une pensée, une communauté…" aria-label="Rechercher" /></div>
        <div className="home-actions"><button aria-label="Rechercher" className="mobile-search"><Search size={19} /></button><button aria-label="Notifications" className="icon-button"><Bell size={19} /><i /></button><div className="profile-wrap"><button className="profile-button" onClick={() => setProfileOpen(!profileOpen)}><span className="profile-avatar">{displayName.slice(0, 1).toUpperCase()}</span><span className="profile-name">@{displayName}</span><ChevronRight size={15} /></button>{profileOpen && <div className="profile-menu"><span>Ton espace</span><button onClick={onSignOut}>Se déconnecter</button></div>}</div><button className="home-menu-button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Ouvrir la navigation">{mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}</button></div>
      </div>
    </header>

    <div className="home-layout">
      <aside className={mobileMenuOpen ? 'home-sidebar open' : 'home-sidebar'}><nav><button className="active"><Home size={18} /> Accueil</button><button><Compass size={18} /> Découvrir</button><button><MessageCircle size={18} /> Messages <b className="nav-count">3</b></button><button><Heart size={18} /> Activité</button><button><UserRound size={18} /> Profil</button></nav><div className="sidebar-note"><Sparkles size={16} /><span><strong>Derrière le voile</strong><small>Une pensée choisie pour toi.</small></span></div><button className="sidebar-signout" onClick={onSignOut}>Quitter VEIL</button></aside>

      <main className="home-main">
        <div className="home-greeting"><div><span className="home-eyebrow">Mardi · ton espace anonyme</span><h1>Bonjour, <em>@{displayName}</em></h1></div><div className="coin-pill">◈ <strong>200</strong> Coins</div></div>
        <section className="composer glass-panel"><div className="composer-head"><span className="composer-avatar">◌</span><span>Qu’est-ce que tu veux dire aujourd’hui ?</span></div><form onSubmit={publish}><textarea value={composerText} onChange={(event) => setComposerText(event.target.value)} placeholder="Écris quelque chose… personne ne saura que c’est toi." rows="3" /><div className="composer-footer"><div className="category-picker">{categories.map((category) => <button type="button" key={category.id} className={selectedCategory === category.id ? 'selected' : ''} onClick={() => setSelectedCategory(category.id)}><span>{category.icon}</span>{category.label}</button>)}</div><button className="publish-button" disabled={!composerText.trim()}>Publier anonymement <Send size={15} /></button></div></form></section>
        <div className="feed-heading"><div className="feed-tabs-home">{['Pour toi', 'Confessions', 'Pensées', 'Débats', 'Humour'].map((tab) => <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>{tab}</button>)}</div><button className="filter-button"><Sparkles size={15} /> Personnalisé</button></div>
        <div className="feed-list">{visiblePosts.map((post) => <article className="home-post glass-panel" key={post.id}><div className="post-topline"><span className="post-avatar">◌</span><div><strong>Anonyme</strong><small>il y a {post.time} · {categories.find((item) => item.id === post.category)?.label}</small></div><button className="post-more" aria-label="Plus d’options"><MoreHorizontal size={18} /></button></div><p className="home-post-text">« {post.text} »</p><div className="post-footer"><button className={post.liked ? 'post-action liked' : 'post-action'} onClick={() => toggleLike(post.id)}><Heart size={17} fill={post.liked ? 'currentColor' : 'none'} /> {post.reactions}</button><button className="post-action"><MessageCircle size={17} /> {post.comments}</button><button className="post-action"><Send size={16} /> Partager</button><span className="felt-count"><Eye size={15} /> {post.felt} personnes ont ressenti la même chose</span></div></article>)}</div>
      </main>

      <aside className="home-rightbar"><section className="trends-card glass-panel"><div className="right-title"><span>🔥</span><h2>En ce moment sur VEIL</h2></div><div className="trend-list">{trends.map((trend, index) => <button key={trend}><span>0{index + 1}</span><strong>{trend}</strong><ChevronRight size={15} /></button>)}</div><button className="see-more">Voir toutes les tendances <ArrowIcon /></button></section><section className="veil-pick glass-panel"><div className="pick-label"><LockKeyhole size={15} /> Derrière le voile</div>{revealed ? <p>« J’ai toujours voulu partir. Je ne sais juste pas de quoi. »</p> : <><div className="blurred-thought">« J’ai toujours voulu partir. Je ne sais juste pas de quoi. »</div><button onClick={() => setRevealed(true)}>Voir une autre confession <ChevronRight size={15} /></button></>}<span className="pick-footer">Une pensée choisie au hasard</span></section><section className="creator-card"><div className="creator-icon"><Gift size={18} /></div><div><strong>Offre une présence</strong><small>Envoie un cadeau à une voix qui t’a touché.</small></div></section></aside>
    </div>
    <nav className="mobile-bottom-nav"><button className="active"><Home size={19} /><small>Accueil</small></button><button><Compass size={19} /><small>Découvrir</small></button><button className="mobile-publish"><Plus size={22} /></button><button><Heart size={19} /><small>Activité</small></button><button><UserRound size={19} /><small>Profil</small></button></nav>
    {toast && <div className="home-toast"><Sparkles size={16} /> {toast}</div>}
  </div>
}

function ArrowIcon() { return <ChevronRight size={15} /> }
