import { createAsyncThunk,createSlice } from "@reduxjs/toolkit";
import axiosClient from "./axiosClient";
export const fetchAllProblems=createAsyncThunk(
   'problem/fetchAll',
   async(_,{rejectWithValue})=>{
      try{
         const {data}=await axiosClient.get('/problem/fetchAll');
         return data;
      }
      catch(error){
         return rejectWithValue(error);
      }
   }
)
const problemSlice=createSlice({
   name:'problem',
   initialState:{
      problems:[],
      loading:false,
      error:null
   },
   reducers:{},
   extraReducers:(builder)=>{
      builder.addCase(fetchAllProblems.pending,(state)=>{
         state.loading=true;
         state.error=null;
      })
      .addCase(fetchAllProblems.fulfilled,(state,action)=>{
         state.loading=false;
         state.problems=action.payload;
      })
      .addCase(fetchAllProblems.rejected,(state,action)=>{
         state.loading=false;
         state.error="Error reported in fetching problems in problemSlice: "+ action.payload?.message;
      })
   }
})
export default problemSlice.reducer;