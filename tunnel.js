const fs = require('fs');
local = require('net').Socket(); 
local.connect({host: '127.0.0.1', port: 8081}); 


remote = require('net').Socket(); 
remote.connect({host: '114.67.82.34', port: 2000}); 

local.on('data', (data) => {
  console.log('local')
  console.log(data)
  console.log(data.toString())
})

remote.on('data', (data) => {
  console.log('remote')
  console.log(data.toString())
})
local.pipe(remote)
console.log('11111111111')
remote.pipe(local)

// setTimeout(() => {}, 1000000)