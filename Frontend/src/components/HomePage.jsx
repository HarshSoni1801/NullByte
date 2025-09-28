import React, { useState, useEffect, useMemo } from 'react';
import FilterControls from './FilterControls';
import ProblemTable from './ProblemTable';
import { useSelector, useDispatch } from "react-redux";
import axiosClient from '../axiosClient';
import SplashScreen from './SplashScreen'; 
import { resetAuthFlag } from '../authSlice'; 

function App() {
  const [Solvedproblems, setSolvedproblems] = useState([]);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tags: 'all',
    status: 'all',
  });
  const [splashDone, setSplashDone] = useState(false);
  const stateData = useSelector((state) => state.auth);
  const problems = useSelector((state) => state.problem.problems);
  const isLoading = useSelector((state) => state.problem.loading);
  const user = stateData.user;   
  const justAuthenticated = stateData.justAuthenticated;
  const dispatch = useDispatch();

  console.log("Problems fetched using redux:", problems);

  useEffect(() => {    
    // Show splash screen only if user just authenticated
    const sessionSplash = sessionStorage.getItem('showSplash') === 'true';
    const shouldShowSplash = justAuthenticated || sessionSplash;
    
    if (shouldShowSplash) {
      setSplashDone(false);
      // Clear sessionStorage flag
      sessionStorage.removeItem('showSplash');
    } else {
      setSplashDone(true);
    }
  }, [justAuthenticated]);

  const handleSplashFinish = () => {
    setSplashDone(true);
    dispatch(resetAuthFlag());
  };

  useEffect(() => {    
    const fetchUserSolvedproblems = async () => {
      try {
        const {data} = await axiosClient.get('/problem/solvedByUser');
        setSolvedproblems(data);
      } catch (error) {
        console.error("Error fetching all problems:", error);
      }
    }
    
    console.log(user);
    if(user && user.firstName !== 'Guest') {
      fetchUserSolvedproblems();
    }
  }, [user]);

  useEffect(() => {
    console.log("Full user object:", user);
    console.log("User role:", user?.role);
    console.log("User firstName:", user?.firstName);
  }, [user]); //just for debugging
  
  const allTags = useMemo(() => {
    const tagsSet = new Set();
    problems.forEach(problem => {
      problem.tags.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [problems]);

  const solvedProblemIds = useMemo(() => {
    return new Set(Solvedproblems.map(p => p._id));
  }, [Solvedproblems]);

  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
      const tagsMatch = filters.tags === 'all' || problem.tags.includes(filters.tags);
      let statusMatch = true;
      if (filters.status === 'solved') {
        statusMatch = Solvedproblems.some((solved) => solved._id === problem._id);
      } else if (filters.status === 'unsolved') {
        statusMatch = !Solvedproblems.some((solved) => solved._id === problem._id);
      }
      return difficultyMatch && tagsMatch && statusMatch;
    });
  }, [problems, filters, Solvedproblems]);

  return (
    <>
      {!splashDone && <SplashScreen onFinish={handleSplashFinish} />}
      {splashDone && (
        <div className="min-h-screen bg-zinc-900 text-zinc-300 font-sans overflow-x-hidden">
          <main className="p-4 md:p-8 max-w-7xl mx-auto " style={{ paddingTop: "8rem" }}>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-zinc-100">
              Problem Dashboard
            </h1>
            <p className="text-zinc-400 mb-8">
              Browse and filter through the collection of coding challenges.
            </p>
  
            <FilterControls filters={filters} onFilterChange={setFilters} allTags={allTags} />
              <div id="problems-table">
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full border-t-2 border-b-2 border-red-500 w-13 h-13" />
                  </div>
                ) :(
                  <ProblemTable problems={filteredProblems} solvedProblemIds={solvedProblemIds} />
                )}
              </div>
          </main>
        </div>
      )}
    </>
  );
}

export default App;