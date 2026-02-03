
import React, { useState } from 'react';
import { Vehicle } from '../types';
import { ICONS } from '../constants';
import { supabase } from '../supabaseClient';

interface VehicleManagerProps {
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  isAdmin: boolean;
}

const VehicleManager: React.FC<VehicleManagerProps> = ({ vehicles, setVehicles, isAdmin }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    name: '', brand: '', model: '', plate: '', photo_url: ''
  });

  const handleOpenModal = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData(vehicle);
    } else {
      setEditingVehicle(null);
      setFormData({ name: '', brand: '', model: '', plate: '', photo_url: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.plate) return;
    setIsSaving(true);

    try {
      if (editingVehicle) {
        const { error } = await supabase
          .from('vehicles')
          .update(formData)
          .eq('id', editingVehicle.id);
        
        if (!error) {
          setVehicles(prev => prev.map(v => v.id === editingVehicle.id ? { ...v, ...formData } as Vehicle : v));
        }
      } else {
        const { data, error } = await supabase
          .from('vehicles')
          .insert([formData])
          .select();
        
        if (data && !error) {
          setVehicles(prev => [...prev, data[0]]);
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Erro ao salvar veículo:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este veículo?')) return;
    
    try {
      const { error } = await supabase.from('vehicles').delete().eq('id', id);
      if (!error) {
        setVehicles(prev => prev.filter(v => v.id !== id));
      }
    } catch (err) {
      console.error("Erro ao excluir veículo:", err);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Frota de Veículos</h2>
          <p className="text-gray-500">Gerencie os veículos cadastrados no sistema.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-blue-900/20"
          >
            <ICONS.Plus />
            Novo Veículo
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((v) => (
          <div key={v.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
            <div className="h-48 overflow-hidden bg-gray-200 relative">
              <img 
                src={v.photo_url || `https://picsum.photos/seed/${v.id}/400/300`} 
                alt={v.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-blue-700 shadow-sm uppercase">
                {v.plate}
              </div>
            </div>
            <div className="p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-1">{v.name}</h4>
              <p className="text-sm text-gray-500 mb-4">{v.brand} {v.model}</p>
              
              {isAdmin && (
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => handleOpenModal(v)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors text-sm font-semibold"
                  >
                    <ICONS.Edit /> Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(v.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-sm font-semibold"
                  >
                    <ICONS.Trash /> Excluir
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-slideUp border border-slate-800">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
              <h3 className="text-xl font-bold text-white">{editingVehicle ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors"><ICONS.X /></button>
            </div>
            
            <div className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-300 mb-1 uppercase tracking-wider">Nome do Veículo</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: Van 01"
                    className="w-full px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1 uppercase tracking-wider">Marca</label>
                  <input 
                    type="text" 
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    placeholder="Ex: Mercedes"
                    className="w-full px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1 uppercase tracking-wider">Modelo</label>
                  <input 
                    type="text" 
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    placeholder="Ex: Sprinter"
                    className="w-full px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-300 mb-1 uppercase tracking-wider">Placa</label>
                  <input 
                    type="text" 
                    value={formData.plate}
                    onChange={(e) => setFormData({...formData, plate: e.target.value})}
                    placeholder="Ex: ABC-1234"
                    className="w-full px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1 uppercase tracking-wider">Foto do Veículo</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-700 border-dashed rounded-xl hover:border-blue-500/50 transition-colors group bg-slate-800/50">
                  <div className="space-y-1 text-center">
                    {formData.photo_url ? (
                      <div className="relative inline-block">
                        <img src={formData.photo_url} className="h-32 rounded-lg shadow-lg border border-slate-700" />
                        <button 
                          onClick={() => setFormData({...formData, photo_url: ''})}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-lg hover:bg-red-700 transition-colors"
                        >
                          <ICONS.X />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="mx-auto h-12 w-12 text-slate-500 group-hover:text-blue-400 transition-colors">
                          <ICONS.Truck />
                        </div>
                        <div className="flex text-sm text-slate-400">
                          <label className="relative cursor-pointer rounded-md font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                            <span>Upload de arquivo</span>
                            <input type="file" className="sr-only" accept="image/*" onChange={handlePhotoUpload} />
                          </label>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-900 border-t border-slate-800 flex gap-4">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2 rounded-xl border border-slate-700 text-slate-300 font-bold hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className={`flex-1 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-900/20 transition-all ${isSaving ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
              >
                {isSaving ? 'Salvando...' : 'Salvar Veículo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleManager;
