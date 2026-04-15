import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const PERFIL_LABELS: Record<string, { label: string; color: string }> = {
  admin: { label: "Administrador", color: "bg-purple-100 text-purple-800" },
  contador: { label: "Contador", color: "bg-blue-100 text-blue-800" },
  assistente: { label: "Assistente", color: "bg-gray-100 text-gray-700" },
};

export default function UsuariosPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    nome: "", email: "", senha: "",
    perfil: "contador" as "admin" | "contador" | "assistente"
  });

  const usuariosQuery = trpc.sistema.listarUsuarios.useQuery();
  const criarMutation = trpc.sistema.criarUsuario.useMutation();
  const utils = trpc.useUtils();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.senha.length < 8) { toast.error("A senha deve ter pelo menos 8 caracteres."); return; }
    try {
      await criarMutation.mutateAsync(form);
      toast.success("Usuário criado com sucesso!");
      utils.sistema.listarUsuarios.invalidate();
      setShowForm(false);
      setForm({ nome: "", email: "", senha: "", perfil: "contador" });
    } catch (err: any) { toast.error(err?.message || "Erro ao criar usuário."); }
  };

  const usuarios = usuariosQuery.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1B3E]">Usuários do Sistema</h1>
          <p className="text-sm text-gray-500">Gerencie os acessos com senha criptografada (bcrypt).</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-[#2E6EB5] text-white rounded-lg font-semibold hover:bg-[#1B5FA0] transition-colors shadow-sm">
          + Novo Usuário
        </button>
      </div>

      {/* Aviso de segurança */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <span className="text-2xl">🔒</span>
        <div>
          <p className="text-sm font-semibold text-blue-900">Segurança de Dados</p>
          <p className="text-xs text-blue-700 mt-0.5">
            Todas as senhas são criptografadas com bcrypt (hash irreversível, salt 12 rounds).
            Nenhuma senha é armazenada em texto puro. Cada usuário acessa com e-mail e senha próprios.
            Sessões expiram em 8 horas automaticamente.
          </p>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-[#0D1B3E] to-[#2E6EB5] px-6 py-4 rounded-t-2xl">
              <h2 className="text-white font-bold text-lg">Novo Usuário</h2>
              <p className="text-blue-200 text-xs mt-0.5">A senha será criptografada automaticamente com bcrypt.</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nome Completo *</label>
                <input required value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
                  placeholder="Ex: João Silva"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6EB5]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">E-mail *</label>
                <input required type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="usuario@contadorsos.com.br"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6EB5]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Senha * (mín. 8 caracteres)</label>
                <input required type="password" value={form.senha} onChange={e => setForm(p => ({ ...p, senha: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6EB5]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Perfil de Acesso</label>
                <select value={form.perfil} onChange={e => setForm(p => ({ ...p, perfil: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6EB5]">
                  <option value="admin">Administrador (acesso total)</option>
                  <option value="contador">Contador (acesso padrão)</option>
                  <option value="assistente">Assistente (acesso limitado)</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="flex-1 py-2.5 bg-[#2E6EB5] text-white rounded-lg font-semibold hover:bg-[#1B5FA0] transition-colors">
                  Criar Usuário
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
                <th className="px-4 py-3 text-left font-semibold">Nome</th>
                <th className="px-4 py-3 text-left font-semibold">E-mail</th>
                <th className="px-4 py-3 text-left font-semibold">Perfil</th>
                <th className="px-4 py-3 text-left font-semibold">Último Login</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usuariosQuery.isLoading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Carregando...</td></tr>
              ) : usuarios.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Nenhum usuário cadastrado além do administrador inicial.</td></tr>
              ) : usuarios.map((u: any) => (
                <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${!u.ativo ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2E6EB5] to-[#0D1B3E] flex items-center justify-center text-white text-xs font-bold">
                        {u.nome.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-[#0D1B3E]">{u.nome}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${PERFIL_LABELS[u.perfil]?.color || "bg-gray-100"}`}>
                      {PERFIL_LABELS[u.perfil]?.label || u.perfil}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {u.ultimoLogin ? new Date(u.ultimoLogin).toLocaleString("pt-BR") : "Nunca"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${u.ativo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {u.ativo ? "✅ Ativo" : "❌ Inativo"}
                    </span>
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
