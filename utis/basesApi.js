require("dotenv").config();
const axios = require("axios");
const TOKEN_HS = process.env.TOKEN_HS;

const baseHubSpot = axios.create({
  baseURL: "https://api.hubapi.com/",
  headers: {
    Authorization: `Bearer ${TOKEN_HS}`,
    "Content-Type": "application/json",
  },
});

const baseOmie = axios.create({
  baseURL: "https://app.omie.com.br",
  headers: {
    "Content-Type": "application/json",
  },
});

module.exports = { baseHubSpot, baseOmie };
