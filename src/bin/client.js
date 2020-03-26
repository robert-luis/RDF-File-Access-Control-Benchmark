// ** Client of Graph-based Access Control for RDF Files **

const fetch = require('node-fetch');
const newEngine = require('@comunica/actor-init-sparql').newEngine;

//// ## Initialising the request
//requestHandler(source, webid, query).then(res => {
//    console.log(res);
//})
//.catch(err=> {console.error('Error! Server is not responding \n' + err) });


module.exports = {
    queryHandler: async function (source, webid, query) {
        var results = [];
        var int_result = await requestHandler(source, webid, query[0])
        for (i in int_result) {
            results.push(await requestHandler(int_result[i], webid, query[1]))
        }
        return results
    }
}


// Exporting the main function
//module.exports = {
//    // ## Request handler function
//    requestHandler: async function (source, webid, query) {
//        //console.log(test);
//        console.log(source);
////        console.log(webid);
////        console.log(query);
//        const newSource = await enforceAC(source, webid, query);
//        if (newSource.length > 0) {
//            const results = await executeQuery(query, source);
//            callCleaner(newSource)
//            return results
//        } else { return [] }
//    }
//}

// ## Request handler function
async function requestHandler(source, webid, query) {
    const newSource = await enforceAC(source, webid, query);
    if (newSource.length > 0) {
        const results = await executeQuery(query, source);
        callCleaner(newSource)
        return results
    } else { return [] }
}

// ## Calling the AC-Interface
async function enforceAC(url, webid, query) {
    url = url;
    const data = {'webid': webid, 
                  'query': query};
    const options = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)    
    };
    const response = await fetch(url, options);
    const respone_json = await response.json();
    const newSource = respone_json.newSource;
    return newSource
}

// Executing the query
async function executeQuery(query, source) {
    const engine = newEngine();
    const sources = [
        { type: "file", value: source },
    ];
    const result = await engine.query(query, { sources });
    const results = [];
    result.bindingsStream.on('data', data => {
        // ## given variable to retrieve instead of ?o
        results.push(data.get('?o').value);
    });
    return new Promise(resolve => {
        result.bindingsStream.on('end', () => {
            resolve(results);
        })
    });
}

// ## Calling the cleaner on the AC-Interface
function callCleaner(newSource) {
    url = newSource;
    const data = {'cleaner': newSource};
    const options = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)    
    };
    fetch(url, options);
}


