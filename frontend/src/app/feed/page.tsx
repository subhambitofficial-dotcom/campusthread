'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import Link from 'next/link';
import { Calendar, MapPin, Users, Flame, Info, CheckCircle, Tag, ArrowRight, Film, Play, Volume2, VolumeX, Heart, ChevronLeft, ChevronRight, Trash2, X } from 'lucide-react';

// ─── Smart Video URL Converter ───────────────────────────────────────────────
// Converts any YouTube / Instagram / Facebook share link into a proper embed URL.
// Returns { embedUrl, type } where type is 'iframe' or 'video'
function getVideoEmbed(rawUrl: string): { embedUrl: string; type: 'iframe' | 'video'; thumbnail: string } {
  if (!rawUrl) return { embedUrl: '', type: 'video', thumbnail: '' };

  // ── YouTube ──────────────────────────────────────────────────────────────
  // Handles: youtu.be/ID, youtube.com/watch?v=ID, youtube.com/shorts/ID,
  //          youtube.com/embed/ID, m.youtube.com/watch?v=ID (including ?si=... parameters)
  const ytShort = rawUrl.match(/youtu\.be\/([^?&/#]+)/);
  const ytWatch = rawUrl.match(/[?&]v=([^?&/#]+)/);
  const ytShorts = rawUrl.match(/\/shorts\/([^?&/#]+)/);
  const ytEmbed = rawUrl.match(/\/embed\/([^?&/#]+)/);
  const ytId = (ytShort?.[1] || ytWatch?.[1] || ytShorts?.[1] || ytEmbed?.[1]) ?? null;
  if (ytId) {
    return {
      embedUrl: `https://www.youtube.com/embed/${ytId}?autoplay=1&loop=1&mute=1&playsinline=1&controls=1&rel=0`,
      type: 'iframe',
      thumbnail: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
    };
  }

  // ── Instagram ────────────────────────────────────────────────────────────
  // Handles: instagram.com/p/CODE, instagram.com/reel/CODE, instagram.com/tv/CODE
  const igMatch = rawUrl.match(/instagram\.com\/(p|reel|tv)\/([\w-]+)/);
  if (igMatch) {
    return {
      embedUrl: `https://www.instagram.com/${igMatch[1]}/${igMatch[2]}/embed/`,
      type: 'iframe',
      thumbnail: '',
    };
  }

  // ── Facebook ─────────────────────────────────────────────────────────────
  // Handles: facebook.com/watch?v=ID, fb.watch/CODE, facebook.com/reel/ID
  const fbWatch = rawUrl.match(/facebook\.com\/watch[\/?].*[?&]v=(\d+)/);
  const fbReel = rawUrl.match(/facebook\.com\/reel\/(\d+)/);
  const fbShort = rawUrl.match(/fb\.watch\/([\w-]+)/);
  if (fbWatch || fbReel) {
    const fbId = fbWatch?.[1] || fbReel?.[1];
    return {
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(rawUrl)}&width=400&show_text=false&appId`,
      type: 'iframe',
      thumbnail: '',
    };
  }
  if (fbShort) {
    return {
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(rawUrl)}&width=400&show_text=false`,
      type: 'iframe',
      thumbnail: '',
    };
  }

  // ── Direct video file (mp4, webm, base64, blob, etc.) ────────────────────
  return { embedUrl: rawUrl, type: 'video', thumbnail: '' };
}

export default function Feed() {
  const [events, setEvents] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [reels, setReels] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const [activeReelIndex, setActiveReelIndex] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const fetchData = async () => {
    try {
      const eventsData = await api.get('/events');
      const clubsData = await api.get('/clubs');
      const reelsData = await api.get('/reels');
      setEvents(eventsData);
      setClubs(clubsData);
      setReels(reelsData);
    } catch (err) {
      console.error('Failed to load feed data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setCurrentUser(api.getCurrentUser());
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeReelIndex === null) return;
      if (e.key === 'Escape') setActiveReelIndex(null);
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        if (activeReelIndex > 0) setActiveReelIndex(activeReelIndex - 1);
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        if (activeReelIndex < reels.length - 1) setActiveReelIndex(activeReelIndex + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeReelIndex, reels]);

  const handleToggleLike = async (reelId: string, index: number) => {
    if (!currentUser) {
      alert('Please enter campus (login) to like video reels.');
      return;
    }
    try {
      const updatedReel = await api.post(`/reels/${reelId}/like`, {});
      const updatedReels = [...reels];
      updatedReels[index] = updatedReel;
      setReels(updatedReels);
    } catch (err) {
      console.error('Failed to toggle like on reel:', err);
    }
  };

  const handleDeleteReel = async (reelId: string, index: number) => {
    if (!window.confirm('Are you sure you want to delete this reel?')) return;
    try {
      await api.delete(`/reels/${reelId}`);
      setReels(reels.filter(r => r.id !== reelId && (r._id !== reelId)));
      setActiveReelIndex(null);
    } catch (err) {
      console.error('Failed to delete reel:', err);
    }
  };

  const filteredEvents = events.filter(e => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'tech') return e.themeConfig?.preset === 'cyber' || e.title.toLowerCase().includes('hack') || e.title.toLowerCase().includes('code');
    if (activeFilter === 'cultural') return e.themeConfig?.preset === 'concert' || e.title.toLowerCase().includes('beat') || e.title.toLowerCase().includes('fest');
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-12">
      
      {/* ================= CAMPUS REELS / SHORTS SECTION ================= */}
      <section className="flex flex-col gap-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-brand-gold" />
            <h2 className="text-xl font-bold uppercase tracking-wider text-white">Campus Highlights & Reels</h2>
          </div>
          <span className="text-[10px] font-tech uppercase px-2 py-0.5 rounded-full border border-brand-gold/20 text-brand-gold tracking-wider">
            Live short-form updates
          </span>
        </div>

        {reels.length === 0 ? (
          <div className="p-8 text-center text-xs text-white/40 border border-dashed border-white/10 rounded-2xl glass">
            No campus reels posted yet.
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {reels.map((reel, index) => {
              const associatedClub = clubs.find(c => c.id === reel.clubId || c._id === reel.clubId);
              return (
                <div 
                  key={reel.id || reel._id}
                  onClick={() => setActiveReelIndex(index)}
                  className="relative w-36 h-60 rounded-2xl border border-white/10 overflow-hidden shrink-0 cursor-pointer group hover:border-brand-gold/50 transition-all duration-300 shadow-lg hover:scale-105"
                >
                  {/* Smart thumbnail: use YouTube thumbnail image, platform icon, or video element */}
                  {(() => {
                    const { type, thumbnail } = getVideoEmbed(reel.videoUrl);
                    if (type === 'iframe') {
                      return thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={reel.title}
                          className="w-full h-full object-cover pointer-events-none brightness-[0.7] group-hover:brightness-[0.9] group-hover:scale-105 transition-all duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-800 flex items-center justify-center">
                          <Film className="w-10 h-10 text-white/20" />
                        </div>
                      );
                    }
                    return (
                      <video
                        src={reel.videoUrl}
                        className="w-full h-full object-cover pointer-events-none brightness-[0.7] group-hover:brightness-[0.8] group-hover:scale-105 transition-all duration-500"
                        preload="metadata"
                        muted
                      />
                    );
                  })()}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="p-3 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white">
                      <Play className="w-5 h-5 fill-white text-white" />
                    </div>
                  </div>

                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center gap-1.5 overflow-hidden">
                    {associatedClub ? (
                      <img 
                        src={associatedClub.logo} 
                        alt="" 
                        className="w-4 h-4 rounded-full border border-white/20 object-cover shrink-0" 
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-brand-gold/20 flex items-center justify-center border border-brand-gold/30 shrink-0">
                        <Users className="w-2.5 h-2.5 text-brand-gold" />
                      </div>
                    )}
                    <span className="text-[9px] font-bold text-white truncate drop-shadow-md">
                      {associatedClub ? associatedClub.name : reel.postedBy}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-1 text-left">
                    <p className="text-[10px] font-bold text-white line-clamp-2 leading-tight drop-shadow-md">
                      {reel.title}
                    </p>
                    <div className="flex items-center gap-1 text-[9px] text-white/60 font-semibold drop-shadow-md">
                      <Heart className="w-3 h-3 text-brand-pink fill-brand-pink shrink-0" />
                      <span>{reel.likes?.length || 0}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ================= TRENDING CLUBS HEADER ROW ================= */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-brand-pink animate-pulse" />
          <h2 className="text-xl font-bold uppercase tracking-wider text-white">Trending Campus Communities</h2>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2].map(n => (
              <div key={n} className="h-24 rounded-xl bg-white/5 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {clubs.map(club => (
              <Link 
                key={club.id || club._id} 
                href={`/club/${club.slug}`}
                className="glass p-4 rounded-xl border border-white/5 flex items-center gap-4 group hover:border-brand-cyan/30 hover:bg-white/5 transition-all duration-300"
              >
                <img 
                  src={club.logo} 
                  alt={club.name} 
                  className="w-12 h-12 rounded-lg object-cover border border-white/10 shrink-0" 
                />
                <div className="overflow-hidden">
                  <h4 className="font-bold text-white text-sm group-hover:text-brand-cyan transition-colors truncate">{club.name}</h4>
                  <p className="text-xs text-white/50 truncate font-light">{club.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ================= ACTIVITY MATRIX FEED ================= */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              Ecosystem Activity Grid
            </h1>
            <p className="text-xs sm:text-sm text-white/50 mt-1">Discover, RSVP and participate in upcoming campus experiences</p>
          </div>

          {/* Filtering buttons */}
          <div className="flex items-center gap-2 self-start sm:self-center bg-white/5 border border-white/10 p-1 rounded-full">
            <button 
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${activeFilter === 'all' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
            >
              All Drops
            </button>
            <button 
              onClick={() => setActiveFilter('tech')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${activeFilter === 'tech' ? 'bg-brand-cyan text-black shadow-[0_0_10px_rgba(0,240,255,0.3)]' : 'text-white/60 hover:text-white'}`}
            >
              Tech Grid
            </button>
            <button 
              onClick={() => setActiveFilter('cultural')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${activeFilter === 'cultural' ? 'bg-brand-pink text-black shadow-[0_0_10px_rgba(255,0,127,0.3)]' : 'text-white/60 hover:text-white'}`}
            >
              Cultural
            </button>
          </div>
        </div>

        {/* Loading/Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map(n => (
              <div key={n} className="h-80 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="glass p-12 rounded-2xl text-center border border-white/5">
            <Info className="w-8 h-8 text-white/40 mx-auto mb-2" />
            <h4 className="text-white font-bold text-lg">No Active Drops Available</h4>
            <p className="text-sm text-white/50">Check back later or launch an event from the Admin Builder.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredEvents.map(event => {
              // Custom preset styling
              const isCyber = event.themeConfig?.preset === 'cyber';
              const isConcert = event.themeConfig?.preset === 'concert';
              
              let accentColor = 'border-brand-purple hover:border-brand-purple/50';
              let badgeColor = 'bg-brand-purple/20 text-brand-purple';
              if (isCyber) {
                accentColor = 'hover:border-brand-cyan/40';
                badgeColor = 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30';
              } else if (isConcert) {
                accentColor = 'hover:border-brand-pink/40';
                badgeColor = 'bg-brand-pink/20 text-brand-pink border border-brand-pink/30';
              }

              return (
                <div 
                  key={event.id || event._id}
                  className={`glass rounded-2xl border border-white/5 flex flex-col overflow-hidden group transition-all duration-300 ${accentColor}`}
                >
                  {/* Banner Image */}
                  <div className="h-48 w-full relative overflow-hidden">
                    <img 
                      src={event.poster} 
                      alt={event.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    
                    {/* Floating theme preset indicator */}
                    <span className={`absolute top-4 left-4 text-[10px] uppercase font-tech font-bold px-3 py-1 rounded-full ${badgeColor}`}>
                      {event.themeConfig?.preset || 'cinematic'} preset
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-grow flex flex-col gap-4">
                    <div>
                      <h3 className="text-2xl font-black text-white leading-tight group-hover:text-brand-cyan transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-xs text-white/40 mt-1 font-mono tracking-tight">{event.tagline}</p>
                    </div>

                    <p className="text-sm text-white/60 line-clamp-3 leading-relaxed">
                      {event.description}
                    </p>

                    {/* Metadata details row */}
                    <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-white/5 text-xs text-white/50 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-brand-cyan shrink-0" />
                        <span>{new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-brand-pink shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>

                    {/* Actions button */}
                    <div className="flex items-center justify-between gap-4 pt-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-white/70">
                        <CheckCircle className="w-4 h-4 text-brand-neon" />
                        <span>Instant RSVP Live</span>
                      </div>
                      <Link 
                        href={`/event/${event.slug}`}
                        className="flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-black bg-white px-4 py-2.5 rounded-full hover:scale-105 active:scale-95 transition-all"
                      >
                        Enter Microsite <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ================= REELS INTERACTIVE PLAY OVERLAY ================= */}
      {activeReelIndex !== null && reels[activeReelIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
          {/* Close button outside player */}
          <button 
            onClick={() => setActiveReelIndex(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white hover:text-brand-pink transition-all"
            title="Close Reels"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Swipe controls - Prev */}
          {activeReelIndex > 0 && (
            <button 
              onClick={() => setActiveReelIndex(activeReelIndex - 1)}
              className="absolute left-4 sm:left-12 p-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-white hover:scale-105 active:scale-95 transition-all"
              title="Previous Reel"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Swipe controls - Next */}
          {activeReelIndex < reels.length - 1 && (
            <button 
              onClick={() => setActiveReelIndex(activeReelIndex + 1)}
              className="absolute right-4 sm:right-12 p-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-white hover:scale-105 active:scale-95 transition-all"
              title="Next Reel"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Core Player Frame */}
          <div className="relative w-full max-w-sm h-[85vh] rounded-3xl overflow-hidden border border-white/10 bg-zinc-950 flex flex-col justify-between shadow-2xl animate-float">
            {/* Smart player: iframe for embed links, video for direct files */}
            {(() => {
              const { embedUrl, type } = getVideoEmbed(reels[activeReelIndex].videoUrl);
              if (type === 'iframe') {
                return (
                  <iframe
                    key={reels[activeReelIndex].id || reels[activeReelIndex]._id}
                    src={embedUrl}
                    className="absolute inset-0 w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    style={{ border: 'none' }}
                  />
                );
              }
              return (
                <video
                  key={reels[activeReelIndex].id || reels[activeReelIndex]._id}
                  src={embedUrl}
                  className="absolute inset-0 w-full h-full object-cover"
                  autoPlay
                  loop
                  muted={isMuted}
                />
              );
            })()}

            {/* Dark overlay gradients */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 pointer-events-none" />

            {/* Top Bar Details */}
            <div className="relative z-10 p-5 flex items-center justify-between text-left">
              <div className="flex items-center gap-2">
                {clubs.find(c => c.id === reels[activeReelIndex].clubId || c._id === reels[activeReelIndex].clubId) ? (
                  <img 
                    src={clubs.find(c => c.id === reels[activeReelIndex].clubId || c._id === reels[activeReelIndex].clubId).logo} 
                    alt="" 
                    className="w-8 h-8 rounded-full border border-white/20 object-cover shrink-0" 
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-brand-gold/15 flex items-center justify-center border border-brand-gold/30 shrink-0">
                    <Users className="w-4 h-4 text-brand-gold" />
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-xs text-white">
                    {clubs.find(c => c.id === reels[activeReelIndex].clubId || c._id === reels[activeReelIndex].clubId)?.name || reels[activeReelIndex].postedBy}
                  </h4>
                  <p className="text-[10px] text-white/50">Posted on CampusThread</p>
                </div>
              </div>

              {/* Mute toggle button */}
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-full bg-black/40 backdrop-blur-sm border border-white/5 text-white/80 hover:text-white"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Right-aligned Vertical Interactions Dashboard */}
            <div className="relative z-10 self-end mr-4 mb-20 flex flex-col items-center gap-6">
              {/* Like action */}
              <button 
                onClick={() => handleToggleLike(reels[activeReelIndex].id, activeReelIndex)}
                className="flex flex-col items-center gap-1 focus:outline-none"
              >
                <div className="p-3.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/5 text-white hover:scale-110 active:scale-95 transition-all">
                  <Heart 
                    className={`w-5 h-5 transition-all ${
                      currentUser && reels[activeReelIndex].likes?.includes(currentUser.id) 
                        ? 'text-brand-pink fill-brand-pink' 
                        : 'text-white'
                    }`} 
                  />
                </div>
                <span className="text-[10px] font-bold text-white drop-shadow-md">
                  {reels[activeReelIndex].likes?.length || 0}
                </span>
              </button>

              {/* Delete action (Admin only) */}
              {currentUser && ['Super Admin', 'Club Admin', 'Event Manager', 'Merch Manager'].includes(currentUser.role) && (
                <button 
                  onClick={() => handleDeleteReel(reels[activeReelIndex].id, activeReelIndex)}
                  className="flex flex-col items-center gap-1 focus:outline-none"
                >
                  <div className="p-3.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/5 text-brand-pink hover:bg-brand-pink/20 hover:scale-110 active:scale-95 transition-all">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-brand-pink drop-shadow-md">Delete</span>
                </button>
              )}
            </div>

            {/* Bottom Caption Block */}
            <div className="relative z-10 p-5 text-left flex flex-col gap-2">
              <p className="text-sm font-semibold text-white leading-snug drop-shadow-md">
                {reels[activeReelIndex].title}
              </p>
              
              {/* Associated Club Tag */}
              {clubs.find(c => c.id === reels[activeReelIndex].clubId || c._id === reels[activeReelIndex].clubId) && (
                <Link 
                  href={`/club/${clubs.find(c => c.id === reels[activeReelIndex].clubId || c._id === reels[activeReelIndex].clubId).slug}`}
                  className="w-fit text-[10px] font-bold uppercase tracking-wider text-brand-cyan hover:underline bg-brand-cyan/10 border border-brand-cyan/20 px-2.5 py-0.5 rounded-full"
                >
                  Visit Club
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
