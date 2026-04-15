import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pendente: { label: "Pendente", color: "bg-yellow-100 text-yellow-800" },
  pago: { label: "Pago", color: "bg-green-100 text-green-800" },
  atrasado: { label: "Atrasado", color: "bg-orange-100 text-orange-800" },
  negociando: { label: "Negociando", color: "bg-blue-100 text-blue-800" },
  inadimplente: { label: "Inadimplente", color: "bg-red-100 text-red-800" },
};

const ACAO_LABELS: Record<string, string> = {
  nenhuma: "Nenhuma",
  "1a_cobranca": "1ª Cobrança",
  "2a_cobranca": "2ª Cobrança",
  "3a_cobranca": "3ª Cobrança",
  negociacao: "Negociação",
  juridico: "Jurídico",
};

export default function CobrancasPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ clienteId: 0, valor: "", dataVencimento: "", observacao: "" });

  const cobrancasQuery = trpc.cobrancas.listar.useQuery();
  const clientesQuery = trpc.clientes.listar.useQuery();
  const criarMutation = trpc.cobrancas.criar.useMutation();
  const atualizarMutation = trpc.cobrancas.atualizar.useMutation();
  const utils = trpc.useUtils();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clienteId) { toast.error("Selecione um cliente."); return; }
    try {
      await criarMutation.mutateAsync({
        clienteId: form.clienteId,
        valor: form.valor,
        dataVencimento: form.dataVencimento || undefined,
        observacao: form.observacao,
      });
      toast.success("Cobrança registrada!");
      utils.cobrancas.listar.invalidate();
      setShowForm(false);
      setForm({ clienteId: 0, valor: "", dataVencimento: "", observacao: "" });
    } catch (err: any) { toast.error(err?.message || "Erro ao registrar cobrança."); }
  };

  const handleUpdate = async (id: number, data: any) => {
    await atualizarMutation.mutateAsync({ id, ...data });
    utils.cobrancas.listar.invalidate();
    toast.success("Cobrança atualizada!");
  };

  const getDiasAtraso = (dataVencimento: string | Date | null, status: string) => {
    if (!dataVencimento || status === "pago") return null;
    const hoje = new Date();
    const venc = new Date(dataVencimento);
    const diff = Math.floor((hoje.getTime() - venc.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : null;
  };

  const cobrancas = cobrancasQuery.data ?? [];
  const totalEmAberto = cobrancas.filter(c => c.status !== "pago").reduce((sum, c) => sum + Number(c.valor), 0);
  const totalPago = cobrancas.filter(c => c.status === "pago").reduce((sum, c) => sum + Number(c.valor), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1B3E]">Controle de Cobranças</h1>
          <p className="text-sm text-gray-500">{cobrancas.length} cobrança(s) registrada(s)</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-[#2E6EB5] text-white rounded-lg font-semibold hover:bg-[#1B5FA0] transition-colors shadow-sm">
          + Nova Cobrança
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 font-medium">Total em Aberto</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">
            R$ {totalEmAberto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 font-medium">Total Recebido</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            R$ {totalPago.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 font-medium">Inadimplentes</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {cobrancas.filter(c => c.status === "inadimplente").length}
          </p>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-[#0D1B3E] to-[#2E6EB5] px-6 py-4 rounded-t-2xl">
              <h2 className="text-white font-bold text-lg">Nova Cobrança</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Cliente *</label>
                <select required value={form.clienteId}
                  onChange={e => setForm(p => ({ ...p, clienteId: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6EB5]">
                  <option value={0}>Selecione...</option>
                  {(clientesQuery.data ?? []).map(c => (
                    <option key={c.id} value={c.id}>{c.nome}{c.cpf ? ` — ${c.cpf}` : ""}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Valor (R$) *</label>
                  <input required type="number" step="0.01" value={form.valor}
                    onChange={e => setForm(p => ({ ...p, valor: e.target.value }))}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6EB5]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Vencimento</label>
                  <input type="date" value={form.dataVencimento}
                    onChange={e => setForm(p => ({ ...p, dataVencimento: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6EB5]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Observação</label>
                <input value={form.observacao}
                  onChange={e => setForm(p => ({ ...p, observacao: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6EB5]" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="flex-1 py-2.5 bg-[#2E6EB5] text-white rounded-lg font-semibold hover:bg-[#1B5FA0] transition-colors">
                  Registrar
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#0D1B3E] text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Cliente</th>
                <th className="px-4 py-3 text-left font-semibold">Valor</th>
                <th className="px-4 py-3 text-left font-semibold">Vencimento</th>
                <th className="px-4 py-3 text-left font-semibold">Atraso</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cobrancasQuery.isLoading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Carregando...</td></tr>
              ) : cobrancas.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Nenhuma cobrança registrada.</td></tr>
              ) : cobrancas.map(c => {
                const cliente = (clientesQuery.data ?? []).find(cl => cl.id === c.clienteId);
                const diasAtraso = getDiasAtraso(c.dataVencimento, c.status);
                return (
                  <tr key={c.id} className={`hover:bg-gray-50 transition-colors ${diasAtraso && diasAtraso > 30 ? "bg-red-50" : diasAtraso ? "bg-orange-50" : ""}`}>
                    <td className="px-4 py-3 font-medium text-[#0D1B3E]">{cliente?.nome || `Cliente #${c.clienteId}`}</td>
                    <td className="px-4 py-3 font-semibold text-[#0D1B3E]">
                      R$ {Number(c.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {c.dataVencimento ? new Date(c.dataVencimento).toLocaleDateString("pt-BR") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {diasAtraso ? (
                        <span className={`text-xs font-bold ${diasAtraso > 30 ? "text-red-600" : "text-orange-600"}`}>
                          {diasAtraso} dias
                        </span>
                      ) : <span className="text-gray-400 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <select value={c.status}
                        onChange={e => handleUpdate(c.id, { status: e.target.value })}
                        className={`text-xs font-semibold px-2 py-1 rounded border-0 cursor-pointer ${STATUS_LABELS[c.status]?.color || "bg-gray-100"}`}>
                        {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select value={c.acaoCobranca ?? "nenhuma"}
                        onChange={e => handleUpdate(c.id, { acaoCobranca: e.target.value })}
                        className="text-xs px-2 py-1 border border-gray-200 rounded cursor-pointer bg-white">
                        {Object.entries(ACAO_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
