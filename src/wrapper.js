// ** Benchmark Wrapper **

const fs = require('fs');
const cl = require('./bin/client.js');

// ## Configuration file
const config = JSON.parse(fs.readFileSync('../config.json')); 


// ## Check whether server has been started


// ## Iterations | runs -> queries -> subtasks -> tasks
for (var run = 1; run <= config.runs; run++) {
    for (task in config.data) {
        for (subT in config.data[task]) {
            for (queryNr in config.queries) {
                var source = `http://localhost:8080/${task}/${subT}/person1/profile.ttl`
                var webid = source + '#me';
                var acEnforce = config.data[task][subT].acEnforce;
                var queryArray = [];
                queryArray.push(config.queries[queryNr].subQ1)
                queryArray.push(config.queries[queryNr].subQ2)
                //var query = queryArray;
                callRun(source, webid, queryArray, acEnforce, run, queryNr, subT, task);
            }
        }
    }
}


function callRun(source, webid, query, acEnforce, run, queryNr, subT, task) {
    
    // ## Start Timer
    var start = new Date();

    // ## Initialising the request
    cl.queryHandler(source, webid, query, acEnforce)
        .then(res => {

            // ## Stop timer
            var time = new Date() - start;
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
            var path = `./output/${task}/${subT}/query${queryNr}`;
            var file = `/run${run}.json`;
            var path_file = path + file;

            fs.mkdirSync(path, {recursive: true});
            fs.writeFileSync(path_file, data);

        })
        .catch(err=> {console.error('Error! Server is not responding \n' + err) });
}
