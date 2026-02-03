
import React, { useState } from 'react';
import { AppSettings } from '../types';
import { ICONS } from '../constants';
import { supabase } from '../supabaseClient';

interface SettingsManagerProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

const SettingsManager: React.FC<SettingsManagerProps> = ({ settings, setSettings }) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({ ...prev, logo_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates = [
        { key: 'company_name', value: settings.company_name },
        { key: 'logo_url', value: settings.logo_url }
      ];

      const { error } = await supabase
        .from('settings')
        .upsert(updates, { onConflict: 'key' });

      if (error) throw error;
      alert('Configurações salvas com sucesso!');
    } catch (err) {
      console.error("Erro ao salvar configurações:", err);
      alert('Erro ao sincronizar configurações.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800">Personalização do Sistema</h3>
          <p className="text-sm text-gray-500">Ajuste a identidade visual da Frete Express Rio.</p>
        </div>
        
        <div className="p-8 space-y-8">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Logotipo da Empresa</label>
            <div className="flex items-center gap-8">
              <div className="w-32 h-32 rounded-2xl border-2 border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden p-2">
                <img src={settings.logo_url} alt="Logo preview" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-1 space-y-4">
                <label className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-md">
                  <ICONS.Plus />
                  Alterar Logotipo
                  <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Nome de Exibição</label>
            <input 
              type="text" 
              value={settings.company_name}
              onChange={(e) => setSettings({...settings, company_name: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="p-8 bg-gray-50 border-t">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-colors shadow-lg ${isSaving ? 'opacity-50' : ''}`}
          >
            {isSaving ? 'Salvando...' : 'Salvar Todas as Configurações'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsManager;
