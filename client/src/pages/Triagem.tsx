import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const FAIXA_COLORS: Record<string, string> = {
  essencial: "bg-gray-100 text-gray-800 border-gray-300",
  completo: "bg-blue-100 text-blue-800 border-blue-300",
  avancado: "bg-purple-100 text-purple-800 border-purple-300",
  estrategico: "bg-amber-100 text-amber-800 border-amber-300",
};

const defaultForm = {
  clienteId: undefined as number | undefined,
  possuiCNPJ: false, possuiImoveis: false, qtdImoveis: 0,
  possuiVeiculos: false, possuiInvestimentos: false,
  possuiExterior: false, possuiCripto: false, possuiRendaVariavel: false,
  possuiCarneLeao: false, possuiLivroCaixa: false, possuiAluguel: false,
  possuiPensao: false, possuiHeranca: false, possuiDoacao: false,
  possuiRetificacao: false, anosRetificacao: 0, possuiMalhaFina: false,
  possuiDependentes: false, qtdDependentes: 0,
  possuiDespMedicas: false, possuiDespEducacao: false, possuiPrevidPrivada: false,
  possuiSocioEmpresa: false, qtdEmpresas: 0,
  possuiProLabore: false, possuiDistribuicaoLucros: false,
  urgencia: "normal" as "normal" | "7dias" | "3dias" | "24h",
  descontoTipo: "nenhum" as "nenhum" | "percentual" | "valor",
  descontoValor: 0,
};

