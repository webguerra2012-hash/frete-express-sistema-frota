
export enum Urgency {
  LOW = 'Baixa',
  MEDIUM = 'Média',
  HIGH = 'Alta'
}

export enum OccurrenceStatus {
  OPEN = 'Aberta',
  CLOSED = 'Fechada'
}

export interface Vehicle {
  id: string;
  name: string;
  model: string;
  brand: string;
  plate: string;
  photo_url?: string;
}

export interface MaintenanceItem {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
}

export interface Maintenance {
  id: string;
  vehicle_id: string;
  repair_type: string;
  service_date: string;
  description: string;
  items: MaintenanceItem[];
  labor_cost: number;
  warranty: string;
  nf_url?: string;
  total_parts: number;
  total_service: number;
  total_cost: number;
}

export interface Occurrence {
  id: string;
  vehicle_id: string;
  description: string;
  urgency: Urgency;
  photo_url?: string;
  status: OccurrenceStatus;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'colaborador' | 'motorista';
}

export interface AppSettings {
  logo_url: string;
  company_name: string;
}
