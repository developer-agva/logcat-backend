const express = require('express')
const router = express.Router();
const {isAuth, isSuperAdmin} = require('../middleware/authMiddleware');
const insulController = require('../controller/insulController')
// const express = require('express');
const axios = require('axios');

let accessToken = null;

var request = require("request");
clientID = "0d97b424222e4d11841fb09cc96a6771"
clientSecret = "7095bfca3a3a4defbcff1988be6c8a00"

var options = {
   method: 'POST',
   url: 'https://oauth.fatsecret.com/connect/token',
   method : 'POST',
   auth : {
      user : clientID,
      password : clientSecret
   },
   headers: { 'content-type': 'application/x-www-form-urlencoded'},
   form: {
      'grant_type': 'client_credentials',
      'scope' : 'basic'
   },
   json: true
};

request(options, function (error, response, body) {
   if (error) throw new Error(error);

   accessToken = body.access_token;
});

// Function to get access token
const getAccessToken = async () => {
    try {
        const response = await axios.post('https://oauth.fatsecret.com/connect/token', null, {
            params: {
                grant_type: 'client_credentials',
                client_id: "0d97b424222e4d11841fb09cc96a6771",
                client_secret: "7095bfca3a3a4defbcff1988be6c8a00",
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        accessToken = response.data.access_token;
        console.log('Access Token:', accessToken);
    } catch (error) {
        console.error('Error obtaining access token:', error.response ? error.response.data : error.message);
    }
};

// Call getAccessToken initially to get the access token
getAccessToken();

// Middleware to check and refresh access token if needed
const checkAccessToken = async (req, res, next) => {
    if (!accessToken) {
        await getAccessToken();
    }
    next();
};


// router.get('/fatsecret/search', );
// // Route to search for foods
router.get('/fatsecret/search-food-by-name', checkAccessToken, async (req, res) => {
    try {
        const { food } = req.query;

        const response = await axios.get('https://platform.fatsecret.com/rest/server.api', {
            params: {
                format: 'json',
                method: 'foods.search',
                search_expression: food,
            },
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching data from FatSecret API:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'An error occurred while fetching data from FatSecret API' });
    }
});





module.exports = router