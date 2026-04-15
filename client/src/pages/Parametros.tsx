import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type Aba = "parametros" | "motor_calculo" | "tabela_comercial" | "governanca" | "comissao";

const ABAS: { id: Aba; label: string; icon: string }[] = [
  { id: "parametros",      label: "Parâmetros",       icon: "⚙️" },
  { id: "motor_calculo",   label: "Motor de Cálculo",  icon: "🧮" },
  { id: "tabela_comercial",label: "Tabela Comercial",  icon: "💰" },
  { id: "governanca",      label: "Governança",        icon: "📋" },
  { id: "comissao",        label: "Comissões",         icon: "🤝" },
];

// Mapeamento de chave → categoria
const CHAVE_CATEGORIA: Record<string, Aba> = {
  ano_base_irpf: "parametros",
  nome_escritorio: "parametros",
  faixa_essencial_valor: "tabela_comercial",
  faixa_completo_valor: "tabela_comercial",
  faixa_avancado_valor: "tabela_comercial",
  faixa_estrategico_valor: "tabela_comercial",
  adicional_imovel_extra: "motor_calculo",
  adicional_dependente: "motor_calculo",
  adicional_desp_medicas: "motor_calculo",
  adicional_desp_educacao: "motor_calculo",
  adicional_previd_privada: "motor_calculo",
  adicional_pensao: "motor_calculo",
  adicional_heranca: "motor_calculo",
  adicional_socio_empresa: "motor_calculo",
  adicional_pro_labore: "motor_calculo",
  adicional_distribuicao_lucros: "motor_calculo",
  adicional_cripto: "motor_calculo",
  adicional_exterior: "motor_calculo",
  adicional_renda_variavel: "motor_calculo",
  adicional_retificacao_pct: "motor_calculo",
  urgencia_7dias_mult: "motor_calculo",
  urgencia_3dias_mult: "motor_calculo",
  urgencia_24h_mult: "motor_calculo",
  desconto_maximo_pct: "governanca",
  desconto_maximo_valor: "governanca",
  proposta_validade_dias: "governanca",
  comissao_contador_por_dirpf: "comissao",
  comissao_assistente_por_dirpf: "comissao",
};

const LABEL_MAP: Record<string, string> = {
  ano_base_irpf: "Ano Base IRPF",
  nome_escritorio: "Nome do Escritório",
  faixa_essencial_valor: "Faixa Essencial (R$)",
  faixa_completo_valor: "Faixa Completo (R$)",
  faixa_avancado_valor: "Faixa Avançado (R$)",
  faixa_estrategico_valor: "Faixa Estratégico (R$)",
  adicional_imovel_extra: "Imóvel extra (R$)",
  adicional_dependente: "Por dependente (R$)",
  adicional_desp_medicas: "Despesas médicas (R$)",
  adicional_desp_educacao: "Despesas educação (R$)",
  adicional_previd_privada: "Previdência privada (R$)",
  adicional_pensao: "Pensão alimentícia (R$)",
  adicional_heranca: "Herança/doação (R$)",
  adicional_socio_empresa: "Por empresa (sócio) (R$)",
  adicional_pro_labore: "Pró-labore (R$)",
  adicional_distribuicao_lucros: "Distribuição de lucros (R$)",
  adicional_cripto: "Criptoativos (R$)",
  adicional_exterior: "Rendimentos exterior (R$)",
  adicional_renda_variavel: "Renda variável (R$)",
  adicional_retificacao_pct: "Retificação — % do valor da faixa por ano",
  urgencia_7dias_mult: "Multiplicador urgência 7 dias",
  urgencia_3dias_mult: "Multiplicador urgência 3 dias",
  urgencia_24h_mult: "Multiplicador urgência 24 horas",
  desconto_maximo_pct: "Desconto máximo em % permitido",
  desconto_maximo_valor: "Desconto máximo em valor fixo (R$)",
  proposta_validade_dias: "Validade padrão de proposta (dias)",
  comissao_contador_por_dirpf: "Comissão do Contador por DIRPF concluída (R$)",
  comissao_assistente_por_dirpf: "Comissão do Assistente por DIRPF concluída (R$)",
};

