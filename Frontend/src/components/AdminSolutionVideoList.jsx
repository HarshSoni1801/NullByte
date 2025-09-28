import React, { useState, useEffect } from 'react';
import axiosClient from '../axiosClient';
import { Link } from 'react-router';

const ProblemVideoPlaceholder = () => {
    const [problems, setProblems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const { data } = await axiosClient.get('/problem/fetchAll');
                setProblems(data);
                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching problems:", error);
                setIsLoading(false);
            }
        };

        fetchProblems();
    }, []);

    const handleProblemSelect = async (problemId) => {
      if(!window.confirm("Are you sure you want to delete the video for this problem?"))
         return;
      try{
         const result=await axiosClient.delete(`/solutionVideo/delete/${problemId}`);
         console.log(result);
         alert("Video deleted successfully");
      }
      catch(err)
      {
         console.error("Error deleting video:", err);
         // Handle different error scenarios
         if (err.response) {
             // Server responded with error status
             if (err.response.status === 404) {
                 alert("No video exists for this problem");
             } else if (err.response.status === 403) {
                 alert("Access denied: Admin privileges required");
             } else {
                 alert(`Error: ${err.response.data || err.message}`);
             }
         } else {
             // Network or other error
             alert("Network error: Please check your connection");
         }
      }
    };

    const DifficultyBadge = ({ difficulty }) => {
        const colorMap = {
            easy: 'bg-green-600/20 text-green-400 border-green-500/30',
            medium: 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30',
            hard: 'bg-red-600/20 text-red-400 border-red-500/30',
        };
        
        return (
            <div className={`px-2 py-1 rounded-full text-xs font-medium border max-w-20 text-center ${colorMap[difficulty]}`}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-900 text-zinc-300 font-sans flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-zinc-100 mb-4">Update a Problem</h1>
                    <div className="animate-spin rounded-full border-t-2 border-b-2 border-red-500 w-13 h-13 mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-900 text-zinc-300 font-sans p-6" style={{ paddingTop: "8rem" }}>
            <div className="max-w-6xl mx-auto">
                <header className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-zinc-100">Add/Remove Video Solution</h1>
                    <p className="text-zinc-400 mt-2">Click on a problem to select it</p>
                </header>

                <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg shadow-2xl shadow-zinc-950/50 p-6">
                  {problems.length === 0 ? (
                     <div className="text-center py-12">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-red-500/50 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                           <h2 className="text-2xl font-bold text-zinc-100 mt-4">No Problems Found</h2>
                           <p className="text-zinc-400 mt-2">There are no problems available to update.</p>
                     </div>
                  ) : (
                     <div className="overflow-x-auto">
<table className="table w-full border-collapse border border-zinc-700 rounded-lg overflow-hidden">
  <thead className="bg-zinc-700/30">
    <tr>
      <th className="text-zinc-300 font-semibold p-4 text-left">Title</th>
      <th className="text-zinc-300 font-semibold p-4 text-left">Difficulty</th>
      <th className="text-zinc-300 font-semibold p-4 text-left">Tags</th>
      <th className="text-zinc-300 font-semibold p-4 text-center" colSpan={2}>Actions</th>
    </tr>
  </thead>
  <tbody>
    {problems.map((problem, index) => (
      <tr 
        key={problem._id} 
        className={`transition-colors duration-200 cursor-pointer ${
          index % 2 === 0 ? 'bg-zinc-800/30' : 'bg-zinc-800/10'
        } hover:bg-zinc-700/50`}
      >
        <td 
          className="font-medium text-zinc-100 p-4"
        >
          {problem.title}
        </td>
        <td 
          className="p-4"
          
        >
          <DifficultyBadge difficulty={problem.difficulty} />
        </td>
        <td 
          className="p-4"
        >
          <div className="flex flex-wrap gap-1">
            {problem.tags.map((tag) => (
              <div 
                key={tag} 
                className="px-2 py-1 rounded-full text-xs bg-zinc-700/50 text-zinc-300 border border-zinc-600/50 select-none"
              >
                {tag}
              </div>
            ))}
          </div>
        </td>
        <td className="p-4 flex justify-center">
          <button
            onClick={() => handleProblemSelect(problem._id)}
            className="btn btn-sm bg-red-600/30 border border-red-500/70 text-red-400 hover:bg-red-600/50 hover:text-red-300 transition-all duration-200 rounded-md flex items-center justify-center space-x-1"
            title="Delete Video"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="sr-only">Delete Video</span>
          </button>
        </td>
        <td className="p-4 flex justify-center">
          <Link to={`/admin/uploadSolutionVideo/${problem._id}`} className="w-full">
            <button
              className="btn btn-sm bg-green-600/30 border border-green-500/70 text-green-400 hover:bg-green-600/50 hover:text-green-300 transition-all duration-200 rounded-md flex items-center justify-center space-x-1 w-full"
              title="Upload Video"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
              <span className="sr-only">Upload Video</span>
            </button>
          </Link>
        </td>
      </tr>
    ))}
  </tbody>
</table>

                     </div>
                  )}
               </div>

            </div>
        </div>
    );
};

export default ProblemVideoPlaceholder;