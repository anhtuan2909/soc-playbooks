'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Shield, AlertTriangle, PlusCircle } from 'lucide-react';

export default function DashboardClient({ initialPlaybooks }: { initialPlaybooks: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Logic lọc dữ liệu ngay lập tức (Real-time Search)
  const filteredPlaybooks = initialPlaybooks.filter((pb) => {
    const term = searchTerm.toLowerCase();
    return (
      pb.title.toLowerCase().includes(term) ||
      pb.playbookId.toLowerCase().includes(term) ||
      pb.scenario.toLowerCase().includes(term) ||
      (pb.mitre && pb.mitre.toLowerCase().includes(term)) ||
      (pb.detection && pb.detection.toLowerCase().includes(term))
    );
  });

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header: BAO GỒM CẢ NÚT NEW PLAYBOOK */}
        <header className="mb-10 border-b border-slate-800 pb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-blue-500 flex items-center gap-3">
              <Shield className="w-8 h-8" /> SOC Incident Response Portal
            </h1>
            <p className="text-slate-400 mt-2 text-sm">Knowledge Base for SOC Team</p>
          </div>
          
          <div className="flex gap-4 items-end">
             {/* Nút thêm mới vẫn ở đây */}
             <Link href="/playbook/new" className="flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold transition shadow-md border border-green-600">
                <PlusCircle size={20}/> New Playbook
             </Link>
             
             <div className="bg-slate-900 px-4 py-2 rounded border border-slate-800 text-center min-w-[100px]">
                <span className="block text-xl font-bold text-white">{filteredPlaybooks.length}</span>
                <span className="text-[10px] text-slate-500 uppercase">Visible</span>
             </div>
          </div>
        </header>

        {/* Thanh tìm kiếm (Có sự kiện onChange để lọc ngay) */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-slate-500" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 Gõ để lọc ngay: ID (PB-01), Tên, MITRE (T1528)..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-lg"
          />
        </div>

        {/* Danh sách hiển thị */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPlaybooks.map((pb) => (
            <Link key={pb.id} href={`/playbook/${pb.playbookId}`} className="group block h-full">
              <div className="h-full bg-slate-900/50 border border-slate-800 p-6 rounded-xl hover:border-blue-500/50 hover:bg-slate-800 transition flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span className="font-mono text-xs font-bold text-slate-400 bg-slate-950 border border-slate-800 px-2 py-1 rounded">
                    {pb.playbookId}
                  </span>
                  <span className={`text-xs font-bold px-2 py-1 rounded border ${
                    pb.severity === 'Critical' ? 'bg-red-950/40 text-red-400 border-red-900' :
                    pb.severity === 'High' ? 'bg-orange-950/40 text-orange-400 border-orange-900' :
                    'bg-blue-950/40 text-blue-400 border-blue-900'
                  }`}>
                    {pb.severity?.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-100 mb-3 group-hover:text-blue-400 transition line-clamp-2">
                  {pb.title}
                </h3>
                <p className="text-sm text-slate-400 line-clamp-3 mb-4 flex-grow">
                  {pb.scenario}
                </p>
                <div className="mt-auto pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
                  <span className="bg-slate-800 px-2 py-1 rounded">{pb.category}</span>
                  <span className="text-blue-500 group-hover:translate-x-1 transition">Xem chi tiết →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {filteredPlaybooks.length === 0 && (
            <div className="text-center py-20 text-slate-500">
                <AlertTriangle className="mx-auto mb-2 w-10 h-10 opacity-50"/>
                Không tìm thấy playbook nào khớp với từ khóa "{searchTerm}"
            </div>
        )}
      </div>
    </main>
  );
}