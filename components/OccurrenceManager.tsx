
import React, { useState } from 'react';
import { Vehicle, Occurrence, Urgency, OccurrenceStatus } from '../types';
import { ICONS } from '../constants';
import { supabase } from '../supabaseClient';

interface OccurrenceManagerProps {
  vehicles: Vehicle[];
  occurrences: Occurrence[];
  setOccurrences: React.Dispatch<React.SetStateAction<Occurrence[]>>;
  isAdmin: boolean;
}

const OccurrenceManager: React.FC<OccurrenceManagerProps> = ({ vehicles, occurrences, setOccurrences, isAdmin }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Occurrence>>({
    vehicle_id: '',
    description: '',
    urgency: Urgency.MEDIUM,
    photo_url: ''
  });

  const handleSave = async () => {
    if (!formData.vehicle_id || !formData.description) return;
    setIsSaving(true);

    const newOccurrenceData = {
      vehicle_id: formData.vehicle_id,
      description: formData.description,
      urgency: formData.urgency,
      photo_url: formData.photo_url,
      status: OccurrenceStatus.OPEN
    };

    try {
      const { data, error } = await supabase
        .from('occurrences')
        .insert([newOccurrenceData])
        .select();

      if (data && !error) {
        setOccurrences([data[0], ...occurrences]);
        setIsModalOpen(false);
        setFormData({ vehicle_id: '', description: '', urgency: Urgency.MEDIUM, photo_url: '' });
      }
    } catch (err) {
      console.error("Erro ao registrar ocorrência:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const closeOccurrence = async (id: string) => {
    try {
      const { error } = await supabase
        .from('occurrences')
        .update({ status: OccurrenceStatus.CLOSED })
        .eq('id', id);
      
      if (!error) {
        setOccurrences(prev => prev.map(o => o.id === id ? { ...o, status: OccurrenceStatus.CLOSED } : o));
      }
    } catch (err) {
      console.error("Erro ao resolver ocorrência:", err);
    }
  };

  const deleteOccurrence = async (id: string) => {
    if (!window.confirm('Excluir este registro?')) return;
    try {
      const { error } = await supabase.from('occurrences').delete().eq('id', id);
      if (!error) {
        setOccurrences(prev => prev.filter(o => o.id !== id));
      }
    } catch (err) {
      console.error("Erro ao excluir ocorrência:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Ocorrências do Dia-a-Dia</h2>
          <p className="text-gray-500">Relatos emergenciais enviados pelos motoristas.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-red-900/20"
        >
          <ICONS.Alert />
          Registrar Ocorrência
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {occurrences.map((occ) => {
          const vehicle = vehicles.find(v => v.id === occ.vehicle_id);
          return (
            <div key={occ.id} className={`bg-white rounded-2xl p-6 shadow-sm border-l-4 ${
              occ.urgency === Urgency.HIGH ? 'border-l-red-500' : 
              occ.urgency === Urgency.MEDIUM ? 'border-l-amber-500' : 'border-l-blue-500'
            } border border-gray-100 flex flex-col md:flex-row gap-6 items-start hover:shadow-md transition-shadow`}>
              <div className="w-full md:w-32 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                <img src={occ.photo_url || `https://picsum.photos/seed/${occ.id}/200/200`} className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    occ.urgency === Urgency.HIGH ? 'bg-red-100 text-red-600' : 
                    occ.urgency === Urgency.MEDIUM ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {occ.urgency} Urgência
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    occ.status === OccurrenceStatus.OPEN ? 'bg-slate-100 text-slate-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {occ.status}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-gray-900 leading-tight">{occ.description}</h4>
                <p className="text-sm text-gray-500">
                  Veículo: <span className="font-semibold text-gray-700">{vehicle?.name || 'Veículo Removido'} ({vehicle?.plate || '---'})</span> • {new Date(occ.created_at).toLocaleString()}
                </p>
              </div>

              <div className="flex md:flex-col gap-2">
                {occ.status === OccurrenceStatus.OPEN && isAdmin && (
                  <button onClick={() => closeOccurrence(occ.id)} className="px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-sm font-bold flex items-center gap-1">
                    <ICONS.Check /> Resolver
                  </button>
                )}
                {isAdmin && (
                  <button onClick={() => deleteOccurrence(occ.id)} className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-bold flex items-center gap-1">
                    <ICONS.Trash /> Excluir
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-slideUp border border-red-900/20">
            <div className="p-6 border-b border-red-900/30 flex justify-between items-center bg-red-950/20">
              <h3 className="text-xl font-bold text-red-400 flex items-center gap-2 uppercase tracking-widest">
                <ICONS.Alert /> Novo Alerta
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors"><ICONS.X /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Selecionar Veículo</label>
                <select value={formData.vehicle_id} onChange={(e) => setFormData({...formData, vehicle_id: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-red-500/50 transition-all">
                  <option value="" className="bg-slate-900 text-slate-500">Selecione o Veículo...</option>
                  {vehicles.map(v => <option key={v.id} value={v.id} className="bg-slate-900 text-white">{v.name} ({v.plate})</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Descrição do Problema</label>
                <textarea rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="O que aconteceu?" className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-red-500/50 transition-all"></textarea>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center block">Nível de Urgência</label>
                <div className="grid grid-cols-3 gap-3">
                  {[Urgency.LOW, Urgency.MEDIUM, Urgency.HIGH].map(u => (
                    <button 
                      key={u} 
                      onClick={() => setFormData({...formData, urgency: u})} 
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        formData.urgency === u 
                        ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-900/40' 
                        : 'bg-slate-800 text-slate-500 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-900 border-t border-slate-800 flex gap-4">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-bold hover:bg-slate-700 transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={isSaving} className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-bold shadow-lg shadow-red-900/20 active:scale-95 transition-all">{isSaving ? 'Enviando...' : 'Enviar Alerta'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OccurrenceManager;
