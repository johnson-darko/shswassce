import React, { useState, useEffect } from 'react';
// @ts-ignore
import englishForm1Exam from '../../exams/english_form1.json';
import mathForm1Exam from '../../exams/math_form1.json';
import englishForm1_1 from '../../exams/english_form1_1.json';
import englishForm1_2 from '../../exams/english_form1_2.json';
import englishForm1_3 from '../../exams/english_form1_3.json';
import englishForm1_4 from '../../exams/english_form1_4.json';
import englishForm1_5 from '../../exams/english_form1_5.json';
import englishForm2_1 from '../../exams/english_form2_1.json';
import englishForm2_2 from '../../exams/english_form2_2.json';
import englishForm2_3 from '../../exams/english_form2_3.json';
import mathForm3Exam from '../../exams/math_form3.json';
import scienceForm1Exam from '../../exams/science_form1.json';
import socialForm1Exam from '../../exams/social_form1.json';

// Add more imports as you add more exam files

const allExams = [
  englishForm1Exam,
  mathForm1Exam,
  mathForm3Exam,
  scienceForm1Exam,
  socialForm1Exam,
  englishForm1_1,
  englishForm1_2,
  englishForm1_3,
  englishForm1_4,
  englishForm1_5,
  englishForm2_1,
  englishForm2_2,
  englishForm2_3
];

