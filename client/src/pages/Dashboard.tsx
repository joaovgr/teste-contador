import { useState, useEffect } from "react";
import { useSistemaAuth } from "@/contexts/SistemaAuthContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import ClientesPage from "./Clientes";
import TriagemPage from "./Triagem";
import PropostasPage from "./Propostas";
import DocumentosPage from "./Documentos";
import CobrancasPage from "./Cobrancas";
import UsuariosPage from "./Usuarios";
import PortalAdminPage from "./PortalAdmin";
import ParametrosPage from "./Parametros";
import ImportacaoPage from "./Importacao";
import PermissoesPage from "./Permissoes";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663087286778/cV48WUkFrmxs5eaeYJNYBm/logo_contador_sos_271b934e.webp";

type Page =
  | "dashboard" | "clientes" | "importacao" | "triagem" | "propostas"
  | "documentos" | "cobrancas" | "portal_admin"
  | "usuarios" | "parametros" | "permissoes";

// Módulos que podem ser controlados por permissão (exceto admin-only)
const MODULO_PERMISSAO: Record<string, string> = {
  clientes: "clientes",
  importacao: "clientes", // importação usa mesma permissão de clientes
  triagem: "triagem",
  propostas: "propostas",
  documentos: "documentos",
  cobrancas: "cobrancas",
  portal_admin: "portal_admin",
};

const navItems: { id: Page; label: string; icon: string; adminOnly?: boolean; group?: string }[] = [
  { id: "dashboard",    label: "Dashboard",             icon: "📊" },
  // Clientes
  { id: "clientes",     label: "Clientes",              icon: "👥", group: "clientes" },
  { id: "importacao",   label: "Importação em Lote",    icon: "📥", group: "clientes" },
  // Operacional
  { id: "triagem",      label: "Triagem / Precificação", icon: "🧮" },
  { id: "propostas",    label: "Propostas Comerciais",  icon: "📄" },
  { id: "documentos",   label: "Controle de Docs",      icon: "📁" },
  { id: "cobrancas",    label: "Cobranças",             icon: "💰" },
  { id: "portal_admin", label: "Portal do Cliente",     icon: "🌐" },
  // Admin
  { id: "usuarios",     label: "Usuários",              icon: "👤", adminOnly: true },
  { id: "permissoes",   label: "Controle de Acesso",    icon: "🔐", adminOnly: true },
  { id: "parametros",   label: "Parâmetros do Sistema", icon: "⚙️", adminOnly: true },
];

