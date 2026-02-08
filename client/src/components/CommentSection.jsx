import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { supabase } from '../supabase';
import API_URL from '../apiConfig';

const CommentSection = ({ ticketId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchComments();
    const subscription = supabase
      .channel('comments-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments', filter: `ticket_id=eq.${ticketId}` }, () => fetchComments())
      .subscribe();
    return () => { supabase.removeChannel(subscription); };
  }, [ticketId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [comments]);

  const fetchComments = async () => {
    try { const res = await axios.get(`${API_URL}/comments/${ticketId}`); setComments(res.data); } catch (err) { console.error(err); }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await axios.post(`${API_URL}/comments`, { content: newComment, ticket_id: ticketId });
      setNewComment('');
      fetchComments();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 rounded-xl overflow-hidden border border-slate-200 mt-6">
      <div className="bg-white border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">💬 Discussion <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full text-xs font-bold">{comments.length}</span></h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[300px] min-h-[200px] custom-scrollbar">
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm"><span className="text-2xl mb-2">💭</span><p>No comments yet.</p></div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 group">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold shadow-sm border border-white">{comment.users?.full_name?.charAt(0) || '?'}</div>
              <div className="flex-1">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-xs font-bold text-slate-700">{comment.users?.full_name || 'Unknown'}</span>
                  <span className="text-[10px] text-slate-400">{new Date(comment.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <div className="bg-white p-3 rounded-2xl rounded-tl-none text-sm text-slate-600 shadow-sm border border-slate-100 leading-relaxed">{comment.content}</div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="bg-white border-t border-slate-100 p-3">
        <form onSubmit={handlePost} className="relative flex items-center">
          <input type="text" placeholder="Type a message..." className="w-full bg-slate-100 border-none rounded-full pl-4 pr-12 py-2.5 text-sm text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" value={newComment} onChange={(e) => setNewComment(e.target.value)} />
          <button type="submit" disabled={!newComment.trim()} className={`absolute right-1.5 top-1.5 p-1.5 rounded-full transition-all ${newComment.trim() ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transform hover:scale-105' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>➤</button>
        </form>
      </div>
    </div>
  );
};
export default CommentSection;