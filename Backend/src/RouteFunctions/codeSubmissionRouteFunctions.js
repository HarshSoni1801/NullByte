const problemCollection = require('../models/problemSchema');
const problemSubmissionCollection = require('../models/problemSubmissionSchema');
const axios = require('axios');
require('dotenv').config(); // for reading environment variables

// Helper function to combine user code with wrapper code
function combineUserCodeWithWrapper(userCode, wrapperCode) {
   return wrapperCode.replace('{USER_CODE}', userCode);
}
function mapJudge0Status(judgeStatus) {
   switch (judgeStatus.id) {
     case 1: 
     case 2: 
       return 'pending';
     case 3: 
       return 'accepted';
     case 4: 
       return 'wrong answer';
     case 5: 
       return 'time limit exceeded';
     case 6: 
       return 'compilation error';
     case 7: 
     case 8: 
     case 9: 
     case 10: 
     case 11: 
     case 12: 
       return 'runtime error';
     default:
       return 'runtime error'; // fallback instead of 'error'
   }
 }
function getLanguageId(lang) {
   const ids = {
      "c++": 53,
      "java": 62,
      "python": 71,
      "javascript": 63,
      "c": 50,
      "c#": 51,
   }
   return ids[lang.toLowerCase()];
}

async function submitCode(req, res) {
   try {
      console.log("Code submission request received"); 
      const userId = req.result._id;
      const problemId = req.params.id;
      const { code, language } = req.body;
      
      if (!userId || !problemId || !code || !language)
         return res.status(400).send("All fields are required during submission");
      
      const problem = await problemCollection.findById(problemId);
      if (!problem) {
         return res.status(404).send("Problem not found");
      }
      
      // Find the wrapper code for the user's language
      const wrapper = problem.judgeWrapperCode.find(w => w.language.toLowerCase() === language.toLowerCase());
      if (!wrapper) {
         return res.status(400).send(`No wrapper code found for language: ${language}`);
      }
      
      // Combine user code with wrapper code
      const fullCode = combineUserCodeWithWrapper(code, wrapper.Code);
      console.log("Combined code length:", fullCode.length);

      const submittedProblem = await problemSubmissionCollection.create({
         userId,
         problemId,
         code, // Store the user's original code, not the full code
         language,
         status: 'pending',
         testCasesTotal: problem.hiddenTestCases.length,
      })

      async function submitBatch(submissions) {
         const options = {
            method: 'POST',
            url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
            params: {
               base64_encoded: 'false'
            },
            headers: {
               'x-rapidapi-key': process.env.JUDGE0_API_KEY,
               'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
               'Content-Type': 'application/json'
            },
            data: { submissions }
         };
         
         async function fetchData() {
            try {
               const response = await axios.request(options);
               return (response.data);
            } catch (error) {
               console.log("Error fetching submission results in submitBatch function: " + error.message);
               throw error;
            }
         }
         return await fetchData();
      }
      
      async function submitToken(tokensArray) {
         const options = {
            method: 'GET',
            url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
            params: {
               tokens: tokensArray.join(','),
               base64_encoded: 'false',
               fields: '*'
            },
            headers: {
               'x-rapidapi-key': process.env.JUDGE0_API_KEY,
               'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
            }
         };
         
         async function fetchData() {
            try {
               const response = await axios.request(options);
               return (response.data);
            } catch (error) {
               console.log("Error fetching submission results in submitToken function: " + error.message);
               throw error;
            }
         }
         
         while (true) {
            const result = await fetchData();
            const resultCheck = result.submissions.every((r) => r.status.id > 2);
            if (resultCheck)
               return result.submissions;
            await new Promise(resolve => setTimeout(resolve, 1000)); // Fixed setTimeout usage
         }
      }
      
      if (!getLanguageId(language))
         throw new Error('Invalid language provided for submission');
      
      const languageId = getLanguageId(language);
      
      // Use fullCode (user code + wrapper) for Judge0 submission
      const submissions = problem.hiddenTestCases.map((testCase) => {
         return {
            source_code: fullCode, // Use combined code
            language_id: languageId,
            stdin: testCase.input,
            expected_output: testCase.output
         }
      });
      
      console.log("Submissions created for", submissions.length, "test cases");
      const submissionResult = await submitBatch(submissions);
      const submissionTokens = submissionResult.map(submission => submission.token);
      const tokenSubmissionResult = await submitToken(submissionTokens);
      
      let testCasesPassed = 0, runTime = 0, memory = 0, errorMessage = '', status = "accepted";
      
      // Create detailed test case results array (but don't store in DB)
      console.log(tokenSubmissionResult);
      const testCaseResults = tokenSubmissionResult.map((test, index) => {
         const mappedStatus = mapJudge0Status(test.status);
         const passed = mappedStatus === 'accepted';
         
         if (passed) {
            testCasesPassed++;
            runTime += parseFloat(test.time || 0);
            memory = Math.max(memory, parseInt(test.memory || 0));
         } else if (status === 'accepted') {
            status = mappedStatus;
            errorMessage = test.stderr || test.compile_output || 'Error occurred';
         }
         
         return {
            input: problem.hiddenTestCases[index].input,
            expectedOutput: problem.hiddenTestCases[index].output,
            actualOutput: test.stdout || '',
            error: test.stderr || test.compile_output || '',
            passed: passed,
            runtime: parseFloat(test.time || 0) * 1000, // Convert to milliseconds
            memory: parseInt(test.memory || 0)
         };
      });
      
      submittedProblem.status = status;
      submittedProblem.runtime = Math.round(runTime * 1000); // Convert to milliseconds
      submittedProblem.memory = memory;
      submittedProblem.testCasesPassed = testCasesPassed;
      submittedProblem.errorMessage = errorMessage;
      await submittedProblem.save();

      // Only add to solved problems if all test cases passed
      if (status === 'accepted' && !req.result.problemSolved.includes(problemId)) {
         req.result.problemSolved.push(problemId);
         await req.result.save();
      }
      
      // Return both the submission summary AND the detailed test case results
      const response = {
         ...submittedProblem.toObject(), // Keep all the original fields
         testCases: testCaseResults // Add detailed test case results for frontend display
      };
      
      res.status(200).send(response);
   }
   catch (err) {
      console.error("Submission error:", err);
      res.status(500).send("Error in code submission: " + err.message);
   }
}

