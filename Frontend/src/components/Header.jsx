import React from 'react';
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from '../authSlice';
import { useNavigate, useLocation } from "react-router";
import Logo from '../assets/Logo';
import GithubIcon from '../assets/GithubIcon.png';
import LinkedInIcon from '../assets/LinkedinIcon - Copy.png';

export default function Header(){
   const dispatch = useDispatch();
   const navigate = useNavigate();
   const location = useLocation(); // Add this to check current path
   const stateData = useSelector((state) => state.auth);
   const user = stateData.user; 
   const problems = useSelector((state) => state.problem.problems);
   
   const handleLogout = () => {
      dispatch(logoutUser());
      setSolvedproblems([]);
   }
   
   const handleAdminPanel = () => {
      if(user && user.role === 'admin'){
         navigate('/admin/menu');
      }
   }
   
   const handleLoginClick = async () => {
      if (user && user.firstName === 'Guest') {
         await dispatch(logoutUser()).unwrap();
      }
      navigate('/login');
   };

   const handleRandomProblem = (categoryValue) => {
      const filteredByCategory = categoryValue === 'all'
         ? problems
         : problems.filter(problem => problem.tags.includes(categoryValue));
   
      if (filteredByCategory.length === 0) {
         alert(`No problems found for category: ${categoryValue}`);
         return;
      }
   
      const randomIndex = Math.floor(Math.random() * filteredByCategory.length);
      const randomProblem = filteredByCategory[randomIndex];
      
      navigate(`/problem/${randomProblem._id}`);
   };

   // Fixed handleProblemsClick function
   const handleProblemsClick = () => {
      if (location.pathname === '/') {
         // If already on homepage, scroll to problems table
         const element = document.getElementById('problems-table');
         if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
         }
      } else {
         // If on other page, navigate to homepage first
         navigate('/');
         // Scroll after navigation is complete (small delay)
         setTimeout(() => {
            const element = document.getElementById('problems-table');
            if (element) {
               element.scrollIntoView({ behavior: 'smooth' });
            }
         }, 100);
      }
   };

   const categories = [
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
   ]

   return(
   <div className="navbar fixed top-0 z-50 bg-zinc-950 border-b border-zinc-700/50 shadow-2xl shadow-zinc-950/65 w-full max-w-full">
   <div className="flex gap-10 flex-1">
   <div
      className="flex items-center space-x-2 hover:cursor-pointer"
      onClick={() => navigate('/')}
   >
      <Logo className="h-10 w-10 text-red-500" />
      <a className="text-xl font-bold text-zinc-100">NullByte</a>
   </div>
   
   {/* Fixed Problems button */}
   <button
      className="btn btn-ghost cursor-pointer text-zinc-400 hover:text-white hover:bg-transparent transition-colors duration-300"
      onClick={handleProblemsClick} // Use the new function
   >
      Problems
   </button>

   <div className="dropdown dropdown-end">
      <button
         tabIndex={0}
         className="btn btn-ghost cursor-pointer text-zinc-400 hover:text-white hover:bg-transparent transition-colors duration-300"
      >
         Solve a Random Problem
         <svg
         className="ml-2 h-4 w-4 inline-block"
         fill="none"
         stroke="currentColor"
         viewBox="0 0 24 24"
         xmlns="http://www.w3.org/2000/svg"
         >
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
         </svg>
      </button>
      <ul
         tabIndex={0}
         className="dropdown-content menu p-2 shadow bg-zinc-800 rounded-box w-52"
      >
      {categories.map(({ label, value }) => (
         <li key={value}>
         <button
            className="btn btn-ghost w-full text-left text-zinc-400 hover:text-white hover:bg-transparent transition-colors duration-300"
            onClick={() => handleRandomProblem(value)}
         >
            {label}
         </button>
         </li>
      ))}
      </ul>
   </div>

   <button
      className="btn btn-ghost cursor-pointer text-zinc-400 hover:text-white hover:bg-transparent transition-colors duration-300"
      onClick={()=>navigate('/contests')}
   >
      Contest
   </button>

   <button
      className="btn btn-ghost cursor-pointer text-zinc-400 hover:text-white hover:bg-transparent transition-colors duration-300"
      onClick={() => window.open('https://sortsite.vercel.app/', '_blank')}
   >
      SortSight - DSA Visualizer
   </button>
   </div>

   <div className="flex gap-5">
      <a href="https://github.com/HarshSoni1801/NullByte" target="_blank" rel="noopener noreferrer">
      <img
         src={GithubIcon}
         alt="GitHub"
         className="h-7 w-7 cursor-pointer relative top-1"
         title="GitHub"
      />
   </a>

   <a href="https://www.linkedin.com/in/harsh-soni-510471220/" target="_blank" rel="noopener noreferrer">
      <img
         src={LinkedInIcon}
         alt="LinkedIn"
         className="h-7.5 w-7.5 cursor-pointer relative top-1"
         title="LinkedIn"
      />
   </a>

   {user && user.firstName !== 'Guest' ? (
      <div className="dropdown dropdown-end">
         <label
         tabIndex={0}
         className="btn btn-ghost flex items-center space-x-2 cursor-pointer text-zinc-300 hover:bg-zinc-600/50"
         >
         <span>{user.firstName}</span>
         {user.role === 'admin' && (
            <span className="badge badge-sm bg-red-600/20 text-red-400 border-red-500/30">Admin</span>
         )}
         <svg
            className="w-4 h-4 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
         >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
         </svg>
         </label>
         <ul
         tabIndex={0}
         className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-zinc-800 border border-zinc-700 rounded-lg w-52"
         >
         <li>
         <button className="flex items-center text-zinc-300 hover:bg-zinc-700/50" onClick={() => navigate('/user')}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
         </button>
         </li>
         {user.role === 'admin' ? (
         <li>
            <button onClick={handleAdminPanel} className="flex items-center text-red-400 hover:bg-zinc-700/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Admin Panel
            </button>
         </li>
         ) : (
         <li className="relative">
            <div className="flex flex-col text-zinc-500">
            <div className="flex items-center">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
               </svg>
               Admin Panel
            </div>
            <div className="text-xs mt-1">Admin access required</div>
            </div>
         </li>
         )}
         <li>
         <button onClick={handleLogout} className="flex items-center text-red-400 hover:bg-zinc-700/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
         </button>
         </li>
         </ul>
      </div>
   ) : (
      <button
         onClick={handleLoginClick}
         className="btn border-2 border-red-600 text-red-600 font-semibold rounded-md px-6 py-2 hover:bg-red-600 hover:text-white transition"
      >
         Login
      </button>
   )}
   </div>
   </div>)
}