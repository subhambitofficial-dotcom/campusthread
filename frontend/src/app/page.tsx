'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Flame, ShieldCheck, Compass, ShoppingBag, PlusCircle, Trophy } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative w-full overflow-hidden flex flex-col items-center">
      
      {/* ================= HERO SECTION ================= */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 relative flex flex-col items-center text-center">
        {/* Animated Pill badge */}
        <div className="inline-flex items-center gap-2 px-4.5 py-2 rounded-full glass border border-white/10 text-xs font-semibold text-brand-cyan mb-8 animate-float">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The identity engine for student culture</span>
        </div>

        {/* Master bold headline */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-none mb-6">
          Where <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-brand-cyan via-brand-pink to-brand-purple bg-clip-text text-transparent">
            Campus Culture
          </span><br />
          Lives.
        </h1>

        {/* Cinematic Subheading */}
        <p className="max-w-2xl text-lg sm:text-xl text-white/60 font-light leading-relaxed mb-10">
          Discover events, launch custom merch, build prestigious clubs, and experience your university life in one connected, high-fidelity ecosystem.
        </p>

        {/* Dynamic Action CTA Array */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-lg mb-20 z-10">
          <Link 
            href="/feed" 
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-brand-cyan to-brand-pink text-black font-extrabold text-base hover:scale-105 transition-all shadow-[0_0_30px_rgba(0,240,255,0.4)]"
          >
            <Compass className="w-5 h-5" /> Explore Campus <ArrowRight className="w-4 h-4" />
          </Link>
          <Link 
            href="/merch" 
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-full glass border border-white/15 text-white hover:bg-white/5 font-bold text-base hover:scale-105 transition-all"
          >
            <ShoppingBag className="w-5 h-5 text-brand-pink" /> Browse Store
          </Link>
          <Link 
            href="/admin" 
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-full glass border border-white/15 text-white hover:bg-white/5 font-bold text-base hover:scale-105 transition-all"
          >
            <PlusCircle className="w-5 h-5 text-brand-gold" /> Launch Event
          </Link>
        </div>

        {/* Floating preview graphics */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
          
          {/* Card 1: Event Microsite mock */}
          <div className="glass p-6 rounded-2xl border border-white/5 flex flex-col text-left group hover:border-brand-cyan/40 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-cyan/10 blur-xl pointer-events-none" />
            <div className="w-10 h-10 rounded-lg bg-brand-cyan/20 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan mb-4 font-tech">01</div>
            <h3 className="text-xl font-bold mb-2 text-white">Event Microsites</h3>
            <p className="text-sm text-white/50 mb-4">Launch immersive event websites with custom themes like Cyber, Concert, or Retro in seconds. No coding required.</p>
            <span className="text-xs text-brand-cyan font-semibold inline-flex items-center gap-1 mt-auto">
              Dynamic builder ready <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>

          {/* Card 2: Merchandise Drops mock */}
          <div className="glass p-6 rounded-2xl border border-white/5 flex flex-col text-left group hover:border-brand-pink/40 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-pink/10 blur-xl pointer-events-none" />
            <div className="w-10 h-10 rounded-lg bg-brand-pink/20 border border-brand-pink/30 flex items-center justify-center text-brand-pink mb-4 font-tech">02</div>
            <h3 className="text-xl font-bold mb-2 text-white">Identity Commerce</h3>
            <p className="text-sm text-white/50 mb-4">Design oversized hoodies, batch tees, and limited drops. Built-in group order systems and custom quotes.</p>
            <span className="text-xs text-brand-pink font-semibold inline-flex items-center gap-1 mt-auto">
              Shop official drops <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>

          {/* Card 3: Memory Archive mock */}
          <div className="glass p-6 rounded-2xl border border-white/5 flex flex-col text-left group hover:border-brand-purple/40 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-purple/10 blur-xl pointer-events-none" />
            <div className="w-10 h-10 rounded-lg bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center text-brand-purple mb-4 font-tech">03</div>
            <h3 className="text-xl font-bold mb-2 text-white">Memories & Badges</h3>
            <p className="text-sm text-white/50 mb-4">Claim blockchain-verified attendance certificates, build a digital student portfolio, and secure exclusive badges.</p>
            <span className="text-xs text-brand-purple font-semibold inline-flex items-center gap-1 mt-auto">
              View your showcase <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>

        </div>
      </section>

      {/* ================= STATISTICS METRICS PARALLAX ================= */}
      <section className="w-full border-t border-b border-white/5 bg-black/40 py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-brand-cyan to-brand-purple bg-clip-text text-transparent">
              12,400+
            </p>
            <p className="text-xs font-tech uppercase tracking-wider text-white/40 mt-1">Student RSVPs</p>
          </div>
          <div>
            <p className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-brand-pink to-brand-gold bg-clip-text text-transparent">
              450+
            </p>
            <p className="text-xs font-tech uppercase tracking-wider text-white/40 mt-1">Merch Drops</p>
          </div>
          <div>
            <p className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-brand-purple via-brand-pink to-brand-cyan bg-clip-text text-transparent">
              35+
            </p>
            <p className="text-xs font-tech uppercase tracking-wider text-white/40 mt-1">Active Clubs</p>
          </div>
          <div>
            <p className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-brand-cyan to-brand-neon bg-clip-text text-transparent">
              ₹8.5L+
            </p>
            <p className="text-xs font-tech uppercase tracking-wider text-white/40 mt-1">Raised Payments</p>
          </div>
        </div>
      </section>

      {/* ================= BRAND HIGHLIGHTS ================= */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
          Engineered for the Modern Campus
        </h2>
        <p className="max-w-xl mx-auto text-sm sm:text-base text-white/50 mb-12">
          From micro-animations to secure transaction systems, every detail is engineered to feel as premium as Apple or Framer.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass p-6 rounded-xl border border-white/5 text-left">
            <Flame className="w-6 h-6 text-brand-pink mb-3" />
            <h4 className="font-bold text-white mb-1">Buttery Smooth UI</h4>
            <p className="text-xs text-white/50">60-120 FPS hardware-accelerated transitions that work on low-end smartphones.</p>
          </div>
          <div className="glass p-6 rounded-xl border border-white/5 text-left">
            <Trophy className="w-6 h-6 text-brand-gold mb-3" />
            <h4 className="font-bold text-white mb-1">Gamified Achievements</h4>
            <p className="text-xs text-white/50">Unlock custom badges for participating in cultural fests and hackathons.</p>
          </div>
          <div className="glass p-6 rounded-xl border border-white/5 text-left">
            <ShieldCheck className="w-6 h-6 text-brand-cyan mb-3" />
            <h4 className="font-bold text-white mb-1">Simulated Gateways</h4>
            <p className="text-xs text-white/50">Instant dynamic payments using high-fidelity simulations of Razorpay checkouts.</p>
          </div>
          <div className="glass p-6 rounded-xl border border-white/5 text-left">
            <Sparkles className="w-6 h-6 text-brand-neon mb-3" />
            <h4 className="font-bold text-white mb-1">No-Code visual Builder</h4>
            <p className="text-xs text-white/50">Organizers publish beautiful, custom-branded microsites without coding knowledge.</p>
          </div>
        </div>
      </section>

    </div>
  );
}
