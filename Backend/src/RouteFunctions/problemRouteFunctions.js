const problemCollection = require('../models/problemSchema');
const userCollection = require('../models/user');// importing the user schema to get the user details
const submissionsCollection = require('../models/problemSubmissionSchema');// importing the submission schema to get the submission details
const SolutionVideoCollection=require('../models/solutionVideoSchema');
const jwt= require('jsonwebtoken');// a library to create and verify JWT tokens
const axios= require('axios');// a library to make HTTP requests, similar to fetch
require('dotenv').config(); // for reading environment variables

function getLanguageId(lang) // function to get the language id from the language name
{
   const ids={
      "c++":53,
      "java":62,
      "python":71,
      "javascript":63,
      "c":50,
      "c#":51,
   }
   return ids[lang.toLowerCase()];
}

// NEW: Helper function to combine user code with wrapper code
function combineUserCodeWithWrapper(userCode, wrapperCode) {
   return wrapperCode.replace('{USER_CODE}', userCode);
}

const createProblem = async (req,res) => {
   try {
      if(req.result.role != 'admin')
         return res.status(403).send("Access denied: Problems can be created by Admins only");

      // Helper function to combine user code with wrapper code
      function combineUserCodeWithWrapper(userCode, wrapperCode) {
         return wrapperCode.replace('{USER_CODE}', userCode);
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
         
         while(true) {
            const result = await fetchData();
            const resultCheck = result.submissions.every((r) => r.status.id > 2);
            if(resultCheck)
               return result.submissions;
            await new Promise(resolve => setTimeout(resolve, 1000)); // Fixed setTimeout usage
         }
      }

      const {title,description,difficulty,tags,visibleTestCases,hiddenTestCases,startCode,referenceSol,judgeWrapperCode,problemCreator} = req.body;

      try {
               // Validate reference solutions against ALL test cases (visible + hidden)
         const validationErrors = []; // Collect all validation errors
         
         // Validate reference solutions against ALL test cases (visible + hidden)
         for(const {language,Code} of referenceSol) {
            if(!language || !Code)
               throw new Error('Language and Code are required for reference solution');
            if(!getLanguageId(language))
               throw new Error('Invalid language provided for reference solution');
            
            // Find the corresponding wrapper code for this language
            const wrapper = judgeWrapperCode.find(w => w.language.toLowerCase() === language.toLowerCase());
            if(!wrapper) {
               throw new Error(`No wrapper code found for language: ${language}`);
            }
            
            const languageId = getLanguageId(language);
            const fullCode = combineUserCodeWithWrapper(Code, wrapper.Code);
            const allTestCases = [...visibleTestCases, ...hiddenTestCases];
            
            const submissions = allTestCases.map((testCase) => {
               return {
                  source_code: fullCode,
                  language_id: languageId,
                  stdin: testCase.input,
                  expected_output: testCase.output
               }
            });
            
            console.log(`Testing ${language} reference solution against ${allTestCases.length} test cases`);
            
            const submissionResult = await submitBatch(submissions);
            const submissionTokens = submissionResult.map(submission => submission.token);
            const tokenSubmissionResult = await submitToken(submissionTokens);
            
            // Collect failed test cases for this language
            const languageFailures = [];
            
            for(let i = 0; i < tokenSubmissionResult.length; i++) {
               console.log(`Checking result for ${language} test case ${i + 1}`);
               const test = tokenSubmissionResult[i];
               const isVisible = i < visibleTestCases.length;
               const testType = isVisible ? 'visible' : 'hidden';
               const testIndex = isVisible ? i : i - visibleTestCases.length;
               
               if(test.status.id != 3) {
                  languageFailures.push({
                     testType,
                     testIndex: testIndex + 1,
                     input: test.stdin,
                     expected: test.expected_output,
                     actual: test.stdout || 'No output',
                     status: test.status.description,
                     error: test.stderr || test.compile_output || 'No error details'
                  });
               }
            }
            
            // If this language had failures, add to validation errors
            if(languageFailures.length > 0) {
               validationErrors.push({
                  language,
                  failures: languageFailures
               });
            } else {
               console.log(`✅ ${language} reference solution passed all ${allTestCases.length} test cases`);
            }
         }
         
         // If there were any validation errors, return structured error
         if(validationErrors.length > 0) {
            return res.status(400).json({
               error: "Reference solution validation failed",
               validationErrors: validationErrors,
               type: "VALIDATION_ERROR"
            });
         }
         
         console.log("✅ All reference solutions validated successfully");
         const problem = await problemCollection.create({
                  ...req.body,
                  problemCreator: req.result._id
         });
         res.status(201).send("Problem created successfully with ID: " + problem._id);
      }
      catch(err) {
         return res.status(400).send("Error: " + err.message);
      }
   }
   catch(err) {
      console.error("Outer error in createProblem:", err);
      res.status(400).send("Error: " + err);
   }
}

