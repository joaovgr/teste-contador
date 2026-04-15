import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const TIPO_LABELS: Record<string, string> = {
  rg_cpf: "RG / CPF",
  comprovante_residencia: "Comprovante de Residência",
  informe_rendimentos: "Informe de Rendimentos",
  deducoes: "Deduções (médico, educação)",
  bens_direitos: "Bens e Direitos",
  renda_variavel: "Renda Variável",
  cripto: "Criptoativos",
  exterior: "Rendimentos no Exterior",
  outros: "Outros Documentos",
  recibo_anterior: "Recibo Declaração Anterior",
};

const STATUS_COLORS: Record<string, string> = {
  pendente: "bg-yellow-100 text-yellow-800",
  recebido: "bg-green-100 text-green-800",
  dispensado: "bg-gray-100 text-gray-600",
};

export default function DocumentosPage() {
  const [clienteId, setClienteId] = useState<number | null>(null);
  const clientesQuery = trpc.clientes.listar.useQuery();
  const docsQuery = trpc.documentos.listarPorCliente.useQuery(
    { clienteId: clienteId! },
    { enabled: !!clienteId }
  );
  const atualizarMutation = trpc.documentos.atualizar.useMutation();
  const utils = trpc.useUtils();

  const handleStatusChange = async (clienteIdDoc: number, tipo: string, status: string) => {
    try {
      await atualizarMutation.mutateAsync({ clienteId: clienteIdDoc, tipo: tipo as any, status: status as any });
      utils.documentos.listarPorCliente.invalidate({ clienteId: clienteIdDoc });
      toast.success("Status do documento atualizado!");
    } catch (err: any) { toast.error(err?.message || "Erro ao atualizar."); }
  };

  const docs = docsQuery.data ?? [];
  const recebidos = docs.filter(d => d.status === "recebido").length;
  const total = docs.length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-[#0D1B3E]">Controle de Documentos</h1>
        <p className="text-sm text-gray-500 mt-1">Acompanhe o recebimento de documentos por cliente.</p>
      </div>

      {/* Seletor de cliente */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <label className="block text-xs font-semibold text-gray-600 mb-2">Selecione o Cliente</label>
        <select
          value={clienteId ?? ""}
          onChange={e => setClienteId(e.target.value ? Number(e.target.value) : null)}
          className="w-full max-w-md px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6EB5]"
        >
          <option value="">Selecione um cliente...</option>
          {(clientesQuery.data ?? []).map(c => (
            <option key={c.id} value={c.id}>{c.nome}{c.cpf ? ` — ${c.cpf}` : ""}</option>
          ))}
        </select>
      </div>

      {clienteId && (
        <>
          {/* Progresso */}
          {total > 0 && (
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[#0D1B3E]">Progresso de Documentos</span>
                <span className="text-sm font-bold text-[#2E6EB5]">{recebidos}/{total} recebidos</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-[#2E6EB5] to-[#0D1B3E] h-3 rounded-full transition-all duration-500"
                  style={{ width: `${total > 0 ? (recebidos / total) * 100 : 0}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {total > 0 ? Math.round((recebidos / total) * 100) : 0}% completo
                {recebidos === total && total > 0 && <span className="ml-2 text-green-600 font-semibold">✅ Documentação completa!</span>}
              </p>
            </div>
          )}

          {/* Lista de documentos */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-[#0D1B3E]">Checklist de Documentos</h3>
            </div>
            {docsQuery.isLoading ? (
              <div className="px-5 py-8 text-center text-gray-400">Carregando documentos...</div>
            ) : docs.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-400">
                <p className="text-2xl mb-2">📁</p>
                <p className="text-sm">Nenhum documento registrado para este cliente.</p>
                <p className="text-xs text-gray-400 mt-1">Os documentos são criados automaticamente ao cadastrar um cliente via triagem.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {docs.map(doc => (
                  <div key={doc.id} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        doc.status === "recebido" ? "bg-green-100" :
                        doc.status === "dispensado" ? "bg-gray-100" : "bg-yellow-100"
                      }`}>
                        {doc.status === "recebido" ? "✅" : doc.status === "dispensado" ? "➖" : "⏳"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#0D1B3E]">{TIPO_LABELS[doc.tipo] || doc.tipo}</p>
                        {doc.observacao && <p className="text-xs text-gray-500">{doc.observacao}</p>}
                        {doc.dataRecebimento && (
                          <p className="text-xs text-green-600">Recebido em {new Date(doc.dataRecebimento).toLocaleDateString("pt-BR")}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={doc.status}
                        onChange={e => handleStatusChange(clienteId, doc.tipo, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1.5 rounded border-0 cursor-pointer ${STATUS_COLORS[doc.status] || "bg-gray-100"}`}
                      >
                        <option value="pendente">⏳ Pendente</option>
                        <option value="recebido">✅ Recebido</option>
                        <option value="dispensado">➖ Dispensado</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {!clienteId && (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium">Selecione um cliente para ver o checklist de documentos</p>
        </div>
      )}
    </div>
  );
}
