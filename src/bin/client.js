// ** Client of Graph-based Access Control for RDF Files **

const fetch = require('node-fetch');
const newEngine = require('@comunica/actor-init-sparql').newEngine;


module.exports = {
    // ## Handles the splitted query and and result accumulation in a basic way
    queryHandler: async function (source, webid, query, acEnforce) {
        var results = [];
        var int_result = await requestHandler(source, webid, query[0], acEnforce);
        for (i in int_result) {
            results.push(await requestHandler(int_result[i], webid, query[1], acEnforce));
        }
        return results;
    }
}

// ## Request handler function
async function requestHandler(source, webid, query, acEnforce) {
    // ## Checking whether to enforce AC or to query directly
    if (acEnforce == true) {
        var newSource = await enforceAC(source, webid, query);
        if (newSource.length < 1) {
            return [];
        }
    } else {
        var newSource = source;
    }
    const results = await executeQuery(query, newSource);
    if (acEnforce == true) {
        callCleaner(newSource);
    }
    return results;       
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
        //results.push(data.get('?o').value);
        results.push(data.get('?o').value);
        //console.log(data)
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


