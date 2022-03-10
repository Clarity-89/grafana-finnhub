define(["@grafana/data","@grafana/ui","react","rxjs"], function(__WEBPACK_EXTERNAL_MODULE__grafana_data__, __WEBPACK_EXTERNAL_MODULE__grafana_ui__, __WEBPACK_EXTERNAL_MODULE_react__, __WEBPACK_EXTERNAL_MODULE_rxjs__) { return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./module.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "../node_modules/lodash.capitalize/index.js":
/*!**************************************************!*\
  !*** ../node_modules/lodash.capitalize/index.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used to compose unicode character classes. */
var rsAstralRange = '\\ud800-\\udfff',
    rsComboMarksRange = '\\u0300-\\u036f\\ufe20-\\ufe23',
    rsComboSymbolsRange = '\\u20d0-\\u20f0',
    rsVarRange = '\\ufe0e\\ufe0f';

/** Used to compose unicode capture groups. */
var rsAstral = '[' + rsAstralRange + ']',
    rsCombo = '[' + rsComboMarksRange + rsComboSymbolsRange + ']',
    rsFitz = '\\ud83c[\\udffb-\\udfff]',
    rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')',
    rsNonAstral = '[^' + rsAstralRange + ']',
    rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}',
    rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]',
    rsZWJ = '\\u200d';

/** Used to compose unicode regexes. */
var reOptMod = rsModifier + '?',
    rsOptVar = '[' + rsVarRange + ']?',
    rsOptJoin = '(?:' + rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*',
    rsSeq = rsOptVar + reOptMod + rsOptJoin,
    rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';

/** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');

/** Used to detect strings with [zero-width joiners or code points from the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/). */
var reHasUnicode = RegExp('[' + rsZWJ + rsAstralRange  + rsComboMarksRange + rsComboSymbolsRange + rsVarRange + ']');

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/**
 * Converts an ASCII `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function asciiToArray(string) {
  return string.split('');
}

/**
 * Checks if `string` contains Unicode symbols.
 *
 * @private
 * @param {string} string The string to inspect.
 * @returns {boolean} Returns `true` if a symbol is found, else `false`.
 */
function hasUnicode(string) {
  return reHasUnicode.test(string);
}

/**
 * Converts `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function stringToArray(string) {
  return hasUnicode(string)
    ? unicodeToArray(string)
    : asciiToArray(string);
}

/**
 * Converts a Unicode `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function unicodeToArray(string) {
  return string.match(reUnicode) || [];
}

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Built-in value references. */
var Symbol = root.Symbol;

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * The base implementation of `_.slice` without an iteratee call guard.
 *
 * @private
 * @param {Array} array The array to slice.
 * @param {number} [start=0] The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns the slice of `array`.
 */
function baseSlice(array, start, end) {
  var index = -1,
      length = array.length;

  if (start < 0) {
    start = -start > length ? 0 : (length + start);
  }
  end = end > length ? length : end;
  if (end < 0) {
    end += length;
  }
  length = start > end ? 0 : ((end - start) >>> 0);
  start >>>= 0;

  var result = Array(length);
  while (++index < length) {
    result[index] = array[index + start];
  }
  return result;
}

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

/**
 * Casts `array` to a slice if it's needed.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {number} start The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns the cast slice.
 */
function castSlice(array, start, end) {
  var length = array.length;
  end = end === undefined ? length : end;
  return (!start && end >= length) ? array : baseSlice(array, start, end);
}

/**
 * Creates a function like `_.lowerFirst`.
 *
 * @private
 * @param {string} methodName The name of the `String` case method to use.
 * @returns {Function} Returns the new case function.
 */
