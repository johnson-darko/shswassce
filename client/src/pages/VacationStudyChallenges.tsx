import React, { useState } from 'react';

// Simple vacation study challenges page (placeholder for quiz)
const VacationStudyChallenges: React.FC = () => {
  const [level, setLevel] = useState('form1');

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold mb-4 text-green-700 dark:text-green-200">Vacation Study Challenges</h1>
      <p className="mb-2 text-gray-600 dark:text-gray-300">Practice mock revision questions based on your level. (Quiz coming soon!)</p>
      <label className="block mb-2 font-semibold">Select Level:</label>
      <select
        className="mb-4 p-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        value={level}
        onChange={e => setLevel(e.target.value)}
      >
        <option value="form1">Form 1</option>
        <option value="form2">Form 2</option>
        <option value="form3">Form 3</option>
      </select>
      <div className="text-xs text-gray-400">Multiple choice and essay with timer coming soon.</div>
    </div>
  );
};

export default VacationStudyChallenges;
