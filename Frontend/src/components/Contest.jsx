import React from 'react';
import { motion } from 'framer-motion';
import Logo from '../assets/Logo';
import CodeChefLogo from '../assets/CodeChef.png'; // Adjust path
import GFGLogo from '../assets/GeeksForGeeks.png'; // Adjust path
import HackerEarthLogo from '../assets/HackerEarth.png'; // Adjust path
import NaukriLogo from '../assets/Naukri.png'; // Adjust path
import HackerRankLogo from '../assets/HackerRank.png'; // Adjust path
import LeetCode from '../assets/LeetCode.png'; // Adjust path

const ContestPage = () => {
  const platforms = [
    { name: 'CodeChef', logo: CodeChefLogo, url: 'https://www.codechef.com/contests' },
    { name: 'GeeksForGeeks', logo: GFGLogo, url: 'https://www.geeksforgeeks.org/events/rec/gfg-weekly-coding-contest' },
    { name: 'HackerEarth', logo: HackerEarthLogo, url: 'https://www.hackerearth.com/challenges/' },
    { name: 'Naukri.com', logo: NaukriLogo, url: 'https://www.naukri.com/campus/contests?src=gnbParticipate' },
    { name: 'HackerRank', logo: HackerRankLogo, url: 'https://www.hackerrank.com/contests' },
    { name: 'LeetCode', logo: LeetCode, url: 'https://leetcode.com/contest/' },
  ];

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-300 font-sans p-6 flex flex-col items-center" style={{"padding-top": "5rem"}}>
      <main className="mb-8 text-center">
        <Logo className="h-20 w-20 text-red-500 mx-auto mb-4" />
        <h1 className="text-4xl font-extrabold tracking-wide text-zinc-100 mb-2">No Current Contests on NullByte</h1>
        <p className="text-zinc-400 max-w-xl mx-auto">
          Participate in contests on popular external platforms while we prepare exciting competitions for you.
        </p>
      </main>

      <motion.div
        className="flex flex-wrap justify-center gap-10 max-w-6xl w-full mt-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {platforms.map(({ name, logo, url }) => (
          <a
            key={name}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center p-6 bg-zinc-800/50 rounded-lg border border-zinc-700 hover:border-red-600 shadow-lg shadow-zinc-950/50 transition-colors duration-300 cursor-pointer w-64 h-43"
          >
            <img src={logo} alt={`${name} logo`} className="h-20 mb-4" />
            <span className="text-lg font-semibold text-zinc-200 text-center">{name}</span>
          </a>
        ))}
      </motion.div>
    </div>
  );
};

export default ContestPage;