const updateProblem = async (req,res) => {
   try {
      if(req.result.role != 'admin')
         return res.status(403).send("Access denied: Problems can be updated by Admins only");
      
      const { id } = req.params;
      if(!id)
         return res.status(400).send("Problem ID is missing");
      
      const problem = await problemCollection.findById(id);
      if(!problem)
         return res.status(404).send("Problem not found with the given ID");
      
      // Helper function to combine user code with wrapper code
      function combineUserCodeWithWrapper(userCode, wrapperCode) {
         return wrapperCode.replace('{USER_CODE}', userCode);
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

      // Add delay function for rate limiting
      function delay(ms) {
         return new Promise(resolve => setTimeout(resolve, ms));
      }
      
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
               if (error.response?.status === 429) {
                  console.log("Rate limit hit, waiting 10 seconds before retry...");
                  await delay(10000); // Wait 10 seconds
                  return await fetchData(); // Retry
               }
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
               if (error.response?.status === 429) {
                  console.log("Rate limit hit, waiting 10 seconds before retry...");
                  await delay(10000); // Wait 10 seconds
                  return await fetchData(); // Retry
               }
               console.log("Error fetching submission results in submitToken function: " + error.message);
               throw error;
            }
         }
         
         while(true) {
            const result = await fetchData();
            const resultCheck = result.submissions.every((r) => r.status.id > 2);
            if(resultCheck)
               return result.submissions;
            await new Promise(resolve => setTimeout(resolve, 2000)); // Increased delay
         }
      }
      
      const {title,description,difficulty,tags,visibleTestCases,hiddenTestCases,startCode,referenceSol,judgeWrapperCode,problemCreator} = req.body;
      
      try {
         const validationErrors = []; // Collect all validation errors
         
         // Validate reference solutions with rate limiting
         for(let langIndex = 0; langIndex < referenceSol.length; langIndex++) {
            const {language,Code} = referenceSol[langIndex];
            
            if(!language || !Code)
               throw new Error('Language and Code are required for reference solution');
            if(!getLanguageId(language))
               throw new Error('Invalid language provided for reference solution');
            
            // Find the corresponding wrapper code for this language
            const wrapper = judgeWrapperCode.find(w => w.language.toLowerCase() === language.toLowerCase());
            if(!wrapper) {
               throw new Error(`No wrapper code found for language: ${language}`);
            }
            
            const languageId = getLanguageId(language);
            
            // Combine reference solution with wrapper code
            const fullCode = combineUserCodeWithWrapper(Code, wrapper.Code);
            
            // Test against ALL test cases (visible + hidden)
            const allTestCases = [...visibleTestCases, ...hiddenTestCases];
            
            const submissions = allTestCases.map((testCase) => {
               return {
                  source_code: fullCode,
                  language_id: languageId,
                  stdin: (testCase.input || "").replace(/\\n/g, "\n"),
                  expected_output: testCase.output
               }
            });
            
            console.log(`Testing ${language} reference solution against ${allTestCases.length} test cases (${visibleTestCases.length} visible + ${hiddenTestCases.length} hidden)`);
            
            const submissionResult = await submitBatch(submissions);
            const submissionTokens = submissionResult.map(submission => submission.token);
            const tokenSubmissionResult = await submitToken(submissionTokens);
            
            // Collect failed test cases for this language
            const languageFailures = [];
            
            // Check each test case result with detailed logging
            for(let i = 0; i < tokenSubmissionResult.length; i++) {
               const test = tokenSubmissionResult[i];
               const isVisible = i < visibleTestCases.length;
               const testType = isVisible ? 'visible' : 'hidden';
               const testIndex = isVisible ? i : i - visibleTestCases.length;
               
               if(test.status.id != 3) {
                  console.log(`❌ ${language} reference solution failed on ${testType} test case ${testIndex + 1}:`, {
                     input: test.stdin,
                     expected: test.expected_output,
                     actual: test.stdout,
                     status: test.status,
                     stderr: test.stderr,
                     compile_output: test.compile_output
                  });
                  
                  // Add failure to the language failures array
                  languageFailures.push({
                     testType,
                     testIndex: testIndex + 1,
                     input: test.stdin,
                     expected: test.expected_output,
                     actual: test.stdout || 'No output',
                     status: test.status.description,
                     error: test.stderr || test.compile_output || 'No error details'
                  });
               }
            }
            
            // If this language had failures, add to validation errors
            if(languageFailures.length > 0) {
               validationErrors.push({
                  language,
                  failures: languageFailures
               });
            } else {
               console.log(`✅ ${language} reference solution passed all ${allTestCases.length} test cases`);
            }
         }
         
         // If there were any validation errors, return structured error
         if(validationErrors.length > 0) {
            return res.status(400).json({
               error: "Reference solution validation failed",
               validationErrors: validationErrors,
               type: "VALIDATION_ERROR"
            });
         }
         
         console.log("✅ All reference solutions validated successfully for update");
         await problemCollection.findByIdAndUpdate(id, {...req.body}, {runValidators:true, new:true});
         res.status(200).send("Problem updated successfully with ID: " + id);
      }
      catch(err) {
         return res.status(400).send("Error: " + err.message);
      }
   }
   catch(err) {
      console.error("Outer error in updateProblem:", err);
      res.status(400).send("Error: " + err);
   }
}




