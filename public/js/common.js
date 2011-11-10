// bad IE
if (typeof console === "undefined")
    console = {
        log: function() { }
    };

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

// Read a page's GET URL variables and return them as an associative array.
function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

//String.prototype.trim = function () {
//    return this.replace(/^\s*/, "").replace(/\s*$/, "");
//}
String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, '');
};

Common = function() {    
    };

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