import { MQTT, MQTT_Received } from "./MQTT";
import { Connection, FakeDocumentLoader } from "./RDF4J"
import { JsonLdParser, IJsonLdParserOptions } from "jsonld-streaming-parser";
const { Readable } = require("stream")
import s2s from 'string-to-stream'
console.log("pijo")

const mqtt = new MQTT('mqtt://localhost:1883');
import { JSON2RDF } from './JSON2RDF';

let example = {
    "@context": "http://schema.org/",
    "@type": "Person",
    "name": "Jane Doe",
    "jobTitle": "Professor",
    "telephone": "(425) 123-4567",
    "url": "http://www.janedoe.com"
  };


const server_uri = 'http://localhost:8080/rdf4j-server';
const rdf = new Connection(server_uri);
rdf.server.getRepositoryIDs().then(ids => {
    console.log("RepositoryIDs: %s", ids);
}).catch(err => console.log(err));

mqtt.subscribe("pijo/hello", (msg: MQTT_Received) => {
    console.log("got.MQTT: %o", msg);

    let rdf = new JSON2RDF("urn:mqtt:", "https://pijo.io/mqtt");
    rdf.process(null, null, msg.message);
    console.log(">> %s", rdf.toString())
    // let documentLoader = new FakeDocumentLoader({
    //     "@base": server_uri + "/pijo"
    // })
    // let o: IJsonLdParserOptions = {
    //     skipContextValidation: true
    // };
    // let p: JsonLdParser = new JsonLdParser(o);
    // p.import(s2s(JSON.stringify(example)))
    //     .on('context', console.log)
    //     .on('data', console.error)
    //     .on('error', console.error)
    //     .on('end', (x) => console.log('All triples were parsed!', x));
})
