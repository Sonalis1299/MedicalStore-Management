const express = require("express");
const router = express.Router();


router.get('/', async(req, res)=>{
    return res.render('index');
});


router.get('/bills', async(req, res)=>{
    return res.render('billing_info');
});

router.get('/membersInfo', async(req, res)=>{
    return res.render('members');
});

router.get('/medicalStore', async(req, res)=>{
    return res.render('medical_store');
});

router.get('/owner', async(req, res)=>{
    return res.render('owner');
});

router.get('/employee', async(req, res)=>{
    return res.render('employee');
});

router.get('/data', async(req, res)=>{
    return res.render('fetch');
});

// --------------------------------------------------------------





module.exports = router;