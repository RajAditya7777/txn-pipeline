import axios from 'axios';

// Ensure this matches the port where FastAPI runs in docker-compose (8000)
const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
