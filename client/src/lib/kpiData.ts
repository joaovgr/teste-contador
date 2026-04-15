// KPI Data Configuration for IRPF Dashboard
// 15 KPIs organized in 4 categories: Status, Financial, Payment, Productivity

export interface KPIData {
  id: string;
  label: string;
  value: number | string;
  target?: number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
  icon?: string;
  unit?: string;
}

export interface KPICategory {
  name: string;
  description: string;
  kpis: KPIData[];
}

// Mock data - in production, this would come from an API
export const kpiCategories: KPICategory[] = [
  {
    name: 'Status',
    description: 'Indicadores de status dos serviços IRPF',
    kpis: [
      {
        id: 'feitos',
        label: 'Feitos',
        value: 127,
        target: 150,
        change: 12,
        trend: 'up',
        color: 'bg-green-500',
        icon: '✓',
        unit: 'declarações'
      },
      {
        id: 'a-fazer',
        label: 'À Fazer',
        value: 23,
        target: 10,
        change: -5,
        trend: 'down',
        color: 'bg-blue-500',
        icon: '→',
        unit: 'declarações'
      },
      {
        id: 'pendentes',
        label: 'Pendentes',
        value: 8,
        target: 5,
        change: 3,
        trend: 'up',
        color: 'bg-yellow-500',
        icon: '⏳',
        unit: 'declarações'
      },
      {
        id: 'desistencias',
        label: 'Desistências',
        value: 2,
        target: 0,
        change: 0,
        trend: 'neutral',
        color: 'bg-red-500',
        icon: '✗',
        unit: 'clientes'
      },
      {
        id: 'total-clientes',
        label: 'Total de Clientes',
        value: 160,
        target: 165,
        change: 8,
        trend: 'up',
        color: 'bg-purple-500',
        icon: '👥',
        unit: 'clientes'
      }
    ]
  },
  {
    name: 'Financeiro',
    description: 'Indicadores financeiros e de receita',
    kpis: [
      {
        id: 'receita-total',
        label: 'Receita Total',
        value: 'R$ 47.850',
        target: 50000,
        change: 15,
        trend: 'up',
        color: 'bg-emerald-500',
        icon: '💰',
        unit: 'BRL'
      },
      {
        id: 'recebido',
        label: 'Recebido',
        value: 'R$ 38.920',
        target: 47850,
        change: 8,
        trend: 'up',
        color: 'bg-teal-500',
        icon: '✓',
        unit: 'BRL'
      },
      {
        id: 'pendente',
        label: 'Pendente',
        value: 'R$ 8.930',
        target: 0,
        change: 22,
        trend: 'up',
        color: 'bg-orange-500',
        icon: '⏳',
        unit: 'BRL'
      },
      {
        id: 'comissoes',
        label: 'Comissões da Equipe',
        value: 'R$ 12.000',
        target: 12000,
        change: 0,
        trend: 'neutral',
        color: 'bg-indigo-500',
        icon: '💼',
        unit: 'BRL'
      },
      {
        id: 'ticket-medio',
        label: 'Ticket Médio',
        value: 'R$ 299',
        target: 320,
        change: -7,
        trend: 'down',
        color: 'bg-pink-500',
        icon: '📊',
        unit: 'BRL'
      }
    ]
  },
  {
    name: 'Pagamento',
    description: 'Indicadores de pagamento e adimplência',
    kpis: [
      {
        id: 'pagos',
        label: 'Pagos',
        value: 130,
        target: 160,
        change: 5,
        trend: 'up',
        color: 'bg-green-600',
        icon: '✓',
        unit: 'clientes'
      },
      {
        id: 'pendentes-pag',
        label: 'Pendentes',
        value: 28,
        target: 10,
        change: 12,
        trend: 'up',
        color: 'bg-red-600',
        icon: '⏳',
        unit: 'clientes'
      },
      {
        id: 'nao-cobrar',
        label: 'Não Cobrar Agora',
        value: 2,
        target: 0,
        change: 0,
        trend: 'neutral',
        color: 'bg-gray-500',
        icon: '—',
        unit: 'clientes'
      },
      {
        id: 'adimplencia',
        label: 'Taxa de Adimplência',
        value: '81.25%',
        target: 95,
        change: -3,
        trend: 'down',
        color: 'bg-blue-600',
        icon: '📈',
        unit: '%'
      },
      {
        id: 'docs-pendentes',
        label: 'Documentos Pendentes',
        value: 34,
        target: 5,
        change: 8,
        trend: 'up',
        color: 'bg-amber-600',
        icon: '📄',
        unit: 'documentos'
      }
    ]
  },
  {
    name: 'Produtividade',
    description: 'Indicadores de produtividade da equipe',
    kpis: [
      {
        id: 'joel',
        label: 'Joel',
        value: 32,
        target: 40,
        change: -5,
        trend: 'down',
        color: 'bg-cyan-500',
        icon: '👤',
        unit: 'declarações'
      },
      {
        id: 'juliana',
        label: 'Juliana',
        value: 28,
        target: 40,
        change: 2,
        trend: 'up',
        color: 'bg-fuchsia-500',
        icon: '👤',
        unit: 'declarações'
      },
      {
        id: 'klevia',
        label: 'Klevia',
        value: 35,
        target: 40,
        change: 8,
        trend: 'up',
        color: 'bg-lime-500',
        icon: '👤',
        unit: 'declarações'
      },
      {
        id: 'jeane',
        label: 'Jeane',
        value: 30,
        target: 40,
        change: 0,
        trend: 'neutral',
        color: 'bg-rose-500',
        icon: '👤',
        unit: 'declarações'
      },
      {
        id: 'comparativo-yoy',
        label: 'Comparativo YoY',
        value: '+18.5%',
        target: 15,
        change: 18.5,
        trend: 'up',
        color: 'bg-violet-500',
        icon: '📊',
        unit: '%'
      }
    ]
  }
];

// Helper function to get all KPIs as a flat array
export function getAllKPIs(): KPIData[] {
  return kpiCategories.flatMap(cat => cat.kpis);
}

// Helper function to get KPI by ID
export function getKPIById(id: string): KPIData | undefined {
  return getAllKPIs().find(kpi => kpi.id === id);
}

// Helper function to get category by name
export function getCategoryByName(name: string): KPICategory | undefined {
  return kpiCategories.find(cat => cat.name === name);
}
