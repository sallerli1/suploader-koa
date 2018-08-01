// get type string of a construtor function
function getType(fn) {
    if (fn === undefined) {
        return undefined
    }
    const match = fn && fn.toString().match(/^\s*function (\w+)/)
    return match ? match[1] : ''
}

// get type string of a variable
function getTypeOf(value) {
    let fn = value === undefined ? undefined : Object.getPrototypeOf(value).constructor
    return getType(fn)
}

// check if a variable's type is the type provided
function isType(type, value) {
    return getTypeOf(value) === getType(type)
}

let _toString = Object.prototype.toString;

function isObject (obj) {
    return obj !== null && typeof obj === 'object';
}

function isPlainObject (obj) {
    return _toString.call(obj) === '[object Object]';
}

module.exports = {
    getType,
    getTypeOf,
    isType,
    isObject,
    isPlainObject
}