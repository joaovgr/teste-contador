import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Download, Upload } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PeriodSelectorProps {
  onPeriodChange: (startDate: Date, endDate: Date) => void;
  onFileUpload: (file: File) => void;
  onExportImage: () => void;
  onExportPDF: () => void;
  loading?: boolean;
}

export function PeriodSelector({
  onPeriodChange,
  onFileUpload,
  onExportImage,
  onExportPDF,
  loading = false,
}: PeriodSelectorProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'current' | 'previous' | 'custom'>('current');
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));

  const handlePeriodChange = (period: 'current' | 'previous' | 'custom') => {
    setSelectedPeriod(period);

    if (period === 'current') {
      const start = startOfMonth(new Date());
      const end = endOfMonth(new Date());
      setStartDate(start);
      setEndDate(end);
      onPeriodChange(start, end);
    } else if (period === 'previous') {
      const previousMonth = subMonths(new Date(), 1);
      const start = startOfMonth(previousMonth);
      const end = endOfMonth(previousMonth);
      setStartDate(start);
      setEndDate(end);
      onPeriodChange(start, end);
    }
  };

  const handleCustomDateChange = (type: 'start' | 'end', value: string) => {
    const date = new Date(value);
    if (type === 'start') {
      setStartDate(date);
      onPeriodChange(date, endDate);
    } else {
      setEndDate(date);
      onPeriodChange(startDate, date);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
    // Reset input
    event.target.value = '';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Period Selection */}
        <div className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#2E6EB5]" />
            Período de Análise
          </h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() => handlePeriodChange('current')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === 'current'
                    ? 'bg-[#2E6EB5] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Mês Atual
              </button>
              <button
                onClick={() => handlePeriodChange('previous')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === 'previous'
                    ? 'bg-[#2E6EB5] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Mês Anterior
              </button>
              <button
                onClick={() => setSelectedPeriod('custom')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === 'custom'
                    ? 'bg-[#2E6EB5] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Customizado
              </button>
            </div>

            {selectedPeriod === 'custom' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Data Inicial</label>
                  <input
                    type="date"
                    value={format(startDate, 'yyyy-MM-dd')}
                    onChange={(e) => handleCustomDateChange('start', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6EB5]"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Data Final</label>
                  <input
                    type="date"
                    value={format(endDate, 'yyyy-MM-dd')}
                    onChange={(e) => handleCustomDateChange('end', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6EB5]"
                  />
                </div>
              </div>
            )}

            <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
              Período: {format(startDate, 'dd/MM/yyyy', { locale: ptBR })} a{' '}
              {format(endDate, 'dd/MM/yyyy', { locale: ptBR })}
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#2E6EB5]" />
            Carregar Dados
          </h3>
          <label className="block">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              disabled={loading}
              className="hidden"
            />
            <div className="px-3 py-2 bg-blue-50 border-2 border-dashed border-[#2E6EB5] rounded-lg text-center cursor-pointer hover:bg-blue-100 transition-colors disabled:opacity-50">
              <p className="text-xs font-medium text-[#2E6EB5]">
                {loading ? 'Carregando...' : 'Clique para carregar Excel'}
              </p>
              <p className="text-xs text-gray-600 mt-1">(.xlsx, .xls)</p>
            </div>
          </label>
        </div>

        {/* Export Options */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Download className="w-4 h-4 text-[#2E6EB5]" />
            Exportar
          </h3>
          <div className="space-y-2">
            <button
              onClick={onExportImage}
              disabled={loading}
              className="w-full px-3 py-2 bg-gradient-to-r from-[#1B2A4A] to-[#2E6EB5] text-white rounded-lg text-xs font-medium hover:shadow-md transition-shadow disabled:opacity-50"
            >
              Exportar PNG
            </button>
            <button
              onClick={onExportPDF}
              disabled={loading}
              className="w-full px-3 py-2 bg-gradient-to-r from-[#2E6EB5] to-[#1B2A4A] text-white rounded-lg text-xs font-medium hover:shadow-md transition-shadow disabled:opacity-50"
            >
              Exportar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