// Vacation Study Challenges page with personalized program display
const VacationStudyChallenges: React.FC = () => {
  const [level, setLevel] = useState('form1');
  const [program, setProgram] = useState<string | null>(null);
  const [coreSubjects, setCoreSubjects] = useState<string[]>([]);
  const [electives, setElectives] = useState<string[]>([]);
  const [availableExams, setAvailableExams] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState<any | null>(null);
  const [showExamModal, setShowExamModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [score, setScore] = useState<number>(0);
  const [failedQuestions, setFailedQuestions] = useState<any[]>([]);
  const [timeUp, setTimeUp] = useState(false);
  const [page, setPage] = useState(0);
  const [showDoneModal, setShowDoneModal] = useState(false);
  const [pendingExamKey, setPendingExamKey] = useState<string | null>(null);
  const [examStatuses, setExamStatuses] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem('examStatuses') || '{}');
    } catch {
      return {};
    }
  });

  // Load program and subjects for selected level
  useEffect(() => {
    const savedProgram = localStorage.getItem('program');
    setProgram(savedProgram);

    const resultsRaw = localStorage.getItem('studentResults');
  // Always use Form 1_Term 1 subjects for all levels
  const key = 'Form 1_Term 1';
    if (resultsRaw) {
      try {
        const results = JSON.parse(resultsRaw);
        if (results[key]) {
          setCoreSubjects(results[key].coreSubjects || []);
          setElectives(results[key].electives || []);
        } else {
          setCoreSubjects([]);
          setElectives([]);
        }
      } catch {
        setCoreSubjects([]);
        setElectives([]);
      }
    } else {
      setCoreSubjects([]);
      setElectives([]);
    }
  }, [level]);

  // Filter exams when subjects change
  useEffect(() => {
    // Normalize subject names for matching
    const normalize = (s: string) => s.trim().toLowerCase();
    const normalizedCore = coreSubjects.map(normalize);
    const normalizedElectives = electives.map(normalize);
    const exams: any[] = allExams.filter(exam => {
      const examSubject = normalize(exam.subject);
      const subjectMatch = normalizedCore.includes(examSubject) || normalizedElectives.includes(examSubject);
      const levelMatch = (exam.level || '').toLowerCase().replace(/\s/g, '') === level;
      return subjectMatch && levelMatch;
    });
    setAvailableExams(exams);
  }, [coreSubjects, electives, level]);

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (examStarted && selectedExam) {
      setTimeLeft(selectedExam.timer);
      setAnswers({});
      setTimeUp(false);
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setTimeUp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [examStarted, selectedExam]);

  function handleAnswer(idx: number, value: any) {
    setAnswers(prev => ({ ...prev, [idx]: value }));
  }

  function getExamKey(exam: any, idx?: number) {
    // Use subject, level, and index for uniqueness
    return `${exam.subject}_${exam.level}_${idx ?? ''}`;
  }

  function handleSubmit() {
    if (!selectedExam) return;
    let correct = 0;
    const failed: any[] = [];
    selectedExam.questions.forEach((q: any, idx: number) => {
      if (q.type === 'multiple-choice') {
        if (answers[idx] === q.answer) {
          correct++;
        } else {
          failed.push({
            idx,
            question: q.question,
            userAnswer: answers[idx],
            correctAnswer: q.options[q.answer]
          });
        }
      }
      // Essay questions are not auto-graded
    });
    setScore(correct);
    setFailedQuestions(failed);
    setShowScoreModal(true);
    setShowExamModal(false);
    setExamStarted(false);
    setPendingExamKey(getExamKey(selectedExam, selectedExam?._examIdx));
    // setShowDoneModal(true);
  }

  function handleMarkDone(status: string) {
    if (!pendingExamKey) return;
    const updated = { ...examStatuses, [pendingExamKey]: status };
    setExamStatuses(updated);
    localStorage.setItem('examStatuses', JSON.stringify(updated));
    setShowDoneModal(false);
    setPendingExamKey(null);
    setShowScoreModal(false);
  }

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold mb-4 text-green-700 dark:text-green-200">Vacation Study Challenges</h1>
      {program && (
        <div className="mb-3 text-base font-semibold text-blue-700 dark:text-blue-200">
          Your Program: <span className="font-normal">{program}</span>
        </div>
      )}
      <div className="mb-4">
        <div className="font-semibold text-gray-700 dark:text-gray-200 mb-1">Your Subjects for {level.replace('form', 'Form ')} Term 1:</div>
        {coreSubjects.length > 0 ? (
          <div className="mb-1 text-sm text-gray-800 dark:text-gray-100">
            <span className="font-medium">Core:</span> {coreSubjects.filter(Boolean).join(', ')}
          </div>
        ) : (
          <div className="mb-1 text-sm text-gray-500 dark:text-gray-400">No core subjects found for this level.</div>
        )}
        {electives.length > 0 ? (
          <div className="mb-1 text-sm text-gray-800 dark:text-gray-100">
            <span className="font-medium">Electives:</span> {electives.filter(Boolean).join(', ')}
          </div>
        ) : (
          <div className="mb-1 text-sm text-gray-500 dark:text-gray-400">No electives found for this level.</div>
        )}
      </div>
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

      {/* List available exams for selected level and subjects */}
      {availableExams.length > 0 ? (
        <div className="mb-6">
          <div className="font-semibold mb-2 text-gray-700 dark:text-gray-200">Available Exams:</div>
          <ul>
            {availableExams
              .slice()
              .sort((a, b) => a.subject.localeCompare(b.subject))
              .map((exam, idx) => {
                const key = getExamKey(exam, idx);
                const status = examStatuses[key] || 'Not yet';
                return (
                  <li key={idx} className="mb-2 flex items-center justify-between">
                    <button
                      className="px-4 py-2 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-semibold shadow"
                      onClick={() => { setSelectedExam({ ...exam, _examIdx: idx }); setShowExamModal(true); setShowInstructions(false); setExamStarted(false); }}
                    >
                      {exam.subject} ({exam.level})
                    </button>
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${status === 'Done' ? 'bg-green-200 text-green-800' : status === 'Redo' ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-800'}`}>
                      {status}
                    </span>
                  </li>
                );
              })}
          </ul>
        </div>
      ) : (
        <div className="mb-6 text-gray-500 dark:text-gray-400">No exams available for your subjects and level.</div>
      )}

      {/* Exam Modal: Screen 1 - Start Exam Mode */}
      {showExamModal && selectedExam && !showInstructions && !examStarted && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl max-w-md w-full text-center">
            <h2 className="text-xl font-bold mb-4 text-green-700 dark:text-green-200">{selectedExam.subject} ({selectedExam.level})</h2>
            <button
              className="px-6 py-2 rounded bg-green-600 text-white font-semibold mb-4"
              onClick={() => setShowInstructions(true)}
            >Start Exams Mode</button>
            <div>
              <button className="mt-2 text-sm text-gray-500" onClick={() => setShowExamModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Exam Modal: Screen 2 - Instructions and Timer */}
      {showExamModal && selectedExam && showInstructions && !examStarted && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl max-w-md w-full text-center">
            <h2 className="text-xl font-bold mb-2 text-green-700 dark:text-green-200">Instructions</h2>
            <div className="mb-3 text-gray-700 dark:text-gray-200">
              {selectedExam.instructions}
              <br />
              <span className="font-semibold text-red-600 dark:text-red-400">Put your device on Do Not Disturb and find a quiet place for a distraction-free exam.</span>
            </div>
            <div className="mb-4 font-semibold text-blue-700 dark:text-blue-200">Time Allowed: {Math.floor(selectedExam.timer/60)} mins</div>
            <button
              className="px-6 py-2 rounded bg-green-600 text-white font-semibold mb-4"
              onClick={() => setExamStarted(true)}
            >Start Exam</button>
            <div>
              <button className="mt-2 text-sm text-gray-500" onClick={() => setShowExamModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Exam Modal: Screen 3 - Exam View */}
      {showExamModal && selectedExam && examStarted && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl max-w-lg w-full" style={{ maxHeight: '90vh', overflow: 'auto' }}>
            <h2 className="text-xl font-bold mb-4 text-green-700 dark:text-green-200">{selectedExam.subject} Exam</h2>
            <div className="mb-4 font-semibold text-blue-700 dark:text-blue-200">
              Time Remaining: {Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2,'0')} mins
              {timeUp && <span className="ml-2 text-red-600 font-semibold">Time is up!</span>}
            </div>
            <div className="space-y-6">
              {selectedExam.questions.slice(page*3, page*3+3).map((q: any, idx: number) => {
                const realIdx = page*3 + idx;
                return (
                  <div key={realIdx} className="p-4 rounded bg-gray-50 dark:bg-gray-800">
                    <div className="font-semibold mb-2">Q{realIdx+1}. {q.question}</div>
                    {q.type === 'multiple-choice' && (
                      <ul className="mb-2">
                        {q.options.map((opt: string, i: number) => (
                          <li key={i} className="mb-1">
                            <label className="inline-flex items-center">
                              <input
                                type="radio"
                                name={`q${realIdx}`}
                                className="mr-2"
                                checked={answers[realIdx] === i}
                                onChange={() => !timeUp && handleAnswer(realIdx, i)}
                                disabled={timeUp}
                              />
                              {opt}
                            </label>
                          </li>
                        ))}
                      </ul>
                    )}
                    {q.type === 'essay' && (
                      <textarea
                        className="w-full p-2 border rounded"
                        rows={4}
                        placeholder="Type your answer here..."
                        value={answers[realIdx] || ''}
                        onChange={e => !timeUp && handleAnswer(realIdx, e.target.value)}
                        disabled={timeUp}
                      ></textarea>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center mt-6">
              <button
                className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold"
                onClick={() => setPage(p => Math.max(0, p-1))}
                disabled={page === 0}
              >Back</button>
              <span className="text-sm font-semibold">Page {page+1} of {Math.ceil(selectedExam.questions.length/3)}</span>
              <button
                className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold"
                onClick={() => setPage(p => Math.min(Math.ceil(selectedExam.questions.length/3)-1, p+1))}
                disabled={page >= Math.ceil(selectedExam.questions.length/3)-1}
              >Next</button>
            </div>
            <div className="mt-6 text-center">
              <button className="px-6 py-2 rounded bg-blue-600 text-white font-semibold" onClick={handleSubmit}>Submit & Exit</button>
            </div>
          </div>
        </div>
      )}

      {/* Score Modal */}
      {showScoreModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl max-w-md w-full text-center">
            <h2 className="text-xl font-bold mb-4 text-green-700 dark:text-green-200">Exam Results</h2>
            <div className="mb-2 font-semibold text-blue-700 dark:text-blue-200">Score: {score} / {selectedExam?.questions.filter((q:any)=>q.type==='multiple-choice').length}</div>
            {failedQuestions.length > 0 ? (
              <div className="mb-4 text-left" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                <div className="font-semibold text-red-600 mb-2">Questions you missed:</div>
                <ul className="list-disc ml-6">
                  {failedQuestions.map((fq, i) => (
                    <li key={i} className="mb-2">
                      <div className="font-medium">Q{fq.idx+1}: {fq.question}</div>
                      <div className="text-sm text-gray-700">Correct Answer: <span className="font-semibold">{fq.correctAnswer}</span></div>
                      {selectedExam?.questions[fq.idx]?.explanation && (
                        <div className="text-xs text-gray-500 mt-1">Explanation: {selectedExam.questions[fq.idx].explanation}</div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mb-4 text-green-700 font-semibold">Great job! You got all multiple-choice questions correct.</div>
            )}
            <button className="px-6 py-2 rounded bg-green-600 text-white font-semibold" onClick={() => { setShowScoreModal(false); setShowDoneModal(true); setPendingExamKey(getExamKey(selectedExam, selectedExam?._examIdx)); }}>Close</button>
          </div>
        </div>
      )}

      {/* Done/Redo Modal */}
      {showDoneModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl max-w-md w-full text-center">
            <h2 className="text-xl font-bold mb-4 text-green-700 dark:text-green-200">Mark Exam Status</h2>
            <div className="mb-4 text-gray-700 dark:text-gray-200">Would you like to mark this exam as <span className="font-semibold">Done</span> or <span className="font-semibold">Redo</span>?<br />You can always redo later.</div>
            <div className="flex justify-center gap-4 mb-4">
              <button className="px-6 py-2 rounded bg-green-600 text-white font-semibold" onClick={() => handleMarkDone('Done')}>Mark as Done</button>
              <button className="px-6 py-2 rounded bg-yellow-500 text-white font-semibold" onClick={() => handleMarkDone('Redo')}>Redo Again</button>
            </div>
            <button className="text-sm text-gray-500" onClick={() => handleMarkDone('Not yet')}>Cancel</button>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-400 mt-8">Multiple choice and essay with timer.</div>
    </div>
  );
};

export default VacationStudyChallenges;
