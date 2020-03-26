// ** Benchmark Wrapper **

const fs = require('fs');
const cl = require('./bin/client.js')

const configuration = fs.readFileSync('../config.json');
const config = JSON.parse(configuration)
//const runs = config.runs
const queries = config.query




//var source = "http://localhost:8080/t1/t1-1/person1/profile.ttl"
//var webid = source + '#me'
//var query = `
//PREFIX foaf: <http://xmlns.com/foaf/0.1/> 
//SELECT ?o WHERE { graph ?g {
//    ?s foaf:knows ?o. }
//}`;


//var results = [];
//Output preparation
//fs.writeFileSync('./output/output.json');

// ## Output variables
//var task = 't1'
//var subT = 't1-1'
var queryNr = 'q1'
var subQ = 'q1-1'
var runs = config.runs
//console.log(config.data)
for (i in config.queries) {
    console.log(i)
}

//console.log(config.queries[queryNr])
var queryArray = []
queryArray.push(config.queries[queryNr].subQ1)
queryArray.push(config.queries[queryNr].subQ2)
console.log(queryArray)

//console.log(config.data[task][subT])

// ## Iterations | runs -> queries -> subtasks -> tasks
for (var run = 1; run <= runs; run++) {
    
    console.log(' ** RUN: ' + run);

    for (task in config.data) {
        for (subT in config.data[task]) {
            for (queryNr in config.queries) {
                var source = `http://localhost:8080/${task}/${subT}/person1/profile.ttl`
                var webid = source + '#me';
                var queryArray = [];
                queryArray.push(config.queries[queryNr].subQ1)
                queryArray.push(config.queries[queryNr].subQ2)
                //var query = config.queries[queryNr].complete;
                var query = queryArray;
                callRun(source, webid, query, run, queryNr, subT, task);
            }
        }
    }
}


function callRun(source, webid, query, run, queryNr, subT, task) {
    
    // ## Start Timer
    var start = new Date();

    
    // ## Initialising the request
    //cl.requestHandler(source, webid, query)
    cl.queryHandler(source, webid, query)
        .then(res => {

            // ## Stop timer
            var time = new Date() - start;
            console.log(` - Execution time: ${task}/${subT}/${queryNr}/${run} -- ${time}ms`); // DELETE

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
            //console.log(' ** RUN ** ' + run) // DELETE
            var path = `./output/${task}/${subT}/query${queryNr}`;
            var file = `/run${run}.json`;
            var path_file = path + file;

            fs.mkdirSync(path, {recursive: true});
            fs.writeFileSync(path_file, data);

        })
        .catch(err=> {console.error('Error! Server is not responding \n' + err) });
}
