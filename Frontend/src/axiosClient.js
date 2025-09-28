import axios from 'axios';
const axiosClient = axios.create({
   baseURL: 'https://nullbyte-backend.onrender.com/',
   withCredentials: true, // Enable sending cookies with request
   headers: {
      'Content-Type': 'application/json',
   }
});
export default axiosClient;
