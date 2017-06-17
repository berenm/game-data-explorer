#!/usr/bin/coffee

{PCK} = require '../lib/data/commandos2/pck'

pckFile = new PCK process.argv[2]
for filePath, file of pckFile.files
  console.log filePath