function KPICard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className={`bg-white rounded-xl p-5 border-l-4 shadow-sm ${color}`}>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-3xl font-bold text-[#0D1B3E]">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function DashboardHome() {
  const statsQuery = trpc.dashboard.stats.useQuery();
  const s = statsQuery.data;

  const receitaTotal = s ? (s.totalHonorarios || 0) : 0;
  const adimplencia = s && s.total > 0 ? Math.round(((s.pagos || 0) / s.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0D1B3E]">Dashboard IRPF 2026</h1>
        <p className="text-sm text-gray-500 mt-1">Visão geral do escritório — {new Date().toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total de Clientes"   value={s?.total ?? 0}  sub="cadastrados"                color="border-[#2E6EB5]" />
        <KPICard label="Declarações Feitas"  value={s?.feitos ?? 0} sub={`de ${s?.total ?? 0} total`} color="border-green-500" />
        <KPICard label="Receita Total"       value={`R$ ${receitaTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} sub="honorários calculados" color="border-amber-500" />
        <KPICard label="Adimplência"         value={`${adimplencia}%`} sub={`${s?.pagos ?? 0} pagos`} color="border-purple-500" />
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-[#0D1B3E] mb-4">📋 Status das Declarações</h3>
          <div className="space-y-3">
            {[
              { label: "✅ Feitos",        value: s?.feitos      ?? 0, color: "bg-green-100 text-green-700"  },
              { label: "🔄 Em Andamento",  value: s?.emAndamento ?? 0, color: "bg-blue-100 text-blue-700"   },
              { label: "📌 A Fazer",       value: s?.aFazer      ?? 0, color: "bg-yellow-100 text-yellow-700"},
              { label: "⏳ Pendente",      value: s?.pendentes   ?? 0, color: "bg-orange-100 text-orange-700"},
              { label: "❌ Desistências",  value: s?.desistiu    ?? 0, color: "bg-red-100 text-red-700"     },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.label}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-[#0D1B3E] mb-4">💳 Status de Pagamento</h3>
          <div className="space-y-3">
            {[
              { label: "✅ Pagos",         value: s?.pagos             ?? 0, color: "bg-green-100 text-green-700"  },
              { label: "⏳ Pendentes",     value: s?.pagamentoPendente ?? 0, color: "bg-yellow-100 text-yellow-700"},
              { label: "⚠️ Parcial",       value: s?.parcial           ?? 0, color: "bg-orange-100 text-orange-700"},
              { label: "🚨 Inadimplentes", value: s?.inadimplente      ?? 0, color: "bg-red-100 text-red-700"     },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.label}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Faixas */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-[#0D1B3E] mb-4">🏷️ Distribuição por Faixa de Honorários</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Essencial",   value: s?.essencial  ?? 0, price: "R$ 297",   color: "bg-gray-50 border-gray-300"   },
            { label: "Completo",    value: s?.completo   ?? 0, price: "R$ 497",   color: "bg-blue-50 border-blue-300"   },
            { label: "Avançado",    value: s?.avancado   ?? 0, price: "R$ 797",   color: "bg-purple-50 border-purple-300"},
            { label: "Estratégico", value: s?.estrategico?? 0, price: "R$ 1.297", color: "bg-amber-50 border-amber-300" },
          ].map(f => (
            <div key={f.label} className={`rounded-lg p-4 border ${f.color} text-center`}>
              <p className="text-2xl font-bold text-[#0D1B3E]">{f.value}</p>
              <p className="text-sm font-semibold text-gray-600">{f.label}</p>
              <p className="text-xs text-gray-400">{f.price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Orçamento Manual */}
      {(s?.orcamentoManual ?? 0) > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-bold text-red-800">{s?.orcamentoManual} cliente(s) requerem orçamento manual</p>
            <p className="text-sm text-red-600">Casos com malha fina, reconstrução ou complexidade especial.</p>
          </div>
        </div>
      )}

      {/* Link rápido para o portal */}
      <div className="bg-gradient-to-r from-[#1B2A4A] to-[#2E6EB5] rounded-xl p-5 flex items-center justify-between">
        <div>
          <p className="text-white font-bold text-sm">🌐 Portal do Cliente</p>
          <p className="text-blue-200 text-xs mt-1">Compartilhe o link abaixo com seus clientes para upload de documentos e acompanhamento.</p>
          <p className="text-white font-mono text-xs mt-2 bg-white/10 px-2 py-1 rounded inline-block">
            {window.location.origin}/portal
          </p>
        </div>
        <a href="/portal" target="_blank" rel="noopener noreferrer"
          className="bg-white text-[#1B2A4A] text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors flex-shrink-0 ml-4">
          Abrir Portal ↗
        </a>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useSistemaAuth();
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Carregar permissões do perfil atual (apenas para não-admin)
  const permissoesQuery = trpc.permissoes.listarPorPerfil.useQuery(
    { perfil: user?.perfil as "contador" | "assistente" },
    { enabled: !!user && user.perfil !== "admin" }
  );

  const handleLogout = async () => {
    await logout();
    toast.success("Sessão encerrada.");
  };

  // Verificar se o usuário tem acesso ao módulo
  const temAcesso = (pageId: Page): boolean => {
    if (!user) return false;
    if (user.perfil === "admin") return true;
    const moduloKey = MODULO_PERMISSAO[pageId];
    if (!moduloKey) return false; // módulos admin-only
    const permissoes = permissoesQuery.data ?? [];
    if (permissoes.length === 0) return true; // se não configurado, permite
    const perm = permissoes.find(p => p.modulo === moduloKey);
    return perm ? perm.permitido : true;
  };

  // Redirecionar se a página atual não tem acesso
  useEffect(() => {
    if (user && user.perfil !== "admin" && currentPage !== "dashboard") {
      if (!temAcesso(currentPage)) {
        setCurrentPage("dashboard");
        toast.error("Você não tem acesso a este módulo.");
      }
    }
  }, [permissoesQuery.data, currentPage, user]);

  const visibleNav = navItems.filter(n => {
    if (n.adminOnly && user?.perfil !== "admin") return false;
    if (!n.adminOnly && !temAcesso(n.id)) return false;
    return true;
  });

  const handleNavClick = (pageId: Page) => {
    if (!temAcesso(pageId)) {
      toast.error("Você não tem permissão para acessar este módulo.");
      return;
    }
    setCurrentPage(pageId);
  };

  // Separar nav em grupos
  const navGrupos: { titulo?: string; items: typeof navItems }[] = [
    { items: visibleNav.filter(n => n.id === "dashboard") },
    { titulo: "Clientes", items: visibleNav.filter(n => n.id === "clientes" || n.id === "importacao") },
    { titulo: "Operacional", items: visibleNav.filter(n => ["triagem","propostas","documentos","cobrancas","portal_admin"].includes(n.id)) },
    { titulo: "Administração", items: visibleNav.filter(n => n.adminOnly) },
  ].filter(g => g.items.length > 0);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-16"} bg-gradient-to-b from-[#0D1B3E] to-[#1B2A4A] flex flex-col transition-all duration-300 shadow-xl flex-shrink-0`}>
        {/* Logo */}
        <div className="p-4 border-b border-white/10">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <img src={LOGO_URL} alt="Contador SOS" className="h-14 w-auto object-contain" style={{ maxWidth: "140px" }} />
            </div>
          ) : (
            <img src={LOGO_URL} alt="SOS" className="h-8 w-8 object-contain mx-auto" />
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto">
          {navGrupos.map((grupo, gi) => (
            <div key={gi}>
              {grupo.titulo && sidebarOpen && (
                <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider px-3 pt-3 pb-1 opacity-70">
                  {grupo.titulo}
                </p>
              )}
              {grupo.items.map(item => (
                <button key={item.id} onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150
                    ${currentPage === item.id ? "bg-[#2E6EB5] text-white shadow-md" : "text-blue-200 hover:bg-white/10 hover:text-white"}`}>
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  {sidebarOpen && <span className="text-sm font-medium truncate">{item.label}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="p-3 border-t border-white/10">
          {sidebarOpen && (
            <div className="mb-2 px-2">
              <p className="text-white text-xs font-semibold truncate">{user?.nome}</p>
              <p className="text-blue-300 text-xs truncate capitalize">{user?.perfil}</p>
            </div>
          )}
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-300 hover:bg-red-900/30 hover:text-red-200 transition-colors">
            <span>🚪</span>
            {sidebarOpen && <span className="text-xs font-medium">Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(p => !p)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
              <span className="text-lg">☰</span>
            </button>
            <h2 className="font-semibold text-[#0D1B3E] text-sm">
              {navItems.find(n => n.id === currentPage)?.icon} {navItems.find(n => n.id === currentPage)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 hidden sm:block">Olá, {user?.nome?.split(" ")[0]}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
              user?.perfil === "admin" ? "bg-purple-100 text-purple-800" :
              user?.perfil === "contador" ? "bg-blue-100 text-blue-800" :
              "bg-gray-100 text-gray-700"
            }`}>
              {user?.perfil}
            </span>
            <span className="w-8 h-8 rounded-full bg-[#2E6EB5] text-white text-xs font-bold flex items-center justify-center">
              {user?.nome?.charAt(0).toUpperCase()}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {currentPage === "dashboard"    && <DashboardHome />}
          {currentPage === "clientes"     && <ClientesPage />}
          {currentPage === "importacao"   && <ImportacaoPage />}
          {currentPage === "triagem"      && <TriagemPage />}
          {currentPage === "propostas"    && <PropostasPage />}
          {currentPage === "documentos"   && <DocumentosPage />}
          {currentPage === "cobrancas"    && <CobrancasPage />}
          {currentPage === "portal_admin" && <PortalAdminPage />}
          {currentPage === "usuarios"     && <UsuariosPage />}
          {currentPage === "permissoes"   && <PermissoesPage />}
          {currentPage === "parametros"   && <ParametrosPage />}
        </main>
      </div>
    </div>
  );
}
