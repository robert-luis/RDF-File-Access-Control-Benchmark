const fetch = require('node-fetch');
const newEngine = require('@comunica/actor-init-sparql').newEngine;

//Input variables  ->   process.argv[2]
const source = "http://localhost:8080/t1/t1-1/person1/profile/card.ttl"
const webid = source + '#me'
const query = `
PREFIX foaf: <http://xmlns.com/foaf/0.1/> 
SELECT ?o WHERE { graph ?g {
    ?s foaf:knows ?o. }
}`;


// Initialising the request
requestHandler(source, webid, query).then(res => {
    console.log(res);
})
.catch(err=> {console.error('Error! Server is not responding \n' + err) });


// Request handler function
async function requestHandler(url, webid, query) {
    const newSource = await enforceAC(source, webid, query);
    if (newSource.length > 0) {
        console.log(newSource)
        const results = await executeQuery(query, source);
        //callCleaner(newSource)
        return results
    } else { return [] }
}

// Calling the AC-Interface
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
        results.push(data.get('?o').value);
    });
    return new Promise(resolve => {
        result.bindingsStream.on('end', () => {
            resolve(results);
        })
    });
}

// Calling the cleaner on the AC-Interface
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