export default function TriagemPage() {
  const [form, setForm] = useState(defaultForm);
  const [resultado, setResultado] = useState<any>(null);
  const clientesQuery = trpc.clientes.listar.useQuery();
  const calcularMutation = trpc.triagem.calcular.useMutation();

  const toggle = (field: keyof typeof form) =>
    setForm(p => ({ ...p, [field]: !(p[field as keyof typeof p]) }));
  const setNum = (field: keyof typeof form, v: number) =>
    setForm(p => ({ ...p, [field]: v }));

  const handleCalcular = async (salvar = false) => {
    try {
      const res = await calcularMutation.mutateAsync({
        ...form, salvar, clienteId: form.clienteId,
        descontoTipo: form.descontoTipo,
        descontoValor: form.descontoValor,
      });
      setResultado(res);
      if (salvar) toast.success("Triagem salva e honorários atualizados no cliente!");
    } catch (err: any) { toast.error(err?.message || "Erro ao calcular."); }
  };

  const CheckItem = ({ field, label, children }: { field: keyof typeof form; label: string; children?: React.ReactNode }) => (
    <div
      className={`p-3 rounded-lg border cursor-pointer transition-all ${form[field] ? "bg-blue-50 border-blue-300" : "bg-gray-50 border-gray-200 hover:border-gray-300"}`}
      onClick={() => toggle(field)}
    >
      <div className="flex items-center gap-2">
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${form[field] ? "bg-[#2E6EB5] border-[#2E6EB5]" : "border-gray-300"}`}>
          {form[field] && <span className="text-white text-xs">✓</span>}
        </div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      {form[field] && children && (
        <div className="mt-2 pl-7" onClick={e => e.stopPropagation()}>{children}</div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-[#0D1B3E]">Triagem e Precificação</h1>
        <p className="text-sm text-gray-500 mt-1">Preencha o perfil do cliente para calcular os honorários automaticamente.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Cliente */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-[#0D1B3E] mb-3">👤 Vincular a Cliente (opcional)</h3>
            <select
              value={form.clienteId ?? ""}
              onChange={e => setForm(p => ({ ...p, clienteId: e.target.value ? Number(e.target.value) : undefined }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6EB5]"
            >
              <option value="">Selecione um cliente para salvar...</option>
              {(clientesQuery.data ?? []).map(c => (
                <option key={c.id} value={c.id}>{c.nome}{c.cpf ? ` — ${c.cpf}` : ""}</option>
              ))}
            </select>
          </div>

          {/* Patrimônio */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-[#0D1B3E] mb-3">🏠 Perfil Patrimonial</h3>
            <div className="grid grid-cols-2 gap-2">
              <CheckItem field="possuiImoveis" label="Possui imóveis">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600">Qtd:</label>
                  <input type="number" min={1} value={form.qtdImoveis}
                    onChange={e => setNum("qtdImoveis", Number(e.target.value))}
                    className="w-16 px-2 py-1 border rounded text-xs" />
                </div>
              </CheckItem>
              <CheckItem field="possuiVeiculos" label="Possui veículos" />
              <CheckItem field="possuiInvestimentos" label="Investimentos" />
              <CheckItem field="possuiAluguel" label="Renda de aluguel" />
              <CheckItem field="possuiRendaVariavel" label="Renda variável (Bolsa)" />
              <CheckItem field="possuiCripto" label="Criptoativos" />
              <CheckItem field="possuiExterior" label="Rendimentos no exterior" />
              <CheckItem field="possuiCarneLeao" label="Carnê-leão" />
            </div>
          </div>

          {/* Empresa */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-[#0D1B3E] mb-3">🏢 Vínculo Empresarial</h3>
            <div className="grid grid-cols-2 gap-2">
              <CheckItem field="possuiCNPJ" label="Possui CNPJ" />
              <CheckItem field="possuiSocioEmpresa" label="Sócio de empresa">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600">Qtd empresas:</label>
                  <input type="number" min={1} value={form.qtdEmpresas}
                    onChange={e => setNum("qtdEmpresas", Number(e.target.value))}
                    className="w-16 px-2 py-1 border rounded text-xs" />
                </div>
              </CheckItem>
              <CheckItem field="possuiProLabore" label="Pró-labore" />
              <CheckItem field="possuiDistribuicaoLucros" label="Distribuição de lucros" />
              <CheckItem field="possuiLivroCaixa" label="Livro-caixa" />
            </div>
          </div>

          {/* Deduções */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-[#0D1B3E] mb-3">💊 Deduções e Dependentes</h3>
            <div className="grid grid-cols-2 gap-2">
              <CheckItem field="possuiDependentes" label="Dependentes">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600">Qtd:</label>
                  <input type="number" min={1} value={form.qtdDependentes}
                    onChange={e => setNum("qtdDependentes", Number(e.target.value))}
                    className="w-16 px-2 py-1 border rounded text-xs" />
                </div>
              </CheckItem>
              <CheckItem field="possuiDespMedicas" label="Despesas médicas" />
              <CheckItem field="possuiDespEducacao" label="Despesas educação" />
              <CheckItem field="possuiPrevidPrivada" label="Previdência privada" />
              <CheckItem field="possuiPensao" label="Pensão alimentícia" />
              <CheckItem field="possuiHeranca" label="Herança / Doação" />
            </div>
          </div>

          {/* Situação Especial */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-[#0D1B3E] mb-3">⚠️ Situação Especial</h3>
            <div className="grid grid-cols-2 gap-2">
              <CheckItem field="possuiRetificacao" label="Retificação">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600">Anos:</label>
                  <input type="number" min={1} value={form.anosRetificacao}
                    onChange={e => setNum("anosRetificacao", Number(e.target.value))}
                    className="w-16 px-2 py-1 border rounded text-xs" />
                </div>
              </CheckItem>
              <CheckItem field="possuiMalhaFina" label="⚠️ Malha fina" />
            </div>
          </div>

          {/* Desconto */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-[#0D1B3E] mb-3">🏷️ Desconto (opcional)</h3>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { v: "nenhum", label: "Sem desconto" },
                { v: "percentual", label: "Em % (percentual)" },
                { v: "valor", label: "Em R$ (valor fixo)" },
              ].map(d => (
                <button key={d.v} type="button"
                  onClick={() => setForm(p => ({ ...p, descontoTipo: d.v as any, descontoValor: 0 }))}
                  className={`p-2.5 rounded-lg border text-center transition-all text-sm ${
                    form.descontoTipo === d.v
                      ? "bg-[#2E6EB5] border-[#2E6EB5] text-white font-bold"
                      : "bg-gray-50 border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}>
                  {d.label}
                </button>
              ))}
            </div>
            {form.descontoTipo !== "nenhum" && (
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-gray-700">
                  {form.descontoTipo === "percentual" ? "Desconto em %:" : "Desconto em R$:"}
                </label>
                <input
                  type="number" min={0} max={form.descontoTipo === "percentual" ? 100 : undefined}
                  step={form.descontoTipo === "percentual" ? 1 : 0.01}
                  value={form.descontoValor}
                  onChange={e => setForm(p => ({ ...p, descontoValor: Number(e.target.value) }))}
                  className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6EB5]"
                  placeholder={form.descontoTipo === "percentual" ? "Ex: 10" : "Ex: 50.00"}
                />
                <span className="text-sm text-gray-500">{form.descontoTipo === "percentual" ? "%" : "R$"}</span>
              </div>
            )}
          </div>

          {/* Urgência */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-[#0D1B3E] mb-3">⏱️ Urgência</h3>
            <div className="grid grid-cols-4 gap-2">
              {[
                { v: "normal", label: "Normal", sub: "Sem acréscimo" },
                { v: "7dias", label: "7 dias", sub: "+25%" },
                { v: "3dias", label: "3 dias", sub: "+50%" },
                { v: "24h", label: "24 horas", sub: "+100%" },
              ].map(u => (
                <button key={u.v} type="button"
                  onClick={() => setForm(p => ({ ...p, urgencia: u.v as any }))}
                  className={`p-3 rounded-lg border text-center transition-all ${form.urgencia === u.v ? "bg-[#2E6EB5] border-[#2E6EB5] text-white" : "bg-gray-50 border-gray-200 hover:border-gray-300"}`}>
                  <p className="text-sm font-bold">{u.label}</p>
                  <p className={`text-xs ${form.urgencia === u.v ? "text-blue-100" : "text-gray-500"}`}>{u.sub}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resultado */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 sticky top-4">
            <h3 className="font-bold text-[#0D1B3E] mb-4">💰 Resultado do Cálculo</h3>
            {resultado ? (
              <div className="space-y-3">
                <div className={`p-3 rounded-lg border-2 text-center ${FAIXA_COLORS[resultado.faixaCalculada] || "bg-gray-100"}`}>
                  <p className="text-xs font-semibold uppercase tracking-wide">Faixa Calculada</p>
                  <p className="text-xl font-bold capitalize">{resultado.faixaCalculada}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Honorário base:</span>
                    <span className="font-semibold">R$ {resultado.honorarioBase.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Adicionais:</span>
                    <span className="font-semibold text-blue-700">+ R$ {resultado.totalAdicionais.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                  {resultado.multiplicadorUrgencia > 1 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Urgência:</span>
                      <span className="font-semibold text-orange-600">× {resultado.multiplicadorUrgencia}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-bold text-[#0D1B3E]">Subtotal:</span>
                    <span className="font-bold text-lg text-[#0D1B3E]">R$ {resultado.honorarioFinal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                  {resultado.descontoTipo && resultado.descontoTipo !== "nenhum" && resultado.descontoValor > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-red-600 font-semibold">
                        Desconto ({resultado.descontoTipo === "percentual" ? `${resultado.descontoValor}%` : `R$ ${Number(resultado.descontoValor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}):
                      </span>
                      <span className="font-bold text-red-600">
                        - R$ {(resultado.honorarioFinal - resultado.honorarioComDesconto).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  {resultado.descontoTipo && resultado.descontoTipo !== "nenhum" && resultado.descontoValor > 0 && (
                    <div className="border-t pt-2 flex justify-between">
                      <span className="font-bold text-green-800">Total com Desconto:</span>
                      <span className="font-bold text-xl text-green-700">R$ {resultado.honorarioComDesconto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {(!resultado.descontoTipo || resultado.descontoTipo === "nenhum" || !resultado.descontoValor) && (
                    <div className="border-t pt-2 flex justify-between">
                      <span className="font-bold text-green-800">Total Final:</span>
                      <span className="font-bold text-xl text-green-700">R$ {resultado.honorarioFinal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                </div>
                {resultado.itensAdicionais?.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Itens adicionais:</p>
                    {resultado.itensAdicionais.map((item: string, i: number) => (
                      <p key={i} className="text-xs text-gray-600">• {item}</p>
                    ))}
                  </div>
                )}
                {resultado.requerOrcamentoManual && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-xs font-bold text-red-700">⚠️ ORÇAMENTO MANUAL NECESSÁRIO</p>
                    <p className="text-xs text-red-600 mt-1">{resultado.observacoesCalculo}</p>
                  </div>
                )}
                {form.clienteId && (
                  <button onClick={() => handleCalcular(true)}
                    className="w-full py-2.5 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors">
                    💾 Salvar no Cliente
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p className="text-4xl mb-2">🧮</p>
                <p className="text-sm">Preencha o formulário e clique em Calcular</p>
              </div>
            )}
            <button onClick={() => handleCalcular(false)} disabled={calcularMutation.isPending}
              className="w-full mt-4 py-3 bg-gradient-to-r from-[#1B5FA0] to-[#2E6EB5] text-white rounded-lg font-bold hover:from-[#0D1B3E] hover:to-[#1B5FA0] transition-all shadow-md disabled:opacity-60">
              {calcularMutation.isPending ? "Calculando..." : "🧮 Calcular Honorários"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
