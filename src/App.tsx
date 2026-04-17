/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Download, 
  Printer, 
  PlusCircle, 
  Package, 
  Wrench, 
  FileText, 
  User, 
  Mail, 
  MapPin, 
  Calendar,
  Save,
  RotateCcw,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Types
type ItemType = 'product' | 'service';

interface BudgetItem {
  id: string;
  type: ItemType;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface ClientInfo {
  name: string;
  email: string;
  address: string;
  phone: string;
}

export default function App() {
  // State
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [client, setClient] = useState<ClientInfo>({
    name: '',
    email: '',
    address: '',
    phone: '',
  });
  const [budgetNumber, setBudgetNumber] = useState(`ORC-${Math.floor(Math.random() * 9000) + 1000}`);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [notes, setNotes] = useState('Válido por 10 dias. Pagamento em até 3x sem juros.');
  const [isEditingClient, setIsEditingClient] = useState(true);
  const [activeTab, setActiveTab] = useState('Orçamentos');
  const [validityDate, setValidityDate] = useState(format(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));

  // New Item Temporary State
  const [newItem, setNewItem] = useState<Omit<BudgetItem, 'id'>>({
    type: 'product',
    description: '',
    quantity: 1,
    unitPrice: 0,
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('orca-expert-last-budget');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setItems(data.items || []);
        setClient(data.client || { name: '', email: '', address: '', phone: '' });
        setNotes(data.notes || '');
        setDiscount(data.discount || 0);
        setTax(data.tax || 0);
        if (data.validityDate) setValidityDate(data.validityDate);
      } catch (e) {
        console.error('Failed to load budget', e);
      }
    }
  }, []);

  // Save to localStorage
  const saveBudget = () => {
    const data = { items, client, notes, discount, tax, validityDate };
    localStorage.setItem('orca-expert-last-budget', JSON.stringify(data));
    alert('Orçamento salvo localmente!');
  };

  const addItem = () => {
    if (!newItem.description || newItem.unitPrice <= 0) return;
    
    const item: BudgetItem = {
      ...newItem,
      id: crypto.randomUUID(),
    };
    
    setItems([...items, item]);
    setNewItem({
      ...newItem,
      description: '',
      quantity: 1,
      unitPrice: 0,
    });
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const clearAll = () => {
    if (confirm('Tem certeza que deseja limpar todo o orçamento?')) {
      setItems([]);
      setClient({ name: '', email: '', address: '', phone: '' });
      setDiscount(0);
      setTax(0);
      setBudgetNumber(`ORC-${Math.floor(Math.random() * 9000) + 1000}`);
    }
  };

  // Calculations
  const subtotal = useMemo(() => 
    items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0), 
  [items]);

  const total = useMemo(() => 
    (subtotal - discount) + tax, 
  [subtotal, discount, tax]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const navItems = ['Dashboard', 'Orçamentos', 'Clientes', 'Serviços', 'Configurações'];

  return (
    <div className="flex min-h-screen bg-[#f4f7fa] text-[#334155] font-sans">
      {/* Sidebar - Desktop Only */}
      <aside className="w-60 bg-[#1e293b] text-white flex flex-col py-8 shrink-0 print:hidden sticky top-0 h-screen">
        <div className="px-8 pb-10 text-2xl font-bold tracking-tighter text-[#3b82f6] flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Budgetly.
        </div>
        
        <nav className="flex flex-col">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => setActiveTab(item)}
              className={cn(
                "px-8 py-4 text-sm font-medium flex items-center gap-3 transition-colors border-l-4",
                activeTab === item 
                  ? "bg-white/5 text-white border-[#3b82f6]" 
                  : "text-slate-400 border-transparent hover:text-white hover:bg-white/5"
              )}
            >
              <div className={cn("w-1.5 h-1.5 rounded-full", activeTab === item ? "bg-[#3b82f6]" : "bg-transparent")} />
              {item}
            </button>
          ))}
        </nav>

        <div className="mt-auto px-8 py-6">
          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold">WR</div>
            <div className="truncate">
              <p className="text-xs font-bold leading-none mb-1">Wellington</p>
              <p className="text-[10px] text-slate-500 truncate">Pró Plano</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 flex flex-col gap-6 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Novo Orçamento #{budgetNumber.split('-')[1]}</h1>
            <p className="text-slate-400 text-sm mt-1">Criado em {format(new Date(), "dd 'de' MMMM, yyyy", { locale: ptBR })}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="bg-[#fef3c7] text-[#92400e] px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase">
              Rascunho
            </span>
            <button 
              onClick={saveBudget}
              className="px-5 py-2.5 bg-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-300 transition-all border border-slate-300/50 shadow-sm"
            >
              Salvar Cópia
            </button>
            <button 
              onClick={() => window.print()}
              className="px-5 py-2.5 bg-[#3b82f6] text-white rounded-lg text-sm font-semibold hover:bg-[#2563eb] transition-all shadow-md shadow-blue-200"
            >
              Finalizar Orçamento
            </button>
          </div>
        </header>

        {/* Budget Card */}
        <div className="bg-white border border-[#e2e8f0] rounded-[16px] shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex flex-col overflow-hidden">
          
          {/* Client Info Grid */}
          <div className="p-8 md:p-10 grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-8 md:gap-12 border-b border-[#e2e8f0]">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Cliente</label>
              {isEditingClient ? (
                <input 
                  type="text" 
                  value={client.name}
                  onChange={(e) => setClient({...client, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                  placeholder="Nome do Cliente ou Empresa"
                />
              ) : (
                <p className="text-[15px] font-semibold text-slate-700">{client.name || 'Empresa não informada'}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Contato / Email</label>
              {isEditingClient ? (
                <input 
                  type="email" 
                  value={client.email}
                  onChange={(e) => setClient({...client, email: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                  placeholder="contato@exemplo.com"
                />
              ) : (
                <p className="text-[15px] font-semibold text-slate-700">{client.email || '-'}</p>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Validade</label>
                <button 
                  onClick={() => setIsEditingClient(!isEditingClient)}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-tighter print:hidden"
                >
                  {isEditingClient ? 'Confirmar' : 'Alterar'}
                </button>
              </div>
              {isEditingClient ? (
                <input 
                  type="date" 
                  value={validityDate}
                  onChange={(e) => setValidityDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2 text-sm rounded-lg focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              ) : (
                <p className="text-[15px] font-semibold text-slate-700">
                  {format(new Date(validityDate + 'T00:00:00'), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                </p>
              )}
            </div>
          </div>

          {/* Add Item Form - Desktop Inline style from theme */}
          <div className="px-8 md:px-10 py-6 bg-slate-50/50 print:hidden">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[300px] space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Descrição dos itens</label>
                <div className="flex gap-2 p-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                  <select 
                    value={newItem.type}
                    onChange={(e) => setNewItem({...newItem, type: e.target.value as ItemType})}
                    className="bg-slate-100 border-none text-[10px] font-bold uppercase px-2 py-1.5 rounded outline-none cursor-pointer"
                  >
                    <option value="product">P</option>
                    <option value="service">S</option>
                  </select>
                  <input 
                    type="text" 
                    value={newItem.description}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    placeholder="O que está oferecendo?"
                    className="flex-1 bg-transparent border-none text-sm px-2 outline-none"
                  />
                </div>
              </div>
              
              <div className="w-20 space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Qtd</label>
                <input 
                  type="number" 
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({...newItem, quantity: Number(e.target.value)})}
                  className="w-full bg-white border border-slate-200 p-2.5 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                />
              </div>

              <div className="w-32 space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Preço</label>
                <input 
                  type="number" 
                  value={newItem.unitPrice}
                  onChange={(e) => setNewItem({...newItem, unitPrice: Number(e.target.value)})}
                  className="w-full bg-white border border-slate-200 p-2.5 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                />
              </div>

              <button 
                onClick={addItem}
                disabled={!newItem.description || newItem.unitPrice <= 0}
                className="bg-[#3b82f6] text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-[#2563eb] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-blue-100"
              >
                Adicionar
              </button>
            </div>
          </div>

          {/* Budget Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 md:px-10 py-5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-[#e2e8f0]">Descrição</th>
                  <th className="px-5 py-5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-[#e2e8f0]">Tipo</th>
                  <th className="px-5 py-5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-[#e2e8f0] text-center w-20">Qtd</th>
                  <th className="px-5 py-5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-[#e2e8f0] text-right">Unitário</th>
                  <th className="px-8 md:px-10 py-5 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-[#e2e8f0]">Total</th>
                  <th className="px-4 py-5 border-b border-[#e2e8f0] w-12 print:hidden"></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {items.length === 0 ? (
                    <motion.tr 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan={6} className="px-10 py-16 text-center text-slate-300 italic text-sm">
                        Seu orçamento está vazio comercialmente.
                      </td>
                    </motion.tr>
                  ) : (
                    items.map((item) => (
                      <motion.tr 
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="group hover:bg-slate-50 transition-colors border-b border-slate-50"
                      >
                        <td className="px-8 md:px-10 py-5">
                          <p className="text-sm font-medium text-slate-700">{item.description}</p>
                        </td>
                        <td className="px-5 py-5">
                          <span className={cn(
                            "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                            item.type === 'product' ? "bg-[#dcfce7] text-[#166534]" : "bg-[#e0e7ff] text-[#3730a3]"
                          )}>
                            {item.type === 'product' ? 'Produto' : 'Serviço'}
                          </span>
                        </td>
                        <td className="px-5 py-5 text-center text-sm text-slate-500 font-medium">
                          {item.quantity}
                        </td>
                        <td className="px-5 py-5 text-right text-sm text-slate-500 font-medium font-mono">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-8 md:px-10 py-5 text-right text-sm font-bold text-slate-800 font-mono">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </td>
                        <td className="px-4 py-5 text-center print:hidden">
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Summary Section */}
          <div className="p-8 md:p-10 flex flex-col md:flex-row justify-between gap-10 mt-auto">
            <div className="max-w-md w-full">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block mb-3">Notas Gerais</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 outline-none focus:ring-1 focus:ring-slate-300 transition-all min-h-[120px] resize-none print:border-none print:p-0 print:bg-white"
                placeholder="Condições de pagamento..."
              />
            </div>

            <div className="w-full md:w-[320px] flex flex-col gap-3 pt-4">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-slate-400">Subtotal</span>
                <span className="text-slate-700 font-mono">{formatCurrency(subtotal)}</span>
              </div>
              
              <div className="flex justify-between items-center text-sm font-medium">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Desconto</span>
                  <input 
                    type="number" 
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-16 bg-slate-50 border border-slate-200 px-1 py-0.5 rounded text-[10px] text-center outline-none print:hidden"
                    placeholder="%"
                  />
                </div>
                <span className="text-red-500 font-mono">- {formatCurrency(discount)}</span>
              </div>

              <div className="flex justify-between items-center text-sm font-medium">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Impostos</span>
                  <input 
                    type="number" 
                    value={tax}
                    onChange={(e) => setTax(Number(e.target.value))}
                    className="w-16 bg-slate-50 border border-slate-200 px-1 py-0.5 rounded text-[10px] text-center outline-none print:hidden"
                  />
                </div>
                <span className="text-slate-700 font-mono">+ {formatCurrency(tax)}</span>
              </div>

              <div className="mt-4 pt-5 border-t-2 border-[#e2e8f0] flex justify-between items-center">
                <span className="text-lg font-bold text-slate-800 uppercase tracking-tighter">Valor Final</span>
                <span className="text-2xl font-bold text-[#3b82f6] font-mono">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-400 text-[12px] pb-12 print:hidden italic">
          Budgetly v2.1 • © {new Date().getFullYear()} Soluções Digitais
        </p>
      </main>

      {/* Print Overrides */}
      <style>{`
        @media print {
          body { background-color: white !important; }
          aside { display: none !important; }
          main { padding: 0 !important; overflow: visible !important; width: 100% !important; height: auto !important; position: static !important; }
          .bg-white { box-shadow: none !important; border: 1px solid #e2e8f0 !important; border-radius: 0 !important; }
          .rounded-[16px] { border-radius: 0 !important; }
        }
      `}</style>
    </div>
  );
}


