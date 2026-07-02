'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../utils/api';
import Link from 'next/link';
import { Router } from 'next/router';
import { Radio, Plus, Trash2, ArrowLeft, ShieldCheck, Sparkles, LayoutGrid, MonitorPlay, Save, Eye, Palette, CheckCircle, Info } from 'lucide-react';

export default function EventBuilder() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // Core Form states
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('2026-10-18T09:00');
  const [location, setLocation] = useState('Campus Central Stadium');
  const [poster, setPoster] = useState('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80');
  const [selectedClub, setSelectedClub] = useState('');

  // Sub-events state
  const [events, setEvents] = useState<any[]>([]);
  const [merchItems, setMerchItems] = useState<any[]>([]);
  const [subEvents, setSubEvents] = useState<any[]>([]);
  const [subTitle, setSubTitle] = useState('');
  const [subDescription, setSubDescription] = useState('');
  const [subTime, setSubTime] = useState('');
  const [subLocation, setSubLocation] = useState('');
  const [subImage, setSubImage] = useState('');

  // Dynamic Theme Adaptations
  const [themePreset, setThemePreset] = useState<'cyber' | 'concert' | 'luxury' | 'minimal'>('cyber');

  // Drag and Drop/Section configurations list
  const [sections, setSections] = useState<any[]>([
    { type: 'hero', enabled: true, title: 'Animated Hero Block' },
    { type: 'schedule', enabled: true, title: 'Event Timeline Schedule' },
    { type: 'speakers', enabled: true, title: 'Speaker / Mentors List' },
    { type: 'faq', enabled: false, title: 'FAQ Accordions' },
    { type: 'sponsors', enabled: false, title: 'Sponsor Showcase' },
    { type: 'registration', enabled: true, title: 'Dynamic Form Registration' }
  ]);

  // Dynamic Registration Form inputs creator
  const [formFields, setFormFields] = useState<any[]>([
    { label: 'Full Name', type: 'text', required: true },
    { label: 'Campus Roll Number', type: 'text', required: true }
  ]);
  const [newFieldLabel, setNewFieldLabel] = useState('');

  // Publish Status states
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [generatedSlug, setGeneratedSlug] = useState('');

  // Authenticated user permission checks
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = api.getCurrentUser();
    setCurrentUser(user);

    const fetchClubs = async () => {
      try {
        const res = await api.get('/clubs');
        setClubs(res);
        if (res.length > 0) setSelectedClub(res[0].id);
      } catch (err) {
        console.error('Failed to load clubs:', err);
      }
    };

    const fetchEvents = async () => {
      try {
        const res = await api.get('/events');
        setEvents(res);
      } catch (err) {
        console.error('Failed to load events:', err);
      }
    };
    const fetchMerch = async () => {
      try {
        const res = await api.get('/merch');
        setMerchItems(res);
      } catch (err) {
        console.error('Failed to load merchandise:', err);
      }
    };
    fetchClubs();
    fetchMerch();
    fetchEvents();  }, []);

  // Delete selected club (Super Admin only)
  const deleteClub = async () => {
    if (!selectedClub) return;
    if (!window.confirm('Are you sure you want to delete this club? This action cannot be undone.')) return;
    try {
      await api.delete(`/admin/delete/clubs/${selectedClub}`);
      // Refresh clubs list
      const refreshed = await api.get('/clubs');
      setClubs(refreshed);
      setSelectedClub(refreshed[0]?.id || '');
    } catch (err) {
      alert('Failed to delete club.');
    }
  };

  const deleteEvent = async (id: string) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await api.delete(`/admin/delete/events/${id}`);
      const refreshed = await api.get('/events');
      setEvents(refreshed);
    } catch (err) {
      alert('Failed to delete event.');
    }
  };

  const deleteMerch = async (id: string) => {
    if (!id) return;
    if (!window.confirm('Delete this merchandise item?')) return;
    try {
      await api.delete(`/admin/delete/merch/${id}`);
      // Refresh merch list
      const refreshed = await api.get('/merch');
      setMerchItems(refreshed);
    } catch (err) {
      alert('Failed to delete merchandise.');
    }
  };

  // Toggle dynamic builder sections
  const toggleSection = (idx: number) => {

    setSections(prev => {
      const updated = [...prev];
      updated[idx].enabled = !updated[idx].enabled;
      return updated;
    });
  };

  // Add custom registration input blocks visually
  const addFormField = () => {
    if (!newFieldLabel) return;
    setFormFields(prev => [
      ...prev,
      { label: newFieldLabel, type: 'text', required: false }
    ]);
    setNewFieldLabel('');
  };

  const removeFormField = (idx: number) => {
    setFormFields(prev => prev.filter((_, i) => i !== idx));
  };

  const addSubEvent = () => {
    if (!subTitle || !subDescription) {
      alert('Please provide at least a title and description for the sub-event.');
      return;
    }
    setSubEvents(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        title: subTitle,
        description: subDescription,
        time: subTime || 'TBA',
        location: subLocation || 'Main Arena',
        image: subImage || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80'
      }
    ]);
    setSubTitle('');
    setSubDescription('');
    setSubTime('');
    setSubLocation('');
    setSubImage('');
  };

  const removeSubEvent = (id: string) => {
    setSubEvents(prev => prev.filter(se => se.id !== id));
  };

  // Publish Layout config to live Database immediately
  const handlePublishMicrosite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !selectedClub) {
      alert('Please fill out all core fields.');
      return;
    }

    setIsPublishing(true);
    setPublishSuccess(false);

    try {
      const res = await api.post('/events', {
        title,
        tagline: tagline || 'An immersive campus experience',
        description,
        date: new Date(date).toISOString(),
        location,
        poster,
        clubId: selectedClub,
        sections: sections.map(s => ({ type: s.type, enabled: s.enabled })),
        themeConfig: {
          preset: themePreset,
          colors: themePreset === 'cyber' 
            ? { primary: '#00f0ff', secondary: '#ff007f', background: '#05060c' }
            : themePreset === 'concert'
            ? { primary: '#a855f7', secondary: '#ec4899', background: '#080410' }
            : themePreset === 'luxury'
            ? { primary: '#d4af37', secondary: '#aa820a', background: '#0f0f10' }
            : { primary: '#ffffff', secondary: '#737373', background: '#0a0a0c' }
        },
        registrationForm: formFields,
        subEvents
      });

      setGeneratedSlug(res.slug);
      setPublishSuccess(true);
      
      // Clear forms
      setTitle('');
      setTagline('');
      setDescription('');
      setSubEvents([]);

    } catch (err) {
      alert('Failed to launch dynamic event microsite.');
    } finally {
      setIsPublishing(false);
    }
  };

  if (currentUser && currentUser.role === 'Student User') {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-20 text-center flex flex-col gap-4">
        <h2 className="text-2xl font-black text-brand-pink">RESTRICTED CANVAS AREA</h2>
        <p className="text-sm text-white/50">Student credentials lack authorizations to launch dynamic builder events.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-10">
      
      {/* ================= HEADER BACK TRIGGER ================= */}
      <section className="flex items-center justify-between">
        <Link 
          href="/admin" 
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full glass border border-white/10 text-xs font-bold text-white hover:bg-white/5 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Hub
        </Link>
        <span className="text-xs uppercase font-tech font-bold text-white/40">Visual Page Adapter v1.2</span>
      </section>

      {/* ================= BUILDER SPLIT SCREEN CANVAS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Left Hand: Canva Customizer parameters */}
        <div className="flex flex-col gap-8 text-left">
          
          <div className="glass p-8 rounded-3xl border border-white/5 flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <Palette className="w-5 h-5 text-brand-cyan" /> Layout Customizer
              </h2>
              <p className="text-xs text-white/40 mt-1 font-light">Set up core parameters, toggle block sections, and switch dynamic themes.</p>
            </div>

            {publishSuccess && (
              <div className="p-4 rounded-xl bg-brand-neon/15 border border-brand-neon/20 flex flex-col gap-2 text-xs text-brand-neon">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle className="w-4.5 h-4.5" />
                  <span>MICROSITE LIVE & SYNCHRONIZED IMMEDIATELY!</span>
                </div>
                <p className="text-white/70">
                  Your event has been successfully compiled and dropped onto the live Campus Activity Feed.
                </p>
                <Link 
                  href={`/event/${generatedSlug}`} 
                  className="mt-1 inline-flex items-center gap-1 text-[11px] underline font-bold uppercase tracking-wider text-white hover:text-brand-cyan"
                >
                  Enter Microsite Arena <MonitorPlay className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            <form onSubmit={handlePublishMicrosite} className="flex flex-col gap-5">
              
              {/* Event Title */}
              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">Event Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. HackSprint 2026" 
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none"
                  required
                />
              </div>

              {/* Event Tagline */}
              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">Microsite Tagline</label>
                <input 
                  type="text" 
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Break the digital grid. Code the future." 
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none"
                />
              </div>

              {/* Event Description */}
              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">Microsite Body Text</label>
                <textarea 
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Join 500+ developers in our 36-hour cyberpunk hacking marathon..." 
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none"
                  required
                />
              </div>

              {/* Dropdowns parameters */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">Launching Club</label>
                  <select 
                    value={selectedClub}
                    onChange={(e) => setSelectedClub(e.target.value)}
                    className="w-full px-3 py-3.5 rounded-xl bg-card border border-white/10 text-white text-xs focus:outline-none"
                    required
                  >
                    {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={deleteClub}
                      className="w-full px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
                    >
                      Delete Selected Club
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">Theme Presets</label>
                  <select 
                    value={themePreset}
                    onChange={(e) => setThemePreset(e.target.value as any)}
                    className="w-full px-3 py-3.5 rounded-xl bg-card border border-white/10 text-white text-xs focus:outline-none"
                  >
                    <option value="cyber">Cyberpunk Neon</option>
                    <option value="concert">Violet Concert</option>
                    <option value="luxury">Luxury Gold</option>
                    <option value="minimal">Minimalist Monochrome</option>
                  </select>
                </div>
              </div>

              {/* More settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">Opening Ceremony Date</label>
                  <input 
                    type="datetime-local" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">Physical Location</label>
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Event Image URL */}
              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">Event Image/Poster Link (URL) or Upload</label>
                <div className="flex flex-col gap-2">
                  <input 
                    type="text" 
                    value={poster}
                    onChange={(e) => setPoster(e.target.value)}
                    placeholder="e.g. https://images.unsplash.com/photo-..." 
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/40">OR upload downloaded image:</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') setPoster(reader.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-xs text-white/50 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
                    />
                  </div>
                </div>
              </div>

              {/* ================= DYNAMIC BLOCKS SECTION MANAGER ================= */}
              <div className="border-t border-white/5 pt-4 flex flex-col gap-4">
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest">Enable/Disable Page Sections</label>
                
                <div className="flex flex-col gap-2">
                  {sections.map((sec, idx) => (
                    <div 
                      key={idx} 
                      className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-4"
                    >
                      <span className="text-xs font-semibold text-white/80">{sec.title}</span>
                      <button 
                        type="button"
                        onClick={() => toggleSection(idx)}
                        className={`px-3 py-1 rounded text-[10px] uppercase font-tech font-bold transition-all ${sec.enabled ? 'bg-brand-cyan/20 text-brand-cyan' : 'bg-white/5 text-white/40'}`}
                      >
                        {sec.enabled ? 'Active' : 'Disabled'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ================= DYNAMIC FORM EDITOR ================= */}
              <div className="border-t border-white/5 pt-4 flex flex-col gap-4">
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest">Student RSVP validation fields</label>
                
                <div className="flex flex-col gap-2">
                  {formFields.map((f, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs text-white/60">
                      <span>{f.label} ({f.required ? 'Required' : 'Optional'})</span>
                      <button 
                        type="button" 
                        onClick={() => removeFormField(idx)}
                        className="text-white/40 hover:text-brand-pink transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newFieldLabel}
                    onChange={(e) => setNewFieldLabel(e.target.value)}
                    placeholder="e.g. GitHub Profile Link" 
                    className="flex-grow px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 text-xs focus:outline-none"
                  />
                  <button 
                    type="button" 
                    onClick={addFormField}
                    className="px-4 rounded-xl bg-white/10 hover:bg-white text-white hover:text-black border border-white/10 text-xs font-bold transition-all shrink-0"
                  >
                    Add Input field
                  </button>
                </div>
              </div>

              {/* ================= SUB-EVENTS CREATOR ================= */}
              <div className="border-t border-white/5 pt-4 flex flex-col gap-4">
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest">Add Sub-Events / Workshops / Competitions</label>
                
                {/* List of sub-events */}
                {subEvents.length > 0 && (
                  <div className="flex flex-col gap-3">
                    {subEvents.map((se) => (
                      <div key={se.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start justify-between gap-3 text-xs">
                        <div className="flex gap-3 items-center overflow-hidden">
                          {se.image && (
                            <img src={se.image} alt={se.title} className="w-10 h-10 rounded object-cover border border-white/10 shrink-0" />
                          )}
                          <div className="overflow-hidden">
                            <p className="font-bold text-white truncate">{se.title}</p>
                            <p className="mt-1 text-sm text-white/70">Selected Club ID: {selectedClub || 'None'}</p>
                            <p className="text-[9px] text-brand-cyan truncate">{se.time} | {se.location}</p>
                          </div>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeSubEvent(se.id)}
                          className="text-white/40 hover:text-brand-pink transition-colors shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {/* Merchandise Items List */}
                    {merchItems.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-sm font-bold text-white mb-2">Merchandise Items</h3>
                        {merchItems.map((m) => (
                          <div key={m.id} className="flex items-center justify-between p-2 bg-white/5 rounded mb-2">
                            <span className="text-white text-xs">{m.name || m.title}</span>
                            <button
                              type="button"
                              onClick={() => deleteMerch(m.id)}
                              className="text-white/40 hover:text-brand-pink transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Events Items List */}
                    {events.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-sm font-bold text-white mb-2">Events</h3>
                        {events.map((e) => (
                          <div key={e.id} className="flex items-center justify-between p-2 bg-white/5 rounded mb-2">
                            <span className="text-white text-xs">{e.title || e.name}</span>
                            <button type="button" onClick={() => deleteEvent(e.id)} className="text-white/40 hover:text-brand-pink transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-event inputs */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[8px] font-bold text-white/40 uppercase mb-1">Sub-Event Title *</label>
                      <input 
                        type="text" 
                        value={subTitle}
                        onChange={(e) => setSubTitle(e.target.value)}
                        placeholder="e.g. CodeSprint Hack" 
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-white/40 uppercase mb-1">Image Link (URL) or Upload</label>
                      <input 
                        type="text" 
                        value={subImage}
                        onChange={(e) => setSubImage(e.target.value)}
                        placeholder="e.g. https://images.unsplash.com/..." 
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 text-xs focus:outline-none mb-1"
                      />
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === 'string') setSubImage(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="text-[9px] text-white/40 file:mr-1 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:text-[9px] file:bg-white/10 file:text-white hover:file:bg-white/20 w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[8px] font-bold text-white/40 uppercase mb-1">Time / Schedule</label>
                      <input 
                        type="text" 
                        value={subTime}
                        onChange={(e) => setSubTime(e.target.value)}
                        placeholder="e.g. 10:00 AM - 12:00 PM" 
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-white/40 uppercase mb-1">Location / Venue</label>
                      <input 
                        type="text" 
                        value={subLocation}
                        onChange={(e) => setSubLocation(e.target.value)}
                        placeholder="e.g. Seminar Hall 3" 
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[8px] font-bold text-white/40 uppercase mb-1">Description *</label>
                    <textarea 
                      rows={2}
                      value={subDescription}
                      onChange={(e) => setSubDescription(e.target.value)}
                      placeholder="Brief details about the workshop or competition..." 
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 text-xs focus:outline-none"
                    />
                  </div>

                  <button 
                    type="button" 
                    onClick={addSubEvent}
                    className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white text-white hover:text-black border border-white/10 text-xs font-bold transition-all"
                  >
                    + Add Sub-Event
                  </button>
                </div>
              </div>

              {/* Submit visual publishing */}
              <button 
                type="submit" 
                disabled={isPublishing}
                className="w-full py-4 mt-4 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-pink text-black font-extrabold text-xs uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4 text-black" />
                {isPublishing ? 'COMPILING DESIGN AGENTS...' : 'Launch Dynamic Microsite Live'}
              </button>

            </form>
          </div>

        </div>

        {/* Right Hand: Phone Screen device live adaptor mockup */}
        <div className="flex flex-col gap-6 text-center shrink-0 lg:sticky lg:top-24">
          <div className="flex items-center justify-center gap-2 text-white/40 text-xs font-bold">
            <Eye className="w-4.5 h-4.5" /> 
            <span>LIVE preview adaptors device (Scale width)</span>
          </div>

          {/* Simulated smartphone device chassis wrapper */}
          <div className={`mx-auto w-[320px] h-[640px] rounded-[40px] border-8 border-white/10 overflow-hidden shadow-2xl relative flex flex-col ${themePreset === 'cyber' ? 'bg-[#05060c]' : themePreset === 'concert' ? 'bg-[#080410]' : themePreset === 'luxury' ? 'bg-[#0f0f10]' : 'bg-[#0a0a0c]'}`}>
            
            {/* Camera speaker notch chassis */}
            <div className="absolute top-0 inset-x-0 h-5 flex items-center justify-center z-20">
              <div className="w-24 h-4 rounded-b-xl bg-white/10" />
            </div>

            {/* Simulated Live adaptors view scrolling */}
            <div className="flex-grow overflow-y-auto px-4 py-8 flex flex-col gap-8 scrollbar-hide text-left pt-12 select-none select-text">
              
              {/* Dynamic preset styling adaptation */}
              <div className="text-center flex flex-col items-center">
                <span className={`text-[8px] uppercase tracking-wider font-tech font-bold ${themePreset === 'cyber' ? 'text-brand-cyan' : themePreset === 'concert' ? 'text-brand-pink' : themePreset === 'luxury' ? 'text-brand-gold' : 'text-white'}`}>
                  ✨ Dynamic Preview Adaptive
                </span>
                <h3 className={`text-xl font-black mt-2 leading-none text-center ${themePreset === 'luxury' ? 'font-serif text-brand-gold' : themePreset === 'cyber' ? 'font-tech text-white' : 'text-white'}`}>
                  {title || 'Event Name Preview'}
                </h3>
                <p className="text-[10px] text-white/50 mt-1 font-light text-center leading-normal">
                  {tagline || 'Explore your dynamic layout customizer adapters'}
                </p>
              </div>

              {/* Sections: schedule preview */}
              {sections.find(s => s.type === 'schedule')?.enabled && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-2">
                  <h6 className="text-[10px] font-bold uppercase tracking-wider text-white">Timeline Preview:</h6>
                  <div className="border-l border-white/10 pl-3 flex flex-col gap-3 text-[9px] text-white/60">
                    <div>
                      <p className="font-bold text-white">09:00 AM — Opening ceremony</p>
                      <p className="font-light text-white/40">Introduction and keynotes.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sections: registration preview */}
              {sections.find(s => s.type === 'registration')?.enabled && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-3">
                  <h6 className="text-[10px] font-bold uppercase tracking-wider text-white">Secure entry fields:</h6>
                  
                  <div className="flex flex-col gap-2">
                    {formFields.map((f, fIdx) => (
                      <div key={fIdx}>
                        <label className="block text-[8px] font-bold text-white/40 uppercase mb-1">{f.label}</label>
                        <div className="w-full h-8 rounded bg-white/5 border border-white/10 flex items-center px-2 text-[9px] text-white/20">
                          Enter {f.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={`w-full py-2.5 rounded text-[9px] font-extrabold uppercase text-center tracking-widest ${themePreset === 'cyber' ? 'bg-brand-cyan text-black' : themePreset === 'concert' ? 'bg-brand-pink text-black' : themePreset === 'luxury' ? 'bg-brand-gold text-black' : 'bg-white text-black'}`}>
                    RSVP TICKET IN PROGRESS
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
