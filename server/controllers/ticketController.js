const supabase = require('../config/supabaseClient');

// 1. Get Tickets for a Project
const getTickets = async (req, res) => {
  const { projectId } = req.params;
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('*, users!tickets_created_by_fkey(full_name)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false }); // Newest first

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Create a New Ticket
const createTicket = async (req, res) => {
  // Frontend sends: title, status, project_id
  const { title, status, project_id, priority, description } = req.body;
  const created_by = req.user.id; // <--- Grabbed from 'protect' middleware

  try {
    const { data, error } = await supabase
      .from('tickets')
      .insert([
        { 
          title, 
          status: status || 'todo', 
          priority: priority || 'low', // Default to 'low' if missing
          description: description || '',
          project_id, 
          created_by, // Important!
          assigned_to: created_by // Auto-assign to creator for now
        }
      ])
      .select('*, users!tickets_created_by_fkey(full_name)')
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Create Ticket Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// 3. Update Ticket (Status or Details)
const updateTicket = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const { data, error } = await supabase
      .from('tickets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. Delete Ticket
const deleteTicket = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('tickets').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Ticket deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getTickets, createTicket, updateTicket, deleteTicket };