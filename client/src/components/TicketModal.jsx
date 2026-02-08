import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import CommentSection from './CommentSection';
import { supabase } from '../supabase';
import { AuthContext } from '../context/AuthContext';
import API_URL from '../apiConfig';

const TicketModal = ({ ticket, onClose, onUpdate }) => {
  const { user } = useContext(AuthContext);
  const isViewer = user?.role === 'viewer';
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'medium', status: 'todo', assignee_id: '', attachment_url: '' });
  const [users, setUsers] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (ticket) {
      setFormData({ title: ticket.title, description: ticket.description || '', priority: ticket.priority, status: ticket.status, assignee_id: ticket.assignee_id || '', attachment_url: ticket.attachment_url || '' });
    }
    const fetchUsers = async () => {
      try { const res = await axios.get(`${API_URL}/users`); setUsers(res.data); } catch (err) { console.error(err); }
    };
    fetchUsers();
  }, [ticket]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileName = `${Date.now()}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('attachments').upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage.from('attachments').getPublicUrl(fileName);
      setFormData({ ...formData, attachment_url: data.publicUrl });
    } catch (error) { alert('Error uploading image'); } 
    finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewer) return;
    try {
      const payload = { ...formData, assignee_id: formData.assignee_id || null };
      await axios.put(`${API_URL}/tickets/${ticket.id}`, payload);
      const assignedUser = users.find(u => u.id === formData.assignee_id);
      onUpdate({ ...ticket, ...formData, users: assignedUser ? { full_name: assignedUser.full_name } : null });
      onClose();
    } catch (err) { alert('Failed to update ticket'); }
  };

  if (!ticket) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-100">
        <div className="bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center flex-shrink-0 sticky top-0 z-10">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{ticket.project_id ? 'Ticket Details' : 'Issue Tracker'}</span>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">#{ticket.id.slice(0, 4)} <span className="text-slate-300">|</span> {isViewer ? 'View Ticket' : 'Edit Ticket'}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors">✕</button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <fieldset disabled={isViewer} className="group">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Title</label>
                <input type="text" name="title" className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-lg font-semibold rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:bg-transparent disabled:border-none disabled:p-0" value={formData.title} onChange={handleChange} placeholder="Ticket Title" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Assign To</label>
                  <select name="assignee_id" value={formData.assignee_id} onChange={handleChange} className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer disabled:cursor-default">
                    <option value="">Unassigned</option>
                    {users.map(user => <option key={user.id} value={user.id}>{user.full_name}</option>)}
                  </select>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer disabled:cursor-default">
                    <option value="todo">To Do</option>
                    <option value="inprogress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Priority</label>
                  <select name="priority" value={formData.priority} onChange={handleChange} className={`w-full bg-transparent text-sm font-semibold outline-none cursor-pointer disabled:cursor-default ${formData.priority === 'high' ? 'text-rose-600' : formData.priority === 'medium' ? 'text-amber-600' : 'text-emerald-600'}`}>
                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Description</label>
                <textarea name="description" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 h-32 resize-none focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all custom-scrollbar disabled:bg-transparent disabled:border-none disabled:p-0" value={formData.description} onChange={handleChange} placeholder="Add details..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Attachment</label>
                {formData.attachment_url ? (
                  <div className="relative w-full h-48 bg-slate-900 rounded-xl overflow-hidden group border border-slate-200 shadow-sm">
                    <img src={formData.attachment_url} alt="Attachment" className="w-full h-full object-contain opacity-90" />
                    {!isViewer && <button type="button" onClick={() => setFormData({...formData, attachment_url: ''})} className="absolute top-2 right-2 bg-rose-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">✕</button>}
                  </div>
                ) : !isViewer && (
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 transition-all group">
                    <div className="text-sm text-slate-500 group-hover:text-indigo-600 font-medium">{uploading ? 'Uploading...' : 'Click to upload screenshot'}</div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                  </label>
                )}
              </div>
              {!isViewer && (
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-colors">Save Changes</button>
                </div>
              )}
            </form>
          </fieldset>
          <CommentSection ticketId={ticket.id} />
        </div>
      </div>
    </div>
  );
};
export default TicketModal;