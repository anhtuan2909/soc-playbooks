import { auth } from '@/auth';
import { getUsers, createUser, deleteUser } from '@/app/lib/actions';
import Link from 'next/link';
import { ArrowLeft, Trash2, UserPlus, ShieldAlert } from 'lucide-react';

export default async function UserManagement() {
  const session = await auth();
  // Nếu không phải Admin -> Chặn ngay
  if ((session?.user as any)?.role !== 'ADMIN') {
    return <div className="text-white p-10 text-center">⛔ Access Denied</div>;
  }

  const users = await getUsers();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center text-slate-400 hover:text-white mb-8 bg-slate-900 px-4 py-2 rounded-lg border border-slate-800">
          <ArrowLeft size={18} className="mr-2" /> Về Dashboard
        </Link>

        <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <ShieldAlert className="text-blue-500"/> Quản Trị Nhân Sự (RBAC)
            </h1>
            <div className="bg-blue-900/30 text-blue-300 px-4 py-2 rounded border border-blue-800">
                Admin: {session?.user?.email}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* FORM TẠO USER */}
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 h-fit">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <UserPlus size={20} className="text-green-500"/> Thêm mới
            </h3>
            <form action={createUser} className="space-y-4">
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Email</label>
                    <input name="email" type="email" required className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white outline-none focus:border-blue-500"/>
                </div>
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Mật khẩu</label>
                    <input name="password" type="text" required className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white outline-none focus:border-blue-500"/>
                </div>
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Vai trò</label>
                    <select name="role" className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white outline-none focus:border-blue-500">
                        <option value="VIEWER">Viewer (Chỉ xem)</option>
                        <option value="ADMIN">Admin (Toàn quyền)</option>
                    </select>
                </div>
                <button className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition">
                    + Tạo tài khoản
                </button>
            </form>
          </div>

          {/* DANH SÁCH USER */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-800 text-slate-400 uppercase text-xs font-bold">
                        <tr>
                            <th className="p-4">Email</th>
                            <th className="p-4">Vai trò</th>
                            <th className="p-4 text-right">Xóa</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {users.map((user: any) => (
                            <tr key={user.id} className="hover:bg-slate-800/50">
                                <td className="p-4 font-medium text-white">{user.email}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'ADMIN' ? 'bg-blue-900 text-blue-300' : 'bg-slate-700 text-slate-300'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    {user.email !== session?.user?.email && (
                                        <form action={deleteUser}>
                                            <input type="hidden" name="userId" value={user.id} />
                                            <button className="text-red-500 hover:bg-red-900/20 p-2 rounded"><Trash2 size={18} /></button>
                                        </form>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}