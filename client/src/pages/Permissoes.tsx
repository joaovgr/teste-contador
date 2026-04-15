import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type Perfil = "contador" | "assistente";

const MODULOS: { id: string; label: string; icon: string; desc: string }[] = [
  { id: "clientes",     label: "Clientes",              icon: "👥", desc: "Cadastro, edição e exclusão de clientes" },
  { id: "triagem",      label: "Triagem / Precificação", icon: "🧮", desc: "Cálculo de honorários e triagem de perfil" },
  { id: "propostas",    label: "Propostas Comerciais",  icon: "📄", desc: "Criação e gestão de propostas" },
  { id: "documentos",   label: "Controle de Docs",      icon: "📁", desc: "Recebimento e controle de documentos" },
  { id: "cobrancas",    label: "Cobranças",             icon: "💰", desc: "Gestão de cobranças e inadimplência" },
  { id: "portal_admin", label: "Portal do Cliente",     icon: "🌐", desc: "Geração de tokens e mensagens do portal" },
];

const PERFIL_INFO: Record<Perfil, { label: string; color: string; desc: string }> = {
  contador: {
    label: "Contador",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    desc: "Profissional responsável pela elaboração das declarações",
  },
  assistente: {
    label: "Assistente",
    color: "bg-gray-100 text-gray-700 border-gray-200",
    desc: "Apoio administrativo e operacional do escritório",
  },
};

export default function PermissoesPage() {
  const [perfil, setPerfil] = useState<Perfil>("contador");
  const permissoesQuery = trpc.permissoes.listar.useQuery();
  const seedMutation = trpc.parametros.seed.useMutation();
  const atualizarMutation = trpc.permissoes.atualizar.useMutation();
  const utils = trpc.useUtils();

  const permissoes = permissoesQuery.data ?? [];

  // Mapa: perfil → modulo → permitido
  const permMap: Record<string, Record<string, boolean>> = {};
  for (const p of permissoes) {
    if (!permMap[p.perfil]) permMap[p.perfil] = {};
    permMap[p.perfil][p.modulo] = p.permitido;
  }

  const getPermitido = (p: Perfil, modulo: string): boolean => {
    if (permMap[p] === undefined) return true; // padrão: permitido se não configurado
    if (permMap[p][modulo] === undefined) return true;
    return permMap[p][modulo];
  };

  const handleToggle = async (modulo: string, atual: boolean) => {
    try {
      await atualizarMutation.mutateAsync({ perfil, modulo, permitido: !atual });
      utils.permissoes.listar.invalidate();
      toast.success(`Acesso ${!atual ? "liberado" : "bloqueado"} para ${PERFIL_INFO[perfil].label} — ${MODULOS.find(m => m.id === modulo)?.label}`);
    } catch (err: any) { toast.error(err?.message || "Erro ao atualizar permissão."); }
  };

  const handleSeed = async () => {
    try {
      await seedMutation.mutateAsync();
      utils.permissoes.listar.invalidate();
      toast.success("Permissões padrão carregadas!");
    } catch (err: any) { toast.error(err?.message || "Erro."); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1B3E]">Controle de Acesso por Perfil</h1>
          <p className="text-sm text-gray-500 mt-1">Configure quais módulos cada perfil de usuário pode acessar.</p>
        </div>
        {permissoes.length === 0 && (
          <button onClick={handleSeed} disabled={seedMutation.isPending}
            className="px-4 py-2 bg-[#2E6EB5] text-white rounded-lg font-semibold hover:bg-[#1B5FA0] transition-colors shadow-sm disabled:opacity-50 text-sm">
            {seedMutation.isPending ? "Carregando..." : "⚡ Carregar Permissões Padrão"}
          </button>
        )}
      </div>

      {/* Aviso */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <span className="text-2xl">🔐</span>
        <div>
          <p className="text-sm font-semibold text-amber-900">Área Restrita ao Administrador</p>
          <p className="text-xs text-amber-700 mt-0.5">
            O perfil <strong>Administrador</strong> sempre tem acesso total a todos os módulos e não pode ser restringido.
            As configurações abaixo afetam apenas os perfis Contador e Assistente.
          </p>
        </div>
      </div>

      {/* Seletor de perfil */}
      <div className="grid grid-cols-2 gap-4">
        {(["contador", "assistente"] as Perfil[]).map(p => (
          <button key={p} onClick={() => setPerfil(p)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              perfil === p ? "border-[#2E6EB5] bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"
            }`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded border ${PERFIL_INFO[p].color}`}>
                {PERFIL_INFO[p].label}
              </span>
              {perfil === p && <span className="text-xs text-[#2E6EB5] font-semibold">✓ Selecionado</span>}
            </div>
            <p className="text-xs text-gray-500">{PERFIL_INFO[p].desc}</p>
          </button>
        ))}
      </div>

      {/* Matriz de permissões */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0D1B3E] to-[#1B2A4A] px-5 py-3 flex items-center justify-between">
          <h3 className="text-white font-bold text-sm">
            Módulos — Perfil: {PERFIL_INFO[perfil].label}
          </h3>
          <span className="text-blue-300 text-xs">
            {MODULOS.filter(m => getPermitido(perfil, m.id)).length}/{MODULOS.length} módulos liberados
          </span>
        </div>

        {permissoesQuery.isLoading ? (
          <div className="p-8 text-center text-gray-400">Carregando permissões...</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {MODULOS.map(modulo => {
              const permitido = getPermitido(perfil, modulo.id);
              return (
                <div key={modulo.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{modulo.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-[#0D1B3E]">{modulo.label}</p>
                      <p className="text-xs text-gray-400">{modulo.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      permitido ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {permitido ? "✅ Liberado" : "🚫 Bloqueado"}
                    </span>
                    <button
                      onClick={() => handleToggle(modulo.id, permitido)}
                      disabled={atualizarMutation.isPending}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
                        permitido ? "bg-[#2E6EB5]" : "bg-gray-300"
                      }`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        permitido ? "translate-x-6" : "translate-x-1"
                      }`} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resumo visual */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-[#0D1B3E] mb-4">📊 Resumo de Acesso por Perfil</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Módulo</th>
                <th className="text-center py-2 px-3 font-semibold text-purple-700">Admin</th>
                <th className="text-center py-2 px-3 font-semibold text-blue-700">Contador</th>
                <th className="text-center py-2 px-3 font-semibold text-gray-600">Assistente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MODULOS.map(m => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="py-2 px-3 font-medium text-[#0D1B3E]">{m.icon} {m.label}</td>
                  <td className="py-2 px-3 text-center text-green-600 font-bold">✓</td>
                  <td className="py-2 px-3 text-center">
                    {getPermitido("contador", m.id)
                      ? <span className="text-green-600 font-bold">✓</span>
                      : <span className="text-red-500 font-bold">✗</span>}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {getPermitido("assistente", m.id)
                      ? <span className="text-green-600 font-bold">✓</span>
                      : <span className="text-red-500 font-bold">✗</span>}
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-gray-200 bg-gray-50">
                <td className="py-2 px-3 font-semibold text-gray-600">⚙️ Usuários / Parâmetros</td>
                <td className="py-2 px-3 text-center text-green-600 font-bold">✓</td>
                <td className="py-2 px-3 text-center text-red-500 font-bold">✗</td>
                <td className="py-2 px-3 text-center text-red-500 font-bold">✗</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
