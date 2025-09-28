import React from 'react';
import { useNavigate } from 'react-router';

const Difficulty = {
   Easy: 'easy',
   Medium: 'medium',
   Hard: 'hard',
}

const DifficultyBadge = ({ difficulty }) => {
  const colorMap = {
    [Difficulty.Easy]: 'bg-green-600/20 text-green-400 border-green-500/30',
    [Difficulty.Medium]: 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30',
    [Difficulty.Hard]: 'bg-red-600/20 text-red-400 border-red-500/30',
  };
  
  return (
    <div className={`px-3 py-1 rounded-full text-xs font-medium border max-w-20 text-center ${colorMap[difficulty]}`}>
      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
    </div>
  );
};

const ProblemTable = ({ problems, solvedProblemIds }) => {
  const tagOptions = [
    { label: 'Array', value: 'array' },
    { label: 'Linked List', value: 'linkedList' },
    { label: 'Tree', value: 'tree' },
    { label: 'Graph', value: 'graph' },
    { label: 'Dynamic Programming', value: 'dynamicProgramming' },
    { label: 'Greedy', value: 'greedy' },
    { label: 'Backtracking', value: 'backtracking' },
    { label: 'Sorting', value: 'sorting' },
    { label: 'Searching', value: 'searching' },
    { label: 'Two Pointer', value: 'twoPointer' },
    { label: 'String', value: 'string' },
    { label: 'Stack', value: 'stack' }
  ];
  
  const getTagLabel = (value) => {
    const tag = tagOptions.find(t => t.value === value);
    return tag ? tag.label : value;
  };  
  
  const navigate = useNavigate();

  // If no problems, show message
  if (problems.length === 0) {
    return (
      <div className="overflow-x-auto bg-zinc-800/50 border border-zinc-700/50 rounded-lg shadow-2xl shadow-zinc-950/50">
        <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-16 w-16 mb-4 text-zinc-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <h3 className="text-xl font-semibold text-zinc-300 mb-2">No problems found</h3>
          <p className="text-center max-w-md">
            {solvedProblemIds.size > 0 
              ? "No problems match your current filters. Try adjusting your search criteria."
              : "There are no problems available at the moment. Please check back later."
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-zinc-800/50 border border-zinc-700/50 rounded-lg shadow-2xl shadow-zinc-950/50">
      <table className="table w-full">
        {/* Remove table-zebra and add custom styling */}
        <thead className="bg-zinc-700/30">
          <tr>
            <th className="w-16 text-zinc-300 font-semibold">Status</th>
            <th className="text-zinc-300 font-semibold">Title</th>
            <th className="text-zinc-300 font-semibold">Difficulty</th>
            <th className="text-zinc-300 font-semibold">Tags</th>
          </tr>
        </thead>
        <tbody>
          {problems.map((problem, index) => (
            <tr 
              key={problem._id} 
              className={`hover:bg-zinc-700/30 ${index % 2 === 0 ? 'bg-zinc-800/30' : 'bg-zinc-800/10'} hover:cursor-pointer`}
              onClick={() => navigate(`/problem/${problem._id}`)}
            >
              {/* {console.log(problem._id)} */}
              <td className="text-center">
                {solvedProblemIds.has(problem._id) && (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="w-6 h-6 text-green-400 mx-auto" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </td>
              <td className="font-medium text-zinc-100">{problem.title}</td>
              <td>
                <DifficultyBadge difficulty={problem.difficulty} />
              </td>
              <td>
                <div className="flex flex-wrap gap-1">
                {problem.tags.map((tagValue) => (
                  <div 
                    key={tagValue} 
                    className="px-2 py-1 rounded-full text-xs bg-zinc-700/50 text-zinc-300 border border-zinc-600/50"
                  >
                    {getTagLabel(tagValue)}
                  </div>
                ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProblemTable;