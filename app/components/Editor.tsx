'use client';

import { updatePlaybook } from '@/app/lib/actions';
import { useState } from 'react';
import Link from 'next/link';
import { Save, X } from 'lucide-react';

export default function Editor({ playbook }: { playbook: any }) {
  // State để quản lý nội dung JSON (Phases) cho dễ sửa
  const [phasesJson, setPhasesJson] = useState(JSON.stringify(playbook.phases, null, 2));

  return (
    <form action={updatePlaybook} className="space-y-6">
      {/* ID ẩn để gửi về server */}
      <input type="hidden" name="playbookId" value={playbook.playbookId} />

      {/* Header Buttons */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-6">
        <h1 className="text-2xl font-bold text-white">Chỉnh sửa: {playbook.playbookId}</h1>
        <div className="flex gap-3">
          <Link href={`/playbook/${playbook.playbookId}`} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition">
            <X size={18} /> Hủy
          </Link>
          <button type="submit" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition">
            <Save size={18} /> Lưu thay đổi
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cột trái: Thông tin chung */}
        <div className="space-y-4 bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h3 className="text-blue-400 font-bold mb-4">Thông tin chung</h3>
          
          <div>
            <label className="block text-sm text-slate-400 mb-1">Tiêu đề Playbook</label>
            <input name="title" defaultValue={playbook.title} className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-blue-500 outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Mức độ (Severity)</label>
              <select name="severity" defaultValue={playbook.severity} className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-blue-500 outline-none">
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Nhóm (Category)</label>
              <input name="category" defaultValue={playbook.category} className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Kịch bản (Scenario)</label>
            <textarea name="scenario" rows={4} defaultValue={playbook.scenario} className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-blue-500 outline-none" />
          </div>

           <div>
            <label className="block text-sm text-slate-400 mb-1">Nguồn phát hiện (Detection)</label>
            <textarea name="detection" rows={2} defaultValue={playbook.detection} className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-blue-500 outline-none" />
          </div>

           <div>
            <label className="block text-sm text-slate-400 mb-1">MITRE ATT&CK</label>
            <input name="mitre" defaultValue={playbook.mitre || ''} className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white" />
          </div>
        </div>

        {/* Cột phải: Quy trình JSON */}
        <div className="space-y-4 bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col">
          <div className="flex justify-between">
            <h3 className="text-orange-400 font-bold">Quy trình xử lý (JSON)</h3>
            <span className="text-xs text-slate-500 italic">Sửa cẩn thận đúng cú pháp JSON</span>
          </div>
          
          <textarea 
            name="phases" 
            value={phasesJson}
            onChange={(e) => setPhasesJson(e.target.value)}
            className="flex-grow w-full bg-slate-950 border border-slate-700 rounded p-4 text-white font-mono text-sm focus:border-orange-500 outline-none"
            style={{ minHeight: '500px' }}
          />
        </div>
      </div>
    </form>
  );
}