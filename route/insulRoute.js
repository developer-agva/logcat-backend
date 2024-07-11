const express = require('express')
const router = express.Router();
const {isAuth, isSuperAdmin} = require('../middleware/authMiddleware');
const insulController = require('../controller/insulController')
// const express = require('express');
const axios = require('axios');
require('dotenv').config({path:'../.env'});


let accessToken = null;

var request = require("request");
const path = require('path');
clientID = process.env.CLIENT_ID;
clientSecret = process.env.CLIENT_SECRET;

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
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        accessToken = response.data.access_token;
        // console.log('Access Token:', accessToken);
    } catch (error) {
        // console.error('Error obtaining access token:', error.response ? error.response.data : error.message);
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
        if (food == "" || food == undefined || food == null) {
            return res.status(400).json({
                statusCode: 400,
                statusValue: "FAIL",
                message:"Data not found",
                data:[]
            })
        }

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
        const responseData = response.data.foods.food;
        // console.log(123, responseData)
        // Function for extract nutrition info
        const extractNutritionInfo = (item) => {
            const regex = /Calories:\s*([\d.]+kcal)\s*\|\s*Fat:\s*([\d.]+g)\s*\|\s*Carbs:\s*([\d.]+g)\s*\|\s*Protein:\s*([\d.]+g)/;
            const match = item.food_description.match(regex);
            if (match) {
                const result = {
                    Calories: match[1],
                    Fat: match[2],
                    Carbs: match[3],
                    Protein: match[4]
                };
                if (item.brand_name) {
                    result.brand_name = item.brand_name;
                    result.food_description = item.food_description;
                    result.food_name = item.food_name;
                }
                return result;
            }
            return null;
        };
        
        const result = responseData.map(item => extractNutritionInfo(item)).filter(info => (info.brand_name !== undefined && info.food_description !== undefined));
        
        return res.status(200).json({
            statusCode: 200,
            statusValue: "SUCCESS",
            message:"Data get successfully!",
            data:!!result.length ? result : []
        })
        
    } catch (error) {
        console.error('Error fetching data from FatSecret API:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'An error occurred while fetching data from FatSecret API' });
    }
});





module.exports = router