'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import './globals.css';
import { Menu, X, ShieldAlert, Sparkles, LogIn, LogOut, ShoppingBag, Radio, Users, Compass, User } from 'lucide-react';
import Link from 'next/link';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [navOpen, setNavOpen] = useState(false);
  
  // Auth state modal popup triggers
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authRole, setAuthRole] = useState('Student User');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    // Load user on start
    const storedUser = api.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const data = await api.post('/auth/login', { email: authEmail.trim().toLowerCase(), password: authPassword });
      api.setToken(data.token);
      api.setCurrentUser(data.user);
      setUser(data.user);
      setShowAuthModal(false);
      // Reset fields
      setAuthEmail('');
      setAuthPassword('');
    } catch (err: any) {
      setAuthError(err.message || 'Login failed. Please verify credentials.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const data = await api.post('/auth/register', {
        email: authEmail.trim().toLowerCase(),
        password: authPassword,
        name: authName,
        role: authRole
      });
      api.setToken(data.token);
      api.setCurrentUser(data.user);
      setUser(data.user);
      setShowAuthModal(false);
      // Reset fields
      setAuthEmail('');
      setAuthPassword('');
      setAuthName('');
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed.');
    }
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
  };

  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        {/* Dynamic Glowing background nodes */}
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-brand-cyan/10 blur-[120px] pointer-events-none z-[-1]" />
        <div className="absolute top-[40%] right-[10%] w-[600px] h-[600px] rounded-full bg-brand-pink/5 blur-[150px] pointer-events-none z-[-1]" />

        {/* Global Premium Navigation Bar */}
        <header className="sticky top-0 z-40 w-full glass border-b border-white/5 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-black bg-gradient-to-r from-brand-cyan via-brand-pink to-brand-purple bg-clip-text text-transparent tracking-tighter">
                CAMPUSTHREAD
              </span>
              <span className="text-[10px] uppercase font-tech px-2 py-0.5 rounded-full border border-brand-cyan/20 text-brand-cyan tracking-wider hidden sm:inline-block">
                Beta v1.0
              </span>
            </Link>

            {/* Desktop Navigation Link Array */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/feed" className="flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-brand-cyan transition-colors">
                <Compass className="w-4 h-4" /> Feed
              </Link>
              <Link href="/merch" className="flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-brand-pink transition-colors">
                <ShoppingBag className="w-4 h-4" /> Store
              </Link>
              {user && (
                <>
                  <Link href="/profile" className="flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-brand-purple transition-colors">
                    <User className="w-4 h-4" /> My Profile
                  </Link>
                  {user.role !== 'Student User' && (
                    <Link href="/admin" className="flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-brand-gold transition-colors">
                      <Radio className="w-4 h-4" /> Control Hub
                    </Link>
                  )}
                </>
              )}
            </nav>

            {/* User Session Actions */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-white/60 font-mono">Signed in as</p>
                    <p className="text-sm font-bold text-white tracking-tight">{user.name}</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 hover:bg-brand-pink/20 hover:text-brand-pink border border-white/10 hover:border-brand-pink/30 text-sm font-medium transition-all duration-300"
                  >
                    <LogOut className="w-4 h-4" /> Log out
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => { setShowAuthModal(true); setAuthMode('login'); }}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-brand-cyan to-brand-pink text-black font-semibold text-sm hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(0,240,255,0.3)]"
                >
                  <LogIn className="w-4 h-4" /> Enter Campus
                </button>
              )}
            </div>

            {/* Mobile Navigation Toggler */}
            <div className="md:hidden">
              <button 
                onClick={() => setNavOpen(!navOpen)}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-white"
              >
                {navOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile responsive navigation tray */}
          {navOpen && (
            <div className="md:hidden glass border-b border-white/5 px-4 py-6 flex flex-col gap-4 animate-fade-in">
              <Link 
                href="/feed" 
                onClick={() => setNavOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-base font-semibold"
              >
                <Compass className="w-5 h-5 text-brand-cyan" /> Campus Feed
              </Link>
              <Link 
                href="/merch" 
                onClick={() => setNavOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-base font-semibold"
              >
                <ShoppingBag className="w-5 h-5 text-brand-pink" /> Merch Store
              </Link>
              {user && (
                <>
                  <Link 
                    href="/profile" 
                    onClick={() => setNavOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-base font-semibold"
                  >
                    <User className="w-5 h-5 text-brand-purple" /> My Profile
                  </Link>
                  {user.role !== 'Student User' && (
                    <Link 
                      href="/admin" 
                      onClick={() => setNavOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-base font-semibold"
                    >
                      <Radio className="w-5 h-5 text-brand-gold" /> Admin Panel
                    </Link>
                  )}
                </>
              )}
              <hr className="border-white/5 my-2" />
              {user ? (
                <div className="flex flex-col gap-3">
                  <div className="px-4">
                    <p className="text-xs text-white/50">Authenticated as</p>
                    <p className="text-lg font-bold text-white">{user.name}</p>
                    <p className="text-xs text-brand-cyan">{user.role}</p>
                  </div>
                  <button 
                    onClick={() => { handleLogout(); setNavOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-pink/10 border border-brand-pink/20 text-brand-pink font-semibold"
                  >
                    <LogOut className="w-5 h-5" /> Log out
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => { setShowAuthModal(true); setAuthMode('login'); setNavOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-pink text-black font-semibold"
                >
                  <LogIn className="w-5 h-5" /> Enter Campus
                </button>
              )}
            </div>
          )}
        </header>

        {/* Global Core Pages Frame */}
        <main className="flex-grow flex flex-col">
          {children}
        </main>

        {/* Global Dark Tech Footer */}
        <footer className="bg-black/80 border-t border-white/5 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-1">
              <span className="text-lg font-extrabold tracking-tighter text-white">
                CAMPUSTHREAD
              </span>
              <p className="text-xs text-white/40">
                The Premium Digital Experience Layer of Campus Culture.
              </p>
            </div>
            <div className="flex gap-8 text-xs text-white/60">
              <Link href="/feed" className="hover:text-brand-cyan transition-colors">Campus Activity Feed</Link>
              <Link href="/merch" className="hover:text-brand-pink transition-colors">Exclusive ClothingDrops</Link>
              <span className="text-white/20">|</span>
              <p className="font-tech text-white/30">BUILT BY DEEPMIND FOR ADVANCED CAMPUS LIFE</p>
            </div>
          </div>
        </footer>

        {/* ================= AUTHENTICATION DIALOG (MODAL WINDOW) ================= */}
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-md glass p-8 rounded-2xl border border-white/10 shadow-2xl relative animate-float">
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-black text-center mb-1 bg-gradient-to-r from-brand-cyan to-brand-pink bg-clip-text text-transparent">
                {authMode === 'login' ? 'WELCOME BACK' : 'CREATE ACCOUNT'}
              </h2>
              <p className="text-xs text-white/40 text-center mb-6">
                {authMode === 'login' ? 'Synchronize with campus feeds & drops' : 'Join the modern campus experience layer'}
              </p>

              {authError && (
                <div className="mb-4 p-3 rounded-lg bg-brand-pink/10 border border-brand-pink/20 flex items-center gap-2 text-xs text-brand-pink font-semibold">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="flex flex-col gap-4">
                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Full Name</label>
                    <input 
                      type="text" 
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="e.g. Liam Foster" 
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-brand-cyan transition-all"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Campus Email Address</label>
                  <input 
                    type="email" 
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="student@campusthread.edu" 
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-brand-cyan transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Access Password</label>
                  <input 
                    type="password" 
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••••••" 
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-brand-cyan transition-all"
                    required
                  />
                </div>

                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Ecosystem Role</label>
                    <select
                      value={authRole}
                      onChange={(e) => setAuthRole(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-card border border-white/10 text-white text-sm focus:outline-none focus:border-brand-cyan transition-all"
                    >
                      <option value="Student User">Student User</option>
                      <option value="Club Admin">Club Admin / Event Team</option>
                      <option value="Merch Manager">Merch Manager</option>
                    </select>
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3.5 mt-2 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-pink text-black font-extrabold hover:opacity-90 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                >
                  <Sparkles className="w-4 h-4" /> {authMode === 'login' ? 'ENTER ECOSYSTEM' : 'INITIATE REGISTRATION'}
                </button>
              </form>

              <div className="mt-6 text-center text-xs text-white/50">
                {authMode === 'login' ? (
                  <p>
                    Don't have an account?{' '}
                    <button 
                      onClick={() => setAuthMode('register')}
                      className="text-brand-cyan font-bold hover:underline"
                    >
                      Create one now
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <button 
                      onClick={() => setAuthMode('login')}
                      className="text-brand-pink font-bold hover:underline"
                    >
                      Login instead
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