function createCaseFirst(methodName) {
  return function(string) {
    string = toString(string);

    var strSymbols = hasUnicode(string)
      ? stringToArray(string)
      : undefined;

    var chr = strSymbols
      ? strSymbols[0]
      : string.charAt(0);

    var trailing = strSymbols
      ? castSlice(strSymbols, 1).join('')
      : string.slice(1);

    return chr[methodName]() + trailing;
  };
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

/**
 * Converts the first character of `string` to upper case and the remaining
 * to lower case.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to capitalize.
 * @returns {string} Returns the capitalized string.
 * @example
 *
 * _.capitalize('FRED');
 * // => 'Fred'
 */
function capitalize(string) {
  return upperFirst(toString(string).toLowerCase());
}

/**
 * Converts the first character of `string` to upper case.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category String
 * @param {string} [string=''] The string to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.upperFirst('fred');
 * // => 'Fred'
 *
 * _.upperFirst('FRED');
 * // => 'FRED'
 */
var upperFirst = createCaseFirst('toUpperCase');

module.exports = capitalize;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/global.js */ "../node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "../node_modules/tslib/tslib.es6.js":
/*!******************************************!*\
  !*** ../node_modules/tslib/tslib.es6.js ***!
  \******************************************/
/*! exports provided: __extends, __assign, __rest, __decorate, __param, __metadata, __awaiter, __generator, __createBinding, __exportStar, __values, __read, __spread, __spreadArrays, __spreadArray, __await, __asyncGenerator, __asyncDelegator, __asyncValues, __makeTemplateObject, __importStar, __importDefault, __classPrivateFieldGet, __classPrivateFieldSet */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__extends", function() { return __extends; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__assign", function() { return __assign; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__rest", function() { return __rest; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__decorate", function() { return __decorate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__param", function() { return __param; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__metadata", function() { return __metadata; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__awaiter", function() { return __awaiter; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__generator", function() { return __generator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__createBinding", function() { return __createBinding; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__exportStar", function() { return __exportStar; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__values", function() { return __values; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__read", function() { return __read; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__spread", function() { return __spread; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__spreadArrays", function() { return __spreadArrays; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__spreadArray", function() { return __spreadArray; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__await", function() { return __await; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__asyncGenerator", function() { return __asyncGenerator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__asyncDelegator", function() { return __asyncDelegator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__asyncValues", function() { return __asyncValues; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__makeTemplateObject", function() { return __makeTemplateObject; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__importStar", function() { return __importStar; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__importDefault", function() { return __importDefault; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__classPrivateFieldGet", function() { return __classPrivateFieldGet; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__classPrivateFieldSet", function() { return __classPrivateFieldSet; });
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    }
    return __assign.apply(this, arguments);
}

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
}

function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

var __createBinding = Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});

function __exportStar(m, o) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
}

function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

/** @deprecated */
function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
}

/** @deprecated */
function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
}

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function __asyncDelegator(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
}

function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};

var __setModuleDefault = Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
};

function __importStar(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
}

function __importDefault(mod) {
    return (mod && mod.__esModule) ? mod : { default: mod };
}

function __classPrivateFieldGet(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}

function __classPrivateFieldSet(receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
}


/***/ }),

/***/ "../node_modules/webpack/buildin/global.js":
/*!*************************************************!*\
  !*** ../node_modules/webpack/buildin/global.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),

/***/ "./DataSource.ts":
/*!***********************!*\
  !*** ./DataSource.ts ***!
  \***********************/
/*! exports provided: DataSource */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DataSource", function() { return DataSource; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../node_modules/tslib/tslib.es6.js");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs */ "rxjs");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(rxjs__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _grafana_data__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @grafana/data */ "@grafana/data");
/* harmony import */ var _grafana_data__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_grafana_data__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./types */ "./types.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./utils */ "./utils.ts");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./constants */ "./constants.ts");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }








var DataSource =
/** @class */
function (_super) {
  DataSource.$inject = ["instanceSettings", "backendSrv"];

  Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__extends"])(DataSource, _super);
  /** @ngInject */


  function DataSource(instanceSettings, backendSrv) {
    var _this = _super.call(this, instanceSettings) || this;

    _this.backendSrv = backendSrv;

    _this.tableResponse = function (data, target) {
      // Empty data frame
      if (!data || data.s === 'no_data') {
        return [new _grafana_data__WEBPACK_IMPORTED_MODULE_2__["MutableDataFrame"]({
          refId: target.refId,
          fields: [{
            name: 'no data',
            type: _grafana_data__WEBPACK_IMPORTED_MODULE_2__["FieldType"].string,
            values: []
          }],
          meta: {
            preferredVisualisationType: 'table'
          }
        })];
      }

      return [new _grafana_data__WEBPACK_IMPORTED_MODULE_2__["MutableDataFrame"]({
        refId: target.refId,
        fields: Object.entries(data).map(function (_a) {
          var _b = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__read"])(_a, 2),
              key = _b[0],
              val = _b[1];

          return {
            name: key,
            type: typeof val === 'string' ? _grafana_data__WEBPACK_IMPORTED_MODULE_2__["FieldType"].string : _grafana_data__WEBPACK_IMPORTED_MODULE_2__["FieldType"].number,
            values: [val]
          };
        }),
        meta: {
          preferredVisualisationType: 'table'
        }
      })];
    };

    _this.dataSourceName = instanceSettings.name;
    _this.url = instanceSettings.url;
    _this.websocketUrl = "wss://ws.finnhub.io";
    return _this;
  }

  DataSource.prototype.constructQuery = function (target, range) {
    var _a, _b, _c;

    var symbol = (_a = target.symbol) === null || _a === void 0 ? void 0 : _a.toUpperCase();
    var refId = target.refId;

    switch ((_b = target.type) === null || _b === void 0 ? void 0 : _b.value) {
      case 'candle':
        {
          var resolution = target.resolution;
          return {
            symbol: symbol,
            resolution: resolution,
            from: range.from.unix(),
            to: range.to.unix(),
            refId: refId
          };
        }

      case 'metric':
        return {
          symbol: symbol,
          metric: (_c = target === null || target === void 0 ? void 0 : target.metric) === null || _c === void 0 ? void 0 : _c.value,
          refId: refId
        };

      case 'social-sentiment':
        return {
          symbol: symbol,
          from: range.from.format('YYYY-MM-DD'),
          to: range.to.format('YYYY-MM-DD'),
          refId: refId
        };

      default:
        return {
          symbol: symbol,
          refId: refId
        };
    }
  };

  DataSource.prototype.query = function (options) {
    var _this = this;

    var targets = options.targets,
        range = options.range;
    var visibleTargets = targets.filter(function (target) {
      return !target.hide;
    });
    var streams = visibleTargets.filter(function (target) {
      var _a;

      return ((_a = target.type) === null || _a === void 0 ? void 0 : _a.value) === 'trades';
    }).map(function (target) {
      var targetWithDefaults = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])(Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])({}, _types__WEBPACK_IMPORTED_MODULE_3__["defaultQuery"]), target);

      var query = _this.constructQuery(targetWithDefaults, range);

      return new rxjs__WEBPACK_IMPORTED_MODULE_1__["Observable"](function (subscriber) {
        var frame = new _grafana_data__WEBPACK_IMPORTED_MODULE_2__["CircularDataFrame"]({
          append: 'tail',
          capacity: 1000
        });
        frame.refId = query.refId;
        frame.addField({
          name: 'ts',
          type: _grafana_data__WEBPACK_IMPORTED_MODULE_2__["FieldType"].time
        });
        frame.addField({
          name: 'value',
          type: _grafana_data__WEBPACK_IMPORTED_MODULE_2__["FieldType"].number
        });
        var url = _this.url + "/websocket";
        console.log('url', url);

        _this.backendSrv.get("" + url).then(function (r) {
          return console.log('socket r', r);
        })["catch"](function (e) {
          return console.error('Error retrieving data', e);
        });

        var socket = new WebSocket(_this.websocketUrl);

        socket.onopen = function () {
          return socket.send(JSON.stringify({
            type: 'subscribe',
            symbol: query.symbol
          }));
        };

        socket.onerror = function (error) {
          return console.log("WebSocket error: " + JSON.stringify(error));
        };

        socket.onclose = function () {
          return subscriber.complete();
        };

        socket.onmessage = function (event) {
          try {
            var data = JSON.parse(event.data);

            if (data.type === 'trade') {
              var _a = data.data[0],
                  t = _a.t,
                  p = _a.p;
              frame.add({
                ts: t,
                value: p
              });
              subscriber.next({
                data: [frame],
                key: query.refId
              });
            }
          } catch (e) {
            console.error(e);
          }
        };

        return function () {
          socket.send(JSON.stringify({
            type: 'unsubscribe',
            symbol: query.symbol
          }));
          socket.close();
        };
      });
    });
    var promises = visibleTargets.filter(function (target) {
      var _a;

      return ((_a = target.type) === null || _a === void 0 ? void 0 : _a.value) !== 'trades';
    }).map(function (target) {
      var targetWithDefaults = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])(Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])({}, _types__WEBPACK_IMPORTED_MODULE_3__["defaultQuery"]), target);

      var request;
      var queryText = targetWithDefaults.queryText,
          type = targetWithDefaults.type; // Ignore other query params if there's a free text query

      if (queryText) {
        request = _this.freeTextQuery(queryText);
      } else {
        var query = _this.constructQuery(Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])(Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])({}, _types__WEBPACK_IMPORTED_MODULE_3__["defaultQuery"]), target), range);

        request = _this.get(type.value, query);
      } // Combine received data and its target


      return request.then(function (data) {
        var isTable = Object(_utils__WEBPACK_IMPORTED_MODULE_4__["getTargetType"])(type) === _types__WEBPACK_IMPORTED_MODULE_3__["TargetType"].Table;

        if (data.metric) {
          data = data.metric;
        }

        return isTable ? _this.tableResponse(data, target) : _this.tsResponse(data, target);
      });
    });
    var observable = Object(rxjs__WEBPACK_IMPORTED_MODULE_1__["from"])(Promise.all(promises).then(function (data) {
      return {
        data: data.flat()
      };
    }));
    return rxjs__WEBPACK_IMPORTED_MODULE_1__["merge"].apply(void 0, Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__spreadArray"])(Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__spreadArray"])([], Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__read"])(streams), false), [observable], false));
  }; // Timeseries response


  DataSource.prototype.tsResponse = function (data, target) {
    var refId = target.refId;
    var emptyDf = [new _grafana_data__WEBPACK_IMPORTED_MODULE_2__["MutableDataFrame"]({
      refId: refId,
      fields: [{
        name: 'no data',
        type: _grafana_data__WEBPACK_IMPORTED_MODULE_2__["FieldType"].string,
        values: []
      }],
      meta: {
        preferredVisualisationType: 'graph'
      }
    })];

    if ((data === null || data === void 0 ? void 0 : data.s) === 'no_data' || typeof data === 'string') {
      return emptyDf;
    }

    switch (target.type.value) {
      case 'earnings':
        {
          var excludedFields_1 = ['symbol'];
          var timeKey_1 = 'period';
          var keys = Object.keys(data[0]).filter(function (key) {
            return !excludedFields_1.includes(key);
          });
          return [new _grafana_data__WEBPACK_IMPORTED_MODULE_2__["MutableDataFrame"]({
            refId: refId,
            fields: keys.map(function (key) {
              return {
                type: key === timeKey_1 ? _grafana_data__WEBPACK_IMPORTED_MODULE_2__["FieldType"].time : _grafana_data__WEBPACK_IMPORTED_MODULE_2__["FieldType"].number,
                name: key,
                values: data.map(function (dp) {
                  return key === timeKey_1 ? Object(_grafana_data__WEBPACK_IMPORTED_MODULE_2__["dateTime"])(dp[key]).valueOf() : dp[key];
                })
              };
            }),
            meta: {
              preferredVisualisationType: 'graph'
            }
          })];
        }

      case 'quote':
        {
          var timeKey_2 = 't';
          var fields = new Map([['t', 'time'], ['c', 'current price']]);
          return [new _grafana_data__WEBPACK_IMPORTED_MODULE_2__["MutableDataFrame"]({
            refId: refId,
            fields: Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__spreadArray"])([], Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__read"])(fields), false).map(function (_a) {
              var _b = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__read"])(_a, 2),
                  key = _b[0],
                  label = _b[1];

              return {
                type: key === timeKey_2 ? _grafana_data__WEBPACK_IMPORTED_MODULE_2__["FieldType"].time : _grafana_data__WEBPACK_IMPORTED_MODULE_2__["FieldType"].number,
                name: label,
                values: key === timeKey_2 ? [data[key] * 1000] : [data[key]]
              };
            }),
            meta: {
              preferredVisualisationType: 'table'
            }
          })];
        }

      case 'candle':
        {
          var timeKey_3 = 't';
          return [new _grafana_data__WEBPACK_IMPORTED_MODULE_2__["MutableDataFrame"]({
            refId: refId,
            fields: Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__spreadArray"])([], Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__read"])(_constants__WEBPACK_IMPORTED_MODULE_5__["candleFields"]), false).map(function (_a) {
              var _b = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__read"])(_a, 2),
                  key = _b[0],
                  label = _b[1];

              return {
                type: key === timeKey_3 ? _grafana_data__WEBPACK_IMPORTED_MODULE_2__["FieldType"].time : _grafana_data__WEBPACK_IMPORTED_MODULE_2__["FieldType"].number,
                name: key,
                title: label,
                values: key === timeKey_3 ? data[key].map(function (val) {
                  return val * 1000;
                }) : data[key]
              };
            }),
            meta: {
              preferredVisualisationType: 'graph'
            }
          })];
        }

      case 'social-sentiment':
        var timeKey_4 = 'atTime';
        var networks = Object.keys(data).filter(function (key) {
          return key !== 'symbol' && !!data[key].length;
        });
        return networks.map(function (network) {
          var networkData = data[network];
          var keys = Object.keys(networkData[0]);
          var collectedData = Object.fromEntries(keys.map(function (key) {
            return [key, networkData.map(function (d) {
              return d[key];
            })];
          }));
          return new _grafana_data__WEBPACK_IMPORTED_MODULE_2__["MutableDataFrame"]({
            refId: refId,
            fields: keys.map(function (key) {
              return {
                type: key === timeKey_4 ? _grafana_data__WEBPACK_IMPORTED_MODULE_2__["FieldType"].time : _grafana_data__WEBPACK_IMPORTED_MODULE_2__["FieldType"].number,
                name: key + "-" + network,
                values: collectedData[key].map(function (val) {
                  return key === timeKey_4 ? Object(_grafana_data__WEBPACK_IMPORTED_MODULE_2__["dateTime"])(val).valueOf() : val;
                })
              };
            }),
            meta: {
              preferredVisualisationType: 'graph'
            }
          });
        });

      default:
        var timeKeys_1 = ['t', 'time', 'period'];
        return [new _grafana_data__WEBPACK_IMPORTED_MODULE_2__["MutableDataFrame"]({
          refId: refId,
          fields: Object.entries(data).map(function (_a) {
            var _b = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__read"])(_a, 2),
                key = _b[0],
                value = _b[1];

            return {
              type: timeKeys_1.includes(key) ? _grafana_data__WEBPACK_IMPORTED_MODULE_2__["FieldType"].time : _typeof(value),
              name: key,
              values: timeKeys_1.includes(key) ? Object(_utils__WEBPACK_IMPORTED_MODULE_4__["ensureArray"])(value).map(function (val) {
                return val * 1000;
              }) : Object(_utils__WEBPACK_IMPORTED_MODULE_4__["ensureArray"])(value)
            };
          })
        })];
    }
  };

  DataSource.prototype.testDatasource = function () {
    return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function () {
      var resp;
      return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"])(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4
            /*yield*/
            , this.get('profile2', {
              symbol: 'AAPL'
            })];

          case 1:
            resp = _a.sent();

            if (resp.status === 200) {
              return [2
              /*return*/
              , {
                status: 'success'
              }];
            }

            return [2
            /*return*/
            , {
              status: 'error'
            }];
        }
      });
    });
  };

  DataSource.prototype.freeTextQuery = function (query) {
    return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function () {
      var e_1;
      return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"])(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2,, 3]);

            return [4
            /*yield*/
            , this.backendSrv.get(this.url + "/api/" + query)];

          case 1:
            return [2
            /*return*/
            , _a.sent()];

          case 2:
            e_1 = _a.sent();
            console.error('Error retrieving data', e_1);
            return [3
            /*break*/
            , 3];

          case 3:
            return [2
            /*return*/
            ];
        }
      });
    });
  };

  DataSource.prototype.get = function (dataType, params) {
    if (params === void 0) {
      params = {};
    }

    return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function () {
      var url, e_2;
      return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"])(this, function (_a) {
        switch (_a.label) {
          case 0:
            url = this.url + "/api" + (dataType === 'quote' ? '' : '/stock');
            _a.label = 1;

          case 1:
            _a.trys.push([1, 3,, 4]);

            return [4
            /*yield*/
            , this.backendSrv.get(url + "/" + dataType, params)];

          case 2:
            return [2
            /*return*/
            , _a.sent()];

          case 3:
            e_2 = _a.sent();
            console.error('Error retrieving data', e_2);
            throw e_2;

          case 4:
            return [2
            /*return*/
            ];
        }
      });
    });
  };

  return DataSource;
}(_grafana_data__WEBPACK_IMPORTED_MODULE_2__["DataSourceApi"]);



