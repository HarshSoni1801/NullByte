import React, { useState, useEffect, useMemo } from 'react';
import FilterControls from './components/FilterControls';
import ProblemTable from './components/ProblemTable';
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from '../authSlice';
import axiosClient from './axiosClient';

function App() {
  // Mocking user state that would typically come from Redux  
  const dispatch = useDispatch();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [problems, setProblems] = useState([]);
  const [Solvedproblems, setSolvedProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tags: 'all',
    status: 'all',
  });

  const stateData = useSelector((state) => state.auth);
  console.log(stateData);
  const user = stateData.user.firstName;   
  console.log("user: ",user);

  useEffect(()=>{
      const fetchAllProblems = async () => {
         try{
            const {data}=await axiosClient.get('/problem/fetchAll');
            setProblems(data);
         }
         catch (error) {
         console.error("Error fetching all problems:", error);
         }
      }
      const fetchUserSolvedProblems = async () => {
         try{
            const {data}=await axiosClient.get('/problem/solvedByUser');
            setProblems(data);
         }
         catch (error) {
         console.error("Error fetching all problems:", error);
         }
      }
      fetchAllProblems();
      if(user)
         fetchUserSolvedProblems();
   },[user])

   const handleLogout = () => {
      dispatch(logoutUser());
      setIsDropdownOpen(false);
      setSolvedProblems([]);
   }

  const allTags = useMemo(() => {
   const tagsSet = new Set();
      problems.forEach(problem => {
      problem.tags.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [problems]);

  const solvedProblemIds = useMemo(() => {
   return new Set(solvedProblems.map(p => p._id));
 }, [solvedProblems]);

  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
      const tagsMatch = filters.tags === 'all' || problem.tags.includes(filters.tags);
      const statusMatch = filters.status === 'all' || Solvedproblems.some((solved) => solved._id === problem._id);
      return difficultyMatch && tagsMatch && statusMatch;
   });
  }, [problems, filters]);

  return (
    <div className="min-h-screen bg-base-200">
      <header className="navbar bg-base-100 shadow-md">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl font-bold">NullByte</a>
        </div>
        <div className="flex-none gap-2">
          {user ? (
            <div className="dropdown dropdown-end">
              <button
                tabIndex={0}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="btn btn-ghost flex items-center space-x-2"
              >
                <span>{user.firstName}</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isDropdownOpen ? 'transform rotate-180' : ''
                  }`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              {isDropdownOpen && (
                 <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                  <li>
                    <button onClick={handleLogout} className="w-full text-left">
                      Logout
                    </button>
                  </li>
                </ul>
              )}
            </div>
          ) : (
             <button className="btn btn-primary">Login</button>
          )}
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Problem Dashboard</h1>
        <p className="text-base-content/70 mb-8">Browse and filter through the collection of coding challenges.</p>

        <FilterControls
          filters={filters}
          onFilterChange={setFilters}
          allTags={allTags}
        />
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className={`animate-spin rounded-full border-t-2 border-b-2 border-primary w-12 h-12`} />
          </div>
        ) : (
          <ProblemTable
            problems={filteredProblems}
            solvedProblemIds={solvedProblemIds}
          />
        )}
      </main>
    </div>
  );
}

export default App;
