import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../axiosClient';
import { useNavigate } from 'react-router-dom';

// Constants
const difficultyOptions = ['easy', 'medium', 'hard'];
const tagOptions = ['array', 'linkedList', 'tree', 'graph', 'dynamicProgramming', 'greedy', 'backtracking', 'sorting', 'searching','twoPointer', 'string', 'stack'];
const languageOptions = ['JavaScript', 'Python', 'Java', 'C++'];

// Define Zod schema - UPDATED to include judgeWrapperCode
const problemSchema = z.object({
  title: z.string().min(1, "Title is required").max(30, "Title must be 30 characters or less"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  visibleTestCases: z.array(
    z.object({
      input: z.string().min(1, "Input is required"),
      output: z.string().min(1, "Output is required"),
      explanation: z.string().min(1, "Explanation is required"),
    })
  ).min(1, "At least one visible test case is required"),
  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1, "Input is required"),
      output: z.string().min(1, "Output is required"),
    })
  ).min(1, "At least one hidden test case is required"),
  startCode: z.array(
    z.object({
      language: z.string().min(1, "Language is required"),
      initialCode: z.string().min(1, "Initial code is required"),
    })
  ).min(1, "At least one starter code is required"),
  referenceSol: z.array(
    z.object({
      language: z.string().min(1, "Language is required"),
      Code: z.string().min(1, "Solution code is required"),
    })
  ).min(1, "At least one reference solution is required"),
  judgeWrapperCode: z.array(
    z.object({
      language: z.string().min(1, "Language is required"),
      Code: z.string().min(1, "Wrapper code is required"),
    })
  ).min(1, "At least one judge wrapper code is required"),
});

