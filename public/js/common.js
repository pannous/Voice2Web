// bad IE
if (typeof console === "undefined")
    console = { log: function() { } };

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

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