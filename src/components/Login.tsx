import { useState } from 'react';
import { User, GraduationCap, Shield } from 'lucide-react';

interface LoginProps {
  onLogin: (role: 'student' | 'admin') => void;
}

export function Login({ onLogin }: LoginProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'student' | 'admin'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(selectedRole);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Blockchain pattern background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(139, 92, 246, 0.1) 35px, rgba(139, 92, 246, 0.1) 70px)`,
        }}></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 35px, rgba(59, 130, 246, 0.1) 35px, rgba(59, 130, 246, 0.1) 70px)`,
        }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Campus Pay</h1>
          <p className="text-purple-300">Blockchain-Powered Payment System</p>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-purple-500/20">
          <h2 className="text-2xl font-bold text-white mb-6">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-purple-300 mb-3">Select Role</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedRole('student')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedRole === 'student'
                    ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/50'
                    : 'border-slate-700 bg-slate-700/30 hover:border-purple-500/50'
                }`}
              >
                <GraduationCap className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                <div className="text-white font-medium">Student</div>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedRole === 'admin'
                    ? 'border-teal-500 bg-teal-500/20 shadow-lg shadow-teal-500/50'
                    : 'border-slate-700 bg-slate-700/30 hover:border-teal-500/50'
                }`}
              >
                <Shield className="w-8 h-8 mx-auto mb-2 text-teal-400" />
                <div className="text-white font-medium">Admin</div>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-purple-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-purple-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all duration-200"
            >
              {isSignUp ? 'Sign Up' : 'Login'}
            </button>
          </form>

          {/* Toggle Sign Up / Login */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
