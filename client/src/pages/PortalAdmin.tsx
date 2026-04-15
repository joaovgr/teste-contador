import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const CATEGORIAS: Record<string, string> = {
  rg_cpf: "RG / CPF", comprovante_residencia: "Comprovante de Residência",
  informe_rendimentos: "Informe de Rendimentos", deducoes: "Deduções",
  bens_direitos: "Bens e Direitos", renda_variavel: "Renda Variável",
  cripto: "Criptoativos", exterior: "Exterior", outros: "Outros",
  recibo_anterior: "Recibo Anterior",
};

// ─── Gerador de Token por Cliente ───────────────────────────────────────────
function TokenGenerator({ clienteId, nomeCliente }: { clienteId: number; nomeCliente: string }) {
  const [dias, setDias] = useState(30);
  const [tokenGerado, setTokenGerado] = useState<string | null>(null);
  const utils = trpc.useUtils();

  const { data: tokenAtivo } = trpc.portalAdmin.getToken.useQuery({ clienteId });

  const gerarMut = trpc.portalAdmin.gerarToken.useMutation({
    onSuccess: (data) => {
      setTokenGerado(data.token);
      utils.portalAdmin.getToken.invalidate({ clienteId });
      toast.success("Código de acesso gerado!");
    },
    onError: () => toast.error("Erro ao gerar código."),
  });

  const copiar = (texto: string) => {
    navigator.clipboard.writeText(texto);
    toast.success("Copiado!");
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="font-bold text-[#1B2A4A] mb-1">🔑 Código de Acesso — {nomeCliente}</h3>
      <p className="text-xs text-gray-500 mb-4">Gere um código de acesso para o cliente acessar o portal.</p>

      {tokenAtivo && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs text-blue-600 font-medium mb-1">Código ativo:</p>
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg font-bold text-[#1B2A4A] tracking-widest">{tokenAtivo.token}</span>
            <button onClick={() => copiar(tokenAtivo.token)} className="text-xs bg-[#2E6EB5] text-white px-2 py-1 rounded">Copiar</button>
          </div>
          {tokenAtivo.expiresAt && (
            <p className="text-xs text-gray-500 mt-1">Expira em: {new Date(tokenAtivo.expiresAt).toLocaleDateString("pt-BR")}</p>
          )}
          {tokenAtivo.ultimoAcesso && (
            <p className="text-xs text-gray-500">Último acesso: {new Date(tokenAtivo.ultimoAcesso).toLocaleString("pt-BR")}</p>
          )}
        </div>
      )}

      {tokenGerado && (
        <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-xs text-green-700 font-semibold mb-2">✅ Novo código gerado! Envie ao cliente:</p>
          <div className="flex items-center gap-3">
            <span className="font-mono text-2xl font-bold text-green-800 tracking-widest">{tokenGerado}</span>
            <button onClick={() => copiar(tokenGerado)} className="text-sm bg-green-600 text-white px-3 py-1 rounded-lg">📋 Copiar</button>
          </div>
          <p className="text-xs text-green-600 mt-2">
            Instrução para o cliente: Acesse <strong>/portal</strong>, informe seu CPF e este código.
          </p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div>
          <label className="text-xs text-gray-600 font-medium">Validade (dias)</label>
          <input
            type="number"
            value={dias}
            onChange={e => setDias(Number(e.target.value))}
            min={1} max={365}
            className="block w-24 border border-gray-300 rounded-lg px-2 py-1 text-sm mt-1"
          />
        </div>
        <button
          onClick={() => gerarMut.mutate({ clienteId, expirarEm: dias })}
          disabled={gerarMut.isPending}
          className="mt-5 bg-[#2E6EB5] hover:bg-[#1B2A4A] text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60 transition-colors"
        >
          {tokenAtivo ? "🔄 Revogar e Gerar Novo" : "🔑 Gerar Código"}
        </button>
      </div>
    </div>
  );
}

// ─── Painel de Notificações de Uploads ──────────────────────────────────────
function NotificacoesUploads() {
  const utils = trpc.useUtils();
  const { data: uploads = [], isLoading } = trpc.portalAdmin.uploadsNaoLidos.useQuery();

  const marcarLidoMut = trpc.portalAdmin.marcarLido.useMutation({
    onSuccess: () => utils.portalAdmin.uploadsNaoLidos.invalidate(),
  });

  const revisarMut = trpc.portalAdmin.revisarUpload.useMutation({
    onSuccess: () => {
      utils.portalAdmin.uploadsNaoLidos.invalidate();
      toast.success("Revisão registrada!");
    },
    onError: () => toast.error("Erro ao revisar."),
  });

  if (isLoading) return <div className="text-center py-8 text-gray-400">Carregando...</div>;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-[#1B2A4A]">📥 Documentos Recebidos (não lidos)</h3>
        <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">{uploads.length}</span>
      </div>

      {uploads.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-6">✅ Nenhum documento novo pendente de revisão.</p>
      ) : (
        <div className="space-y-3">
          {(uploads as any[]).map(u => (
            <div key={u.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
              <div>
                <p className="text-sm font-semibold text-gray-800">{u.nomeCliente ?? `Cliente #${u.clienteId}`}</p>
                <p className="text-xs text-gray-600">{CATEGORIAS[u.categoria] ?? u.categoria} · {u.nomeOriginal}</p>
                <p className="text-xs text-gray-400">{new Date(u.criadoEm).toLocaleString("pt-BR")}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => revisarMut.mutate({ uploadId: u.id, status: "aprovado" })}
                  className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded-lg transition-colors"
                >✅ Aprovar</button>
                <button
                  onClick={() => revisarMut.mutate({ uploadId: u.id, status: "rejeitado", observacao: "Documento ilegível ou incorreto." })}
                  className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-lg transition-colors"
                >❌ Rejeitar</button>
                <button
                  onClick={() => marcarLidoMut.mutate({ uploadId: u.id })}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs px-3 py-1 rounded-lg transition-colors"
                >Lido</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Chat com cliente ────────────────────────────────────────────────────────
function ChatCliente({ clienteId, nomeCliente }: { clienteId: number; nomeCliente: string }) {
  const [texto, setTexto] = useState("");
  const utils = trpc.useUtils();
  const { data: mensagens = [] } = trpc.portalAdmin.listarMensagens.useQuery({ clienteId });

  const enviarMut = trpc.portalAdmin.enviarMensagem.useMutation({
    onSuccess: () => {
      setTexto("");
      utils.portalAdmin.listarMensagens.invalidate({ clienteId });
    },
    onError: () => toast.error("Erro ao enviar mensagem."),
  });

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="font-bold text-[#1B2A4A] mb-4">💬 Chat com {nomeCliente}</h3>
      <div className="space-y-2 max-h-60 overflow-y-auto mb-3 pr-1">
        {(mensagens as any[]).length === 0 && (
          <p className="text-gray-400 text-sm text-center py-4">Nenhuma mensagem.</p>
        )}
        {(mensagens as any[]).map(m => (
          <div key={m.id} className={`flex ${m.remetente === "contador" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${
              m.remetente === "contador"
                ? "bg-[#2E6EB5] text-white rounded-br-sm"
                : "bg-gray-100 text-gray-800 rounded-bl-sm"
            }`}>
              <p>{m.mensagem}</p>
              <p className={`text-xs mt-1 ${m.remetente === "contador" ? "text-blue-200" : "text-gray-400"}`}>
                {m.remetente === "contador" ? "Você" : nomeCliente} · {new Date(m.criadoEm).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={texto}
          onChange={e => setTexto(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && texto.trim()) { e.preventDefault(); enviarMut.mutate({ clienteId, mensagem: texto.trim() }); } }}
          placeholder="Mensagem para o cliente..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6EB5]"
        />
        <button
          onClick={() => { if (texto.trim()) enviarMut.mutate({ clienteId, mensagem: texto.trim() }); }}
          disabled={!texto.trim() || enviarMut.isPending}
          className="bg-[#2E6EB5] text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
        >Enviar</button>
      </div>
    </div>
  );
}

// ─── Página principal do Portal Admin ───────────────────────────────────────
export default function PortalAdminPage() {
  const [tab, setTab] = useState<"notificacoes" | "tokens" | "chat">("notificacoes");
  const [clienteSelecionado, setClienteSelecionado] = useState<{ id: number; nome: string } | null>(null);

  const { data: clientes = [] } = trpc.clientes.listar.useQuery({});

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1B2A4A]">Portal do Cliente</h2>
        <p className="text-gray-500 text-sm mt-1">Gerencie acessos, documentos recebidos e comunicação com clientes.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {([
          { key: "notificacoes", label: "📥 Documentos Recebidos" },
          { key: "tokens",       label: "🔑 Códigos de Acesso" },
          { key: "chat",         label: "💬 Chat com Cliente" },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.key ? "bg-white text-[#1B2A4A] shadow" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Notificações */}
      {tab === "notificacoes" && <NotificacoesUploads />}

      {/* Tokens */}
      {tab === "tokens" && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
            <strong>Como funciona:</strong> Selecione um cliente, gere um código de acesso e envie para ele por WhatsApp ou e-mail.
            O cliente acessa <strong>/portal</strong>, informa o CPF e o código para entrar na área exclusiva.
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Selecionar Cliente</label>
            <select
              value={clienteSelecionado?.id ?? ""}
              onChange={e => {
                const c = (clientes as any[]).find(x => x.id === Number(e.target.value));
                setClienteSelecionado(c ? { id: c.id, nome: c.nome } : null);
              }}
              className="w-full max-w-md border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E6EB5]"
            >
              <option value="">— Selecione um cliente —</option>
              {(clientes as any[]).map(c => (
                <option key={c.id} value={c.id}>{c.nome} {c.cpf ? `· ${c.cpf}` : ""}</option>
              ))}
            </select>
          </div>
          {clienteSelecionado && (
            <TokenGenerator clienteId={clienteSelecionado.id} nomeCliente={clienteSelecionado.nome} />
          )}
        </div>
      )}

      {/* Chat */}
      {tab === "chat" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Selecionar Cliente</label>
            <select
              value={clienteSelecionado?.id ?? ""}
              onChange={e => {
                const c = (clientes as any[]).find(x => x.id === Number(e.target.value));
                setClienteSelecionado(c ? { id: c.id, nome: c.nome } : null);
              }}
              className="w-full max-w-md border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E6EB5]"
            >
              <option value="">— Selecione um cliente —</option>
              {(clientes as any[]).map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>
          {clienteSelecionado && (
            <ChatCliente clienteId={clienteSelecionado.id} nomeCliente={clienteSelecionado.nome} />
          )}
        </div>
      )}
    </div>
  );
}
