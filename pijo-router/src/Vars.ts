import * as _ from "lodash";
import * as util from "util";

export default class Vars {
    static templateSettings: _.TemplateOptions = {
        interpolate: /\{\{(.+?)\}\}/gim,
    };

    /**
     * interpolate `ctx` parameters into `source` string
     */
    public static $ = function (source: string, ctx: any) {
        let template = _.template(source, Vars.templateSettings);
        return template(ctx);
    };

    /**
     * recursively interpolate `ctx` parameters into `source`
     */

    public static $$ = function (source: any, ctx: any): any {
        if (_.isString(source)) return Vars.$(source, ctx);
        else if (_.isArray(source)) {
            let result = [];
            _.each(source, (v) => {
                result.push(Vars.$$(v, ctx));
            });
            return result;
        } else if (_.isObject(source)) {
            let result = {};
            _.each(source, (v, k) => {
                result[k] = Vars.$$(v, ctx);
            });
            return result;
        }
        return source;
    };

    // public static resolve_externals = function (config: any) {
    //     Object.getOwnPropertyNames(config).forEach(function (key) {
    //         if (key.endsWith("@")) {
    //             let real_key = key.substring(0, key.length - 1);

    //             let resource = config[key];
    //             if (_.isString(resource)) {
    //                 let json = Vars.load(resource);
    //                 config[real_key] = _.defaultsDeep(
    //                     {},
    //                     json,
    //                     config[real_key]
    //                 );
    //             } else if (_.isArray(resource)) {
    //                 for (let r in resource) {
    //                     let file = resource[r];
    //                     let json = Vars.load(file);
    //                     config[real_key] = _.defaultsDeep(
    //                         {},
    //                         json,
    //                         config[real_key]
    //                     );
    //                 }
    //             } else throw new Error("invalid load type: " + key);
    //         }
    //     }, config);

    //     return config;
    // };

    public static resolve = function (template: any, fields: any) {
        if (_.isString(template)) {
            return Vars.$(template, fields);
        }

        for (let t in template) {
            template[t] = Vars.resolve(template[t], fields);
        }
        return template;
    };

    public static humanize = function (txt: string) {
        return this.capitalize(this.sanitize(txt, " "));
    };

