
import React, { useState } from 'react';
import { ICONS } from '../constants';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  logoUrl: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, logoUrl }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de autenticação para o protótipo
    if (email === 'admin' && password === 'admin') {
      onLogin({
        id: 'admin-id',
        name: 'Administrador Master',
        email: 'admin@freteexpress.com',
        role: 'admin'
      });
    } else if (email === 'motorista' && password === '123') {
      onLogin({
        id: 'driver-id',
        name: 'Motorista Teste',
        email: 'motorista@freteexpress.com',
        role: 'motorista'
      });
    } else {
      setError('Credenciais inválidas. Use admin/admin');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-red-600 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md p-8 z-10 animate-fadeIn">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-white p-3 rounded-2xl shadow-inner mb-4 animate-bounce-slow">
              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-white">Frete Express Rio</h1>
            <p className="text-slate-400 text-sm">Gestão Inteligente de Frota</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-xs font-bold rounded-xl text-center">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Usuário</label>
              <input 
                type="text" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="admin"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Senha</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="••••••"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/40 transition-all active:scale-95"
            >
              Entrar no Sistema
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-[10px] uppercase tracking-tighter">
              Acesso restrito a colaboradores autorizados
            </p>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default Login;
