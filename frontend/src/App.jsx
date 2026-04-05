import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Moon, Sun, LayoutDashboard, ReceiptText, Wallet, Bell } from "lucide-react";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";

export default function App() {
  const [isDark, setIsDark] = useState(localStorage.getItem("theme") === "dark");

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <Router>
      <div className={`flex h-screen w-full overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#0a0f18] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
        <Toaster position="top-right" />
        
        {/* SIDEBAR TRAVADA COM LARGURA FIXA */}
        <aside className={`w-64 min-w-[16rem] max-w-[16rem] h-full flex flex-col justify-between border-r p-6 z-10 transition-colors ${
          isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-xl'
        }`}>
          <div>
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md shadow-blue-500/20">
                  <Wallet size={20} strokeWidth={2.5}/>
                </div>
                <h1 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  FINANCIAS CONTROLE<span className="text-blue-600">🐧</span>
                </h1>
            </div>
            
            <nav className="space-y-2">
              <SidebarLink to="/" icon={<LayoutDashboard size={18}/>} label="Dashboard" isDark={isDark} />
              <SidebarLink to="/transactions" icon={<ReceiptText size={18}/>} label="Registros" isDark={isDark} />
            </nav>
          </div>

          <button 
            onClick={() => setIsDark(!isDark)}
            className={`flex items-center justify-center gap-3 p-3 rounded-xl transition-all border font-bold text-xs uppercase tracking-widest ${
              isDark ? 'bg-slate-800 border-white/10 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-blue-600 hover:bg-slate-200'
            }`}
          >
            {isDark ? <><Sun size={16}/> LIGHT</> : <><Moon size={16}/> DARK</>}
          </button>
        </aside>

        {/* ÁREA DE CONTEÚDO PRINCIPAL */}
        <main className="flex-1 h-full overflow-y-auto p-8 relative">
          <div className="max-w-6xl mx-auto space-y-8">
            <header className="flex justify-between items-center border-b pb-6 border-slate-200 dark:border-slate-800">
                <div>
                   <h2 className="text-3xl font-black tracking-tight">Olá, Larissa Felix!</h2>
                   <p className="text-slate-500 text-sm font-medium mt-1">Seu balanço financeiro está pronto.</p>
                </div>
                <button className={`p-3 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                   <Bell size={20} className="text-slate-400" />
                </button>
            </header>
            <Routes>
                <Route path="/" element={<Dashboard isDark={isDark} />} />
                <Route path="/transactions" element={<Transactions isDark={isDark} />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

function SidebarLink({ to, icon, label, isDark }) {
    const location = useLocation();
    const isActive = location.pathname === to;
    return (
        <Link to={to} className={`flex items-center gap-4 p-3 rounded-xl transition-all font-bold text-sm ${
            isActive 
            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
            : isDark ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-blue-600'
        }`}>
            {icon} {label}
        </Link>
    );
}