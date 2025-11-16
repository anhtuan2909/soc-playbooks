'use client';

import { createPlaybook } from '@/app/lib/actions';
import Link from 'next/link';
import { Save, X, PlusCircle } from 'lucide-react';
import { useState } from 'react';

export default function NewPlaybookPage() {
  
  // --- MẪU TEMPLATE CHUẨN 6 BƯỚC (Dựa trên tài liệu SOC) ---
  const defaultPhases = [
    {
      "phase": "1. Preparation (Pre-Incident Setup)",
      "steps": [
        { "action": "Configure tools...", "detail": "Setup logging, alerts, and access controls." }
      ]
    },
    {
      "phase": "2. Detection & Analysis",
      "steps": [
        { "action": "Alert triggered", "detail": "Describe the trigger condition." },
        { "action": "Analyze impact", "detail": "Determine scope and affected assets." }
      ]
    },
    {
      "phase": "3. Containment",
      "steps": [
        { "action": "Isolate system", "detail": "Block network access or suspend account." }
      ]
    },
    {
      "phase": "4. Eradication",
      "steps": [
        { "action": "Remove threat", "detail": "Delete malware, rogue accounts, or artifacts." }
      ]
    },
    {
      "phase": "5. Recovery",
      "steps": [
        { "action": "Restore service", "detail": "Recover from backup and validate integrity." }
      ]
    },
    {
      "phase": "6. Lessons Learned & Reporting",
      "steps": [
        { "action": "Conduct RCA", "detail": "Identify root cause and update policies." }
      ]
    }
  ];
  // -------------------------------------------------------

  const [phasesJson, setPhasesJson] = useState(JSON.stringify(defaultPhases, null, 2));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <form action={createPlaybook} className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-slate-800 pb-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <PlusCircle className="text-blue-500"/> Thêm Playbook Mới
            </h1>
            <div className="flex gap-3">
              <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition">
                <X size={18} /> Hủy
              </Link>
              <button type="submit" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold transition">
                <Save size={18} /> Tạo mới
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cột trái: Thông tin cơ bản */}
            <div className="space-y-4 bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h3 className="text-blue-400 font-bold mb-4">1. Thông tin chung</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">ID (Bắt buộc)</label>
                  <input name="playbookId" placeholder="VD: PB-51" required className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-blue-500 outline-none font-mono" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Mức độ</label>
                  <select name="severity" className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-blue-500 outline-none">
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Tiêu đề Playbook</label>
                <input name="title" placeholder="VD: AI Prompt Injection Attack" required className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Nhóm (Category)</label>
                <input name="category" placeholder="VD: Cloud Security" required className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white" />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Kịch bản (Scenario)</label>
                <textarea name="scenario" rows={4} placeholder="Mô tả ngắn gọn về kịch bản tấn công..." className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-blue-500 outline-none" />
              </div>

               <div>
                <label className="block text-sm text-slate-400 mb-1">Nguồn phát hiện</label>
                <textarea name="detection" rows={2} placeholder="SIEM, EDR, Firewall Logs..." className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-blue-500 outline-none" />
              </div>

               <div>
                <label className="block text-sm text-slate-400 mb-1">MITRE ATT&CK</label>
                <input name="mitre" placeholder="T1059, T1190..." className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white" />
              </div>
            </div>

            {/* Cột phải: JSON Quy trình */}
            <div className="space-y-4 bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col">
              <div className="flex justify-between">
                <h3 className="text-orange-400 font-bold">2. Quy trình xử lý (JSON)</h3>
                <span className="text-xs text-slate-500 italic">Điền nội dung vào các bước bên dưới</span>
              </div>
              
              <textarea 
                name="phases" 
                value={phasesJson}
                onChange={(e) => setPhasesJson(e.target.value)}
                className="flex-grow w-full bg-slate-950 border border-slate-700 rounded p-4 text-white font-mono text-sm focus:border-orange-500 outline-none"
                style={{ minHeight: '600px' }}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}