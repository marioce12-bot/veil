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
  ImagePlus,
  Video,
  UserRound,
  X,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import './home.css'
import './product-views.css'

const categories = [
  { id: 'confession', label: 'Confession', icon: '🤫' },
  { id: 'pensee', label: 'Pensée', icon: '💭' },
  { id: 'debat', label: 'Débat', icon: '⚡' },
  { id: 'humour', label: 'Humour', icon: '😂' },
]

const initialPosts = [
  { id: 1, author: 'Lueur', category: 'pensee', time: '12 min', text: 'Je crois que je suis devenu quelqu’un que je n’aime plus.', reactions: 24, comments: 7, felt: 87, liked: false },
  { id: 2, author: 'Nocturne', category: 'confession', time: '28 min', text: 'Je fais semblant d’avoir tout compris. En réalité, je cherche encore ma place.', reactions: 42, comments: 12, felt: 126, liked: false },
  { id: 3, author: 'EntreDeux', category: 'debat', time: '41 min', text: 'Est-ce qu’on doit toujours dire la vérité, même quand elle ne répare rien ?', reactions: 31, comments: 18, felt: 94, liked: false },
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
  const [activeView, setActiveView] = useState('home')
  const [mediaFile, setMediaFile] = useState(null)
  const [mediaPreview, setMediaPreview] = useState('')

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
    setPosts([{ id: Date.now(), author: displayName, category: selectedCategory, time: 'à l’instant', text: composerText.trim(), media: mediaPreview, mediaType: mediaFile?.type, reactions: 0, comments: 0, felt: 0, liked: false }, ...posts])
    setComposerText('')
    setMediaFile(null)
    setMediaPreview('')
    setToast('Ta pensée a été publiée anonymement.')
  }

  const selectMedia = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setToast('Choisis une image ou une vidéo.')
      return
    }
    setMediaFile(file)
    setMediaPreview(URL.createObjectURL(file))
  }

  const toggleLike = (id) => setPosts(posts.map((post) => post.id === id ? { ...post, liked: !post.liked, reactions: post.reactions + (post.liked ? -1 : 1) } : post))

  const navigate = (view) => {
    setActiveView(view)
    setMobileMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const navButton = (view, icon, label, count) => <button className={activeView === view ? 'active' : ''} onClick={() => navigate(view)}>{icon} {label} {count && <b className="nav-count">{count}</b>}</button>

  const renderPost = (post) => <article className="home-post glass-panel" key={post.id}><div className="post-topline"><span className="post-avatar">{post.author.slice(0, 1)}</span><div><strong>@{post.author}</strong><small>il y a {post.time} · {categories.find((item) => item.id === post.category)?.label}</small></div><button className="post-more" aria-label="Plus d’options"><MoreHorizontal size={18} /></button></div><p className="home-post-text">« {post.text} »</p>{post.media && (post.mediaType?.startsWith('video/') ? <video className="post-media" src={post.media} controls /> : <img className="post-media" src={post.media} alt="Média publié anonymement" />)}<div className="post-footer"><button className={post.liked ? 'post-action liked' : 'post-action'} onClick={() => toggleLike(post.id)}><Heart size={17} fill={post.liked ? 'currentColor' : 'none'} /> {post.reactions}</button><button className="post-action"><MessageCircle size={17} /> {post.comments}</button><button className="post-action"><Send size={16} /> Partager</button><span className="felt-count"><Eye size={15} /> {post.felt} personnes ont ressenti la même chose</span></div></article>

  return <div className="home-app" id="home">
    <header className="home-header">
      <div className="home-header-inner">
        <HomeLogo />
        <div className="home-search"><Search size={16} /><input placeholder="Rechercher une pensée, une communauté…" aria-label="Rechercher" /></div>
        <div className="home-actions"><button aria-label="Rechercher" className="mobile-search"><Search size={19} /></button><button aria-label="Notifications" className="icon-button"><Bell size={19} /><i /></button><div className="profile-wrap"><button className="profile-button" onClick={() => setProfileOpen(!profileOpen)}><span className="profile-avatar">{displayName.slice(0, 1).toUpperCase()}</span><span className="profile-name">@{displayName}</span><ChevronRight size={15} /></button>{profileOpen && <div className="profile-menu"><span>Ton espace</span><button onClick={onSignOut}>Se déconnecter</button></div>}</div><button className="home-menu-button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Ouvrir la navigation">{mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}</button></div>
      </div>
    </header>

    <div className="home-layout">
      <aside className={mobileMenuOpen ? 'home-sidebar open' : 'home-sidebar'}><nav>{navButton('home', <Home size={18} />, 'Accueil')}{navButton('discover', <Compass size={18} />, 'Découvrir')}{navButton('messages', <MessageCircle size={18} />, 'Messages', '3')}{navButton('activity', <Heart size={18} />, 'Activité')}{navButton('profile', <UserRound size={18} />, 'Profil')}</nav><div className="sidebar-note"><Sparkles size={16} /><span><strong>Derrière le voile</strong><small>Une pensée choisie pour toi.</small></span></div><button className="sidebar-signout" onClick={onSignOut}>Quitter VEIL</button></aside>

      <main className="home-main">
        {activeView === 'discover' && <DiscoverView onSelectPost={(post) => { setActiveView('home'); setActiveTab(categories.find((item) => item.id === post.category)?.label || 'Pour toi') }} posts={posts} />}
        {activeView === 'activity' && <ActivityView />}
        {activeView === 'profile' && <ProfileView displayName={displayName} posts={posts} />}
        {activeView === 'messages' && <MessagesView />}
        {activeView === 'compose' && <section className="publish-view"><div className="home-eyebrow">Nouvelle publication</div><h1>Dis-le comme tu le penses.</h1><p>Choisis une voix, ajoute une image ou une vidéo, puis publie sans révéler ton identité réelle.</p><button className="button button-primary" onClick={() => { setActiveView('home'); setTimeout(() => document.querySelector('.composer textarea')?.focus(), 50) }}>Ouvrir le composer <Plus size={16} /></button></section>}
        {activeView !== 'home' && activeView !== 'discover' && activeView !== 'activity' && activeView !== 'profile' && activeView !== 'messages' && activeView !== 'compose' && null}
        {activeView === 'home' && <>
        <div className="home-greeting"><div><span className="home-eyebrow">Mardi · ton espace anonyme</span><h1>Bonjour, <em>@{displayName}</em></h1></div><div className="coin-pill">◈ <strong>200</strong> Coins</div></div>
        <section className="composer glass-panel"><div className="composer-head"><span className="composer-avatar">◌</span><span>Qu’est-ce que tu veux dire aujourd’hui ?</span></div><form onSubmit={publish}><textarea value={composerText} onChange={(event) => setComposerText(event.target.value)} placeholder="Écris quelque chose… personne ne saura que c’est toi." rows="3" />{mediaPreview && <div className="media-preview"><button type="button" onClick={() => { setMediaFile(null); setMediaPreview('') }} aria-label="Retirer le média"><X size={15} /></button>{mediaFile?.type.startsWith('video/') ? <video src={mediaPreview} controls /> : <img src={mediaPreview} alt="Aperçu du média" />}</div>}<div className="composer-footer"><div className="composer-tools"><label className="media-button"><ImagePlus size={16} /><span>Photo</span><input type="file" accept="image/*" onChange={selectMedia} /></label><label className="media-button"><Video size={16} /><span>Vidéo</span><input type="file" accept="video/*" onChange={selectMedia} /></label><div className="category-picker">{categories.map((category) => <button type="button" key={category.id} className={selectedCategory === category.id ? 'selected' : ''} onClick={() => setSelectedCategory(category.id)}><span>{category.icon}</span>{category.label}</button>)}</div></div><button className="publish-button" disabled={!composerText.trim()}>Publier anonymement <Send size={15} /></button></div></form></section>
        <div className="feed-heading"><div className="feed-tabs-home">{['Pour toi', 'Confessions', 'Pensées', 'Débats', 'Humour'].map((tab) => <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>{tab}</button>)}</div><button className="filter-button"><Sparkles size={15} /> Personnalisé</button></div>
        <div className="feed-list">{visiblePosts.map(renderPost)}</div>
        </>}
      </main>

      <aside className="home-rightbar"><section className="trends-card glass-panel"><div className="right-title"><span>🔥</span><h2>En ce moment sur VEIL</h2></div><div className="trend-list">{trends.map((trend, index) => <button key={trend}><span>0{index + 1}</span><strong>{trend}</strong><ChevronRight size={15} /></button>)}</div><button className="see-more">Voir toutes les tendances <ArrowIcon /></button></section><section className="veil-pick glass-panel"><div className="pick-label"><LockKeyhole size={15} /> Derrière le voile</div>{revealed ? <p>« J’ai toujours voulu partir. Je ne sais juste pas de quoi. »</p> : <><div className="blurred-thought">« J’ai toujours voulu partir. Je ne sais juste pas de quoi. »</div><button onClick={() => setRevealed(true)}>Voir une autre confession <ChevronRight size={15} /></button></>}<span className="pick-footer">Une pensée choisie au hasard</span></section><section className="creator-card"><div className="creator-icon"><Gift size={18} /></div><div><strong>Offre une présence</strong><small>Envoie un cadeau à une voix qui t’a touché.</small></div></section></aside>
    </div>
    <nav className="mobile-bottom-nav"><button className={activeView === 'home' ? 'active' : ''} onClick={() => navigate('home')}><Home size={19} /><small>Accueil</small></button><button className={activeView === 'discover' ? 'active' : ''} onClick={() => navigate('discover')}><Compass size={19} /><small>Découvrir</small></button><button className="mobile-publish" onClick={() => navigate('compose')}><Plus size={22} /></button><button className={activeView === 'activity' ? 'active' : ''} onClick={() => navigate('activity')}><Heart size={19} /><small>Activité</small></button><button className={activeView === 'profile' ? 'active' : ''} onClick={() => navigate('profile')}><UserRound size={19} /><small>Profil</small></button></nav>
    {toast && <div className="home-toast"><Sparkles size={16} /> {toast}</div>}
  </div>
}

