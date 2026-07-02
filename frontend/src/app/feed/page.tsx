'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import Link from 'next/link';
import { Calendar, MapPin, Users, Flame, Info, CheckCircle, Tag, ArrowRight } from 'lucide-react';

export default function Feed() {
  const [events, setEvents] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsData = await api.get('/events');
        const clubsData = await api.get('/clubs');
        setEvents(eventsData);
        setClubs(clubsData);
      } catch (err) {
        console.error('Failed to load feed data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredEvents = events.filter(e => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'tech') return e.themeConfig?.preset === 'cyber' || e.title.toLowerCase().includes('hack') || e.title.toLowerCase().includes('code');
    if (activeFilter === 'cultural') return e.themeConfig?.preset === 'concert' || e.title.toLowerCase().includes('beat') || e.title.toLowerCase().includes('fest');
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-12">
      
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

    </div>
  );
}
