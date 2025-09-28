import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Editor from '@monaco-editor/react';
import axios from '../axiosClient';
import ByteBuddyChat from './ByteBuddy_Chat';
import VideoSolution from './videoSolution';
import { logoutUser } from '../authSlice';

import { useNavigate } from "react-router";

const ProblemInterface = () => {

  const navigate = useNavigate();
  const { p_id } = useParams();
  const id = p_id;
  const dispatch = useDispatch();
  // State variables
  
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [solutionsLanguage, setSolutionsLanguage] = useState('javascript');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResults, setRunResults] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [leftPanelTab, setLeftPanelTab] = useState('description');
  const [ini_Code, setIni_Code] = useState(null);
  const [showSolutions, setShowSolutions] = useState(false);

  const editorRef = useRef(null);
  const { isAuthenticated,user } = useSelector((state) => state.auth);
  const isGuest = user?.firstName === 'Guest';
  
  // Language options
  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'c++', label: 'C++' },
  ];

  // Fetch problem data
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`problem/fetch/${id}`);
        setProblem(response.data);
        const initialCode = response.data.startCode.find(
          (obj) => obj.language.toLowerCase() === language.toLowerCase()
        )?.initialCode || '';
        setIni_Code(initialCode)
        setCode(initialCode);
        console.log(initialCode);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load problem');
        setIsLoading(false);
        setShowSolutions(false); // Add this line after setIsLoading(false);
        console.error(err);
      }
    };

    if (isAuthenticated) {
      fetchProblem();
    }
  }, [id, isAuthenticated]);

  // Fetch user submissions
  const fetchSubmissions = async () => {
    try {
      const response = await axios.get(`/problem/${id}/userSubmissions`);
      setSubmissions(response.data);
    } catch (err) {
      console.error('Failed to fetch submissions', err);
    }
  };

  // Handle editor mount
  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };
  const handleLanguageChange = (e) => 
  {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    
    if (problem) {
      const newCode = problem.startCode.find(
        (sc) => sc.language.toLowerCase() === newLanguage.toLowerCase()
      )?.initialCode || '';
      setIni_Code(newCode);
      setCode(newCode);
    }
  };

  // Handle run code
  const handleRunCode = async () => {
    if (!code.trim()) return;
    
    setIsRunning(true);
    setRunResults(null);
    setSubmissionResult(null);
    
    try {
      const response = await axios.post(
        `/submit/run/${id}`,
        { code, language }
      );
      
      setRunResults(response.data);
      // Automatically switch to results tab
      setLeftPanelTab('results');
    } catch (err) {
      setRunResults({ error: err.response?.data || 'Failed to run code' });
      setLeftPanelTab('results');
    } finally {
      setIsRunning(false);
    }
  };

  // Handle submit code
  const handleSubmitCode = async () => {
    if (!code.trim()) return;
    
    setIsSubmitting(true);
    setSubmissionResult(null);
    setRunResults(null);
    
    try {
      const response = await axios.post(
        `/submit/${id}`,
        { code, language }
      );
      
      setSubmissionResult(response.data);
      setLeftPanelTab('results');
      fetchSubmissions();
    } catch (err) {
      setSubmissionResult({ error: err.response?.data || 'Failed to submit code' });
      setLeftPanelTab('results');
    } finally {
      setIsSubmitting(false);
    }
  };
   
  const handleClearEditor = () => {
    setCode(ini_Code);
    setRunResults(null);
    setSubmissionResult(null);
  }
  const handleLoginClick = async () => {
    if (user && user.firstName === 'Guest') {
      await dispatch(logoutUser()).unwrap();  // log out guest user
    }
    navigate('/login');
  };
  // Format status with colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'text-green-500';
      case 'wrong answer':
        return 'text-red-500';
      case 'time limit exceeded':
        return 'text-yellow-500';
      case 'runtime error':
        return 'text-orange-500';
      case 'compilation error':
        return 'text-purple-500';
      default:
        return 'text-zinc-400';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full bg-zinc-900">
        <div className="animate-spin rounded-full border-t-3 border-b-3 border-red-500 w-20 h-20" />       
      </div>   
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-900 text-zinc-300">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{error}</h2>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-500 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-900 text-zinc-300">
        Problem not found, please check the URL.
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen bg-zinc-900 text-zinc-300 overflow-hidden"  style={{"padding-top": "4rem"}}>
        {/* Left Panel - Problem Description */}
        <div className="w-1/2 flex flex-col border-r border-zinc-700/50">
          {/* Problem Header */}
          <div className="flex-shrink-0 p-6 pb-0">
            <h1 className="text-2xl font-bold text-zinc-100 mb-2">{problem.title}</h1>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                problem.difficulty === 'easy'
                  ? 'bg-green-500/20 text-green-400'
                  : problem.difficulty === 'medium'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
              </span>
              <div className="flex gap-2">
                {problem.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-zinc-700/50 rounded-md text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-b border-zinc-700/50 mb-6 flex-shrink-0">
            <button
              onClick={() => setLeftPanelTab('description')}
              className={`px-4 py-3 text-sm font-medium ${
                leftPanelTab === 'description'
                  ? 'text-red-400 border-b-2 border-red-500'
                  : 'text-zinc-400 hover:text-zinc-300'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setLeftPanelTab('solutions')}
              className={`px-4 py-3 text-sm font-medium ${
                leftPanelTab === 'solutions'
                  ? 'text-red-400 border-b-2 border-red-500'
                  : 'text-zinc-400 hover:text-zinc-300'
              }`}
            >
              Solutions
            </button>
            <button
              onClick={() => {
                setLeftPanelTab('submissions');
                fetchSubmissions();
              }}
              className={`px-4 py-3 text-sm font-medium ${
                leftPanelTab === 'submissions'
                  ? 'text-red-400 border-b-2 border-red-500'
                  : 'text-zinc-400 hover:text-zinc-300'
              }`}
            >
              Submissions
            </button>
            <button
              onClick={() => {
                setLeftPanelTab('bytebuddy');
              }}
              className={`px-4 py-3 text-sm font-medium flex items-center gap-2 ${
                leftPanelTab === 'bytebuddy'
                  ? 'text-red-400 border-b-2 border-red-500'
                  : 'text-zinc-400 hover:text-zinc-300'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              Ask ByteBuddy
            </button>
            {/* Results Tab - only show if there are results */}
            {(runResults || submissionResult) && (
              <button
              onClick={() => setLeftPanelTab('results')}
              className={`px-4 py-3 text-sm font-medium relative ${
                leftPanelTab === 'results'
                ? 'text-red-400 border-b-2 border-red-500'
                : 'text-zinc-400 hover:text-zinc-300'
              }`}
              >
                Results
                {/* Notification dot for new results */}
                {leftPanelTab !== 'results' && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </button>
            )}
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            {leftPanelTab === 'bytebuddy' ? (
              <ByteBuddyChat problem={problem} userCode={code} language={language} />
            ) : (
              <div className="h-full overflow-y-auto p-6 pt-4">
                {/* Description Tab */}      
                {leftPanelTab === 'description' && (
                  <div>
                    {/* Properly formatted description */}
                    <h2 className='text-2xl mb-8'>About problem</h2>
                    <div className="mb-8">
                      <div 
                        className="text-zinc-300 leading-relaxed whitespace-pre-line"
                        style={{ lineHeight: '1.6' }}
                      >
                        {problem.description}
                      </div>
                    </div>
                    
                    {/* Example Test Cases with proper formatting */}
                    <div className="mt-8">  
                      <h3 className="text-lg font-semibold mb-4 text-zinc-100">Example Test Cases</h3>
                      {problem.visibleTestCases.map((testCase, index) => (
                        <div key={index} className="mb-6 bg-zinc-800/50 p-4 rounded-lg border border-zinc-700/30">
                          <div className="mb-3">
                            <span className="font-medium text-zinc-400 text-sm">Input:</span>
                            <pre className="bg-zinc-700/30 p-3 rounded mt-2 overflow-x-auto text-sm font-mono text-zinc-200">
                              {testCase.input.replace(/\\n/g, '\n')}
                            </pre>
                          </div>
                          <div className="mb-3">
                            <span className="font-medium text-zinc-400 text-sm">Output:</span>
                            <pre className="bg-zinc-700/30 p-3 rounded mt-2 overflow-x-auto text-sm font-mono text-zinc-200">
                              {testCase.output.replace(/\\n/g, '\n')}
                            </pre>
                          </div>
                          {testCase.explanation && (
                            <div>
                              <span className="font-medium text-zinc-400 text-sm">Explanation:</span>
                              <p className="mt-2 text-zinc-300 leading-relaxed text-sm">{testCase.explanation}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Solutions Tab */}
                {leftPanelTab === 'solutions' && (
                  <div>
                    {!showSolutions ? (
                      <div className="text-center py-12">
                        <div className="mb-6">
                          <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <h3 className="text-lg font-semibold text-zinc-100 mb-3">Reference Solutions Available</h3>
                          <p className="text-zinc-400 mb-2">
                            It's advised to attempt the problem by yourself first.
                          </p>
                          <p className="text-zinc-400 mb-6">
                            If you can't solve it, click below to reveal the solutions.
                          </p>
                        </div>
                        <button
                          onClick={() => setShowSolutions(true)}
                          className="px-6 py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-medium rounded-lg transition-colors"
                        >
                          Reveal Solutions
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="mb-6">
                          <label htmlFor="solution-language" className="block text-sm font-medium text-zinc-400 mb-2">
                            Select Language:
                          </label>
                          <select
                            id="solution-language"
                            value={solutionsLanguage}
                            onChange={(e) => setSolutionsLanguage(e.target.value)}
                            className="bg-zinc-800 border border-zinc-600 text-zinc-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                          >
                            {languages.map(lang => (
                              <option key={lang.value} value={lang.value}>{lang.label}</option>
                            ))}
                          </select>
                        </div>
                        {problem.referenceSol && problem.referenceSol.length > 0 ? (
                          <div>
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-semibold">Reference Solution</h3>
                              <button
                                onClick={() => setShowSolutions(false)}
                                className="text-xs text-zinc-400 hover:text-zinc-300 px-2 py-1 rounded border border-zinc-600 hover:border-zinc-500"
                              >
                                Hide Solutions
                              </button>
                            </div>
                            <div className="bg-zinc-800/50 p-4 rounded-lg">
                              <pre className="text-sm text-zinc-300 overflow-x-auto">
                                {problem.referenceSol.find((sol) => 
                                  sol.language.toLowerCase() === solutionsLanguage.toLowerCase()
                                )?.Code || 'No reference solution available for this language'}
                              </pre>
                            </div>
                          </div>
                        ) : (
                          <div className="text-zinc-400 text-center py-8">
                            No reference solutions available for this problem.
                          </div>
                        )}
                        <VideoSolution secureUrl={problem.secureUrl} thumbnailUrl={problem.thumbnailUrl} duration={problem.duration} />
                      </div>
                    )}
                  </div>
                )}

                {/* Submissions Tab */}
                {leftPanelTab === 'submissions' && (
                  <div>
                    {!isGuest && (<>
                      <h3 className="text-lg font-semibold mb-4">Your Submissions</h3>
                      {submissions.length > 0 ? (
                        <div className="space-y-3">
                          {submissions.map((submission) => (
                            <div key={submission._id} className="p-4 rounded-lg bg-zinc-800/50">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-zinc-300">
                                  {new Date(submission.createdAt).toLocaleString()}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${getStatusColor(submission.status)}`}>
                                  {submission.status}
                                </span>
                              </div>
                              <div className="text-xs text-zinc-400">
                                Language: {submission.language} • Runtime: {submission.runtime}ms • Memory: {submission.memory}KB • Passed: {submission.testCasesPassed}/{submission.testCasesTotal}
                              </div>
                              {submission.errorMessage && (
                                <pre className="text-xs text-red-400 mt-2 overflow-x-auto">
                                  Error: {submission.errorMessage}
                                </pre>
                              )}
                              <button 
                                onClick={() => setSelectedSubmission(submission)}
                                className="mt-3 text-xs bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded flex items-center"
                              >
                                <i className="fas fa-code mr-1"></i> View Code
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-zinc-400 text-center py-8">
                          No submissions yet. Submit your code to see your submissions here.
                        </div>
                      )}
      
                      {/* Code Modal for Submissions */}
                      {selectedSubmission && (
                        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                          <div className="bg-zinc-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
                            <div className="flex justify-between items-center p-4 border-b border-zinc-700">
                              <h3 className="text-lg font-semibold">
                                Code Submission - {new Date(selectedSubmission.createdAt).toLocaleString()}
                              </h3>
                              <button
                                onClick={() => setSelectedSubmission(null)}
                                className="text-zinc-400 hover:text-white"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                            <div className="p-4 overflow-auto max-h-[70vh]">
                              <div className="mb-4 text-sm text-zinc-400">
                                Language: <span className="text-white">{selectedSubmission.language}</span> • 
                                Status: <span className={getStatusColor(selectedSubmission.status)}>{selectedSubmission.status}</span> • 
                                Runtime: <span className="text-white">{selectedSubmission.runtime}ms</span> • 
                                Memory: <span className="text-white">{selectedSubmission.memory}KB</span>
                              </div>
                              <pre className="bg-zinc-800 p-4 rounded text-sm overflow-x-auto">
                                <code className={`language-${selectedSubmission.language}`}>
                                  {selectedSubmission.code}
                                </code>
                              </pre>
                            </div>
                            <div className="p-4 border-t border-zinc-700 flex justify-end">
                              <button 
                                onClick={() => setSelectedSubmission(null)}
                                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded"
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>)}
                    {isGuest && (<>
                      <div className="text-center py-12">
                        <div className="mb-6">
                          <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <h3 className="text-lg font-semibold text-zinc-100 mb-3">User Login Required</h3>
                          <p className="text-zinc-400 mb-2">
                            Solution submissions are disabled for guest users.
                          </p>
                          <p className="text-zinc-400 mb-6">
                            Click below to login or register to access this feature.
                          </p>
                        </div>
                        <button
                          onClick={handleLoginClick}
                          className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg transition-colors"
                        >
                          Login
                        </button>
                      </div>
                    </>)}
                  </div>
                )}


                {/* Results Tab */}
                {leftPanelTab === 'results' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      {submissionResult ? 'Submission Results' : 'Test Results'}
                    </h3>

{/* Updated Submission Result Display */}
{/* Updated Submission Result Display */}
{submissionResult && (
  <div>
    {/* Overall Status */}
    <div className={`mb-6 p-4 rounded-lg ${
      submissionResult.status === 'accepted'
        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
        : 'bg-red-500/20 text-red-400 border border-red-500/30'
    }`}>
      <div className="font-semibold text-base mb-2">
        {submissionResult.status === 'accepted' 
          ? '🎉 Accepted! All test cases passed.' 
          : `❌ Submission failed: ${submissionResult.status}`}
      </div>
      {submissionResult.runtime > 0 && (
        <div className="text-sm mt-2 text-zinc-300">
          <div className="flex flex-wrap gap-4">
            <span>⚡ Runtime: {submissionResult.runtime}ms</span>
            <span>💾 Memory: {submissionResult.memory}KB</span>
            <span>✅ Passed: {submissionResult.testCasesPassed}/{submissionResult.testCasesTotal}</span>
          </div>
        </div>
      )}
      {submissionResult.errorMessage && (
        <div className="mt-3">
          <span className="text-sm font-medium">Error Details:</span>
          <pre className="text-sm mt-1 overflow-x-auto bg-red-500/10 p-2 rounded whitespace-pre-wrap">
            {submissionResult.errorMessage}
          </pre>
        </div>
      )}
    </div>

    {/* Individual Test Case Results - Same format as run results */}
    {submissionResult.testCases && submissionResult.testCases.length > 0 && (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-zinc-100">Hidden Test Case Results</h4>
          <div className="text-sm text-zinc-400">
            {submissionResult.testCases.filter(tc => tc.passed).length}/{submissionResult.testCases.length} passed
          </div>
        </div>
        {submissionResult.testCases.map((testCase, index) => (
          <div key={index} className="border border-zinc-700 rounded-lg overflow-hidden">
            <div className={`p-3 flex justify-between items-center ${
              testCase.passed
                ? 'bg-green-500/10 border-b border-green-500/20' 
                : 'bg-red-500/10 border-b border-red-500/20'
            }`}>
              <span className="font-medium">Hidden Test Case {index + 1}</span>
              <span className={`text-xs px-2 py-1 rounded font-medium ${
                testCase.passed
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {testCase.passed ? '✅ Passed' : '❌ Failed'}
              </span>
            </div>
            <div className="p-3 bg-zinc-800/30">
              {/* Input - Same as run results */}
              <div className="mb-3">
                <span className="text-xs text-zinc-400 font-medium">Input:</span>
                <pre className="text-xs mt-1 overflow-x-auto bg-zinc-700/50 p-2 rounded font-mono whitespace-pre">
                  {testCase.input.replace(/\\n/g, '\n')}
                </pre>
              </div>
              
              {/* Expected Output - Same as run results */}
              <div className="mb-3">
                <span className="text-xs text-zinc-400 font-medium">Expected Output:</span>
                <pre className="text-xs mt-1 overflow-x-auto bg-zinc-700/50 p-2 rounded font-mono whitespace-pre">
                  {testCase.expectedOutput.replace(/\\n/g, '\n')}
                </pre>
              </div>
              
              {/* User's Output - Same styling as run results */}
              <div className="mb-3">
                <span className="text-xs text-zinc-400 font-medium">Your Output:</span>
                <pre className={`text-xs mt-1 overflow-x-auto p-2 rounded font-mono whitespace-pre ${
                  testCase.passed
                    ? 'bg-green-500/10 text-green-300' 
                    : 'bg-red-500/10 text-red-300'
                }`}>
                  {testCase.actualOutput.replace(/\\n/g, '\n') || 'No output'}
                </pre>
              </div>
              
              {/* Error (if any) - Same as run results */}
              {testCase.error && (
                <div>
                  <span className="text-xs text-red-400 font-medium">Error:</span>
                  <pre className="text-xs text-red-400 mt-1 overflow-x-auto bg-red-500/10 p-2 rounded font-mono whitespace-pre">
                    {testCase.error.replace(/\\n/g, '\n')}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}



                    {/* Run Results */}
                    {runResults && (
                      <div>
                        {Array.isArray(runResults) ? (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium text-zinc-100">Test Case Results</h4>
                              <div className="text-sm text-zinc-400">
                                {runResults.filter(r => r.status?.id === 3).length}/{runResults.length} passed
                              </div>
                            </div>
                            {runResults.map((result, index) => (
                              <div key={index} className="border border-zinc-700 rounded-lg overflow-hidden">
                                <div className={`p-3 flex justify-between items-center ${
                                  result.status?.id === 3 
                                    ? 'bg-green-500/10 border-b border-green-500/20' 
                                    : 'bg-red-500/10 border-b border-red-500/20'
                                }`}>
                                  <span className="font-medium">Test Case {index + 1}</span>
                                  <span className={`text-xs px-2 py-1 rounded font-medium ${
                                    result.status?.id === 3
                                      ? 'bg-green-500/20 text-green-400'
                                      : 'bg-red-500/20 text-red-400'
                                  }`}>
                                    {result.status?.id === 3 ? '✅ Passed' : '❌ Failed'}
                                  </span>
                                </div>
                                <div className="p-3 bg-zinc-800/30">
                                  {problem?.visibleTestCases?.[index] && (
                                    <>
                                      <div className="mb-3">
                                        <span className="text-xs text-zinc-400 font-medium">Input:</span>
                                        <pre className="text-xs mt-1 overflow-x-auto bg-zinc-700/50 p-2 rounded font-mono whitespace-pre">
                                          {problem.visibleTestCases[index].input.replace(/\\n/g, '\n')}
                                        </pre>
                                      </div>
                                      <div className="mb-3">
                                        <span className="text-xs text-zinc-400 font-medium">Expected Output:</span>
                                        <pre className="text-xs mt-1 overflow-x-auto bg-zinc-700/50 p-2 rounded font-mono whitespace-pre">
                                          {problem.visibleTestCases[index].output.replace(/\\n/g, '\n')}
                                        </pre>
                                      </div>
                                    </>
                                  )}
                                  {result.stdout && (
                                    <div className="mb-3">
                                      <span className="text-xs text-zinc-400 font-medium">Your Output:</span>
                                      <pre className={`text-xs mt-1 overflow-x-auto p-2 rounded font-mono whitespace-pre ${
                                        result.status?.id === 3 
                                          ? 'bg-green-500/10 text-green-300' 
                                          : 'bg-red-500/10 text-red-300'
                                      }`}>
                                        {result.stdout.replace(/\\n/g, '\n')}
                                      </pre>
                                    </div>
                                  )}
                                  {result.stderr && (
                                    <div>
                                      <span className="text-xs text-red-400 font-medium">Error:</span>
                                      <pre className="text-xs text-red-400 mt-1 overflow-x-auto bg-red-500/10 p-2 rounded font-mono whitespace-pre">
                                        {result.stderr.replace(/\\n/g, '\n')}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : runResults.error ? (
                          <div className="bg-red-500/20 text-red-400 p-4 rounded-lg border border-red-500/30">
                            <div className="font-medium mb-2">❌ Execution Error</div>
                            <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                              {runResults.error}
                            </pre>
                          </div>
                        ) : null}
                      </div>
                    )}

                    {!runResults && !submissionResult && (
                      <div className="text-zinc-400 text-center py-12">
                        <div className="text-lg mb-2">No results yet</div>
                        <div className="text-sm">Run or submit your code to see results here</div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="w-1/2 flex flex-col h-full relative">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-700/50 bg-zinc-800/30">
            <div className="flex items-center gap-4">
              <select
                value={language}
                onChange={handleLanguageChange}
                className="bg-zinc-800 border border-zinc-600 text-zinc-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
              >
                {languages.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 items-center">
    <button
      onClick={handleClearEditor}
      className="p-2 text-zinc-400 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      title="Clear editor"
    >
      {/* SVG icon */}
    </button>
    <button
      onClick={handleRunCode}
      disabled={isRunning}
      className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-blue-500 disabled:opacity-50"
    >
      {isRunning ? 'Running...' : 'Run'}
    </button>
    {!isGuest && (
      <button
        onClick={handleSubmitCode}
        disabled={isSubmitting}
        className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-red-500 disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    )}
    {isGuest && (
          <button
          onClick={handleLoginClick}
          className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-red-500 disabled:opacity-50"
        >
          {'Log in to submit'}
        </button>
    )}
  </div>
          </div>

          {/* Code Editor - Full height */}
          <div className="flex-grow">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={setCode}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ProblemInterface;