/***/ }),

/***/ "./components/ConfigEditor.tsx":
/*!*************************************!*\
  !*** ./components/ConfigEditor.tsx ***!
  \*************************************/
/*! exports provided: ConfigEditor */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ConfigEditor", function() { return ConfigEditor; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../node_modules/tslib/tslib.es6.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _grafana_ui__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @grafana/ui */ "@grafana/ui");
/* harmony import */ var _grafana_ui__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_grafana_ui__WEBPACK_IMPORTED_MODULE_2__);



var ConfigEditor = function ConfigEditor(_a) {
  var options = _a.options,
      onOptionsChange = _a.onOptionsChange;
  var secureJsonData = options.secureJsonData,
      secureJsonFields = options.secureJsonFields;
  var configured = !!(secureJsonFields === null || secureJsonFields === void 0 ? void 0 : secureJsonFields.apiToken);

  var onAPIKeyChange = function onAPIKeyChange(event) {
    onOptionsChange(Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])(Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])({}, options), {
      secureJsonData: {
        apiToken: event.target.value
      }
    }));
  };

  var onTokenReset = function onTokenReset() {
    onOptionsChange(Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])(Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])({}, options), {
      secureJsonFields: Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])(Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])({}, options.secureJsonFields), {
        apiToken: false
      }),
      secureJsonData: Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])(Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])({}, options.secureJsonData), {
        apiToken: ''
      })
    }));
  };

  return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_grafana_ui__WEBPACK_IMPORTED_MODULE_2__["InlineFieldRow"], null, react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_grafana_ui__WEBPACK_IMPORTED_MODULE_2__["InlineField"], {
    label: "API Token",
    disabled: configured,
    labelWidth: 20
  }, react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_grafana_ui__WEBPACK_IMPORTED_MODULE_2__["Input"], {
    width: 39.5,
    type: 'password',
    value: (secureJsonData === null || secureJsonData === void 0 ? void 0 : secureJsonData.apiToken) || '',
    placeholder: configured ? 'Configured' : 'Token for the Finnhub API',
    onChange: onAPIKeyChange
  })), configured && react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_grafana_ui__WEBPACK_IMPORTED_MODULE_2__["Button"], {
    variant: 'secondary',
    onClick: onTokenReset
  }, "Reset"));
};

