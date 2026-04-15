import { useState } from "react";
import { useSistemaAuth } from "@/contexts/SistemaAuthContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663087286778/cV48WUkFrmxs5eaeYJNYBm/logo_contador_sos_271b934e.webp";

export default function Login() {
  const { login } = useSistemaAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [setupData, setSetupData] = useState({ nome: "", email: "", senha: "", confirmar: "" });

  const hasSetupQuery = trpc.sistema.hasSetup.useQuery();
  const setupMutation = trpc.sistema.setup.useMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, senha);
      toast.success("Login realizado com sucesso!");
    } catch (err: any) {
      toast.error(err?.message || "Credenciais inválidas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (setupData.senha !== setupData.confirmar) { toast.error("As senhas não coincidem."); return; }
    setLoading(true);
    try {
      await setupMutation.mutateAsync({ nome: setupData.nome, email: setupData.email, senha: setupData.senha });
      toast.success("Conta administrador criada! Faça login.");
      setShowSetup(false);
      hasSetupQuery.refetch();
    } catch (err: any) {
      toast.error(err?.message || "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  };

  const needsSetup = hasSetupQuery.data === false;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0D1B3E] via-[#1B2A4A] to-[#0D1B3E]">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 25% 25%, #2E6EB5 0%, transparent 50%), radial-gradient(circle at 75% 75%, #1B5FA0 0%, transparent 50%)" }} />
      </div>

      <div className="relative w-full max-w-md mx-4">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0D1B3E] to-[#1B5FA0] px-8 py-8 text-center">
            <img src={LOGO_URL} alt="Contador SOS" className="h-24 w-auto mx-auto mb-4 object-contain" />
            <p className="text-blue-200 text-sm font-medium tracking-wide">SISTEMA DE GESTÃO IRPF 2026</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            {(needsSetup || showSetup) ? (
              <>
                <h2 className="text-xl font-bold text-[#0D1B3E] mb-2">Configuração Inicial</h2>
                <p className="text-sm text-gray-500 mb-6">Crie a conta de administrador do sistema.</p>
                <form onSubmit={handleSetup} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nome Completo</label>
                    <input type="text" required value={setupData.nome} onChange={e => setSetupData(p => ({ ...p, nome: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E6EB5] text-gray-800 bg-gray-50"
                      placeholder="Seu nome completo" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail</label>
                    <input type="email" required value={setupData.email} onChange={e => setSetupData(p => ({ ...p, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E6EB5] text-gray-800 bg-gray-50"
                      placeholder="admin@contadorsos.com.br" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Senha (mín. 8 caracteres)</label>
                    <input type="password" required minLength={8} value={setupData.senha} onChange={e => setSetupData(p => ({ ...p, senha: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E6EB5] text-gray-800 bg-gray-50"
                      placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Confirmar Senha</label>
                    <input type="password" required value={setupData.confirmar} onChange={e => setSetupData(p => ({ ...p, confirmar: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E6EB5] text-gray-800 bg-gray-50"
                      placeholder="••••••••" />
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-[#1B5FA0] to-[#2E6EB5] text-white font-bold rounded-lg hover:from-[#0D1B3E] hover:to-[#1B5FA0] transition-all duration-200 shadow-md disabled:opacity-60">
                    {loading ? "Criando conta..." : "Criar Conta Admin"}
                  </button>
                  {!needsSetup && (
                    <button type="button" onClick={() => setShowSetup(false)} className="w-full py-2 text-sm text-gray-500 hover:text-gray-700">
                      Voltar ao login
                    </button>
                  )}
                </form>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-[#0D1B3E] mb-2">Acesso ao Sistema</h2>
                <p className="text-sm text-gray-500 mb-6">Insira suas credenciais para continuar.</p>
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail</label>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E6EB5] text-gray-800 bg-gray-50"
                      placeholder="seu@email.com" autoComplete="email" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Senha</label>
                    <input type="password" required value={senha} onChange={e => setSenha(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E6EB5] text-gray-800 bg-gray-50"
                      placeholder="••••••••" autoComplete="current-password" />
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-[#1B5FA0] to-[#2E6EB5] text-white font-bold rounded-lg hover:from-[#0D1B3E] hover:to-[#1B5FA0] transition-all duration-200 shadow-md disabled:opacity-60">
                    {loading ? "Entrando..." : "Entrar no Sistema"}
                  </button>
                </form>
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-400">
                    🔒 Acesso restrito — Contador SOS Soluções Contábeis
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-blue-300 mt-6 opacity-70">
          © 2026 Contador SOS — Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}
