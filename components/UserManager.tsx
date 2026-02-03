
import React, { useState } from 'react';
import { User } from '../types';
import { ICONS } from '../constants';
import { supabase } from '../supabaseClient';

interface UserManagerProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const UserManager: React.FC<UserManagerProps> = ({ users, setUsers }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    name: '', email: '', role: 'colaborador'
  });

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      alert('Nome e E-mail são obrigatórios.');
      return;
    }
    setIsSaving(true);

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([{
          name: formData.name,
          email: formData.email,
          role: formData.role
        }])
        .select();

      if (error) throw error;

      if (data) {
        setUsers([...users, data[0] as User]);
        setIsModalOpen(false);
        setFormData({ name: '', email: '', role: 'colaborador' });
        alert('Usuário cadastrado com sucesso!');
      }
    } catch (err: any) {
      console.error("Erro ao salvar usuário:", err);
      alert('Erro ao salvar usuário: ' + (err.message || 'Verifique se a tabela user_profiles existe.'));
    } finally {
      setIsSaving(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (!window.confirm('Excluir este usuário?')) return;

    try {
      const { error } = await supabase.from('user_profiles').delete().eq('id', id);
      if (error) throw error;
      setUsers(users.filter(u => u.id !== id));
    } catch (err: any) {
      console.error("Erro ao excluir usuário:", err);
      alert('Erro ao excluir: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Controle de Usuários</h2>
          <p className="text-gray-500">Gerencie quem tem acesso ao painel administrativo.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg"
        >
          <ICONS.Plus />
          Adicionar Usuário
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">Perfil</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.length === 0 ? (
              <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">Nenhum usuário cadastrado além do Admin.</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                      {u.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900">{u.name}</span>
                      <span className="text-xs text-gray-400">{u.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => deleteUser(u.id)} className="text-red-400 hover:text-red-600 transition-colors">
                      <ICONS.Trash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl animate-slideUp border border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
              <h3 className="text-xl font-bold text-white uppercase tracking-widest">Novo Acesso</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors"><ICONS.X /></button>
            </div>
            <div className="p-8 space-y-5">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Nome Completo</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" placeholder="Ex: João Silva" />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">E-mail</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" placeholder="exemplo@email.com" />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Perfil de Acesso</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})} className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all">
                  <option value="admin" className="bg-slate-900">Administrador</option>
                  <option value="colaborador" className="bg-slate-900">Colaborador</option>
                  <option value="motorista" className="bg-slate-900">Motorista</option>
                </select>
              </div>
            </div>
            <div className="p-6 bg-slate-900 border-t border-slate-800 flex gap-4">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-bold hover:bg-slate-700 transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={isSaving} className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 active:scale-95 transition-all">{isSaving ? 'Salvando...' : 'Criar Conta'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;