/***/ }),

/***/ "./components/QueryEditor.tsx":
/*!************************************!*\
  !*** ./components/QueryEditor.tsx ***!
  \************************************/
/*! exports provided: QueryEditor */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "QueryEditor", function() { return QueryEditor; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "../node_modules/tslib/tslib.es6.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var lodash_capitalize__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! lodash.capitalize */ "../node_modules/lodash.capitalize/index.js");
/* harmony import */ var lodash_capitalize__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(lodash_capitalize__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _grafana_ui__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @grafana/ui */ "@grafana/ui");
/* harmony import */ var _grafana_ui__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_grafana_ui__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../types */ "./types.ts");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../constants */ "./constants.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../utils */ "./utils.ts");








var queryTypes = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__spreadArray"])(Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__spreadArray"])([], Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__read"])(_constants__WEBPACK_IMPORTED_MODULE_5__["TIMESERIES_QUERY_TYPES"]), false), Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__read"])(_constants__WEBPACK_IMPORTED_MODULE_5__["TABLE_QUERY_TYPES"]), false);

var metricOptions = _constants__WEBPACK_IMPORTED_MODULE_5__["stockMetrics"].map(function (metric) {
  return {
    value: metric,
    label: metric
  };
});
var resolutions = [{
  value: '1',
  label: '1'
}, {
  value: '5',
  label: '5'
}, {
  value: '15',
  label: '15'
}, {
  value: '30',
  label: '30'
}, {
  value: '60',
  label: '60'
}, {
  value: 'D',
  label: 'Day'
}, {
  value: 'W',
  label: 'Week'
}, {
  value: 'M',
  label: 'Month'
}];
var QueryEditor = function QueryEditor(_a) {
  var onChange = _a.onChange,
      onRunQuery = _a.onRunQuery,
      query = _a.query;

  var onQueryTextChange = function onQueryTextChange(event) {
    var value = event.target.value;
    var queryType = value.split('?')[0];
    onChange(Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])(Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])({}, query), {
      queryText: value,
      format: Object(_utils__WEBPACK_IMPORTED_MODULE_6__["getTargetType"])({
        value: queryType
      })
    }));
  };

  var onValueChange = function onValueChange(event) {
    var _a;

    var _b = event.target,
        name = _b.name,
        value = _b.value;
    onChange(Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])(Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])({}, query), (_a = {}, _a[name] = value, _a)));
  };

  var onTypeChange = function onTypeChange(item) {
    onChange(Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])(Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])({}, query), {
      type: item
    }));

    if (item.value === 'exchange') {
      onRunQuery();
    }
  };

  var onMetricChange = function onMetricChange(item) {
    onChange(Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])(Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])({}, query), {
      metric: item
    }));
  };

  var onResolutionChange = function onResolutionChange(resolution) {
    onChange(Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])(Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])({}, query), {
      resolution: resolution.value
    }));
  };

  var onKeyDown = function onKeyDown(event) {
    if (event.key === 'Enter') {
      onRunQuery();
    }
  };

  var dataTypes = queryTypes.map(function (type) {
    return {
      label: lodash_capitalize__WEBPACK_IMPORTED_MODULE_2___default()(type).replace(/\d+/g, ''),
      value: type
    };
  });

  var _b = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])(Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])({}, _types__WEBPACK_IMPORTED_MODULE_4__["defaultQuery"]), query),
      queryText = _b.queryText,
      symbol = _b.symbol,
      type = _b.type,
      resolution = _b.resolution,
      metric = _b.metric;

  return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_grafana_ui__WEBPACK_IMPORTED_MODULE_3__["Form"], {
    onSubmit: onRunQuery
  }, function (_a) {
    var register = _a.register,
        errors = _a.errors;
    return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_1___default.a.Fragment, null, react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_grafana_ui__WEBPACK_IMPORTED_MODULE_3__["Field"], {
      label: "Data type"
    }, react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_grafana_ui__WEBPACK_IMPORTED_MODULE_3__["Select"], {
      "data-testid": "Data type",
      onChange: onTypeChange,
      options: dataTypes,
      value: type,
      defaultValue: type
    })), type.value !== 'exchange' && react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_grafana_ui__WEBPACK_IMPORTED_MODULE_3__["Field"], {
      label: "Symbol"
    }, react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_grafana_ui__WEBPACK_IMPORTED_MODULE_3__["Input"], {
      value: symbol,
      name: 'symbol',
      onChange: onValueChange,
      onKeyDown: onKeyDown,
      placeholder: "Stock symbol"
    })), type.value === 'candle' && react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_grafana_ui__WEBPACK_IMPORTED_MODULE_3__["Field"], {
      label: "Resolution"
    }, react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_grafana_ui__WEBPACK_IMPORTED_MODULE_3__["Select"], {
      onChange: onResolutionChange,
      options: resolutions,
      value: resolution
    })), type.value === 'metric' && react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_grafana_ui__WEBPACK_IMPORTED_MODULE_3__["Field"], {
      label: "Metric"
    }, react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_grafana_ui__WEBPACK_IMPORTED_MODULE_3__["Select"], {
      onChange: onMetricChange,
      options: metricOptions,
      value: metric,
      defaultValue: metric
    })), type.value !== 'trades' && react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_grafana_ui__WEBPACK_IMPORTED_MODULE_3__["Field"], {
      label: "Free Query Text",
      horizontal: false,
      description: "Experimental. Will override any selected values above."
    }, react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_grafana_ui__WEBPACK_IMPORTED_MODULE_3__["Input"], {
      value: queryText || '',
      onChange: onQueryTextChange,
      onKeyDown: onKeyDown,
      placeholder: "Custom query e.g. 'earnings?symbol=AAPL'"
    })));
  });
};

