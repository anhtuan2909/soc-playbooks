import { signIn } from '@/auth';
 
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <form
        action={async (formData) => {
          "use server"
          await signIn("credentials", formData)
        }}
        className="bg-slate-900 p-8 rounded-xl border border-slate-800 w-96 space-y-4 shadow-2xl"
      >
        <h1 className="text-2xl font-bold text-white mb-6 text-center">SOC Portal Login</h1>
        <div>
            <label className="text-slate-400 text-sm">Email</label>
            <input name="email" type="email" className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white" />
        </div>
        <div>
            <label className="text-slate-400 text-sm">Password</label>
            <input name="password" type="password" className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white" />
        </div>
        <button className="w-full bg-blue-600 hover:bg-blue-500 text-white p-3 rounded font-bold mt-4">Sign In</button>
      </form>
    </div>
  )
}