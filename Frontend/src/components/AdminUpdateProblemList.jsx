import React, { useState } from 'react';
import { useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';

const UpdateProblemPlaceholder = () => {
    const [isLoading, setIsLoading] = useState(false);
    const problems = useSelector((state) => state.problem.problems);
    if(!problems)
        setIsLoading(true);
    const navigate = useNavigate();

    const handleProblemSelect = (problemId) => {
        // Navigate to the edit page for the specific problem
        navigate(`/admin/edit-problem/${problemId}`);
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
                    <h1 className="text-4xl font-bold text-zinc-100">Update a Problem</h1>
                    <p className="text-zinc-400 mt-2">Click on a problem to edit it</p>
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
                            <table className="table w-full">
                                <thead className="bg-zinc-700/30">
                                    <tr>
                                        <th className="text-zinc-300 font-semibold">Title</th>
                                        <th className="text-zinc-300 font-semibold">Difficulty</th>
                                        <th className="text-zinc-300 font-semibold">Tags</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {problems.map((problem, index) => (
                                        <tr 
                                        key={problem._id} 
                                        className={`cursor-pointer hover:bg-zinc-700/50 transition-colors duration-200 ${
                                            index % 2 === 0 ? 'bg-zinc-800/30' : 'bg-zinc-800/10'
                                        }`}
                                        onClick={() => handleProblemSelect(problem._id)}
                                        >
                                            <td className="font-medium text-zinc-100 p-4">
                                                {problem.title}
                                            </td>
                                            <td className="p-4">
                                                <DifficultyBadge difficulty={problem.difficulty} />
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {problem.tags.map((tag) => (
                                                        <div 
                                                            key={tag} 
                                                            className="px-2 py-1 rounded-full text-xs bg-zinc-700/50 text-zinc-300 border border-zinc-600/50"
                                                        >
                                                            {tag}
                                                        </div>
                                                    ))}
                                                </div>
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

export default UpdateProblemPlaceholder;