async function runCode(req, res) {
   try {
      console.log("Code run request received"); 
      const userId = req.result._id;
      const problemId = req.params.id;
      const { code, language } = req.body;
      
      if (!userId || !problemId || !code || !language)
         return res.status(400).send("All fields are required during code run");
      
      const problem = await problemCollection.findById(problemId);
      if (!problem) {
         return res.status(404).send("Problem not found");
      }

      // Find the wrapper code for the user's language
      const wrapper = problem.judgeWrapperCode.find(w => w.language.toLowerCase() === language.toLowerCase());
      if (!wrapper) {
         return res.status(400).send(`No wrapper code found for language: ${language}`);
      }
      
      // Combine user code with wrapper code
      const fullCode = combineUserCodeWithWrapper(code, wrapper.Code);
      console.log("Combined code length:", fullCode.length);

      async function submitBatch(submissions) {
         const options = {
            method: 'POST',
            url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
            params: {
               base64_encoded: 'false'
            },
            headers: {
               'x-rapidapi-key': process.env.JUDGE0_API_KEY,
               'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
               'Content-Type': 'application/json'
            },
            data: { submissions }
         };
         
         async function fetchData() {
            try {
               const response = await axios.request(options);
               return (response.data);
            } catch (error) {
               console.log("Error fetching submission results in submitBatch function: " + error.message);
               throw error;
            }
         }
         return await fetchData();
      }
      
      async function submitToken(tokensArray) {
         const options = {
            method: 'GET',
            url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
            params: {
               tokens: tokensArray.join(','),
               base64_encoded: 'false',
               fields: '*'
            },
            headers: {
               'x-rapidapi-key': process.env.JUDGE0_API_KEY,
               'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
            }
         };
         
         async function fetchData() {
            try {
               const response = await axios.request(options);
               return (response.data);
            } catch (error) {
               console.log("Error fetching submission results in submitToken function: " + error.message);
               throw error;
            }
         }
         
         while (true) {
            const result = await fetchData();
            const resultCheck = result.submissions.every((r) => r.status.id > 2);
            if (resultCheck)
               return result.submissions;
            await new Promise(resolve => setTimeout(resolve, 1000)); // Fixed setTimeout usage
         }
      }
      
      if (!getLanguageId(language))
         throw new Error('Invalid language provided for code run');
      
      const languageId = getLanguageId(language);
      
      // Use fullCode (user code + wrapper) for Judge0 submission
      const submissions = problem.visibleTestCases.map((testCase) => {
         return {
            source_code: fullCode, // Use combined code
            language_id: languageId,
            stdin: testCase.input,
            expected_output: testCase.output
         }
      });
      
      console.log("Run submissions created for", submissions.length, "test cases");
      const submissionResult = await submitBatch(submissions);
      const submissionTokens = submissionResult.map(submission => submission.token);
      const tokenSubmissionResult = await submitToken(submissionTokens);
      console.log(tokenSubmissionResult);
      res.status(200).send(tokenSubmissionResult);
   }
   catch (err) {
      console.error("Run error:", err);
      res.status(500).send("Error in code run: " + err.message);
   }
}

module.exports = { submitCode, runCode };
