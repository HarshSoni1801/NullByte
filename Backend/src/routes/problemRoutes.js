const express=require('express');
const router=express.Router();
const tokenValidator=require('../middlewares/tokenValidator');// a middleware to validate the token
const {createProblem,updateProblem,deleteProblem,fetchProblem,fetchAllProblems,getSolvedProblems,getUserSubmissions}=require('../RouteFunctions/problemRouteFunctions');// importing the functions from the problemRouteFunctions file

router.post('/create',tokenValidator,createProblem)
router.put('/update/:id',tokenValidator,updateProblem)
router.delete('/delete/:id',tokenValidator,deleteProblem)

router.get('/fetch/:id',tokenValidator,fetchProblem)
router.get('/fetchAll',tokenValidator,fetchAllProblems)
router.get('/solvedByUser',tokenValidator,getSolvedProblems)
router.get('/:pid/userSubmissions',tokenValidator,getUserSubmissions)

module.exports=router;