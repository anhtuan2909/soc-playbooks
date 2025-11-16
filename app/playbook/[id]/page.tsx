import { getPlaybookById } from '@/app/lib/actions';
import Link from 'next/link';
import { ArrowLeft, Activity, ShieldCheck, Target, Layers, AlertOctagon } from 'lucide-react';

export default async function PlaybookDetail({ params }: { params: { id: string } }) {
  const pb = await getPlaybookById(params.id);
  
  if (!pb) return <div className="min-h-screen bg-slate-950 text-white p-10 flex justify-center">Playbook Not Found</div>;

  const phases = pb.phases as any[];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition bg-slate-900 px-4 py-2 rounded-lg border border-slate-800 hover:border-slate-600">
          <ArrowLeft size={18} className="mr-2" /> Quay lại
        </Link>

        {/* Header */}
        <div className="border-b border-slate-800 pb-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
             <span className="font-mono text-2xl font-bold text-blue-500 bg-blue-950/30 border border-blue-900 px-3 py-1 rounded w-fit">
                {pb.playbookId}
             </span>
             <h1 className="text-3xl md:text-4xl font-bold text-white">{pb.title}</h1>
          </div>
          <div className="flex gap-3 text-sm">
            <span className={`px-3 py-1 rounded-full font-bold border ${
                pb.severity === 'Critical' ? 'bg-red-950/50 text-red-400 border-red-900' : 'bg-orange-950/50 text-orange-400 border-orange-900'
            }`}>
              {pb.severity}
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {pb.category}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm">
              <h3 className="text-blue-400 font-bold mb-3 flex items-center gap-2 text-lg">
                <Activity size={20}/> Kịch bản (Scenario)
              </h3>
              <p className="text-slate-300 leading-relaxed text-lg">{pb.scenario}</p>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                 <Layers size={24} className="text-blue-500"/> Quy trình xử lý
              </h3>
              <div className="space-y-6">
                {phases && phases.length > 0 ? phases.map((phase: any, idx: number) => (
                  <div key={idx} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                    <div className="bg-slate-800/80 px-6 py-4 border-b border-slate-700/50 font-bold text-blue-200">
                      {idx + 1}. {phase.phase}
                    </div>
                    <div className="p-6">
                      <ul className="space-y-6">
                        {phase.steps.map((step: any, sIdx: number) => (
                          <li key={sIdx} className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-blue-400">
                              {sIdx + 1}
                            </div>
                            <div>
                              <p className="text-white font-semibold text-lg mb-1">{step.action}</p>
                              <p className="text-slate-400">{step.detail}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center bg-slate-900 rounded-xl border border-slate-800 border-dashed text-slate-500">
                    Chưa có chi tiết các bước xử lý.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
              <h3 className="text-orange-400 font-bold mb-3 flex items-center gap-2"><Target size={18}/> Nguồn phát hiện</h3>
              <p className="text-sm text-slate-300">{pb.detection}</p>
            </div>
            <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
              <h3 className="text-red-400 font-bold mb-3 flex items-center gap-2"><AlertOctagon size={18}/> MITRE ATT&CK</h3>
              <div className="text-sm text-slate-300 font-mono bg-black/30 p-3 rounded border border-slate-800/50">
                  {pb.mitre || "N/A"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}