/***/ }),

/***/ "./components/index.ts":
/*!*****************************!*\
  !*** ./components/index.ts ***!
  \*****************************/
/*! exports provided: ConfigEditor, QueryEditor */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _ConfigEditor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ConfigEditor */ "./components/ConfigEditor.tsx");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ConfigEditor", function() { return _ConfigEditor__WEBPACK_IMPORTED_MODULE_0__["ConfigEditor"]; });

/* harmony import */ var _QueryEditor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./QueryEditor */ "./components/QueryEditor.tsx");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "QueryEditor", function() { return _QueryEditor__WEBPACK_IMPORTED_MODULE_1__["QueryEditor"]; });




/***/ }),

/***/ "./constants.ts":
/*!**********************!*\
  !*** ./constants.ts ***!
  \**********************/
/*! exports provided: TIMESERIES_QUERY_TYPES, TABLE_QUERY_TYPES, stockMetrics, candleFields */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TIMESERIES_QUERY_TYPES", function() { return TIMESERIES_QUERY_TYPES; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TABLE_QUERY_TYPES", function() { return TABLE_QUERY_TYPES; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "stockMetrics", function() { return stockMetrics; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "candleFields", function() { return candleFields; });
var TIMESERIES_QUERY_TYPES = ['quote', 'earnings', 'candle', 'trades', 'social-sentiment'];
var TABLE_QUERY_TYPES = ['profile2', 'metric'];
var stockMetrics = ['price', 'valuation', 'growth', 'margin', 'management', 'financialStrength', 'perShare'];
var candleFields = new Map([['o', 'Opening price'], ['h', 'High price'], ['l', 'Low price'], ['c', 'Closing price'], ['v', 'Traded volume'], ['t', 'Time']]);

/***/ }),

