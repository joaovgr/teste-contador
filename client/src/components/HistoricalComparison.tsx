import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChevronDown } from 'lucide-react';

interface HistoricalData {
  period: string;
  feitos: number;
  aFazer: number;
  pendentes: number;
  receitaTotal: number;
  adimplencia: number;
}

interface HistoricalComparisonProps {
  data: HistoricalData[];
}

export function HistoricalComparison({ data }: HistoricalComparisonProps) {
  const [expandedMetric, setExpandedMetric] = useState<string | null>('feitos');

  const metrics = [
    {
      id: 'feitos',
      label: 'Declarações Feitas',
      dataKey: 'feitos',
      color: '#10b981',
      unit: 'declarações',
    },
    {
      id: 'aFazer',
      label: 'À Fazer',
      dataKey: 'aFazer',
      color: '#3b82f6',
      unit: 'declarações',
    },
    {
      id: 'pendentes',
      label: 'Pendentes',
      dataKey: 'pendentes',
      color: '#eab308',
      unit: 'declarações',
    },
    {
      id: 'receitaTotal',
      label: 'Receita Total',
      dataKey: 'receitaTotal',
      color: '#059669',
      unit: 'R$',
    },
    {
      id: 'adimplencia',
      label: 'Taxa de Adimplência',
      dataKey: 'adimplencia',
      color: '#2e6eb5',
      unit: '%',
    },
  ];

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <p className="text-center text-gray-600">
          Nenhum dado histórico disponível. Carregue um arquivo Excel para visualizar comparativos.
        </p>
      </div>
    );
  }

  const calculateVariation = (current: number, previous: number): string => {
    if (previous === 0) return '—';
    const variation = ((current - previous) / previous) * 100;
    return `${variation.toFixed(1).replace('.', ',')}%`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-[#1B2A4A]">Comparação Histórica</h3>
        <p className="text-sm text-gray-600 mt-1">Evolução dos KPIs ao longo do tempo</p>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {metrics.map((metric) => {
            const currentValue = Number(data[data.length - 1]?.[metric.dataKey as keyof HistoricalData] || 0);
            const previousValue = Number(data[data.length - 2]?.[metric.dataKey as keyof HistoricalData] || 0);
            const isPositive = currentValue >= previousValue;

            return (
              <div key={metric.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() =>
                    setExpandedMetric(expandedMetric === metric.id ? null : metric.id)
                  }
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: metric.color }}
                    />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{metric.label}</p>
                      <p className="text-xs text-gray-600">{metric.unit}</p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-600 transition-transform ${
                      expandedMetric === metric.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {expandedMetric === metric.id && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="period" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                          }}
                          formatter={(value) => {
                            if (metric.unit === 'R$') {
                              return `R$ ${Number(value).toLocaleString('pt-BR')}`;
                            }
                            if (metric.unit === '%') {
                              return `${value}%`;
                            }
                            return value;
                          }}
                        />
                        <Bar
                          dataKey={metric.dataKey}
                          fill={metric.color}
                          radius={[8, 8, 0, 0]}
                          name={metric.label}
                        />
                      </BarChart>
                    </ResponsiveContainer>

                    {/* Stats */}
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">Atual</p>
                        <p className="text-lg font-bold text-gray-900">{currentValue}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">Anterior</p>
                        <p className="text-lg font-bold text-gray-900">{previousValue || '—'}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">Variação</p>
                        <p className={`text-lg font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {calculateVariation(currentValue, previousValue)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
