// ** Benchmark Wrapper **

const fs = require('fs');
const cl = require('./bin/client.js');

// ## Configuration file
const config = JSON.parse(fs.readFileSync('../config.json')); 


const task  = process.argv[2]
const subT  = process.argv[3]
var queryNr = process.argv[4]
var run     = process.argv[5]

startRun(task, subT, queryNr, run)

function startRun(task, subT, queryNr, run) {
    const source = `http://localhost:8080/${task}/${subT}/person1/profile.ttl`
    const webid = source + '#me';
    const acEnforce = config.data[task][subT].acEnforce;
    const queryArray = [];
    queryArray.push(config.queries[queryNr].subQ1);
    queryArray.push(config.queries[queryNr].subQ2);
    callRun(source, webid, queryArray, acEnforce, run, queryNr, subT, task);
}


async function callRun(source, webid, query, acEnforce, run, queryNr, subT, task) {
    
    // ## Start Timer
    const start = new Date();

    // ## Initialising the request
    cl.queryHandler(source, webid, query, acEnforce)
        .then(res => {

            // ## Stop timer
            const time = new Date() - start;
            console.log(`   **Execution time: ${task}/${subT}/${queryNr}/${run} -- ${time}ms`); // DELETE

            // ## Create output and output files
            var output = {
                task: task,
                subT: subT,
                queryNr: queryNr,
                run: run,
                time: time,
                result: res
            };

            var data = JSON.stringify(output);
            var path = `./output/${task}/${subT}/${queryNr}`;
            var file = `/run${run}.json`;
            var path_file = path + file;

            fs.mkdirSync(path, {recursive: true});
            fs.writeFileSync(path_file, data);
        
        })
        .catch(err => {console.error('Error! Server is not responding \n' + err) });
}

