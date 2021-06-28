import _ from 'lodash';
import Vars from './Vars';
const Emitter = require('events');
import { v4 as uuidv4 } from 'uuid';

export class JSON2RDF extends Emitter {
    triples = [];

    constructor(public baseURI: string, public context: string) {
        super();
    }


    process(id: string, context: string, props: Object) {
        let prop_type = props["@context"] || context || this.context;
        let _id = props["@id"] || id || (this.baseURI +uuidv4());
        for (let p in props) {
            let prop = props[p]
            let p_type = prop_type + "/" + p;
            // console.log("p: %s, %s = %s", _id, p_type, prop);
            if (_.isArray(prop)) {
                for (let i in prop) {
                    this.process(_id + "#" + p_type + "/" + i, p_type, prop[i]);
                }
            } else if (_.isObject(prop)) {
                this.process(_id, p_type, prop);
            } else {
                this.rdf(_id, p_type, prop);
            }
        }
    }

    rdf(s: string, p: string, v: Object) {
        let vars = { s: s, p: p, v: v.toString };
        let rdf = Vars.$("<{{s}}> <{{p}}> ", vars);
        let type = "";
        if (_.isBoolean(v)) {
            type = " xsd:boolean"
        } else if (_.isString(v)) {
            type = "xsd:string"
        } else if (_.isNumber(v)) {
            type = "xsd:number"
        }
        rdf += "\"" + v + "\" ^"+type+"."
        this.triples && this.triples.push(rdf);
        this.emit("rdf", { rdf: rdf, vars: vars });
    }

    toString() {
        let rdf = "";
        for (let t in this.triples) {
            rdf += "\n" + this.triples[t];
        }
        return rdf;
    }

}
