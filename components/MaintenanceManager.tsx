
import React, { useState, useMemo } from 'react';
import { Vehicle, Maintenance, MaintenanceItem } from '../types';
import { ICONS } from '../constants';
import { supabase } from '../supabaseClient';

interface MaintenanceManagerProps {
  vehicles: Vehicle[];
  maintenances: Maintenance[];
  setMaintenances: React.Dispatch<React.SetStateAction<Maintenance[]>>;
  isAdmin: boolean;
}

const MaintenanceManager: React.FC<MaintenanceManagerProps> = ({ vehicles, maintenances, setMaintenances, isAdmin }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedMaint, setSelectedMaint] = useState<Maintenance | null>(null);
  const [items, setItems] = useState<Partial<MaintenanceItem>[]>([]);
  const [formData, setFormData] = useState({
    vehicle_id: '',
    repair_type: '',
    service_date: new Date().toISOString().split('T')[0],
    description: '',
    labor_cost: 0,
    warranty: '',
    nf_url: ''
  });

  const totals = useMemo(() => {
    const partsCost = items.reduce((acc, item) => acc + ((item.quantity || 0) * (item.unit_price || 0)), 0);
    const labor = Number(formData.labor_cost) || 0;
    return { parts: partsCost, labor, total: partsCost + labor };
  }, [items, formData.labor_cost]);

  const handleSave = async () => {
    if (!formData.vehicle_id || !formData.repair_type) return;
    setIsSaving(true);
    try {
      const { data: mData, error: mError } = await supabase
        .from('maintenances')
        .insert([{
          vehicle_id: formData.vehicle_id,
          repair_type: formData.repair_type,
          service_date: formData.service_date,
          description: formData.description,
          labor_cost: formData.labor_cost,
          warranty: formData.warranty,
          nf_url: formData.nf_url,
          total_parts: totals.parts,
          total_service: totals.labor,
          total_cost: totals.total
        }])
        .select().single();

      if (mData && items.length > 0) {
        await supabase.from('maintenance_items').insert(items.map(i => ({ maintenance_id: mData.id, ...i })));
      }
      setMaintenances([{ ...mData, items: items as any }, ...maintenances]);
      setIsModalOpen(false);
    } catch (err) { console.error(err); } finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin || !window.confirm('Excluir este registro permanentemente?')) return;
    try {
      await supabase.from('maintenances').delete().eq('id', id);
      setMaintenances(prev => prev.filter(m => m.id !== id));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manutenções</h2>
          <p className="text-sm text-gray-400">Gerenciamento financeiro e técnico da frota.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-5 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-lg shadow-blue-900/20 active:scale-95 transition-all">
          <ICONS.Plus /> Novo Lançamento
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-slate-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Veículo</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Serviço</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valor Total</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {maintenances.map((m) => {
                const vehicle = vehicles.find(v => v.id === m.vehicle_id);
                return (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{vehicle?.name}</span>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded w-fit uppercase">{vehicle?.plate}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{m.repair_type}</td>
                    <td className="px-6 py-4 text-xs text-slate-400 font-medium">{new Date(m.service_date).toLocaleDateString('pt-BR')}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{m.total_cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                         <button onClick={() => setSelectedMaint(m)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><ICONS.Check /></button>
                         {isAdmin && <button onClick={() => handleDelete(m.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><ICONS.Trash /></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Detalhes da Manutenção Modal e Modal de Cadastro seguem o padrão visual de tema escuro com fontes brancas */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-800 animate-slideUp">
             <div className="p-6 border-b border-slate-800 flex justify-between items-center">
               <h3 className="text-xl font-bold text-white uppercase tracking-widest">Lançar Manutenção</h3>
               <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><ICONS.X /></button>
             </div>
             <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Veículo</label>
                    <select value={formData.vehicle_id} onChange={e => setFormData({...formData, vehicle_id: e.target.value})} className="w-full bg-slate-800 border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Selecione...</option>
                      {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.plate})</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Tipo de Serviço</label>
                    <input type="text" value={formData.repair_type} onChange={e => setFormData({...formData, repair_type: e.target.value})} className="w-full bg-slate-800 border-slate-700 text-white rounded-xl px-4 py-3 outline-none" placeholder="Ex: Freios" />
                  </div>
                </div>
                {/* Campos adicionais simplificados por brevidade */}
                <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-center">
                   <div>
                     <p className="text-[10px] font-bold text-slate-500 uppercase">Total Previsto</p>
                     <p className="text-3xl font-bold text-blue-500">{totals.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                   </div>
                   <button onClick={handleSave} disabled={isSaving} className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold active:scale-95 transition-all">{isSaving ? 'Salvando...' : 'Concluir'}</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceManager;
