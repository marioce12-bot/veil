import { useEffect, useMemo, useState } from 'react'
import {
  ChevronRight,
  Compass,
  Eye,
  Gift,
  Heart,
  Home,
  LockKeyhole,
  Settings,
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
import './settings-panels.css'

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
  const [toast, setToast] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const [activeView, setActiveView] = useState('home')
  const [mediaFile, setMediaFile] = useState(null)
  const [mediaPreview, setMediaPreview] = useState('')
  const [activityFilter, setActivityFilter] = useState('Tout')
  const [messageView, setMessageView] = useState('inbox')
  const [messageRequest, setMessageRequest] = useState(null)
  const [conversationText, setConversationText] = useState('')
  const [conversationMessages, setConversationMessages] = useState([])
  const [settingsSection, setSettingsSection] = useState('preferences')
  const [publicProfile, setPublicProfile] = useState(null)
  const [followedUsers, setFollowedUsers] = useState([])

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
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openPublicProfile = (author) => {
    setPublicProfile(author)
    setActiveView('public-profile')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleFollow = (author) => setFollowedUsers((current) => current.includes(author) ? current.filter((name) => name !== author) : [...current, author])

  const navButton = (view, icon, label, count) => <button className={activeView === view ? 'active' : ''} onClick={() => navigate(view)}>{icon} {label} {count && <b className="nav-count">{count}</b>}</button>

  const renderPost = (post) => <article className="home-post glass-panel" key={post.id}><div className="post-topline"><button className="post-author-link" onClick={() => openPublicProfile(post.author)}><span className="post-avatar">{post.author.slice(0, 1)}</span><span><strong>@{post.author}</strong><small>il y a {post.time} · {categories.find((item) => item.id === post.category)?.label}</small></span></button><button className="post-more" aria-label="Plus d’options"><MoreHorizontal size={18} /></button></div><p className="home-post-text">« {post.text} »</p>{post.media && (post.mediaType?.startsWith('video/') ? <video className="post-media" src={post.media} controls /> : <img className="post-media" src={post.media} alt="Média publié anonymement" />)}<div className="post-footer"><button className={post.liked ? 'post-action liked' : 'post-action'} onClick={() => toggleLike(post.id)}><Heart size={17} fill={post.liked ? 'currentColor' : 'none'} /> {post.reactions}</button><button className="post-action"><MessageCircle size={17} /> {post.comments}</button><button className="post-action"><Send size={16} /> Partager</button><span className="felt-count"><Eye size={15} /> {post.felt} personnes ont ressenti la même chose</span></div></article>

  return <div className="home-app" id="home">
    <header className="home-header">
      <div className="home-header-inner">
        <HomeLogo />
        <div className="home-search"><Search size={16} /><input placeholder="Rechercher une pensée, une communauté…" aria-label="Rechercher" /></div>
        <div className="home-actions"><button aria-label="Rechercher" className="mobile-search"><Search size={19} /></button><button aria-label="Messages" className="icon-button" onClick={() => navigate('messages')}><MessageCircle size={19} /></button><div className="profile-wrap"><button className="profile-button" onClick={() => setProfileOpen(!profileOpen)}><span className="profile-avatar">{displayName.slice(0, 1).toUpperCase()}</span><span className="profile-name">@{displayName}</span><ChevronRight size={15} /></button>{profileOpen && <div className="profile-menu"><span>Ton espace</span><button onClick={() => navigate('profile')}>Voir mon profil</button><button onClick={onSignOut}>Se déconnecter</button></div>}</div><button className="home-menu-button settings-button" onClick={() => navigate('settings')} aria-label="Ouvrir les paramètres"><Settings size={19} /></button></div>
      </div>
    </header>

    <div className="home-layout">
      <main className="home-main">
        {activeView === 'discover' && <DiscoverView onSelectPost={(post) => { setActiveView('home'); setActiveTab(categories.find((item) => item.id === post.category)?.label || 'Pour toi') }} posts={posts} />}
        {activeView === 'activity' && <ActivityView filter={activityFilter} setFilter={setActivityFilter} />}
        {activeView === 'profile' && <ProfileView displayName={displayName} posts={posts} />}
        {activeView === 'public-profile' && publicProfile && <PublicProfileView author={publicProfile} posts={posts} followed={followedUsers.includes(publicProfile)} onFollow={() => toggleFollow(publicProfile)} />}
        {activeView === 'messages' && <MessagesView view={messageView} setView={setMessageView} request={messageRequest} setRequest={setMessageRequest} messages={conversationMessages} text={conversationText} setText={setConversationText} onSend={() => { if (!conversationText.trim()) return; setConversationMessages([...conversationMessages, { from: 'toi', text: conversationText.trim() }]); setConversationText('') }} />}
        {activeView === 'settings' && <SettingsView section={settingsSection} setSection={setSettingsSection} onSignOut={onSignOut} />}
        {activeView === 'compose' && <PublishView composerText={composerText} setComposerText={setComposerText} mediaFile={mediaFile} mediaPreview={mediaPreview} selectMedia={selectMedia} setMediaFile={setMediaFile} setMediaPreview={setMediaPreview} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} publish={publish} />}
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

function DiscoverView({ posts, onSelectPost }) { return <section className="product-view"><div className="home-eyebrow">Découvrir</div><h1>Les voix derrière les profils.</h1><p className="view-lead">Découvre des personnes, des Creators et des communautés. Le feed reste dans Accueil.</p><div className="discover-search glass-panel"><Search size={17} /><input placeholder="Chercher un pseudo, un numéro VEIL ou une communauté" /></div><div className="discover-grid"><div className="discover-feature glass-panel"><span>✦</span><h2>Profils à découvrir</h2><p>Des identités VEIL qui font vivre la communauté.</p>{['Lueur', 'Nocturne', 'EntreDeux'].map((name, index) => <button key={name}><span className="discover-avatar">{name[0]}</span><strong>@{name}</strong><small>{[124, 89, 61][index]} abonnés</small><ChevronRight size={15} /></button>)}</div><div className="discover-feature glass-panel"><span>◌</span><h2>Communautés actives</h2><p>Des espaces où les conversations commencent.</p>{['Confessions', 'Pensées', 'Débats'].map((name, index) => <button key={name}><span className="discover-community">{['◌', '☾', '✦'][index]}</span><strong>{name}</strong><small>{[12400, 16200, 8800][index].toLocaleString('fr-FR')} membres</small><ChevronRight size={15} /></button>)}</div></div><div className="discover-creators glass-panel"><div><span className="home-eyebrow">Creators VEIL</span><h2>Des voix à suivre</h2></div><div className="creator-row">{posts.slice(0, 3).map((post) => <button key={post.author} onClick={() => onSelectPost(post)}><span className="discover-avatar">{post.author[0]}</span><strong>@{post.author}</strong><small>{post.felt + 37} abonnés</small></button>)}</div></div></section> }
function ActivityView({ filter, setFilter }) { const groups = { Tout: [['♡', 'Lueur a aimé ta publication', 'il y a 8 min'], ['💬', 'Une personne a répondu à ta publication', 'il y a 24 min'], ['👥', 'Une nouvelle discussion est populaire dans Pensées nocturnes', 'il y a 1 h'], ['🔖', 'Tu as enregistré une publication', 'hier']], Réactions: [['♡', '12 nouvelles réactions sur tes publications', 'il y a 8 min']], Réponses: [['💬', 'Une personne a répondu à ta publication', 'il y a 24 min'], ['💬', 'Tu as participé à une discussion', 'hier']], Mentions: [['@', 'Tu as été mentionné dans une discussion', 'hier']] }; const items = groups[filter] || groups.Tout; return <section className="product-view"><div className="activity-title-row"><div><div className="home-eyebrow">Activité</div><h1>Ce qui s’est passé autour de toi.</h1></div><button className="icon-button" aria-label="Paramètres des notifications">⚙</button></div><p className="view-lead">Retrouve tes réactions, réponses, mentions et activités communautaires.</p><div className="activity-filters">{Object.keys(groups).map((name) => <button key={name} className={filter === name ? 'active' : ''} onClick={() => setFilter(name)}>{name}</button>)}</div><h2 className="activity-period">Aujourd’hui</h2><div className="activity-list glass-panel">{items.map(([icon, title, time]) => <div className="activity-row" key={title}><span>{icon}</span><div><strong>{title}</strong><small>{time}</small></div><ChevronRight size={15} /></div>)}</div><h2 className="activity-period">Tes discussions</h2><div className="activity-list glass-panel"><div className="activity-row"><span>💬</span><div><strong>Est-ce qu’on peut vraiment oublier quelqu’un ?</strong><small>12 réponses · il y a 18 min</small></div><ChevronRight size={15} /></div><div className="activity-row"><span>💬</span><div><strong>Une vérité que personne ne veut entendre</strong><small>5 réponses · hier</small></div><ChevronRight size={15} /></div></div><h2 className="activity-period">Tes communautés</h2><div className="activity-list glass-panel"><div className="activity-row"><span>👥</span><div><strong>Pensées nocturnes</strong><small>3 nouvelles discussions</small></div><ChevronRight size={15} /></div><div className="activity-row"><span>👥</span><div><strong>Relations & amour</strong><small>1 nouvelle activité</small></div><ChevronRight size={15} /></div></div></section> }
function ProfileView({ displayName, posts }) { const ownPosts = posts.filter((post) => post.author === displayName); return <section className="product-view"><div className="profile-hero glass-panel"><span className="large-profile-avatar">{displayName.slice(0, 1).toUpperCase()}</span><div><div className="home-eyebrow">Ton identité VEIL</div><h1>@{displayName}</h1><p>Une voix parmi d’autres. Libre de dire ce qu’elle pense.</p><span className="veil-number">N° VEIL · 482731</span></div><button className="button profile-edit">Modifier</button><button className="icon-button" aria-label="Options du profil">···</button></div><div className="profile-stats"><span><strong>{ownPosts.length}</strong> publications</span><span><strong>0</strong> réponses</span><span><strong>200</strong> Coins</span></div><section className="about-panel"><h2>À propos</h2><p>Une voix parmi d’autres. Libre de dire ce qu’elle pense.</p><span>Membre depuis septembre 2026</span></section><div className="profile-tabs"><button className="active">Publications</button><button>Réponses</button><button>Enregistrés</button></div><h2 className="subheading">Mon activité</h2><div className="feed-list">{ownPosts.length ? ownPosts.map((post) => <article className="home-post glass-panel" key={post.id}><p className="home-post-text">« {post.text} »</p></article>) : <div className="empty-product glass-panel"><strong>Tu n’as encore rien publié.</strong><small>Tes publications apparaîtront ici.</small><button className="button button-primary">Publier anonymement</button></div>}</div><section className="profile-settings"><h2>Paramètres</h2><button>🔒 Confidentialité <ChevronRight size={15} /></button><button>⚙️ Préférences <ChevronRight size={15} /></button><button>❓ Aide & assistance <ChevronRight size={15} /></button></section></section> }
function PublicProfileView({ author, posts, followed, onFollow }) { const authorPosts = posts.filter((post) => post.author === author); const followers = 124 + author.length * 17 + (followed ? 1 : 0); return <section className="product-view"><div className="public-profile-header glass-panel"><span className="large-profile-avatar">{author.slice(0, 1)}</span><div className="public-profile-copy"><div className="home-eyebrow">Identité publique VEIL</div><h1>@{author}</h1><p>Je dis ici ce que je ne dis nulle part ailleurs. Une voix anonyme, des pensées sincères.</p><span className="veil-number">N° VEIL · {String(482731 + author.length * 113).padStart(6, '0')}</span><div className="profile-interests"><span className="profile-interest">Pensées</span><span className="profile-interest">Confessions</span><span className="profile-interest">Relations</span></div></div><div className="public-profile-actions"><button className={followed ? 'follow-button following' : 'follow-button'} onClick={onFollow}>{followed ? 'Abonné' : 'Suivre'}</button><button className="icon-button" aria-label="Plus d’options"><MoreHorizontal size={18} /></button></div></div><div className="public-profile-meta"><span><strong>{followers}</strong> abonnés</span><span><strong>{Math.max(12, author.length * 3 + 8)}</strong> abonnements</span><span><strong>{authorPosts.length}</strong> publications</span><span><strong>4</strong> communautés</span></div><div className="profile-tabs"><button className="active">Publications</button><button>Confessions</button><button>Pensées</button><button>Débats</button></div><h2 className="subheading">Publications de @{author}</h2><div className="feed-list">{authorPosts.length ? authorPosts.map((post) => <article className="home-post glass-panel" key={post.id}><p className="home-post-text">« {post.text} »</p>{post.media && (post.mediaType?.startsWith('video/') ? <video className="post-media" src={post.media} controls /> : <img className="post-media" src={post.media} alt="Publication" />)}</article>) : <div className="empty-product glass-panel"><strong>Cette voix n’a pas encore publié.</strong><small>Reviens plus tard découvrir ses pensées.</small></div>}</div></section> }
function MessagesView({ view, setView, request, setRequest, messages, text, setText, onSend }) { if (view === 'conversation') return <section className="product-view"><button className="back-link" onClick={() => setView('inbox')}>← Messages</button><div className="conversation-header"><span className="discover-avatar">A</span><div><strong>Anonyme #4821</strong><small>Conversation acceptée</small></div><button className="icon-button">···</button></div><div className="context-message glass-panel"><span>Conversation commencée depuis</span><strong>« Je crois que je suis devenu quelqu’un que je n’aime plus. »</strong><button>Voir la publication</button></div><div className="conversation-thread">{messages.map((message, index) => <div className={`message-line ${message.from === 'toi' ? 'mine' : ''}`} key={`${message.text}-${index}`}>{message.text}</div>)}</div><form className="message-composer" onSubmit={(event) => { event.preventDefault(); onSend() }}><input value={text} onChange={(event) => setText(event.target.value)} placeholder="Écrire un message…" /><button aria-label="Envoyer"><Send size={17} /></button></form></section>
  return <section className="product-view"><div className="messages-title-row"><div><div className="home-eyebrow">Messages</div><h1>Des conversations qui prennent leur temps.</h1></div><button className="icon-button">✎</button></div><div className="message-search glass-panel"><Search size={16} /><input placeholder="Rechercher une conversation" /></div><button className="message-request glass-panel" onClick={() => setRequest('Shadow')}><span className="discover-avatar">S</span><div><strong>Demandes de messages · 1</strong><small>@Shadow souhaite démarrer une conversation</small></div><ChevronRight size={16} /></button>{request && <div className="request-card glass-panel"><div><strong>@{request} souhaite démarrer une conversation</strong><p>« J’ai lu ta publication et j’aimerais te parler. »</p></div><div><button className="follow-button" onClick={() => { setRequest(null); setView('conversation') }}>Accepter</button><button className="follow-button following" onClick={() => setRequest(null)}>Refuser</button></div></div>}<div className="message-list glass-panel"><button onClick={() => setView('conversation')}><span className="discover-avatar">A</span><div><strong>Anonyme #4821</strong><small>Ça m’a vraiment parlé.</small></div><span>il y a 4 min</span></button><button onClick={() => setView('conversation')}><span className="discover-avatar">N</span><div><strong>Anonyme #7314</strong><small>Tu as raison concernant…</small></div><span>il y a 2 h</span></button></div></section> }

function SettingsView({ section, setSection, onSignOut }) { const sections = [['preferences', '⚙️ Préférences'], ['privacy', '🔒 Confidentialité'], ['terms', '📜 Conditions'], ['security', '🛡️ Sécurité'], ['help', '❓ Aide & assistance']]; return <section className="product-view settings-view"><div className="home-eyebrow">Compte</div><h1>Paramètres</h1><div className="settings-layout"><nav className="settings-nav">{sections.map(([id, label]) => <button key={id} className={section === id ? 'active' : ''} onClick={() => setSection(id)}>{label}<ChevronRight size={15} /></button>)}<button className="settings-signout" onClick={onSignOut}>Se déconnecter</button></nav><div className="settings-content glass-panel">{section === 'preferences' && <PreferencesPanel />}{section === 'privacy' && <PrivacyPanel />}{section === 'terms' && <TermsPanel />}{section === 'security' && <SecurityPanel />}{section === 'help' && <HelpPanel />}</div></div></section> }

function PreferencesPanel() { const [reducedMotion, setReducedMotion] = useState(false); const [autoplay, setAutoplay] = useState(true); const [messageRequests, setMessageRequests] = useState(true); return <><h2>Préférences</h2><p>Personnalise ton expérience VEIL sans modifier ton identité publique.</p><div className="preference-group"><h3>Apparence</h3><SettingRow title="Thème" description="Sombre" control={<span className="setting-value">Sombre</span>} /><SettingRow title="Langue" description="Choisir la langue de VEIL" control={<span className="setting-value">Français</span>} /></div><div className="preference-group"><h3>Expérience</h3><SettingRow title="Animations" description="Réduire les animations de l’interface" control={<Toggle checked={reducedMotion} onChange={() => setReducedMotion(!reducedMotion)} />} /><SettingRow title="Lecture automatique" description="Lire automatiquement les vidéos du feed" control={<Toggle checked={autoplay} onChange={() => setAutoplay(!autoplay)} />} /></div><div className="preference-group"><h3>Messages</h3><SettingRow title="Demandes de messages" description="Recevoir les demandes de conversation" control={<Toggle checked={messageRequests} onChange={() => setMessageRequests(!messageRequests)} />} /></div></> }
function PrivacyPanel() { return <><h2>Confidentialité</h2><p>Ton identité VEIL est publique. Ton adresse e-mail et les informations utilisées pour sécuriser ton compte ne le sont pas.</p><div className="legal-copy"><h3>Ce que VEIL collecte</h3><p>VEIL peut traiter les informations nécessaires à l’authentification, ton pseudonyme, tes contenus, les données techniques de connexion et les journaux nécessaires à la sécurité.</p><h3>Ce que VEIL ne fait pas</h3><p>VEIL ne vend pas tes données personnelles et ne partage pas volontairement ton identité réelle avec les autres utilisateurs.</p><h3>Anonymat et sécurité</h3><p>L’anonymat est public vis-à-vis des autres utilisateurs, mais certaines données techniques peuvent être conservées pour prévenir les abus ou respecter une obligation légale.</p><h3>Tes droits</h3><p>Tu peux demander l’accès, la rectification ou la suppression de tes données à privacy@veil.app.</p></div></> }
function TermsPanel() { return <><h2>Conditions d’utilisation</h2><p>VEIL est un espace d’expression anonyme. L’anonymat ne donne pas le droit de nuire aux autres.</p><div className="legal-copy"><h3>Comportements interdits</h3><p>Les menaces, le harcèlement, le doxxing, le chantage, l’usurpation d’identité, les escroqueries, le spam et les contenus illégaux sont interdits.</p><h3>Messages privés</h3><p>Les conversations privées restent soumises aux règles VEIL. Tu peux bloquer ou signaler un utilisateur.</p><h3>Modération</h3><p>VEIL peut supprimer un contenu, limiter une fonctionnalité ou suspendre un compte en cas de violation.</p><h3>Contact</h3><p>Pour toute question : support@veil.app.</p></div></> }
function SecurityPanel() { return <><h2>Sécurité</h2><p>Protège ton compte et garde le contrôle de tes sessions.</p><div className="settings-action-list"><button>Modifier le mot de passe <ChevronRight size={15} /></button><button>Voir les sessions actives <ChevronRight size={15} /></button><button>Se déconnecter de tous les appareils <ChevronRight size={15} /></button><button>Demander la suppression de mes données <ChevronRight size={15} /></button></div></> }
function HelpPanel() { return <><h2>Aide & assistance</h2><p>Comment pouvons-nous t’aider ?</p><div className="help-grid">{['Comment publier anonymement ?', 'Comment modifier mon profil ?', 'Comment supprimer une publication ?', 'Comment accepter une demande de message ?', 'Comment fonctionne l’anonymat ?', 'Je rencontre un problème technique'].map((item) => <button key={item}>{item}<ChevronRight size={15} /></button>)}</div><div className="support-box"><strong>Tu n’as pas trouvé ta réponse ?</strong><span>Contacte l’assistance à support@veil.app</span></div></> }
function SettingRow({ title, description, control }) { return <div className="setting-row"><div><strong>{title}</strong><small>{description}</small></div>{control}</div> }
function Toggle({ checked, onChange }) { return <button className={checked ? 'toggle checked' : 'toggle'} onClick={onChange} aria-pressed={checked}><span /></button> }
function PublishView({ composerText, setComposerText, mediaFile, mediaPreview, selectMedia, setMediaFile, setMediaPreview, selectedCategory, setSelectedCategory, publish }) { return <section className="publish-view product-view"><div className="home-eyebrow">Nouvelle publication</div><h1>Dis-le comme tu le penses.</h1><p className="view-lead">Choisis une catégorie, ajoute ton texte ou un média, puis publie sous ton pseudonyme VEIL.</p><form className="publish-editor glass-panel" onSubmit={publish}><textarea value={composerText} onChange={(event) => setComposerText(event.target.value)} placeholder="Écris quelque chose…" rows="7" />{mediaPreview && <div className="media-preview"><button type="button" onClick={() => { setMediaFile(null); setMediaPreview('') }} aria-label="Retirer le média"><X size={15} /></button>{mediaFile?.type.startsWith('video/') ? <video src={mediaPreview} controls /> : <img src={mediaPreview} alt="Aperçu" />}</div>}<div className="publish-category-row">{categories.map((category) => <button type="button" key={category.id} className={selectedCategory === category.id ? 'selected' : ''} onClick={() => setSelectedCategory(category.id)}>{category.icon} {category.label}</button>)}</div><div className="publish-editor-footer"><label className="media-button"><ImagePlus size={16} /> Ajouter une photo<input type="file" accept="image/*" onChange={selectMedia} /></label><label className="media-button"><Video size={16} /> Ajouter une vidéo<input type="file" accept="video/*" onChange={selectMedia} /></label><button className="publish-button" disabled={!composerText.trim()}>Publier anonymement <Send size={15} /></button></div></form></section> }

function ArrowIcon() { return <ChevronRight size={15} /> }
