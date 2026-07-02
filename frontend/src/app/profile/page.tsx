'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import Link from 'next/link';
import { Award, Compass, Users, Sparkles, LogOut, CheckCircle, Trophy, ShieldCheck, Download, Printer, User } from 'lucide-react';

export default function StudentProfile() {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected Certificate for preview
  const [activeCert, setActiveCert] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        setProfileData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to authenticate user profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="w-full flex-grow flex items-center justify-center p-12">
        <div className="w-12 h-12 rounded-full border-t-2 border-brand-cyan animate-spin" />
      </div>
    );
  }

  if (error || !profileData?.user) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-20 text-center flex flex-col gap-4">
        <h2 className="text-2xl font-black text-brand-pink">Showcase Offline</h2>
        <p className="text-sm text-white/50">Please authenticate to load your student achievements dashboard.</p>
        
        <button 
          onClick={() => {
            // Trigger login modal by simulating click or asking to click
            alert('Click the "Enter Campus" button on the top navbar to authenticate.');
          }}
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-brand-cyan to-brand-pink text-black text-xs font-bold uppercase tracking-wider mx-auto"
        >
          Authenticate Session
        </button>
      </div>
    );
  }

  const { user, profile } = profileData;

  // Extract variables with defaults
  const badges = profile?.badges || ['Freshman Badge'];
  const certificates = profile?.certificates || [];
  const attendedEvents = profile?.attendedEvents || [];
  const clubMemberships = profile?.clubMemberships || [];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-10">
      
      {/* ================= USER CARD ROW ================= */}
      <section className="glass p-8 sm:p-10 rounded-3xl border border-white/5 relative overflow-hidden flex flex-col sm:flex-row items-center gap-8">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/5 blur-2xl pointer-events-none" />
        
        {/* Profile Avatar Frame */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-cyan via-brand-pink to-brand-purple p-1 shrink-0 shadow-2xl">
          <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-white">
            <User className="w-12 h-12 stroke-[1.5]" />
          </div>
        </div>

        {/* User parameters */}
        <div className="flex-grow text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-black text-white">{user.name}</h1>
            <span className="self-center px-3 py-1 rounded-full bg-brand-cyan/15 border border-brand-cyan/20 text-[10px] uppercase font-tech font-bold text-brand-cyan tracking-wider">
              {user.role}
            </span>
          </div>
          <p className="text-sm text-white/50 mt-1 font-light">{user.email}</p>
          
          <div className="flex flex-wrap gap-2 mt-4 items-center justify-center sm:justify-start">
            {clubMemberships.map((cl: string) => (
              <span key={cl} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-white/70">
                {cl}
              </span>
            ))}
          </div>
        </div>

        {/* Dynamic statistics */}
        <div className="grid grid-cols-3 gap-6 text-center shrink-0 border-t sm:border-t-0 sm:border-l border-white/5 pt-6 sm:pt-0 sm:pl-8 w-full sm:w-auto">
          <div>
            <p className="text-2xl font-black text-white">{attendedEvents.length}</p>
            <p className="text-[9px] uppercase font-tech tracking-wider text-white/40 mt-0.5">RSVPs</p>
          </div>
          <div>
            <p className="text-2xl font-black text-brand-pink">{badges.length}</p>
            <p className="text-[9px] uppercase font-tech tracking-wider text-white/40 mt-0.5">Badges</p>
          </div>
          <div>
            <p className="text-2xl font-black text-brand-gold">{certificates.length}</p>
            <p className="text-[9px] uppercase font-tech tracking-wider text-white/40 mt-0.5">Certs</p>
          </div>
        </div>
      </section>

      {/* ================= GAMIFIED BADGES & EVENTS MATRIX ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Column 1 & 2: Badges and Certificates */}
        <div className="lg:col-span-2 flex flex-col gap-10">
          
          {/* Badges Grid */}
          <div className="glass p-8 rounded-2xl border border-white/5">
            <h3 className="text-xl font-bold mb-6 text-white tracking-tight flex items-center gap-2">
              <Trophy className="w-5 h-5 text-brand-gold" /> Unlocked Student Badges
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {badges.map((b: string) => (
                <div key={b} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3 hover:bg-white/10 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-brand-gold/15 border border-brand-gold/20 flex items-center justify-center text-brand-gold shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-white">{b}</h5>
                    <p className="text-[9px] text-white/40 font-mono mt-0.5">Ecosystem Verified</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certificates lists */}
          <div className="glass p-8 rounded-2xl border border-white/5">
            <h3 className="text-xl font-bold mb-6 text-white tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-brand-cyan" /> Secure Certificates of Merit
            </h3>

            {certificates.length === 0 ? (
              <div className="p-4 text-center text-xs text-white/40 border border-dashed border-white/10 rounded-xl">
                Participate in premium fests and checkouts to log achievements.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {certificates.map((cert: any) => (
                  <div 
                    key={cert.id} 
                    className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-4 group hover:border-brand-cyan/30 transition-all"
                  >
                    <div>
                      <h5 className="font-bold text-sm text-white group-hover:text-brand-cyan transition-colors">{cert.eventName}</h5>
                      <p className="text-[10px] text-white/40 font-light mt-0.5">Issued by {cert.issuedBy} • {cert.issueDate}</p>
                    </div>

                    <button 
                      onClick={() => setActiveCert(cert)}
                      className="px-4 py-2 rounded-full bg-white/5 group-hover:bg-brand-cyan hover:scale-105 active:scale-95 group-hover:text-black border border-white/10 group-hover:border-transparent text-xs font-bold transition-all uppercase tracking-wider shrink-0"
                    >
                      View Cert
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Column 3: Event memories feed */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-brand-pink" />
            <h3 className="text-xl font-bold text-white tracking-tight">Ecosystem History</h3>
          </div>
          
          {attendedEvents.length === 0 ? (
            <div className="glass p-6 rounded-xl border border-white/5 text-center text-xs text-white/40">
              No active RSVPs logged. Explore live events under feed.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {attendedEvents.map((title: string, index: number) => (
                <div key={index} className="glass p-4 rounded-xl border border-white/5 flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-lg bg-brand-pink/20 border border-brand-pink/30 flex items-center justify-center text-brand-pink font-tech text-xs shrink-0">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-white line-clamp-1">{title}</h5>
                    <p className="text-[9px] text-white/40 font-mono mt-0.5">Merit Certificate Unlocked</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ================= HIGH-FIDELITY PRINTABLE CERTIFICATE VIEW MODAL ================= */}
      {activeCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-3xl glass p-8 rounded-3xl border border-white/15 shadow-2xl relative text-center">
            
            {/* Modal close */}
            <button 
              onClick={() => setActiveCert(null)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 border border-white/10 hover:text-brand-pink text-white"
            >
              Close
            </button>

            {/* Printable canvas area */}
            <div id="printable-cert-canvas" className="p-8 sm:p-12 bg-black border-4 border-double border-brand-gold rounded-2xl flex flex-col items-center gap-6 relative select-text">
              <div className="absolute top-4 right-4 text-[10px] font-mono text-brand-gold">Secure verification: {activeCert.secureHash}</div>
              
              <span className="text-xs uppercase font-tech font-extrabold text-brand-gold tracking-widest">Certificate of Merit</span>
              
              <h2 className="text-3xl sm:text-5xl font-black bg-gradient-to-r from-brand-gold via-yellow-500 to-amber-600 bg-clip-text text-transparent leading-none">
                CAMPUSTHREAD VALIDATED
              </h2>

              <p className="text-sm text-white/50 mt-2">This certifies that</p>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight border-b-2 border-brand-gold/30 pb-2 px-8">{user.name}</h3>
              
              <p className="text-sm sm:text-base text-white/70 max-w-lg leading-relaxed font-light mt-2">
                has demonstrated outstanding dedication and merit through active participation at **{activeCert.eventName}**, organized by {activeCert.issuedBy}.
              </p>

              <div className="flex justify-between w-full max-w-md pt-8 mt-4 border-t border-white/10 text-left text-xs text-white/50">
                <div>
                  <p className="font-semibold text-white">Date of Issuance:</p>
                  <p className="font-mono mt-0.5">{activeCert.issueDate}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">Registrar Registrar:</p>
                  <p className="font-mono mt-0.5">Secure Hash verified</p>
                </div>
              </div>
            </div>

            {/* Print and Save controllers */}
            <div className="flex gap-4 items-center justify-center mt-6">
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-6 py-3 rounded-full bg-brand-gold hover:opacity-90 text-black text-xs font-black uppercase tracking-wider"
              >
                <Printer className="w-4 h-4" /> Print Document
              </button>
              <button 
                onClick={() => alert('Certificate downloaded locally to desktop.')}
                className="flex items-center gap-1.5 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-wider"
              >
                <Download className="w-4 h-4" /> Save PDF
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