function ParametroField({
  chave, valor, descricao, onSave,
}: { chave: string; valor: string; descricao?: string; onSave: (chave: string, valor: string) => Promise<void> }) {
  const [editando, setEditando] = useState(false);
  const [val, setVal] = useState(valor);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setVal(valor); }, [valor]);

  const handleSave = async () => {
    setSaving(true);
    try { await onSave(chave, val); setEditando(false); }
    finally { setSaving(false); }
  };

  const label = LABEL_MAP[chave] || chave;

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#0D1B3E] truncate">{label}</p>
        {descricao && <p className="text-xs text-gray-400 mt-0.5 truncate">{descricao}</p>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {editando ? (
          <>
            <input
              value={val}
              onChange={e => setVal(e.target.value)}
              className="w-32 px-2 py-1 border border-[#2E6EB5] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6EB5]"
              autoFocus
              onKeyDown={e => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") { setVal(valor); setEditando(false); } }}
            />
            <button onClick={handleSave} disabled={saving}
              className="px-3 py-1 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700 disabled:opacity-50">
              {saving ? "..." : "✓"}
            </button>
            <button onClick={() => { setVal(valor); setEditando(false); }}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs font-semibold hover:bg-gray-300">
              ✕
            </button>
          </>
        ) : (
          <>
            <span className="text-sm font-bold text-[#2E6EB5] bg-blue-50 px-3 py-1 rounded">{valor}</span>
            <button onClick={() => setEditando(true)}
              className="px-3 py-1 border border-gray-200 text-gray-600 rounded text-xs font-semibold hover:bg-gray-50 hover:border-gray-300">
              Editar
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function ParametrosPage() {
  const [aba, setAba] = useState<Aba>("parametros");
  const parametrosQuery = trpc.parametros.listar.useQuery();
  const atualizarMutation = trpc.parametros.atualizar.useMutation();
  const seedMutation = trpc.parametros.seed.useMutation();
  const utils = trpc.useUtils();

  const params = parametrosQuery.data ?? [];

  const handleSave = async (chave: string, valor: string) => {
    try {
      await atualizarMutation.mutateAsync({ chave, valor });
      utils.parametros.listar.invalidate();
      toast.success("Parâmetro atualizado com sucesso!");
    } catch (err: any) { toast.error(err?.message || "Erro ao salvar."); }
  };

  const handleSeed = async () => {
    try {
      await seedMutation.mutateAsync();
      utils.parametros.listar.invalidate();
      toast.success("Parâmetros padrão carregados com sucesso!");
    } catch (err: any) { toast.error(err?.message || "Erro ao carregar padrões."); }
  };

  // Filtrar por aba
  const paramsDaAba = params.filter(p => {
    const cat = CHAVE_CATEGORIA[p.chave];
    return cat === aba;
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1B3E]">Parâmetros do Sistema</h1>
          <p className="text-sm text-gray-500 mt-1">Configure planos, valores, motor de cálculo e regras de governança.</p>
        </div>
        {params.length === 0 && (
          <button onClick={handleSeed} disabled={seedMutation.isPending}
            className="px-4 py-2 bg-[#2E6EB5] text-white rounded-lg font-semibold hover:bg-[#1B5FA0] transition-colors shadow-sm disabled:opacity-50">
            {seedMutation.isPending ? "Carregando..." : "⚡ Carregar Valores Padrão"}
          </button>
        )}
      </div>

      {/* Aviso de acesso */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <span className="text-2xl">🔐</span>
        <div>
          <p className="text-sm font-semibold text-amber-900">Área Restrita ao Administrador</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Alterações nesta área afetam diretamente o cálculo de honorários, propostas e comissões.
            Toda edição é registrada com o nome do usuário responsável.
          </p>
        </div>
      </div>

      {/* Abas */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {ABAS.map(a => (
          <button key={a.id} onClick={() => setAba(a.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
              aba === a.id ? "bg-white text-[#0D1B3E] shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}>
            <span>{a.icon}</span> {a.label}
          </button>
        ))}
      </div>

      {/* Conteúdo da aba */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {parametrosQuery.isLoading ? (
          <div className="text-center py-8 text-gray-400">Carregando parâmetros...</div>
        ) : params.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-gray-500 font-semibold">Nenhum parâmetro configurado ainda.</p>
            <p className="text-sm text-gray-400 mt-1">Clique em "Carregar Valores Padrão" para inicializar com os valores da planilha IRPF 2026.</p>
          </div>
        ) : paramsDaAba.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-3xl mb-2">🔍</p>
            <p className="text-sm">Nenhum parâmetro nesta categoria ainda.</p>
          </div>
        ) : (
          <div>
            {aba === "tabela_comercial" && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs font-semibold text-blue-800">💡 Dica: Os valores base de cada faixa são usados diretamente no cálculo de honorários.</p>
                <p className="text-xs text-blue-600 mt-1">Alterar esses valores afeta todos os cálculos futuros. Cálculos já salvos não são alterados.</p>
              </div>
            )}
            {aba === "comissao" && (
              <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-100">
                <p className="text-xs font-semibold text-green-800">💡 Comissão por DIRPF concluída: valor pago ao colaborador a cada declaração finalizada (status "Feito").</p>
              </div>
            )}
            {aba === "governanca" && (
              <div className="mb-4 p-4 bg-orange-50 rounded-lg border border-orange-100">
                <p className="text-xs font-semibold text-orange-800">⚠️ Regras de Governança: definem os limites máximos de desconto e validade de propostas.</p>
              </div>
            )}
            {paramsDaAba.map(p => (
              <ParametroField key={p.chave} chave={p.chave} valor={p.valor} descricao={p.descricao ?? undefined} onSave={handleSave} />
            ))}
          </div>
        )}
      </div>

      {params.length > 0 && (
        <div className="text-xs text-gray-400 text-right">
          {params.length} parâmetros configurados · Última atualização registrada por: {params[0]?.atualizadoPor ?? "—"}
        </div>
      )}
    </div>
  );
}
