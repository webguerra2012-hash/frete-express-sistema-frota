
import React, { useState, useEffect } from 'react';
import { 
  Vehicle, 
  Maintenance, 
  Occurrence, 
  User, 
  AppSettings, 
  Urgency, 
  OccurrenceStatus 
} from './types';
import { ICONS } from './constants';
import { supabase } from './supabaseClient';
import Dashboard from './components/Dashboard';
import VehicleManager from './components/VehicleManager';
import MaintenanceManager from './components/MaintenanceManager';
import OccurrenceManager from './components/OccurrenceManager';
import SettingsManager from './components/SettingsManager';
import UserManager from './components/UserManager';
import Login from './components/Login';

type Tab = 'dashboard' | 'vehicles' | 'maintenance' | 'occurrences' | 'users' | 'settings';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    logo_url: 'https://via.placeholder.com/150?text=FRETE+EXPRESS+RIO',
    company_name: 'Frete Express Rio'
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: vData } = await supabase.from('vehicles').select('*');
        if (vData) setVehicles(vData);

        const { data: oData } = await supabase.from('occurrences').select('*').order('created_at', { ascending: false });
        if (oData) setOccurrences(oData);

        const { data: mData } = await supabase.from('maintenances').select('*, maintenance_items(*)').order('service_date', { ascending: false });
        if (mData) {
          const mappedMaintenances = mData.map(m => ({
            ...m,
            items: m.maintenance_items || []
          }));
          setMaintenances(mappedMaintenances);
        }

        const { data: sData } = await supabase.from('settings').select('*');
        if (sData) {
          const settingsObj: any = {};
          sData.forEach(s => settingsObj[s.key] = s.value);
          if (settingsObj.company_name) {
            setSettings({
              company_name: settingsObj.company_name,
              logo_url: settingsObj.logo_url || settings.logo_url
            });
          }
        }
        
        const { data: uData } = await supabase.from('user_profiles').select('*');
        if (uData) setUsers(uData as User[]);
        
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (!currentUser) {
    return <Login logoUrl={settings.logo_url} onLogin={setCurrentUser} />;
  }

  const isAdmin = currentUser.role === 'admin';

  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    closeSidebarOnMobile();
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Sincronizando...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard': return <Dashboard vehicles={vehicles} maintenances={maintenances} occurrences={occurrences} />;
      case 'vehicles': return <VehicleManager vehicles={vehicles} setVehicles={setVehicles} isAdmin={isAdmin} />;
      case 'maintenance': return <MaintenanceManager vehicles={vehicles} maintenances={maintenances} setMaintenances={setMaintenances} isAdmin={isAdmin} />;
      case 'occurrences': return <OccurrenceManager vehicles={vehicles} occurrences={occurrences} setOccurrences={setOccurrences} isAdmin={isAdmin} />;
      case 'users': return isAdmin ? <UserManager users={users} setUsers={setUsers} /> : null;
      case 'settings': return <SettingsManager settings={settings} setSettings={setSettings} />;
      default: return <Dashboard vehicles={vehicles} maintenances={maintenances} occurrences={occurrences} />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <ICONS.Dashboard /> },
    { id: 'vehicles', label: 'Veículos', icon: <ICONS.Truck /> },
    { id: 'maintenance', label: 'Manutenção', icon: <ICONS.Wrench /> },
    { id: 'occurrences', label: 'Ocorrências', icon: <ICONS.Alert /> },
    ...(isAdmin ? [{ id: 'users', label: 'Usuários', icon: <ICONS.User /> }] : []),
    { id: 'settings', label: 'Configurações', icon: <ICONS.Settings /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden relative">
      {/* Sidebar e Conteúdo principal omitidos por brevidade, mas mantendo a lógica de isAdmin para exibição de menus */}
      {/* ... (Mesma estrutura do App.tsx anterior com a lógica de currentUser e isAdmin aplicada) */}
      
      {/* Sidebar Mobile Overlay */}
      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 w-64 bg-slate-900 text-white flex flex-col shadow-xl z-40 transition-transform duration-300 lg:translate-x-0 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <img src={settings.logo_url} alt="Logo" className="w-8 h-8 rounded shrink-0 bg-white p-1" />
            <span className="font-bold text-base uppercase truncate">{settings.company_name}</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => handleTabChange(item.id as Tab)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              {item.icon}
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <div className="flex items-center gap-3 px-2 py-1 bg-slate-800/50 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold shrink-0">{currentUser.name.charAt(0)}</div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold truncate text-white">{currentUser.name}</span>
              <span className="text-[10px] text-slate-400 uppercase">{currentUser.role}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 transition-colors">
            <ICONS.X /> Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-slate-600" onClick={() => setIsSidebarOpen(true)}><ICONS.Dashboard /></button>
            <h1 className="text-lg font-bold text-slate-800 capitalize truncate">{navItems.find(n => n.id === activeTab)?.label}</h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 animate-fadeIn">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
