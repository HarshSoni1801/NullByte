import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axiosClient from './axiosClient';

export const registerUser = createAsyncThunk(
   'authSlice/register',
   async(userData,{ rejectWithValue }) => {
      try{
         const response=await axiosClient.post('/user/register', userData);
         return response.data.user;
      }
      catch(error){
         const errorData = {
            message: error.response?.data?.message || "Registration failed",
            errors: error.response?.data?.errors,
            status: error.response?.status,
         };
         console.log("Redux thunk error:", errorData); // Debug log
         return rejectWithValue(errorData);
      }
   }
);
export const loginUser = createAsyncThunk(
   'authSlice/login',
   async (credentials,{rejectWithValue})=>{
      try{
         const response=await axiosClient.post('/user/login', credentials);
         console.log("Login response:", response);
         return response.data.user;
      }
      catch(error){
         // ✅ FIXED - properly extract error details  
         return rejectWithValue({
            message: error.response?.data?.message || "Login failed",
            errors: error.response?.data?.errors,
            status: error.response?.status,
         });
      }
   }
);
export const checkAuth = createAsyncThunk(
   'authSlice/check',
   async (_,{rejectWithValue})=>{
      try{
         const {data}=await axiosClient.get('/user/check');
         return data.user;
      }
      catch(error){
         return rejectWithValue({
            message: error.response?.data?.message || "Authentication failed",
            status: error.response?.status,
        });
      }
   }
);
export const logoutUser = createAsyncThunk(
   'authSlice/logout',
   async (_,{rejectWithValue})=>{
      try{
        await axiosClient.post('/user/logout');
         return null;
      }
      catch(error){
         // ✅ FIXED - properly extract error details
         return rejectWithValue({
            message: error.response?.data?.message || "Logout failed",
            status: error.response?.status,
         });
      }
   }
);
export const loginGuestUser = createAsyncThunk(
   'authSlice/guestLogin',
   async (_, { rejectWithValue }) => {
     try {
       const response = await axiosClient.post('/user/guest-login');
       return response.data.user;
     } catch (error) {
       // ✅ ALREADY CORRECT
       return rejectWithValue(error.response?.data || error.message);
     }
   }
);

const authSlice = createSlice({
   name:'auth',
   initialState:{
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      justAuthenticated: false, // Add this flag
   },
   reducers:{
      // Add reducer to reset the authentication flag
      resetAuthFlag: (state) => {
         state.justAuthenticated = false;
      },
   },  
   extraReducers:(builder)=>{
      builder
      .addCase(registerUser.pending,(state)=>{
         state.loading = true;
         state.error = null;
      })
      .addCase(registerUser.fulfilled,(state, action)=>{
         state.loading = false;
         state.user = action.payload;
         state.isAuthenticated = !!action.payload;
         state.justAuthenticated = true; // Set flag to true after registration
      })
      .addCase(registerUser.rejected,(state, action)=>{
         state.loading = false;
         state.error = action.payload?.message||"Something went wrong";
         state.user = null;
         state.isAuthenticated = false;
         state.justAuthenticated = false; // Reset flag on failure
      })
      .addCase(loginUser.pending,(state)=>{
         state.loading = true;
         state.error = null;
      })
      .addCase(loginUser.fulfilled,(state, action)=>{
         state.loading = false;
         state.user = action.payload;
         state.isAuthenticated = !!action.payload;
         state.justAuthenticated = true; // Set flag to true after login
      })
      .addCase(loginUser.rejected,(state, action)=>{
         state.loading = false;
         state.error = action.payload?.message||"Something went wrong";
         state.user = null;
         state.isAuthenticated = false;
         state.justAuthenticated = false; // Reset flag on failure
      })
      .addCase(logoutUser.pending,(state)=>{
         state.loading = true;
         state.error = null;
      })
      .addCase(logoutUser.fulfilled,(state, action)=>{
         state.loading = false;
         state.user = null;
         state.isAuthenticated = false;
         state.justAuthenticated = false; // Reset flag on logout
      })
      .addCase(logoutUser.rejected,(state, action)=>{
         state.loading = false;
         state.error = action.payload?.message||"Something went wrong";
         state.user = null;
         state.isAuthenticated = false;
         state.justAuthenticated = false; // Reset flag on failure
      })
      .addCase(checkAuth.pending, (state) => {
         state.loading = true;
         state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
         state.loading = false;
         state.user = action.payload;
         state.isAuthenticated = !!action.payload;
         if (!state.justAuthenticated) {
            state.justAuthenticated = false;
         } // Keep the flag unchanged if already true     
})
      .addCase(checkAuth.rejected, (state, action) => {
         state.loading = false;
         state.user = null;
         state.isAuthenticated = false;
         state.justAuthenticated = false; // Reset flag on failure
         state.error = action.payload?.message || "Authentication check failed.";
      })
      .addCase(loginGuestUser.pending, (state) => {
         state.loading = true;
         state.error = null;
      })
      .addCase(loginGuestUser.fulfilled, (state, action) => {
         state.loading = false;
         state.user = action.payload;
         state.isAuthenticated = !!action.payload;
         state.justAuthenticated = true; // Set flag to true after guest login
      })
      .addCase(loginGuestUser.rejected, (state, action) => {
         state.loading = false;
         state.error = action.payload?.message || 'Guest login failed';
         state.user = null;
         state.isAuthenticated = false;
         state.justAuthenticated = false; // Reset flag on failure
      })
   }
})

// Export the new action
export const { resetAuthFlag } = authSlice.actions;
export default authSlice.reducer;