/***/ "./module.ts":
/*!*******************!*\
  !*** ./module.ts ***!
  \*******************/
/*! exports provided: plugin */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "plugin", function() { return plugin; });
/* harmony import */ var _grafana_data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @grafana/data */ "@grafana/data");
/* harmony import */ var _grafana_data__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_grafana_data__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _DataSource__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./DataSource */ "./DataSource.ts");
/* harmony import */ var _components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./components */ "./components/index.ts");



var plugin = new _grafana_data__WEBPACK_IMPORTED_MODULE_0__["DataSourcePlugin"](_DataSource__WEBPACK_IMPORTED_MODULE_1__["DataSource"]).setConfigEditor(_components__WEBPACK_IMPORTED_MODULE_2__["ConfigEditor"]).setQueryEditor(_components__WEBPACK_IMPORTED_MODULE_2__["QueryEditor"]).setExploreQueryField(_components__WEBPACK_IMPORTED_MODULE_2__["QueryEditor"]);

/***/ }),

/***/ "./types.ts":
/*!******************!*\
  !*** ./types.ts ***!
  \******************/
/*! exports provided: TargetType, defaultQuery */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TargetType", function() { return TargetType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "defaultQuery", function() { return defaultQuery; });
var TargetType;

(function (TargetType) {
  TargetType["Timeseries"] = "TIMESERIES";
  TargetType["Table"] = "TABLE";
})(TargetType || (TargetType = {}));

