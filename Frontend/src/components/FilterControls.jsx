import React from 'react';

const FilterControls = ({ filters, onFilterChange, allTags }) => {
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };
  
  const Difficulty = {
    Easy: 'easy',
    Medium: 'medium',
    Hard: 'hard',
  }

  return (
    <div className="p-6 bg-zinc-800/50 border border-zinc-700/50 rounded-lg shadow-2xl shadow-zinc-950/50 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Difficulty Filter */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold text-zinc-300">Difficulty</span>
          </label>
          <select
            name="difficulty"
            value={filters.difficulty}
            onChange={handleFilterChange}
            className="select select-bordered w-full bg-zinc-800 border-zinc-700 text-zinc-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="all">All</option>
            {Object.values(Difficulty).map((level) => (
              <option key={level} value={level}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Tags Filter */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold text-zinc-300">Tags</span>
          </label>
          <select
            name="tags"
            value={filters.tags}
            onChange={handleFilterChange}
            className="select select-bordered w-full bg-zinc-800 border-zinc-700 text-zinc-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="all">All</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold text-zinc-300">Status</span>
          </label>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="select select-bordered w-full bg-zinc-800 border-zinc-700 text-zinc-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="all">All</option>
            <option value="solved">Solved</option>
            <option value="unsolved">Unsolved</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;