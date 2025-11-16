import { getPlaybookById } from '@/app/lib/actions';
import Editor from '@/app/components/Editor';

export default async function EditPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const decodedId = decodeURIComponent(params.id);
  const pb = await getPlaybookById(decodedId);

  if (!pb) return <div className="text-white p-10">Playbook not found</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <Editor playbook={pb} />
      </div>
    </div>
  );
}