function DiscoverView({ posts, onSelectPost }) { return <section className="product-view"><div className="home-eyebrow">Découvrir</div><h1>Quelque chose t’attend.</h1><p className="view-lead">Explore des pensées, des voix et des communautés que tu n’aurais peut-être jamais rencontrées ailleurs.</p><div className="discover-grid"><div className="discover-feature glass-panel"><span>✦</span><h2>Tendances VEIL</h2><p>Les sujets qui font parler la communauté en ce moment.</p>{['Les choses qu’on ne dit jamais', 'Une vérité que personne ne veut entendre', 'Votre plus grosse erreur ?'].map((item) => <button key={item} onClick={() => onSelectPost(posts[0])}>{item}<ChevronRight size={15} /></button>)}</div><div className="discover-feature glass-panel"><span>◌</span><h2>Voix à découvrir</h2><p>@Lueur · @Nocturne · @EntreDeux</p><button onClick={() => onSelectPost(posts[0])}>Voir les publications <ChevronRight size={15} /></button></div></div><div className="feed-list discover-posts">{posts.map((post) => <article className="home-post glass-panel" key={post.id}><div className="post-topline"><span className="post-avatar">{post.author.slice(0, 1)}</span><div><strong>@{post.author}</strong><small>Communauté · {categories.find((item) => item.id === post.category)?.label}</small></div></div><p className="home-post-text">« {post.text} »</p></article>)}</div></section> }
function ActivityView() { return <section className="product-view"><div className="home-eyebrow">Activité</div><h1>Ce qui s’est passé autour de toi.</h1><p className="view-lead">Retrouve ici tes réactions, tes conversations et les moments importants de ton espace VEIL.</p><div className="activity-list glass-panel">{[['♡', 'Lueur a aimé ta publication', 'il y a 4 min'], ['◌', 'Tu as reçu une réponse à ton Secret', 'il y a 18 min'], ['◈', 'Nocturne t’a envoyé 50 Coins', 'hier'], ['✦', 'Ton inscription à VEIL est confirmée', 'hier']].map(([icon, title, time]) => <div className="activity-row" key={title}><span>{icon}</span><div><strong>{title}</strong><small>{time}</small></div><ChevronRight size={15} /></div>)}</div></section> }
function ProfileView({ displayName, posts }) { return <section className="product-view"><div className="profile-hero glass-panel"><span className="large-profile-avatar">{displayName.slice(0, 1).toUpperCase()}</span><div><div className="home-eyebrow">Ton identité VEIL</div><h1>@{displayName}</h1><p>Une voix parmi d’autres. Libre de dire ce qu’elle pense.</p><span className="veil-number">N° VEIL · 482731</span></div><button className="button profile-edit">Modifier</button></div><div className="profile-stats"><span><strong>{posts.filter((post) => post.author === displayName).length}</strong> publications</span><span><strong>4</strong> communautés</span><span><strong>200</strong> Coins</span></div><h2 className="subheading">Tes publications</h2><div className="feed-list">{posts.filter((post) => post.author === displayName).map((post) => <article className="home-post glass-panel" key={post.id}><p className="home-post-text">« {post.text} »</p></article>)}</div></section> }
function MessagesView() { return <section className="product-view"><div className="home-eyebrow">Messages</div><h1>Des conversations qui prennent leur temps.</h1><p className="view-lead">Tes échanges anonymes apparaîtront ici. La confiance se construit à ton rythme.</p><div className="empty-product glass-panel"><MessageCircle size={28} /><strong>Aucune conversation pour le moment</strong><small>Quand quelqu’un voudra te parler, tu le verras ici.</small></div></section> }

function ArrowIcon() { return <ChevronRight size={15} /> }
