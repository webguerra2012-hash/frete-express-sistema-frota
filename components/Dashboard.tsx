
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell
} from 'recharts';
import { Vehicle, Maintenance, Occurrence, OccurrenceStatus } from '../types';
import { ICONS, COLORS } from '../constants';

interface DashboardProps {
  vehicles: Vehicle[];
  maintenances: Maintenance[];
  occurrences: Occurrence[];
}

const Dashboard: React.FC<DashboardProps> = ({ vehicles, maintenances, occurrences }) => {
  const stats = useMemo(() => {
    const totalCost = maintenances.reduce((acc, m) => acc + m.total_cost, 0);
    const openOccurrences = occurrences.filter(o => o.status === OccurrenceStatus.OPEN).length;
    return {
      totalVehicles: vehicles.length,
      totalMaintenance: maintenances.length,
      totalInvestment: totalCost,
      pendingAlerts: openOccurrences
    };
  }, [vehicles, maintenances, occurrences]);

  const costPerVehicleData = useMemo(() => {
    return vehicles.map(v => {
      const vehicleMaintenances = maintenances.filter(m => m.vehicle_id === v.id);
      const total = vehicleMaintenances.reduce((acc, m) => acc + m.total_cost, 0);
      return {
        name: v.plate,
        fullName: v.name,
        cost: total
      };
    }).sort((a, b) => b.cost - a.cost);
  }, [vehicles, maintenances]);

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Indicadores Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Frota Ativa', value: stats.totalVehicles, icon: <ICONS.Truck />, color: 'blue' },
          { label: 'Serviços Realizados', value: stats.totalMaintenance, icon: <ICONS.Wrench />, color: 'emerald' },
          { label: 'Investimento Frota', value: stats.totalInvestment.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }), icon: <span className="font-bold">R$</span>, color: 'indigo' },
          { label: 'Alertas Pendentes', value: stats.pendingAlerts, icon: <ICONS.Alert />, color: 'rose' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group hover:shadow-md transition-all">
            <div className={`w-12 h-12 bg-${s.color}-50 text-${s.color}-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              {s.icon}
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Gráfico de Custos por Veículo */}
      <div className="bg-white p-6 lg:p-10 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Custo Acumulado por Veículo</h3>
            <p className="text-sm text-gray-400 font-medium">Análise de gastos de manutenção por unidade</p>
          </div>
        </div>
        
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={costPerVehicleData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 12, fontWeight: 600, fill: '#64748b'}} 
                width={80}
              />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px'}}
                formatter={(value: any) => [value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 'Custo Total']}
              />
              <Bar dataKey="cost" radius={[0, 8, 8, 0]} barSize={32}>
                {costPerVehicleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS.primary} opacity={1 - (index * 0.1)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
