import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  a_fazer: { label: "A Fazer", color: "bg-yellow-100 text-yellow-800" },
  em_andamento: { label: "Em Andamento", color: "bg-blue-100 text-blue-800" },
  feito: { label: "Feito", color: "bg-green-100 text-green-800" },
  pendente: { label: "Pendente", color: "bg-orange-100 text-orange-800" },
  desistiu: { label: "Desistiu", color: "bg-red-100 text-red-800" },
};
const PAG_LABELS: Record<string, { label: string; color: string }> = {
  pendente: { label: "Pendente", color: "bg-yellow-100 text-yellow-800" },
  pago: { label: "Pago", color: "bg-green-100 text-green-800" },
  parcial: { label: "Parcial", color: "bg-orange-100 text-orange-800" },
  inadimplente: { label: "Inadimplente", color: "bg-red-100 text-red-800" },
};

export default function ClientesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [form, setForm] = useState({ nome: "", cpf: "", email: "", telefone: "", senhaGovBr: "", responsavel: "", anoBase: 2025, observacoes: "" });

  const clientesQuery = trpc.clientes.listar.useQuery(filterStatus ? { status: filterStatus } : undefined);
  const criarMutation = trpc.clientes.criar.useMutation();
  const atualizarMutation = trpc.clientes.atualizar.useMutation();
  const excluirMutation = trpc.clientes.excluir.useMutation();
  const utils = trpc.useUtils();

  const clientes = (clientesQuery.data ?? []).filter(c =>
    !search || c.nome.toLowerCase().includes(search.toLowerCase()) ||
    (c.cpf ?? "").includes(search) || (c.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await atualizarMutation.mutateAsync({ id: editId, ...form });
        toast.success("Cliente atualizado!");
      } else {
        await criarMutation.mutateAsync(form);
        toast.success("Cliente cadastrado!");
      }
      utils.clientes.listar.invalidate();
      setShowForm(false); setEditId(null);
      setForm({ nome: "", cpf: "", email: "", telefone: "", senhaGovBr: "", responsavel: "", anoBase: 2025, observacoes: "" });
    } catch (err: any) { toast.error(err?.message || "Erro ao salvar."); }
  };

  const handleEdit = (c: any) => {
    setEditId(c.id);
    setForm({ nome: c.nome, cpf: c.cpf ?? "", email: c.email ?? "", telefone: c.telefone ?? "",
      senhaGovBr: c.senhaGovBr ?? "", responsavel: c.responsavel ?? "", anoBase: c.anoBase ?? 2025, observacoes: c.observacoes ?? "" });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir este cliente?")) return;
    await excluirMutation.mutateAsync({ id });
    utils.clientes.listar.invalidate();
    toast.success("Cliente excluído.");
  };

  const handleStatusChange = async (id: number, status: string) => {
    await atualizarMutation.mutateAsync({ id, status: status as any });
    utils.clientes.listar.invalidate();
  };

  const handlePagamentoChange = async (id: number, statusPagamento: string) => {
    await atualizarMutation.mutateAsync({ id, statusPagamento: statusPagamento as any });
    utils.clientes.listar.invalidate();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1B3E]">Clientes IRPF 2026</h1>
          <p className="text-sm text-gray-500">{clientes.length} cliente(s) encontrado(s)</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); }}
          className="px-4 py-2 bg-[#2E6EB5] text-white rounded-lg font-semibold hover:bg-[#1B5FA0] transition-colors shadow-sm">
          + Novo Cliente
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Buscar por nome, CPF ou e-mail..."
          className="flex-1 min-w-48 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6EB5]" />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6EB5]">
          <option value="">Todos os status</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#0D1B3E] to-[#2E6EB5] px-6 py-4 rounded-t-2xl">
              <h2 className="text-white font-bold text-lg">{editId ? "Editar Cliente" : "Novo Cliente"}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Nome Completo *</label>
                  <input required value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6EB5]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">CPF</label>
                  <input value={form.cpf} onChange={e => setForm(p => ({ ...p, cpf: e.target.value }))}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6EB5]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Telefone</label>
                  <input value={form.telefone} onChange={e => setForm(p => ({ ...p, telefone: e.target.value }))}
                    placeholder="(00) 00000-0000"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6EB5]" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">E-mail</label>
                  <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6EB5]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Senha Gov.br</label>
                  <input value={form.senhaGovBr} onChange={e => setForm(p => ({ ...p, senhaGovBr: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6EB5]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Responsável</label>
                  <input value={form.responsavel} onChange={e => setForm(p => ({ ...p, responsavel: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6EB5]" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Observações</label>
                  <textarea value={form.observacoes} onChange={e => setForm(p => ({ ...p, observacoes: e.target.value }))} rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6EB5]" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-[#2E6EB5] text-white rounded-lg font-semibold hover:bg-[#1B5FA0] transition-colors">
                  {editId ? "Salvar Alterações" : "Cadastrar Cliente"}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#0D1B3E] text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Nome</th>
                <th className="px-4 py-3 text-left font-semibold">CPF</th>
                <th className="px-4 py-3 text-left font-semibold">Faixa</th>
                <th className="px-4 py-3 text-left font-semibold">Honorários</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Pagamento</th>
                <th className="px-4 py-3 text-left font-semibold">Responsável</th>
                <th className="px-4 py-3 text-left font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clientesQuery.isLoading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Carregando...</td></tr>
              ) : clientes.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Nenhum cliente encontrado.</td></tr>
              ) : clientes.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-[#0D1B3E]">
                    {c.nome}
                    {c.orcamentoManual && <span className="ml-2 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">⚠️ Manual</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{c.cpf || "—"}</td>
                  <td className="px-4 py-3">
                    {c.faixa ? <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 capitalize">{c.faixa}</span> : "—"}
                  </td>
                  <td className="px-4 py-3 font-semibold text-green-700">
                    {c.honorarios ? `R$ ${Number(c.honorarios).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <select value={c.status} onChange={e => handleStatusChange(c.id, e.target.value)}
                      className={`text-xs font-semibold px-2 py-1 rounded border-0 cursor-pointer ${STATUS_LABELS[c.status]?.color || "bg-gray-100"}`}>
                      {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select value={c.statusPagamento} onChange={e => handlePagamentoChange(c.id, e.target.value)}
                      className={`text-xs font-semibold px-2 py-1 rounded border-0 cursor-pointer ${PAG_LABELS[c.statusPagamento]?.color || "bg-gray-100"}`}>
                      {Object.entries(PAG_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{c.responsavel || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(c)} className="text-[#2E6EB5] hover:text-[#0D1B3E] text-xs font-medium">✏️ Editar</button>
                      <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
