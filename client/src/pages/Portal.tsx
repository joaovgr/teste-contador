import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { usePortalAuth } from "@/contexts/PortalAuthContext";
import { toast } from "sonner";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663087286778/cV48WUkFrmxs5eaeYJNYBm/LOGOMARCA2500X2500.zip-LOGOMARCAPRINCIPAL_054a9f1e.webp";

const STATUS_LABELS: Record<string, { label: string; color: string; step: number }> = {
  a_fazer:      { label: "Aguardando Início",    color: "bg-slate-400",   step: 1 },
  em_andamento: { label: "Em Andamento",          color: "bg-blue-500",    step: 2 },
  pendente:     { label: "Pendente de Documentos",color: "bg-amber-500",   step: 2 },
  feito:        { label: "Declaração Entregue",   color: "bg-green-500",   step: 4 },
  desistiu:     { label: "Cancelado",             color: "bg-red-500",     step: 0 },
};

const CATEGORIAS: { value: string; label: string; icon: string }[] = [
  { value: "rg_cpf",                  label: "RG / CPF",                  icon: "🪪" },
  { value: "comprovante_residencia",  label: "Comprovante de Residência",  icon: "🏠" },
  { value: "informe_rendimentos",     label: "Informe de Rendimentos",     icon: "📋" },
  { value: "deducoes",                label: "Deduções (médico/educação)", icon: "🏥" },
  { value: "bens_direitos",           label: "Bens e Direitos",            icon: "🏦" },
  { value: "renda_variavel",          label: "Renda Variável",             icon: "📈" },
  { value: "cripto",                  label: "Criptoativos",               icon: "🪙" },
  { value: "exterior",                label: "Rendimentos no Exterior",    icon: "🌍" },
  { value: "recibo_anterior",         label: "Recibo Ano Anterior",        icon: "🧾" },
  { value: "outros",                  label: "Outros Documentos",          icon: "📎" },
];

