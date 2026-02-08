import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axios from 'axios';
import TicketModal from '../components/TicketModal';
import { supabase } from '../supabase';
import API_URL from '../apiConfig';

const ProjectBoard = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate(); 
  
  const [tickets, setTickets] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', status: 'todo' });
  const [selectedTicket, setSelectedTicket] = useState(null); 
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');

  useEffect(() => {
    fetchTickets();
    const subscription = supabase
      .channel('tickets-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setTickets((prev) => prev.map((t) => t.id === payload.new.id ? { ...t, ...payload.new, users: t.users } : t));
        } else if (payload.eventType === 'INSERT') {
          if (payload.new.project_id === projectId) {
            setTickets((prev) => {
               if (prev.find(t => t.id === payload.new.id)) return prev;
               return [...prev, payload.new];
            });
          }
        } else if (payload.eventType === 'DELETE') {
          setTickets((prev) => prev.filter((t) => t.id !== payload.old.id));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(subscription); };
  }, [projectId]);

  const fetchTickets = async () => {
    try {
      const res = await axios.get(`${API_URL}/tickets/${projectId}`);
      setTickets(res.data);
    } catch (err) { console.error(err); }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    const updatedTickets = tickets.map(t => t.id === draggableId ? { ...t, status: destination.droppableId } : t);
    setTickets(updatedTickets);
    try { await axios.put(`${API_URL}/tickets/${draggableId}`, { status: destination.droppableId }); } 
    catch (err) { fetchTickets(); }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTask.title) return;
    try {
      const res = await axios.post(`${API_URL}/tickets`, { ...newTask, project_id: projectId });
      setTickets((prev) => [...prev, res.data]); 
      setNewTask({ title: '', status: 'todo' });
    } catch (err) { alert("Error creating ticket."); }
  };

  const handleDeleteTicket = async (ticketId, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this ticket?")) return;
    try {
      await axios.delete(`${API_URL}/tickets/${ticketId}`);
      setTickets((prev) => prev.filter((t) => t.id !== ticketId));
    } catch (err) { alert("Failed."); }
  };

  const getFilteredTickets = (status) => {
    return tickets.filter(t => {
      if (t.status !== status) return false;
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
      if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  };

  const columnNames = { todo: 'To Do', inprogress: 'In Progress', done: 'Done' };
  const priorityColor = (p) => {
    if (p === 'high') return 'bg-rose-100 text-rose-600';
    if (p === 'medium') return 'bg-amber-100 text-amber-600';
    return 'bg-emerald-100 text-emerald-600';
  };

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col">
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors">←</button>
          <h1 className="text-xl font-bold text-slate-800">Project Board</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input type="text" placeholder="Search tasks..." className="pl-9 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-lg text-sm w-64 transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
          </div>
          <select className="py-2 pl-3 pr-8 bg-slate-100 border-transparent rounded-lg text-sm font-medium text-slate-600 cursor-pointer hover:bg-slate-200 transition-colors" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className="p-8 flex-1 overflow-x-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-8 h-full min-w-[1000px]">
            {['todo', 'inprogress', 'done'].map((status) => (
              <Droppable key={status} droppableId={status}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="flex-1 bg-slate-300/50 rounded-2xl p-4 flex flex-col min-h-[500px]">
                    <div className="flex justify-between items-center mb-4 px-2">
                      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">{columnNames[status]}
                        <span className="ml-2 bg-slate-400 text-white px-2 py-0.5 rounded-full text-xs">{getFilteredTickets(status).length}</span>
                      </h2>
                    </div>
                    <div className="flex-1 space-y-3">
                      {getFilteredTickets(status).map((ticket, index) => (
                        <Draggable key={ticket.id} draggableId={ticket.id} index={index}>
                          {(provided, snapshot) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} onClick={() => setSelectedTicket(ticket)}
                              className={`group relative bg-white p-4 rounded-xl shadow-sm border border-slate-100 cursor-grab active:cursor-grabbing hover:shadow-md hover:-translate-y-1 transition-all duration-200 ${snapshot.isDragging ? 'shadow-2xl rotate-2 ring-2 ring-indigo-500 z-50' : ''}`}>
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-slate-800 pr-6 leading-tight">{ticket.title}</h3>
                                <button onClick={(e) => handleDeleteTicket(ticket.id, e)} className="absolute top-3 right-3 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-md p-1">🗑️</button>
                              </div>
                              <div className="flex justify-between items-center mt-3">
                                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md tracking-wide ${priorityColor(ticket.priority)}`}>{ticket.priority || 'low'}</span>
                                {ticket.users?.full_name && (
                                  <div className="flex items-center gap-1.5" title={`Assigned to ${ticket.users.full_name}`}>
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-[10px] text-white font-bold border-2 border-white shadow-sm">{ticket.users.full_name.charAt(0)}</div>
                                    <span className="text-xs text-slate-500 font-medium">{ticket.users.full_name.split(' ')[0]}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                    {status === 'todo' && (
                      <form onSubmit={handleCreateTicket} className="mt-3">
                        <input type="text" placeholder="+ Add a task" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm hover:border-indigo-300 transition-colors" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} />
                      </form>
                    )}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>

      {selectedTicket && <TicketModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} onUpdate={(updated) => setTickets(tickets.map(t => t.id === updated.id ? updated : t))} />}
    </div>
  );
};
export default ProjectBoard;