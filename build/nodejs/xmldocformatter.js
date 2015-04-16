(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// when used in node, this will actually load the util module we depend on
// versus loading the builtin util module as happens otherwise
// this is a bug in node module loading as far as I am concerned
var util = require('util/');

var pSlice = Array.prototype.slice;
var hasOwn = Object.prototype.hasOwnProperty;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
  else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = stackStartFunction.name;
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

},{"util/":8}],3:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],4:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require("oMfpAn"))
},{"oMfpAn":5}],5:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],6:[function(require,module,exports){
exports.isatty = function () { return false; };

function ReadStream() {
  throw new Error('tty.ReadStream is not implemented');
}
exports.ReadStream = ReadStream;

function WriteStream() {
  throw new Error('tty.ReadStream is not implemented');
}
exports.WriteStream = WriteStream;

},{}],7:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],8:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":7,"inherits":3,"oMfpAn":5}],9:[function(require,module,exports){
(function (process){
var assert = require('assert'),
  path = require('path'),
  Completion = require('./lib/completion'),
  Parser = require('./lib/parser'),
  Usage = require('./lib/usage'),
  Validation = require('./lib/validation');

Argv(process.argv.slice(2));

var exports = module.exports = Argv;
function Argv (processArgs, cwd) {
    processArgs = processArgs || []; // handle calling yargs().

    var self = {};
    var completion = null;
    var usage = null;
    var validation = null;

    if (!cwd) cwd = process.cwd();

    self.$0 = process.argv
        .slice(0,2)
        .map(function (x) {
            // ignore the node bin, specify this in your
            // bin file with #!/usr/bin/env node
            if (~x.indexOf('node')) return;
            var b = rebase(cwd, x);
            return x.match(/^\//) && b.length < x.length
                ? b : x
        })
        .join(' ').trim();
    ;

    if (process.env._ != undefined && process.argv[1] == process.env._) {
        self.$0 = process.env._.replace(
            path.dirname(process.execPath) + '/', ''
        );
    }

    var options;
    self.resetOptions = self.reset = function () {
        // put yargs back into its initial
        // state, this is useful for creating a
        // nested CLI.
        options = {
            array: [],
            boolean: [],
            string: [],
            narg: {},
            key: {},
            alias: {},
            default: {},
            defaultDescription: {},
            requiresArg: [],
            count: [],
            normalize: [],
            config: []
        };

        usage = Usage(self); // handle usage output.
        validation = Validation(self, usage); // handle arg validation.
        completion = Completion(self, usage);

        demanded = {};

        exitProcess = true;
        strict = false;
        helpOpt = null;
        versionOpt = null;
        completionOpt = null;

        return self;
    };
    self.resetOptions();

    self.boolean = function (bools) {
        options.boolean.push.apply(options.boolean, [].concat(bools));
        return self;
    };

    self.array = function (arrays) {
        options.array.push.apply(options.array, [].concat(arrays));
        return self;
    }

    self.nargs = function (key, n) {
        if (typeof key === 'object') {
            Object.keys(key).forEach(function(k) {
                self.nargs(k, key[k]);
            });
        } else {
            options.narg[key] = n;
        }
        return self;
    }

    self.normalize = function (strings) {
        options.normalize.push.apply(options.normalize, [].concat(strings));
        return self;
    };

    self.config = function (configs) {
        options.config.push.apply(options.config, [].concat(configs));
        return self;
    };

    self.example = function (cmd, description) {
        usage.example(cmd, description);
        return self;
    };

    self.command = function (cmd, description) {
        usage.command(cmd, description);
        return self;
    };

    self.string = function (strings) {
        options.string.push.apply(options.string, [].concat(strings));
        return self;
    };

    self.default = function (key, value, defaultDescription) {
        if (typeof key === 'object') {
            Object.keys(key).forEach(function (k) {
                self.default(k, key[k]);
            });
        }
        else {
            if (typeof value === 'function') {
                defaultDescription = usage.functionDescription(value, defaultDescription);
                value = value.call();
            }
            options.defaultDescription[key] = defaultDescription;
            options.default[key] = value;
        }
        return self;
    };

    self.alias = function (x, y) {
        if (typeof x === 'object') {
            Object.keys(x).forEach(function (key) {
                self.alias(key, x[key]);
            });
        }
        else {
            options.alias[x] = (options.alias[x] || []).concat(y);
        }
        return self;
    };

    self.count = function(counts) {
        options.count.push.apply(options.count, [].concat(counts));
        return self;
    };

    var demanded = {};
    self.demand = self.required = self.require = function (keys, msg) {
        if (typeof keys == 'number') {
            if (!demanded._) demanded._ = { count: 0, msg: null };
            demanded._.count += keys;
            demanded._.msg = msg;
        }
        else if (Array.isArray(keys)) {
            keys.forEach(function (key) {
                self.demand(key, msg);
            });
        }
        else {
            if (typeof msg === 'string') {
                demanded[keys] = { msg: msg };
            }
            else if (msg === true || typeof msg === 'undefined') {
                demanded[keys] = { msg: null };
            }
        }

        return self;
    };
    self.getDemanded = function() {
        return demanded;
    };

    self.requiresArg = function (requiresArgs) {
        options.requiresArg.push.apply(options.requiresArg, [].concat(requiresArgs));
        return self;
    };

    self.implies = function (key, value) {
        validation.implies(key, value);
        return self;
    };

    self.usage = function (msg, opts) {
        if (!opts && typeof msg === 'object') {
            opts = msg;
            msg = null;
        }

        usage.usage(msg);

        if (opts) self.options(opts);

        return self;
    };

    self.epilogue = self.epilog = function (msg) {
        usage.epilog(msg);
        return self;
    };

    self.fail = function (f) {
        usage.failFn(f);
        return self;
    };

    self.check = function (f) {
        validation.check(f);
        return self;
    };

    self.defaults = self.default;

    self.describe = function (key, desc) {
        usage.describe(key, desc);
        return self;
    };

    self.parse = function (args) {
        return parseArgs(args);
    };

    self.option = self.options = function (key, opt) {
        if (typeof key === 'object') {
            Object.keys(key).forEach(function (k) {
                self.options(k, key[k]);
            });
        }
        else {
            assert(typeof opt === 'object', 'second argument to option must be an object');

            options.key[key] = true; // track manually set keys.

            if (opt.alias) self.alias(key, opt.alias);

            var demand = opt.demand || opt.required || opt.require;

            if (demand) {
                self.demand(key, demand);
            }
            if ('default' in opt) {
                self.default(key, opt.default);
            }
            if ('nargs' in opt) {
                self.nargs(key, opt.nargs);
            }
            if (opt.boolean || opt.type === 'boolean') {
                self.boolean(key);
                if (opt.alias) self.boolean(opt.alias);
            }
            if (opt.array || opt.type === 'array') {
                self.array(key);
                if (opt.alias) self.array(opt.alias);
            }
            if (opt.string || opt.type === 'string') {
                self.string(key);
                if (opt.alias) self.string(opt.alias);
            }
            if (opt.count || opt.type === 'count') {
                self.count(key);
            }

            var desc = opt.describe || opt.description || opt.desc;
            if (desc) {
                self.describe(key, desc);
            }

            if (opt.requiresArg) {
                self.requiresArg(key);
            }
        }

        return self;
    };
    self.getOptions = function() {
        return options;
    };

    self.wrap = function (cols) {
        usage.wrap(cols);
        return self;
    };

    var strict = false;
    self.strict = function () {
        strict = true;
        return self;
    };
    self.getStrict = function () {
        return strict;
    }

    self.showHelp = function (fn) {
        usage.showHelp(fn);
        return self;
    };

    var versionOpt = null;
    self.version = function (ver, opt, msg) {
        versionOpt = opt || 'version';
        usage.version(ver);
        self.describe(versionOpt, msg || 'Show version number');
        return self;
    };

    var helpOpt = null;
    self.addHelpOpt = function (opt, msg) {
        helpOpt = opt;
        self.describe(opt, msg || 'Show help');
        return self;
    };

    self.showHelpOnFail = function (enabled, message) {
        usage.showHelpOnFail(enabled, message);
        return self;
    };

    var exitProcess = true;
    self.exitProcess = function (enabled) {
        if (typeof enabled !== 'boolean') {
            enabled = true;
        }
        exitProcess = enabled;
        return self;
    };
    self.getExitProcess = function () {
        return exitProcess;
    }

    self.help = function () {
        if (arguments.length > 0) return self.addHelpOpt.apply(self, arguments);

        if (!self.parsed) parseArgs(processArgs); // run parser, if it has not already been executed.

        return usage.help();
    };

    var completionOpt = null,
      completionCommand = null;
    self.completion = function(cmd, desc, fn) {
        // a function to execute when generating
        // completions can be provided as the second
        // or third argument to completion.
        if (typeof desc === 'function') {
            fn = desc;
            desc = null;
        }

        // register the completion command.
        completionCommand = cmd;
        completionOpt = completion.completionKey;
        self.command(completionCommand, desc || 'generate bash completion script');

        // a function can be provided
        if (fn) completion.registerFunction(fn);

        return self;
    };

    self.showCompletionScript = function($0) {
        $0 = $0 || self.$0;
        console.log(completion.generateCompletionScript($0));
        return self;
    };

    self.getUsageInstance = function () {
        return usage;
    };

    self.getValidationInstance = function () {
        return validation;
    }

    Object.defineProperty(self, 'argv', {
        get : function () {
          var args = null;

          try {
            args = parseArgs(processArgs);
          } catch (err) {
            usage.fail(err.message);
          }

          return args;
        },
        enumerable : true
    });

    function parseArgs (args) {
        var parsed = Parser(args, options),
            argv = parsed.argv,
            aliases = parsed.aliases;

        argv.$0 = self.$0;

        self.parsed = parsed;

        // generate a completion script for adding to ~/.bashrc.
        if (completionCommand && ~argv._.indexOf(completionCommand)) {
            self.showCompletionScript();
            if (exitProcess){
                process.exit(0);
            }
        }

        Object.keys(argv).forEach(function(key) {
            if (key === helpOpt) {
                self.showHelp('log');
                if (exitProcess){
                    process.exit(0);
                }
            }
            else if (key === versionOpt) {
                usage.showVersion();
                if (exitProcess){
                    process.exit(0);
                }
            }
            else if (key === completionOpt) {
                // we allow for asynchronous completions,
                // e.g., loading in a list of commands from an API.
                completion.getCompletion(function(completions) {
                    (completions || []).forEach(function(completion) {
                        console.log(completion);
                    });

                    if (exitProcess){
                        process.exit(0);
                    }
                });
                return;
            }
        });

        validation.nonOptionCount(argv);
        validation.missingArgumentValue(argv);
        validation.requiredArguments(argv);

        if (strict) {
            validation.unknownArguments(argv, aliases);
        }

        validation.customChecks(argv, aliases);
        validation.implications(argv);
        setPlaceholderKeys(argv);

        return argv;
    }

    function setPlaceholderKeys (argv) {
        Object.keys(options.key).forEach(function(key) {
            if (typeof argv[key] === 'undefined') argv[key] = undefined;
        });
    }

    sigletonify(self);
    return self;
};

// rebase an absolute path to a relative one with respect to a base directory
// exported for tests
exports.rebase = rebase;
function rebase (base, dir) {
  return path.relative(base, dir);
};

/*  Hack an instance of Argv with process.argv into Argv
    so people can do
        require('yargs')(['--beeble=1','-z','zizzle']).argv
    to parse a list of args and
        require('yargs').argv
    to get a parsed version of process.argv.
*/
function sigletonify(inst) {
    Object.keys(inst).forEach(function (key) {
        if (key === 'argv') {
          Argv.__defineGetter__(key, inst.__lookupGetter__(key));
        } else {
          Argv[key] = typeof inst[key] == 'function'
              ? inst[key].bind(inst)
              : inst[key];
        }
    });
}

}).call(this,require("oMfpAn"))
},{"./lib/completion":10,"./lib/parser":11,"./lib/usage":12,"./lib/validation":13,"assert":2,"oMfpAn":5,"path":4}],10:[function(require,module,exports){
(function (process,__dirname){
var fs = require('fs'),
  path = require('path');

// add bash completions to your
//  yargs-powered applications.
module.exports = function (yargs, usage) {
  var self = {
    completionKey: 'get-yargs-completions'
  };

  // get a list of completion commands.
  self.getCompletion = function (done) {
    var completions = [],
      current = process.argv[process.argv.length - 1],
      previous = process.argv.slice(process.argv.indexOf('--' + self.completionKey) + 1),
      argv = yargs.parse(previous);

    // a custom completion function can be provided
    // to completion().
    if (completionFunction) {
      if (completionFunction.length < 3) {
        // synchronous completion function.
        return done(completionFunction(current, argv));
      } else {
        // asynchronous completion function
        return completionFunction(current, argv, function(completions) {
          done(completions);
        });
      }
    }

    if (!current.match(/^-/)) {
      usage.getCommands().forEach(function(command) {
        completions.push(command[0]);
      });
    }

    if (current.match(/^-/)) {
      Object.keys(yargs.getOptions().key).forEach(function(key) {
        completions.push('--' + key);
      });
    }

    done(completions);
  };

  // generate the completion script to add to your .bashrc.
  self.generateCompletionScript = function ($0) {
    var script = fs.readFileSync(
        path.resolve(__dirname, '../completion.sh.hbs'),
        'utf-8'
      ),
      name = path.basename($0);

    // add ./to applications not yet installed as bin.
    if ($0.match(/\.js$/)) $0 = './' + $0;

    script = script.replace(/{{app_name}}/g, name);
    return script.replace(/{{app_path}}/g, $0);
  };

  // register a function to perform your own custom
  // completions., this function can be either
  // synchrnous or asynchronous.
  var completionFunction = null;
  self.registerFunction = function (fn) {
      completionFunction = fn;
  }

  return self;
};

}).call(this,require("oMfpAn"),"/../../node_modules/yargs/lib")
},{"fs":1,"oMfpAn":5,"path":4}],11:[function(require,module,exports){
(function (process){
// fancy-pants parsing of argv, originally forked
// from minimist: https://www.npmjs.com/package/minimist
var camelCase = require('camelcase'),
  fs = require('fs'),
  path = require('path');

function increment (orig) {
    return orig !== undefined ? orig + 1 : 0;
}

module.exports = function (args, opts) {
    if (!opts) opts = {};
    var flags = { arrays: {}, bools : {}, strings : {}, counts: {}, normalize: {}, configs: {} };

    [].concat(opts['array']).filter(Boolean).forEach(function (key) {
        flags.arrays[key] = true;
    });

    [].concat(opts['boolean']).filter(Boolean).forEach(function (key) {
        flags.bools[key] = true;
    });

    [].concat(opts.string).filter(Boolean).forEach(function (key) {
        flags.strings[key] = true;
    });

    [].concat(opts.count).filter(Boolean).forEach(function (key) {
        flags.counts[key] = true;
    });

    [].concat(opts.normalize).filter(Boolean).forEach(function (key) {
        flags.normalize[key] = true;
    });

    [].concat(opts.config).filter(Boolean).forEach(function (key) {
        flags.configs[key] = true;
    });

    var aliases = {},
        newAliases = {};

    extendAliases(opts.key);
    extendAliases(opts.alias);

    var defaults = opts['default'] || {};
    Object.keys(defaults).forEach(function (key) {
        if (/-/.test(key) && !opts.alias[key]) {
            var c = camelCase(key);
            aliases[key] = aliases[key] || [];
            // don't allow the same key to be added multiple times.
            if (aliases[key].indexOf(c) === -1) {
                aliases[key] = (aliases[key] || []).concat(c);
                newAliases[c] = true;
            }
        }
        (aliases[key] || []).forEach(function (alias) {
            defaults[alias] = defaults[key];
        });
    });

    var argv = { _ : [] };
    Object.keys(flags.bools).forEach(function (key) {
        setArg(key, !(key in defaults) ? false : defaults[key]);
    });

    var notFlags = [];
    if (args.indexOf('--') !== -1) {
        notFlags = args.slice(args.indexOf('--')+1);
        args = args.slice(0, args.indexOf('--'));
    }

    for (var i = 0; i < args.length; i++) {
        var arg = args[i];

        // -- seperated by =
        if (arg.match(/^--.+=/)) {
            // Using [\s\S] instead of . because js doesn't support the
            // 'dotall' regex modifier. See:
            // http://stackoverflow.com/a/1068308/13216
            var m = arg.match(/^--([^=]+)=([\s\S]*)$/);
            setArg(m[1], m[2]);
        }
        else if (arg.match(/^--no-.+/)) {
            var key = arg.match(/^--no-(.+)/)[1];
            setArg(key, false);
        }
        // -- seperated by space.
        else if (arg.match(/^--.+/)) {
            var key = arg.match(/^--(.+)/)[1];

            if (checkAllAliases(key, opts.narg)) {
                i = eatNargs(i, key, args);
            } else {
                var next = args[i + 1];

                if (next !== undefined && !next.match(/^-/)
                    && !checkAllAliases(key, flags.bools)
                    && !checkAllAliases(key, flags.counts)) {
                    setArg(key, next);
                    i++;
                }
                else if (/^(true|false)$/.test(next)) {
                    setArg(key, next);
                    i++;
                }
                else {
                    setArg(key, defaultForType(guessType(key, flags)));
                }
            }
        }
        // dot-notation flag seperated by '='.
        else if (arg.match(/^-.\..+=/)) {
            var m = arg.match(/^-([^=]+)=([\s\S]*)$/);
            setArg(m[1], m[2]);
        }
        // dot-notation flag seperated by space.
        else if (arg.match(/^-.\..+/)) {
            var key = arg.match(/^-(.\..+)/)[1];
            var next = args[i + 1];
            if (next !== undefined && !next.match(/^-/)
                && !checkAllAliases(key, flags.bools)
                && !checkAllAliases(key, flags.counts)) {
                setArg(key, next);
                i++;
            }
            else {
                setArg(key, defaultForType(guessType(key, flags)));
            }
        }
        else if (arg.match(/^-[^-]+/)) {
            var letters = arg.slice(1,-1).split('');

            var broken = false;
            for (var j = 0; j < letters.length; j++) {
                var next = arg.slice(j+2);

                if (letters[j+1] && letters[j+1] === '=') {
                    setArg(letters[j], arg.slice(j+3));
                    broken = true;
                    break;
                }

                if (next === '-') {
                    setArg(letters[j], next)
                    continue;
                }
                if (/[A-Za-z]/.test(letters[j])
                    && /-?\d+(\.\d*)?(e-?\d+)?$/.test(next)) {
                    setArg(letters[j], next);
                    broken = true;
                    break;
                }
                if (letters[j+1] && letters[j+1].match(/\W/)) {
                    setArg(letters[j], arg.slice(j+2));
                    broken = true;
                    break;
                }
                else {
                    setArg(letters[j], defaultForType(guessType(letters[j], flags)));
                }
            }

            var key = arg.slice(-1)[0];

            if (!broken && key !== '-') {
                if (checkAllAliases(key, opts.narg)) {
                    i = eatNargs(i, key, args);
                } else {
                    if (args[i+1] && !/^(-|--)[^-]/.test(args[i+1])
                        && !checkAllAliases(key, flags.bools)
                        && !checkAllAliases(key, flags.counts)) {
                        setArg(key, args[i+1]);
                        i++;
                    }
                    else if (args[i+1] && /true|false/.test(args[i+1])) {
                        setArg(key, args[i+1]);
                        i++;
                    }
                    else {
                        setArg(key, defaultForType(guessType(key, flags)));
                    }
                }
            }
        }
        else {
            argv._.push(
                flags.strings['_'] || !isNumber(arg) ? arg : Number(arg)
            );
        }
    }

    setConfig(argv);
    applyDefaultsAndAliases(argv, aliases, defaults);

    Object.keys(flags.counts).forEach(function (key) {
        setArg(key, defaults[key]);
    });

    notFlags.forEach(function(key) {
        argv._.push(key);
    });

    // how many arguments should we consume, based
    // on the nargs option?
    function eatNargs (i, key, args) {
        var toEat = checkAllAliases(key, opts.narg);

        if (args.length - (i + 1) < toEat) throw Error('not enough arguments following: ' + key);

        for (var ii = i + 1; ii < (toEat + i + 1); ii++) {
            setArg(key, args[ii]);
        }

        return (i + toEat);
    }

    function setArg (key, val) {
        // handle parsing boolean arguments --foo=true --bar false.
        if (checkAllAliases(key, flags.bools) || checkAllAliases(key, flags.counts)) {
          if (typeof val === 'string') val = val === 'true';
        }

        if (/-/.test(key) && !(aliases[key] && aliases[key].length)) {
            var c = camelCase(key);
            aliases[key] = [c];
            newAliases[c] = true;
        }

        var value = !checkAllAliases(key, flags.strings) && isNumber(val) ? Number(val) : val;

        if (checkAllAliases(key, flags.counts)) {
            value = increment;
        }

        var splitKey = key.split('.');
        setKey(argv, splitKey, value);

        (aliases[splitKey[0]] || []).forEach(function (x) {
            x = x.split('.');

            // handle populating dot notation for both
            // the key and its aliases.
            if (splitKey.length > 1) {
              var a = [].concat(splitKey);
              a.shift(); // nuke the old key.
              x = x.concat(a);
            }

            setKey(argv, x, value);
        });

        var keys = [key].concat(aliases[key] || []);
        for (var i = 0, l = keys.length; i < l; i++) {
            if (flags.normalize[keys[i]]) {
                keys.forEach(function(key) {
                    argv.__defineSetter__(key, function(v) {
                        val = path.normalize(v);
                    });

                    argv.__defineGetter__(key, function () {
                        return typeof val === 'string' ?
                            path.normalize(val) : val;
                    });
                });
                break;
            }
        }
    }

    // set args from config.json file, this should be
    // applied last so that defaults can be applied.
    function setConfig (argv) {
        var configLookup = {};

        // expand defaults/aliases, in-case any happen to reference
        // the config.json file.
        applyDefaultsAndAliases(configLookup, aliases, defaults);

        Object.keys(flags.configs).forEach(function(configKey) {
            var configPath = argv[configKey] || configLookup[configKey];
            if (configPath) {
              try {
                  var config = require(path.resolve(process.cwd(), configPath));
                  Object.keys(config).forEach(function (key) {
                      // setting arguments via CLI takes precedence over
                      // values within the config file.
                      if (argv[key] === undefined) {
                        delete argv[key];
                        setArg(key, config[key]);
                      }
                  });
              } catch (ex) {
                  throw Error('invalid json config file: ' + configPath);
              }
            }
        });
    }

    function applyDefaultsAndAliases(obj, aliases, defaults) {
        Object.keys(defaults).forEach(function (key) {
            if (!hasKey(obj, key.split('.'))) {
                setKey(obj, key.split('.'), defaults[key]);

                (aliases[key] || []).forEach(function (x) {
                    setKey(obj, x.split('.'), defaults[key]);
                });
            }
        });
    }

    function hasKey (obj, keys) {
        var o = obj;
        keys.slice(0,-1).forEach(function (key) {
            o = (o[key] || {});
        });

        var key = keys[keys.length - 1];
        return key in o;
    }

    function setKey (obj, keys, value) {
        var o = obj;
        keys.slice(0,-1).forEach(function (key) {
            if (o[key] === undefined) o[key] = {};
            o = o[key];
        });

        var key = keys[keys.length - 1];
        if (value === increment) {
            o[key] = increment(o[key]);
        }
        else if (o[key] === undefined && checkAllAliases(key, flags.arrays)) {
            o[key] = Array.isArray(value) ? value : [value];
        }
        else if (o[key] === undefined || typeof o[key] === 'boolean') {
            o[key] = value;
        }
        else if (Array.isArray(o[key])) {
            o[key].push(value);
        }
        else {
            o[key] = [ o[key], value ];
        }
    }

    // extend the aliases list with inferred aliases.
    function extendAliases (obj) {
      Object.keys(obj || {}).forEach(function(key) {
        aliases[key] = [].concat(opts.alias[key] || []);
        // For "--option-name", also set argv.optionName
        aliases[key].concat(key).forEach(function (x) {
            if (/-/.test(x)) {
                var c = camelCase(x);
                aliases[key].push(c);
                newAliases[c] = true;
            }
        });
        aliases[key].forEach(function (x) {
            aliases[x] = [key].concat(aliases[key].filter(function (y) {
                return x !== y;
            }));
        });
      });
    }

    // check if a flag is set for any of a key's aliases.
    function checkAllAliases (key, flag) {
        var isSet = false,
          toCheck = [].concat(aliases[key] || [], key);

        toCheck.forEach(function(key) {
            if (flag[key]) isSet = flag[key];
        });

        return isSet;
    };

    // return a default value, given the type of a flag.,
    // e.g., key of type 'string' will default to '', rather than 'true'.
    function defaultForType (type) {
        var def = {
            boolean: true,
            string: '',
            array: []
        };

        return def[type];
    }

    // given a flag, enforce a default type.
    function guessType (key, flags) {
        var type = 'boolean';

        if (flags.strings && flags.strings[key]) type = 'string';
        else if (flags.arrays && flags.arrays[key]) type = 'array';

        return type;
    }

    function isNumber (x) {
        if (typeof x === 'number') return true;
        if (/^0x[0-9a-f]+$/i.test(x)) return true;
        return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(x);
    }

    return {
        argv: argv,
        aliases: aliases,
        newAliases: newAliases
    };
};

}).call(this,require("oMfpAn"))
},{"camelcase":14,"fs":1,"oMfpAn":5,"path":4}],12:[function(require,module,exports){
(function (process){
// this file handles outputting usage instructions,
// failures, etc. keeps logging in one place.
var decamelize = require('decamelize'),
  wordwrap = require('wordwrap'),
  wsize = require('window-size');

module.exports = function (yargs) {
    var self = {};

    // methods for ouputting/building failure message.
    var fails = [];
    self.failFn = function (f) {
        fails.push(f);
    };

    var failMessage = null;
    var showHelpOnFail = true;
    self.showHelpOnFail = function (enabled, message) {
        if (typeof enabled === 'string') {
            message = enabled;
            enabled = true;
        }
        else if (typeof enabled === 'undefined') {
            enabled = true;
        }
        failMessage = message;
        showHelpOnFail = enabled;
        return self;
    };

    self.fail = function (msg) {
        if (fails.length) {
            fails.forEach(function (f) {
                f(msg);
            });
        } else {
            if (showHelpOnFail) yargs.showHelp("error");
            if (msg) console.error(msg);
            if (failMessage) {
                if (msg) console.error("");
                console.error(failMessage);
            }
            if (yargs.getExitProcess()){
                process.exit(1);
            }else{
                throw new Error(msg);
            }
        }
    };

    // methods for ouputting/building help (usage) message.
    var usage;
    self.usage = function (msg) {
        usage = msg;
    };

    var examples = [];
    self.example = function (cmd, description) {
        examples.push([cmd, description || '']);
    };

    var commands = [];
    self.command = function (cmd, description) {
        commands.push([cmd, description || '']);
    };
    self.getCommands = function () {
        return commands;
    };

    var descriptions = {};
    self.describe = function (key, desc) {
        if (typeof key === 'object') {
            Object.keys(key).forEach(function (k) {
                self.describe(k, key[k]);
            });
        }
        else {
            descriptions[key] = desc;
        }
    };
    self.getDescriptions = function() {
        return descriptions;
    }

    var epilog;
    self.epilog = function (msg) {
        epilog = msg;
    };

    var wrap = windowWidth();
    self.wrap = function (cols) {
        wrap = cols;
    };

    self.help = function () {
        var demanded = yargs.getDemanded(),
            options = yargs.getOptions(),
            keys = Object.keys(
                Object.keys(descriptions)
                .concat(Object.keys(demanded))
                .concat(Object.keys(options.default))
                .reduce(function (acc, key) {
                    if (key !== '_') acc[key] = true;
                    return acc;
                }, {})
            );

        var help = keys.length ? [ 'Options:' ] : [];

        // your application's commands, i.e., non-option
        // arguments populated in '_'.
        if (commands.length) {
            help.unshift('');

            var commandsTable = {};
            commands.forEach(function(command) {
                commandsTable[command[0]] = {
                    desc: command[1],
                    extra: ''
                };
            });

            help = ['Commands:'].concat(formatTable(commandsTable, 5), help);
        }

        // the usage string.
        if (usage) {
            var u = usage.replace(/\$0/g, yargs.$0);
            if (wrap) u = wordwrap(0, wrap)(u);
            help.unshift(u, '');
        }

        // the options table.
        var aliasKeys = (Object.keys(options.alias) || [])
            .concat(Object.keys(yargs.parsed.newAliases) || []);

        keys = keys.filter(function(key) {
            return !yargs.parsed.newAliases[key] && aliasKeys.every(function(alias) {
                return -1 == (options.alias[alias] || []).indexOf(key);
            });
        });

        var switches = keys.reduce(function (acc, key) {
            acc[key] = [ key ].concat(options.alias[key] || [])
                .map(function (sw) {
                    return (sw.length > 1 ? '--' : '-') + sw
                })
                .join(', ')
            ;
            return acc;
        }, {});

        var switchTable = {};
        keys.forEach(function (key) {
            var kswitch = switches[key];
            var desc = descriptions[key] || '';
            var type = null;

            if (options.boolean[key]) type = '[boolean]';
            if (options.count[key]) type = '[count]';
            if (options.string[key]) type = '[string]';
            if (options.normalize[key]) type = '[string]';

            var extra = [
                type,
                demanded[key]
                    ? '[required]'
                    : null
                ,
                defaultString(options.default[key], options.defaultDescription[key])
            ].filter(Boolean).join('  ');

            switchTable[kswitch] = {
              desc: desc,
              extra: extra
            };
        });
        help.push.apply(help, formatTable(switchTable, 3));

        if (keys.length) help.push('');

        // describe some common use-cases for your application.
        if (examples.length) {
            examples.forEach(function (example) {
                example[0] = example[0].replace(/\$0/g, yargs.$0);
            });

            var examplesTable = {};
            examples.forEach(function(example) {
                examplesTable[example[0]] = {
                    desc: example[1],
                    extra: ''
                };
            });

            help.push.apply(help, ['Examples:'].concat(formatTable(examplesTable, 5), ''));
        }

        // the usage string.
        if (epilog) {
            var e = epilog.replace(/\$0/g, yargs.$0);
            if (wrap) e = wordwrap(0, wrap)(e);
            help.push(e, '');
        }

        return help.join('\n');
    };

    self.showHelp = function (level) {
        level = level || 'error';
        console[level](self.help());
    }

    self.functionDescription = function (fn, defaultDescription) {
        if (defaultDescription) {
            return defaultDescription;
        }
        var description = fn.name ? decamelize(fn.name, '-') : 'generated-value';
        return ['(', description, ')'].join('');
    }

    // format the default-value-string displayed in
    // the right-hand column.
    function defaultString(value, defaultDescription) {
        var string = '[default: ';

        if (value === undefined) return null;

        if (defaultDescription) {
          string += defaultDescription;
        } else {
          switch (typeof value) {
              case 'string':
                string += JSON.stringify(value);
                break;
              default:
                string += value;
          }
        }

        return string + ']';
    }

    // word-wrapped two-column layout used by
    // examples, options, commands.
    function formatTable (table, padding) {
        var output = [];

        // size of left-hand-column.
        var llen = longest(Object.keys(table));

        // don't allow the left-column to take up
        // more than half of the screen.
        if (wrap) {
            llen = Math.min(llen, parseInt(wrap / 2));
        }

        // size of right-column.
        var desclen = longest(Object.keys(table).map(function (k) {
            return table[k].desc;
        }));

        Object.keys(table).forEach(function(left) {
            var desc = table[left].desc,
              extra = table[left].extra,
              leftLines = null;

            if (wrap) {
                desc = wordwrap(llen + padding + 1, wrap)(desc)
                    .slice(llen + padding + 1);
            }

            // if we need to wrap the left-hand-column,
            // split it on to multiple lines.
            if (wrap && left.length > llen) {
                leftLines = wordwrap(2, llen)(left.trim()).split('\n');
                left = '';
            }

            var lpadding = new Array(
                Math.max(llen - left.length + padding, 0)
            ).join(' ');

            var dpadding = new Array(
                Math.max(desclen - desc.length + 1, 0)
            ).join(' ');

            if (!wrap && dpadding.length > 0) {
                desc += dpadding;
            }

            var prelude = '  ' + left + lpadding;

            var body = [ desc, extra ].filter(Boolean).join('  ');

            if (wrap) {
                var dlines = desc.split('\n');
                var dlen = dlines.slice(-1)[0].length
                    + (dlines.length === 1 ? prelude.length : 0)

                if (extra.length > wrap) {
                    body = desc + '\n' + wordwrap(llen + 4, wrap)(extra)
                } else {
                    body = desc + (dlen + extra.length > wrap - 2
                        ? '\n'
                            + new Array(wrap - extra.length + 1).join(' ')
                            + extra
                        : new Array(wrap - extra.length - dlen + 1).join(' ')
                            + extra
                    );
                }
            }

            if (leftLines) { // handle word-wrapping the left-hand-column.
              var rightLines = body.split('\n'),
                firstLine = prelude + rightLines[0],
                lineCount = Math.max(leftLines.length, rightLines.length);

              for (var i = 0; i < lineCount; i++) {
                var left = leftLines[i],
                  right = i ? rightLines[i] : firstLine;

                output.push(strcpy(left, right, firstLine.length));
              }
            } else {
              output.push(prelude + body);
            }
        });

        return output;
    }

    // find longest string in array of strings.
    function longest (xs) {
        return Math.max.apply(
            null,
            xs.map(function (x) { return x.length })
        );
    }

    // copy one string into another, used when
    // formatting usage table.
    function strcpy (source, destination, width) {
        var str = ''

        source = source || '';
        destination = destination || new Array(width).join(' ');

        for (var i = 0; i < destination.length; i++) {
          var char = destination.charAt(i);

          if (char === ' ') char = source.charAt(i) || char;

          str += char;
        }

        return str;
    }

    // guess the width of the console window, max-width 100.
    function windowWidth() {
        return wsize.width ? Math.min(80, wsize.width) : null;
    }

    // logic for displaying application version.
    var version = null;
    self.version = function (ver, opt, msg) {
        version = ver;
    };

    self.showVersion = function() {
        if (typeof version === 'function') console.log(version());
        else console.log(version);
    };

    return self;
}

}).call(this,require("oMfpAn"))
},{"decamelize":15,"oMfpAn":5,"window-size":16,"wordwrap":17}],13:[function(require,module,exports){
// validation-type-stuff, missing params,
// bad implications, custom checks.
module.exports = function (yargs, usage) {
    var self = {};

    // validate appropriate # of non-option
    // arguments were provided, i.e., '_'.
    self.nonOptionCount = function(argv) {
        var demanded = yargs.getDemanded();

        if (demanded._ && argv._.length < demanded._.count) {
            if (demanded._.msg !== undefined) {
                usage.fail(demanded._.msg);
            } else {
                usage.fail('Not enough non-option arguments: got '
                    + argv._.length + ', need at least ' + demanded._.count
                );
            }
        }
    };

    // make sure that any args that require an
    // value (--foo=bar), have a value.
    self.missingArgumentValue = function(argv) {
        var options = yargs.getOptions();

        if (options.requiresArg.length > 0) {
            var missingRequiredArgs = [];

            options.requiresArg.forEach(function(key) {
                var value = argv[key];

                // parser sets --foo value to true / --no-foo to false
                if (value === true || value === false) {
                    missingRequiredArgs.push(key);
                }
            });

            if (missingRequiredArgs.length == 1) {
                usage.fail("Missing argument value: " + missingRequiredArgs[0]);
            }
            else if (missingRequiredArgs.length > 1) {
                var message = "Missing argument values: " + missingRequiredArgs.join(", ");
                usage.fail(message);
            }
        }
    };

    // make sure all the required arguments are present.
    self.requiredArguments = function(argv) {
        var demanded = yargs.getDemanded(),
          missing = null;

        Object.keys(demanded).forEach(function (key) {
            if (!argv.hasOwnProperty(key)) {
                missing = missing || {};
                missing[key] = demanded[key];
            }
        });

        if (missing) {
            var customMsgs = [];
            Object.keys(missing).forEach(function(key) {
                var msg = missing[key].msg;
                if (msg && customMsgs.indexOf(msg) < 0) {
                    customMsgs.push(msg);
                }
            });
            var customMsg = customMsgs.length ? '\n' + customMsgs.join('\n') : '';

            usage.fail('Missing required arguments: ' + Object.keys(missing).join(', ') + customMsg);
        }
    };

    // check for unknown arguments (strict-mode).
    self.unknownArguments = function(argv, aliases) {
        var descriptions = usage.getDescriptions(),
          demanded = yargs.getDemanded(),
          unknown = [],
          aliasLookup = {};

        Object.keys(aliases).forEach(function (key) {
            aliases[key].forEach(function (alias) {
                aliasLookup[alias] = key;
            });
        });

        Object.keys(argv).forEach(function (key) {
            if (key !== "$0" && key !== "_" &&
                !descriptions.hasOwnProperty(key) &&
                !demanded.hasOwnProperty(key) &&
                !aliasLookup.hasOwnProperty(key)) {
                unknown.push(key);
            }
        });

        if (unknown.length == 1) {
            usage.fail("Unknown argument: " + unknown[0]);
        }
        else if (unknown.length > 1) {
            usage.fail("Unknown arguments: " + unknown.join(", "));
        }
    };

    // custom checks, added using the `check` option on yargs.
    var checks = [];
    self.check = function (f) {
        checks.push(f);
    };

    self.customChecks = function(argv, aliases) {
        checks.forEach(function (f) {
            try {
                var result = f(argv, aliases);
                if (!result) {
                    usage.fail('Argument check failed: ' + f.toString());
                } else if (typeof result === 'string') {
                    usage.fail(result);
                }
            }
            catch (err) {
                usage.fail(err)
            }
        });
    };

    // check implications, argument foo implies => argument bar.
    var implied = {};
    self.implies = function (key, value) {
        if (typeof key === 'object') {
            Object.keys(key).forEach(function (k) {
                self.implies(k, key[k]);
            });
        } else {
            implied[key] = value;
        }
    };
    self.getImplied = function() {
        return implied;
    }

    self.implications = function(argv) {
        var implyFail = [];

        Object.keys(implied).forEach(function (key) {
            var num, origKey = key, value = implied[key];

            // convert string '1' to number 1
            var num = Number(key);
            key = isNaN(num) ? key : num;

            if (typeof key === 'number') {
                // check length of argv._
                key = argv._.length >= key;
            } else if (key.match(/^--no-.+/)) {
                // check if key doesn't exist
                key = key.match(/^--no-(.+)/)[1];
                key = !argv[key];
            } else {
                // check if key exists
                key = argv[key];
            }

            num = Number(value);
            value = isNaN(num) ? value : num;

            if (typeof value === 'number') {
                value = argv._.length >= value;
            } else if (value.match(/^--no-.+/)) {
                value = value.match(/^--no-(.+)/)[1];
                value = !argv[value];
            } else {
                value = argv[value];
            }

            if (key && !value) {
                implyFail.push(origKey);
            }
        });

        if (implyFail.length) {
            var msg = 'Implications failed:\n';

            implyFail.forEach(function (key) {
                msg += ('  ' + key + ' -> ' + implied[key]);
            });

            usage.fail(msg);
        }
    }

    return self;
}

},{}],14:[function(require,module,exports){
'use strict';
module.exports = function (str) {
	str = str.trim();

	if (str.length === 1 || !(/[_.\- ]+/).test(str) ) {
		return str;
	}

	return str
	.replace(/^[_.\- ]+/, '')
	.toLowerCase()
	.replace(/[_.\- ]+(\w|$)/g, function (m, p1) {
		return p1.toUpperCase();
	});
};

},{}],15:[function(require,module,exports){
'use strict';
module.exports = function (str, sep) {
	if (typeof str !== 'string') {
		throw new TypeError('Expected a string');
	}

	return str.replace(/([a-z\d])([A-Z])/g, '$1' + (sep || '_') + '$2').toLowerCase();
};

},{}],16:[function(require,module,exports){
(function (process){
/*
 * window-size
 * https://github.com/jonschlinkert/window-size
 *
 * Copyright (c) 2014 Jon Schlinkert
 * Licensed under the MIT license.
 */

const tty = require('tty')

module.exports = (function() {
  var width;
  var height;

  if(tty.isatty(1) && tty.isatty(2)) {
    if(process.stdout.getWindowSize) {
      width = process.stdout.getWindowSize(1)[0];
      height = process.stdout.getWindowSize(1)[1];
    } else if (tty.getWindowSize) {
      width = tty.getWindowSize()[1];
      height = tty.getWindowSize()[0];
    } else if (process.stdout.columns && process.stdout.rows) {
      height = process.stdout.columns;
      width = process.stdout.rows;
    }
  } else {
    new Error('Error: could not get window size with tty or process.stdout');
  }
  return {
    height: height,
    width: width
  }
})();
}).call(this,require("oMfpAn"))
},{"oMfpAn":5,"tty":6}],17:[function(require,module,exports){
var wordwrap = module.exports = function (start, stop, params) {
    if (typeof start === 'object') {
        params = start;
        start = params.start;
        stop = params.stop;
    }
    
    if (typeof stop === 'object') {
        params = stop;
        start = start || params.start;
        stop = undefined;
    }
    
    if (!stop) {
        stop = start;
        start = 0;
    }
    
    if (!params) params = {};
    var mode = params.mode || 'soft';
    var re = mode === 'hard' ? /\b/ : /(\S+\s+)/;
    
    return function (text) {
        var chunks = text.toString()
            .split(re)
            .reduce(function (acc, x) {
                if (mode === 'hard') {
                    for (var i = 0; i < x.length; i += stop - start) {
                        acc.push(x.slice(i, i + stop - start));
                    }
                }
                else acc.push(x)
                return acc;
            }, [])
        ;
        
        return chunks.reduce(function (lines, rawChunk) {
            if (rawChunk === '') return lines;
            
            var chunk = rawChunk.replace(/\t/g, '    ');
            
            var i = lines.length - 1;
            if (lines[i].length + chunk.length > stop) {
                lines[i] = lines[i].replace(/\s+$/, '');
                
                chunk.split(/\n/).forEach(function (c) {
                    lines.push(
                        new Array(start + 1).join(' ')
                        + c.replace(/^\s+/, '')
                    );
                });
            }
            else if (chunk.match(/\n/)) {
                var xs = chunk.split(/\n/);
                lines[i] += xs.shift();
                xs.forEach(function (c) {
                    lines.push(
                        new Array(start + 1).join(' ')
                        + c.replace(/^\s+/, '')
                    );
                });
            }
            else {
                lines[i] += chunk;
            }
            
            return lines;
        }, [ new Array(start + 1).join(' ') ]).join('\n');
    };
};

wordwrap.soft = wordwrap;

wordwrap.hard = function (start, stop) {
    return wordwrap(start, stop, { mode : 'hard' });
};

},{}],18:[function(require,module,exports){
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/*global module*/

(function () {
    "use strict";

    var yargs = require("yargs");

    var ARGS = yargs
            .usage("\r\n" +
                " xmlformatter.js --source path/to/file.html [--output sample_new.html] [options]" + 
                "\r\n\r\n" +
                " Not asign obyazatel'nye parameters."
            )
    
            .example(
                'xmlformatter.js --source /tmp/sample.html',
                'for formating one file with defaults options'
            )
            .example(
                'xmlformatter.js -s ./sample.html -o ./sample_new.html -v',
                'for formating one file to new file with options'
            )
    
            .describe("source", "File or directory of XML files for formatting.")
            .describe("output", "Path for save formatted files.")
            .describe("streambuffer", "Size of stream reader buffer.")
            .describe("version", "Version of application.")
    
            .demand("source")

            .alias("s", "source")
            .alias("o", "output")
            .alias("sb", "streambuffer")
            .alias("V", "version")
            
            .string("source")
            .string("output")
            .string("streambuffer")
            
            .boolean("version")
    
            .help('h')
            .alias('h', 'help')
    
            .epilog('LabEG. 2015.')
    
            .strict()
    
            .wrap(null)

            .argv;
            

    if (module) {
        module.exports = ARGS;
    }

}());
},{"yargs":9}],19:[function(require,module,exports){
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* jshint node: true */
/* global LabEG */

(function () {
    "use strict";

    var fs = require("fs");
    var args = require("./arguments.js");
    var XMLDOCFormatter = require("../web/xmldocformatter.js");

    var filesForRead = [args.source];
    var filesForWrite = [args.output || args.source];
    var streambuffer = args.streambuffer || 4096;

    var formatFile = function (fileForRead, fileForWrite) {
        
        var level = 0;
        var residueString = "";
        var resultOfFormatt = "";
        
        var xmldocformatter = new XMLDOCFormatter();
        
        //console.log("Begin formatting: ", fileForRead, fileForWrite);

        var fileReadStream = fs.createReadStream(fileForRead, {encoding: 'utf8', autoClose: true, highWaterMark: streambuffer});
        var fileWriteStream = fs.createWriteStream(fileForWrite + ".tmp", {encoding: 'utf8', autoClose: true});

        fileReadStream.on('data', function (chunk) {
            //console.log("Writing chunk on disk.");
            fileWriteStream.write(xmldocformatter.format(chunk));
        });

        fileReadStream.on('end', function (chunk) {
//            console.log('End stream.');
            fs.rename(fileForWrite + ".tmp", fileForWrite);
            fileWriteStream.end();
        });
        
    };

    var i = 0;
    for (i = 0; i < filesForRead.length; i += 1) {
        //fuction with async read and write
        formatFile(filesForRead[i], filesForWrite[i]);
    }

}());
},{"../web/xmldocformatter.js":20,"./arguments.js":18,"fs":1}],20:[function(require,module,exports){
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*global module*/

var LabEG = this.LabEG || {};
LabEG.Lib = LabEG.Lib || {};

if (LabEG.Lib.XMLDOCFormatter) {
    throw new Error("Redefine: LabEG.Lib.XMLFormatter");
}

(function () {
    "use strict";

    /**
     * @description 
     * Library for formatting XML documents, like as XML, HTML, JSP, PHP.
     * 
     * @constructor
     * @param {{charsBetweenTags: string, charsForTabs: string}} inOptions Options for working XMLFormatter
     * @returns {string}
     */
    LabEG.Lib.XMLDOCFormatter = function (inOptions) {

        var self = this;

        this.options = {
            charsBetweenTags: "\r\n",
            charsForTabs: "    ",
            notPairedTags: "meta|link|img|br|input".split("|"),
            isMultilineAttributes: false
        };

        /**
         * @description Log events.
         * @param {string} message Log message.
         * @returns {undefined}
         */
        this.onLog = function (message) {
//            console.log("XMLFormatter log: ", message);
        };

        /**
         * @description Warning events.
         * @param {string} message Warning message.
         * @returns {undefined}
         */
        this.onWarning = function (message) {
            console.warn("XMLFormatter warning: ", message);
        };

        /**
         * @description Errors events.
         * @param {string} message Error message.
         * @returns {undefined}
         */
        this.onError = function (message) {
            console.error("XMLFormatter error: ", message);
        };

        var residueString = "";

        var formattedText = "";
        var endOfParsing = false;
        var level = 0;
        var foundMatch = [];
        var cycles = 0;
        var tabs = "";
        var levelsTags = [];

        var i = 0; //just iterator

        var regexps = {
            Comment: /^<!--.*?-->/, // <!-- comment -->
            Tag: /^<[\s\S]*?>/,
            Text: /^[^<]+/, // just text
            Empty: /^(\r|\n|\r\n|\s|\t)+/ // new lines and spaces
        };

        /**
         * @description Method for formatting text
         * @param {string} text Text for formatting.
         * @returns {string}
         */
        this.format = function (text) {

            formattedText = "";
            endOfParsing = false;
            cycles = 0;

            text = residueString + text;

            while (!endOfParsing) {

                //empty text node or new lines
                foundMatch = text.match(regexps.Empty);
                if (foundMatch) {
                    text = text.substring(foundMatch[0].length, text.length);

                    self.onLog(tabs + "Empty text node or new line.");
                    continue;
                }

                //html comment
                foundMatch = text.match(regexps.Comment);
                if (foundMatch) {
                    text = text.substring(foundMatch[0].length, text.length);

                    tabs = "";
                    for (i = 0; i < level; i += 1) {
                        tabs += self.options.charsForTabs;
                    }

                    self.onLog(tabs + "HTML comment: " + foundMatch[0]);
                    formattedText += tabs + foundMatch[0] + self.options.charsBetweenTags;
                    continue;
                }

                //tag
                foundMatch = text.match(regexps.Tag);
                if (foundMatch) {
                    text = text.substring(foundMatch[0].length, text.length);
                    foundMatch[0] = foundMatch[0]
                            .replace(/\r|\n|\r\n/g, "") //remove new lines
                            .replace(/\s{2,}/g, " ")
                            .replace(/^<\s/g, "<")
                            .replace(/\s>$/g, ">");

                    //level to down on tag </div>
                    if (foundMatch[0].match(/^<\//)) {

                        level -= 1;

                        if (levelsTags[level] !== foundMatch[0].match(/^<\/(.*?)[\s>]/)[1]) {
                            self.onWarning(
                                    "Not corrected closed tag: ",
                                    levelsTags[level],
                                    " - ",
                                    foundMatch[0].match(/^<\/(.*?)[\s>]/)[1]
                                    );
                        }
                    }

                    tabs = "";
                    for (i = 0; i < level; i += 1) {
                        tabs += self.options.charsForTabs;
                    }

                    //level to up on tag <div class="">
                    if (!foundMatch[0].match(/^<[!\/]/) && !foundMatch[0].match(/\/>$/)) {

                        levelsTags[level] = foundMatch[0].match(/^<(.*?)[\s>]/)[1];

                        //not need up increment, if tag not paired
                        if (self.options.notPairedTags.indexOf(levelsTags[level]) === -1) {
                            level += 1;
                        }
                    }

                    self.onLog(tabs + "Tag: " + foundMatch[0]);
                    formattedText += tabs + foundMatch[0] + self.options.charsBetweenTags;
                    continue;
                }

                //simple text
                foundMatch = text.match(regexps.Text);
                if (foundMatch) {
                    text = text.substring(foundMatch[0].length, text.length);
                    foundMatch[0] = foundMatch[0]
                            .replace(/\r|\n|\r\n/g, "")
                            .replace(/\s{2,}/g, " ");

                    tabs = "";
                    for (i = 0; i < level; i += 1) {
                        tabs += self.options.charsForTabs;
                    }

                    self.onLog(tabs + "Simple text: " + foundMatch[0]);
                    formattedText += tabs + foundMatch[0] + self.options.charsBetweenTags;
                    continue;
                }

                if (text.length === 0) {
                    endOfParsing = true;
                    residueString = "";
                    self.onLog("Parsing All block complete.");
                    continue;
                }

                if (text.length > 0) {
                    residueString = text;
                    endOfParsing = true;
                    self.onLog("Parsing All block ended, ending is cached to next cycle.");
                    continue;
                }

                cycles += 1;
                if (cycles > 3) {
                    endOfParsing = true;
                    this.onWarning("Cycles limit.");
                }
            }
            return formattedText;
        };

        /**
         * @description 
         * Clear memory of XMLDOCFormatter.
         * Need if you begin formatting new stream or new document.
         * 
         * @returns {undefined}
         */
        this.clear = function () {
            residueString = "";
            level = 0;
            levelsTags.length = 0;
        };

    };

    if (typeof module != "undefined" && module !== null && module.exports) {
        module.exports = LabEG.Lib.XMLDOCFormatter;
    } else if (typeof define === "function" && define.amd) {
        define(function () {
            return LabEG.Lib.XMLDOCFormatter;
        });
    }

}());
},{}]},{},[19])