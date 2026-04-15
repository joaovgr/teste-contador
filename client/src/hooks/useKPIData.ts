import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { KPIData, KPICategory } from '@/lib/kpiData';

export interface HistoricalKPIData {
  date: string;
  period: string;
  categories: KPICategory[];
}

export function useKPIData() {
  const [kpiHistory, setKpiHistory] = useState<HistoricalKPIData[]>([]);
  const [currentData, setCurrentData] = useState<KPICategory[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parse Excel file and extract KPI data
  const parseExcelFile = useCallback(async (file: File): Promise<HistoricalKPIData | null> => {
    try {
      setLoading(true);
      setError(null);

      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });

      // Extract data from BASE_CLIENTES sheet
      const baseSheet = workbook.Sheets['BASE_CLIENTES'];
      if (!baseSheet) {
        throw new Error('Aba BASE_CLIENTES não encontrada na planilha');
      }

      const baseData = XLSX.utils.sheet_to_json(baseSheet);

      // Extract data from MOTOR_CALCULO sheet for pricing info
      const motorSheet = workbook.Sheets['MOTOR_CALCULO'];
      const motorData = motorSheet ? XLSX.utils.sheet_to_json(motorSheet) : [];

      // Calculate KPIs from the data
      const calculatedKPIs = calculateKPIsFromExcel(baseData, motorData);

      const historicalData: HistoricalKPIData = {
        date: new Date().toISOString(),
        period: new Date().toLocaleDateString('pt-BR'),
        categories: calculatedKPIs,
      };

      setCurrentData(calculatedKPIs);
      setKpiHistory((prev) => [historicalData, ...prev]);

      return historicalData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao processar arquivo';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate KPIs from Excel data
  const calculateKPIsFromExcel = (
    baseData: any[],
    motorData: any[]
  ): KPICategory[] => {
    // Status indicators
    const feitos = baseData.filter((row) => row['Status (FEITO/À FAZER/PENDENTE/DESSISTIU)'] === 'FEITO').length;
    const aFazer = baseData.filter((row) => row['Status (FEITO/À FAZER/PENDENTE/DESSISTIU)'] === 'À FAZER').length;
    const pendentes = baseData.filter((row) => row['Status (FEITO/À FAZER/PENDENTE/DESSISTIU)'] === 'PENDENTE').length;
    const desistencias = baseData.filter((row) => row['Status (FEITO/À FAZER/PENDENTE/DESSISTIU)'] === 'DESSISTIU').length;
    const totalClientes = baseData.length;

    // Financial indicators
    const receitaTotal = baseData.reduce((sum, row) => sum + (parseFloat(row['Honorários']) || 0), 0);
    const pagos = baseData.filter((row) => row['Pagamento (PAGO/PENDENTE/NÃO COBRAR AGORA)'] === 'PAGO').length;
    const pendentesCobranca = baseData.filter((row) => row['Pagamento (PAGO/PENDENTE/NÃO COBRAR AGORA)'] === 'PENDENTE').length;
    const recebido = receitaTotal * (pagos / totalClientes || 0);
    const pendente = receitaTotal - recebido;
    const ticketMedio = totalClientes > 0 ? receitaTotal / totalClientes : 0;

    // Payment indicators
    const naoCobrAr = baseData.filter((row) => row['Pagamento (PAGO/PENDENTE/NÃO COBRAR AGORA)'] === 'NÃO COBRAR AGORA').length;
    const adimplencia = totalClientes > 0 ? (pagos / totalClientes) * 100 : 0;

    const categories: KPICategory[] = [
      {
        name: 'Status',
        description: 'Indicadores de status dos serviços IRPF',
        kpis: [
          {
            id: 'feitos',
            label: 'Feitos',
            value: feitos,
            target: 150,
            change: 12,
            trend: 'up',
            color: 'bg-green-500',
            icon: '✓',
            unit: 'declarações',
          },
          {
            id: 'a-fazer',
            label: 'À Fazer',
            value: aFazer,
            target: 10,
            change: -5,
            trend: 'down',
            color: 'bg-blue-500',
            icon: '→',
            unit: 'declarações',
          },
          {
            id: 'pendentes',
            label: 'Pendentes',
            value: pendentes,
            target: 5,
            change: 3,
            trend: 'up',
            color: 'bg-yellow-500',
            icon: '⏳',
            unit: 'declarações',
          },
          {
            id: 'desistencias',
            label: 'Desistências',
            value: desistencias,
            target: 0,
            change: 0,
            trend: 'neutral',
            color: 'bg-red-500',
            icon: '✗',
            unit: 'clientes',
          },
          {
            id: 'total-clientes',
            label: 'Total de Clientes',
            value: totalClientes,
            target: 165,
            change: 8,
            trend: 'up',
            color: 'bg-purple-500',
            icon: '👥',
            unit: 'clientes',
          },
        ],
      },
      {
        name: 'Financeiro',
        description: 'Indicadores financeiros e de receita',
        kpis: [
          {
            id: 'receita-total',
            label: 'Receita Total',
            value: `R$ ${receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            target: 50000,
            change: 15,
            trend: 'up',
            color: 'bg-emerald-500',
            icon: '💰',
            unit: 'BRL',
          },
          {
            id: 'recebido',
            label: 'Recebido',
            value: `R$ ${recebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            target: receitaTotal,
            change: 8,
            trend: 'up',
            color: 'bg-teal-500',
            icon: '✓',
            unit: 'BRL',
          },
          {
            id: 'pendente',
            label: 'Pendente',
            value: `R$ ${pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            target: 0,
            change: 22,
            trend: 'up',
            color: 'bg-orange-500',
            icon: '⏳',
            unit: 'BRL',
          },
          {
            id: 'comissoes',
            label: 'Comissões da Equipe',
            value: `R$ ${(receitaTotal * 0.25).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            target: 12000,
            change: 0,
            trend: 'neutral',
            color: 'bg-indigo-500',
            icon: '💼',
            unit: 'BRL',
          },
          {
            id: 'ticket-medio',
            label: 'Ticket Médio',
            value: `R$ ${ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            target: 320,
            change: -7,
            trend: 'down',
            color: 'bg-pink-500',
            icon: '📊',
            unit: 'BRL',
          },
        ],
      },
      {
        name: 'Pagamento',
        description: 'Indicadores de pagamento e adimplência',
        kpis: [
          {
            id: 'pagos',
            label: 'Pagos',
            value: pagos,
            target: 160,
            change: 5,
            trend: 'up',
            color: 'bg-green-600',
            icon: '✓',
            unit: 'clientes',
          },
          {
            id: 'pendentes-pag',
            label: 'Pendentes',
            value: pendentesCobranca,
            target: 10,
            change: 12,
            trend: 'up',
            color: 'bg-red-600',
            icon: '⏳',
            unit: 'clientes',
          },
          {
            id: 'nao-cobrar',
            label: 'Não Cobrar Agora',
            value: naoCobrAr,
            target: 0,
            change: 0,
            trend: 'neutral',
            color: 'bg-gray-500',
            icon: '—',
            unit: 'clientes',
          },
          {
            id: 'adimplencia',
            label: 'Taxa de Adimplência',
            value: `${adimplencia.toFixed(2)}%`,
            target: 95,
            change: -3,
            trend: 'down',
            color: 'bg-blue-600',
            icon: '📈',
            unit: '%',
          },
          {
            id: 'docs-pendentes',
            label: 'Documentos Pendentes',
            value: pendentes * 2,
            target: 5,
            change: 8,
            trend: 'up',
            color: 'bg-amber-600',
            icon: '📄',
            unit: 'documentos',
          },
        ],
      },
    ];

    return categories;
  };

  return {
    kpiHistory,
    currentData,
    loading,
    error,
    parseExcelFile,
    setCurrentData,
  };
}
