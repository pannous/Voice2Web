// bad IE
if (! console )
    console = {
        log: function() { }
    };

// is it bad to add such fundamental methods to native class?
String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

//String.prototype.trim = function () {
//    return this.replace(/^\s*/, "").replace(/\s*$/, "");
//}
String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, '');
};

//** Get Url parameters as hash -> only one parameter key is allowed */
function getUrlVars() {
    var vars = [], hash;
    var params = window.location.href.slice(window.location.href.indexOf('?') + 1);
    params = decodeURIComponent(params);
    var hashes = params.split('&');
    for(var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars[hash[0]] = hash[1];
    }
    return vars;
}

Common = function() {};

if (typeof module !== "undefined") module.exports = Common

Common.prototype.clone = function(doc) {
    var newdoc = {};
    // todo clone recursive!?
    for(var prop in doc) {
        newdoc[prop] = doc[prop];
    }
    return newdoc;
};

Common.prototype.isArray = function(someVar) {
    return Object.prototype.toString.call(someVar) === '[object Array]';
}