import axios from 'axios';
const axiosClient = axios.create({
   baseURL: 'http://localhost:3000',
   withCredentials: true, // Enable sending cookies with request
   headers: {
      'Content-Type': 'application/json',
   }
});
export default axiosClient;