import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  rascunho: { label: "Rascunho", color: "bg-gray-100 text-gray-700" },
  enviada: { label: "Enviada", color: "bg-blue-100 text-blue-700" },
  aceita: { label: "Aceita", color: "bg-green-100 text-green-700" },
  recusada: { label: "Recusada", color: "bg-red-100 text-red-700" },
  expirada: { label: "Expirada", color: "bg-orange-100 text-orange-700" },
};

export default function PropostasPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    clienteId: 0,
    valorTotal: "",
    descricaoServicos: "",
    condicoesComerciais: "Pagamento à vista ou parcelado em até 2x sem juros.",
    observacoes: "",
  });

  const propostasQuery = trpc.propostas.listar.useQuery();
  const clientesQuery = trpc.clientes.listar.useQuery();
  const criarMutation = trpc.propostas.criar.useMutation();
  const atualizarMutation = trpc.propostas.atualizar.useMutation();
  const utils = trpc.useUtils();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clienteId) { toast.error("Selecione um cliente."); return; }
    try {
      await criarMutation.mutateAsync({
        clienteId: form.clienteId,
        valorTotal: form.valorTotal,
        descricaoServicos: form.descricaoServicos,
        condicoesComerciais: form.condicoesComerciais,
        observacoes: form.observacoes,
      });
      toast.success("Proposta criada!");
      utils.propostas.listar.invalidate();
      setShowForm(false);
      setForm({ clienteId: 0, valorTotal: "", descricaoServicos: "", condicoesComerciais: "Pagamento à vista ou parcelado em até 2x sem juros.", observacoes: "" });
    } catch (err: any) { toast.error(err?.message || "Erro ao criar proposta."); }
  };

  const handleStatusChange = async (id: number, status: string) => {
    await atualizarMutation.mutateAsync({ id, status: status as any });
    utils.propostas.listar.invalidate();
    toast.success("Status atualizado!");
  };

  const handleImprimir = (p: any) => {
    const cliente = (clientesQuery.data ?? []).find(c => c.id === p.clienteId);
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Proposta Comercial — ${cliente?.nome || "Cliente"}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #1a1a1a; }
        .header { text-align: center; border-bottom: 3px solid #2E6EB5; padding-bottom: 20px; margin-bottom: 30px; }
        .logo-text { font-size: 28px; font-weight: bold; color: #0D1B3E; }
        .subtitle { color: #2E6EB5; font-size: 14px; margin-top: 4px; }
        h2 { color: #0D1B3E; }
        .valor { font-size: 32px; font-weight: bold; color: #2E6EB5; text-align: center; padding: 20px; background: #f0f7ff; border-radius: 8px; margin: 20px 0; }
        .section { margin: 16px 0; line-height: 1.6; }
        .label { font-weight: bold; color: #444; }
        .footer { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px; font-size: 12px; color: #888; text-align: center; }
        .print-btn { margin-top: 20px; padding: 10px 20px; background: #2E6EB5; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; }
        @media print { .print-btn { display: none; } }
      </style></head><body>
      <div class="header">
        <div class="logo-text">CONTADOR SOS</div>
        <div class="subtitle">Soluções Contábeis | IRPF 2026</div>
      </div>
      <h2>Proposta Comercial — Declaração IRPF 2026</h2>
      <div class="section"><span class="label">Proposta Nº:</span> ${p.numero}</div>
      <div class="section"><span class="label">Cliente:</span> ${cliente?.nome || "—"}</div>
      <div class="section"><span class="label">CPF:</span> ${cliente?.cpf || "—"}</div>
      ${p.descricaoServicos ? `<div class="section"><span class="label">Descrição dos Serviços:</span><br>${p.descricaoServicos}</div>` : ""}
      <div class="valor">Honorários: R$ ${Number(p.valorTotal || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
      ${p.condicoesComerciais ? `<div class="section"><span class="label">Condições Comerciais:</span> ${p.condicoesComerciais}</div>` : ""}
      ${p.observacoes ? `<div class="section"><span class="label">Observações:</span> ${p.observacoes}</div>` : ""}
      <div class="section"><span class="label">Validade:</span> 15 dias a partir de ${new Date(p.criadoEm).toLocaleDateString("pt-BR")}</div>
      <div class="footer">
        Contador SOS Soluções Contábeis — Proposta gerada em ${new Date().toLocaleDateString("pt-BR")}
      </div>
      <br><button class="print-btn" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>
      </body></html>
    `);
    win.document.close();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1B3E]">Propostas Comerciais</h1>
          <p className="text-sm text-gray-500">{propostasQuery.data?.length ?? 0} proposta(s)</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-[#2E6EB5] text-white rounded-lg font-semibold hover:bg-[#1B5FA0] transition-colors shadow-sm">
          + Nova Proposta
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#0D1B3E] to-[#2E6EB5] px-6 py-4 rounded-t-2xl">
              <h2 className="text-white font-bold text-lg">Nova Proposta Comercial</h2>
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
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Valor Total (R$) *</label>
                <input required type="number" step="0.01" value={form.valorTotal}
                  onChange={e => setForm(p => ({ ...p, valorTotal: e.target.value }))}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6EB5]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Descrição dos Serviços</label>
                <textarea value={form.descricaoServicos}
                  onChange={e => setForm(p => ({ ...p, descricaoServicos: e.target.value }))}
                  rows={3} placeholder="Descreva os serviços incluídos..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6EB5]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Condições Comerciais</label>
                <input value={form.condicoesComerciais}
                  onChange={e => setForm(p => ({ ...p, condicoesComerciais: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6EB5]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Observações</label>
                <textarea value={form.observacoes}
                  onChange={e => setForm(p => ({ ...p, observacoes: e.target.value }))} rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6EB5]" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="flex-1 py-2.5 bg-[#2E6EB5] text-white rounded-lg font-semibold hover:bg-[#1B5FA0] transition-colors">
                  Criar Proposta
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
                <th className="px-4 py-3 text-left font-semibold">Nº</th>
                <th className="px-4 py-3 text-left font-semibold">Cliente</th>
                <th className="px-4 py-3 text-left font-semibold">Valor</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Data</th>
                <th className="px-4 py-3 text-left font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {propostasQuery.isLoading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Carregando...</td></tr>
              ) : (propostasQuery.data ?? []).length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Nenhuma proposta criada ainda.</td></tr>
              ) : (propostasQuery.data ?? []).map(p => {
                const cliente = (clientesQuery.data ?? []).find(c => c.id === p.clienteId);
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.numero}</td>
                    <td className="px-4 py-3 font-medium text-[#0D1B3E]">{cliente?.nome || `Cliente #${p.clienteId}`}</td>
                    <td className="px-4 py-3 font-semibold text-green-700">
                      {p.valorTotal ? `R$ ${Number(p.valorTotal).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <select value={p.status} onChange={e => handleStatusChange(p.id, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1 rounded border-0 cursor-pointer ${STATUS_LABELS[p.status]?.color || "bg-gray-100"}`}>
                        {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{new Date(p.criadoEm).toLocaleDateString("pt-BR")}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleImprimir(p)}
                        className="text-[#2E6EB5] hover:text-[#0D1B3E] text-xs font-medium">
                        🖨️ Imprimir
                      </button>
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
