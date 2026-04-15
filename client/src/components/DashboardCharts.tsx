import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Status distribution data
const statusData = [
  { name: 'Feitos', value: 127, fill: '#10b981' },
  { name: 'À Fazer', value: 23, fill: '#3b82f6' },
  { name: 'Pendentes', value: 8, fill: '#eab308' },
  { name: 'Desistências', value: 2, fill: '#ef4444' },
];

// Financial data
const financialData = [
  { month: 'Jan', receita: 35000, recebido: 28000 },
  { month: 'Fev', receita: 42000, recebido: 35000 },
  { month: 'Mar', receita: 38000, recebido: 32000 },
  { month: 'Abr', receita: 47850, recebido: 38920 },
];

// Payment status data
const paymentData = [
  { name: 'Pagos', value: 130, fill: '#059669' },
  { name: 'Pendentes', value: 28, fill: '#dc2626' },
  { name: 'Não Cobrar', value: 2, fill: '#9ca3af' },
];

// Team productivity data
const productivityData = [
  { name: 'Joel', declaracoes: 32, meta: 40 },
  { name: 'Juliana', declaracoes: 28, meta: 40 },
  { name: 'Klevia', declaracoes: 35, meta: 40 },
  { name: 'Jeane', declaracoes: 30, meta: 40 },
];

export function StatusChart() {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Status das Declarações</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={statusData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {statusData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value} declarações`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FinancialChart() {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolução Financeira</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={financialData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="receita"
            stroke="#2e6eb5"
            strokeWidth={2}
            dot={{ fill: '#2e6eb5', r: 4 }}
            name="Receita Total"
          />
          <Line
            type="monotone"
            dataKey="recebido"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: '#10b981', r: 4 }}
            name="Recebido"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PaymentChart() {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Status de Pagamento</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={paymentData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {paymentData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value} clientes`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ProductivityChart() {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Produtividade da Equipe</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={productivityData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            formatter={(value) => `${value} declarações`}
          />
          <Legend />
          <Bar dataKey="declaracoes" fill="#3b82f6" name="Declarações Feitas" radius={[8, 8, 0, 0]} />
          <Bar dataKey="meta" fill="#e5e7eb" name="Meta" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
