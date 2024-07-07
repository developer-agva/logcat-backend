const express = require('express');
const axios = require('axios');
// require('../dotenv').config();

// console.log(CLIENT_ID)

// // Route to search for foods
const getFoodBySearch = async (req, res) => {
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
}



module.exports = {
    getFoodBySearch
}