const deleteProblem=async (req,res)=>{
   try{
      if(req.result.role!='admin')// checking if the user is an admin
         return res.status(403).send("Access denied: Problems can be updated by Admins only");
      const {id}=req.params;
      if(!id)
         return res.status(400).send("Problem ID is missing");
      const deleteProblem=await problemCollection.findByIdAndDelete(id);// deleting the problem with the given id
      if(!deleteProblem)
         return res.status(404).send("Problem not found with the given ID");
      res.status(200).send("Problem deleted successfully with ID: "+id);// sending the response with the problem id
   }
   catch(err){
      return res.status(401).send("Error: "+err.message);
   }
}

const fetchProblem=async (req,res)=>{ 
   try{
      const {id}=req.params;
      if(!id)
         return res.status(400).send("Problem ID is missing");
      console.log("Fetching problem with ID: "+id);
      
      // UPDATED: Include judgeWrapperCode for admins
      let selectedFields="_id title description difficulty tags visibleTestCases startCode problemCreator referenceSol";
      if(req.result.role=='admin')
      {
         selectedFields+=" hiddenTestCases judgeWrapperCode"; // ADDED: judgeWrapperCode for admins
      }
      
      const requiredProblem=await problemCollection.findById(id).select(selectedFields);// fetching the problem with the given id and selecting only the required fields
      if(!requiredProblem)
         return res.status(404).send("Problem not found with the given ID");
      const videos=await SolutionVideoCollection.findOne({problemId:id});
      const finalResponse={...requiredProblem.toObject()}// converting mongoose document to plain object
      if(videos)
      {
         finalResponse.secureUrl=videos.secureUrl,
         finalResponse.thumbnailUrl=videos.thumbnailUrl,
         finalResponse.duration=videos.duration
      }

      res.status(200).send(finalResponse);// sending the response with the problem details  
   }
   catch(err){
      return res.status(401).send("Error: "+err.message);
   }
}

const fetchAllProblems=async (req,res)=>{
   try{
      const allProblemsArray=await problemCollection.find({}).select("title difficulty tags");// fetching all the problems and selecting only the required fields
      if(allProblemsArray.length===0)
         return res.status(404).send("No problems found in the database");
      res.send(allProblemsArray);
   }
   catch(err){
      return res.status(401).send("Error: "+err.message);
   }
}

const getSolvedProblems=async (req,res)=>{
   try{
         const userId=req.result._id;// getting the user id from the token
         const user=await userCollection.findById(userId).populate({
            path: 'problemSolved', // populating the solvedProblems field in the user schema
            select:"_id title difficuly tags"
         })
         res.status(200).send(user.problemSolved);// sending the solved problems array
   }
   catch(err){
      return res.status(401).send("Error: "+err.message);
   }
}

const getUserSubmissions=async (req,res)=>{
   try
   {
      const userId=req.result._id;// getting the user id from the token
      const problemId=req.params.pid;// getting the problem id from the request params
      const submissions=await submissionsCollection.find({userId,problemId});
      if(submissions.length===0)
         return res.status(404).send("No submissions found for the given problem ID");
      res.status(200).send(submissions);// sending the submissions array
   }
   catch(err)
   {
      res.status(401).send("Error in getting user submissions: "+err.message);
   }
}

module.exports={createProblem,updateProblem,deleteProblem,fetchProblem,fetchAllProblems,getSolvedProblems,getUserSubmissions};
