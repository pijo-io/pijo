const {ServerClient, ServerClientConfig} = require('graphdb').server;
const {RDFMimeType  } = require('graphdb').http;
import {JsonLdParser, IJsonLdParserOptions } from "jsonld-streaming-parser";
import { IDocumentLoader, IJsonLdContext } from 'jsonld-context-parser'

// https://www.npmjs.com/package/graphdb

export class Connection {
    server = null;
    config = null;

    constructor(host: string) {
        this.connect(host);
    }

    connect(host: string) {
        this.config = new ServerClientConfig(host)
        .setTimeout(5000)
        .setHeaders({
            'Accept': RDFMimeType.SPARQL_RESULTS_JSON
        })
        .setKeepAlive(true);
    
    this.server = new ServerClient(this.config);
    }
} 

export class FakeDocumentLoader implements IDocumentLoader {

    constructor(public ctx: IJsonLdContext) {

    }
    load(url: string): Promise<IJsonLdContext> {
        return  Promise.resolve( { '@vocab': url, '@context': 'https://schema.org/', ...this.ctx } );
    }

}