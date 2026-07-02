'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import Link from 'next/link';
import { Radio, Users, Calendar, ShoppingBag, PlusCircle, Sparkles, FolderSync, ShieldAlert, Award, FileText, CheckCircle2, X, Download, Landmark, Shirt } from 'lucide-react';

export default function AdminDashboard() {
  const [dbStats, setDbStats] = useState<any>({
    users: 0,
    clubs: 0,
    events: 0,
    merchProducts: 0,
    merchOrders: 0
  });

  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Authenticated user state
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Modals Visibility
  const [showClubModal, setShowClubModal] = useState(false);
  const [showMerchModal, setShowMerchModal] = useState(false);

  // Club Form States
  const [clubName, setClubName] = useState('');
  const [clubTagline, setClubTagline] = useState('');
  const [clubDescription, setClubDescription] = useState('');
  const [clubLogo, setClubLogo] = useState('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80');
  const [clubBanner, setClubBanner] = useState('https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&q=80');
  const [clubAchievements, setClubAchievements] = useState('');
  const [clubInsta, setClubInsta] = useState('');
  const [clubGithub, setClubGithub] = useState('');
  const [clubAdvisorName, setClubAdvisorName] = useState('');
  const [clubPresidentName, setClubPresidentName] = useState('');

  // Merch Form States
  const [merchTitle, setMerchTitle] = useState('');
  const [merchDescription, setMerchDescription] = useState('');
  const [merchPrice, setMerchPrice] = useState('');
  const [merchCategory, setMerchCategory] = useState('oversized-tees');
  const [merchStock, setMerchStock] = useState('50');
  const [merchImage, setMerchImage] = useState('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80');
  const [merchSizes, setMerchSizes] = useState('S, M, L, XL');
  const [merchColors, setMerchColors] = useState('Charcoal Black, Off-White');
  const [merchCountdown, setMerchCountdown] = useState('');

  // Form Loading states
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAdminStats = async () => {
    try {
      const stats = await api.get('/admin/stats');
      const ordersList = await api.get('/admin/orders');
      
      setDbStats(stats);
      setOrders(ordersList);

      try {
        const usersList = await api.get('/admin/users');
        setUsers(usersList);
      } catch (userErr) {
        console.error('Failed to load registered users:', userErr);
      }

      // Fetch notifications or use dynamic summary
      setNotifications([
        { title: `Node report: ${stats.registrations} Student RSVPs synchronized`, type: 'database', time: 'Just now' },
        { title: `${stats.clubs} Campus clubs verified on main feed`, type: 'network', time: '1 min ago' },
        { title: `Merch drop inventory holding ${stats.merchProducts} products`, type: 'merch', time: '5 mins ago' }
      ]);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check permission
    const user = api.getCurrentUser();
    setCurrentUser(user);

    fetchAdminStats();
  }, []);

  // Submit Club Creation
  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubName || !clubDescription) {
      alert('Please fill out all required fields.');
      return;
    }

    setActionLoading(true);
    try {
      const achievementsList = clubAchievements ? clubAchievements.split(',').map(s => s.trim()) : [];
      const socialLinks = { instagram: clubInsta, github: clubGithub };
      
      const team = [];
      if (clubAdvisorName) team.push({ name: clubAdvisorName, role: 'Faculty Advisor', photo: '' });
      if (clubPresidentName) team.push({ name: clubPresidentName, role: 'President', photo: '' });

      await api.post('/clubs', {
        name: clubName,
        tagline: clubTagline || 'A premier campus society',
        logo: clubLogo,
        banner: clubBanner,
        description: clubDescription,
        achievements: achievementsList,
        socialLinks,
        team
      });

      alert('Club built and published successfully!');
      setShowClubModal(false);
      
      // Reset Club forms
      setClubName('');
      setClubTagline('');
      setClubDescription('');
      setClubAchievements('');
      setClubAdvisorName('');
      setClubPresidentName('');

      fetchAdminStats();
    } catch (err: any) {
      alert(err.message || 'Failed to create club.');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Merch Launching
  const handleLaunchMerch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchTitle || !merchPrice || !merchCategory) {
      alert('Please fill out all required fields.');
      return;
    }

    setActionLoading(true);
    try {
      const sizesList = merchSizes ? merchSizes.split(',').map(s => s.trim()) : ['S', 'M', 'L', 'XL'];
      const colorsList = merchColors ? merchColors.split(',').map(s => s.trim()) : ['Charcoal Black', 'Off-White'];

      await api.post('/merch', {
        title: merchTitle,
        description: merchDescription || 'High-quality official campus apparel',
        price: Number(merchPrice),
        category: merchCategory,
        stock: Number(merchStock),
        images: [merchImage],
        variants: { sizes: sizesList, colors: colorsList },
        countdownDropDate: merchCountdown || null
      });

      alert('Merch drop launched successfully!');
      setShowMerchModal(false);

      // Reset Merch forms
      setMerchTitle('');
      setMerchDescription('');
      setMerchPrice('');
      setMerchStock('50');
      setMerchCountdown('');

      fetchAdminStats();
    } catch (err: any) {
      alert(err.message || 'Failed to launch merch.');
    } finally {
      setActionLoading(false);
    }
  };

  // Export Unified Excel (CSV) Report
  const handleExportExcel = async () => {
    try {
      const ordersList = await api.get('/admin/orders');
      const registrationsList = await api.get('/admin/registrations');
      
      let csvContent = 'data:text/csv;charset=utf-8,';
      
      // Section 1: Dashboard Stats
      csvContent += '--- CAMPUSTHREAD SITE REPORT ---\n';
      csvContent += `Generated At,${new Date().toLocaleString()}\n`;
      csvContent += `Active Clubs,${dbStats.clubs}\n`;
      csvContent += `Live Microsites,${dbStats.events}\n`;
      csvContent += `Merch Products,${dbStats.merchProducts}\n`;
      csvContent += `Orders Secured,${dbStats.merchOrders}\n\n`;
      
      // Section 2: Merch Orders
      csvContent += '--- APPAREL ORDERS SECURED ---\n';
      csvContent += 'Order Ref ID,Student Name,Items purchased,Amount,Payment ID,Status,Date\n';
      ordersList.forEach((o: any) => {
        const escapedItems = `"${o.items.replace(/"/g, '""')}"`;
        csvContent += `${o.orderId},${o.studentName},${escapedItems},${o.amount},${o.paymentId},${o.status},${o.createdAt || ''}\n`;
      });
      csvContent += '\n';

      // Section 3: Event Registrations
      csvContent += '--- EVENT RSVP REGISTRATIONS ---\n';
      csvContent += 'Registration ID,Event Title,Student Name,Campus Roll Number,Payment Status,Payment Ref,Date\n';
      registrationsList.forEach((r: any) => {
        csvContent += `${r.id},${r.eventName},${r.studentName},${r.rollNumber},${r.paymentStatus},${r.paymentId},${r.createdAt || ''}\n`;
      });
      
      // Download trigger
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `campusthread_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Failed to generate CSV export report.');
    }
  };

  if (currentUser && currentUser.role === 'Student User') {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-20 text-center flex flex-col gap-4">
        <ShieldAlert className="w-12 h-12 text-brand-pink mx-auto" />
        <h2 className="text-2xl font-black text-brand-pink">RESTRICTED ACCESS AREA</h2>
        <p className="text-sm text-white/50">Your student credentials lack authorization roles (`Club Admin`, `Super Admin`, etc.) required to manipulate control nodes.</p>
        <Link href="/feed" className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-white text-xs font-semibold uppercase tracking-wider mx-auto">
          Return to Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-10">
      
      {/* ================= HEADER SECTION ================= */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/15 border border-brand-gold/20 text-[10px] uppercase font-tech font-bold text-brand-gold tracking-wider mb-4 animate-pulse">
            <Radio className="w-3.5 h-3.5" /> Node synchronized live
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white">Control Hub</h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1 font-light">Notion-style visual administration hub. No coding required.</p>
          {currentUser && (
            <div className="mt-3 text-xs text-white/60 flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-brand-cyan">{currentUser.name}</span>
              <span className="text-white/30">|</span>
              <span>{currentUser.email}</span>
              <span className="text-white/30">|</span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-brand-gold font-mono font-bold uppercase tracking-wider text-[9px]">{currentUser.role}</span>
            </div>
          )}
        </div>

        {/* Action Toggles */}
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setShowClubModal(true)}
            className="flex items-center gap-1.5 px-5 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all"
          >
            <Landmark className="w-4 h-4 text-brand-cyan" /> Build Club
          </button>
          
          <button 
            onClick={() => setShowMerchModal(true)}
            className="flex items-center gap-1.5 px-5 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all"
          >
            <Shirt className="w-4 h-4 text-brand-pink" /> Launch Merch
          </button>

          <Link 
            href="/admin/builder"
            className="flex items-center gap-1.5 px-5 py-3 rounded-full bg-gradient-to-r from-brand-cyan to-brand-pink text-black font-black text-xs uppercase tracking-wider hover:scale-105 transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)]"
          >
            <PlusCircle className="w-4 h-4 text-black" /> No-Code Event Builder
          </Link>
          
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-5 py-3 rounded-full bg-brand-gold text-black font-black text-xs uppercase tracking-wider hover:scale-105 transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)]"
          >
            <Download className="w-4 h-4" /> Export Excel Report
          </button>
        </div>
      </section>

      {/* ================= STATISTICS TILES ================= */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { title: 'Active Clubs', val: dbStats.clubs, color: 'text-brand-cyan', bg: 'bg-brand-cyan/10' },
          { title: 'Live Microsites', val: dbStats.events, color: 'text-brand-pink', bg: 'bg-brand-pink/10' },
          { title: 'Merch Products', val: dbStats.merchProducts, color: 'text-brand-purple', bg: 'bg-brand-purple/10' },
          { title: 'Orders Secured', val: dbStats.merchOrders, color: 'text-brand-gold', bg: 'bg-brand-gold/10' }
        ].map((tile, index) => (
          <div key={index} className="glass p-6 rounded-2xl border border-white/5 flex flex-col text-left">
            <span className="text-[10px] uppercase font-tech tracking-wider text-white/40 mb-1">{tile.title}</span>
            <span className={`text-3xl sm:text-4xl font-black tracking-tight ${tile.color}`}>{tile.val}</span>
          </div>
        ))}
      </section>

      {/* ================= CONTROL MATRIX TABLES ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Columns 1 & 2: Active Orders / Registered products */}
        <div className="lg:col-span-2 flex flex-col gap-10 text-left">
          
          {/* Orders database table */}
          <div className="glass p-6 sm:p-8 rounded-2xl border border-white/5">
            <h3 className="text-xl font-bold mb-6 text-white tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-pink" /> Apparel Orders & Checkout Records
            </h3>

            {orders.length === 0 ? (
              <div className="p-8 text-center text-xs text-white/40 border border-dashed border-white/10 rounded-xl">
                No orders have been secured yet. Try purchasing items from the Merch Store.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-white/40 uppercase font-tech tracking-widest text-left pb-4">
                      <th className="pb-3 font-semibold">Ref ID</th>
                      <th className="pb-3 font-semibold">Student Name</th>
                      <th className="pb-3 font-semibold">Items</th>
                      <th className="pb-3 font-semibold">Total Cost</th>
                      <th className="pb-3 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o, index) => (
                      <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4 font-mono text-brand-cyan">{o.orderId}</td>
                        <td className="py-4 font-bold text-white">{o.studentName}</td>
                        <td className="py-4 text-white/60 truncate max-w-xs">{o.items}</td>
                        <td className="py-4 font-bold text-white">{o.amount}</td>
                        <td className="py-4 text-right">
                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-tech font-bold ${o.status === 'Completed' ? 'bg-brand-neon/20 text-brand-neon' : 'bg-brand-gold/20 text-brand-gold'}`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Registered Users database table */}
          <div className="glass p-6 sm:p-8 rounded-2xl border border-white/5 mt-8">
            <h3 className="text-xl font-bold mb-6 text-white tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-cyan" /> Registered Users & Login Accounts
            </h3>

            {users.length === 0 ? (
              <div className="p-8 text-center text-xs text-white/40 border border-dashed border-white/10 rounded-xl">
                No user accounts retrieved.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-white/40 uppercase font-tech tracking-widest text-left pb-4">
                      <th className="pb-3 font-semibold">User ID</th>
                      <th className="pb-3 font-semibold">Name</th>
                      <th className="pb-3 font-semibold">Email</th>
                      <th className="pb-3 font-semibold">Role</th>
                      <th className="pb-3 font-semibold text-right">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, index) => (
                      <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4 font-mono text-white/50">{u.id}</td>
                        <td className="py-4 font-bold text-white">{u.name}</td>
                        <td className="py-4 text-white/60">{u.email}</td>
                        <td className="py-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-tech font-bold ${
                            u.role === 'Super Admin' ? 'bg-brand-gold/20 text-brand-gold' :
                            u.role === 'Club Admin' ? 'bg-brand-cyan/20 text-brand-cyan' :
                            u.role === 'Event Manager' ? 'bg-brand-purple/20 text-brand-purple' :
                            'bg-white/10 text-white/60'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 text-right text-white/50">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Column 3: Notifications & Events log */}
        <div className="flex flex-col gap-6 text-left">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-gold" />
            <h3 className="text-xl font-bold text-white tracking-tight">Active Node Feed</h3>
          </div>

          <div className="glass p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
            {notifications.map((not, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-brand-cyan uppercase tracking-wider">{not.type} drop</span>
                  <span className="text-white/40">{not.time}</span>
                </div>
                <h5 className="font-bold text-xs text-white leading-tight">{not.title}</h5>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ================= BUILD CLUB MODAL OVERLAY ================= */}
      {showClubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-2xl glass p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-y-auto max-h-[90vh]">
            <button 
              onClick={() => setShowClubModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 border border-white/10 text-white hover:text-brand-pink transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-black text-white flex items-center gap-2 mb-2">
              <Landmark className="w-6 h-6 text-brand-cyan" /> Build a Campus Club
            </h2>
            <p className="text-xs text-white/40 mb-6">Create a prestigious student community visible instantly on the Campus Feed.</p>

            <form onSubmit={handleCreateClub} className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">Club Name *</label>
                <input 
                  type="text" 
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  placeholder="e.g. Esports & Gaming Syndicate" 
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-brand-cyan"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">Tagline / Mission statement</label>
                <input 
                  type="text" 
                  value={clubTagline}
                  onChange={(e) => setClubTagline(e.target.value)}
                  placeholder="e.g. We connect players. We frame victory." 
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">Description *</label>
                <textarea 
                  rows={3}
                  value={clubDescription}
                  onChange={(e) => setClubDescription(e.target.value)}
                  placeholder="e.g. The Esports Syndicate organizes LAN parties, tournaments, and reviews games. Join 200+ members to represent our university at national fests..." 
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-brand-cyan"
                  required
                />
              </div>

               <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">Logo Image URL or Upload</label>
                <div className="flex flex-col gap-2">
                  <input 
                    type="text" 
                    value={clubLogo}
                    onChange={(e) => setClubLogo(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-cyan"
                  />
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (typeof reader.result === 'string') setClubLogo(reader.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="text-[10px] text-white/40 file:mr-2 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:text-[10px] file:bg-white/10 file:text-white hover:file:bg-white/20 w-full"
                  />
                </div>
              </div>
 
              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">Banner Image URL or Upload</label>
                <div className="flex flex-col gap-2">
                  <input 
                    type="text" 
                    value={clubBanner}
                    onChange={(e) => setClubBanner(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-cyan"
                  />
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (typeof reader.result === 'string') setClubBanner(reader.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="text-[10px] text-white/40 file:mr-2 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:text-[10px] file:bg-white/10 file:text-white hover:file:bg-white/20 w-full"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">Achievements (Comma separated)</label>
                <input 
                  type="text" 
                  value={clubAchievements}
                  onChange={(e) => setClubAchievements(e.target.value)}
                  placeholder="e.g. Best New Club 2025, Hosted 128-player FIFA tournament" 
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 text-xs focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">Faculty Advisor Name</label>
                <input 
                  type="text" 
                  value={clubAdvisorName}
                  onChange={(e) => setClubAdvisorName(e.target.value)}
                  placeholder="e.g. Dr. Robert Vance" 
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">Club President Name</label>
                <input 
                  type="text" 
                  value={clubPresidentName}
                  onChange={(e) => setClubPresidentName(e.target.value)}
                  placeholder="e.g. Clarissa Oswald" 
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div className="sm:col-span-2 flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowClubModal(false)}
                  className="w-1/2 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={actionLoading}
                  className="w-1/2 py-3.5 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-pink text-black font-extrabold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                >
                  {actionLoading ? 'BUILDING CLUB...' : 'Publish Club Live'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= LAUNCH MERCH MODAL OVERLAY ================= */}
      {showMerchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-2xl glass p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-y-auto max-h-[90vh]">
            <button 
              onClick={() => setShowMerchModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 border border-white/10 text-white hover:text-brand-pink transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-black text-white flex items-center gap-2 mb-2">
              <Shirt className="w-6 h-6 text-brand-pink" /> Launch Merchandise Drop
            </h2>
            <p className="text-xs text-white/40 mb-6">Drop exclusive hoodies, t-shirts, caps, or varsities onto the Campus Co. store.</p>

            <form onSubmit={handleLaunchMerch} className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">Product Title *</label>
                <input 
                  type="text" 
                  value={merchTitle}
                  onChange={(e) => setMerchTitle(e.target.value)}
                  placeholder="e.g. CT-Cyber: Retro Glow puff Hoodie" 
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-brand-cyan"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">Price in INR (₹) *</label>
                <input 
                  type="number" 
                  value={merchPrice}
                  onChange={(e) => setMerchPrice(e.target.value)}
                  placeholder="e.g. 1599" 
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-brand-cyan"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">Store Category *</label>
                <select
                  value={merchCategory}
                  onChange={(e) => setMerchCategory(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-card border border-white/10 text-white text-xs focus:outline-none focus:border-brand-cyan"
                  required
                >
                  <option value="oversized-tees">Oversized T-Shirts</option>
                  <option value="hoodies">French Terry Hoodies</option>
                  <option value="drops">Limited Release Drops</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">Product Description</label>
                <textarea 
                  rows={2}
                  value={merchDescription}
                  onChange={(e) => setMerchDescription(e.target.value)}
                  placeholder="e.g. Crafted from heavy French Terry cotton (420 GSM) with an oversized fit..." 
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">Initial Stock Count</label>
                <input 
                  type="number" 
                  value={merchStock}
                  onChange={(e) => setMerchStock(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">Product Showcase Image URL or Upload</label>
                <div className="flex flex-col gap-2">
                  <input 
                    type="text" 
                    value={merchImage}
                    onChange={(e) => setMerchImage(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-cyan"
                  />
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (typeof reader.result === 'string') setMerchImage(reader.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="text-[10px] text-white/40 file:mr-2 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:text-[10px] file:bg-white/10 file:text-white hover:file:bg-white/20 w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">Available Sizes (Comma separated)</label>
                <input 
                  type="text" 
                  value={merchSizes}
                  onChange={(e) => setMerchSizes(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">Available Colors (Comma separated)</label>
                <input 
                  type="text" 
                  value={merchColors}
                  onChange={(e) => setMerchColors(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">Countdown Drop Date (Optional)</label>
                <input 
                  type="datetime-local" 
                  value={merchCountdown}
                  onChange={(e) => setMerchCountdown(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div className="sm:col-span-2 flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowMerchModal(false)}
                  className="w-1/2 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={actionLoading}
                  className="w-1/2 py-3.5 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-pink text-black font-extrabold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                >
                  {actionLoading ? 'LAUNCHING DROP...' : 'Publish Merch Drop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
