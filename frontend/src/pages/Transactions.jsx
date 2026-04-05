import { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PlusCircle, Trash2, Download, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORIES = ['Alimentação', 'Lazer', 'Trabalho', 'Transporte', 'Saúde', 'Educação', 'Outros'];

export default function Transactions({ isDark }) {
  const [transactions, setTransactions] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState([format(new Date(), 'yyyy-MM')]);
  const [form, setForm] = useState({ description: '', amount: '', type: 'ENTRADA', date: '', category: 'Outros', isAtypical: false });

  useEffect(() => { loadTransactions(); }, []);

  const loadTransactions = async () => {
    try {
      const res = await api.get('/transactions');
      setTransactions(res.data);
      const months = [...new Set(res.data.map(t => format(parseISO(t.date), 'yyyy-MM')))].sort().reverse();
      setAvailableMonths(months);
    } catch (err) { toast.error("Erro ao carregar dados."); }
  };

  const filteredTransactions = transactions.filter(t => selectedMonths.includes(format(parseISO(t.date), 'yyyy-MM')));

  const toggleMonth = (month) => {
    if (selectedMonths.includes(month)) {
      setSelectedMonths(selectedMonths.filter(m => m !== month));
    } else {
      setSelectedMonths([...selectedMonths, month]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/transactions', { ...form, amount: parseFloat(form.amount) });
      toast.success('Lançamento realizado!');
      setForm({ description: '', amount: '', type: 'ENTRADA', date: '', category: 'Outros', isAtypical: false });
      loadTransactions();
    } catch (error) { toast.error('Erro ao salvar.'); }
  };

  const handleDelete = async (id) => {
    if (confirm('Deseja excluir este registro?')) {
      await api.delete(`/transactions/${id}`);
      toast.success('Excluído!');
      loadTransactions();
    }
  };

  const exportToCSV = () => {
    const headers = ["Data;Descrição;Categoria;Valor;Tipo;Atípico\n"];
    const rows = filteredTransactions.map(t => `${new Date(t.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})};${t.description};${t.category};${t.amount.toFixed(2)};${t.type};${t.isAtypical ? 'SIM' : 'NÃO'}\n`);
    const blob = new Blob(["\ufeff" + headers + rows.join("")], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Relatorio_Export.csv`;
    link.click();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8 pb-10">
      <header className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-black tracking-tight">Lançamentos</h1>
        <button onClick={exportToCSV} className="flex items-center gap-2 bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-600 transition shadow-md text-xs uppercase tracking-widest">
          <Download size={16}/> Exportar
        </button>
      </header>

      {/* FILTRO DE MESES RESTAURADO AQUI! */}
      <div className={`p-6 rounded-2xl border transition-all ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <p className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest flex items-center gap-2">
          <Filter size={16}/> Filtrar Registros por Mês
        </p>
        <div className="flex gap-3 flex-wrap">
          {availableMonths.map(month => (
            <button key={month} onClick={() => toggleMonth(month)} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${selectedMonths.includes(month) ? 'bg-blue-600 text-white shadow-md' : isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
              {format(parseISO(month + "-01"), 'MMM / yyyy', { locale: ptBR }).toUpperCase()}
            </button>
          ))}
          {availableMonths.length === 0 && <span className="text-slate-400 text-xs italic">Nenhum registro antigo encontrado.</span>}
        </div>
      </div>

      {/* FORMULÁRIO */}
      <form onSubmit={handleSubmit} className={`p-6 md:p-8 rounded-2xl shadow-lg border-t-4 border-blue-600 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="flex flex-col gap-2 lg:col-span-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Descrição</label>
                <input required className={`w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Valor (R$)</label>
                <input required type="number" step="0.01" className={`w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} />
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tipo</label>
                <select className={`w-full border p-3 rounded-xl outline-none font-semibold ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} value={form.type} onChange={(e) => setForm({...form, type: e.target.value})}>
                    <option value="ENTRADA">Entrada (+)</option>
                    <option value="SAIDA">Saída (-)</option>
                </select>
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Categoria</label>
                <select className={`w-full border p-3 rounded-xl outline-none font-semibold ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Data</label>
                <input required type="date" className={`w-full border p-3 rounded-xl outline-none font-semibold ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} />
            </div>
        </div>
        
        <div className="mt-8 flex flex-col sm:flex-row gap-6 items-center justify-between border-t pt-6 border-slate-100 dark:border-slate-800">
            <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 rounded border-2 text-blue-600 focus:ring-blue-500" checked={form.isAtypical} onChange={(e) => setForm({...form, isAtypical: e.target.checked})} />
                <span className="font-bold text-slate-500 text-sm uppercase tracking-wide hover:text-blue-500 transition">Gasto Atípico 🐧</span>
            </label>
            <button type="submit" className="w-full sm:w-auto bg-blue-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-600/30 uppercase text-xs tracking-widest flex items-center justify-center gap-2">
              <PlusCircle size={18}/> Salvar Registro
            </button>
        </div>
      </form>

      {/* TABELA DE REGISTROS */}
      <div className={`rounded-2xl border shadow-sm overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className={isDark ? 'bg-slate-800/50' : 'bg-slate-50'}>
              <tr>
                <th className="p-5 text-slate-400 font-bold text-[10px] uppercase tracking-widest border-b dark:border-slate-800">Data</th>
                <th className="p-5 text-slate-400 font-bold text-[10px] uppercase tracking-widest border-b dark:border-slate-800">Descrição / Categoria</th>
                <th className="p-5 text-slate-400 font-bold text-[10px] uppercase tracking-widest border-b dark:border-slate-800">Valor</th>
                <th className="p-5 text-center text-slate-400 font-bold text-[10px] uppercase tracking-widest border-b dark:border-slate-800">Ações</th>
              </tr>
            </thead>
           <tbody className={`divide-y-2 ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
            {filteredTransactions.map((t) => (
              <tr key={t.id} className="hover:bg-blue-600/[0.03] transition-all">
                <td className="p-10 text-lg font-black text-slate-400">{new Date(t.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                <td className="p-10">
                    <div className="flex items-center gap-5">
                        {/* CORREÇÃO: Adicionamos a cor do texto para o claro e escuro aqui */}
                        <span className={`font-black text-1xl tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            {t.description}
                        </span>
                        {t.isAtypical && <span className="animate-bounce text-2xl">🐧</span>}
                    </div>
                    <div className="text-xs font-black text-blue-500 uppercase mt-4 bg-blue-600/10 inline-block px-5 py-2 rounded-xl tracking-[0.2em]">{t.category}</div>
                </td>
                <td className={`p-10 font-black text-2xl tracking-tighter ${t.type === 'ENTRADA' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {t.type === 'ENTRADA' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                </td>
                <td className="p-10 text-center">
                  {/* CORREÇÃO: Ajuste na cor da lixeira para dar contraste no modo claro */}
                  <button onClick={() => handleDelete(t.id)} className={`p-6 transition rounded-[2rem] border-2 border-transparent hover:bg-rose-500/10 hover:border-rose-500/20 ${isDark ? 'text-slate-500 hover:text-rose-400' : 'text-slate-300 hover:text-rose-500'}`}>
                      <Trash2 size={32}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}