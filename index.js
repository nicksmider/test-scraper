const cheerio = require("cheerio");
const cheerioTableparser = require("cheerio-tableparser");
const axios = require("axios");
const fastcsv = require('fast-csv');
const fs = require('fs');


const siteUrl = "https://fbref.com/en/comps/9/1889/shooting/2018-2019-Premier-League-Stats";
const ws = fs.createWriteStream("premier_league_2018_2019.csv");

const fetchData = async () => {
  const result = await axios.get(siteUrl);
  return cheerio.load(result.data);
};

const main = async () => {
  console.log('fetching', siteUrl);

  const $ = await fetchData();
  cheerioTableparser($);
  const columns = $('.stats_table').parsetable(true, true, true);
  columns.forEach((col) => col.shift());

  console.log('formatting');

  const reformatted = [...Array(columns[0].length)].map(e => Array(0));;
  columns.forEach((col) => col.forEach((inner, index) => {
    reformatted[index].push(inner);
  }));

  fastcsv
    .write(reformatted, { headers: true })
    .pipe(ws);

  console.log('done');
};

main();