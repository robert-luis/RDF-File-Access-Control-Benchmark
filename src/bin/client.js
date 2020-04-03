// ** Client of Graph-based Access Control for RDF Files **

const fetch = require('node-fetch');
const newEngine = require('@comunica/actor-init-sparql').newEngine;


module.exports = {
    // ## Handles the splitted query and and result accumulation in a basic way
    queryHandler: async function (source, webid, query, acEnforce) {
        var results = [];
        let int_result = await requestHandler(source, webid, query[0], acEnforce);
        for (i in int_result) {
            results.push(await requestHandler(int_result[i], webid, query[1], acEnforce));
        }
        return results;
    }
}

// ## Request handler function
async function requestHandler(source, webid, query, acEnforce) {
    // ## Checking whether to enforce AC or to query directly
    try {
        if (acEnforce == true) {
            var newSource = await sendRequest(source, webid, query);
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
    } catch(e) {
        consol.log(e.message)
    }
}


// ## Calling the AC-Interface
async function sendRequest(url, webid, query) {
    url = url;
    const data = {'webid': webid, 
                  'query': query};
    const options = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)    
    };
    try{
        const response = await fetch(url, options);
        const respone_json = await response.json();
        const newSource = respone_json.newSource;
        return newSource
    } catch(e) {
        consol.log(e.message, ' inside sendRequest')
    } 
}


// Executing the query
async function executeQuery(query, source) {
    try {
        const engine = newEngine();
        const sources = [
            { type: "file", value: source },
        ];
        const result = await engine.query(query, { sources });
        const results = [];
        result.bindingsStream.on('data', (data, error) => {
            // ## given variable to retrieve instead of ?o
            if (data) {
                results.push(data.get('?o').value)
            }
            if (error) {
                console.log(error.message, 'executeQuery() failure')
            }
            
        });
        return new Promise(resolve => {
            result.bindingsStream.on('end', () => {
                resolve(results);
            });
        }); 
    } catch(e) {
        consol.log(e.message, ' inside executeQuery()')
    }
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
    try {
        fetch(url, options);
    } catch(e) {
        consol.log(e.message + 'inside callCleaner()')
    }
}


