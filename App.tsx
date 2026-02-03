
import React, { useState, useEffect } from 'react';
import { 
  Vehicle, 
  Maintenance, 
  Occurrence, 
  User, 
  AppSettings, 
  OccurrenceStatus 
} from './types';
import { ICONS, COLORS } from './constants';
import { supabase } from './supabaseClient';
import Dashboard from './components/Dashboard';
import VehicleManager from './components/VehicleManager';
import MaintenanceManager from './components/MaintenanceManager';
import OccurrenceManager from './components/OccurrenceManager';
import SettingsManager from './components/SettingsManager';
import UserManager from './components/UserManager';
import Login from './components/Login';

type Tab = 'dashboard' | 'vehicles' | 'maintenance' | 'occurrences' | 'users' | 'settings';

const NavButton: React.FC<{ 
  item: any; 
  activeTab: Tab; 
  handleTabChange: (tab: Tab) => void 
}> = ({ item, activeTab, handleTabChange }) => (
  <button 
    onClick={() => handleTabChange(item.id as Tab)} 
    className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all group ${activeTab === item.id ? 'bg-[#1e3a8a] text-white shadow-xl shadow-blue-900/40' : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'}`}
  >
    <div className={`transition-transform duration-300 ${activeTab === item.id ? 'scale-110 text-[#4ade80]' : 'group-hover:scale-110 opacity-70'}`}>
      {item.icon}
    </div>
    <span className="font-bold text-[13px] tracking-tight">{item.label}</span>
  </button>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [hasVehicleColumn, setHasVehicleColumn] = useState(true); // Flag de integridade
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    logo_url: 'https://via.placeholder.com/150?text=FRETE+RIO',
    company_name: 'Frete Express Rio'
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Carregamento de Veículos
        const { data: vData } = await supabase.from('vehicles').select('*');
        if (vData) setVehicles(vData);

        // Carregamento de Ocorrências
        const { data: oData } = await supabase.from('occurrences').select('*').order('created_at', { ascending: false });
        if (oData) setOccurrences(oData);

        // Carregamento de Manutenções
        const { data: mData } = await supabase.from('maintenances').select('*, maintenance_items(*)').order('service_date', { ascending: false });
        if (mData) {
          const mappedMaintenances = mData.map(m => ({
            ...m,
            items: m.maintenance_items || []
          }));
          setMaintenances(mappedMaintenances);
        }

        // Carregamento de Usuários e Detecção de Schema
        try {
            // Teste de integridade da coluna 'assigned_vehicle_id'
            const { error: probeError } = await supabase.from('user_profiles').select('assigned_vehicle_id').limit(1);
            
            if (probeError && (probeError.code === '42703' || probeError.message.includes('schema cache'))) {
                console.warn("Detectado Schema Incompleto: Coluna assigned_vehicle_id ausente.");
                setHasVehicleColumn(false);
                const { data: uDataRetry } = await supabase.from('user_profiles').select('id, name, email, password, role');
                if (uDataRetry) setUsers(uDataRetry as User[]);
            } else {
                const { data: uData } = await supabase.from('user_profiles').select('*');
                if (uData) setUsers(uData as User[]);
            }
        } catch (e) {
            console.error("Erro ao sondar usuários:", e);
        }

        // Configurações
        const { data: sData } = await supabase.from('settings').select('*');
        if (sData) {
          const settingsObj: any = {};
          sData.forEach(s => settingsObj[s.key] = s.value);
          setSettings(prev => ({
            company_name: settingsObj.company_name || prev.company_name,
            logo_url: settingsObj.logo_url || prev.logo_url
          }));
        }
        
      } catch (error) {
        console.error("Erro geral de carregamento:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (!currentUser) {
    return <Login logoUrl={settings.logo_url} onLogin={setCurrentUser} users={users} />;
  }

  const isAdmin = currentUser.role === 'admin' || currentUser.email.includes('admin@');
  const isDriver = currentUser.role === 'motorista';
  const myVehicleId = currentUser.assigned_vehicle_id;

  const filteredVehicles = isDriver && myVehicleId ? vehicles.filter(v => v.id === myVehicleId) : vehicles;
  const filteredMaintenances = isDriver && myVehicleId ? maintenances.filter(m => m.vehicle_id === myVehicleId) : maintenances;
  const filteredOccurrences = isDriver && myVehicleId ? occurrences.filter(o => o.vehicle_id === myVehicleId) : occurrences;

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'Início', icon: <ICONS.Dashboard /> },
    { id: 'vehicles', label: 'Frota', icon: <ICONS.Truck /> },
    { id: 'maintenance', label: 'Manutenção', icon: <ICONS.Wrench /> },
    { id: 'occurrences', label: 'Alertas', icon: <ICONS.Alert /> },
  ];

  return (
    <div className="flex h-screen bg-[#F1F5F9] overflow-hidden font-['Inter']">
      <aside className={`fixed inset-y-0 left-0 w-[260px] bg-[#0F172A] text-white flex flex-col z-40 transition-transform duration-300 lg:translate-x-0 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 flex flex-col items-center border-b border-slate-800/50">
          <div className="bg-white p-3 rounded-[2rem] mb-4">
            <img src={settings.logo_url} alt="Logo" className="w-12 h-12 object-contain" />
          </div>
          <p className="text-[14px] font-black uppercase tracking-widest text-white">{settings.company_name}</p>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-6">
          <div>
            <h3 className="px-5 mb-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Painel Operacional</h3>
            <div className="space-y-1">
              {navItems.map(item => (
                <NavButton key={item.id} item={item} activeTab={activeTab} handleTabChange={handleTabChange} />
              ))}
            </div>
          </div>

          {isAdmin && (
            <div>
              <h3 className="px-5 mb-4 text-[9px] font-black text-[#4ade80] uppercase tracking-widest">Gestão Rio</h3>
              <div className="space-y-1">
                <NavButton item={{ id: 'users', label: 'Equipe & Acessos', icon: <ICONS.User /> }} activeTab={activeTab} handleTabChange={handleTabChange} />
                <NavButton item={{ id: 'settings', label: 'Aparência', icon: <ICONS.Settings /> }} activeTab={activeTab} handleTabChange={handleTabChange} />
              </div>
            </div>
          )}
        </nav>

        <div className="p-6 bg-slate-900 border-t border-slate-800/50">
           <button onClick={() => setCurrentUser(null)} className="w-full flex items-center justify-center py-3.5 rounded-2xl text-[10px] font-black text-slate-400 hover:text-red-400 transition-all uppercase tracking-widest border border-slate-800">
             Sair do Sistema
           </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 shrink-0">
          <div className="flex items-center gap-4">
             <button className="lg:hidden p-2 text-slate-500" onClick={() => setIsSidebarOpen(true)}><ICONS.Menu /></button>
             <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">{activeTab}</h2>
          </div>
          {!hasVehicleColumn && isAdmin && (
            <div className="bg-amber-50 text-amber-600 px-4 py-1.5 rounded-lg border border-amber-100 flex items-center gap-2 animate-pulse">
               <ICONS.Alert />
               <span className="text-[10px] font-black uppercase">Ação necessária no banco de dados</span>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'dashboard' && <Dashboard vehicles={filteredVehicles} maintenances={filteredMaintenances} occurrences={filteredOccurrences} isDriverView={isDriver} />}
            {activeTab === 'vehicles' && <VehicleManager vehicles={filteredVehicles} setVehicles={setVehicles} isAdmin={isAdmin} />}
            {activeTab === 'maintenance' && <MaintenanceManager vehicles={filteredVehicles} maintenances={filteredMaintenances} setMaintenances={setMaintenances} isAdmin={isAdmin} />}
            {activeTab === 'occurrences' && <OccurrenceManager vehicles={filteredVehicles} occurrences={filteredOccurrences} setOccurrences={setOccurrences} isAdmin={isAdmin} />}
            {activeTab === 'users' && isAdmin && (
              <UserManager 
                users={users} 
                setUsers={setUsers} 
                vehicles={vehicles} 
                currentUserEmail={currentUser.email} 
                hasVehicleColumn={hasVehicleColumn} 
              />
            )}
            {activeTab === 'settings' && isAdmin && <SettingsManager settings={settings} setSettings={setSettings} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
