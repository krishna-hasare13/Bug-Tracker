import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import API_URL from '../apiConfig';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/register`, formData);
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100 animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-lg shadow-indigo-200">B</div>
          <h2 className="text-2xl font-bold text-slate-800">Create Account</h2>
          <p className="text-slate-500 text-sm mt-1">Join your team and start tracking bugs</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 ml-1">Full Name</label>
            <input type="text" className="w-full bg-slate-50 border border-slate-200 text-slate-700 font-medium rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 ml-1">Email</label>
            <input type="email" className="w-full bg-slate-50 border border-slate-200 text-slate-700 font-medium rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 ml-1">Password</label>
            <input type="password" className="w-full bg-slate-50 border border-slate-200 text-slate-700 font-medium rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
          </div>
          <button disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 disabled:opacity-70 mt-2">
            {loading ? 'Creating Account...' : 'Get Started'}
          </button>
        </form>
        <p className="mt-8 text-center text-sm text-slate-500">
          Already have an account? <Link to="/login" className="text-indigo-600 font-bold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};
export default Register;