var defaultQuery = {
  type: {
    value: 'profile2',
    label: 'Profile'
  },
  format: TargetType.Timeseries,
  count: 1000,
  resolution: 1,
  symbol: '',
  metric: {
    value: 'price',
    label: 'price'
  }
};

/***/ }),

/***/ "./utils.ts":
/*!******************!*\
  !*** ./utils.ts ***!
  \******************/
/*! exports provided: getTargetType, ensureArray */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getTargetType", function() { return getTargetType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ensureArray", function() { return ensureArray; });
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./types */ "./types.ts");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./constants */ "./constants.ts");


var getTargetType = function getTargetType(item) {
  if (item === void 0) {
    item = {};
  }

  if (!_constants__WEBPACK_IMPORTED_MODULE_1__["TIMESERIES_QUERY_TYPES"].includes(item.value)) {
    return _types__WEBPACK_IMPORTED_MODULE_0__["TargetType"].Table;
  }

  return _types__WEBPACK_IMPORTED_MODULE_0__["TargetType"].Timeseries;
};
var ensureArray = function ensureArray(val) {
  if (!val) {
    return [];
  } else if (Array.isArray(val)) {
    return val;
  } else {
    return [val];
  }
};

/***/ }),

/***/ "@grafana/data":
/*!********************************!*\
  !*** external "@grafana/data" ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__grafana_data__;

/***/ }),

/***/ "@grafana/ui":
/*!******************************!*\
  !*** external "@grafana/ui" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__grafana_ui__;

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_react__;

/***/ }),

/***/ "rxjs":
/*!***********************!*\
  !*** external "rxjs" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_rxjs__;

/***/ })

/******/ })});;
//# sourceMappingURL=module.js.map