// ─── Tela de Login ─────────────────────────────────────────────────────────
function PortalLogin() {
  const { login } = usePortalAuth();
  const [cpf, setCpf] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  const loginMut = trpc.portal.login.useMutation({
    onSuccess: (data) => {
      login({ ...data, token: token.toUpperCase().trim() });
      toast.success(`Bem-vindo(a), ${data.nome}!`);
    },
    onError: (err) => {
      toast.error(err.message || "CPF ou código inválido.");
      setLoading(false);
    },
  });

  const formatCPF = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 11);
    return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
            .replace(/(\d{3})(\d{3})(\d{3})/, "$1.$2.$3")
            .replace(/(\d{3})(\d{3})/, "$1.$2")
            .replace(/(\d{3})/, "$1");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    loginMut.mutate({ cpf: cpf.replace(/\D/g, ""), token });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0d1b35] via-[#1B2A4A] to-[#0d1b35] px-4">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center">
        <img src={LOGO_URL} alt="Contador SOS" className="w-56 h-auto drop-shadow-2xl" />
        <p className="text-blue-200 text-sm mt-3 tracking-widest uppercase font-light">Portal do Cliente</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-1">Acesse sua área</h1>
        <p className="text-blue-200 text-sm mb-6">Use o CPF e o código de acesso fornecido pelo seu contador.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-blue-100 text-sm font-medium mb-1">CPF</label>
            <input
              type="text"
              value={cpf}
              onChange={e => setCpf(formatCPF(e.target.value))}
              placeholder="000.000.000-00"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-[#2E6EB5] text-lg tracking-wider"
              required
            />
          </div>
          <div>
            <label className="block text-blue-100 text-sm font-medium mb-1">Código de Acesso</label>
            <input
              type="text"
              value={token}
              onChange={e => setToken(e.target.value.toUpperCase())}
              placeholder="Ex: AB3X9KPQ"
              maxLength={12}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-[#2E6EB5] text-lg tracking-widest font-mono"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2E6EB5] hover:bg-[#1B2A4A] text-white font-bold py-3 rounded-lg transition-colors duration-200 disabled:opacity-60 text-lg mt-2"
          >
            {loading ? "Verificando..." : "Entrar"}
          </button>
        </form>

        <p className="text-blue-300/60 text-xs text-center mt-6">
          Não possui código de acesso? Entre em contato com seu contador.
        </p>
      </div>

      <p className="text-blue-400/40 text-xs mt-8">© 2026 Contador SOS — Soluções Contábeis</p>
    </div>
  );
}

// ─── Linha do Tempo de Status ───────────────────────────────────────────────
function StatusTimeline({ status }: { status: string }) {
  const steps = [
    { step: 1, label: "Cadastro Realizado",     icon: "✅" },
    { step: 2, label: "Documentos em Análise",  icon: "📂" },
    { step: 3, label: "Declaração em Preparo",  icon: "⚙️" },
    { step: 4, label: "Declaração Entregue",    icon: "🎉" },
  ];
  const currentStep = STATUS_LABELS[status]?.step ?? 1;
  const info = STATUS_LABELS[status] ?? { label: status, color: "bg-slate-400" };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-white text-sm font-semibold ${info.color}`}>
          {info.label}
        </span>
      </div>
      <div className="flex items-center justify-between relative">
        {/* linha de fundo */}
        <div className="absolute left-0 right-0 top-5 h-1 bg-gray-200 z-0" />
        <div
          className="absolute left-0 top-5 h-1 bg-[#2E6EB5] z-0 transition-all duration-700"
          style={{ width: `${Math.max(0, ((currentStep - 1) / 3)) * 100}%` }}
        />
        {steps.map(s => (
          <div key={s.step} className="flex flex-col items-center z-10 flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all duration-300 ${
              s.step <= currentStep
                ? "bg-[#2E6EB5] border-[#2E6EB5] text-white"
                : "bg-white border-gray-300 text-gray-400"
            }`}>
              {s.step <= currentStep ? s.icon : s.step}
            </div>
            <p className={`text-xs mt-2 text-center font-medium ${s.step <= currentStep ? "text-[#1B2A4A]" : "text-gray-400"}`}>
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Upload de Documentos ───────────────────────────────────────────────────
function UploadSection({ clienteId }: { clienteId: number }) {
  const [categoria, setCategoria] = useState("informe_rendimentos");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const { data: uploads = [] } = trpc.portal.listarUploads.useQuery({ clienteId });

  const uploadMut = trpc.portal.uploadArquivo.useMutation({
    onSuccess: () => {
      toast.success("Documento enviado com sucesso!");
      utils.portal.listarUploads.invalidate({ clienteId });
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao enviar arquivo.");
      setUploading(false);
    },
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Arquivo muito grande (máx 10MB)"); return; }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadMut.mutate({
        clienteId,
        categoria: categoria as any,
        nomeOriginal: file.name,
        mimeType: file.type,
        tamanho: file.size,
        base64,
      });
    };
    reader.readAsDataURL(file);
  };

  const statusIcon = (s: string) => s === "aprovado" ? "✅" : s === "rejeitado" ? "❌" : "⏳";
  const statusLabel = (s: string) => s === "aprovado" ? "Aprovado" : s === "rejeitado" ? "Rejeitado" : "Aguardando revisão";

  return (
    <div className="space-y-4">
      {/* Upload */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-bold text-[#1B2A4A] mb-4">📤 Enviar Documento</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <select
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E6EB5] bg-white"
            >
              {CATEGORIAS.map(c => (
                <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Arquivo (PDF, JPG, PNG — máx 10MB)</label>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
              onChange={handleUpload}
              disabled={uploading}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-[#2E6EB5] file:text-white file:cursor-pointer disabled:opacity-60"
            />
          </div>
        </div>
        {uploading && (
          <div className="mt-3 flex items-center gap-2 text-blue-600 text-sm">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            Enviando arquivo...
          </div>
        )}
      </div>

      {/* Lista de uploads */}
      {uploads.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-[#1B2A4A] mb-4">📁 Documentos Enviados ({uploads.length})</h3>
          <div className="space-y-2">
            {uploads.map((u: any) => {
              const cat = CATEGORIAS.find(c => c.value === u.categoria);
              return (
                <div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{cat?.icon ?? "📄"}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{u.nomeOriginal}</p>
                      <p className="text-xs text-gray-500">{cat?.label} · {new Date(u.criadoEm).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{statusIcon(u.statusRevisao)}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      u.statusRevisao === "aprovado" ? "bg-green-100 text-green-700" :
                      u.statusRevisao === "rejeitado" ? "bg-red-100 text-red-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>{statusLabel(u.statusRevisao)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Mensagens ──────────────────────────────────────────────────────────────
function MensagensSection({ clienteId }: { clienteId: number }) {
  const [texto, setTexto] = useState("");
  const utils = trpc.useUtils();
  const { data: mensagens = [] } = trpc.portal.listarMensagens.useQuery({ clienteId });

  const enviarMut = trpc.portal.enviarMensagem.useMutation({
    onSuccess: () => {
      setTexto("");
      utils.portal.listarMensagens.invalidate({ clienteId });
    },
    onError: () => toast.error("Erro ao enviar mensagem."),
  });

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-lg font-bold text-[#1B2A4A] mb-4">💬 Mensagens com o Contador</h3>
      <div className="space-y-3 max-h-72 overflow-y-auto mb-4 pr-1">
        {mensagens.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-6">Nenhuma mensagem ainda.</p>
        )}
        {(mensagens as any[]).map((m) => (
          <div key={m.id} className={`flex ${m.remetente === "cliente" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${
              m.remetente === "cliente"
                ? "bg-[#2E6EB5] text-white rounded-br-sm"
                : "bg-gray-100 text-gray-800 rounded-bl-sm"
            }`}>
              <p>{m.mensagem}</p>
              <p className={`text-xs mt-1 ${m.remetente === "cliente" ? "text-blue-200" : "text-gray-400"}`}>
                {m.remetente === "cliente" ? "Você" : "Contador SOS"} · {new Date(m.criadoEm).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={texto}
          onChange={e => setTexto(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (texto.trim()) enviarMut.mutate({ clienteId, mensagem: texto.trim() }); } }}
          placeholder="Digite sua mensagem..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6EB5]"
        />
        <button
          onClick={() => { if (texto.trim()) enviarMut.mutate({ clienteId, mensagem: texto.trim() }); }}
          disabled={!texto.trim() || enviarMut.isPending}
          className="bg-[#2E6EB5] hover:bg-[#1B2A4A] text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}

// ─── Dashboard do Cliente ───────────────────────────────────────────────────
function PortalDashboard() {
  const { session, logout } = usePortalAuth();
  const [tab, setTab] = useState<"status" | "docs" | "mensagens">("status");
  if (!session) return null;

  const faixaLabel: Record<string, string> = {
    essencial: "Essencial", completo: "Completo", avancado: "Avançado", estrategico: "Estratégico"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#1B2A4A] to-[#2E6EB5] shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={LOGO_URL} alt="Contador SOS" className="h-14 w-auto drop-shadow" />
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">Portal do Cliente</h1>
              <p className="text-blue-200 text-xs">IRPF {session.anoBase ?? 2025}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-white text-sm font-semibold">{session.nome}</p>
              <p className="text-blue-200 text-xs">{session.cpf}</p>
            </div>
            <button onClick={logout} className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-2 rounded-lg transition-colors">
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Cards de resumo */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium">Pacote</p>
            <p className="text-xl font-bold text-[#1B2A4A] mt-1">{faixaLabel[session.faixa ?? "essencial"] ?? "—"}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium">Honorários</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">
              {session.honorarios ? `R$ ${Number(session.honorarios).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 col-span-2 md:col-span-1">
            <p className="text-xs text-gray-500 font-medium">Ano Base</p>
            <p className="text-xl font-bold text-[#2E6EB5] mt-1">{session.anoBase ?? 2025}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-gray-100 shadow-sm p-1">
          {([
            { key: "status",    label: "📊 Status",     },
            { key: "docs",      label: "📁 Documentos", },
            { key: "mensagens", label: "💬 Mensagens",  },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                tab === t.key
                  ? "bg-[#2E6EB5] text-white shadow"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Conteúdo das tabs */}
        {tab === "status" && (
          <div className="space-y-4">
            <StatusTimeline status={session.status ?? "a_fazer"} />
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-bold text-[#1B2A4A] mb-3">📋 O que fazer agora?</h3>
              <div className="space-y-3">
                {[
                  { icon: "1️⃣", text: "Reúna todos os documentos necessários (informes, recibos, comprovantes)." },
                  { icon: "2️⃣", text: "Acesse a aba Documentos e faça o upload de cada item." },
                  { icon: "3️⃣", text: "Aguarde a análise do seu contador — você será notificado por aqui." },
                  { icon: "4️⃣", text: "Após a entrega, confira o recibo da declaração nesta área." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <span className="text-xl">{item.icon}</span>
                    <p className="text-sm text-gray-700">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "docs" && <UploadSection clienteId={session.clienteId} />}
        {tab === "mensagens" && <MensagensSection clienteId={session.clienteId} />}
      </main>

      <footer className="bg-gradient-to-r from-[#1B2A4A] to-[#2E6EB5] mt-12 py-4">
        <p className="text-center text-xs text-white/60">© 2026 Contador SOS — Soluções Contábeis | Portal do Cliente</p>
      </footer>
    </div>
  );
}

// ─── Página principal do Portal ─────────────────────────────────────────────
export default function PortalPage() {
  const { isAuthenticated } = usePortalAuth();
  return isAuthenticated ? <PortalDashboard /> : <PortalLogin />;
}
