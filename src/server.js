// ** Server of Graph-based Access Control for RDF Files **

const express = require('express');
const newEngine = require('@comunica/actor-init-sparql').newEngine;
const N3 = require('n3');
const fs = require('fs');
const newEngine_rdfjs = require('@comunica/actor-init-sparql-rdfjs').newEngine;
const glob = require('glob');

const app = express();
const port = 8080;
const { DataFactory } = N3;
const { namedNode, literal, defaultGraph, quad } = DataFactory;
const path = process.cwd()
var filteredFile = ''

// ## Server application
app.listen(port, () => console.log(`Server is running on port ${port}!`));
app.use(express.static(path + '/data'));
app.use(express.json())

// ## AC-Interface
// PARAMS: '/*(:path)?'
app.post('/*', (req, res) => {
    //res.set('content-type', 'text/plain; charset=utf-8');
    if (req.body.hasOwnProperty('webid') && req.body.hasOwnProperty('query'))  {
        console.log('P1') // Tracking of path made by request
        resData = checkAP(req).then(result => {
            res.json({
                input: req.body,
                newSource: result
            });
        });
    } else if (req.body.hasOwnProperty('cleaner')) {
        console.log('P2')
        if (filteredFile.match(req.url)) {
            cleaner(filteredFile);
            res.send('Cleaned!');
        }
    } else {
        console.log('P3')
        console.log(res)
        res.send('Something went wrong!');
    }
});



// ## AC-Interface
async function checkAP(req) {
    const source = path + '/data' + req.url;
    const newSource = getNewPath(source);
    const baseIRI = `http://localhost:${port}` + req.url; 
    const newbaseIRI = getNewPath(baseIRI);
    const webid = req.body.webid;
    const query = req.body.query;
    
    const aclSource = await getAclSource(source);
    
    //const acc = await getAccessMode(query) | currently only read supported
    //const policyQuery = await createQuery(acc) |  not necessarry anymore
    
    // Storing the policy document in a memory store
    authStore = await getAuthData(aclSource, baseIRI);
    
    // Retrieving the authorised named graphs depending on read access and requester's webid
    authorisations = await getAuthGraphs(authStore, webid);
    
    if (authorisations.length > 0) {
        // Creating filtered file
        filter(source, baseIRI, authorisations, newSource);
        return newbaseIRI;
    } else { 
        return [];
    }
}

// ## ToDo: FUNCTION getAccessMode  | Return acc | which is acl:Read
// ## ToDo: FUNCTION policyQuery = createQuery(acc) | return policyQuery

// ## Creating new path for filtered source
function getNewPath(str) {
    n = str.lastIndexOf('.');
    const sign = '_filtered'
    if (n > -1) {str = str.slice(0, n) + sign + str.slice(n)}
    else {str += sign}
    return str
}

// ## Retrieving the respectice acl file for the requested source
function getAclSource(source) {
    dir = source.slice(0, source.lastIndexOf('/') + 1);
    options = {cwd: dir};
    return new Promise((resolve, reject) => {
        glob("*acl.ttl", options, function(err, doc) {
            if (err) {
                console.log('ACL file not found. ' + err);
                return;
            }
            else {resolve(dir + doc[0]);}
        });
    });
}

// ## Parsing the auth document into a store
function getAuthData(source, baseIRI) {
    var authStore = new N3.Store();
    const parser = new N3.Parser( { baseIRI: baseIRI } ),
          rdfStream = fs.createReadStream(source);
    return new Promise((resolve, reject) => {
        parser.parse(rdfStream, (err, quad, prefixes) => {
            if (err) {throw err}
            if (quad) {authStore.addQuad(quad)}
            else {resolve(authStore)}
        });
    });
}

// ## Querying the authorised graphs from the store
async function getAuthGraphs(store, webid) {
    const engine_rdfjs = newEngine_rdfjs();
    
    // ToDo: Match access mode Read against query
//    const authQuery = `
//    PREFIX acl: <http://www.w3.org/ns/auth/acl#>
//    PREFIX ppo: <http://vocab.deri.ie/ppo#>
//    SELECT ?o WHERE {GRAPH ?g {
//        ?s acl:mode acl:Read.
//        ?s acl:agent <${webid}>.
//        ?s ppo:appliesToNamedGraph ?o.
//    }}`;

    const authQuery = `
    PREFIX acl: <http://www.w3.org/ns/auth/acl#>
    PREFIX ppo: <http://vocab.deri.ie/ppo#>
    SELECT ?o WHERE {GRAPH ?g {
        ?s acl:mode acl:Read.
        ?s ppo:appliesToNamedGraph ?o.
    }}`;
 
 
    const authGraphs = []
    const result = await engine_rdfjs.query(authQuery, { sources: [ { type: 'rdfjsSource', value: store } ] });
    result.bindingsStream.on('data', (data) => {
        authGraphs.push(data.get('?o').value);
    });
    return new Promise(resolve => {
        result.bindingsStream.on('end', () => {
            resolve(authGraphs);
        })
    });
}

// ## Writing out new filtered file
function filter(source, baseIRI, authorisations, newSource) {
    var writer = new N3.Writer();
    const parser = new N3.Parser( { baseIRI: baseIRI } ),
          rdfStream = fs.createReadStream(source);
    parser.parse(rdfStream, (err, quad, prefixes) => {
        if (err) {throw err}
        // ## If graph of parsed quad matches the authorisations, it is added
        if (quad) {
            for (auth in authorisations) {
                if (authorisations[auth] == quad.graph.value){
                    writer.addQuad(quad);
                }
            }
        }
        // ## Ending of the parsing and writing out
        else {
            writer.end((error, result) => {
                fs.writeFile(newSource, result, err => {
                    if (err) {throw 'Could not write out the file ' + err};
                    console.log(`${newSource} was saved`);
                    filteredFile = newSource;
                }); 
            });
        }
        
    });
}

// ## Deleting filtered file 
function cleaner(newSource) {
    try {
        fs.unlinkSync(newSource);
        console.log(`${newSource} was removed`);
    }
    catch(err) {console.error(`File '${source}' not found :\n` + err)}
}

