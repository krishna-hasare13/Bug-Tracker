const API_URL = import.meta.env.MODE === 'production' 
  ? 'https://YOUR-RENDER-URL.onrender.com/api' 
  : 'http://localhost:5000/api'; // <--- MAKE SURE /api IS HERE

export default API_URL;