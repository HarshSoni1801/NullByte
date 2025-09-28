import React from 'react';
// Import Link instead of useNavigate
import { Link } from 'react-router-dom';
import Logo from '../assets/Logo';

import { PlusSquare, Edit, FileVideo } from 'lucide-react';

const CreateIcon = () => (
    <PlusSquare className="h-16 w-16 text-red-500" strokeWidth={2} />
);

const UpdateIcon = () => (
    <Edit className="h-16 w-16 text-red-500" strokeWidth={2} />
);

const VideoIcon = () => (
    <FileVideo className="h-16 w-16 text-red-500" strokeWidth={2} />
);

// We no longer need the App component to manage internal state
// to handle routing. A functional component is sufficient.
const App = () => {
    return (
        <div className="min-h-screen bg-zinc-900 text-zinc-300 font-sans flex items-center justify-center p-4 sm:p-6 md:p-8">
            <div className="w-full transition-all duration-500">
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <Logo className="h-16 w-16 text-red-500" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-zinc-100">Admin Dashboard</h1>
                    <p className="text-lg text-zinc-400 mb-12">Choose an action to manage coding problems.</p>
                    {/* First row with Create and Update Problem */}
                    <div className="flex gap-20 justify-center mb-10 mt-18">
                            <Link
                                to="/admin/createProblem"
                                className="card bg-zinc-800/50 border border-zinc-700/50 shadow-2xl shadow-zinc-950/50 hover:shadow-red-500/20 transition-all duration-300 cursor-pointer hover:scale-105 w-90"
                            >
                                <figure className="px-10 pt-10"><CreateIcon /></figure>

                                <div className="card-body items-center text-center">
                                    <h2 className="card-title text-2xl text-zinc-100">Create Problem</h2>
                                    <p className="text-zinc-400">Design a new coding challenge from scratch.</p>
                                </div>
                            </Link>
                            <Link
                                to="/admin/updateProblem"
                                className="card bg-zinc-800/50 border border-zinc-700/50 shadow-2xl shadow-zinc-950/50 hover:shadow-red-500/20 transition-all duration-300 cursor-pointer hover:scale-105 w-90"
                            >
                                <figure className="px-10 pt-10"><UpdateIcon /></figure>
                                <div className="card-body items-center text-center">
                                    <h2 className="card-title text-2xl text-zinc-100">Update Problem</h2>
                                    <p className="text-zinc-400">Modify an existing coding challenge.</p>
                                </div>
                            </Link>
                            <Link
                                to="/admin/solutionVideo"
                                className="card bg-zinc-800/50 border border-zinc-700/50 shadow-2xl shadow-zinc-950/50 hover:shadow-red-500/20 transition-all duration-300 cursor-pointer hover:scale-105 w-90"
                            >
                                <figure className="px-10 pt-10"><VideoIcon /></figure>
                                <div className="card-body items-center text-center">
                                    <h2 className="card-title text-2xl text-zinc-100">Solution Video</h2>
                                    <p className="text-zinc-400">Upload / remove a existing solution video</p>
                                </div>
                            </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;