// NEW: Validation Error Modal Component
const ValidationErrorModal = ({ isOpen, validationErrors, onClose }) => {
  if (!isOpen || !validationErrors) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-6xl max-h-[90vh] overflow-y-auto bg-zinc-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-xl text-red-400 flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            Reference Solution Validation Failed
          </h3>
          <button 
            onClick={onClose}
            className="btn btn-sm btn-circle bg-zinc-700 hover:bg-zinc-600 border-none text-zinc-300"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-6">
          {validationErrors.map((langError, langIndex) => (
            <div key={langIndex} className="border border-red-500/30 rounded-lg p-4 bg-red-500/5">
              <h4 className="font-semibold text-lg mb-4 flex items-center gap-2 text-zinc-100">
                <span className="text-red-400">❌</span>
                <span className="bg-red-600 text-white px-2 py-1 rounded text-sm font-mono">
                  {langError.language}
                </span>
                <span>Failed Validation</span>
              </h4>
              
              <div className="space-y-4">
                {langError.failures.map((failure, failIndex) => (
                  <div key={failIndex} className="bg-zinc-700/50 rounded-lg p-4 border border-zinc-600/50">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        failure.testType === 'visible' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-purple-600 text-white'
                      }`}>
                        {failure.testType.charAt(0).toUpperCase() + failure.testType.slice(1)} Test Case {failure.testIndex}
                      </span>
                      <span className="text-red-400 text-sm font-medium">
                        {failure.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-medium mb-2 text-zinc-300">Input:</div>
                        <div className="bg-zinc-800 p-3 rounded border font-mono text-zinc-300 max-h-32 overflow-y-auto whitespace-pre-wrap">
                          {failure.input || 'No input'}
                        </div>
                      </div>
                      
                      <div>
                        <div className="font-medium mb-2 text-zinc-300">Expected Output:</div>
                        <div className="bg-zinc-800 p-3 rounded border font-mono text-green-300 max-h-32 overflow-y-auto whitespace-pre-wrap">
                          {failure.expected}
                        </div>
                      </div>
                      
                      <div>
                        <div className="font-medium mb-2 text-zinc-300">Actual Output:</div>
                        <div className="bg-zinc-800 p-3 rounded border font-mono text-red-300 max-h-32 overflow-y-auto whitespace-pre-wrap">
                          {failure.actual}
                        </div>
                      </div>
                    </div>
                    
                    {failure.error && failure.error !== 'No error details' && (
                      <div className="mt-4">
                        <div className="font-medium mb-2 text-zinc-300">Error Details:</div>
                        <div className="bg-zinc-800 p-3 rounded border font-mono text-red-300 text-sm max-h-24 overflow-y-auto whitespace-pre-wrap">
                          {failure.error}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="modal-action mt-6">
          <button 
            className="btn bg-red-600 hover:bg-red-500 text-white border-none"
            onClick={onClose}
          >
            Close and Fix Issues
          </button>
        </div>
      </div>
    </div>
  );
};

function CreateProblemForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // NEW: State for validation error handling
  const [validationErrors, setValidationErrors] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  
  const navigate = useNavigate();
  
  // Helper components
  const SectionHeader = ({ title, subtitle }) => (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-zinc-100">{title}</h2>
      <p className="text-zinc-400">{subtitle}</p>
    </div>
  );
  
  function FormField({ label, error, children, className }) {
    return (
      <div className={`form-control flex flex-col ${className || ""}`}>
        {label && (
          <label className="mb-1 font-medium text-sm text-zinc-300">
            {label}
          </label>
        )}
        {children}
        {error && (
          <p className="text-red-400 text-xs mt-1">{error}</p>
        )}
      </div>
    );
  }

  // Initialize react-hook-form with Zod resolver
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      title: '',
      description: '',
      difficulty: 'easy',
      tags: [],
      visibleTestCases: [{ input: '', output: '', explanation: '' }],
      hiddenTestCases: [{ input: '', output: '' }],
      startCode: [{ language: 'JavaScript', initialCode: '' }],
      referenceSol: [{ language: 'JavaScript', Code: '' }],
      judgeWrapperCode: [{ language: 'JavaScript', Code: '' }],
    },
  });

  // Field arrays for dynamic sections
  const {
    fields: visibleTestCases,
    append: appendVisibleTestCase,
    remove: removeVisibleTestCase,
  } = useFieldArray({
    control,
    name: 'visibleTestCases',
  });

  const {
    fields: hiddenTestCases,
    append: appendHiddenTestCase,
    remove: removeHiddenTestCase,
  } = useFieldArray({
    control,
    name: 'hiddenTestCases',
  });

  const {
    fields: startCodeFields,
    append: appendStartCode,
    remove: removeStartCode,
  } = useFieldArray({
    control,
    name: 'startCode',
  });

  const {
    fields: referenceSolFields,
    append: appendReferenceSol,
    remove: removeReferenceSol,
  } = useFieldArray({
    control,
    name: 'referenceSol',
  });

  const {
    fields: judgeWrapperCodeFields,
    append: appendJudgeWrapperCode,
    remove: removeJudgeWrapperCode,
  } = useFieldArray({
    control,
    name: 'judgeWrapperCode',
  });

  // UPDATED: Enhanced onSubmit with validation error handling
  const onSubmit = async(data) => {
    try {
      setIsSubmitting(true);
      setValidationErrors(null); // Clear previous errors
      console.log("Submitting problem data:", data);
      const result = await axiosClient.post('/problem/create', data);
      alert("Problem created successfully!");
      navigate('/admin/menu');
    }
    catch (error) {
      console.error("Error submitting problem data:", error);
      
      // Handle validation errors specifically
      if (error.response?.data?.type === 'VALIDATION_ERROR') {
        setValidationErrors(error.response.data.validationErrors);
        setShowErrorModal(true);
      } else {
        // Handle other errors (network, server, etc.)
        const errorMessage = error.response?.data?.error || 
                            error.response?.data?.message || 
                            error.message || 
                            'An unknown error occurred';
        alert(`Error: ${errorMessage}`);
      }
    }
    finally {
      setIsSubmitting(false);
    }
  };

  // NEW: Function to close error modal
  const closeErrorModal = () => {
    setShowErrorModal(false);
    setValidationErrors(null);
  };

  // Handle tag changes
  const handleTagChange = (tag) => {
    const currentTags = getValues('tags');
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    setValue('tags', newTags);
  };

  return (
    <>
      {/* NEW: Validation Error Modal */}
      <ValidationErrorModal 
        isOpen={showErrorModal}
        validationErrors={validationErrors}
        onClose={closeErrorModal}
      />
      
      <div className="min-h-screen bg-zinc-900 text-zinc-300 font-sans p-4 sm:p-6 md:p-8" style={{ paddingTop: "8rem" }}> 
        <div className="max-w-5xl mx-auto">
          <header className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-zinc-100">Create a New Coding Problem</h1>
            <p className="text-zinc-400 mt-2">Fill out the form below to define your problem, test cases, and solutions.</p>
          </header>
          <main>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Problem Details */}
              <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg shadow-2xl shadow-zinc-950/50 p-6">
                <SectionHeader title="Problem Details" subtitle="Core information about the coding challenge." />
                <div className="flex gap-4 mb-4">
                  <FormField label="Title" error={errors.title?.message} className="flex-1">
                    <input
                      type="text"
                      {...register('title')}
                      className="input w-full bg-zinc-800 border border-zinc-600 text-zinc-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="e.g., Two Sum"
                    />
                  </FormField>
                  <FormField label="Difficulty" error={errors.difficulty?.message} className="w-40">
                    <select
                      {...register('difficulty')}
                      className="select select-bordered w-full bg-zinc-800 border-zinc-700 text-zinc-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      {difficultyOptions.map(opt => (
                        <option key={opt} value={opt}>
                          {opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>
                <FormField label="Description" error={errors.description?.message}>
                  <textarea
                    {...register('description')}
                    className="textarea w-full bg-zinc-800 border border-zinc-600 text-zinc-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Provide a clear and concise problem statement..."
                    rows="4"
                  ></textarea>
                </FormField>
                
                <FormField label="Tags" error={errors.tags?.message}>
                  <div className="flex flex-wrap gap-3 p-4 bg-zinc-700/30 rounded-lg border border-zinc-600">
                    {tagOptions.map(tag => (
                      <div 
                        key={tag} 
                        className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all duration-200 ${
                          watch('tags')?.includes(tag) 
                            ? 'bg-red-600 text-white shadow-md' 
                            : 'bg-zinc-600/50 hover:bg-zinc-600'
                        }`}
                        onClick={() => handleTagChange(tag)}
                      >
                        <span className="text-sm font-medium capitalize">
                          {tag.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        {watch('tags')?.includes(tag) && (
                          <span className="text-xs">✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                </FormField>
              </div>

              {/* Visible Test Cases */}
              <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg shadow-2xl shadow-zinc-950/50 p-6">
                <SectionHeader title="Visible Test Cases" subtitle="Examples shown to the user to help them understand the problem." />
                {visibleTestCases.map((testCase, index) => (
                  <div key={testCase.id} className="p-4 border border-zinc-600 rounded-lg space-y-4 relative mb-4 bg-zinc-700/30">
                    <span className="absolute -top-3 -left-3 px-3 py-1 bg-red-600 text-white text-sm font-bold rounded-full">#{index + 1}</span>
                    {visibleTestCases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVisibleTestCase(index)}
                        className="absolute -top-3 -right-3 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-500"
                      >
                        ×
                      </button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField label="Input" error={errors.visibleTestCases?.[index]?.input?.message}>
                        <textarea
                          {...register(`visibleTestCases.${index}.input`)}
                          className="textarea w-full bg-zinc-800 border border-zinc-600 text-zinc-300 rounded-md p-3 font-mono focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="e.g., 2 7 11 15\n9"
                          rows="3"
                        ></textarea>
                      </FormField>
                      <FormField label="Output" error={errors.visibleTestCases?.[index]?.output?.message}>
                        <textarea
                          {...register(`visibleTestCases.${index}.output`)}
                          className="textarea w-full bg-zinc-800 border border-zinc-600 text-zinc-300 rounded-md p-3 font-mono focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="e.g., 0 1"
                          rows="3"
                        ></textarea>
                      </FormField>
                    </div>
                    <FormField label="Explanation" error={errors.visibleTestCases?.[index]?.explanation?.message}>
                      <textarea
                        {...register(`visibleTestCases.${index}.explanation`)}
                        className="textarea w-full bg-zinc-800 border border-zinc-600 text-zinc-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="Explain why the output is correct for the given input."
                        rows="2"
                      ></textarea>
                    </FormField>
                  </div>
                ))}
                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={() => appendVisibleTestCase({ input: '', output: '', explanation: '' })}
                    className="btn bg-red-600 hover:bg-red-500 text-white border-none"
                  >
                    Add Visible Test Case
                  </button>
                </div>
              </div>

              {/* Hidden Test Cases */}
              <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg shadow-2xl shadow-zinc-950/50 p-6">
                <SectionHeader title="Hidden Test Cases" subtitle="Used for judging the solution's correctness. Not visible to the user." />
                {hiddenTestCases.map((testCase, index) => (
                  <div key={testCase.id} className="p-4 border border-zinc-600 rounded-lg space-y-4 relative mb-4 bg-zinc-700/30">
                    <span className="absolute -top-3 -left-3 px-3 py-1 bg-red-600 text-white text-sm font-bold rounded-full">#{index + 1}</span>
                    {hiddenTestCases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeHiddenTestCase(index)}
                        className="absolute -top-3 -right-3 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-500"
                      >
                        ×
                      </button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField label="Input" error={errors.hiddenTestCases?.[index]?.input?.message}>
                        <textarea
                          {...register(`hiddenTestCases.${index}.input`)}
                          className="textarea w-full bg-zinc-800 border border-zinc-600 text-zinc-300 rounded-md p-3 font-mono focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="e.g., 3 3\n6"
                          rows="3"
                        ></textarea>
                      </FormField>
                      <FormField label="Output" error={errors.hiddenTestCases?.[index]?.output?.message}>
                        <textarea
                          {...register(`hiddenTestCases.${index}.output`)}
                          className="textarea w-full bg-zinc-800 border border-zinc-600 text-zinc-300 rounded-md p-3 font-mono focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="e.g., 0 1"
                          rows="3"
                        ></textarea>
                      </FormField>
                    </div>
                  </div>
                ))}
                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={() => appendHiddenTestCase({ input: '', output: '' })}
                    className="btn bg-red-600 hover:bg-red-500 text-white border-none"
                  >
                    Add Hidden Test Case
                  </button>
                </div>
              </div>

              {/* Starter Code */}
              <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg shadow-2xl shadow-zinc-950/50 p-6">
                <SectionHeader 
                  title="Starter Code" 
                  subtitle="Provide boilerplate code for different languages. Users will only see and modify this code." 
                />
                {startCodeFields.map((code, index) => (
                  <div key={code.id} className="p-4 border border-zinc-600 rounded-lg space-y-4 relative mb-4 bg-zinc-700/30">
                    <span className="absolute -top-3 -left-3 px-3 py-1 bg-red-600 text-white text-sm font-bold rounded-full">#{index + 1}</span>
                    {startCodeFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStartCode(index)}
                        className="absolute -top-3 -right-3 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-500"
                      >
                        ×
                      </button>
                    )}
                    <FormField label="Language" error={errors.startCode?.[index]?.language?.message}>
                      <select
                        {...register(`startCode.${index}.language`)}
                        className="select select-bordered w-full bg-zinc-800 border-zinc-700 text-zinc-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      >
                        {languageOptions.map(lang => (
                          <option key={lang} value={lang}>{lang}</option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="Initial Code" error={errors.startCode?.[index]?.initialCode?.message}>
                      <textarea
                        {...register(`startCode.${index}.initialCode`)}
                        className="textarea w-full bg-zinc-800 border border-zinc-600 text-zinc-300 rounded-md p-3 font-mono focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder={`// Example for ${watch(`startCode.${index}.language`)} starter code:\nvar twoSum = function(nums, target) {\n    // Write your code here\n    \n};`}
                        rows="8"
                      ></textarea>
                    </FormField>
                  </div>
                ))}
                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={() => appendStartCode({ language: 'JavaScript', initialCode: '' })}
                    className="btn bg-red-600 hover:bg-red-500 text-white border-none"
                  >
                    Add Starter Code
                  </button>
                </div>
              </div>

              {/* Judge Wrapper Code Section */}
              <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg shadow-2xl shadow-zinc-950/50 p-6">
                <SectionHeader 
                  title="Judge Wrapper Code" 
                  subtitle="Code that wraps the user's solution for Judge0 execution. Use {USER_CODE} placeholder where user code should be inserted." 
                />
                <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-yellow-400 text-sm">
                    <strong>Important:</strong> Use <code className="bg-yellow-500/20 px-1 rounded">{"{USER_CODE}"}</code> as a placeholder where the user's code will be inserted.
                    This wrapper handles input/output formatting for Judge0.
                  </p>
                </div>
                {judgeWrapperCodeFields.map((wrapper, index) => (
                  <div key={wrapper.id} className="p-4 border border-zinc-600 rounded-lg space-y-4 relative mb-4 bg-zinc-700/30">
                    <span className="absolute -top-3 -left-3 px-3 py-1 bg-red-600 text-white text-sm font-bold rounded-full">#{index + 1}</span>
                    {judgeWrapperCodeFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeJudgeWrapperCode(index)}
                        className="absolute -top-3 -right-3 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-500"
                      >
                        ×
                      </button>
                    )}
                    <FormField label="Language" error={errors.judgeWrapperCode?.[index]?.language?.message}>
                      <select
                        {...register(`judgeWrapperCode.${index}.language`)}
                        className="select select-bordered w-full bg-zinc-800 border-zinc-700 text-zinc-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      >
                        {languageOptions.map(lang => (
                          <option key={lang} value={lang}>{lang}</option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="Wrapper Code" error={errors.judgeWrapperCode?.[index]?.Code?.message}>
                      <textarea
                        {...register(`judgeWrapperCode.${index}.Code`)}
                        className="textarea w-full bg-zinc-800 border border-zinc-600 text-zinc-300 rounded-md p-3 font-mono focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder={`// Example wrapper for JavaScript:\nconst input = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');\nconst nums = input[0].split(' ').map(Number);\nconst target = parseInt(input[1]);\n\n{USER_CODE}\n\nconst result = twoSum(nums, target);\nconsole.log(result[0] + ' ' + result[1]);`}
                        rows="12"
                      ></textarea>
                    </FormField>
                  </div>
                ))}
                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={() => appendJudgeWrapperCode({ language: 'JavaScript', Code: '' })}
                    className="btn bg-red-600 hover:bg-red-500 text-white border-none"
                  >
                    Add Judge Wrapper Code
                  </button>
                </div>
              </div>
              
              {/* Reference Solution */}
              <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg shadow-2xl shadow-zinc-950/50 p-6">
                <SectionHeader 
                  title="Reference Solution" 
                  subtitle="Provide a correct solution for different languages. Only include the main function, not the wrapper code." 
                />
                {referenceSolFields.map((sol, index) => (
                  <div key={sol.id} className="p-4 border border-zinc-600 rounded-lg space-y-4 relative mb-4 bg-zinc-700/30">
                    <span className="absolute -top-3 -left-3 px-3 py-1 bg-red-600 text-white text-sm font-bold rounded-full">#{index + 1}</span>
                    {referenceSolFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeReferenceSol(index)}
                        className="absolute -top-3 -right-3 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-500"
                      >
                        ×
                      </button>
                    )}
                    <FormField label="Language" error={errors.referenceSol?.[index]?.language?.message}>
                      <select
                        {...register(`referenceSol.${index}.language`)}
                        className="select select-bordered w-full bg-zinc-800 border-zinc-700 text-zinc-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      >
                        {languageOptions.map(lang => (
                          <option key={lang} value={lang}>{lang}</option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="Solution Code" error={errors.referenceSol?.[index]?.Code?.message}>
                      <textarea
                        {...register(`referenceSol.${index}.Code`)}
                        className="textarea w-full bg-zinc-800 border border-zinc-600 text-zinc-300 rounded-md p-3 font-mono focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder={`// Example solution for ${watch(`referenceSol.${index}.language`)}:\nvar twoSum = function(nums, target) {\n    const numMap = new Map();\n    \n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (numMap.has(complement)) {\n            return [numMap.get(complement), i];\n        }\n        numMap.set(nums[i], i);\n    }\n    return [];\n};`}
                        rows="8"
                      ></textarea>
                    </FormField>
                  </div>
                ))}
                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={() => appendReferenceSol({ language: 'JavaScript', Code: '' })}
                    className="btn bg-red-600 hover:bg-red-500 text-white border-none"
                  >
                    Add Reference Solution
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center mt-8">
                <button 
                  type="submit" 
                  className="btn bg-red-600 hover:bg-red-500 text-white border-none text-lg px-8 py-3"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Problem'
                  )}
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </>
  );
}

export default CreateProblemForm;
