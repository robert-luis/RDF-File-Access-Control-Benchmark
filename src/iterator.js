// ## ITERATOR ##

const fs = require('fs');

// ## Configuration file
const config = JSON.parse(fs.readFileSync('../config.json')); 

const request = process.argv[2]
var c = 1

if(request == 'request') {
    for (task in config.data) {
        for (subT in config.data[task]) {
            for (queryNr in config.queries) {
                for (var run = 1; run <= config.runs; run++) {
                    c += 1;
                }
            }
        }
    }
    console.log(c-1)
} else {
    for (task in config.data) {
        for (subT in config.data[task]) {
            for (queryNr in config.queries) {
                for (var run = 1; run <= config.runs; run++) {
                    var variables =  task + ' ' + subT + ' ' + queryNr + ' ' + run;
                    if (c >= request) {
                        console.log(variables);
                        return;
                    } else {
                        c += 1;
                    }
                }
            }
        }
    }
}

