const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
const match = html.match(/style="([^"]*max-width:[^"]*)"/);
console.log(match ? match[1] : 'No match');
