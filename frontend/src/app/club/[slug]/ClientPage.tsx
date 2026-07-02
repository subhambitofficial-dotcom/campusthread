'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../utils/api';
import Link from 'next/link';
import { Award, Users, Calendar, ArrowLeft, Github, Twitter, Instagram, Globe, HelpCircle } from 'lucide-react';

export default function ClubDetails({ params }: { params: { slug: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClub = async () => {
      try {
        const res = await api.get(`/clubs/${params.slug}`);
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Club profiles not resolved.');
      } finally {
        setLoading(false);
      }
    };
    fetchClub();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="w-full flex-grow flex items-center justify-center p-12">
        <div className="w-12 h-12 rounded-full border-t-2 border-brand-cyan animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-20 text-center flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-brand-pink">Club Showcase Offline</h2>
        <p className="text-sm text-white/50">{error || 'This campus club is currently not registered on CampusThread.'}</p>
        <Link href="/feed" className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-white text-xs font-semibold uppercase tracking-wider">
          Back to Feed
        </Link>
      </div>
    );
  }

  const { club, events } = data;

  return (
    <div className="w-full relative flex flex-col">
      
      {/* ================= COVER BANNER ================= */}
      <div className="h-64 sm:h-80 w-full relative">
        <img 
          src={club.banner} 
          alt={club.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <Link 
          href="/feed" 
          className="absolute top-6 left-6 inline-flex items-center gap-1.5 px-4 py-2 rounded-full glass border border-white/10 text-xs font-bold text-white hover:bg-white/5 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Feed
        </Link>
      </div>

      {/* ================= PROFILE INFO ROW ================= */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative">
        <div className="flex flex-col lg:flex-row gap-8 items-start -mt-20">
          
          {/* Logo Node */}
          <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-black shrink-0 relative bg-card shadow-2xl">
            <img src={club.logo} alt={club.name} className="w-full h-full object-cover" />
          </div>

          {/* Texts Header */}
          <div className="flex-grow pt-2">
            <h1 className="text-3xl sm:text-5xl font-black text-white">{club.name}</h1>
            <p className="text-sm sm:text-base text-brand-cyan font-tech uppercase tracking-wider mt-1">{club.tagline}</p>
            
            {/* Social channels */}
            <div className="flex gap-4 mt-4 items-center">
              {club.socialLinks?.github && <Link href={club.socialLinks.github} target="_blank" className="p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:text-brand-cyan transition-colors"><Github className="w-4 h-4" /></Link>}
              {club.socialLinks?.twitter && <Link href={club.socialLinks.twitter} target="_blank" className="p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:text-brand-cyan transition-colors"><Twitter className="w-4 h-4" /></Link>}
              {club.socialLinks?.instagram && <Link href={club.socialLinks.instagram} target="_blank" className="p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:text-brand-pink transition-colors"><Instagram className="w-4 h-4" /></Link>}
            </div>
          </div>
        </div>

        {/* ================= CORE GRID DETAILS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
          
          {/* Column 1 & 2: About & Team */}
          <div className="lg:col-span-2 flex flex-col gap-10">
            
            {/* About Block */}
            <div className="glass p-8 rounded-2xl border border-white/5">
              <h3 className="text-xl font-bold mb-4 text-white">About the Club</h3>
              <p className="text-sm sm:text-base text-white/70 leading-relaxed font-light">{club.description}</p>
            </div>

            {/* Achievements Block */}
            <div className="glass p-8 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 mb-6">
                <Award className="w-5 h-5 text-brand-gold" />
                <h3 className="text-xl font-bold text-white">Achievements & Milestones</h3>
              </div>
              <ul className="flex flex-col gap-4">
                {club.achievements?.map((ach: string, idx: number) => (
                  <li key={idx} className="flex gap-3 text-sm text-white/70 items-start">
                    <span className="w-5 h-5 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold text-xs font-bold shrink-0">{idx+1}</span>
                    <span className="leading-relaxed">{ach}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Core Team Block */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-brand-cyan" />
                <h3 className="text-xl font-bold text-white">Advisory Board & Executive Team</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {club.team?.map((member: any, idx: number) => (
                  <div key={idx} className="glass p-4 rounded-xl border border-white/5 flex flex-col items-center text-center gap-3">
                    <img 
                      src={member.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80'} 
                      alt={member.name} 
                      className="w-16 h-16 rounded-full object-cover border border-white/10"
                    />
                    <div>
                      <h5 className="font-bold text-sm text-white">{member.name}</h5>
                      <p className="text-[10px] text-white/40 font-mono mt-0.5">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Column 3: Associated microsites */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-pink" />
              <h3 className="text-xl font-bold text-white">Active Microsites</h3>
            </div>
            
            {events.length === 0 ? (
              <div className="glass p-6 rounded-xl text-center border border-white/5 text-xs text-white/40">
                No active event portals currently launched.
              </div>
            ) : (
              events.map((e: any) => (
                <div key={e.id || e._id} className="glass p-5 rounded-xl border border-white/5 flex flex-col gap-3 group hover:border-brand-pink/30 transition-all">
                  <div className="h-28 w-full rounded-lg overflow-hidden relative">
                    <img src={e.poster} alt={e.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-white group-hover:text-brand-pink transition-colors">{e.title}</h5>
                    <p className="text-[10px] text-white/40 mt-0.5">{new Date(e.date).toLocaleDateString()}</p>
                  </div>
                  <Link 
                    href={`/event/${e.slug}`}
                    className="w-full py-2 rounded-lg bg-white/5 hover:bg-brand-pink text-white hover:text-black border border-white/10 hover:border-transparent text-xs font-bold text-center transition-all uppercase tracking-wider"
                  >
                    Enter Arena
                  </Link>
                </div>
              ))
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