    public static capitalize = function (text) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    };

    public static sanitize(txt: string, subst?: string) {
        if (!txt) return "";
        subst = subst || "";
        return txt.replace(/[^A-Z0-9]/gi, subst).trim();
    }

    public static findNamed(scope, name) {
        name = name.trim();
        let found = this.find(scope, name);
        if (found) return found;
        return this.get(scope, name);
    }

    public static find(scope, name) {

        if (name.indexOf("this.") == 0) {
            name = name.substring(5);
            return this.get(scope, name);
        }
        return this.get(scope, name);
    }

    // leaking(key) {
    //     Object.defineProperty(global, key, {
    //         set (value) {
    //             throw new Error("Global Leak: "+key);
    //         }
    //     });
    // },
    //
    public static split(s) {
        s = s.replace(/\[(\w+)\]/g, ".$1"); // convert indexes to properties
        s = s.replace(/^\./, ""); // strip a leading dot
        return s.split(".");
    }

    public static get(o, s) {
        let a = this.split(s);
        if (!a.length) return false;

        for (let i = 0, n = a.length; i < n; ++i) {
            let k = a[i];
            if (o && o[k] != undefined) {
                o = o[k];
            } else {
                return;
            }
        }
        return o;
    }

    public static set(o, s, v) {
        let k,
            a = this.split(s);
        if (!a.length) return false;

        for (let i = 0, n = a.length - 1; i < n; ++i) {
            k = a[i];
            o = o[k] = o[k] || {};
        }
        k = a[a.length - 1];
        o[k] = v;
        return o[k];
    }

    public static env(prefix: string, config: any, env: any) {
        // iterate through 'env' adding prefixed properties to 'config'
        env = env || process.env || {};

        for (let k in env) {
            let v = env[k];
            if (k.indexOf(prefix) === 0) {
                let key = k
                    .toLowerCase()
                    .replace(/_/g, ".")
                    .substring(prefix.length);
                if (!_.isUndefined(v)) {
                    throw new Error("ENV path not set: " + key) 
                }
            }
        }
        return config;
    }

    public static redact(model: any, fields: []) {
        for (let i in fields) {
            let f = fields[i];
            delete model[f];
        }
        return model;
    }

    public static clean(mess: any) {
        let res = {};
        if (!mess) return res;

        // let self = this;

        // Object.getOwnPropertyNames(mess).forEach(function (key) {
        //     if (_.isObject(mess[key])) {
        //         res[key] = self.clean(mess[key]);
        //     } else {
        //         res[key] = mess[key];
        //     }
        //     res[key] = mess[key];
        // }, mess);

        mess = util.inspect(mess, { showHidden: false, colors: false });

        return this.decycle(mess);
        // return res;
    }

    public static tail(str: string, char: string) {
        let ix = str.indexOf(char);
        if (ix >= 0) return str.substring(ix + 1);
        return null;
    }

    // public static deref(json: any, done: jref.SchemaCallback ) {
    //     jref.dereference(json, done);
    // }

    /**
     * compute intersection of two array
     *
     * @param a
     * @param b
     */

    public static intersect(a: any, b: any): any {
        let t = null;
        if (b.length > a.length) (t = b), (b = a), (a = t); // indexOf to loop over shorter

        return a.filter(function (e) {
            return b.indexOf(e) > -1;
        });
    }

    public static decycle = function (object: any) {
        // Make a deep copy of an object or array, assuring that there is at most
        // one instance of each object or array in the resulting structure. The
        // duplicate references (which might be forming cycles) are replaced with
        // an object of the form

        //      {"$ref": PATH}

        // where the PATH is a JSONPath string that locates the first occurance.

        // So,

        //      var a = [];
        //      a[0] = a;
        //      return JSON.stringify(VARS.decycle(a));

        // produces the string '[{"$ref":"$"}]'.

        // JSONPath is used to locate the unique object. $ indicates the top level of
        // the object or array. [NUMBER] or [STRING] indicates a child element or
        // property.

        var objects = new WeakMap(); // object to path mappings

        return (function derez(value, path) {
            // The derez function recurses through the object, producing the deep copy.

            var old_path; // The path of an earlier occurance of value
            var nu; // The new object or array

            // typeof null === "object", so go on if this value is really an object but not
            // one of the weird builtin objects.

            if (typeof value === "function") {
                value = null;
            }
            if (
                typeof value === "object" &&
                value !== null &&
                !(value instanceof Boolean) &&
                !(value instanceof Date) &&
                !(value instanceof Number) &&
                !(value instanceof RegExp) &&
                !(value instanceof String)
            ) {
                // If the value is an object or array, look to see if we have already
                // encountered it. If so, return a {"$ref":PATH} object. This uses an
                // ES6 WeakMap.

                old_path = objects.get(value);
                if (old_path !== undefined) {
                    return { $ref: old_path };
                }

                // Otherwise, accumulate the unique value and its path.

                objects.set(value, path);

                // If it is an array, replicate the array.

                if (Array.isArray(value)) {
                    nu = [];
                    value.forEach(function (element, i) {
                        nu[i] = derez(element, path + "[" + i + "]");
                    });
                } else {
                    // If it is an object, replicate the object.

                    nu = {};
                    Object.getOwnPropertyNames(value).forEach(function (name) {
                        // Object.keys(value).forEach(function (name) {
                        nu[name] = derez(
                            value[name],
                            path + "[" + JSON.stringify(name) + "]"
                        );
                    });
                }
                return nu;
            }
            return value;
        })(object, "$");
    };

    public static toBoolean(value){
        switch(value.toLowerCase().trim()){
            case "true": case "yes": case "1": return true;
            case "false": case "no": case "0": case null: return false;
            default: return Boolean(value);
        }
    }

    public static typeof(value) {
        return _.isArray(value)?"array":typeof value;
    }

}
