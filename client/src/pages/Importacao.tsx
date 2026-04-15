import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import * as XLSX from "xlsx";

type RegistroImport = {
  nome: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  responsavel?: string;
  observacoes?: string;
};

type ResultadoImport = {
  nome: string;
  status: "importado" | "duplicado" | "erro";
  motivo?: string;
};

const LAYOUT_COLUNAS = [
  { col: "A", campo: "nome", obrigatorio: true, desc: "Nome completo do cliente" },
  { col: "B", campo: "cpf", obrigatorio: false, desc: "CPF (com ou sem formatação)" },
  { col: "C", campo: "email", obrigatorio: false, desc: "E-mail do cliente" },
  { col: "D", campo: "telefone", obrigatorio: false, desc: "Telefone / WhatsApp" },
  { col: "E", campo: "responsavel", obrigatorio: false, desc: "Contador/Assistente responsável" },
  { col: "F", campo: "observacoes", obrigatorio: false, desc: "Observações gerais" },
];

function baixarModeloPlanilha() {
  const wb = XLSX.utils.book_new();
  const dados = [
    ["nome", "cpf", "email", "telefone", "responsavel", "observacoes"],
    ["João da Silva", "123.456.789-00", "joao@email.com", "(85) 99999-0001", "Joel Marx", "Cliente antigo"],
    ["Maria Souza", "987.654.321-00", "maria@email.com", "(85) 98888-0002", "Joel Marx", ""],
  ];
  const ws = XLSX.utils.aoa_to_sheet(dados);
  ws["!cols"] = [{ wch: 30 }, { wch: 18 }, { wch: 30 }, { wch: 18 }, { wch: 20 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, ws, "Clientes");
  XLSX.writeFile(wb, "modelo_importacao_clientes.xlsx");
}

export default function ImportacaoPage() {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<RegistroImport[]>([]);
  const [errosValidacao, setErrosValidacao] = useState<string[]>([]);
  const [resultado, setResultado] = useState<{ importados: number; duplicados: number; erros: number; resultados: ResultadoImport[] } | null>(null);
  const [step, setStep] = useState<"upload" | "preview" | "resultado">("upload");
  const inputRef = useRef<HTMLInputElement>(null);

  const importarMutation = trpc.importacao.clientes.useMutation();
  const utils = trpc.useUtils();

  const processarArquivo = (file: File) => {
    setArquivo(file);
    setErrosValidacao([]);
    setPreview([]);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
        if (rows.length < 2) { setErrosValidacao(["A planilha está vazia ou sem dados além do cabeçalho."]); return; }
        // Detectar se primeira linha é cabeçalho
        const primeiraLinha = rows[0];
        const temCabecalho = typeof primeiraLinha[0] === "string" && primeiraLinha[0].toLowerCase().includes("nome");
        const dataRows = temCabecalho ? rows.slice(1) : rows;
        const erros: string[] = [];
        const registros: RegistroImport[] = [];
        dataRows.forEach((row, idx) => {
          const linha = idx + (temCabecalho ? 2 : 1);
          const nome = String(row[0] ?? "").trim();
          if (!nome) { erros.push(`Linha ${linha}: campo "nome" é obrigatório.`); return; }
          registros.push({
            nome,
            cpf: String(row[1] ?? "").trim() || undefined,
            email: String(row[2] ?? "").trim() || undefined,
            telefone: String(row[3] ?? "").trim() || undefined,
            responsavel: String(row[4] ?? "").trim() || undefined,
            observacoes: String(row[5] ?? "").trim() || undefined,
          });
        });
        setErrosValidacao(erros);
        setPreview(registros);
        if (registros.length > 0) setStep("preview");
      } catch (err) { setErrosValidacao(["Erro ao ler o arquivo. Certifique-se de usar .xlsx ou .csv."]); }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) processarArquivo(file);
  };

  const handleImportar = async () => {
    if (preview.length === 0) return;
    try {
      const res = await importarMutation.mutateAsync({ registros: preview });
      setResultado(res);
      setStep("resultado");
      utils.clientes.listar.invalidate();
      if (res.importados > 0) toast.success(`${res.importados} cliente(s) importado(s) com sucesso!`);
      if (res.duplicados > 0) toast.warning(`${res.duplicados} registro(s) duplicado(s) ignorado(s).`);
      if (res.erros > 0) toast.error(`${res.erros} registro(s) com erro.`);
    } catch (err: any) { toast.error(err?.message || "Erro na importação."); }
  };

  const resetar = () => {
    setArquivo(null); setPreview([]); setErrosValidacao([]); setResultado(null); setStep("upload");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1B3E]">Importação em Lote de Clientes</h1>
          <p className="text-sm text-gray-500 mt-1">Importe múltiplos clientes de uma planilha Excel ou CSV.</p>
        </div>
        <button onClick={baixarModeloPlanilha}
          className="px-4 py-2 border border-[#2E6EB5] text-[#2E6EB5] rounded-lg font-semibold hover:bg-blue-50 transition-colors text-sm">
          ⬇️ Baixar Modelo (.xlsx)
        </button>
      </div>

      {/* Passos */}
      <div className="flex items-center gap-2 text-xs font-semibold">
        {["upload", "preview", "resultado"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === s ? "bg-[#2E6EB5] text-white" : i < ["upload","preview","resultado"].indexOf(step) ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
              {i < ["upload","preview","resultado"].indexOf(step) ? "✓" : i + 1}
            </div>
            <span className={step === s ? "text-[#0D1B3E]" : "text-gray-400"}>
              {s === "upload" ? "Selecionar Arquivo" : s === "preview" ? "Revisar Dados" : "Resultado"}
            </span>
            {i < 2 && <span className="text-gray-300">→</span>}
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === "upload" && (
        <div className="space-y-4">
          {/* Layout da planilha */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-[#0D1B3E] mb-3">📋 Layout da Planilha</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-[#0D1B3E] text-white">
                  <tr>
                    <th className="px-3 py-2 text-left">Coluna</th>
                    <th className="px-3 py-2 text-left">Campo</th>
                    <th className="px-3 py-2 text-left">Obrigatório</th>
                    <th className="px-3 py-2 text-left">Descrição</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {LAYOUT_COLUNAS.map(c => (
                    <tr key={c.col} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-bold text-[#2E6EB5]">{c.col}</td>
                      <td className="px-3 py-2 font-mono">{c.campo}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${c.obrigatorio ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>
                          {c.obrigatorio ? "Sim" : "Não"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-600">{c.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Área de drop */}
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-[#2E6EB5] rounded-xl p-10 text-center cursor-pointer hover:bg-blue-50 transition-colors"
          >
            <p className="text-4xl mb-3">📂</p>
            <p className="font-bold text-[#0D1B3E]">Arraste o arquivo aqui ou clique para selecionar</p>
            <p className="text-sm text-gray-500 mt-1">Formatos aceitos: .xlsx, .xls, .csv</p>
            <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) processarArquivo(f); }} />
          </div>

          {errosValidacao.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="font-bold text-red-800 mb-2">❌ Erros de validação:</p>
              {errosValidacao.map((e, i) => <p key={i} className="text-sm text-red-700">• {e}</p>)}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Preview */}
      {step === "preview" && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-blue-900">{preview.length} registro(s) encontrado(s) em "{arquivo?.name}"</p>
              {errosValidacao.length > 0 && <p className="text-sm text-red-700 mt-1">⚠️ {errosValidacao.length} linha(s) com erro serão ignoradas.</p>}
            </div>
            <button onClick={resetar} className="text-xs text-blue-600 hover:underline">Trocar arquivo</button>
          </div>

          {errosValidacao.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              {errosValidacao.map((e, i) => <p key={i} className="text-xs text-red-700">• {e}</p>)}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-xs">
                <thead className="bg-[#0D1B3E] text-white sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left">#</th>
                    <th className="px-3 py-2 text-left">Nome</th>
                    <th className="px-3 py-2 text-left">CPF</th>
                    <th className="px-3 py-2 text-left">E-mail</th>
                    <th className="px-3 py-2 text-left">Telefone</th>
                    <th className="px-3 py-2 text-left">Responsável</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {preview.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                      <td className="px-3 py-2 font-semibold text-[#0D1B3E]">{r.nome}</td>
                      <td className="px-3 py-2 text-gray-600">{r.cpf || "—"}</td>
                      <td className="px-3 py-2 text-gray-600">{r.email || "—"}</td>
                      <td className="px-3 py-2 text-gray-600">{r.telefone || "—"}</td>
                      <td className="px-3 py-2 text-gray-600">{r.responsavel || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleImportar} disabled={importarMutation.isPending || preview.length === 0}
              className="flex-1 py-3 bg-gradient-to-r from-[#1B5FA0] to-[#2E6EB5] text-white rounded-lg font-bold hover:from-[#0D1B3E] hover:to-[#1B5FA0] transition-all shadow-md disabled:opacity-60">
              {importarMutation.isPending ? "Importando..." : `✅ Importar ${preview.length} Cliente(s)`}
            </button>
            <button onClick={resetar} className="px-6 py-3 border border-gray-200 text-gray-600 rounded-lg font-semibold hover:bg-gray-50">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Resultado */}
      {step === "resultado" && resultado && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-700">{resultado.importados}</p>
              <p className="text-sm font-semibold text-green-800 mt-1">✅ Importados</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-yellow-700">{resultado.duplicados}</p>
              <p className="text-sm font-semibold text-yellow-800 mt-1">⚠️ Duplicados</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-red-700">{resultado.erros}</p>
              <p className="text-sm font-semibold text-red-800 mt-1">❌ Erros</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-xs">
                <thead className="bg-[#0D1B3E] text-white">
                  <tr>
                    <th className="px-3 py-2 text-left">Nome</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Observação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {resultado.resultados.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-semibold text-[#0D1B3E]">{r.nome}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded font-semibold ${
                          r.status === "importado" ? "bg-green-100 text-green-800" :
                          r.status === "duplicado" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {r.status === "importado" ? "✅ Importado" : r.status === "duplicado" ? "⚠️ Duplicado" : "❌ Erro"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-500">{r.motivo || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button onClick={resetar}
            className="w-full py-3 border border-[#2E6EB5] text-[#2E6EB5] rounded-lg font-bold hover:bg-blue-50 transition-colors">
            ↩️ Nova Importação
          </button>
        </div>
      )}
    </div>
  );
}
