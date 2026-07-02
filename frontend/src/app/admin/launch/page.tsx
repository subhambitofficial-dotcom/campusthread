'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../../utils/api';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function LaunchClub() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [selectedClub, setSelectedClub] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const res = await api.get('/clubs');
        setClubs(res);
        if (res.length > 0) setSelectedClub(res[0].id);
      } catch (err) {
        console.error('Failed to load clubs:', err);
      }
    };
    fetchClubs();
  }, []);

  const handleLaunch = () => {
    if (!selectedClub) return;
    // Placeholder for real launch logic; currently just shows a success toast.
    setMessage('Club launched successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-12 flex flex-col gap-6 text-center">
      <Link href="/admin" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full glass border border-white/10 text-xs font-bold text-white hover:bg-white/5 transition-all">
        <ArrowLeft className="w-4 h-4" /> Back to Hub
      </Link>

      <h1 className="text-3xl font-black text-white">Launch Club</h1>
      <p className="text-sm text-white/60">Select a club from the dropdown and click Launch to make it live.</p>

      <select
        value={selectedClub}
        onChange={e => setSelectedClub(e.target.value)}
        className="w-full px-3 py-3.5 rounded-xl bg-card border border-white/10 text-white text-xs focus:outline-none"
      >
        {clubs.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <button
        onClick={handleLaunch}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-pink text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all"
      >
        Launch Selected Club
      </button>

      {message && (
        <div className="p-4 rounded-xl bg-brand-neon/15 border border-brand-neon/20 flex items-center gap-2 text-xs text-brand-neon">
          <CheckCircle className="w-4 h-4" /> {message}
        </div>
      )}
    </div>
  );
}
