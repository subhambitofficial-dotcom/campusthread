'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../utils/api';
import Link from 'next/link';
import { Calendar, MapPin, Clock, Users, ArrowLeft, ShieldCheck, Sparkles, Send, BellRing, Award, FileText, CheckCircle2 } from 'lucide-react';

export default function EventMicrosite({ params }: { params: { slug: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Countdown states
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Registration Form states
  const [formResponses, setFormResponses] = useState<Record<string, string>>({});
  const [isRegistering, setIsRegistering] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);

  // Fetch event microsite specs
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${params.slug}`);
        setData(res);
        
        // Initialize dynamic registration form states
        if (res.event?.registrationForm) {
          const initial: Record<string, string> = {};
          res.event.registrationForm.forEach((f: any) => {
            initial[f.label] = '';
          });
          setFormResponses(initial);
        }
      } catch (err: any) {
        setError(err.message || 'Microsite could not be resolved.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [params.slug]);

  // Countdown timer clock loop
  useEffect(() => {
    if (!data?.event?.date) return;
    
    const targetDate = new Date(data.event.date).getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;
      
      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [data?.event?.date]);

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
        <h2 className="text-2xl font-bold text-brand-pink">Event Portal Offline</h2>
        <p className="text-sm text-white/50">{error || 'This microsite configuration is missing.'}</p>
        <Link href="/feed" className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-white text-xs font-semibold uppercase tracking-wider">
          Back to Feed
        </Link>
      </div>
    );
  }

  const { event, club } = data;

  // Adapt preset aesthetics
  const preset = event.themeConfig?.preset || 'cyber';
  const isCyber = preset === 'cyber';
  const isConcert = preset === 'concert';
  const isLuxury = preset === 'luxury';
  
  let mainBg = 'bg-background';
  let fontTheme = 'font-sans';
  let accentBorder = 'border-brand-purple/20';
  let accentText = 'text-brand-purple';
  let accentButton = 'bg-brand-purple hover:bg-brand-purple/80 text-white';
  
  if (isCyber) {
    mainBg = 'bg-[#05060c]';
    fontTheme = 'font-tech';
    accentBorder = 'border-brand-cyan/20';
    accentText = 'text-brand-cyan';
    accentButton = 'bg-brand-cyan hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] text-black font-extrabold';
  } else if (isConcert) {
    mainBg = 'bg-[#080410]';
    fontTheme = 'font-sans';
    accentBorder = 'border-brand-pink/20';
    accentText = 'text-brand-pink';
    accentButton = 'bg-brand-pink hover:shadow-[0_0_15px_rgba(255,0,127,0.4)] text-black font-extrabold';
  } else if (isLuxury) {
    mainBg = 'bg-[#0f0f10]';
    fontTheme = 'font-serif';
    accentBorder = 'border-brand-gold/30';
    accentText = 'text-brand-gold';
    accentButton = 'bg-gradient-to-r from-brand-gold to-yellow-600 text-black font-extrabold';
  }

  // Handle Dynamic form updates
  const handleFormChange = (label: string, value: string) => {
    setFormResponses(prev => ({ ...prev, [label]: value }));
  };

  // Direct RSVP without price or payment gateway modals
  const handleInitiateRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    
    // Check if user is authenticated first
    const activeUser = api.getCurrentUser();
    if (!activeUser) {
      alert('Authentication required. Please click "Enter Campus" at the top navbar to sign in.');
      setIsRegistering(false);
      return;
    }

    try {
      // API call to record registration in backend (directly set as successful free RSVP)
      await api.post(`/events/${event.id || event._id}/register`, {
        formData: formResponses,
        paymentDetails: {
          success: true,
          razorpay_payment_id: 'free_rsvp'
        }
      });
      setRegSuccess(true);
    } catch (err) {
      alert('Failed to register. Backend synchronization failed.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className={`w-full min-h-screen ${mainBg} ${fontTheme} text-white relative pb-24`}>
      
      {/* Background Neon Glow Adaptors */}
      <div className={`absolute top-0 left-[20%] w-[600px] h-[300px] rounded-full blur-[160px] pointer-events-none z-0 ${isCyber ? 'bg-brand-cyan/5' : isConcert ? 'bg-brand-pink/5' : 'bg-brand-gold/5'}`} />

      {/* ================= COVER BANNER ================= */}
      <div className="h-64 sm:h-80 w-full relative">
        <img 
          src={event.poster || club?.banner || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&q=80'} 
          alt={event.title} 
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

      {/* ================= RUNTIME MICROSITE LAYOUT ================= */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 flex flex-col gap-20">
        
        {/* Render sections conditionally according to sections list */}
        {event.sections?.map((section: any, index: number) => {
          if (!section.enabled) return null;

          switch (section.type) {
            case 'hero':
              return (
                <section key={index} className="flex flex-col items-center text-center relative pt-8">
                  {/* Organizing club indicator */}
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold font-tech tracking-wider uppercase mb-6 ${accentText}`}>
                    <Sparkles className="w-4 h-4" /> Organized by {club?.name || 'Academic Syndicate'}
                  </span>

                  <h1 className="text-4xl sm:text-7xl font-black tracking-tight leading-none mb-6">
                    {event.title}
                  </h1>

                  <p className="text-lg sm:text-xl text-white/70 max-w-2xl font-light mb-12">
                    {event.tagline}
                  </p>

                  {/* Gorgeous Main Poster Image */}
                  {event.poster && (
                    <div className="w-full max-w-4xl h-64 sm:h-96 rounded-3xl overflow-hidden border border-white/10 mb-12 relative">
                      <img 
                        src={event.poster} 
                        alt={event.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#05060c] via-transparent to-transparent opacity-80" />
                    </div>
                  )}

                  {/* IMERSIVE COUNTDOWN CLOCK */}
                  <div className="grid grid-cols-4 gap-4 max-w-xl w-full mb-12">
                    {[
                      { val: timeLeft.days, unit: 'Days' },
                      { val: timeLeft.hours, unit: 'Hours' },
                      { val: timeLeft.minutes, unit: 'Mins' },
                      { val: timeLeft.seconds, unit: 'Secs' }
                    ].map((clockItem, idx) => (
                      <div 
                        key={idx} 
                        className={`glass p-4 sm:p-6 rounded-2xl border ${accentBorder} flex flex-col items-center justify-center`}
                      >
                        <span className="text-2xl sm:text-5xl font-black tracking-tight">{clockItem.val}</span>
                        <span className="text-[10px] uppercase font-tech tracking-widest text-white/40 mt-1">{clockItem.unit}</span>
                      </div>
                    ))}
                  </div>

                  {/* Info Row */}
                  <div className="flex flex-col sm:flex-row gap-6 items-center justify-center text-sm text-white/60 font-semibold mb-6">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-brand-cyan" />
                      <span>{new Date(event.date).toLocaleString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-brand-pink" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </section>
              );

            case 'schedule':
              const timelineEvents = event.subEvents && event.subEvents.length > 0
                ? event.subEvents
                : [
                    { title: '09:00 AM — Opening Ceremony', description: 'Keynote introductions from faculty advisors, and distribution of event badges.', time: '09:00 AM', location: event.location },
                    { title: '12:30 PM — Workshop Breakout Session', description: 'Hands-on labs and mentor consultations from principal sponsors Stripe.', time: '12:30 PM', location: event.location },
                    { title: '06:00 PM — Final Showdowns & Awards', description: 'Presentation of works before judges panel and download of certified achievements.', time: '06:00 PM', location: event.location }
                  ];

              return (
                <section key={index} className={`glass p-8 sm:p-10 rounded-3xl border ${accentBorder} relative`}>
                  <h3 className="text-2xl font-black mb-6 text-white tracking-tight flex items-center gap-2">
                    <Clock className={`w-5 h-5 ${accentText}`} /> Schedule of Operations & Sub-Events
                  </h3>
                  
                  {event.subEvents && event.subEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                      {event.subEvents.map((se: any, seIdx: number) => (
                        <div 
                          key={se.id || seIdx}
                          className="glass p-5 rounded-2xl border border-white/5 flex flex-col sm:flex-row gap-4 hover:border-brand-cyan/20 hover:bg-white/5 transition-all duration-300 relative overflow-hidden group"
                        >
                          {se.image && (
                            <div className="w-full sm:w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-white/10">
                              <img 
                                src={se.image} 
                                alt={se.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <div className="flex flex-col gap-1.5 overflow-hidden">
                            <span className={`text-[10px] uppercase font-tech font-bold ${accentText}`}>
                              📍 {se.location || 'Main Venue'}
                            </span>
                            <h4 className="font-bold text-white text-sm leading-tight group-hover:text-brand-cyan transition-colors truncate">
                              {se.title}
                            </h4>
                            <span className="text-[9px] text-white/40 font-mono">
                              🕒 {se.time}
                            </span>
                            <p className="text-[11px] text-white/50 leading-relaxed font-light mt-1 line-clamp-2">
                              {se.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6 relative border-l-2 border-white/5 pl-6 ml-2 text-left">
                      {timelineEvents.map((item: any, itemIdx: number) => (
                        <div key={itemIdx} className="relative">
                          <span className={`absolute -left-8.5 top-1.5 w-3 h-3 rounded-full ${isCyber ? 'bg-brand-cyan' : 'bg-brand-pink'}`} />
                          <h5 className="font-bold text-base text-white">{item.title}</h5>
                          <p className="text-xs text-white/50 mt-1 font-light">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              );

            case 'speakers':
              return (
                <section key={index} className="text-center">
                  <h3 className="text-2xl font-black mb-8 text-white tracking-tight flex items-center justify-center gap-2">
                    <Users className={`w-5 h-5 ${accentText}`} /> Immersive Speakers & Mentors
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {[
                      { name: 'Dr. Evelyn Carter', role: 'Chief Cyberneticist', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&q=80' },
                      { name: 'Marcus Sterling', role: 'Principal Designer at Linear', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80' }
                    ].map((speaker, sIdx) => (
                      <div key={sIdx} className={`glass p-6 rounded-2xl border ${accentBorder} flex flex-col items-center gap-4`}>
                        <img 
                          src={speaker.image} 
                          alt={speaker.name} 
                          className="w-20 h-20 rounded-full object-cover border border-white/10"
                        />
                        <div>
                          <h5 className="font-bold text-sm text-white">{speaker.name}</h5>
                          <p className="text-[10px] text-white/40 uppercase mt-0.5 tracking-wider">{speaker.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case 'registration':
              return (
                <section key={index} className="max-w-xl mx-auto w-full">
                  {regSuccess ? (
                    <div className="glass p-8 rounded-3xl border border-brand-neon/30 text-center flex flex-col items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-brand-neon/20 border border-brand-neon/30 flex items-center justify-center text-brand-neon mb-2">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-white">Entry RSVP Confirmed!</h3>
                      <p className="text-xs text-white/60">
                        You have successfully registered for **{event.title}**. Your attendance certificate and digital profile badge has been unlocked.
                      </p>
                      <Link 
                        href="/profile" 
                        className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold transition-all uppercase tracking-wider"
                      >
                        View My Badges
                      </Link>
                    </div>
                  ) : (
                    <div className={`glass p-8 sm:p-10 rounded-3xl border ${accentBorder} text-left`}>
                      <h3 className="text-2xl font-black mb-1 text-white tracking-tight flex items-center gap-2">
                        <Award className={`w-5 h-5 ${accentText}`} /> Secure Ecosystem Entry
                      </h3>
                      <p className="text-xs text-white/50 mb-6 font-light">Complete validation fields to reserve your custom entry badge.</p>

                      <form onSubmit={handleInitiateRegistration} className="flex flex-col gap-4">
                        {event.registrationForm?.map((f: any, fIdx: number) => (
                          <div key={fIdx}>
                            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">{f.label}</label>
                            
                            {f.type === 'select' ? (
                              <select 
                                value={formResponses[f.label] || ''} 
                                onChange={(e) => handleFormChange(f.label, e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-card border border-white/10 text-white text-sm focus:outline-none focus:border-brand-cyan transition-all"
                                required={f.required}
                              >
                                <option value="">Select Option</option>
                                {f.options?.map((opt: string, oIdx: number) => (
                                  <option key={oIdx} value={opt}>{opt}</option>
                                ))}
                              </select>
                            ) : (
                              <input 
                                type="text" 
                                value={formResponses[f.label] || ''} 
                                onChange={(e) => handleFormChange(f.label, e.target.value)}
                                placeholder={`Enter ${f.label}`}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-brand-cyan transition-all"
                                required={f.required}
                              />
                            )}
                          </div>
                        ))}

                        <button 
                          type="submit" 
                          disabled={isRegistering}
                          className={`w-full py-4 mt-4 rounded-xl ${accentButton} flex items-center justify-center gap-2`}
                        >
                          <Send className="w-4 h-4" /> 
                          {isRegistering ? 'PROCESSING REGISTRATION...' : 'RSVP & SECURE FREE TICKET'}
                        </button>
                      </form>
                    </div>
                  )}
                </section>
              );

            default:
              return null;
          }
        })}

      </div>

    </div>
  );
}
