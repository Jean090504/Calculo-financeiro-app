import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, Filter } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

export default function Dashboard({ isDark }) {
  const [transactions, setTransactions] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState([format(new Date(), 'yyyy-MM')]);
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);
  
  // 1. ESTADO DE LOADING ADICIONADO AQUI
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setIsLoading(true); // Garante que a tela de loading apareça
    try {
      const response = await api.get('/transactions');
      const data = response.data;
      setTransactions(data);

      const months = [...new Set(data.map(t => format(parseISO(t.date), 'yyyy-MM')))].sort().reverse();
      setAvailableMonths(months);

      const grouped = data.reduce((acc, t) => {
        const month = format(parseISO(t.date), 'MMM/yy', { locale: ptBR });
        if (!acc[month]) acc[month] = { name: month, Ganhos: 0, Gastos: 0, rawMonth: format(parseISO(t.date), 'yyyy-MM') };
        t.type === 'ENTRADA' ? acc[month].Ganhos += t.amount : acc[month].Gastos += t.amount;
        return acc;
      }, {});
      
      setChartData(Object.values(grouped).reverse());
    } catch (error) {
      console.error("Erro ao buscar dados", error);
    } finally {
      // Quando terminar (dando erro ou não), tira a tela de loading.
      // Coloquei um "atrasozinho" de 800ms só pra dar tempo de você ver o efeito visual bonito. 
      // Se não quiser atraso, deixe só setIsLoading(false);
      setTimeout(() => setIsLoading(false), 800); 
    }
  };

  useEffect(() => {
    const filtered = transactions.filter(t => t.type === 'SAIDA' && selectedMonths.includes(format(parseISO(t.date), 'yyyy-MM')));
    const catGrouped = filtered.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
    setPieData(Object.entries(catGrouped).map(([name, value]) => ({ name, value })));
  }, [transactions, selectedMonths]);

  const toggleMonth = (month) => {
    if (selectedMonths.includes(month)) {
      setSelectedMonths(selectedMonths.filter(m => m !== month));
    } else {
      setSelectedMonths([...selectedMonths, month]);
    }
  };

  const filteredForCards = transactions.filter(t => selectedMonths.includes(format(parseISO(t.date), 'yyyy-MM')));
  const income = filteredForCards.filter(t => t.type === 'ENTRADA').reduce((a, b) => a + b.amount, 0);
  const expense = filteredForCards.filter(t => t.type === 'SAIDA').reduce((a, b) => a + b.amount, 0);
  const filteredChartData = chartData.filter(d => selectedMonths.includes(d.rawMonth));

  // 2. A MAGIA ACONTECE AQUI: SE ESTIVER CARREGANDO, RETORNA O SKELETON
  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 pb-10 w-full animate-pulse">
         {/* Skeleton do Filtro */}
         <div className={`h-28 rounded-2xl w-full ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
         
         {/* Skeleton dos Cards */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`h-36 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
            <div className={`h-36 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
            <div className={`h-36 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
         </div>

         {/* Skeleton dos Gráficos */}
         <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className={`h-[400px] rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
            <div className={`h-[400px] rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
         </div>
      </div>
    );
  }

  // SE NÃO ESTIVER CARREGANDO, MOSTRA O SEU DASHBOARD NORMAL
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8 pb-10">
      
      {/* FILTRO */}
      <div className={`p-6 rounded-2xl border transition-all ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <p className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest flex items-center gap-2">
          <Filter size={16}/> Meses Selecionados
        </p>
        <div className="flex gap-3 flex-wrap">
          {availableMonths.map(month => (
            <button key={month} onClick={() => toggleMonth(month)} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${selectedMonths.includes(month) ? 'bg-blue-600 text-white shadow-md' : isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
              {format(parseISO(month + "-01"), 'MMM / yyyy', { locale: ptBR }).toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Ganhos" val={income} color="text-emerald-500" bg="bg-emerald-500/10" icon={<TrendingUp size={24}/>} isDark={isDark} />
        <Card title="Gastos" val={expense} color="text-rose-500" bg="bg-rose-500/10" icon={<TrendingDown size={24}/>} isDark={isDark} />
        <Card title="Saldo" val={income - expense} color="text-blue-500" bg="bg-blue-500/10" icon={<Wallet size={24}/>} isDark={isDark} />
      </div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <ChartContainer title="Distribuição de Gastos" isDark={isDark}>
          <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={90} outerRadius={120} paddingAngle={5} dataKey="value">
                  {pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>

        <ChartContainer title="Comparativo Mensal" isDark={isDark}>
          <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9"} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip cursor={{fill: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc'}} />
                <Bar dataKey="Ganhos" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>
      </div>
    </motion.div>
  );
}

function Card({ title, val, color, bg, icon, isDark }) {
  return (
    <div className={`p-6 md:p-8 rounded-2xl border transition-all hover:-translate-y-1 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
      <div className="flex justify-between items-center mb-6">
        <div className={`p-3 rounded-xl ${bg} ${color}`}>{icon}</div>
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{title}</span>
      </div>
      <div className={`text-3xl lg:text-4xl font-black tracking-tight ${color}`}>
        R$ {val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </div>
    </div>
  );
}

function ChartContainer({ title, children, isDark }) {
    return (
        <div className={`p-6 md:p-8 rounded-2xl border transition-all ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <h3 className="text-sm font-bold mb-6 text-slate-500 uppercase tracking-widest">{title}</h3>
            {children}
        </div>
    );
}