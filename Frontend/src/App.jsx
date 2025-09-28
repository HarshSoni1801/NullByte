import { Navigate, Route, Routes, useLocation } from "react-router";
import HomePage from "./components/HomePage";
import Login from "./components/Login";
import Signup from "./components/Signup";
import AdminPanel from "./components/AdminPanel";
import AdminCreateProblem from "./components/AdminCreateProblem";
import AdminUpdateProblemList from "./components/AdminUpdateProblemList";
import AdminSolutionVideo from "./components/AdminSolutionVideoList";
import AdminUploadVideo from "./components/AdminUploadVideo";
import UpdateProblemForm from "./components/UpdateProblemForm";
import ProblemInterface from "./components/ProblemInterface"
import ContestPage from "./components/Contest";
import UserPage from "./components/UserPage";
import Header from "./components/Header";
import { checkAuth } from "./authSlice";
import { fetchAllProblems } from "./problemSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

function App() {
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);
  const { problems } = useSelector((state) => state.problem);
  const dispatch = useDispatch();
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);
  
  useEffect(() => {
    const initializeApp = async () => {
      await dispatch(checkAuth());
      setAuthChecked(true);
    };
    initializeApp();
  }, [dispatch]);
  useEffect(() => {
    if (authChecked && isAuthenticated) {
      console.log("User authenticated, fetching problems...");
      dispatch(fetchAllProblems());
    }
  }, [authChecked, isAuthenticated, dispatch]);

  const noHeaderRoutes = ["/login", "/signup"];
  const showHeader = !noHeaderRoutes.includes(location.pathname);

  // Create a protected route component that handles the loading state
  const ProtectedRoute = ({ children, adminOnly = false }) => {
    // If auth hasn't been checked yet, show loading or nothing
    if (!authChecked || loading) {
      return (
        <div className="flex justify-center items-center h-full bg-zinc-900">
          <div className="animate-spin rounded-full border-t-3 border-b-3 border-red-500 w-20 h-20" />       
        </div>
      );
    }
    
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    
    if (adminOnly && user?.role !== 'admin') {
      return <Navigate to="/" replace />;
    }
    
    return children;
  };

  const PublicRoute = ({ children }) => {
    // If auth hasn't been checked yet, show loading or nothing
    if (!authChecked || loading) {
      return (
        <div className="flex justify-center items-center h-full bg-zinc-900">
          <div className="animate-spin rounded-full border-t-3 border-b-3 border-red-500 w-20 h-20" />       
        </div>
      );
    }
    
    if (isAuthenticated) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  // Show initial loading spinner only if auth hasn't been checked at all
  if (!authChecked) {
    return (
      <div className="flex justify-center items-center h-full bg-zinc-900">
        <div className="animate-spin rounded-full border-t-3 border-b-3 border-red-500 w-20 h-20" />       
      </div>
    );
  }

  return (
    <>
      {showHeader && <Header />}
      <Routes>
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/user" 
          element={
            <ProtectedRoute>
              <UserPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/signup" 
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/problem/:p_id" 
          element={
            <ProtectedRoute>
              <ProblemInterface />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/menu" 
          element={
            <ProtectedRoute adminOnly>
              <AdminPanel />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/createProblem" 
          element={
            <ProtectedRoute adminOnly>
              <AdminCreateProblem />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/updateProblem" 
          element={
            <ProtectedRoute adminOnly>
              <AdminUpdateProblemList />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/solutionVideo" 
          element={
            <ProtectedRoute adminOnly>
              <AdminSolutionVideo />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/uploadSolutionVideo/:p_id" 
          element={
            <ProtectedRoute adminOnly>
              <AdminUploadVideo />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/contests" 
          element={<ContestPage />}
        />
        
        <Route 
          path="/admin/edit-problem/:p_id" 
          element={
            <ProtectedRoute adminOnly>
              <UpdateProblemForm />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </>
  );
}

export default App;