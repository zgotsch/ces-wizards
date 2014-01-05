;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//     Underscore.js 1.5.2
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.5.2';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, length = obj.length; i < length; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      var keys = _.keys(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results.push(iterator.call(context, value, index, list));
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    return _.filter(obj, function(value, index, list) {
      return !iterator.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs, first) {
    if (_.isEmpty(attrs)) return first ? void 0 : [];
    return _[first ? 'find' : 'filter'](obj, function(value) {
      for (var key in attrs) {
        if (attrs[key] !== value[key]) return false;
      }
      return true;
    });
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.where(obj, attrs, true);
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity, value: -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed > result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity, value: Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array, using the modern version of the 
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // Sample **n** random values from an array.
  // If **n** is not specified, returns a single random element from the array.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (arguments.length < 2 || guard) {
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    return _.isFunction(value) ? value : function(obj){ return obj[value]; };
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, value, context) {
    var iterator = lookupIterator(value);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, value, context) {
      var result = {};
      var iterator = value == null ? _.identity : lookupIterator(value);
      each(obj, function(value, index) {
        var key = iterator.call(context, value, index, obj);
        behavior(result, key, value);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, key, value) {
    (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, key, value) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, key) {
    _.has(result, key) ? result[key]++ : result[key] = 1;
  });

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = iterator == null ? _.identity : lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    return (n == null) || guard ? array[0] : slice.call(array, 0, n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) {
      return array[array.length - 1];
    } else {
      return slice.call(array, Math.max(array.length - n, 0));
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    each(input, function(value) {
      if (_.isArray(value) || _.isArguments(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var length = _.max(_.pluck(arguments, "length").concat(0));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, '' + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(length);

    while(idx < length) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context.
  _.partial = function(func) {
    var args = slice.call(arguments, 1);
    return function() {
      return func.apply(this, args.concat(slice.call(arguments)));
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) throw new Error("bindAll must be passed function names");
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    options || (options = {});
    var later = function() {
      previous = options.leading === false ? 0 : new Date;
      timeout = null;
      result = func.apply(context, args);
    };
    return function() {
      var now = new Date;
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;
    return function() {
      context = this;
      args = arguments;
      timestamp = new Date();
      var later = function() {
        var last = (new Date()) - timestamp;
        if (last < wait) {
          timeout = setTimeout(later, wait - last);
        } else {
          timeout = null;
          if (!immediate) result = func.apply(context, args);
        }
      };
      var callNow = immediate && !timeout;
      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
      if (callNow) result = func.apply(context, args);
      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func];
      push.apply(args, arguments);
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = new Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = new Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === void 0) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                             _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(Math.max(0, n));
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

}).call(this);

},{}],2:[function(require,module,exports){
var AnimatedSprite, Collision, ColorBox, CreatedAt, Enemy, Lifetime, MoveTowardPlayer, Player, PlayerControl, Position, Spellcaster, StaticSprite, StopsAfter, Turnable, Velocity;

Position = (function() {
  function Position(pos) {
    this.pos = pos != null ? pos : [0, 0];
  }

  return Position;

})();

StaticSprite = (function() {
  function StaticSprite(url, pos, size) {
    this.url = url != null ? url : "resources/sun.gif";
    this.pos = pos != null ? pos : [0, 0];
    this.size = size != null ? size : [128, 128];
  }

  return StaticSprite;

})();

AnimatedSprite = (function() {
  function AnimatedSprite(url, pos, size, speed, dir, once, frameIndices) {
    this.url = url != null ? url : "resources/sun.gif";
    this.pos = pos != null ? pos : [0, 0];
    this.size = size != null ? size : [128, 128];
    this.speed = speed != null ? speed : 1;
    this.dir = dir != null ? dir : 'vertical';
    this.once = once != null ? once : false;
    this.frameIndices = frameIndices != null ? frameIndices : [0];
    this.index = 0;
  }

  return AnimatedSprite;

})();

ColorBox = (function() {
  function ColorBox(size, color) {
    this.size = size != null ? size : [50, 50];
    this.color = color != null ? color : 'red';
  }

  return ColorBox;

})();

Velocity = (function() {
  function Velocity(vector) {
    this.vector = vector != null ? vector : [0, 0];
  }

  return Velocity;

})();

PlayerControl = (function() {
  function PlayerControl(playerSpeed) {
    this.playerSpeed = playerSpeed != null ? playerSpeed : 100;
  }

  return PlayerControl;

})();

Turnable = (function() {
  function Turnable(sprites) {
    this.sprites = sprites;
  }

  return Turnable;

})();

CreatedAt = (function() {
  function CreatedAt() {
    this.createdAt = Date.now();
  }

  return CreatedAt;

})();

StopsAfter = (function() {
  function StopsAfter(time) {
    this.time = time != null ? time : 1000;
  }

  return StopsAfter;

})();

Lifetime = (function() {
  function Lifetime(lifetime) {
    this.lifetime = lifetime != null ? lifetime : 10;
  }

  return Lifetime;

})();

Player = (function() {
  function Player() {}

  return Player;

})();

Enemy = (function() {
  function Enemy() {}

  return Enemy;

})();

MoveTowardPlayer = (function() {
  function MoveTowardPlayer(speed) {
    this.speed = speed != null ? speed : 10;
  }

  return MoveTowardPlayer;

})();

Collision = (function() {
  function Collision(shouldCollide, didCollide, boundingBoxSize) {
    this.shouldCollide = shouldCollide != null ? shouldCollide : (function() {
      return true;
    });
    this.didCollide = didCollide != null ? didCollide : (function() {});
    this.boundingBoxSize = boundingBoxSize != null ? boundingBoxSize : [50, 50];
  }

  return Collision;

})();

Spellcaster = (function() {
  function Spellcaster(spells) {
    this.spells = spells;
  }

  return Spellcaster;

})();

exports.Position = Position;

exports.StaticSprite = StaticSprite;

exports.AnimatedSprite = AnimatedSprite;

exports.ColorBox = ColorBox;

exports.Velocity = Velocity;

exports.PlayerControl = PlayerControl;

exports.Turnable = Turnable;

exports.CreatedAt = CreatedAt;

exports.StopsAfter = StopsAfter;

exports.Lifetime = Lifetime;

exports.Player = Player;

exports.MoveTowardPlayer = MoveTowardPlayer;

exports.Collision = Collision;

exports.Spellcaster = Spellcaster;

exports.Enemy = Enemy;


},{}],3:[function(require,module,exports){
var CollisionSystem, Engine, LifetimeSystem, MoveTowardPlayerSystem, PhysicsSystem, PlayerControlSystem, Renderer, Resources, SpellcastingSystem, SpriteTurningSystem, StopAfterSystem, components, createEnemy, createEngine, engineTick, vecutil, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = require('underscore');

Engine = require('./engine.coffee');

Renderer = require('./renderer.coffee');

Resources = require('./resources.coffee');

components = require('./components.coffee');

vecutil = require('./vecutil.coffee');

PlayerControlSystem = require('./systems/playerControl.coffee');

SpriteTurningSystem = require('./systems/spriteTurning.coffee');

StopAfterSystem = require('./systems/stopAfter.coffee');

PhysicsSystem = require('./systems/physics.coffee');

LifetimeSystem = require('./systems/lifetime.coffee');

MoveTowardPlayerSystem = require('./systems/moveTowardPlayer.coffee');

CollisionSystem = require('./systems/collision.coffee');

SpellcastingSystem = require('./systems/spellcasting.coffee');

createEnemy = function(position) {
  var enemyDidCollide, enemyShouldCollide;
  enemyShouldCollide = function(me, them) {
    return _.has(them.components, 'player');
  };
  enemyDidCollide = function(me, them) {
    return me.components.colorbox.color = 'green';
  };
  return engine.createEntity([new components.Position(position), new components.ColorBox([50, 50], 'magenta'), new components.Velocity(), new components.MoveTowardPlayer(10), new components.Collision(enemyShouldCollide, enemyDidCollide), new components.Enemy()]);
};

engineTick = function(dt) {
  var pos;
  if (Math.random() < dt && Math.random() < 0.5) {
    pos = vecutil.alongPerimeter([[0, 0], vecutil.sub2d([canvas.width, canvas.height], [20, 20])], Math.random());
    return createEnemy(pos);
  }
};

createEngine = function(canvas) {
  var engine;
  window.canvas = canvas;
  engine = new Engine(engineTick);
  window.renderer = new Renderer(canvas);
  engine.addSystem(renderer.system);
  engine.beforeTick = renderer.clearCanvas;
  engine.afterTick = renderer.drawFramerate;
  engine.addSystem(new PhysicsSystem());
  engine.addSystem(new PlayerControlSystem());
  engine.addSystem(new SpriteTurningSystem());
  engine.addSystem(new StopAfterSystem());
  engine.addSystem(new LifetimeSystem());
  engine.addSystem(new MoveTowardPlayerSystem());
  engine.addSystem(new SpellcastingSystem());
  window.collisionSystem = new CollisionSystem([canvas.width, canvas.height]);
  engine.addSystem(collisionSystem);
  Resources.onReady(function() {
    var Fireball, Spell, player;
    engine.start();
    Spell = (function() {
      function Spell(components) {
        this.entity = engine.createEntity(components);
      }

      return Spell;

    })();
    Fireball = (function(_super) {
      __extends(Fireball, _super);

      function Fireball(caster, target) {
        var didCollide, shouldCollide, speed, vector;
        speed = 300;
        vector = vecutil.sub2d(target, caster.components.position.pos);
        vector = vecutil.scaleTo(vector, speed);
        shouldCollide = function(me, them) {
          return _.has(them.components, 'enemy');
        };
        didCollide = function(me, them) {
          me.destroy();
          return them.destroy();
        };
        Fireball.__super__.constructor.call(this, [new components.Position(caster.components.position.pos.slice(0)), new components.ColorBox([20, 20], 'red'), new components.Velocity(vector), new components.Collision(shouldCollide, didCollide, [20, 20]), new components.Lifetime(5)]);
      }

      return Fireball;

    })(Spell);
    return player = engine.createEntity([new components.Position([canvas.width / 2, canvas.height / 2]), new components.ColorBox([50, 50], 'blue'), new components.Velocity(), new components.PlayerControl(), new components.Player(), new components.Collision(), new components.Spellcaster([Fireball])]);
  });
  Resources.load(['resources/sun.gif', 'resources/dragonsprites.gif']);
  return engine;
};

window.createEngine = createEngine;


},{"./components.coffee":2,"./engine.coffee":4,"./renderer.coffee":8,"./resources.coffee":9,"./systems/collision.coffee":11,"./systems/lifetime.coffee":12,"./systems/moveTowardPlayer.coffee":13,"./systems/physics.coffee":14,"./systems/playerControl.coffee":15,"./systems/spellcasting.coffee":16,"./systems/spriteTurning.coffee":17,"./systems/stopAfter.coffee":18,"./vecutil.coffee":20,"underscore":1}],4:[function(require,module,exports){
var Engine, Entity, util,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

util = require('./util.coffee');

Entity = require('./entity.coffee');

Engine = (function() {
  function Engine(tickFunction) {
    this.tickFunction = tickFunction;
    this.gameLoop = __bind(this.gameLoop, this);
    this.entities = {};
    this.systems = [];
    this.lastEntityId = 0;
    this.running = false;
    this.lastFrameTime = null;
  }

  Engine.prototype.createEntity = function(components) {
    var c, componentsObject, entity, id, system, _i, _j, _len, _len1, _ref;
    componentsObject = {};
    for (_i = 0, _len = components.length; _i < _len; _i++) {
      c = components[_i];
      componentsObject[util.keyForComponent(c)] = c;
    }
    id = this.lastEntityId;
    entity = new Entity(id, componentsObject, this);
    this.entities[id] = entity;
    _ref = this.systems;
    for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
      system = _ref[_j];
      system.updateCache(entity);
    }
    this.lastEntityId += 1;
    return entity;
  };

  Engine.prototype.updateEntity = function(entity) {
    var system, _i, _len, _ref, _results;
    _ref = this.systems;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      system = _ref[_i];
      _results.push(system.updateCache(entity));
    }
    return _results;
  };

  Engine.prototype.addSystem = function(system) {
    this.systems.push(system);
    return system.buildCache(this.entities);
  };

  Engine.prototype.tick = function(dt) {
    var system, _i, _len, _ref;
    _ref = this.systems;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      system = _ref[_i];
      system.run(this.entities, dt);
    }
    return this.tickFunction.call(this, dt);
  };

  Engine.prototype.removeDeadEntities = function() {
    var entity, id, system, _i, _len, _ref, _ref1, _results;
    _ref = this.entities;
    _results = [];
    for (id in _ref) {
      entity = _ref[id];
      if (entity.components.destroy != null) {
        entity.components = null;
        _ref1 = this.systems;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          system = _ref1[_i];
          system.updateCache(entity);
        }
        _results.push(delete this.entities[id]);
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Engine.prototype.start = function() {
    this.running = true;
    this.lastFrameTime = null;
    return requestAnimationFrame(this.gameLoop);
  };

  Engine.prototype.reset = function() {
    var system, _i, _len, _ref;
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
    }
    this.entities = {};
    _ref = this.systems;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      system = _ref[_i];
      system.buildCache();
    }
    return this.start();
  };

  Engine.prototype.gameLoop = function(paintTime) {
    var dt;
    if (this.lastFrameTime === null) {
      this.lastFrameTime = paintTime;
    } else {
      dt = (paintTime - this.lastFrameTime) / 1000.0;
      this.lastFrameTime = paintTime;
      if (typeof this.beforeTick === "function") {
        this.beforeTick(dt);
      }
      this.tick(dt);
      this.removeDeadEntities();
      if (typeof this.afterTick === "function") {
        this.afterTick(dt);
      }
      renderer.ctx.strokeText(Object.keys(this.entities).length, 400, 100);
    }
    if (this.running) {
      return this.rafId = requestAnimationFrame(this.gameLoop);
    }
  };

  return Engine;

})();

module.exports = Engine;


},{"./entity.coffee":5,"./util.coffee":19}],5:[function(require,module,exports){
var Entity, util, _;

_ = require('underscore');

util = require('./util.coffee');

Entity = (function() {
  function Entity(id, components, engine) {
    this.id = id;
    this.components = components;
    this.engine = engine;
  }

  Entity.prototype.addComponent = function(component) {
    var componentObject;
    if (this.components) {
      componentObject = {};
      componentObject[util.keyForComponent(component)] = component;
      _.extend(this.components, componentObject);
      return this.engine.updateEntity(this);
    }
  };

  Entity.prototype.removeComponent = function(componentName) {
    if (this.components) {
      if (_.has(this.components, componentName)) {
        delete this.components[componentName];
        return this.engine.updateEntity(this);
      }
    }
  };

  Entity.prototype.destroy = function() {
    return this.components.destroy = true;
  };

  Entity.prototype.toJSON = function() {
    return {
      id: this.id,
      components: this.components
    };
  };

  return Entity;

})();

module.exports = Entity;


},{"./util.coffee":19,"underscore":1}],6:[function(require,module,exports){
var Input;

Input = (function() {
  var keys, mouse, setKey;
  keys = {};
  setKey = function(event, status) {
    var code, key;
    code = event.keyCode;
    key = (function() {
      switch (code) {
        case 32:
          return "SPACE";
        case 37:
          return "LEFT";
        case 38:
          return "UP";
        case 39:
          return "RIGHT";
        case 40:
          return "DOWN";
        case 187:
          return "+";
        case 189:
          return "-";
        default:
          return String.fromCharCode(code);
      }
    })();
    return keys[key] = status;
  };
  document.addEventListener('keydown', function(e) {
    return setKey(e, true);
  });
  document.addEventListener('keyup', function(e) {
    return setKey(e, false);
  });
  document.addEventListener('blur', function() {
    return keys = {};
  });
  mouse = {
    isDown: false,
    pos: [0, 0],
    posRelativeTo: function(element) {
      var rect;
      rect = element.getBoundingClientRect();
      return [this.pos[0] - rect.left, this.pos[1] - rect.top];
    }
  };
  document.addEventListener('mousemove', function(e) {
    mouse.pos[0] = e.x;
    return mouse.pos[1] = e.y;
  });
  document.addEventListener('mousedown', function(e) {
    return mouse.isDown = true;
  });
  document.addEventListener('mouseup', function(e) {
    return mouse.isDown = false;
  });
  return {
    isDown: function(key) {
      return keys[key.toUpperCase()];
    },
    mouse: mouse
  };
})();

module.exports = Input;


},{}],7:[function(require,module,exports){
var BoundNode, BoundQuadTree, Node, QuadTree, qTreeUniq, rectCenter, rectCorners, rectIntersect,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

rectCenter = function(rect) {
  return [rect.x + rect.width / 2, rect.y + rect.height / 2];
};

rectCorners = function(rect) {
  return [[x, y], [x + width, y], [x, y + height], [x + width, y + height]];
};

rectIntersect = function(rect1, rect2) {
  return (Math.abs(rect1.x + rect1.width / 2 - rect2.x - rect2.width / 2) * 2 < (rect1.width + rect2.width)) && (Math.abs(rect1.y + rect1.height / 2 - rect2.y - rect2.height / 2) * 2 < (rect1.height + rect2.height));
};

qTreeUniq = function(arr) {
  var seen, uniques, x, _i, _len;
  seen = {};
  uniques = [];
  for (_i = 0, _len = arr.length; _i < _len; _i++) {
    x = arr[_i];
    if (!seen[x._qtreeid]) {
      uniques.push(x);
      seen[x._qtreeid] = true;
    }
  }
  return uniques;
};

Node = (function() {
  var NE, NW, SE, SW;

  NE = 0;

  NW = 1;

  SW = 2;

  SE = 3;

  function Node(rect, depth, maxDepth, maxChildren) {
    this.rect = rect;
    this.depth = depth;
    this.maxDepth = maxDepth;
    this.maxChildren = maxChildren;
    this.children = [];
    this.nodes = [];
    this.myClass = Node;
    this.nextId = 0;
  }

  Node.prototype._bin = function(item) {
    var center;
    center = rectCenter(this.rect);
    if (item.x < center[0]) {
      if (item.y < center[1]) {
        return NW;
      } else {
        return SW;
      }
    } else {
      if (item.y < center[1]) {
        return NE;
      } else {
        return SE;
      }
    }
  };

  Node.prototype.insert = function(item) {
    var _i, _len, _ref;
    item._qtreeid = this.nextId++;
    if (this.nodes.length) {
      return this.nodes[this._bin(item)].insert(item);
    } else {
      this.children.push(item);
      if (this.children.length > this.maxChildren && this.depth < this.maxDepth) {
        this.subdivide();
        _ref = this.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          this.insert(item);
        }
        return this.children.length = 0;
      }
    }
  };

  Node.prototype.retrieve = function(item) {
    if (this.nodes.length) {
      return this.nodes[this._bin(item)].retrieve(item);
    } else {
      return this.children;
    }
  };

  Node.prototype.subdivide = function() {
    var centerX, centerY, halfHeight, halfWidth, _ref;
    halfWidth = this.rect.width / 2;
    halfHeight = this.rect.height / 2;
    _ref = rectCenter(this.rect), centerX = _ref[0], centerY = _ref[1];
    this.nodes[NE] = new this.myClass({
      x: centerX,
      y: this.rect.y,
      width: halfWidth,
      height: halfHeight
    }, this.depth + 1, this.maxDepth, this.maxChildren);
    this.nodes[NW] = new this.myClass({
      x: this.rect.x,
      y: this.rect.y,
      width: halfWidth,
      height: halfHeight
    }, this.depth + 1, this.maxDepth, this.maxChildren);
    this.nodes[SW] = new this.myClass({
      x: this.rect.x,
      y: centerY,
      width: halfWidth,
      height: halfHeight
    }, this.depth + 1, this.maxDepth, this.maxChildren);
    return this.nodes[SE] = new this.myClass({
      x: centerX,
      y: centerY,
      width: halfWidth,
      height: halfHeight
    }, this.depth + 1, this.maxDepth, this.maxChildren);
  };

  Node.prototype.clear = function() {
    var node, _i, _len, _ref;
    this.children.length = 0;
    _ref = this.nodes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      node = _ref[_i];
      node.clear();
    }
    return this.nodes.length = 0;
  };

  return Node;

})();

BoundNode = (function(_super) {
  __extends(BoundNode, _super);

  function BoundNode(rect, depth, maxDepth, maxChildren) {
    BoundNode.__super__.constructor.call(this, rect, depth, maxDepth, maxChildren);
    this.myClass = BoundNode;
  }

  BoundNode.prototype.insert = function(item) {
    var node, _i, _j, _len, _len1, _ref, _ref1, _results;
    if (item._qtreeid === void 0) {
      item._qtreeid = this.nextId++;
    }
    if (this.nodes.length) {
      _ref = this.nodes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        if (rectIntersect(node.rect, item)) {
          _results.push(node.insert(item));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    } else {
      this.children.push(item);
      if (this.children.length > this.maxChildren && this.depth < this.maxDepth) {
        this.subdivide();
        _ref1 = this.children;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          item = _ref1[_j];
          this.insert(item);
        }
        return this.children.length = 0;
      }
    }
  };

  BoundNode.prototype.retrieve = function(item) {
    var items, node, _i, _len, _ref;
    if (this.nodes.length) {
      items = [];
      _ref = this.nodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        if (rectIntersect(node.rect, item)) {
          items.push.apply(items, node.retrieve(item));
        }
      }
      return qTreeUniq(items);
    } else {
      return this.children;
    }
  };

  return BoundNode;

})(Node);

QuadTree = (function() {
  function QuadTree(rect, maxDepth, maxChildren) {
    if (maxDepth == null) {
      maxDepth = 10;
    }
    if (maxChildren == null) {
      maxChildren = 10;
    }
    this.root = new Node(rect, 0, maxDepth, maxChildren);
  }

  QuadTree.prototype.insert = function(itemOrArray) {
    var item, _i, _len, _results;
    if (itemOrArray instanceof Array) {
      _results = [];
      for (_i = 0, _len = itemOrArray.length; _i < _len; _i++) {
        item = itemOrArray[_i];
        _results.push(this.root.insert(item));
      }
      return _results;
    } else {
      return this.root.insert(itemOrArray);
    }
  };

  QuadTree.prototype.clear = function() {
    return this.root.clear();
  };

  QuadTree.prototype.retrieve = function(item) {
    return this.root.retrieve(item).slice(0);
  };

  return QuadTree;

})();

BoundQuadTree = (function(_super) {
  __extends(BoundQuadTree, _super);

  function BoundQuadTree(rect, maxDepth, maxChildren) {
    if (maxDepth == null) {
      maxDepth = 10;
    }
    if (maxChildren == null) {
      maxChildren = 10;
    }
    this.root = new BoundNode(rect, 0, maxDepth, maxChildren);
  }

  return BoundQuadTree;

})(QuadTree);

exports.QuadTree = QuadTree;

exports.BoundQuadTree = BoundQuadTree;


},{}],8:[function(require,module,exports){
var Renderer, Resources, system, util, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = require('underscore');

Resources = require('./resources.coffee');

system = require('./system.coffee');

util = require('./util.coffee');

Renderer = (function() {
  function Renderer(canvas) {
    var AnimatedRenderingSystem, ColorBoxRenderingSystem, StaticRenderingSystem,
      _this = this;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    StaticRenderingSystem = (function(_super) {
      __extends(StaticRenderingSystem, _super);

      function StaticRenderingSystem(ctx) {
        this.ctx = ctx;
        StaticRenderingSystem.__super__.constructor.call(this, ['position', 'staticsprite']);
      }

      StaticRenderingSystem.prototype.action = function(entity, dt) {
        var position, staticSprite;
        position = entity.components.position;
        staticSprite = entity.components.staticsprite;
        return this.ctx.drawImage(Resources.get(staticSprite.url), staticSprite.pos[0], staticSprite.pos[1], staticSprite.size[0], staticSprite.size[1], position.pos[0], position.pos[1], staticSprite.size[0], staticSprite.size[1]);
      };

      return StaticRenderingSystem;

    })(system.BasicSystem);
    AnimatedRenderingSystem = (function(_super) {
      __extends(AnimatedRenderingSystem, _super);

      function AnimatedRenderingSystem(ctx) {
        this.ctx = ctx;
        AnimatedRenderingSystem.__super__.constructor.call(this, ['position', 'animatedsprite']);
      }

      AnimatedRenderingSystem.prototype.action = function(entity, dt) {
        var animatedSprite, frameIndex, idx, max, position, spritePosition, xySwitch;
        position = entity.components.position;
        animatedSprite = entity.components.animatedsprite;
        if (animatedSprite.speed > 0) {
          idx = Math.floor(animatedSprite.index += animatedSprite.speed * dt);
          max = animatedSprite.frameIndices.length;
          frameIndex = animatedSprite.frameIndices[idx % max];
          if (animatedSprite.once && idx > max) {
            animatedSprite.done = true;
            return;
          }
        } else {
          frameIndex = 0;
        }
        spritePosition = animatedSprite.pos.slice();
        xySwitch = animatedSprite.dir === 'vertical' ? 1 : 0;
        spritePosition[xySwitch] += frameIndex * animatedSprite.size[xySwitch];
        return this.ctx.drawImage(Resources.get(animatedSprite.url), spritePosition[0], spritePosition[1], animatedSprite.size[0], animatedSprite.size[1], position.pos[0], position.pos[1], animatedSprite.size[0], animatedSprite.size[1]);
      };

      return AnimatedRenderingSystem;

    })(system.BasicSystem);
    ColorBoxRenderingSystem = (function(_super) {
      __extends(ColorBoxRenderingSystem, _super);

      function ColorBoxRenderingSystem(ctx) {
        this.ctx = ctx;
        ColorBoxRenderingSystem.__super__.constructor.call(this, ['position', 'colorbox']);
      }

      ColorBoxRenderingSystem.prototype.action = function(entity) {
        var colorbox, position;
        position = entity.components.position;
        colorbox = entity.components.colorbox;
        this.ctx.save();
        this.ctx.setFillColor(colorbox.color);
        this.ctx.fillRect(position.pos[0], position.pos[1], colorbox.size[0], colorbox.size[1]);
        return this.ctx.restore();
      };

      return ColorBoxRenderingSystem;

    })(system.BasicSystem);
    this.system = new system.CompsiteSystem(new StaticRenderingSystem(this.ctx), new AnimatedRenderingSystem(this.ctx), new ColorBoxRenderingSystem(this.ctx));
    this.clearCanvas = function(dt) {
      _this.ctx.fillStyle = "lightgrey";
      return _this.ctx.fillRect(0, 0, _this.canvas.width, _this.canvas.height);
    };
    this.drawFramerate = function(dt) {
      if (_this.showFramerate) {
        return _this.updateAndDrawFramerate(dt);
      }
    };
    this.framerates = [];
    this.showFramerate = true;
  }

  Renderer.prototype.toggleFramerate = function() {
    return this.showFramerate = !this.showFramerate;
  };

  Renderer.prototype.updateAndDrawFramerate = function(dt) {
    var drawFramerate,
      _this = this;
    drawFramerate = function() {
      _this.ctx.save();
      _this.ctx.fillStyle = "black";
      _this.ctx.font = "30px sans-serif";
      _this.ctx.fillText(util.average(_this.framerates).toFixed(1), 50, 50);
      return _this.ctx.restore();
    };
    this.framerates.push(1 / dt);
    while (this.framerates.length > 10) {
      this.framerates.shift();
    }
    return drawFramerate();
  };

  Renderer.prototype.drawQuadTreeNode = function(node) {
    var n, rect, _i, _len, _ref;
    _ref = node.nodes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      n = _ref[_i];
      this.drawQuadTreeNode(n);
    }
    rect = node.rect;
    this.ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    return this.ctx.strokeText(node.children.length, rect.x + rect.width / 2, rect.y + rect.height / 2);
  };

  return Renderer;

})();

module.exports = Renderer;


},{"./resources.coffee":9,"./system.coffee":10,"./util.coffee":19,"underscore":1}],9:[function(require,module,exports){
var Resources, _;

_ = require('underscore');

window.imgs = [];

Resources = (function() {
  var callbacks, get, load, onReady, ready, resources, _load;
  resources = {};
  callbacks = [];
  ready = function() {
    return _.all(_.values(resources));
  };
  _load = function(url) {
    var img;
    if (resources[url]) {
      return resources[url];
    } else {
      img = new Image();
      window.imgs.push(img);
      img.onload = function() {
        var cb, _i, _len, _results;
        resources[url] = img;
        if (ready()) {
          _results = [];
          for (_i = 0, _len = callbacks.length; _i < _len; _i++) {
            cb = callbacks[_i];
            _results.push(cb());
          }
          return _results;
        }
      };
      resources[url] = false;
      return _.defer(function() {
        return img.src = url;
      });
    }
  };
  load = function(urlOrArray) {
    var url, _i, _len, _results;
    if (urlOrArray instanceof Array) {
      _results = [];
      for (_i = 0, _len = urlOrArray.length; _i < _len; _i++) {
        url = urlOrArray[_i];
        _results.push(_load(url));
      }
      return _results;
    } else {
      return _load(urlOrArray);
    }
  };
  get = function(url) {
    return resources[url];
  };
  onReady = function(callback) {
    callbacks.push(callback);
    if (ready() && !_.isEmpty(resources)) {
      return callback();
    }
  };
  return {
    load: load,
    get: get,
    onReady: onReady
  };
})();

module.exports = Resources;


},{"underscore":1}],10:[function(require,module,exports){
var BasicSystem, CompsiteSystem, System, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

_ = require('underscore');

System = (function() {
  function System() {
    this.cache = {};
  }

  System.prototype.buildCache = function(entities) {
    var entity, id, _results;
    this.clearCache();
    _results = [];
    for (id in entities) {
      entity = entities[id];
      _results.push(this.updateCache(entity));
    }
    return _results;
  };

  System.prototype.clearCache = function() {
    return this.cache = {};
  };

  System.prototype.updateCache = function(entity) {
    if (!entity.components || !this.satisfies(entity.components)) {
      if (_.has(this.cache, entity.id)) {
        return delete this.cache[entity.id];
      }
    } else {
      return this.cache[entity.id] = true;
    }
  };

  System.prototype.run = function(entities, dt) {
    var id, _i, _len, _ref, _results;
    _ref = _.keys(this.cache);
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      id = _ref[_i];
      _results.push(this.action(entities[id], dt, entities));
    }
    return _results;
  };

  System.prototype.action = function(entity, dt, entities) {};

  System.prototype.satisfies = function() {
    return false;
  };

  return System;

})();

BasicSystem = (function(_super) {
  __extends(BasicSystem, _super);

  function BasicSystem(requiredComponents) {
    this.requiredComponents = requiredComponents;
    BasicSystem.__super__.constructor.call(this);
  }

  BasicSystem.prototype.satisfies = function(components) {
    return _.every(this.requiredComponents, function(required) {
      return _.has(components, required);
    });
  };

  return BasicSystem;

})(System);

CompsiteSystem = (function(_super) {
  __extends(CompsiteSystem, _super);

  function CompsiteSystem() {
    var systems;
    systems = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    this.systems = systems;
  }

  CompsiteSystem.prototype.buildCache = function(entities) {
    var system, _i, _len, _ref, _results;
    _ref = this.systems;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      system = _ref[_i];
      _results.push(system.buildCache(entities));
    }
    return _results;
  };

  CompsiteSystem.prototype.updateCache = function(entity) {
    var system, _i, _len, _ref, _results;
    _ref = this.systems;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      system = _ref[_i];
      _results.push(system.updateCache(entity));
    }
    return _results;
  };

  CompsiteSystem.prototype.run = function(entities, dt) {
    var system, _i, _len, _ref, _results;
    _ref = this.systems;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      system = _ref[_i];
      _results.push(system.run(entities, dt));
    }
    return _results;
  };

  CompsiteSystem.prototype.action = function(entity, dt, entities) {
    var system, _i, _len, _ref, _results;
    _ref = this.systems;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      system = _ref[_i];
      _results.push(system.action(entity, dt, entities));
    }
    return _results;
  };

  return CompsiteSystem;

})(System);

exports.BasicSystem = BasicSystem;

exports.System = System;

exports.CompsiteSystem = CompsiteSystem;


},{"underscore":1}],11:[function(require,module,exports){
var CollisionSystem, QuadTree, makeQuadTreeItem, system, vecutil, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

_ = require('underscore');

QuadTree = require('../quadtree.coffee');

system = require('../system.coffee');

vecutil = require('../vecutil.coffee');

makeQuadTreeItem = function(entity) {
  return {
    x: entity.components.position.pos[0],
    y: entity.components.position.pos[1],
    width: entity.components.collision.boundingBoxSize[0],
    height: entity.components.collision.boundingBoxSize[1],
    id: entity.id
  };
};

CollisionSystem = (function(_super) {
  __extends(CollisionSystem, _super);

  function CollisionSystem(canvasSize) {
    var _this = this;
    this.canvasSize = canvasSize;
    CollisionSystem.__super__.constructor.call(this, ['collision', 'position']);
    this.quadTree = new QuadTree.BoundQuadTree({
      x: 0,
      y: 0,
      width: this.canvasSize[0],
      height: this.canvasSize[1]
    }, 5, 10);
    this.shouldDrawQuadTree = false;
    this.shouldDrawCollisionBoxes = false;
    document.addEventListener('keypress', function(e) {
      if (e.key == null) {
        e.key = String.fromCharCode(e.charCode);
      }
      switch (e.key) {
        case "q":
          return _this.shouldDrawQuadTree = !_this.shouldDrawQuadTree;
        case "c":
          return _this.shouldDrawCollisionBoxes = !_this.shouldDrawCollisionBoxes;
      }
    });
  }

  CollisionSystem.prototype.action = function(entity, dt, entities) {
    var collision, didCollide, item, otherEntity, position, _i, _len, _ref;
    position = entity.components.position;
    collision = entity.components.collision;
    didCollide = false;
    _ref = this.quadTree.retrieve({
      x: position.pos[0],
      y: position.pos[1],
      width: collision.boundingBoxSize[0],
      height: collision.boundingBoxSize[1]
    });
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      otherEntity = entities[item.id];
      if (otherEntity.id !== entity.id) {
        if (vecutil.rectIntersect([position.pos, collision.boundingBoxSize], [otherEntity.components.position.pos, otherEntity.components.collision.boundingBoxSize])) {
          didCollide = true;
          if (collision.shouldCollide(entity, otherEntity)) {
            collision.didCollide(entity, otherEntity);
          }
        }
      }
    }
    if (this.shouldDrawCollisionBoxes) {
      return this.drawCollisionBox(entity, didCollide);
    }
  };

  CollisionSystem.prototype.run = function(entities, dt) {
    var i, _i, _len, _ref;
    this.quadTree.clear();
    _ref = _.keys(this.cache);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      i = _ref[_i];
      this.quadTree.insert(makeQuadTreeItem(entities[i]));
    }
    CollisionSystem.__super__.run.call(this, entities, dt);
    if (this.shouldDrawQuadTree) {
      return this.drawQuadTree();
    }
  };

  CollisionSystem.prototype.drawQuadTree = function() {
    return renderer.drawQuadTreeNode(this.quadTree.root);
  };

  CollisionSystem.prototype.drawCollisionBox = function(entity, colliding) {
    var _ref;
    renderer.ctx.save();
    renderer.ctx.setStrokeColor(colliding ? 'red' : 'green');
    (_ref = renderer.ctx).strokeRect.apply(_ref, __slice.call(entity.components.position.pos).concat(__slice.call(entity.components.collision.boundingBoxSize)));
    return renderer.ctx.restore();
  };

  return CollisionSystem;

})(system.BasicSystem);

module.exports = CollisionSystem;


},{"../quadtree.coffee":7,"../system.coffee":10,"../vecutil.coffee":20,"underscore":1}],12:[function(require,module,exports){
var LifetimeSystem, system,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

system = require('../system.coffee');

LifetimeSystem = (function(_super) {
  __extends(LifetimeSystem, _super);

  function LifetimeSystem() {
    LifetimeSystem.__super__.constructor.call(this, ["lifetime"]);
  }

  LifetimeSystem.prototype.action = function(entity, dt) {
    entity.components.lifetime.lifetime -= dt;
    if (entity.components.lifetime.lifetime <= 0) {
      return entity.destroy();
    }
  };

  return LifetimeSystem;

})(system.BasicSystem);

module.exports = LifetimeSystem;


},{"../system.coffee":10}],13:[function(require,module,exports){
var MoveTowardPlayerSystem, system, vecutil, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = require('underscore');

system = require('../system.coffee');

vecutil = require('../vecutil.coffee');

MoveTowardPlayerSystem = (function(_super) {
  __extends(MoveTowardPlayerSystem, _super);

  function MoveTowardPlayerSystem() {
    MoveTowardPlayerSystem.__super__.constructor.call(this, ['velocity', 'position', 'movetowardplayer']);
    this.player = null;
  }

  MoveTowardPlayerSystem.prototype.action = function(entity, dt) {
    var direction;
    if (this.player) {
      direction = vecutil.direction(this.player.components.position.pos, entity.components.position.pos);
      return entity.components.velocity.vector = vecutil.scale(direction, entity.components.movetowardplayer.speed);
    }
  };

  MoveTowardPlayerSystem.prototype.updateCache = function(entity) {
    var _ref;
    MoveTowardPlayerSystem.__super__.updateCache.call(this, entity);
    if (entity.components === null) {
      if (((_ref = this.player) != null ? _ref.id : void 0) === entity.id) {
        return this.player = null;
      }
    } else {
      if (_.has(entity.components, 'player')) {
        return this.player = entity;
      }
    }
  };

  return MoveTowardPlayerSystem;

})(system.BasicSystem);

module.exports = MoveTowardPlayerSystem;


},{"../system.coffee":10,"../vecutil.coffee":20,"underscore":1}],14:[function(require,module,exports){
var PhysicsSystem, system,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

system = require('../system.coffee');

PhysicsSystem = (function(_super) {
  __extends(PhysicsSystem, _super);

  function PhysicsSystem() {
    PhysicsSystem.__super__.constructor.call(this, ["position", "velocity"]);
  }

  PhysicsSystem.prototype.action = function(entity, dt) {
    var position, velocity;
    position = entity.components.position;
    velocity = entity.components.velocity;
    position.pos[0] += velocity.vector[0] * dt;
    return position.pos[1] += velocity.vector[1] * dt;
  };

  return PhysicsSystem;

})(system.BasicSystem);

module.exports = PhysicsSystem;


},{"../system.coffee":10}],15:[function(require,module,exports){
var Input, PlayerControlSystem, system,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Input = require('../input.coffee');

system = require('../system.coffee');

PlayerControlSystem = (function(_super) {
  __extends(PlayerControlSystem, _super);

  function PlayerControlSystem() {
    PlayerControlSystem.__super__.constructor.call(this, ["playercontrol", "velocity"]);
  }

  PlayerControlSystem.prototype.action = function(entity, dt) {
    var playerSpeed, velocity;
    velocity = entity.components.velocity;
    playerSpeed = entity.components.playercontrol.playerSpeed;
    if (Input.isDown('LEFT') || Input.isDown('a')) {
      velocity.vector[0] = -playerSpeed;
    } else if (Input.isDown('RIGHT') || Input.isDown('d')) {
      velocity.vector[0] = playerSpeed;
    } else {
      velocity.vector[0] = 0;
    }
    if (Input.isDown('UP') || Input.isDown('w')) {
      return velocity.vector[1] = -playerSpeed;
    } else if (Input.isDown('DOWN') || Input.isDown('s')) {
      return velocity.vector[1] = playerSpeed;
    } else {
      return velocity.vector[1] = 0;
    }
  };

  return PlayerControlSystem;

})(system.BasicSystem);

module.exports = PlayerControlSystem;


},{"../input.coffee":6,"../system.coffee":10}],16:[function(require,module,exports){
var Input, SpellcastingSystem, system,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Input = require('../input.coffee');

system = require('../system.coffee');

SpellcastingSystem = (function(_super) {
  __extends(SpellcastingSystem, _super);

  function SpellcastingSystem() {
    SpellcastingSystem.__super__.constructor.call(this, ["position", "spellcaster"]);
  }

  SpellcastingSystem.prototype.action = function(entity, dt) {
    if (Input.mouse.isDown) {
      return new entity.components.spellcaster.spells[0](entity, Input.mouse.posRelativeTo(canvas));
    }
  };

  return SpellcastingSystem;

})(system.BasicSystem);

module.exports = SpellcastingSystem;


},{"../input.coffee":6,"../system.coffee":10}],17:[function(require,module,exports){
var Input, SpriteTurningSystem, center, system, vecutil, _, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = require('underscore');

Input = require('../input.coffee');

system = require('../system.coffee');

vecutil = require('../vecutil.coffee');

center = function(components) {
  return vecutil.add2d(components.position.pos, vecutil.scale((_.has(components, 'staticsprite') ? components.staticsprite.size : _.has(components, 'animatedsprite') ? components.animatedsprite.size : components.colorbox.size), 0.5));
};

SpriteTurningSystem = (function(_super) {
  __extends(SpriteTurningSystem, _super);

  function SpriteTurningSystem() {
    _ref = SpriteTurningSystem.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  SpriteTurningSystem.prototype.satisfies = function(components) {
    return _.has(components, 'turnable') && _.has(components, 'position') && (_.has(components, 'staticsprite') || _.has(components, 'animatedsprite') || _.has(components, 'colorbox'));
  };

  SpriteTurningSystem.prototype.action = function(entity, dt) {
    var index, sprite, theta, vector;
    vector = vecutil.sub2d(Input.mouse.posRelativeTo(canvas), center(entity.components));
    theta = vecutil.angleOfIncidence(vector);
    theta += (Math.TAU / 16) % Math.TAU;
    index = Math.floor(theta / (Math.TAU / 8));
    sprite = entity.components.turnable.sprites[index];
    if (sprite != null) {
      if (_.has(entity.components, "staticsprite")) {
        return components.staticsprite = sprite;
      } else if (_.has(entity.components, "animatedsprite")) {
        return entity.components.animatedsprite = sprite;
      } else {
        return entity.components.colorbox = sprite;
      }
    }
  };

  return SpriteTurningSystem;

})(system.System);

module.exports = SpriteTurningSystem;


},{"../input.coffee":6,"../system.coffee":10,"../vecutil.coffee":20,"underscore":1}],18:[function(require,module,exports){
var StopAfterSystem, system,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

system = require('../system.coffee');

StopAfterSystem = (function(_super) {
  __extends(StopAfterSystem, _super);

  function StopAfterSystem() {
    StopAfterSystem.__super__.constructor.call(this, ["velocity", "createdat", "stopsafter"]);
  }

  StopAfterSystem.prototype.action = function(entity, dt) {
    if (Date.now() - entity.components.createdat.createdAt > entity.components.stopsafter.time) {
      entity.destroy();
      entity.components.velocity.vector[0] = 0;
      return entity.components.velocity.vector[1] = 0;
    }
  };

  return StopAfterSystem;

})(system.BasicSystem);

module.exports = StopAfterSystem;


},{"../system.coffee":10}],19:[function(require,module,exports){
var average, keyForComponent, sum, _;

_ = require('underscore');

sum = function(list) {
  return _.foldl(list, (function(s, x) {
    return s + x;
  }), 0);
};

average = function(list) {
  return sum(list) / list.length;
};

keyForComponent = function(component) {
  return component.constructor.name.toLowerCase();
};

exports.sum = sum;

exports.average = average;

exports.keyForComponent = keyForComponent;


},{"underscore":1}],20:[function(require,module,exports){
var add2d, alongPerimeter, angleOfIncidence, direction, distance, magnitude, normalize, rectIntersect, scale, scaleTo, sub2d;

Math.TAU = 2 * Math.PI;

magnitude = function(v) {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
};

normalize = function(v) {
  var m;
  m = magnitude(v);
  return [v[0] / m, v[1] / m];
};

add2d = function(v1, v2) {
  return [v1[0] + v2[0], v1[1] + v2[1]];
};

sub2d = function(v1, v2) {
  return [v1[0] - v2[0], v1[1] - v2[1]];
};

scale = function(v, s) {
  return [v[0] * s, v[1] * s];
};

scaleTo = function(v, s) {
  return scale(normalize(v), s);
};

distance = function(v1, v2) {
  return magnitude(sub2d(v1, v2));
};

direction = function(to, from) {
  return normalize(sub2d(to, from));
};

angleOfIncidence = function(v, flipy) {
  var theta;
  if (flipy == null) {
    flipy = true;
  }
  theta = Math.atan2((flipy ? -v[1] : v[1]), v[0]);
  if (theta < 0) {
    theta += Math.TAU;
  }
  return theta;
};

Math.radToDeg = function(r) {
  return r / Math.TAU * 360;
};

alongPerimeter = function(rect, along) {
  var height, perimeter, width, x, y, _ref, _ref1;
  (_ref = rect[0], x = _ref[0], y = _ref[1]), (_ref1 = rect[1], width = _ref1[0], height = _ref1[1]);
  perimeter = 2 * (width + height);
  along = perimeter * along;
  if (along < width) {
    return [x + along, y];
  } else if (along < width + height) {
    return [x + width, y + along - width];
  } else if (along < 2 * width + height) {
    return [x + along - (width + height), y + height];
  } else {
    return [x, y + along - 2 * width - height];
  }
};

rectIntersect = function(rect1, rect2) {
  return (Math.abs(rect1[0][0] + rect1[1][0] / 2 - rect2[0][0] - rect2[1][0] / 2) * 2 < (rect1[1][0] + rect2[1][0])) && (Math.abs(rect1[0][1] + rect1[1][1] / 2 - rect2[0][1] - rect2[1][1] / 2) * 2 < (rect1[1][1] + rect2[1][1]));
};

exports.magnitude = magnitude;

exports.normalize = normalize;

exports.add2d = add2d;

exports.sub2d = sub2d;

exports.scale = scale;

exports.scaleTo = scaleTo;

exports.distance = distance;

exports.direction = direction;

exports.angleOfIncidence = angleOfIncidence;

exports.alongPerimeter = alongPerimeter;

exports.rectIntersect = rectIntersect;


},{}]},{},[3])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvemFjaGdvdHNjaC9Qcm9qZWN0cy9jZXMtd2l6YXJkcy9ub2RlX21vZHVsZXMvdW5kZXJzY29yZS91bmRlcnNjb3JlLmpzIiwiL1VzZXJzL3phY2hnb3RzY2gvUHJvamVjdHMvY2VzLXdpemFyZHMvc3JjL2NvbXBvbmVudHMuY29mZmVlIiwiL1VzZXJzL3phY2hnb3RzY2gvUHJvamVjdHMvY2VzLXdpemFyZHMvc3JjL2RlbW8uY29mZmVlIiwiL1VzZXJzL3phY2hnb3RzY2gvUHJvamVjdHMvY2VzLXdpemFyZHMvc3JjL2VuZ2luZS5jb2ZmZWUiLCIvVXNlcnMvemFjaGdvdHNjaC9Qcm9qZWN0cy9jZXMtd2l6YXJkcy9zcmMvZW50aXR5LmNvZmZlZSIsIi9Vc2Vycy96YWNoZ290c2NoL1Byb2plY3RzL2Nlcy13aXphcmRzL3NyYy9pbnB1dC5jb2ZmZWUiLCIvVXNlcnMvemFjaGdvdHNjaC9Qcm9qZWN0cy9jZXMtd2l6YXJkcy9zcmMvcXVhZHRyZWUuY29mZmVlIiwiL1VzZXJzL3phY2hnb3RzY2gvUHJvamVjdHMvY2VzLXdpemFyZHMvc3JjL3JlbmRlcmVyLmNvZmZlZSIsIi9Vc2Vycy96YWNoZ290c2NoL1Byb2plY3RzL2Nlcy13aXphcmRzL3NyYy9yZXNvdXJjZXMuY29mZmVlIiwiL1VzZXJzL3phY2hnb3RzY2gvUHJvamVjdHMvY2VzLXdpemFyZHMvc3JjL3N5c3RlbS5jb2ZmZWUiLCIvVXNlcnMvemFjaGdvdHNjaC9Qcm9qZWN0cy9jZXMtd2l6YXJkcy9zcmMvc3lzdGVtcy9jb2xsaXNpb24uY29mZmVlIiwiL1VzZXJzL3phY2hnb3RzY2gvUHJvamVjdHMvY2VzLXdpemFyZHMvc3JjL3N5c3RlbXMvbGlmZXRpbWUuY29mZmVlIiwiL1VzZXJzL3phY2hnb3RzY2gvUHJvamVjdHMvY2VzLXdpemFyZHMvc3JjL3N5c3RlbXMvbW92ZVRvd2FyZFBsYXllci5jb2ZmZWUiLCIvVXNlcnMvemFjaGdvdHNjaC9Qcm9qZWN0cy9jZXMtd2l6YXJkcy9zcmMvc3lzdGVtcy9waHlzaWNzLmNvZmZlZSIsIi9Vc2Vycy96YWNoZ290c2NoL1Byb2plY3RzL2Nlcy13aXphcmRzL3NyYy9zeXN0ZW1zL3BsYXllckNvbnRyb2wuY29mZmVlIiwiL1VzZXJzL3phY2hnb3RzY2gvUHJvamVjdHMvY2VzLXdpemFyZHMvc3JjL3N5c3RlbXMvc3BlbGxjYXN0aW5nLmNvZmZlZSIsIi9Vc2Vycy96YWNoZ290c2NoL1Byb2plY3RzL2Nlcy13aXphcmRzL3NyYy9zeXN0ZW1zL3Nwcml0ZVR1cm5pbmcuY29mZmVlIiwiL1VzZXJzL3phY2hnb3RzY2gvUHJvamVjdHMvY2VzLXdpemFyZHMvc3JjL3N5c3RlbXMvc3RvcEFmdGVyLmNvZmZlZSIsIi9Vc2Vycy96YWNoZ290c2NoL1Byb2plY3RzL2Nlcy13aXphcmRzL3NyYy91dGlsLmNvZmZlZSIsIi9Vc2Vycy96YWNoZ290c2NoL1Byb2plY3RzL2Nlcy13aXphcmRzL3NyYy92ZWN1dGlsLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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Q0FpRHdCLENBQVIsRUFBQSxJQUFDLElBQWpCO0NBQ0ssRUFBQSxDQUFJLENBQVcsSUFBaEI7Q0FEWTs7QUFJaEIsQ0FyREEsRUFxRG9CLElBQWIsRUFBUDs7QUFDQSxDQXREQSxFQXNEb0IsSUFBYixFQUFQOztBQUNBLENBdkRBLEVBdURnQixFQUFoQixFQUFPOztBQUNQLENBeERBLEVBd0RnQixFQUFoQixFQUFPOztBQUNQLENBekRBLEVBeURnQixFQUFoQixFQUFPOztBQUNQLENBMURBLEVBMERrQixJQUFYOztBQUNQLENBM0RBLEVBMkRtQixJQUFaLENBQVA7O0FBQ0EsQ0E1REEsRUE0RG9CLElBQWIsRUFBUDs7QUFDQSxDQTdEQSxFQTZEMkIsSUFBcEIsU0FBUDs7QUFDQSxDQTlEQSxFQThEeUIsSUFBbEIsT0FBUDs7QUFDQSxDQS9EQSxFQStEd0IsSUFBakIsTUFBUCIsInNvdXJjZXNDb250ZW50IjpbIi8vICAgICBVbmRlcnNjb3JlLmpzIDEuNS4yXG4vLyAgICAgaHR0cDovL3VuZGVyc2NvcmVqcy5vcmdcbi8vICAgICAoYykgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4vLyAgICAgVW5kZXJzY29yZSBtYXkgYmUgZnJlZWx5IGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cblxuKGZ1bmN0aW9uKCkge1xuXG4gIC8vIEJhc2VsaW5lIHNldHVwXG4gIC8vIC0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gRXN0YWJsaXNoIHRoZSByb290IG9iamVjdCwgYHdpbmRvd2AgaW4gdGhlIGJyb3dzZXIsIG9yIGBleHBvcnRzYCBvbiB0aGUgc2VydmVyLlxuICB2YXIgcm9vdCA9IHRoaXM7XG5cbiAgLy8gU2F2ZSB0aGUgcHJldmlvdXMgdmFsdWUgb2YgdGhlIGBfYCB2YXJpYWJsZS5cbiAgdmFyIHByZXZpb3VzVW5kZXJzY29yZSA9IHJvb3QuXztcblxuICAvLyBFc3RhYmxpc2ggdGhlIG9iamVjdCB0aGF0IGdldHMgcmV0dXJuZWQgdG8gYnJlYWsgb3V0IG9mIGEgbG9vcCBpdGVyYXRpb24uXG4gIHZhciBicmVha2VyID0ge307XG5cbiAgLy8gU2F2ZSBieXRlcyBpbiB0aGUgbWluaWZpZWQgKGJ1dCBub3QgZ3ppcHBlZCkgdmVyc2lvbjpcbiAgdmFyIEFycmF5UHJvdG8gPSBBcnJheS5wcm90b3R5cGUsIE9ialByb3RvID0gT2JqZWN0LnByb3RvdHlwZSwgRnVuY1Byb3RvID0gRnVuY3Rpb24ucHJvdG90eXBlO1xuXG4gIC8vIENyZWF0ZSBxdWljayByZWZlcmVuY2UgdmFyaWFibGVzIGZvciBzcGVlZCBhY2Nlc3MgdG8gY29yZSBwcm90b3R5cGVzLlxuICB2YXJcbiAgICBwdXNoICAgICAgICAgICAgID0gQXJyYXlQcm90by5wdXNoLFxuICAgIHNsaWNlICAgICAgICAgICAgPSBBcnJheVByb3RvLnNsaWNlLFxuICAgIGNvbmNhdCAgICAgICAgICAgPSBBcnJheVByb3RvLmNvbmNhdCxcbiAgICB0b1N0cmluZyAgICAgICAgID0gT2JqUHJvdG8udG9TdHJpbmcsXG4gICAgaGFzT3duUHJvcGVydHkgICA9IE9ialByb3RvLmhhc093blByb3BlcnR5O1xuXG4gIC8vIEFsbCAqKkVDTUFTY3JpcHQgNSoqIG5hdGl2ZSBmdW5jdGlvbiBpbXBsZW1lbnRhdGlvbnMgdGhhdCB3ZSBob3BlIHRvIHVzZVxuICAvLyBhcmUgZGVjbGFyZWQgaGVyZS5cbiAgdmFyXG4gICAgbmF0aXZlRm9yRWFjaCAgICAgID0gQXJyYXlQcm90by5mb3JFYWNoLFxuICAgIG5hdGl2ZU1hcCAgICAgICAgICA9IEFycmF5UHJvdG8ubWFwLFxuICAgIG5hdGl2ZVJlZHVjZSAgICAgICA9IEFycmF5UHJvdG8ucmVkdWNlLFxuICAgIG5hdGl2ZVJlZHVjZVJpZ2h0ICA9IEFycmF5UHJvdG8ucmVkdWNlUmlnaHQsXG4gICAgbmF0aXZlRmlsdGVyICAgICAgID0gQXJyYXlQcm90by5maWx0ZXIsXG4gICAgbmF0aXZlRXZlcnkgICAgICAgID0gQXJyYXlQcm90by5ldmVyeSxcbiAgICBuYXRpdmVTb21lICAgICAgICAgPSBBcnJheVByb3RvLnNvbWUsXG4gICAgbmF0aXZlSW5kZXhPZiAgICAgID0gQXJyYXlQcm90by5pbmRleE9mLFxuICAgIG5hdGl2ZUxhc3RJbmRleE9mICA9IEFycmF5UHJvdG8ubGFzdEluZGV4T2YsXG4gICAgbmF0aXZlSXNBcnJheSAgICAgID0gQXJyYXkuaXNBcnJheSxcbiAgICBuYXRpdmVLZXlzICAgICAgICAgPSBPYmplY3Qua2V5cyxcbiAgICBuYXRpdmVCaW5kICAgICAgICAgPSBGdW5jUHJvdG8uYmluZDtcblxuICAvLyBDcmVhdGUgYSBzYWZlIHJlZmVyZW5jZSB0byB0aGUgVW5kZXJzY29yZSBvYmplY3QgZm9yIHVzZSBiZWxvdy5cbiAgdmFyIF8gPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAob2JqIGluc3RhbmNlb2YgXykgcmV0dXJuIG9iajtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgXykpIHJldHVybiBuZXcgXyhvYmopO1xuICAgIHRoaXMuX3dyYXBwZWQgPSBvYmo7XG4gIH07XG5cbiAgLy8gRXhwb3J0IHRoZSBVbmRlcnNjb3JlIG9iamVjdCBmb3IgKipOb2RlLmpzKiosIHdpdGhcbiAgLy8gYmFja3dhcmRzLWNvbXBhdGliaWxpdHkgZm9yIHRoZSBvbGQgYHJlcXVpcmUoKWAgQVBJLiBJZiB3ZSdyZSBpblxuICAvLyB0aGUgYnJvd3NlciwgYWRkIGBfYCBhcyBhIGdsb2JhbCBvYmplY3QgdmlhIGEgc3RyaW5nIGlkZW50aWZpZXIsXG4gIC8vIGZvciBDbG9zdXJlIENvbXBpbGVyIFwiYWR2YW5jZWRcIiBtb2RlLlxuICBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICBleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBfO1xuICAgIH1cbiAgICBleHBvcnRzLl8gPSBfO1xuICB9IGVsc2Uge1xuICAgIHJvb3QuXyA9IF87XG4gIH1cblxuICAvLyBDdXJyZW50IHZlcnNpb24uXG4gIF8uVkVSU0lPTiA9ICcxLjUuMic7XG5cbiAgLy8gQ29sbGVjdGlvbiBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBUaGUgY29ybmVyc3RvbmUsIGFuIGBlYWNoYCBpbXBsZW1lbnRhdGlvbiwgYWthIGBmb3JFYWNoYC5cbiAgLy8gSGFuZGxlcyBvYmplY3RzIHdpdGggdGhlIGJ1aWx0LWluIGBmb3JFYWNoYCwgYXJyYXlzLCBhbmQgcmF3IG9iamVjdHMuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBmb3JFYWNoYCBpZiBhdmFpbGFibGUuXG4gIHZhciBlYWNoID0gXy5lYWNoID0gXy5mb3JFYWNoID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuO1xuICAgIGlmIChuYXRpdmVGb3JFYWNoICYmIG9iai5mb3JFYWNoID09PSBuYXRpdmVGb3JFYWNoKSB7XG4gICAgICBvYmouZm9yRWFjaChpdGVyYXRvciwgY29udGV4dCk7XG4gICAgfSBlbHNlIGlmIChvYmoubGVuZ3RoID09PSArb2JqLmxlbmd0aCkge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IG9iai5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoaXRlcmF0b3IuY2FsbChjb250ZXh0LCBvYmpbaV0sIGksIG9iaikgPT09IGJyZWFrZXIpIHJldHVybjtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGtleXMgPSBfLmtleXMob2JqKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBrZXlzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChpdGVyYXRvci5jYWxsKGNvbnRleHQsIG9ialtrZXlzW2ldXSwga2V5c1tpXSwgb2JqKSA9PT0gYnJlYWtlcikgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIHJlc3VsdHMgb2YgYXBwbHlpbmcgdGhlIGl0ZXJhdG9yIHRvIGVhY2ggZWxlbWVudC5cbiAgLy8gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYG1hcGAgaWYgYXZhaWxhYmxlLlxuICBfLm1hcCA9IF8uY29sbGVjdCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHJlc3VsdHM7XG4gICAgaWYgKG5hdGl2ZU1hcCAmJiBvYmoubWFwID09PSBuYXRpdmVNYXApIHJldHVybiBvYmoubWFwKGl0ZXJhdG9yLCBjb250ZXh0KTtcbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICByZXN1bHRzLnB1c2goaXRlcmF0b3IuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICB2YXIgcmVkdWNlRXJyb3IgPSAnUmVkdWNlIG9mIGVtcHR5IGFycmF5IHdpdGggbm8gaW5pdGlhbCB2YWx1ZSc7XG5cbiAgLy8gKipSZWR1Y2UqKiBidWlsZHMgdXAgYSBzaW5nbGUgcmVzdWx0IGZyb20gYSBsaXN0IG9mIHZhbHVlcywgYWthIGBpbmplY3RgLFxuICAvLyBvciBgZm9sZGxgLiBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgcmVkdWNlYCBpZiBhdmFpbGFibGUuXG4gIF8ucmVkdWNlID0gXy5mb2xkbCA9IF8uaW5qZWN0ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgbWVtbywgY29udGV4dCkge1xuICAgIHZhciBpbml0aWFsID0gYXJndW1lbnRzLmxlbmd0aCA+IDI7XG4gICAgaWYgKG9iaiA9PSBudWxsKSBvYmogPSBbXTtcbiAgICBpZiAobmF0aXZlUmVkdWNlICYmIG9iai5yZWR1Y2UgPT09IG5hdGl2ZVJlZHVjZSkge1xuICAgICAgaWYgKGNvbnRleHQpIGl0ZXJhdG9yID0gXy5iaW5kKGl0ZXJhdG9yLCBjb250ZXh0KTtcbiAgICAgIHJldHVybiBpbml0aWFsID8gb2JqLnJlZHVjZShpdGVyYXRvciwgbWVtbykgOiBvYmoucmVkdWNlKGl0ZXJhdG9yKTtcbiAgICB9XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgaWYgKCFpbml0aWFsKSB7XG4gICAgICAgIG1lbW8gPSB2YWx1ZTtcbiAgICAgICAgaW5pdGlhbCA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtZW1vID0gaXRlcmF0b3IuY2FsbChjb250ZXh0LCBtZW1vLCB2YWx1ZSwgaW5kZXgsIGxpc3QpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmICghaW5pdGlhbCkgdGhyb3cgbmV3IFR5cGVFcnJvcihyZWR1Y2VFcnJvcik7XG4gICAgcmV0dXJuIG1lbW87XG4gIH07XG5cbiAgLy8gVGhlIHJpZ2h0LWFzc29jaWF0aXZlIHZlcnNpb24gb2YgcmVkdWNlLCBhbHNvIGtub3duIGFzIGBmb2xkcmAuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGByZWR1Y2VSaWdodGAgaWYgYXZhaWxhYmxlLlxuICBfLnJlZHVjZVJpZ2h0ID0gXy5mb2xkciA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIG1lbW8sIGNvbnRleHQpIHtcbiAgICB2YXIgaW5pdGlhbCA9IGFyZ3VtZW50cy5sZW5ndGggPiAyO1xuICAgIGlmIChvYmogPT0gbnVsbCkgb2JqID0gW107XG4gICAgaWYgKG5hdGl2ZVJlZHVjZVJpZ2h0ICYmIG9iai5yZWR1Y2VSaWdodCA9PT0gbmF0aXZlUmVkdWNlUmlnaHQpIHtcbiAgICAgIGlmIChjb250ZXh0KSBpdGVyYXRvciA9IF8uYmluZChpdGVyYXRvciwgY29udGV4dCk7XG4gICAgICByZXR1cm4gaW5pdGlhbCA/IG9iai5yZWR1Y2VSaWdodChpdGVyYXRvciwgbWVtbykgOiBvYmoucmVkdWNlUmlnaHQoaXRlcmF0b3IpO1xuICAgIH1cbiAgICB2YXIgbGVuZ3RoID0gb2JqLmxlbmd0aDtcbiAgICBpZiAobGVuZ3RoICE9PSArbGVuZ3RoKSB7XG4gICAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgICAgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gICAgfVxuICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIGluZGV4ID0ga2V5cyA/IGtleXNbLS1sZW5ndGhdIDogLS1sZW5ndGg7XG4gICAgICBpZiAoIWluaXRpYWwpIHtcbiAgICAgICAgbWVtbyA9IG9ialtpbmRleF07XG4gICAgICAgIGluaXRpYWwgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWVtbyA9IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgbWVtbywgb2JqW2luZGV4XSwgaW5kZXgsIGxpc3QpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmICghaW5pdGlhbCkgdGhyb3cgbmV3IFR5cGVFcnJvcihyZWR1Y2VFcnJvcik7XG4gICAgcmV0dXJuIG1lbW87XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSBmaXJzdCB2YWx1ZSB3aGljaCBwYXNzZXMgYSB0cnV0aCB0ZXN0LiBBbGlhc2VkIGFzIGBkZXRlY3RgLlxuICBfLmZpbmQgPSBfLmRldGVjdCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0O1xuICAgIGFueShvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgaWYgKGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KSkge1xuICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBSZXR1cm4gYWxsIHRoZSBlbGVtZW50cyB0aGF0IHBhc3MgYSB0cnV0aCB0ZXN0LlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgZmlsdGVyYCBpZiBhdmFpbGFibGUuXG4gIC8vIEFsaWFzZWQgYXMgYHNlbGVjdGAuXG4gIF8uZmlsdGVyID0gXy5zZWxlY3QgPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiByZXN1bHRzO1xuICAgIGlmIChuYXRpdmVGaWx0ZXIgJiYgb2JqLmZpbHRlciA9PT0gbmF0aXZlRmlsdGVyKSByZXR1cm4gb2JqLmZpbHRlcihpdGVyYXRvciwgY29udGV4dCk7XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgaWYgKGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KSkgcmVzdWx0cy5wdXNoKHZhbHVlKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICAvLyBSZXR1cm4gYWxsIHRoZSBlbGVtZW50cyBmb3Igd2hpY2ggYSB0cnV0aCB0ZXN0IGZhaWxzLlxuICBfLnJlamVjdCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICByZXR1cm4gXy5maWx0ZXIob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIHJldHVybiAhaXRlcmF0b3IuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpO1xuICAgIH0sIGNvbnRleHQpO1xuICB9O1xuXG4gIC8vIERldGVybWluZSB3aGV0aGVyIGFsbCBvZiB0aGUgZWxlbWVudHMgbWF0Y2ggYSB0cnV0aCB0ZXN0LlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgZXZlcnlgIGlmIGF2YWlsYWJsZS5cbiAgLy8gQWxpYXNlZCBhcyBgYWxsYC5cbiAgXy5ldmVyeSA9IF8uYWxsID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGl0ZXJhdG9yIHx8IChpdGVyYXRvciA9IF8uaWRlbnRpdHkpO1xuICAgIHZhciByZXN1bHQgPSB0cnVlO1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHJlc3VsdDtcbiAgICBpZiAobmF0aXZlRXZlcnkgJiYgb2JqLmV2ZXJ5ID09PSBuYXRpdmVFdmVyeSkgcmV0dXJuIG9iai5ldmVyeShpdGVyYXRvciwgY29udGV4dCk7XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgaWYgKCEocmVzdWx0ID0gcmVzdWx0ICYmIGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KSkpIHJldHVybiBicmVha2VyO1xuICAgIH0pO1xuICAgIHJldHVybiAhIXJlc3VsdDtcbiAgfTtcblxuICAvLyBEZXRlcm1pbmUgaWYgYXQgbGVhc3Qgb25lIGVsZW1lbnQgaW4gdGhlIG9iamVjdCBtYXRjaGVzIGEgdHJ1dGggdGVzdC5cbiAgLy8gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYHNvbWVgIGlmIGF2YWlsYWJsZS5cbiAgLy8gQWxpYXNlZCBhcyBgYW55YC5cbiAgdmFyIGFueSA9IF8uc29tZSA9IF8uYW55ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGl0ZXJhdG9yIHx8IChpdGVyYXRvciA9IF8uaWRlbnRpdHkpO1xuICAgIHZhciByZXN1bHQgPSBmYWxzZTtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiByZXN1bHQ7XG4gICAgaWYgKG5hdGl2ZVNvbWUgJiYgb2JqLnNvbWUgPT09IG5hdGl2ZVNvbWUpIHJldHVybiBvYmouc29tZShpdGVyYXRvciwgY29udGV4dCk7XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgaWYgKHJlc3VsdCB8fCAocmVzdWx0ID0gaXRlcmF0b3IuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpKSkgcmV0dXJuIGJyZWFrZXI7XG4gICAgfSk7XG4gICAgcmV0dXJuICEhcmVzdWx0O1xuICB9O1xuXG4gIC8vIERldGVybWluZSBpZiB0aGUgYXJyYXkgb3Igb2JqZWN0IGNvbnRhaW5zIGEgZ2l2ZW4gdmFsdWUgKHVzaW5nIGA9PT1gKS5cbiAgLy8gQWxpYXNlZCBhcyBgaW5jbHVkZWAuXG4gIF8uY29udGFpbnMgPSBfLmluY2x1ZGUgPSBmdW5jdGlvbihvYmosIHRhcmdldCkge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICAgIGlmIChuYXRpdmVJbmRleE9mICYmIG9iai5pbmRleE9mID09PSBuYXRpdmVJbmRleE9mKSByZXR1cm4gb2JqLmluZGV4T2YodGFyZ2V0KSAhPSAtMTtcbiAgICByZXR1cm4gYW55KG9iaiwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiB2YWx1ZSA9PT0gdGFyZ2V0O1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIEludm9rZSBhIG1ldGhvZCAod2l0aCBhcmd1bWVudHMpIG9uIGV2ZXJ5IGl0ZW0gaW4gYSBjb2xsZWN0aW9uLlxuICBfLmludm9rZSA9IGZ1bmN0aW9uKG9iaiwgbWV0aG9kKSB7XG4gICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gICAgdmFyIGlzRnVuYyA9IF8uaXNGdW5jdGlvbihtZXRob2QpO1xuICAgIHJldHVybiBfLm1hcChvYmosIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gKGlzRnVuYyA/IG1ldGhvZCA6IHZhbHVlW21ldGhvZF0pLmFwcGx5KHZhbHVlLCBhcmdzKTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBDb252ZW5pZW5jZSB2ZXJzaW9uIG9mIGEgY29tbW9uIHVzZSBjYXNlIG9mIGBtYXBgOiBmZXRjaGluZyBhIHByb3BlcnR5LlxuICBfLnBsdWNrID0gZnVuY3Rpb24ob2JqLCBrZXkpIHtcbiAgICByZXR1cm4gXy5tYXAob2JqLCBmdW5jdGlvbih2YWx1ZSl7IHJldHVybiB2YWx1ZVtrZXldOyB9KTtcbiAgfTtcblxuICAvLyBDb252ZW5pZW5jZSB2ZXJzaW9uIG9mIGEgY29tbW9uIHVzZSBjYXNlIG9mIGBmaWx0ZXJgOiBzZWxlY3Rpbmcgb25seSBvYmplY3RzXG4gIC8vIGNvbnRhaW5pbmcgc3BlY2lmaWMgYGtleTp2YWx1ZWAgcGFpcnMuXG4gIF8ud2hlcmUgPSBmdW5jdGlvbihvYmosIGF0dHJzLCBmaXJzdCkge1xuICAgIGlmIChfLmlzRW1wdHkoYXR0cnMpKSByZXR1cm4gZmlyc3QgPyB2b2lkIDAgOiBbXTtcbiAgICByZXR1cm4gX1tmaXJzdCA/ICdmaW5kJyA6ICdmaWx0ZXInXShvYmosIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBmb3IgKHZhciBrZXkgaW4gYXR0cnMpIHtcbiAgICAgICAgaWYgKGF0dHJzW2tleV0gIT09IHZhbHVlW2tleV0pIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIENvbnZlbmllbmNlIHZlcnNpb24gb2YgYSBjb21tb24gdXNlIGNhc2Ugb2YgYGZpbmRgOiBnZXR0aW5nIHRoZSBmaXJzdCBvYmplY3RcbiAgLy8gY29udGFpbmluZyBzcGVjaWZpYyBga2V5OnZhbHVlYCBwYWlycy5cbiAgXy5maW5kV2hlcmUgPSBmdW5jdGlvbihvYmosIGF0dHJzKSB7XG4gICAgcmV0dXJuIF8ud2hlcmUob2JqLCBhdHRycywgdHJ1ZSk7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSBtYXhpbXVtIGVsZW1lbnQgb3IgKGVsZW1lbnQtYmFzZWQgY29tcHV0YXRpb24pLlxuICAvLyBDYW4ndCBvcHRpbWl6ZSBhcnJheXMgb2YgaW50ZWdlcnMgbG9uZ2VyIHRoYW4gNjUsNTM1IGVsZW1lbnRzLlxuICAvLyBTZWUgW1dlYktpdCBCdWcgODA3OTddKGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD04MDc5NylcbiAgXy5tYXggPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgaWYgKCFpdGVyYXRvciAmJiBfLmlzQXJyYXkob2JqKSAmJiBvYmpbMF0gPT09ICtvYmpbMF0gJiYgb2JqLmxlbmd0aCA8IDY1NTM1KSB7XG4gICAgICByZXR1cm4gTWF0aC5tYXguYXBwbHkoTWF0aCwgb2JqKTtcbiAgICB9XG4gICAgaWYgKCFpdGVyYXRvciAmJiBfLmlzRW1wdHkob2JqKSkgcmV0dXJuIC1JbmZpbml0eTtcbiAgICB2YXIgcmVzdWx0ID0ge2NvbXB1dGVkIDogLUluZmluaXR5LCB2YWx1ZTogLUluZmluaXR5fTtcbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICB2YXIgY29tcHV0ZWQgPSBpdGVyYXRvciA/IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KSA6IHZhbHVlO1xuICAgICAgY29tcHV0ZWQgPiByZXN1bHQuY29tcHV0ZWQgJiYgKHJlc3VsdCA9IHt2YWx1ZSA6IHZhbHVlLCBjb21wdXRlZCA6IGNvbXB1dGVkfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdC52YWx1ZTtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIG1pbmltdW0gZWxlbWVudCAob3IgZWxlbWVudC1iYXNlZCBjb21wdXRhdGlvbikuXG4gIF8ubWluID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGlmICghaXRlcmF0b3IgJiYgXy5pc0FycmF5KG9iaikgJiYgb2JqWzBdID09PSArb2JqWzBdICYmIG9iai5sZW5ndGggPCA2NTUzNSkge1xuICAgICAgcmV0dXJuIE1hdGgubWluLmFwcGx5KE1hdGgsIG9iaik7XG4gICAgfVxuICAgIGlmICghaXRlcmF0b3IgJiYgXy5pc0VtcHR5KG9iaikpIHJldHVybiBJbmZpbml0eTtcbiAgICB2YXIgcmVzdWx0ID0ge2NvbXB1dGVkIDogSW5maW5pdHksIHZhbHVlOiBJbmZpbml0eX07XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgdmFyIGNvbXB1dGVkID0gaXRlcmF0b3IgPyBpdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCkgOiB2YWx1ZTtcbiAgICAgIGNvbXB1dGVkIDwgcmVzdWx0LmNvbXB1dGVkICYmIChyZXN1bHQgPSB7dmFsdWUgOiB2YWx1ZSwgY29tcHV0ZWQgOiBjb21wdXRlZH0pO1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQudmFsdWU7XG4gIH07XG5cbiAgLy8gU2h1ZmZsZSBhbiBhcnJheSwgdXNpbmcgdGhlIG1vZGVybiB2ZXJzaW9uIG9mIHRoZSBcbiAgLy8gW0Zpc2hlci1ZYXRlcyBzaHVmZmxlXShodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0Zpc2hlcuKAk1lhdGVzX3NodWZmbGUpLlxuICBfLnNodWZmbGUgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgcmFuZDtcbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIHZhciBzaHVmZmxlZCA9IFtdO1xuICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmFuZCA9IF8ucmFuZG9tKGluZGV4KyspO1xuICAgICAgc2h1ZmZsZWRbaW5kZXggLSAxXSA9IHNodWZmbGVkW3JhbmRdO1xuICAgICAgc2h1ZmZsZWRbcmFuZF0gPSB2YWx1ZTtcbiAgICB9KTtcbiAgICByZXR1cm4gc2h1ZmZsZWQ7XG4gIH07XG5cbiAgLy8gU2FtcGxlICoqbioqIHJhbmRvbSB2YWx1ZXMgZnJvbSBhbiBhcnJheS5cbiAgLy8gSWYgKipuKiogaXMgbm90IHNwZWNpZmllZCwgcmV0dXJucyBhIHNpbmdsZSByYW5kb20gZWxlbWVudCBmcm9tIHRoZSBhcnJheS5cbiAgLy8gVGhlIGludGVybmFsIGBndWFyZGAgYXJndW1lbnQgYWxsb3dzIGl0IHRvIHdvcmsgd2l0aCBgbWFwYC5cbiAgXy5zYW1wbGUgPSBmdW5jdGlvbihvYmosIG4sIGd1YXJkKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyIHx8IGd1YXJkKSB7XG4gICAgICByZXR1cm4gb2JqW18ucmFuZG9tKG9iai5sZW5ndGggLSAxKV07XG4gICAgfVxuICAgIHJldHVybiBfLnNodWZmbGUob2JqKS5zbGljZSgwLCBNYXRoLm1heCgwLCBuKSk7XG4gIH07XG5cbiAgLy8gQW4gaW50ZXJuYWwgZnVuY3Rpb24gdG8gZ2VuZXJhdGUgbG9va3VwIGl0ZXJhdG9ycy5cbiAgdmFyIGxvb2t1cEl0ZXJhdG9yID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gXy5pc0Z1bmN0aW9uKHZhbHVlKSA/IHZhbHVlIDogZnVuY3Rpb24ob2JqKXsgcmV0dXJuIG9ialt2YWx1ZV07IH07XG4gIH07XG5cbiAgLy8gU29ydCB0aGUgb2JqZWN0J3MgdmFsdWVzIGJ5IGEgY3JpdGVyaW9uIHByb2R1Y2VkIGJ5IGFuIGl0ZXJhdG9yLlxuICBfLnNvcnRCeSA9IGZ1bmN0aW9uKG9iaiwgdmFsdWUsIGNvbnRleHQpIHtcbiAgICB2YXIgaXRlcmF0b3IgPSBsb29rdXBJdGVyYXRvcih2YWx1ZSk7XG4gICAgcmV0dXJuIF8ucGx1Y2soXy5tYXAob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgaW5kZXg6IGluZGV4LFxuICAgICAgICBjcml0ZXJpYTogaXRlcmF0b3IuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpXG4gICAgICB9O1xuICAgIH0pLnNvcnQoZnVuY3Rpb24obGVmdCwgcmlnaHQpIHtcbiAgICAgIHZhciBhID0gbGVmdC5jcml0ZXJpYTtcbiAgICAgIHZhciBiID0gcmlnaHQuY3JpdGVyaWE7XG4gICAgICBpZiAoYSAhPT0gYikge1xuICAgICAgICBpZiAoYSA+IGIgfHwgYSA9PT0gdm9pZCAwKSByZXR1cm4gMTtcbiAgICAgICAgaWYgKGEgPCBiIHx8IGIgPT09IHZvaWQgMCkgcmV0dXJuIC0xO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGxlZnQuaW5kZXggLSByaWdodC5pbmRleDtcbiAgICB9KSwgJ3ZhbHVlJyk7XG4gIH07XG5cbiAgLy8gQW4gaW50ZXJuYWwgZnVuY3Rpb24gdXNlZCBmb3IgYWdncmVnYXRlIFwiZ3JvdXAgYnlcIiBvcGVyYXRpb25zLlxuICB2YXIgZ3JvdXAgPSBmdW5jdGlvbihiZWhhdmlvcikge1xuICAgIHJldHVybiBmdW5jdGlvbihvYmosIHZhbHVlLCBjb250ZXh0KSB7XG4gICAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgICB2YXIgaXRlcmF0b3IgPSB2YWx1ZSA9PSBudWxsID8gXy5pZGVudGl0eSA6IGxvb2t1cEl0ZXJhdG9yKHZhbHVlKTtcbiAgICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgdmFyIGtleSA9IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBvYmopO1xuICAgICAgICBiZWhhdmlvcihyZXN1bHQsIGtleSwgdmFsdWUpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH07XG5cbiAgLy8gR3JvdXBzIHRoZSBvYmplY3QncyB2YWx1ZXMgYnkgYSBjcml0ZXJpb24uIFBhc3MgZWl0aGVyIGEgc3RyaW5nIGF0dHJpYnV0ZVxuICAvLyB0byBncm91cCBieSwgb3IgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIGNyaXRlcmlvbi5cbiAgXy5ncm91cEJ5ID0gZ3JvdXAoZnVuY3Rpb24ocmVzdWx0LCBrZXksIHZhbHVlKSB7XG4gICAgKF8uaGFzKHJlc3VsdCwga2V5KSA/IHJlc3VsdFtrZXldIDogKHJlc3VsdFtrZXldID0gW10pKS5wdXNoKHZhbHVlKTtcbiAgfSk7XG5cbiAgLy8gSW5kZXhlcyB0aGUgb2JqZWN0J3MgdmFsdWVzIGJ5IGEgY3JpdGVyaW9uLCBzaW1pbGFyIHRvIGBncm91cEJ5YCwgYnV0IGZvclxuICAvLyB3aGVuIHlvdSBrbm93IHRoYXQgeW91ciBpbmRleCB2YWx1ZXMgd2lsbCBiZSB1bmlxdWUuXG4gIF8uaW5kZXhCeSA9IGdyb3VwKGZ1bmN0aW9uKHJlc3VsdCwga2V5LCB2YWx1ZSkge1xuICAgIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gIH0pO1xuXG4gIC8vIENvdW50cyBpbnN0YW5jZXMgb2YgYW4gb2JqZWN0IHRoYXQgZ3JvdXAgYnkgYSBjZXJ0YWluIGNyaXRlcmlvbi4gUGFzc1xuICAvLyBlaXRoZXIgYSBzdHJpbmcgYXR0cmlidXRlIHRvIGNvdW50IGJ5LCBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGVcbiAgLy8gY3JpdGVyaW9uLlxuICBfLmNvdW50QnkgPSBncm91cChmdW5jdGlvbihyZXN1bHQsIGtleSkge1xuICAgIF8uaGFzKHJlc3VsdCwga2V5KSA/IHJlc3VsdFtrZXldKysgOiByZXN1bHRba2V5XSA9IDE7XG4gIH0pO1xuXG4gIC8vIFVzZSBhIGNvbXBhcmF0b3IgZnVuY3Rpb24gdG8gZmlndXJlIG91dCB0aGUgc21hbGxlc3QgaW5kZXggYXQgd2hpY2hcbiAgLy8gYW4gb2JqZWN0IHNob3VsZCBiZSBpbnNlcnRlZCBzbyBhcyB0byBtYWludGFpbiBvcmRlci4gVXNlcyBiaW5hcnkgc2VhcmNoLlxuICBfLnNvcnRlZEluZGV4ID0gZnVuY3Rpb24oYXJyYXksIG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBpdGVyYXRvciA9IGl0ZXJhdG9yID09IG51bGwgPyBfLmlkZW50aXR5IDogbG9va3VwSXRlcmF0b3IoaXRlcmF0b3IpO1xuICAgIHZhciB2YWx1ZSA9IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgb2JqKTtcbiAgICB2YXIgbG93ID0gMCwgaGlnaCA9IGFycmF5Lmxlbmd0aDtcbiAgICB3aGlsZSAobG93IDwgaGlnaCkge1xuICAgICAgdmFyIG1pZCA9IChsb3cgKyBoaWdoKSA+Pj4gMTtcbiAgICAgIGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgYXJyYXlbbWlkXSkgPCB2YWx1ZSA/IGxvdyA9IG1pZCArIDEgOiBoaWdoID0gbWlkO1xuICAgIH1cbiAgICByZXR1cm4gbG93O1xuICB9O1xuXG4gIC8vIFNhZmVseSBjcmVhdGUgYSByZWFsLCBsaXZlIGFycmF5IGZyb20gYW55dGhpbmcgaXRlcmFibGUuXG4gIF8udG9BcnJheSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmICghb2JqKSByZXR1cm4gW107XG4gICAgaWYgKF8uaXNBcnJheShvYmopKSByZXR1cm4gc2xpY2UuY2FsbChvYmopO1xuICAgIGlmIChvYmoubGVuZ3RoID09PSArb2JqLmxlbmd0aCkgcmV0dXJuIF8ubWFwKG9iaiwgXy5pZGVudGl0eSk7XG4gICAgcmV0dXJuIF8udmFsdWVzKG9iaik7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gYW4gb2JqZWN0LlxuICBfLnNpemUgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiAwO1xuICAgIHJldHVybiAob2JqLmxlbmd0aCA9PT0gK29iai5sZW5ndGgpID8gb2JqLmxlbmd0aCA6IF8ua2V5cyhvYmopLmxlbmd0aDtcbiAgfTtcblxuICAvLyBBcnJheSBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gR2V0IHRoZSBmaXJzdCBlbGVtZW50IG9mIGFuIGFycmF5LiBQYXNzaW5nICoqbioqIHdpbGwgcmV0dXJuIHRoZSBmaXJzdCBOXG4gIC8vIHZhbHVlcyBpbiB0aGUgYXJyYXkuIEFsaWFzZWQgYXMgYGhlYWRgIGFuZCBgdGFrZWAuIFRoZSAqKmd1YXJkKiogY2hlY2tcbiAgLy8gYWxsb3dzIGl0IHRvIHdvcmsgd2l0aCBgXy5tYXBgLlxuICBfLmZpcnN0ID0gXy5oZWFkID0gXy50YWtlID0gZnVuY3Rpb24oYXJyYXksIG4sIGd1YXJkKSB7XG4gICAgaWYgKGFycmF5ID09IG51bGwpIHJldHVybiB2b2lkIDA7XG4gICAgcmV0dXJuIChuID09IG51bGwpIHx8IGd1YXJkID8gYXJyYXlbMF0gOiBzbGljZS5jYWxsKGFycmF5LCAwLCBuKTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGV2ZXJ5dGhpbmcgYnV0IHRoZSBsYXN0IGVudHJ5IG9mIHRoZSBhcnJheS4gRXNwZWNpYWxseSB1c2VmdWwgb25cbiAgLy8gdGhlIGFyZ3VtZW50cyBvYmplY3QuIFBhc3NpbmcgKipuKiogd2lsbCByZXR1cm4gYWxsIHRoZSB2YWx1ZXMgaW5cbiAgLy8gdGhlIGFycmF5LCBleGNsdWRpbmcgdGhlIGxhc3QgTi4gVGhlICoqZ3VhcmQqKiBjaGVjayBhbGxvd3MgaXQgdG8gd29yayB3aXRoXG4gIC8vIGBfLm1hcGAuXG4gIF8uaW5pdGlhbCA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCAwLCBhcnJheS5sZW5ndGggLSAoKG4gPT0gbnVsbCkgfHwgZ3VhcmQgPyAxIDogbikpO1xuICB9O1xuXG4gIC8vIEdldCB0aGUgbGFzdCBlbGVtZW50IG9mIGFuIGFycmF5LiBQYXNzaW5nICoqbioqIHdpbGwgcmV0dXJuIHRoZSBsYXN0IE5cbiAgLy8gdmFsdWVzIGluIHRoZSBhcnJheS4gVGhlICoqZ3VhcmQqKiBjaGVjayBhbGxvd3MgaXQgdG8gd29yayB3aXRoIGBfLm1hcGAuXG4gIF8ubGFzdCA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gdm9pZCAwO1xuICAgIGlmICgobiA9PSBudWxsKSB8fCBndWFyZCkge1xuICAgICAgcmV0dXJuIGFycmF5W2FycmF5Lmxlbmd0aCAtIDFdO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gc2xpY2UuY2FsbChhcnJheSwgTWF0aC5tYXgoYXJyYXkubGVuZ3RoIC0gbiwgMCkpO1xuICAgIH1cbiAgfTtcblxuICAvLyBSZXR1cm5zIGV2ZXJ5dGhpbmcgYnV0IHRoZSBmaXJzdCBlbnRyeSBvZiB0aGUgYXJyYXkuIEFsaWFzZWQgYXMgYHRhaWxgIGFuZCBgZHJvcGAuXG4gIC8vIEVzcGVjaWFsbHkgdXNlZnVsIG9uIHRoZSBhcmd1bWVudHMgb2JqZWN0LiBQYXNzaW5nIGFuICoqbioqIHdpbGwgcmV0dXJuXG4gIC8vIHRoZSByZXN0IE4gdmFsdWVzIGluIHRoZSBhcnJheS4gVGhlICoqZ3VhcmQqKlxuICAvLyBjaGVjayBhbGxvd3MgaXQgdG8gd29yayB3aXRoIGBfLm1hcGAuXG4gIF8ucmVzdCA9IF8udGFpbCA9IF8uZHJvcCA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCAobiA9PSBudWxsKSB8fCBndWFyZCA/IDEgOiBuKTtcbiAgfTtcblxuICAvLyBUcmltIG91dCBhbGwgZmFsc3kgdmFsdWVzIGZyb20gYW4gYXJyYXkuXG4gIF8uY29tcGFjdCA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgcmV0dXJuIF8uZmlsdGVyKGFycmF5LCBfLmlkZW50aXR5KTtcbiAgfTtcblxuICAvLyBJbnRlcm5hbCBpbXBsZW1lbnRhdGlvbiBvZiBhIHJlY3Vyc2l2ZSBgZmxhdHRlbmAgZnVuY3Rpb24uXG4gIHZhciBmbGF0dGVuID0gZnVuY3Rpb24oaW5wdXQsIHNoYWxsb3csIG91dHB1dCkge1xuICAgIGlmIChzaGFsbG93ICYmIF8uZXZlcnkoaW5wdXQsIF8uaXNBcnJheSkpIHtcbiAgICAgIHJldHVybiBjb25jYXQuYXBwbHkob3V0cHV0LCBpbnB1dCk7XG4gICAgfVxuICAgIGVhY2goaW5wdXQsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBpZiAoXy5pc0FycmF5KHZhbHVlKSB8fCBfLmlzQXJndW1lbnRzKHZhbHVlKSkge1xuICAgICAgICBzaGFsbG93ID8gcHVzaC5hcHBseShvdXRwdXQsIHZhbHVlKSA6IGZsYXR0ZW4odmFsdWUsIHNoYWxsb3csIG91dHB1dCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvdXRwdXQucHVzaCh2YWx1ZSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfTtcblxuICAvLyBGbGF0dGVuIG91dCBhbiBhcnJheSwgZWl0aGVyIHJlY3Vyc2l2ZWx5IChieSBkZWZhdWx0KSwgb3IganVzdCBvbmUgbGV2ZWwuXG4gIF8uZmxhdHRlbiA9IGZ1bmN0aW9uKGFycmF5LCBzaGFsbG93KSB7XG4gICAgcmV0dXJuIGZsYXR0ZW4oYXJyYXksIHNoYWxsb3csIFtdKTtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSB2ZXJzaW9uIG9mIHRoZSBhcnJheSB0aGF0IGRvZXMgbm90IGNvbnRhaW4gdGhlIHNwZWNpZmllZCB2YWx1ZShzKS5cbiAgXy53aXRob3V0ID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICByZXR1cm4gXy5kaWZmZXJlbmNlKGFycmF5LCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICB9O1xuXG4gIC8vIFByb2R1Y2UgYSBkdXBsaWNhdGUtZnJlZSB2ZXJzaW9uIG9mIHRoZSBhcnJheS4gSWYgdGhlIGFycmF5IGhhcyBhbHJlYWR5XG4gIC8vIGJlZW4gc29ydGVkLCB5b3UgaGF2ZSB0aGUgb3B0aW9uIG9mIHVzaW5nIGEgZmFzdGVyIGFsZ29yaXRobS5cbiAgLy8gQWxpYXNlZCBhcyBgdW5pcXVlYC5cbiAgXy51bmlxID0gXy51bmlxdWUgPSBmdW5jdGlvbihhcnJheSwgaXNTb3J0ZWQsIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgaWYgKF8uaXNGdW5jdGlvbihpc1NvcnRlZCkpIHtcbiAgICAgIGNvbnRleHQgPSBpdGVyYXRvcjtcbiAgICAgIGl0ZXJhdG9yID0gaXNTb3J0ZWQ7XG4gICAgICBpc1NvcnRlZCA9IGZhbHNlO1xuICAgIH1cbiAgICB2YXIgaW5pdGlhbCA9IGl0ZXJhdG9yID8gXy5tYXAoYXJyYXksIGl0ZXJhdG9yLCBjb250ZXh0KSA6IGFycmF5O1xuICAgIHZhciByZXN1bHRzID0gW107XG4gICAgdmFyIHNlZW4gPSBbXTtcbiAgICBlYWNoKGluaXRpYWwsIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgaWYgKGlzU29ydGVkID8gKCFpbmRleCB8fCBzZWVuW3NlZW4ubGVuZ3RoIC0gMV0gIT09IHZhbHVlKSA6ICFfLmNvbnRhaW5zKHNlZW4sIHZhbHVlKSkge1xuICAgICAgICBzZWVuLnB1c2godmFsdWUpO1xuICAgICAgICByZXN1bHRzLnB1c2goYXJyYXlbaW5kZXhdKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICAvLyBQcm9kdWNlIGFuIGFycmF5IHRoYXQgY29udGFpbnMgdGhlIHVuaW9uOiBlYWNoIGRpc3RpbmN0IGVsZW1lbnQgZnJvbSBhbGwgb2ZcbiAgLy8gdGhlIHBhc3NlZC1pbiBhcnJheXMuXG4gIF8udW5pb24gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXy51bmlxKF8uZmxhdHRlbihhcmd1bWVudHMsIHRydWUpKTtcbiAgfTtcblxuICAvLyBQcm9kdWNlIGFuIGFycmF5IHRoYXQgY29udGFpbnMgZXZlcnkgaXRlbSBzaGFyZWQgYmV0d2VlbiBhbGwgdGhlXG4gIC8vIHBhc3NlZC1pbiBhcnJheXMuXG4gIF8uaW50ZXJzZWN0aW9uID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICB2YXIgcmVzdCA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICByZXR1cm4gXy5maWx0ZXIoXy51bmlxKGFycmF5KSwgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgcmV0dXJuIF8uZXZlcnkocmVzdCwgZnVuY3Rpb24ob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIF8uaW5kZXhPZihvdGhlciwgaXRlbSkgPj0gMDtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIFRha2UgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiBvbmUgYXJyYXkgYW5kIGEgbnVtYmVyIG9mIG90aGVyIGFycmF5cy5cbiAgLy8gT25seSB0aGUgZWxlbWVudHMgcHJlc2VudCBpbiBqdXN0IHRoZSBmaXJzdCBhcnJheSB3aWxsIHJlbWFpbi5cbiAgXy5kaWZmZXJlbmNlID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICB2YXIgcmVzdCA9IGNvbmNhdC5hcHBseShBcnJheVByb3RvLCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICAgIHJldHVybiBfLmZpbHRlcihhcnJheSwgZnVuY3Rpb24odmFsdWUpeyByZXR1cm4gIV8uY29udGFpbnMocmVzdCwgdmFsdWUpOyB9KTtcbiAgfTtcblxuICAvLyBaaXAgdG9nZXRoZXIgbXVsdGlwbGUgbGlzdHMgaW50byBhIHNpbmdsZSBhcnJheSAtLSBlbGVtZW50cyB0aGF0IHNoYXJlXG4gIC8vIGFuIGluZGV4IGdvIHRvZ2V0aGVyLlxuICBfLnppcCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBsZW5ndGggPSBfLm1heChfLnBsdWNrKGFyZ3VtZW50cywgXCJsZW5ndGhcIikuY29uY2F0KDApKTtcbiAgICB2YXIgcmVzdWx0cyA9IG5ldyBBcnJheShsZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlc3VsdHNbaV0gPSBfLnBsdWNrKGFyZ3VtZW50cywgJycgKyBpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgLy8gQ29udmVydHMgbGlzdHMgaW50byBvYmplY3RzLiBQYXNzIGVpdGhlciBhIHNpbmdsZSBhcnJheSBvZiBgW2tleSwgdmFsdWVdYFxuICAvLyBwYWlycywgb3IgdHdvIHBhcmFsbGVsIGFycmF5cyBvZiB0aGUgc2FtZSBsZW5ndGggLS0gb25lIG9mIGtleXMsIGFuZCBvbmUgb2ZcbiAgLy8gdGhlIGNvcnJlc3BvbmRpbmcgdmFsdWVzLlxuICBfLm9iamVjdCA9IGZ1bmN0aW9uKGxpc3QsIHZhbHVlcykge1xuICAgIGlmIChsaXN0ID09IG51bGwpIHJldHVybiB7fTtcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGxpc3QubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh2YWx1ZXMpIHtcbiAgICAgICAgcmVzdWx0W2xpc3RbaV1dID0gdmFsdWVzW2ldO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0W2xpc3RbaV1bMF1dID0gbGlzdFtpXVsxXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBJZiB0aGUgYnJvd3NlciBkb2Vzbid0IHN1cHBseSB1cyB3aXRoIGluZGV4T2YgKEknbSBsb29raW5nIGF0IHlvdSwgKipNU0lFKiopLFxuICAvLyB3ZSBuZWVkIHRoaXMgZnVuY3Rpb24uIFJldHVybiB0aGUgcG9zaXRpb24gb2YgdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgYW5cbiAgLy8gaXRlbSBpbiBhbiBhcnJheSwgb3IgLTEgaWYgdGhlIGl0ZW0gaXMgbm90IGluY2x1ZGVkIGluIHRoZSBhcnJheS5cbiAgLy8gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYGluZGV4T2ZgIGlmIGF2YWlsYWJsZS5cbiAgLy8gSWYgdGhlIGFycmF5IGlzIGxhcmdlIGFuZCBhbHJlYWR5IGluIHNvcnQgb3JkZXIsIHBhc3MgYHRydWVgXG4gIC8vIGZvciAqKmlzU29ydGVkKiogdG8gdXNlIGJpbmFyeSBzZWFyY2guXG4gIF8uaW5kZXhPZiA9IGZ1bmN0aW9uKGFycmF5LCBpdGVtLCBpc1NvcnRlZCkge1xuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gLTE7XG4gICAgdmFyIGkgPSAwLCBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG4gICAgaWYgKGlzU29ydGVkKSB7XG4gICAgICBpZiAodHlwZW9mIGlzU29ydGVkID09ICdudW1iZXInKSB7XG4gICAgICAgIGkgPSAoaXNTb3J0ZWQgPCAwID8gTWF0aC5tYXgoMCwgbGVuZ3RoICsgaXNTb3J0ZWQpIDogaXNTb3J0ZWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaSA9IF8uc29ydGVkSW5kZXgoYXJyYXksIGl0ZW0pO1xuICAgICAgICByZXR1cm4gYXJyYXlbaV0gPT09IGl0ZW0gPyBpIDogLTE7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChuYXRpdmVJbmRleE9mICYmIGFycmF5LmluZGV4T2YgPT09IG5hdGl2ZUluZGV4T2YpIHJldHVybiBhcnJheS5pbmRleE9mKGl0ZW0sIGlzU29ydGVkKTtcbiAgICBmb3IgKDsgaSA8IGxlbmd0aDsgaSsrKSBpZiAoYXJyYXlbaV0gPT09IGl0ZW0pIHJldHVybiBpO1xuICAgIHJldHVybiAtMTtcbiAgfTtcblxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgbGFzdEluZGV4T2ZgIGlmIGF2YWlsYWJsZS5cbiAgXy5sYXN0SW5kZXhPZiA9IGZ1bmN0aW9uKGFycmF5LCBpdGVtLCBmcm9tKSB7XG4gICAgaWYgKGFycmF5ID09IG51bGwpIHJldHVybiAtMTtcbiAgICB2YXIgaGFzSW5kZXggPSBmcm9tICE9IG51bGw7XG4gICAgaWYgKG5hdGl2ZUxhc3RJbmRleE9mICYmIGFycmF5Lmxhc3RJbmRleE9mID09PSBuYXRpdmVMYXN0SW5kZXhPZikge1xuICAgICAgcmV0dXJuIGhhc0luZGV4ID8gYXJyYXkubGFzdEluZGV4T2YoaXRlbSwgZnJvbSkgOiBhcnJheS5sYXN0SW5kZXhPZihpdGVtKTtcbiAgICB9XG4gICAgdmFyIGkgPSAoaGFzSW5kZXggPyBmcm9tIDogYXJyYXkubGVuZ3RoKTtcbiAgICB3aGlsZSAoaS0tKSBpZiAoYXJyYXlbaV0gPT09IGl0ZW0pIHJldHVybiBpO1xuICAgIHJldHVybiAtMTtcbiAgfTtcblxuICAvLyBHZW5lcmF0ZSBhbiBpbnRlZ2VyIEFycmF5IGNvbnRhaW5pbmcgYW4gYXJpdGhtZXRpYyBwcm9ncmVzc2lvbi4gQSBwb3J0IG9mXG4gIC8vIHRoZSBuYXRpdmUgUHl0aG9uIGByYW5nZSgpYCBmdW5jdGlvbi4gU2VlXG4gIC8vIFt0aGUgUHl0aG9uIGRvY3VtZW50YXRpb25dKGh0dHA6Ly9kb2NzLnB5dGhvbi5vcmcvbGlicmFyeS9mdW5jdGlvbnMuaHRtbCNyYW5nZSkuXG4gIF8ucmFuZ2UgPSBmdW5jdGlvbihzdGFydCwgc3RvcCwgc3RlcCkge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDw9IDEpIHtcbiAgICAgIHN0b3AgPSBzdGFydCB8fCAwO1xuICAgICAgc3RhcnQgPSAwO1xuICAgIH1cbiAgICBzdGVwID0gYXJndW1lbnRzWzJdIHx8IDE7XG5cbiAgICB2YXIgbGVuZ3RoID0gTWF0aC5tYXgoTWF0aC5jZWlsKChzdG9wIC0gc3RhcnQpIC8gc3RlcCksIDApO1xuICAgIHZhciBpZHggPSAwO1xuICAgIHZhciByYW5nZSA9IG5ldyBBcnJheShsZW5ndGgpO1xuXG4gICAgd2hpbGUoaWR4IDwgbGVuZ3RoKSB7XG4gICAgICByYW5nZVtpZHgrK10gPSBzdGFydDtcbiAgICAgIHN0YXJ0ICs9IHN0ZXA7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJhbmdlO1xuICB9O1xuXG4gIC8vIEZ1bmN0aW9uIChhaGVtKSBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gUmV1c2FibGUgY29uc3RydWN0b3IgZnVuY3Rpb24gZm9yIHByb3RvdHlwZSBzZXR0aW5nLlxuICB2YXIgY3RvciA9IGZ1bmN0aW9uKCl7fTtcblxuICAvLyBDcmVhdGUgYSBmdW5jdGlvbiBib3VuZCB0byBhIGdpdmVuIG9iamVjdCAoYXNzaWduaW5nIGB0aGlzYCwgYW5kIGFyZ3VtZW50cyxcbiAgLy8gb3B0aW9uYWxseSkuIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBGdW5jdGlvbi5iaW5kYCBpZlxuICAvLyBhdmFpbGFibGUuXG4gIF8uYmluZCA9IGZ1bmN0aW9uKGZ1bmMsIGNvbnRleHQpIHtcbiAgICB2YXIgYXJncywgYm91bmQ7XG4gICAgaWYgKG5hdGl2ZUJpbmQgJiYgZnVuYy5iaW5kID09PSBuYXRpdmVCaW5kKSByZXR1cm4gbmF0aXZlQmluZC5hcHBseShmdW5jLCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICAgIGlmICghXy5pc0Z1bmN0aW9uKGZ1bmMpKSB0aHJvdyBuZXcgVHlwZUVycm9yO1xuICAgIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gICAgcmV0dXJuIGJvdW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgYm91bmQpKSByZXR1cm4gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzLmNvbmNhdChzbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbiAgICAgIGN0b3IucHJvdG90eXBlID0gZnVuYy5wcm90b3R5cGU7XG4gICAgICB2YXIgc2VsZiA9IG5ldyBjdG9yO1xuICAgICAgY3Rvci5wcm90b3R5cGUgPSBudWxsO1xuICAgICAgdmFyIHJlc3VsdCA9IGZ1bmMuYXBwbHkoc2VsZiwgYXJncy5jb25jYXQoc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG4gICAgICBpZiAoT2JqZWN0KHJlc3VsdCkgPT09IHJlc3VsdCkgcmV0dXJuIHJlc3VsdDtcbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUGFydGlhbGx5IGFwcGx5IGEgZnVuY3Rpb24gYnkgY3JlYXRpbmcgYSB2ZXJzaW9uIHRoYXQgaGFzIGhhZCBzb21lIG9mIGl0c1xuICAvLyBhcmd1bWVudHMgcHJlLWZpbGxlZCwgd2l0aG91dCBjaGFuZ2luZyBpdHMgZHluYW1pYyBgdGhpc2AgY29udGV4dC5cbiAgXy5wYXJ0aWFsID0gZnVuY3Rpb24oZnVuYykge1xuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBmdW5jLmFwcGx5KHRoaXMsIGFyZ3MuY29uY2F0KHNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xuICAgIH07XG4gIH07XG5cbiAgLy8gQmluZCBhbGwgb2YgYW4gb2JqZWN0J3MgbWV0aG9kcyB0byB0aGF0IG9iamVjdC4gVXNlZnVsIGZvciBlbnN1cmluZyB0aGF0XG4gIC8vIGFsbCBjYWxsYmFja3MgZGVmaW5lZCBvbiBhbiBvYmplY3QgYmVsb25nIHRvIGl0LlxuICBfLmJpbmRBbGwgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgZnVuY3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgaWYgKGZ1bmNzLmxlbmd0aCA9PT0gMCkgdGhyb3cgbmV3IEVycm9yKFwiYmluZEFsbCBtdXN0IGJlIHBhc3NlZCBmdW5jdGlvbiBuYW1lc1wiKTtcbiAgICBlYWNoKGZ1bmNzLCBmdW5jdGlvbihmKSB7IG9ialtmXSA9IF8uYmluZChvYmpbZl0sIG9iaik7IH0pO1xuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gTWVtb2l6ZSBhbiBleHBlbnNpdmUgZnVuY3Rpb24gYnkgc3RvcmluZyBpdHMgcmVzdWx0cy5cbiAgXy5tZW1vaXplID0gZnVuY3Rpb24oZnVuYywgaGFzaGVyKSB7XG4gICAgdmFyIG1lbW8gPSB7fTtcbiAgICBoYXNoZXIgfHwgKGhhc2hlciA9IF8uaWRlbnRpdHkpO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBrZXkgPSBoYXNoZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIHJldHVybiBfLmhhcyhtZW1vLCBrZXkpID8gbWVtb1trZXldIDogKG1lbW9ba2V5XSA9IGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG4gICAgfTtcbiAgfTtcblxuICAvLyBEZWxheXMgYSBmdW5jdGlvbiBmb3IgdGhlIGdpdmVuIG51bWJlciBvZiBtaWxsaXNlY29uZHMsIGFuZCB0aGVuIGNhbGxzXG4gIC8vIGl0IHdpdGggdGhlIGFyZ3VtZW50cyBzdXBwbGllZC5cbiAgXy5kZWxheSA9IGZ1bmN0aW9uKGZ1bmMsIHdhaXQpIHtcbiAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbigpeyByZXR1cm4gZnVuYy5hcHBseShudWxsLCBhcmdzKTsgfSwgd2FpdCk7XG4gIH07XG5cbiAgLy8gRGVmZXJzIGEgZnVuY3Rpb24sIHNjaGVkdWxpbmcgaXQgdG8gcnVuIGFmdGVyIHRoZSBjdXJyZW50IGNhbGwgc3RhY2sgaGFzXG4gIC8vIGNsZWFyZWQuXG4gIF8uZGVmZXIgPSBmdW5jdGlvbihmdW5jKSB7XG4gICAgcmV0dXJuIF8uZGVsYXkuYXBwbHkoXywgW2Z1bmMsIDFdLmNvbmNhdChzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpKTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24sIHRoYXQsIHdoZW4gaW52b2tlZCwgd2lsbCBvbmx5IGJlIHRyaWdnZXJlZCBhdCBtb3N0IG9uY2VcbiAgLy8gZHVyaW5nIGEgZ2l2ZW4gd2luZG93IG9mIHRpbWUuIE5vcm1hbGx5LCB0aGUgdGhyb3R0bGVkIGZ1bmN0aW9uIHdpbGwgcnVuXG4gIC8vIGFzIG11Y2ggYXMgaXQgY2FuLCB3aXRob3V0IGV2ZXIgZ29pbmcgbW9yZSB0aGFuIG9uY2UgcGVyIGB3YWl0YCBkdXJhdGlvbjtcbiAgLy8gYnV0IGlmIHlvdSdkIGxpa2UgdG8gZGlzYWJsZSB0aGUgZXhlY3V0aW9uIG9uIHRoZSBsZWFkaW5nIGVkZ2UsIHBhc3NcbiAgLy8gYHtsZWFkaW5nOiBmYWxzZX1gLiBUbyBkaXNhYmxlIGV4ZWN1dGlvbiBvbiB0aGUgdHJhaWxpbmcgZWRnZSwgZGl0dG8uXG4gIF8udGhyb3R0bGUgPSBmdW5jdGlvbihmdW5jLCB3YWl0LCBvcHRpb25zKSB7XG4gICAgdmFyIGNvbnRleHQsIGFyZ3MsIHJlc3VsdDtcbiAgICB2YXIgdGltZW91dCA9IG51bGw7XG4gICAgdmFyIHByZXZpb3VzID0gMDtcbiAgICBvcHRpb25zIHx8IChvcHRpb25zID0ge30pO1xuICAgIHZhciBsYXRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgcHJldmlvdXMgPSBvcHRpb25zLmxlYWRpbmcgPT09IGZhbHNlID8gMCA6IG5ldyBEYXRlO1xuICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG5vdyA9IG5ldyBEYXRlO1xuICAgICAgaWYgKCFwcmV2aW91cyAmJiBvcHRpb25zLmxlYWRpbmcgPT09IGZhbHNlKSBwcmV2aW91cyA9IG5vdztcbiAgICAgIHZhciByZW1haW5pbmcgPSB3YWl0IC0gKG5vdyAtIHByZXZpb3VzKTtcbiAgICAgIGNvbnRleHQgPSB0aGlzO1xuICAgICAgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgIGlmIChyZW1haW5pbmcgPD0gMCkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgICBwcmV2aW91cyA9IG5vdztcbiAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgIH0gZWxzZSBpZiAoIXRpbWVvdXQgJiYgb3B0aW9ucy50cmFpbGluZyAhPT0gZmFsc2UpIHtcbiAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHJlbWFpbmluZyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uLCB0aGF0LCBhcyBsb25nIGFzIGl0IGNvbnRpbnVlcyB0byBiZSBpbnZva2VkLCB3aWxsIG5vdFxuICAvLyBiZSB0cmlnZ2VyZWQuIFRoZSBmdW5jdGlvbiB3aWxsIGJlIGNhbGxlZCBhZnRlciBpdCBzdG9wcyBiZWluZyBjYWxsZWQgZm9yXG4gIC8vIE4gbWlsbGlzZWNvbmRzLiBJZiBgaW1tZWRpYXRlYCBpcyBwYXNzZWQsIHRyaWdnZXIgdGhlIGZ1bmN0aW9uIG9uIHRoZVxuICAvLyBsZWFkaW5nIGVkZ2UsIGluc3RlYWQgb2YgdGhlIHRyYWlsaW5nLlxuICBfLmRlYm91bmNlID0gZnVuY3Rpb24oZnVuYywgd2FpdCwgaW1tZWRpYXRlKSB7XG4gICAgdmFyIHRpbWVvdXQsIGFyZ3MsIGNvbnRleHQsIHRpbWVzdGFtcCwgcmVzdWx0O1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnRleHQgPSB0aGlzO1xuICAgICAgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgIHRpbWVzdGFtcCA9IG5ldyBEYXRlKCk7XG4gICAgICB2YXIgbGF0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGxhc3QgPSAobmV3IERhdGUoKSkgLSB0aW1lc3RhbXA7XG4gICAgICAgIGlmIChsYXN0IDwgd2FpdCkge1xuICAgICAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0IC0gbGFzdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgICAgaWYgKCFpbW1lZGlhdGUpIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICB2YXIgY2FsbE5vdyA9IGltbWVkaWF0ZSAmJiAhdGltZW91dDtcbiAgICAgIGlmICghdGltZW91dCkge1xuICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdCk7XG4gICAgICB9XG4gICAgICBpZiAoY2FsbE5vdykgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIGF0IG1vc3Qgb25lIHRpbWUsIG5vIG1hdHRlciBob3dcbiAgLy8gb2Z0ZW4geW91IGNhbGwgaXQuIFVzZWZ1bCBmb3IgbGF6eSBpbml0aWFsaXphdGlvbi5cbiAgXy5vbmNlID0gZnVuY3Rpb24oZnVuYykge1xuICAgIHZhciByYW4gPSBmYWxzZSwgbWVtbztcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAocmFuKSByZXR1cm4gbWVtbztcbiAgICAgIHJhbiA9IHRydWU7XG4gICAgICBtZW1vID0gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgZnVuYyA9IG51bGw7XG4gICAgICByZXR1cm4gbWVtbztcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgdGhlIGZpcnN0IGZ1bmN0aW9uIHBhc3NlZCBhcyBhbiBhcmd1bWVudCB0byB0aGUgc2Vjb25kLFxuICAvLyBhbGxvd2luZyB5b3UgdG8gYWRqdXN0IGFyZ3VtZW50cywgcnVuIGNvZGUgYmVmb3JlIGFuZCBhZnRlciwgYW5kXG4gIC8vIGNvbmRpdGlvbmFsbHkgZXhlY3V0ZSB0aGUgb3JpZ2luYWwgZnVuY3Rpb24uXG4gIF8ud3JhcCA9IGZ1bmN0aW9uKGZ1bmMsIHdyYXBwZXIpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYXJncyA9IFtmdW5jXTtcbiAgICAgIHB1c2guYXBwbHkoYXJncywgYXJndW1lbnRzKTtcbiAgICAgIHJldHVybiB3cmFwcGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgaXMgdGhlIGNvbXBvc2l0aW9uIG9mIGEgbGlzdCBvZiBmdW5jdGlvbnMsIGVhY2hcbiAgLy8gY29uc3VtaW5nIHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIGZ1bmN0aW9uIHRoYXQgZm9sbG93cy5cbiAgXy5jb21wb3NlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGZ1bmNzID0gYXJndW1lbnRzO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgZm9yICh2YXIgaSA9IGZ1bmNzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIGFyZ3MgPSBbZnVuY3NbaV0uYXBwbHkodGhpcywgYXJncyldO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGFyZ3NbMF07XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCB3aWxsIG9ubHkgYmUgZXhlY3V0ZWQgYWZ0ZXIgYmVpbmcgY2FsbGVkIE4gdGltZXMuXG4gIF8uYWZ0ZXIgPSBmdW5jdGlvbih0aW1lcywgZnVuYykge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICgtLXRpbWVzIDwgMSkge1xuICAgICAgICByZXR1cm4gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfVxuICAgIH07XG4gIH07XG5cbiAgLy8gT2JqZWN0IEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gUmV0cmlldmUgdGhlIG5hbWVzIG9mIGFuIG9iamVjdCdzIHByb3BlcnRpZXMuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBPYmplY3Qua2V5c2BcbiAgXy5rZXlzID0gbmF0aXZlS2V5cyB8fCBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAob2JqICE9PSBPYmplY3Qob2JqKSkgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBvYmplY3QnKTtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIGlmIChfLmhhcyhvYmosIGtleSkpIGtleXMucHVzaChrZXkpO1xuICAgIHJldHVybiBrZXlzO1xuICB9O1xuXG4gIC8vIFJldHJpZXZlIHRoZSB2YWx1ZXMgb2YgYW4gb2JqZWN0J3MgcHJvcGVydGllcy5cbiAgXy52YWx1ZXMgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgIHZhciBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICB2YXIgdmFsdWVzID0gbmV3IEFycmF5KGxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFsdWVzW2ldID0gb2JqW2tleXNbaV1dO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWVzO1xuICB9O1xuXG4gIC8vIENvbnZlcnQgYW4gb2JqZWN0IGludG8gYSBsaXN0IG9mIGBba2V5LCB2YWx1ZV1gIHBhaXJzLlxuICBfLnBhaXJzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGtleXMgPSBfLmtleXMob2JqKTtcbiAgICB2YXIgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gICAgdmFyIHBhaXJzID0gbmV3IEFycmF5KGxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgcGFpcnNbaV0gPSBba2V5c1tpXSwgb2JqW2tleXNbaV1dXTtcbiAgICB9XG4gICAgcmV0dXJuIHBhaXJzO1xuICB9O1xuXG4gIC8vIEludmVydCB0aGUga2V5cyBhbmQgdmFsdWVzIG9mIGFuIG9iamVjdC4gVGhlIHZhbHVlcyBtdXN0IGJlIHNlcmlhbGl6YWJsZS5cbiAgXy5pbnZlcnQgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgdmFyIGtleXMgPSBfLmtleXMob2JqKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgcmVzdWx0W29ialtrZXlzW2ldXV0gPSBrZXlzW2ldO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFJldHVybiBhIHNvcnRlZCBsaXN0IG9mIHRoZSBmdW5jdGlvbiBuYW1lcyBhdmFpbGFibGUgb24gdGhlIG9iamVjdC5cbiAgLy8gQWxpYXNlZCBhcyBgbWV0aG9kc2BcbiAgXy5mdW5jdGlvbnMgPSBfLm1ldGhvZHMgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgbmFtZXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICBpZiAoXy5pc0Z1bmN0aW9uKG9ialtrZXldKSkgbmFtZXMucHVzaChrZXkpO1xuICAgIH1cbiAgICByZXR1cm4gbmFtZXMuc29ydCgpO1xuICB9O1xuXG4gIC8vIEV4dGVuZCBhIGdpdmVuIG9iamVjdCB3aXRoIGFsbCB0aGUgcHJvcGVydGllcyBpbiBwYXNzZWQtaW4gb2JqZWN0KHMpLlxuICBfLmV4dGVuZCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGVhY2goc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLCBmdW5jdGlvbihzb3VyY2UpIHtcbiAgICAgIGlmIChzb3VyY2UpIHtcbiAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBzb3VyY2UpIHtcbiAgICAgICAgICBvYmpbcHJvcF0gPSBzb3VyY2VbcHJvcF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIFJldHVybiBhIGNvcHkgb2YgdGhlIG9iamVjdCBvbmx5IGNvbnRhaW5pbmcgdGhlIHdoaXRlbGlzdGVkIHByb3BlcnRpZXMuXG4gIF8ucGljayA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBjb3B5ID0ge307XG4gICAgdmFyIGtleXMgPSBjb25jYXQuYXBwbHkoQXJyYXlQcm90bywgc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgICBlYWNoKGtleXMsIGZ1bmN0aW9uKGtleSkge1xuICAgICAgaWYgKGtleSBpbiBvYmopIGNvcHlba2V5XSA9IG9ialtrZXldO1xuICAgIH0pO1xuICAgIHJldHVybiBjb3B5O1xuICB9O1xuXG4gICAvLyBSZXR1cm4gYSBjb3B5IG9mIHRoZSBvYmplY3Qgd2l0aG91dCB0aGUgYmxhY2tsaXN0ZWQgcHJvcGVydGllcy5cbiAgXy5vbWl0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGNvcHkgPSB7fTtcbiAgICB2YXIga2V5cyA9IGNvbmNhdC5hcHBseShBcnJheVByb3RvLCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgIGlmICghXy5jb250YWlucyhrZXlzLCBrZXkpKSBjb3B5W2tleV0gPSBvYmpba2V5XTtcbiAgICB9XG4gICAgcmV0dXJuIGNvcHk7XG4gIH07XG5cbiAgLy8gRmlsbCBpbiBhIGdpdmVuIG9iamVjdCB3aXRoIGRlZmF1bHQgcHJvcGVydGllcy5cbiAgXy5kZWZhdWx0cyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGVhY2goc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLCBmdW5jdGlvbihzb3VyY2UpIHtcbiAgICAgIGlmIChzb3VyY2UpIHtcbiAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBzb3VyY2UpIHtcbiAgICAgICAgICBpZiAob2JqW3Byb3BdID09PSB2b2lkIDApIG9ialtwcm9wXSA9IHNvdXJjZVtwcm9wXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gQ3JlYXRlIGEgKHNoYWxsb3ctY2xvbmVkKSBkdXBsaWNhdGUgb2YgYW4gb2JqZWN0LlxuICBfLmNsb25lID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFfLmlzT2JqZWN0KG9iaikpIHJldHVybiBvYmo7XG4gICAgcmV0dXJuIF8uaXNBcnJheShvYmopID8gb2JqLnNsaWNlKCkgOiBfLmV4dGVuZCh7fSwgb2JqKTtcbiAgfTtcblxuICAvLyBJbnZva2VzIGludGVyY2VwdG9yIHdpdGggdGhlIG9iaiwgYW5kIHRoZW4gcmV0dXJucyBvYmouXG4gIC8vIFRoZSBwcmltYXJ5IHB1cnBvc2Ugb2YgdGhpcyBtZXRob2QgaXMgdG8gXCJ0YXAgaW50b1wiIGEgbWV0aG9kIGNoYWluLCBpblxuICAvLyBvcmRlciB0byBwZXJmb3JtIG9wZXJhdGlvbnMgb24gaW50ZXJtZWRpYXRlIHJlc3VsdHMgd2l0aGluIHRoZSBjaGFpbi5cbiAgXy50YXAgPSBmdW5jdGlvbihvYmosIGludGVyY2VwdG9yKSB7XG4gICAgaW50ZXJjZXB0b3Iob2JqKTtcbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIEludGVybmFsIHJlY3Vyc2l2ZSBjb21wYXJpc29uIGZ1bmN0aW9uIGZvciBgaXNFcXVhbGAuXG4gIHZhciBlcSA9IGZ1bmN0aW9uKGEsIGIsIGFTdGFjaywgYlN0YWNrKSB7XG4gICAgLy8gSWRlbnRpY2FsIG9iamVjdHMgYXJlIGVxdWFsLiBgMCA9PT0gLTBgLCBidXQgdGhleSBhcmVuJ3QgaWRlbnRpY2FsLlxuICAgIC8vIFNlZSB0aGUgW0hhcm1vbnkgYGVnYWxgIHByb3Bvc2FsXShodHRwOi8vd2lraS5lY21hc2NyaXB0Lm9yZy9kb2t1LnBocD9pZD1oYXJtb255OmVnYWwpLlxuICAgIGlmIChhID09PSBiKSByZXR1cm4gYSAhPT0gMCB8fCAxIC8gYSA9PSAxIC8gYjtcbiAgICAvLyBBIHN0cmljdCBjb21wYXJpc29uIGlzIG5lY2Vzc2FyeSBiZWNhdXNlIGBudWxsID09IHVuZGVmaW5lZGAuXG4gICAgaWYgKGEgPT0gbnVsbCB8fCBiID09IG51bGwpIHJldHVybiBhID09PSBiO1xuICAgIC8vIFVud3JhcCBhbnkgd3JhcHBlZCBvYmplY3RzLlxuICAgIGlmIChhIGluc3RhbmNlb2YgXykgYSA9IGEuX3dyYXBwZWQ7XG4gICAgaWYgKGIgaW5zdGFuY2VvZiBfKSBiID0gYi5fd3JhcHBlZDtcbiAgICAvLyBDb21wYXJlIGBbW0NsYXNzXV1gIG5hbWVzLlxuICAgIHZhciBjbGFzc05hbWUgPSB0b1N0cmluZy5jYWxsKGEpO1xuICAgIGlmIChjbGFzc05hbWUgIT0gdG9TdHJpbmcuY2FsbChiKSkgcmV0dXJuIGZhbHNlO1xuICAgIHN3aXRjaCAoY2xhc3NOYW1lKSB7XG4gICAgICAvLyBTdHJpbmdzLCBudW1iZXJzLCBkYXRlcywgYW5kIGJvb2xlYW5zIGFyZSBjb21wYXJlZCBieSB2YWx1ZS5cbiAgICAgIGNhc2UgJ1tvYmplY3QgU3RyaW5nXSc6XG4gICAgICAgIC8vIFByaW1pdGl2ZXMgYW5kIHRoZWlyIGNvcnJlc3BvbmRpbmcgb2JqZWN0IHdyYXBwZXJzIGFyZSBlcXVpdmFsZW50OyB0aHVzLCBgXCI1XCJgIGlzXG4gICAgICAgIC8vIGVxdWl2YWxlbnQgdG8gYG5ldyBTdHJpbmcoXCI1XCIpYC5cbiAgICAgICAgcmV0dXJuIGEgPT0gU3RyaW5nKGIpO1xuICAgICAgY2FzZSAnW29iamVjdCBOdW1iZXJdJzpcbiAgICAgICAgLy8gYE5hTmBzIGFyZSBlcXVpdmFsZW50LCBidXQgbm9uLXJlZmxleGl2ZS4gQW4gYGVnYWxgIGNvbXBhcmlzb24gaXMgcGVyZm9ybWVkIGZvclxuICAgICAgICAvLyBvdGhlciBudW1lcmljIHZhbHVlcy5cbiAgICAgICAgcmV0dXJuIGEgIT0gK2EgPyBiICE9ICtiIDogKGEgPT0gMCA/IDEgLyBhID09IDEgLyBiIDogYSA9PSArYik7XG4gICAgICBjYXNlICdbb2JqZWN0IERhdGVdJzpcbiAgICAgIGNhc2UgJ1tvYmplY3QgQm9vbGVhbl0nOlxuICAgICAgICAvLyBDb2VyY2UgZGF0ZXMgYW5kIGJvb2xlYW5zIHRvIG51bWVyaWMgcHJpbWl0aXZlIHZhbHVlcy4gRGF0ZXMgYXJlIGNvbXBhcmVkIGJ5IHRoZWlyXG4gICAgICAgIC8vIG1pbGxpc2Vjb25kIHJlcHJlc2VudGF0aW9ucy4gTm90ZSB0aGF0IGludmFsaWQgZGF0ZXMgd2l0aCBtaWxsaXNlY29uZCByZXByZXNlbnRhdGlvbnNcbiAgICAgICAgLy8gb2YgYE5hTmAgYXJlIG5vdCBlcXVpdmFsZW50LlxuICAgICAgICByZXR1cm4gK2EgPT0gK2I7XG4gICAgICAvLyBSZWdFeHBzIGFyZSBjb21wYXJlZCBieSB0aGVpciBzb3VyY2UgcGF0dGVybnMgYW5kIGZsYWdzLlxuICAgICAgY2FzZSAnW29iamVjdCBSZWdFeHBdJzpcbiAgICAgICAgcmV0dXJuIGEuc291cmNlID09IGIuc291cmNlICYmXG4gICAgICAgICAgICAgICBhLmdsb2JhbCA9PSBiLmdsb2JhbCAmJlxuICAgICAgICAgICAgICAgYS5tdWx0aWxpbmUgPT0gYi5tdWx0aWxpbmUgJiZcbiAgICAgICAgICAgICAgIGEuaWdub3JlQ2FzZSA9PSBiLmlnbm9yZUNhc2U7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgYSAhPSAnb2JqZWN0JyB8fCB0eXBlb2YgYiAhPSAnb2JqZWN0JykgcmV0dXJuIGZhbHNlO1xuICAgIC8vIEFzc3VtZSBlcXVhbGl0eSBmb3IgY3ljbGljIHN0cnVjdHVyZXMuIFRoZSBhbGdvcml0aG0gZm9yIGRldGVjdGluZyBjeWNsaWNcbiAgICAvLyBzdHJ1Y3R1cmVzIGlzIGFkYXB0ZWQgZnJvbSBFUyA1LjEgc2VjdGlvbiAxNS4xMi4zLCBhYnN0cmFjdCBvcGVyYXRpb24gYEpPYC5cbiAgICB2YXIgbGVuZ3RoID0gYVN0YWNrLmxlbmd0aDtcbiAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgIC8vIExpbmVhciBzZWFyY2guIFBlcmZvcm1hbmNlIGlzIGludmVyc2VseSBwcm9wb3J0aW9uYWwgdG8gdGhlIG51bWJlciBvZlxuICAgICAgLy8gdW5pcXVlIG5lc3RlZCBzdHJ1Y3R1cmVzLlxuICAgICAgaWYgKGFTdGFja1tsZW5ndGhdID09IGEpIHJldHVybiBiU3RhY2tbbGVuZ3RoXSA9PSBiO1xuICAgIH1cbiAgICAvLyBPYmplY3RzIHdpdGggZGlmZmVyZW50IGNvbnN0cnVjdG9ycyBhcmUgbm90IGVxdWl2YWxlbnQsIGJ1dCBgT2JqZWN0YHNcbiAgICAvLyBmcm9tIGRpZmZlcmVudCBmcmFtZXMgYXJlLlxuICAgIHZhciBhQ3RvciA9IGEuY29uc3RydWN0b3IsIGJDdG9yID0gYi5jb25zdHJ1Y3RvcjtcbiAgICBpZiAoYUN0b3IgIT09IGJDdG9yICYmICEoXy5pc0Z1bmN0aW9uKGFDdG9yKSAmJiAoYUN0b3IgaW5zdGFuY2VvZiBhQ3RvcikgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5pc0Z1bmN0aW9uKGJDdG9yKSAmJiAoYkN0b3IgaW5zdGFuY2VvZiBiQ3RvcikpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIEFkZCB0aGUgZmlyc3Qgb2JqZWN0IHRvIHRoZSBzdGFjayBvZiB0cmF2ZXJzZWQgb2JqZWN0cy5cbiAgICBhU3RhY2sucHVzaChhKTtcbiAgICBiU3RhY2sucHVzaChiKTtcbiAgICB2YXIgc2l6ZSA9IDAsIHJlc3VsdCA9IHRydWU7XG4gICAgLy8gUmVjdXJzaXZlbHkgY29tcGFyZSBvYmplY3RzIGFuZCBhcnJheXMuXG4gICAgaWYgKGNsYXNzTmFtZSA9PSAnW29iamVjdCBBcnJheV0nKSB7XG4gICAgICAvLyBDb21wYXJlIGFycmF5IGxlbmd0aHMgdG8gZGV0ZXJtaW5lIGlmIGEgZGVlcCBjb21wYXJpc29uIGlzIG5lY2Vzc2FyeS5cbiAgICAgIHNpemUgPSBhLmxlbmd0aDtcbiAgICAgIHJlc3VsdCA9IHNpemUgPT0gYi5sZW5ndGg7XG4gICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgIC8vIERlZXAgY29tcGFyZSB0aGUgY29udGVudHMsIGlnbm9yaW5nIG5vbi1udW1lcmljIHByb3BlcnRpZXMuXG4gICAgICAgIHdoaWxlIChzaXplLS0pIHtcbiAgICAgICAgICBpZiAoIShyZXN1bHQgPSBlcShhW3NpemVdLCBiW3NpemVdLCBhU3RhY2ssIGJTdGFjaykpKSBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBEZWVwIGNvbXBhcmUgb2JqZWN0cy5cbiAgICAgIGZvciAodmFyIGtleSBpbiBhKSB7XG4gICAgICAgIGlmIChfLmhhcyhhLCBrZXkpKSB7XG4gICAgICAgICAgLy8gQ291bnQgdGhlIGV4cGVjdGVkIG51bWJlciBvZiBwcm9wZXJ0aWVzLlxuICAgICAgICAgIHNpemUrKztcbiAgICAgICAgICAvLyBEZWVwIGNvbXBhcmUgZWFjaCBtZW1iZXIuXG4gICAgICAgICAgaWYgKCEocmVzdWx0ID0gXy5oYXMoYiwga2V5KSAmJiBlcShhW2tleV0sIGJba2V5XSwgYVN0YWNrLCBiU3RhY2spKSkgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIEVuc3VyZSB0aGF0IGJvdGggb2JqZWN0cyBjb250YWluIHRoZSBzYW1lIG51bWJlciBvZiBwcm9wZXJ0aWVzLlxuICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICBmb3IgKGtleSBpbiBiKSB7XG4gICAgICAgICAgaWYgKF8uaGFzKGIsIGtleSkgJiYgIShzaXplLS0pKSBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgPSAhc2l6ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gUmVtb3ZlIHRoZSBmaXJzdCBvYmplY3QgZnJvbSB0aGUgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMuXG4gICAgYVN0YWNrLnBvcCgpO1xuICAgIGJTdGFjay5wb3AoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFBlcmZvcm0gYSBkZWVwIGNvbXBhcmlzb24gdG8gY2hlY2sgaWYgdHdvIG9iamVjdHMgYXJlIGVxdWFsLlxuICBfLmlzRXF1YWwgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIGVxKGEsIGIsIFtdLCBbXSk7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiBhcnJheSwgc3RyaW5nLCBvciBvYmplY3QgZW1wdHk/XG4gIC8vIEFuIFwiZW1wdHlcIiBvYmplY3QgaGFzIG5vIGVudW1lcmFibGUgb3duLXByb3BlcnRpZXMuXG4gIF8uaXNFbXB0eSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHRydWU7XG4gICAgaWYgKF8uaXNBcnJheShvYmopIHx8IF8uaXNTdHJpbmcob2JqKSkgcmV0dXJuIG9iai5sZW5ndGggPT09IDA7XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikgaWYgKF8uaGFzKG9iaiwga2V5KSkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgYSBET00gZWxlbWVudD9cbiAgXy5pc0VsZW1lbnQgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gISEob2JqICYmIG9iai5ub2RlVHlwZSA9PT0gMSk7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBhbiBhcnJheT9cbiAgLy8gRGVsZWdhdGVzIHRvIEVDTUE1J3MgbmF0aXZlIEFycmF5LmlzQXJyYXlcbiAgXy5pc0FycmF5ID0gbmF0aXZlSXNBcnJheSB8fCBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gdG9TdHJpbmcuY2FsbChvYmopID09ICdbb2JqZWN0IEFycmF5XSc7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YXJpYWJsZSBhbiBvYmplY3Q/XG4gIF8uaXNPYmplY3QgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gb2JqID09PSBPYmplY3Qob2JqKTtcbiAgfTtcblxuICAvLyBBZGQgc29tZSBpc1R5cGUgbWV0aG9kczogaXNBcmd1bWVudHMsIGlzRnVuY3Rpb24sIGlzU3RyaW5nLCBpc051bWJlciwgaXNEYXRlLCBpc1JlZ0V4cC5cbiAgZWFjaChbJ0FyZ3VtZW50cycsICdGdW5jdGlvbicsICdTdHJpbmcnLCAnTnVtYmVyJywgJ0RhdGUnLCAnUmVnRXhwJ10sIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBfWydpcycgKyBuYW1lXSA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwob2JqKSA9PSAnW29iamVjdCAnICsgbmFtZSArICddJztcbiAgICB9O1xuICB9KTtcblxuICAvLyBEZWZpbmUgYSBmYWxsYmFjayB2ZXJzaW9uIG9mIHRoZSBtZXRob2QgaW4gYnJvd3NlcnMgKGFoZW0sIElFKSwgd2hlcmVcbiAgLy8gdGhlcmUgaXNuJ3QgYW55IGluc3BlY3RhYmxlIFwiQXJndW1lbnRzXCIgdHlwZS5cbiAgaWYgKCFfLmlzQXJndW1lbnRzKGFyZ3VtZW50cykpIHtcbiAgICBfLmlzQXJndW1lbnRzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gISEob2JqICYmIF8uaGFzKG9iaiwgJ2NhbGxlZScpKTtcbiAgICB9O1xuICB9XG5cbiAgLy8gT3B0aW1pemUgYGlzRnVuY3Rpb25gIGlmIGFwcHJvcHJpYXRlLlxuICBpZiAodHlwZW9mICgvLi8pICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgXy5pc0Z1bmN0aW9uID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gJ2Z1bmN0aW9uJztcbiAgICB9O1xuICB9XG5cbiAgLy8gSXMgYSBnaXZlbiBvYmplY3QgYSBmaW5pdGUgbnVtYmVyP1xuICBfLmlzRmluaXRlID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIGlzRmluaXRlKG9iaikgJiYgIWlzTmFOKHBhcnNlRmxvYXQob2JqKSk7XG4gIH07XG5cbiAgLy8gSXMgdGhlIGdpdmVuIHZhbHVlIGBOYU5gPyAoTmFOIGlzIHRoZSBvbmx5IG51bWJlciB3aGljaCBkb2VzIG5vdCBlcXVhbCBpdHNlbGYpLlxuICBfLmlzTmFOID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIF8uaXNOdW1iZXIob2JqKSAmJiBvYmogIT0gK29iajtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGEgYm9vbGVhbj9cbiAgXy5pc0Jvb2xlYW4gPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gb2JqID09PSB0cnVlIHx8IG9iaiA9PT0gZmFsc2UgfHwgdG9TdHJpbmcuY2FsbChvYmopID09ICdbb2JqZWN0IEJvb2xlYW5dJztcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGVxdWFsIHRvIG51bGw/XG4gIF8uaXNOdWxsID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gbnVsbDtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhcmlhYmxlIHVuZGVmaW5lZD9cbiAgXy5pc1VuZGVmaW5lZCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IHZvaWQgMDtcbiAgfTtcblxuICAvLyBTaG9ydGN1dCBmdW5jdGlvbiBmb3IgY2hlY2tpbmcgaWYgYW4gb2JqZWN0IGhhcyBhIGdpdmVuIHByb3BlcnR5IGRpcmVjdGx5XG4gIC8vIG9uIGl0c2VsZiAoaW4gb3RoZXIgd29yZHMsIG5vdCBvbiBhIHByb3RvdHlwZSkuXG4gIF8uaGFzID0gZnVuY3Rpb24ob2JqLCBrZXkpIHtcbiAgICByZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSk7XG4gIH07XG5cbiAgLy8gVXRpbGl0eSBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBSdW4gVW5kZXJzY29yZS5qcyBpbiAqbm9Db25mbGljdCogbW9kZSwgcmV0dXJuaW5nIHRoZSBgX2AgdmFyaWFibGUgdG8gaXRzXG4gIC8vIHByZXZpb3VzIG93bmVyLiBSZXR1cm5zIGEgcmVmZXJlbmNlIHRvIHRoZSBVbmRlcnNjb3JlIG9iamVjdC5cbiAgXy5ub0NvbmZsaWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgcm9vdC5fID0gcHJldmlvdXNVbmRlcnNjb3JlO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8vIEtlZXAgdGhlIGlkZW50aXR5IGZ1bmN0aW9uIGFyb3VuZCBmb3IgZGVmYXVsdCBpdGVyYXRvcnMuXG4gIF8uaWRlbnRpdHkgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcblxuICAvLyBSdW4gYSBmdW5jdGlvbiAqKm4qKiB0aW1lcy5cbiAgXy50aW1lcyA9IGZ1bmN0aW9uKG4sIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgdmFyIGFjY3VtID0gQXJyYXkoTWF0aC5tYXgoMCwgbikpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgaSsrKSBhY2N1bVtpXSA9IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgaSk7XG4gICAgcmV0dXJuIGFjY3VtO1xuICB9O1xuXG4gIC8vIFJldHVybiBhIHJhbmRvbSBpbnRlZ2VyIGJldHdlZW4gbWluIGFuZCBtYXggKGluY2x1c2l2ZSkuXG4gIF8ucmFuZG9tID0gZnVuY3Rpb24obWluLCBtYXgpIHtcbiAgICBpZiAobWF4ID09IG51bGwpIHtcbiAgICAgIG1heCA9IG1pbjtcbiAgICAgIG1pbiA9IDA7XG4gICAgfVxuICAgIHJldHVybiBtaW4gKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpO1xuICB9O1xuXG4gIC8vIExpc3Qgb2YgSFRNTCBlbnRpdGllcyBmb3IgZXNjYXBpbmcuXG4gIHZhciBlbnRpdHlNYXAgPSB7XG4gICAgZXNjYXBlOiB7XG4gICAgICAnJic6ICcmYW1wOycsXG4gICAgICAnPCc6ICcmbHQ7JyxcbiAgICAgICc+JzogJyZndDsnLFxuICAgICAgJ1wiJzogJyZxdW90OycsXG4gICAgICBcIidcIjogJyYjeDI3OydcbiAgICB9XG4gIH07XG4gIGVudGl0eU1hcC51bmVzY2FwZSA9IF8uaW52ZXJ0KGVudGl0eU1hcC5lc2NhcGUpO1xuXG4gIC8vIFJlZ2V4ZXMgY29udGFpbmluZyB0aGUga2V5cyBhbmQgdmFsdWVzIGxpc3RlZCBpbW1lZGlhdGVseSBhYm92ZS5cbiAgdmFyIGVudGl0eVJlZ2V4ZXMgPSB7XG4gICAgZXNjYXBlOiAgIG5ldyBSZWdFeHAoJ1snICsgXy5rZXlzKGVudGl0eU1hcC5lc2NhcGUpLmpvaW4oJycpICsgJ10nLCAnZycpLFxuICAgIHVuZXNjYXBlOiBuZXcgUmVnRXhwKCcoJyArIF8ua2V5cyhlbnRpdHlNYXAudW5lc2NhcGUpLmpvaW4oJ3wnKSArICcpJywgJ2cnKVxuICB9O1xuXG4gIC8vIEZ1bmN0aW9ucyBmb3IgZXNjYXBpbmcgYW5kIHVuZXNjYXBpbmcgc3RyaW5ncyB0by9mcm9tIEhUTUwgaW50ZXJwb2xhdGlvbi5cbiAgXy5lYWNoKFsnZXNjYXBlJywgJ3VuZXNjYXBlJ10sIGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgIF9bbWV0aG9kXSA9IGZ1bmN0aW9uKHN0cmluZykge1xuICAgICAgaWYgKHN0cmluZyA9PSBudWxsKSByZXR1cm4gJyc7XG4gICAgICByZXR1cm4gKCcnICsgc3RyaW5nKS5yZXBsYWNlKGVudGl0eVJlZ2V4ZXNbbWV0aG9kXSwgZnVuY3Rpb24obWF0Y2gpIHtcbiAgICAgICAgcmV0dXJuIGVudGl0eU1hcFttZXRob2RdW21hdGNoXTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH0pO1xuXG4gIC8vIElmIHRoZSB2YWx1ZSBvZiB0aGUgbmFtZWQgYHByb3BlcnR5YCBpcyBhIGZ1bmN0aW9uIHRoZW4gaW52b2tlIGl0IHdpdGggdGhlXG4gIC8vIGBvYmplY3RgIGFzIGNvbnRleHQ7IG90aGVyd2lzZSwgcmV0dXJuIGl0LlxuICBfLnJlc3VsdCA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHtcbiAgICBpZiAob2JqZWN0ID09IG51bGwpIHJldHVybiB2b2lkIDA7XG4gICAgdmFyIHZhbHVlID0gb2JqZWN0W3Byb3BlcnR5XTtcbiAgICByZXR1cm4gXy5pc0Z1bmN0aW9uKHZhbHVlKSA/IHZhbHVlLmNhbGwob2JqZWN0KSA6IHZhbHVlO1xuICB9O1xuXG4gIC8vIEFkZCB5b3VyIG93biBjdXN0b20gZnVuY3Rpb25zIHRvIHRoZSBVbmRlcnNjb3JlIG9iamVjdC5cbiAgXy5taXhpbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGVhY2goXy5mdW5jdGlvbnMob2JqKSwgZnVuY3Rpb24obmFtZSkge1xuICAgICAgdmFyIGZ1bmMgPSBfW25hbWVdID0gb2JqW25hbWVdO1xuICAgICAgXy5wcm90b3R5cGVbbmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBbdGhpcy5fd3JhcHBlZF07XG4gICAgICAgIHB1c2guYXBwbHkoYXJncywgYXJndW1lbnRzKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5jYWxsKHRoaXMsIGZ1bmMuYXBwbHkoXywgYXJncykpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBHZW5lcmF0ZSBhIHVuaXF1ZSBpbnRlZ2VyIGlkICh1bmlxdWUgd2l0aGluIHRoZSBlbnRpcmUgY2xpZW50IHNlc3Npb24pLlxuICAvLyBVc2VmdWwgZm9yIHRlbXBvcmFyeSBET00gaWRzLlxuICB2YXIgaWRDb3VudGVyID0gMDtcbiAgXy51bmlxdWVJZCA9IGZ1bmN0aW9uKHByZWZpeCkge1xuICAgIHZhciBpZCA9ICsraWRDb3VudGVyICsgJyc7XG4gICAgcmV0dXJuIHByZWZpeCA/IHByZWZpeCArIGlkIDogaWQ7XG4gIH07XG5cbiAgLy8gQnkgZGVmYXVsdCwgVW5kZXJzY29yZSB1c2VzIEVSQi1zdHlsZSB0ZW1wbGF0ZSBkZWxpbWl0ZXJzLCBjaGFuZ2UgdGhlXG4gIC8vIGZvbGxvd2luZyB0ZW1wbGF0ZSBzZXR0aW5ncyB0byB1c2UgYWx0ZXJuYXRpdmUgZGVsaW1pdGVycy5cbiAgXy50ZW1wbGF0ZVNldHRpbmdzID0ge1xuICAgIGV2YWx1YXRlICAgIDogLzwlKFtcXHNcXFNdKz8pJT4vZyxcbiAgICBpbnRlcnBvbGF0ZSA6IC88JT0oW1xcc1xcU10rPyklPi9nLFxuICAgIGVzY2FwZSAgICAgIDogLzwlLShbXFxzXFxTXSs/KSU+L2dcbiAgfTtcblxuICAvLyBXaGVuIGN1c3RvbWl6aW5nIGB0ZW1wbGF0ZVNldHRpbmdzYCwgaWYgeW91IGRvbid0IHdhbnQgdG8gZGVmaW5lIGFuXG4gIC8vIGludGVycG9sYXRpb24sIGV2YWx1YXRpb24gb3IgZXNjYXBpbmcgcmVnZXgsIHdlIG5lZWQgb25lIHRoYXQgaXNcbiAgLy8gZ3VhcmFudGVlZCBub3QgdG8gbWF0Y2guXG4gIHZhciBub01hdGNoID0gLyguKV4vO1xuXG4gIC8vIENlcnRhaW4gY2hhcmFjdGVycyBuZWVkIHRvIGJlIGVzY2FwZWQgc28gdGhhdCB0aGV5IGNhbiBiZSBwdXQgaW50byBhXG4gIC8vIHN0cmluZyBsaXRlcmFsLlxuICB2YXIgZXNjYXBlcyA9IHtcbiAgICBcIidcIjogICAgICBcIidcIixcbiAgICAnXFxcXCc6ICAgICAnXFxcXCcsXG4gICAgJ1xccic6ICAgICAncicsXG4gICAgJ1xcbic6ICAgICAnbicsXG4gICAgJ1xcdCc6ICAgICAndCcsXG4gICAgJ1xcdTIwMjgnOiAndTIwMjgnLFxuICAgICdcXHUyMDI5JzogJ3UyMDI5J1xuICB9O1xuXG4gIHZhciBlc2NhcGVyID0gL1xcXFx8J3xcXHJ8XFxufFxcdHxcXHUyMDI4fFxcdTIwMjkvZztcblxuICAvLyBKYXZhU2NyaXB0IG1pY3JvLXRlbXBsYXRpbmcsIHNpbWlsYXIgdG8gSm9obiBSZXNpZydzIGltcGxlbWVudGF0aW9uLlxuICAvLyBVbmRlcnNjb3JlIHRlbXBsYXRpbmcgaGFuZGxlcyBhcmJpdHJhcnkgZGVsaW1pdGVycywgcHJlc2VydmVzIHdoaXRlc3BhY2UsXG4gIC8vIGFuZCBjb3JyZWN0bHkgZXNjYXBlcyBxdW90ZXMgd2l0aGluIGludGVycG9sYXRlZCBjb2RlLlxuICBfLnRlbXBsYXRlID0gZnVuY3Rpb24odGV4dCwgZGF0YSwgc2V0dGluZ3MpIHtcbiAgICB2YXIgcmVuZGVyO1xuICAgIHNldHRpbmdzID0gXy5kZWZhdWx0cyh7fSwgc2V0dGluZ3MsIF8udGVtcGxhdGVTZXR0aW5ncyk7XG5cbiAgICAvLyBDb21iaW5lIGRlbGltaXRlcnMgaW50byBvbmUgcmVndWxhciBleHByZXNzaW9uIHZpYSBhbHRlcm5hdGlvbi5cbiAgICB2YXIgbWF0Y2hlciA9IG5ldyBSZWdFeHAoW1xuICAgICAgKHNldHRpbmdzLmVzY2FwZSB8fCBub01hdGNoKS5zb3VyY2UsXG4gICAgICAoc2V0dGluZ3MuaW50ZXJwb2xhdGUgfHwgbm9NYXRjaCkuc291cmNlLFxuICAgICAgKHNldHRpbmdzLmV2YWx1YXRlIHx8IG5vTWF0Y2gpLnNvdXJjZVxuICAgIF0uam9pbignfCcpICsgJ3wkJywgJ2cnKTtcblxuICAgIC8vIENvbXBpbGUgdGhlIHRlbXBsYXRlIHNvdXJjZSwgZXNjYXBpbmcgc3RyaW5nIGxpdGVyYWxzIGFwcHJvcHJpYXRlbHkuXG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICB2YXIgc291cmNlID0gXCJfX3ArPSdcIjtcbiAgICB0ZXh0LnJlcGxhY2UobWF0Y2hlciwgZnVuY3Rpb24obWF0Y2gsIGVzY2FwZSwgaW50ZXJwb2xhdGUsIGV2YWx1YXRlLCBvZmZzZXQpIHtcbiAgICAgIHNvdXJjZSArPSB0ZXh0LnNsaWNlKGluZGV4LCBvZmZzZXQpXG4gICAgICAgIC5yZXBsYWNlKGVzY2FwZXIsIGZ1bmN0aW9uKG1hdGNoKSB7IHJldHVybiAnXFxcXCcgKyBlc2NhcGVzW21hdGNoXTsgfSk7XG5cbiAgICAgIGlmIChlc2NhcGUpIHtcbiAgICAgICAgc291cmNlICs9IFwiJytcXG4oKF9fdD0oXCIgKyBlc2NhcGUgKyBcIikpPT1udWxsPycnOl8uZXNjYXBlKF9fdCkpK1xcbidcIjtcbiAgICAgIH1cbiAgICAgIGlmIChpbnRlcnBvbGF0ZSkge1xuICAgICAgICBzb3VyY2UgKz0gXCInK1xcbigoX190PShcIiArIGludGVycG9sYXRlICsgXCIpKT09bnVsbD8nJzpfX3QpK1xcbidcIjtcbiAgICAgIH1cbiAgICAgIGlmIChldmFsdWF0ZSkge1xuICAgICAgICBzb3VyY2UgKz0gXCInO1xcblwiICsgZXZhbHVhdGUgKyBcIlxcbl9fcCs9J1wiO1xuICAgICAgfVxuICAgICAgaW5kZXggPSBvZmZzZXQgKyBtYXRjaC5sZW5ndGg7XG4gICAgICByZXR1cm4gbWF0Y2g7XG4gICAgfSk7XG4gICAgc291cmNlICs9IFwiJztcXG5cIjtcblxuICAgIC8vIElmIGEgdmFyaWFibGUgaXMgbm90IHNwZWNpZmllZCwgcGxhY2UgZGF0YSB2YWx1ZXMgaW4gbG9jYWwgc2NvcGUuXG4gICAgaWYgKCFzZXR0aW5ncy52YXJpYWJsZSkgc291cmNlID0gJ3dpdGgob2JqfHx7fSl7XFxuJyArIHNvdXJjZSArICd9XFxuJztcblxuICAgIHNvdXJjZSA9IFwidmFyIF9fdCxfX3A9JycsX19qPUFycmF5LnByb3RvdHlwZS5qb2luLFwiICtcbiAgICAgIFwicHJpbnQ9ZnVuY3Rpb24oKXtfX3ArPV9fai5jYWxsKGFyZ3VtZW50cywnJyk7fTtcXG5cIiArXG4gICAgICBzb3VyY2UgKyBcInJldHVybiBfX3A7XFxuXCI7XG5cbiAgICB0cnkge1xuICAgICAgcmVuZGVyID0gbmV3IEZ1bmN0aW9uKHNldHRpbmdzLnZhcmlhYmxlIHx8ICdvYmonLCAnXycsIHNvdXJjZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgZS5zb3VyY2UgPSBzb3VyY2U7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cblxuICAgIGlmIChkYXRhKSByZXR1cm4gcmVuZGVyKGRhdGEsIF8pO1xuICAgIHZhciB0ZW1wbGF0ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHJldHVybiByZW5kZXIuY2FsbCh0aGlzLCBkYXRhLCBfKTtcbiAgICB9O1xuXG4gICAgLy8gUHJvdmlkZSB0aGUgY29tcGlsZWQgZnVuY3Rpb24gc291cmNlIGFzIGEgY29udmVuaWVuY2UgZm9yIHByZWNvbXBpbGF0aW9uLlxuICAgIHRlbXBsYXRlLnNvdXJjZSA9ICdmdW5jdGlvbignICsgKHNldHRpbmdzLnZhcmlhYmxlIHx8ICdvYmonKSArICcpe1xcbicgKyBzb3VyY2UgKyAnfSc7XG5cbiAgICByZXR1cm4gdGVtcGxhdGU7XG4gIH07XG5cbiAgLy8gQWRkIGEgXCJjaGFpblwiIGZ1bmN0aW9uLCB3aGljaCB3aWxsIGRlbGVnYXRlIHRvIHRoZSB3cmFwcGVyLlxuICBfLmNoYWluID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIF8ob2JqKS5jaGFpbigpO1xuICB9O1xuXG4gIC8vIE9PUFxuICAvLyAtLS0tLS0tLS0tLS0tLS1cbiAgLy8gSWYgVW5kZXJzY29yZSBpcyBjYWxsZWQgYXMgYSBmdW5jdGlvbiwgaXQgcmV0dXJucyBhIHdyYXBwZWQgb2JqZWN0IHRoYXRcbiAgLy8gY2FuIGJlIHVzZWQgT08tc3R5bGUuIFRoaXMgd3JhcHBlciBob2xkcyBhbHRlcmVkIHZlcnNpb25zIG9mIGFsbCB0aGVcbiAgLy8gdW5kZXJzY29yZSBmdW5jdGlvbnMuIFdyYXBwZWQgb2JqZWN0cyBtYXkgYmUgY2hhaW5lZC5cblxuICAvLyBIZWxwZXIgZnVuY3Rpb24gdG8gY29udGludWUgY2hhaW5pbmcgaW50ZXJtZWRpYXRlIHJlc3VsdHMuXG4gIHZhciByZXN1bHQgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gdGhpcy5fY2hhaW4gPyBfKG9iaikuY2hhaW4oKSA6IG9iajtcbiAgfTtcblxuICAvLyBBZGQgYWxsIG9mIHRoZSBVbmRlcnNjb3JlIGZ1bmN0aW9ucyB0byB0aGUgd3JhcHBlciBvYmplY3QuXG4gIF8ubWl4aW4oXyk7XG5cbiAgLy8gQWRkIGFsbCBtdXRhdG9yIEFycmF5IGZ1bmN0aW9ucyB0byB0aGUgd3JhcHBlci5cbiAgZWFjaChbJ3BvcCcsICdwdXNoJywgJ3JldmVyc2UnLCAnc2hpZnQnLCAnc29ydCcsICdzcGxpY2UnLCAndW5zaGlmdCddLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIG1ldGhvZCA9IEFycmF5UHJvdG9bbmFtZV07XG4gICAgXy5wcm90b3R5cGVbbmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBvYmogPSB0aGlzLl93cmFwcGVkO1xuICAgICAgbWV0aG9kLmFwcGx5KG9iaiwgYXJndW1lbnRzKTtcbiAgICAgIGlmICgobmFtZSA9PSAnc2hpZnQnIHx8IG5hbWUgPT0gJ3NwbGljZScpICYmIG9iai5sZW5ndGggPT09IDApIGRlbGV0ZSBvYmpbMF07XG4gICAgICByZXR1cm4gcmVzdWx0LmNhbGwodGhpcywgb2JqKTtcbiAgICB9O1xuICB9KTtcblxuICAvLyBBZGQgYWxsIGFjY2Vzc29yIEFycmF5IGZ1bmN0aW9ucyB0byB0aGUgd3JhcHBlci5cbiAgZWFjaChbJ2NvbmNhdCcsICdqb2luJywgJ3NsaWNlJ10sIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgbWV0aG9kID0gQXJyYXlQcm90b1tuYW1lXTtcbiAgICBfLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHJlc3VsdC5jYWxsKHRoaXMsIG1ldGhvZC5hcHBseSh0aGlzLl93cmFwcGVkLCBhcmd1bWVudHMpKTtcbiAgICB9O1xuICB9KTtcblxuICBfLmV4dGVuZChfLnByb3RvdHlwZSwge1xuXG4gICAgLy8gU3RhcnQgY2hhaW5pbmcgYSB3cmFwcGVkIFVuZGVyc2NvcmUgb2JqZWN0LlxuICAgIGNoYWluOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX2NoYWluID0gdHJ1ZTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvLyBFeHRyYWN0cyB0aGUgcmVzdWx0IGZyb20gYSB3cmFwcGVkIGFuZCBjaGFpbmVkIG9iamVjdC5cbiAgICB2YWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fd3JhcHBlZDtcbiAgICB9XG5cbiAgfSk7XG5cbn0pLmNhbGwodGhpcyk7XG4iLCJjbGFzcyBQb3NpdGlvblxuICAgIGNvbnN0cnVjdG9yOiAoQHBvcyA9IFswLCAwXSkgLT5cblxuY2xhc3MgU3RhdGljU3ByaXRlXG4gICAgY29uc3RydWN0b3I6IChAdXJsID0gXCJyZXNvdXJjZXMvc3VuLmdpZlwiLFxuICAgICAgICAgICAgICAgICAgQHBvcyA9IFswLCAwXSxcbiAgICAgICAgICAgICAgICAgIEBzaXplID0gWzEyOCwgMTI4XSkgLT5cblxuY2xhc3MgQW5pbWF0ZWRTcHJpdGVcbiAgICBjb25zdHJ1Y3RvcjogKEB1cmwgPSBcInJlc291cmNlcy9zdW4uZ2lmXCIsXG4gICAgICAgICAgICAgICAgICBAcG9zID0gWzAsIDBdLFxuICAgICAgICAgICAgICAgICAgQHNpemUgPSBbMTI4LCAxMjhdLFxuICAgICAgICAgICAgICAgICAgQHNwZWVkID0gMVxuICAgICAgICAgICAgICAgICAgQGRpciA9ICd2ZXJ0aWNhbCcsXG4gICAgICAgICAgICAgICAgICBAb25jZSA9IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgQGZyYW1lSW5kaWNlcyA9IFswXSkgLT5cbiAgICAgICAgQGluZGV4ID0gMFxuXG5jbGFzcyBDb2xvckJveFxuICAgIGNvbnN0cnVjdG9yOiAoQHNpemUgPSBbNTAsIDUwXSwgQGNvbG9yID0gJ3JlZCcpIC0+XG5cbmNsYXNzIFZlbG9jaXR5XG4gICAgY29uc3RydWN0b3I6IChAdmVjdG9yID0gWzAsIDBdKSAtPlxuXG5jbGFzcyBQbGF5ZXJDb250cm9sXG4gICAgY29uc3RydWN0b3I6IChAcGxheWVyU3BlZWQ9MTAwKSAtPlxuXG5jbGFzcyBUdXJuYWJsZVxuICAgIGNvbnN0cnVjdG9yOiAoQHNwcml0ZXMpIC0+XG5cbmNsYXNzIENyZWF0ZWRBdFxuICAgIGNvbnN0cnVjdG9yOiAoKSAtPlxuICAgICAgICBAY3JlYXRlZEF0ID0gRGF0ZS5ub3coKVxuXG5jbGFzcyBTdG9wc0FmdGVyXG4gICAgY29uc3RydWN0b3I6IChAdGltZSA9IDEwMDApIC0+XG5cbmNsYXNzIExpZmV0aW1lXG4gICAgY29uc3RydWN0b3I6IChAbGlmZXRpbWUgPSAxMCkgLT5cblxuY2xhc3MgUGxheWVyXG5jbGFzcyBFbmVteVxuXG5jbGFzcyBNb3ZlVG93YXJkUGxheWVyXG4gICAgY29uc3RydWN0b3I6IChAc3BlZWQgPSAxMCkgLT5cblxuY2xhc3MgQ29sbGlzaW9uXG4gICAgY29uc3RydWN0b3I6IChAc2hvdWxkQ29sbGlkZSA9ICgtPiB0cnVlKSwgQGRpZENvbGxpZGUgPSAoLT4pLCBAYm91bmRpbmdCb3hTaXplID0gWzUwLCA1MF0pIC0+XG5cbmNsYXNzIFNwZWxsY2FzdGVyXG4gICAgY29uc3RydWN0b3I6IChAc3BlbGxzKSAtPlxuXG5leHBvcnRzLlBvc2l0aW9uID0gUG9zaXRpb25cbmV4cG9ydHMuU3RhdGljU3ByaXRlID0gU3RhdGljU3ByaXRlXG5leHBvcnRzLkFuaW1hdGVkU3ByaXRlID0gQW5pbWF0ZWRTcHJpdGVcbmV4cG9ydHMuQ29sb3JCb3ggPSBDb2xvckJveFxuZXhwb3J0cy5WZWxvY2l0eSA9IFZlbG9jaXR5XG5leHBvcnRzLlBsYXllckNvbnRyb2wgPSBQbGF5ZXJDb250cm9sXG5leHBvcnRzLlR1cm5hYmxlID0gVHVybmFibGVcbmV4cG9ydHMuQ3JlYXRlZEF0ID0gQ3JlYXRlZEF0XG5leHBvcnRzLlN0b3BzQWZ0ZXIgPSBTdG9wc0FmdGVyXG5leHBvcnRzLkxpZmV0aW1lID0gTGlmZXRpbWVcbmV4cG9ydHMuUGxheWVyID0gUGxheWVyXG5leHBvcnRzLk1vdmVUb3dhcmRQbGF5ZXIgPSBNb3ZlVG93YXJkUGxheWVyXG5leHBvcnRzLkNvbGxpc2lvbiA9IENvbGxpc2lvblxuZXhwb3J0cy5TcGVsbGNhc3RlciA9IFNwZWxsY2FzdGVyXG5leHBvcnRzLkVuZW15ID0gRW5lbXlcbiIsIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlJ1xuRW5naW5lID0gcmVxdWlyZSAnLi9lbmdpbmUuY29mZmVlJ1xuUmVuZGVyZXIgPSByZXF1aXJlICcuL3JlbmRlcmVyLmNvZmZlZSdcblJlc291cmNlcyA9IHJlcXVpcmUgJy4vcmVzb3VyY2VzLmNvZmZlZSdcbmNvbXBvbmVudHMgPSByZXF1aXJlICcuL2NvbXBvbmVudHMuY29mZmVlJ1xudmVjdXRpbCA9IHJlcXVpcmUgJy4vdmVjdXRpbC5jb2ZmZWUnXG5cblBsYXllckNvbnRyb2xTeXN0ZW0gPSByZXF1aXJlICcuL3N5c3RlbXMvcGxheWVyQ29udHJvbC5jb2ZmZWUnXG5TcHJpdGVUdXJuaW5nU3lzdGVtID0gcmVxdWlyZSAnLi9zeXN0ZW1zL3Nwcml0ZVR1cm5pbmcuY29mZmVlJ1xuU3RvcEFmdGVyU3lzdGVtID0gcmVxdWlyZSAnLi9zeXN0ZW1zL3N0b3BBZnRlci5jb2ZmZWUnXG5QaHlzaWNzU3lzdGVtID0gcmVxdWlyZSAnLi9zeXN0ZW1zL3BoeXNpY3MuY29mZmVlJ1xuTGlmZXRpbWVTeXN0ZW0gPSByZXF1aXJlICcuL3N5c3RlbXMvbGlmZXRpbWUuY29mZmVlJ1xuTW92ZVRvd2FyZFBsYXllclN5c3RlbSA9IHJlcXVpcmUgJy4vc3lzdGVtcy9tb3ZlVG93YXJkUGxheWVyLmNvZmZlZSdcbkNvbGxpc2lvblN5c3RlbSA9IHJlcXVpcmUgJy4vc3lzdGVtcy9jb2xsaXNpb24uY29mZmVlJ1xuU3BlbGxjYXN0aW5nU3lzdGVtID0gcmVxdWlyZSAnLi9zeXN0ZW1zL3NwZWxsY2FzdGluZy5jb2ZmZWUnXG5cbmNyZWF0ZUVuZW15ID0gKHBvc2l0aW9uKSAtPlxuICAgIGVuZW15U2hvdWxkQ29sbGlkZSA9IChtZSwgdGhlbSkgLT5cbiAgICAgICAgXy5oYXMgdGhlbS5jb21wb25lbnRzLCAncGxheWVyJ1xuXG4gICAgZW5lbXlEaWRDb2xsaWRlID0gKG1lLCB0aGVtKSAtPlxuICAgICAgICBtZS5jb21wb25lbnRzLmNvbG9yYm94LmNvbG9yID0gJ2dyZWVuJ1xuXG4gICAgZW5naW5lLmNyZWF0ZUVudGl0eSBbXG4gICAgICAgIG5ldyBjb21wb25lbnRzLlBvc2l0aW9uKHBvc2l0aW9uKSxcbiAgICAgICAgbmV3IGNvbXBvbmVudHMuQ29sb3JCb3goWzUwLCA1MF0sICdtYWdlbnRhJyksXG4gICAgICAgIG5ldyBjb21wb25lbnRzLlZlbG9jaXR5KCksXG4gICAgICAgIG5ldyBjb21wb25lbnRzLk1vdmVUb3dhcmRQbGF5ZXIoMTApLFxuICAgICAgICBuZXcgY29tcG9uZW50cy5Db2xsaXNpb24oZW5lbXlTaG91bGRDb2xsaWRlLCBlbmVteURpZENvbGxpZGUpLFxuICAgICAgICBuZXcgY29tcG9uZW50cy5FbmVteSgpXG4gICAgXVxuXG5lbmdpbmVUaWNrID0gKGR0KSAtPlxuICAgIGlmIE1hdGgucmFuZG9tKCkgPCBkdCBhbmQgTWF0aC5yYW5kb20oKSA8IDAuNVxuICAgICAgICBwb3MgPSB2ZWN1dGlsLmFsb25nUGVyaW1ldGVyIFtbMCwgMF0sIHZlY3V0aWwuc3ViMmQoW2NhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodF0sIFsyMCwgMjBdKV0sIE1hdGgucmFuZG9tKClcbiAgICAgICAgY3JlYXRlRW5lbXkgcG9zXG5cbmNyZWF0ZUVuZ2luZSA9IChjYW52YXMpIC0+XG4gICAgd2luZG93LmNhbnZhcyA9IGNhbnZhcyAjZGVsZXRlbWVcbiAgICBlbmdpbmUgPSBuZXcgRW5naW5lIGVuZ2luZVRpY2tcbiAgICB3aW5kb3cucmVuZGVyZXIgPSBuZXcgUmVuZGVyZXIgY2FudmFzXG5cbiAgICBlbmdpbmUuYWRkU3lzdGVtIHJlbmRlcmVyLnN5c3RlbVxuXG4gICAgZW5naW5lLmJlZm9yZVRpY2sgPSByZW5kZXJlci5jbGVhckNhbnZhc1xuICAgIGVuZ2luZS5hZnRlclRpY2sgPSByZW5kZXJlci5kcmF3RnJhbWVyYXRlXG5cbiAgICBlbmdpbmUuYWRkU3lzdGVtKG5ldyBQaHlzaWNzU3lzdGVtKCkpXG4gICAgZW5naW5lLmFkZFN5c3RlbShuZXcgUGxheWVyQ29udHJvbFN5c3RlbSgpKVxuICAgIGVuZ2luZS5hZGRTeXN0ZW0obmV3IFNwcml0ZVR1cm5pbmdTeXN0ZW0oKSlcbiAgICBlbmdpbmUuYWRkU3lzdGVtKG5ldyBTdG9wQWZ0ZXJTeXN0ZW0oKSlcbiAgICBlbmdpbmUuYWRkU3lzdGVtKG5ldyBMaWZldGltZVN5c3RlbSgpKVxuICAgIGVuZ2luZS5hZGRTeXN0ZW0obmV3IE1vdmVUb3dhcmRQbGF5ZXJTeXN0ZW0oKSlcbiAgICBlbmdpbmUuYWRkU3lzdGVtKG5ldyBTcGVsbGNhc3RpbmdTeXN0ZW0oKSlcbiAgICB3aW5kb3cuY29sbGlzaW9uU3lzdGVtID0gbmV3IENvbGxpc2lvblN5c3RlbShbY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0XSlcbiAgICBlbmdpbmUuYWRkU3lzdGVtKGNvbGxpc2lvblN5c3RlbSlcblxuICAgIFJlc291cmNlcy5vblJlYWR5IC0+XG4gICAgICAgIGVuZ2luZS5zdGFydCgpXG5cbiAgICAgICAgIyBlbmdpbmUuY3JlYXRlRW50aXR5IFtcbiAgICAgICAgIyAgICAgbmV3IGNvbXBvbmVudHMuUG9zaXRpb24oWzIwMCwgMjAwXSksXG4gICAgICAgICMgICAgIG5ldyBjb21wb25lbnRzLlN0YXRpY1Nwcml0ZSgpXG4gICAgICAgICMgXVxuXG4gICAgICAgICMgZW5naW5lLmNyZWF0ZUVudGl0eSBbXG4gICAgICAgICMgICAgIG5ldyBjb21wb25lbnRzLlBvc2l0aW9uKFsyMDAsIDIwMF0pLFxuICAgICAgICAjICAgICBuZXcgY29tcG9uZW50cy5BbmltYXRlZFNwcml0ZSgncmVzb3VyY2VzL2RyYWdvbnNwcml0ZXMuZ2lmJyxcbiAgICAgICAgIyAgICAgICAgIFswLCAwXSwgWzc1LCA3MF0sIDEwLCAnaG9yaXonLCBmYWxzZSxcbiAgICAgICAgIyAgICAgICAgIFswLCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4XSksXG4gICAgICAgICMgICAgIG5ldyBjb21wb25lbnRzLlR1cm5hYmxlKFtcbiAgICAgICAgIyAgICAgICAgIG5ldyBjb21wb25lbnRzLkFuaW1hdGVkU3ByaXRlICdyZXNvdXJjZXMvZHJhZ29uc3ByaXRlcy5naWYnLFxuICAgICAgICAjICAgICAgICAgICAgIFswLCAwICogNzBdLCBbNzUsIDcwXSwgMTAsICdob3JpeicsIGZhbHNlLFxuICAgICAgICAjICAgICAgICAgICAgIFswLCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4XSxcbiAgICAgICAgIyAgICAgICAgIG5ldyBjb21wb25lbnRzLkFuaW1hdGVkU3ByaXRlICdyZXNvdXJjZXMvZHJhZ29uc3ByaXRlcy5naWYnLFxuICAgICAgICAjICAgICAgICAgICAgIFswLCA3ICogNzBdLCBbNzUsIDcwXSwgMTAsICdob3JpeicsIGZhbHNlLFxuICAgICAgICAjICAgICAgICAgICAgIFswLCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4XSxcbiAgICAgICAgIyAgICAgICAgIG5ldyBjb21wb25lbnRzLkFuaW1hdGVkU3ByaXRlICdyZXNvdXJjZXMvZHJhZ29uc3ByaXRlcy5naWYnLFxuICAgICAgICAjICAgICAgICAgICAgIFswLCA2ICogNzBdLCBbNzUsIDcwXSwgMTAsICdob3JpeicsIGZhbHNlLFxuICAgICAgICAjICAgICAgICAgICAgIFswLCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4XSxcbiAgICAgICAgIyAgICAgICAgIG5ldyBjb21wb25lbnRzLkFuaW1hdGVkU3ByaXRlICdyZXNvdXJjZXMvZHJhZ29uc3ByaXRlcy5naWYnLFxuICAgICAgICAjICAgICAgICAgICAgIFswLCA1ICogNzBdLCBbNzUsIDcwXSwgMTAsICdob3JpeicsIGZhbHNlLFxuICAgICAgICAjICAgICAgICAgICAgIFswLCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4XSxcbiAgICAgICAgIyAgICAgICAgIG5ldyBjb21wb25lbnRzLkFuaW1hdGVkU3ByaXRlICdyZXNvdXJjZXMvZHJhZ29uc3ByaXRlcy5naWYnLFxuICAgICAgICAjICAgICAgICAgICAgIFswLCA0ICogNzBdLCBbNzUsIDcwXSwgMTAsICdob3JpeicsIGZhbHNlLFxuICAgICAgICAjICAgICAgICAgICAgIFswLCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4XSxcbiAgICAgICAgIyAgICAgICAgIG5ldyBjb21wb25lbnRzLkFuaW1hdGVkU3ByaXRlICdyZXNvdXJjZXMvZHJhZ29uc3ByaXRlcy5naWYnLFxuICAgICAgICAjICAgICAgICAgICAgIFswLCAzICogNzBdLCBbNzUsIDcwXSwgMTAsICdob3JpeicsIGZhbHNlLFxuICAgICAgICAjICAgICAgICAgICAgIFswLCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4XSxcbiAgICAgICAgIyAgICAgICAgIG5ldyBjb21wb25lbnRzLkFuaW1hdGVkU3ByaXRlICdyZXNvdXJjZXMvZHJhZ29uc3ByaXRlcy5naWYnLFxuICAgICAgICAjICAgICAgICAgICAgIFswLCAyICogNzBdLCBbNzUsIDcwXSwgMTAsICdob3JpeicsIGZhbHNlLFxuICAgICAgICAjICAgICAgICAgICAgIFswLCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4XSxcbiAgICAgICAgIyAgICAgICAgIG5ldyBjb21wb25lbnRzLkFuaW1hdGVkU3ByaXRlICdyZXNvdXJjZXMvZHJhZ29uc3ByaXRlcy5naWYnLFxuICAgICAgICAjICAgICAgICAgICAgIFswLCAxICogNzBdLCBbNzUsIDcwXSwgMTAsICdob3JpeicsIGZhbHNlLFxuICAgICAgICAjICAgICAgICAgICAgIFswLCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4XV0pLFxuICAgICAgICAjICAgICBuZXcgY29tcG9uZW50cy5QbGF5ZXJDb250cm9sKCksXG4gICAgICAgICMgICAgIG5ldyBjb21wb25lbnRzLlZlbG9jaXR5KCksXG4gICAgICAgICMgICAgIG5ldyBjb21wb25lbnRzLkxpZmV0aW1lKDEwKVxuICAgICAgICAjIF1cbiAgICAgICAgXG4gICAgICAgIGNsYXNzIFNwZWxsXG4gICAgICAgICAgICBjb25zdHJ1Y3RvcjogKGNvbXBvbmVudHMpIC0+XG4gICAgICAgICAgICAgICAgQGVudGl0eSA9IGVuZ2luZS5jcmVhdGVFbnRpdHkgY29tcG9uZW50c1xuXG4gICAgICAgIGNsYXNzIEZpcmViYWxsIGV4dGVuZHMgU3BlbGxcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yOiAoY2FzdGVyLCB0YXJnZXQpIC0+XG4gICAgICAgICAgICAgICAgc3BlZWQgPSAzMDBcbiAgICAgICAgICAgICAgICB2ZWN0b3IgPSB2ZWN1dGlsLnN1YjJkIHRhcmdldCwgY2FzdGVyLmNvbXBvbmVudHMucG9zaXRpb24ucG9zXG4gICAgICAgICAgICAgICAgdmVjdG9yID0gdmVjdXRpbC5zY2FsZVRvIHZlY3Rvciwgc3BlZWRcblxuXG4gICAgICAgICAgICAgICAgc2hvdWxkQ29sbGlkZSA9IChtZSwgdGhlbSkgLT5cbiAgICAgICAgICAgICAgICAgICAgXy5oYXMgdGhlbS5jb21wb25lbnRzLCAnZW5lbXknXG5cbiAgICAgICAgICAgICAgICBkaWRDb2xsaWRlID0gKG1lLCB0aGVtKSAtPlxuICAgICAgICAgICAgICAgICAgICBtZS5kZXN0cm95KClcbiAgICAgICAgICAgICAgICAgICAgdGhlbS5kZXN0cm95KClcblxuICAgICAgICAgICAgICAgIHN1cGVyIFtcbiAgICAgICAgICAgICAgICAgICAgbmV3IGNvbXBvbmVudHMuUG9zaXRpb24oY2FzdGVyLmNvbXBvbmVudHMucG9zaXRpb24ucG9zLnNsaWNlKDApKSxcbiAgICAgICAgICAgICAgICAgICAgbmV3IGNvbXBvbmVudHMuQ29sb3JCb3goWzIwLCAyMF0sICdyZWQnKSxcbiAgICAgICAgICAgICAgICAgICAgbmV3IGNvbXBvbmVudHMuVmVsb2NpdHkodmVjdG9yKSxcbiAgICAgICAgICAgICAgICAgICAgbmV3IGNvbXBvbmVudHMuQ29sbGlzaW9uKHNob3VsZENvbGxpZGUsIGRpZENvbGxpZGUsIFsyMCwgMjBdKSxcbiAgICAgICAgICAgICAgICAgICAgbmV3IGNvbXBvbmVudHMuTGlmZXRpbWUoNSlcbiAgICAgICAgICAgICAgICBdXG5cbiAgICAgICAgcGxheWVyID0gZW5naW5lLmNyZWF0ZUVudGl0eSBbXG4gICAgICAgICAgICBuZXcgY29tcG9uZW50cy5Qb3NpdGlvbihbY2FudmFzLndpZHRoIC8gMiwgY2FudmFzLmhlaWdodCAvIDJdKSxcbiAgICAgICAgICAgIG5ldyBjb21wb25lbnRzLkNvbG9yQm94KFs1MCwgNTBdLCAnYmx1ZScpLFxuICAgICAgICAgICAgbmV3IGNvbXBvbmVudHMuVmVsb2NpdHkoKSxcbiAgICAgICAgICAgIG5ldyBjb21wb25lbnRzLlBsYXllckNvbnRyb2woKSxcbiAgICAgICAgICAgIG5ldyBjb21wb25lbnRzLlBsYXllcigpLFxuICAgICAgICAgICAgbmV3IGNvbXBvbmVudHMuQ29sbGlzaW9uKCksXG4gICAgICAgICAgICBuZXcgY29tcG9uZW50cy5TcGVsbGNhc3RlcihbRmlyZWJhbGxdKVxuICAgICAgICBdXG5cbiAgICBSZXNvdXJjZXMubG9hZCBbJ3Jlc291cmNlcy9zdW4uZ2lmJywgJ3Jlc291cmNlcy9kcmFnb25zcHJpdGVzLmdpZiddXG5cbiAgICByZXR1cm4gZW5naW5lXG5cbndpbmRvdy5jcmVhdGVFbmdpbmUgPSBjcmVhdGVFbmdpbmVcbiIsInV0aWwgPSByZXF1aXJlICcuL3V0aWwuY29mZmVlJ1xuRW50aXR5ID0gcmVxdWlyZSAnLi9lbnRpdHkuY29mZmVlJ1xuXG5jbGFzcyBFbmdpbmVcbiAgICBjb25zdHJ1Y3RvcjogKEB0aWNrRnVuY3Rpb24pIC0+XG4gICAgICAgIEBlbnRpdGllcyA9IHt9XG4gICAgICAgIEBzeXN0ZW1zID0gW11cblxuICAgICAgICBAbGFzdEVudGl0eUlkID0gMFxuXG4gICAgICAgIEBydW5uaW5nID0gZmFsc2VcbiAgICAgICAgQGxhc3RGcmFtZVRpbWUgPSBudWxsXG5cbiAgICBjcmVhdGVFbnRpdHk6IChjb21wb25lbnRzKSAtPlxuICAgICAgICAjIHRoZXJlIGhhcyB0byBiZSBhIHByZXR0aWVyIHdheSB0byBkbyB0aGlzXG4gICAgICAgIGNvbXBvbmVudHNPYmplY3QgPSB7fVxuICAgICAgICBjb21wb25lbnRzT2JqZWN0W3V0aWwua2V5Rm9yQ29tcG9uZW50KGMpXSA9IGMgZm9yIGMgaW4gY29tcG9uZW50c1xuXG4gICAgICAgIGlkID0gQGxhc3RFbnRpdHlJZFxuICAgICAgICBlbnRpdHkgPSBuZXcgRW50aXR5IGlkLCBjb21wb25lbnRzT2JqZWN0LCB0aGlzXG4gICAgICAgIEBlbnRpdGllc1tpZF0gPSBlbnRpdHlcbiAgICAgICAgc3lzdGVtLnVwZGF0ZUNhY2hlIGVudGl0eSBmb3Igc3lzdGVtIGluIEBzeXN0ZW1zXG4gICAgICAgIEBsYXN0RW50aXR5SWQgKz0gMVxuXG4gICAgICAgIHJldHVybiBlbnRpdHlcblxuICAgIHVwZGF0ZUVudGl0eTogKGVudGl0eSkgLT5cbiAgICAgICAgIyBUaGlzIG5lZWRzIHRvIGJlIGNhbGxlZCBvciB0aGUgc3lzdGVtcycgY2FjaGVzIHdvbid0IGJlIHVwZGF0ZWRcbiAgICAgICAgc3lzdGVtLnVwZGF0ZUNhY2hlIGVudGl0eSBmb3Igc3lzdGVtIGluIEBzeXN0ZW1zXG5cbiAgICBhZGRTeXN0ZW06IChzeXN0ZW0pIC0+XG4gICAgICAgIEBzeXN0ZW1zLnB1c2ggc3lzdGVtXG4gICAgICAgIHN5c3RlbS5idWlsZENhY2hlIEBlbnRpdGllc1xuXG4gICAgdGljazogKGR0KSAtPlxuICAgICAgICBzeXN0ZW0ucnVuIEBlbnRpdGllcywgZHQgZm9yIHN5c3RlbSBpbiBAc3lzdGVtc1xuICAgICAgICBAdGlja0Z1bmN0aW9uLmNhbGwgdGhpcywgZHRcblxuICAgIHJlbW92ZURlYWRFbnRpdGllczogLT5cbiAgICAgICAgZm9yIGlkLCBlbnRpdHkgb2YgQGVudGl0aWVzXG4gICAgICAgICAgICBpZiBlbnRpdHkuY29tcG9uZW50cy5kZXN0cm95P1xuICAgICAgICAgICAgICAgIGVudGl0eS5jb21wb25lbnRzID0gbnVsbFxuICAgICAgICAgICAgICAgIHN5c3RlbS51cGRhdGVDYWNoZSBlbnRpdHkgZm9yIHN5c3RlbSBpbiBAc3lzdGVtc1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBAZW50aXRpZXNbaWRdXG5cbiAgICBzdGFydDogLT5cbiAgICAgICAgQHJ1bm5pbmcgPSB0cnVlXG4gICAgICAgIEBsYXN0RnJhbWVUaW1lID0gbnVsbFxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgQGdhbWVMb29wXG5cbiAgICByZXNldDogLT5cbiAgICAgICAgIyBOb3Qgc3VyZSBpZiB0aGUgY2FuY2VsIGFuZCByZXJlcXVlc3QgaXMgbmVjZXNzYXJ5LCBvdGhlcndpc2UgaXQnc1xuICAgICAgICAjIHN1ZmZpY2llbnQgdG8ganVzdCByZXNldCBAZW50aXRpZXNcbiAgICAgICAgaWYgQHJhZklkP1xuICAgICAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUgQHJhZklkXG4gICAgICAgIEBlbnRpdGllcyA9IHt9XG4gICAgICAgIHN5c3RlbS5idWlsZENhY2hlKCkgZm9yIHN5c3RlbSBpbiBAc3lzdGVtc1xuICAgICAgICBAc3RhcnQoKVxuXG4gICAgZ2FtZUxvb3A6IChwYWludFRpbWUpID0+XG4gICAgICAgIGlmIEBsYXN0RnJhbWVUaW1lID09IG51bGxcbiAgICAgICAgICAgIEBsYXN0RnJhbWVUaW1lID0gcGFpbnRUaW1lXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGR0ID0gKHBhaW50VGltZSAtIEBsYXN0RnJhbWVUaW1lKSAvIDEwMDAuMFxuICAgICAgICAgICAgQGxhc3RGcmFtZVRpbWUgPSBwYWludFRpbWVcblxuICAgICAgICAgICAgQGJlZm9yZVRpY2s/KGR0KVxuICAgICAgICAgICAgQHRpY2sgZHRcbiAgICAgICAgICAgIEByZW1vdmVEZWFkRW50aXRpZXMoKVxuICAgICAgICAgICAgQGFmdGVyVGljaz8oZHQpXG5cbiAgICAgICAgICAgIHJlbmRlcmVyLmN0eC5zdHJva2VUZXh0IE9iamVjdC5rZXlzKEBlbnRpdGllcykubGVuZ3RoLCA0MDAsIDEwMFxuXG4gICAgICAgIEByYWZJZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSBAZ2FtZUxvb3AgaWYgQHJ1bm5pbmdcblxubW9kdWxlLmV4cG9ydHMgPSBFbmdpbmVcbiIsIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlJ1xudXRpbCA9IHJlcXVpcmUgJy4vdXRpbC5jb2ZmZWUnXG5cbmNsYXNzIEVudGl0eVxuICAgIGNvbnN0cnVjdG9yOiAoQGlkLCBAY29tcG9uZW50cywgQGVuZ2luZSkgLT5cblxuICAgIGFkZENvbXBvbmVudDogKGNvbXBvbmVudCkgLT5cbiAgICAgICAgaWYgQGNvbXBvbmVudHNcbiAgICAgICAgICAgIGNvbXBvbmVudE9iamVjdCA9IHt9XG4gICAgICAgICAgICBjb21wb25lbnRPYmplY3RbdXRpbC5rZXlGb3JDb21wb25lbnQoY29tcG9uZW50KV0gPSBjb21wb25lbnRcbiAgICAgICAgICAgIF8uZXh0ZW5kIEBjb21wb25lbnRzLCBjb21wb25lbnRPYmplY3RcbiAgICAgICAgICAgIEBlbmdpbmUudXBkYXRlRW50aXR5IHRoaXNcblxuICAgIHJlbW92ZUNvbXBvbmVudDogKGNvbXBvbmVudE5hbWUpIC0+XG4gICAgICAgIGlmIEBjb21wb25lbnRzXG4gICAgICAgICAgICBpZiBfLmhhcyBAY29tcG9uZW50cywgY29tcG9uZW50TmFtZVxuICAgICAgICAgICAgICAgIGRlbGV0ZSBAY29tcG9uZW50c1tjb21wb25lbnROYW1lXVxuICAgICAgICAgICAgICAgIEBlbmdpbmUudXBkYXRlRW50aXR5IHRoaXNcblxuICAgIGRlc3Ryb3k6IC0+XG4gICAgICAgIEBjb21wb25lbnRzLmRlc3Ryb3kgPSB0cnVlXG5cbiAgICB0b0pTT046IC0+XG4gICAgICAgIHtpZDogQGlkLCBjb21wb25lbnRzOiBAY29tcG9uZW50c31cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEVudGl0eVxuIiwiSW5wdXQgPSBkbyAtPlxuICAgIGtleXMgPSB7fVxuXG4gICAgc2V0S2V5ID0gKGV2ZW50LCBzdGF0dXMpIC0+XG4gICAgICAgIGNvZGUgPSBldmVudC5rZXlDb2RlXG5cbiAgICAgICAga2V5ID0gc3dpdGNoIGNvZGVcbiAgICAgICAgICAgIHdoZW4gMzIgdGhlbiBcIlNQQUNFXCJcbiAgICAgICAgICAgIHdoZW4gMzcgdGhlbiBcIkxFRlRcIlxuICAgICAgICAgICAgd2hlbiAzOCB0aGVuIFwiVVBcIlxuICAgICAgICAgICAgd2hlbiAzOSB0aGVuIFwiUklHSFRcIlxuICAgICAgICAgICAgd2hlbiA0MCB0aGVuIFwiRE9XTlwiXG4gICAgICAgICAgICB3aGVuIDE4NyB0aGVuIFwiK1wiXG4gICAgICAgICAgICB3aGVuIDE4OSB0aGVuIFwiLVwiXG4gICAgICAgICAgICBlbHNlIFN0cmluZy5mcm9tQ2hhckNvZGUgY29kZVxuXG4gICAgICAgIGtleXNba2V5XSA9IHN0YXR1c1xuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAna2V5ZG93bicsIChlKSAtPiBzZXRLZXkgZSwgdHJ1ZVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ2tleXVwJywgKGUpIC0+IHNldEtleSBlLCBmYWxzZVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ2JsdXInLCAtPiBrZXlzID0ge31cblxuICAgIG1vdXNlID0ge1xuICAgICAgICBpc0Rvd246IGZhbHNlLFxuICAgICAgICBwb3M6IFswLCAwXSxcbiAgICAgICAgcG9zUmVsYXRpdmVUbzogKGVsZW1lbnQpIC0+XG4gICAgICAgICAgICByZWN0ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICAgICAgcmV0dXJuIFtAcG9zWzBdIC0gcmVjdC5sZWZ0LCBAcG9zWzFdIC0gcmVjdC50b3BdXG4gICAgfVxuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2Vtb3ZlJywgKGUpIC0+XG4gICAgICAgIG1vdXNlLnBvc1swXSA9IGUueFxuICAgICAgICBtb3VzZS5wb3NbMV0gPSBlLnlcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyICdtb3VzZWRvd24nLCAoZSkgLT4gbW91c2UuaXNEb3duID0gdHJ1ZVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNldXAnLCAoZSkgLT4gbW91c2UuaXNEb3duID0gZmFsc2VcblxuICAgIHtcbiAgICAgICAgaXNEb3duOiAoa2V5KSAtPiBrZXlzW2tleS50b1VwcGVyQ2FzZSgpXSxcbiAgICAgICAgbW91c2U6IG1vdXNlXG4gICAgfVxuXG5tb2R1bGUuZXhwb3J0cyA9IElucHV0XG4iLCJyZWN0Q2VudGVyID0gKHJlY3QpIC0+XG4gICAgW3JlY3QueCArIHJlY3Qud2lkdGggLyAyLCByZWN0LnkgKyByZWN0LmhlaWdodCAvIDJdXG5cbnJlY3RDb3JuZXJzID0gKHJlY3QpIC0+XG4gICAgW1xuICAgICAgICBbeCwgeV0sXG4gICAgICAgIFt4ICsgd2lkdGgsIHldLFxuICAgICAgICBbeCwgeSArIGhlaWdodF0sXG4gICAgICAgIFt4ICsgd2lkdGgsIHkgKyBoZWlnaHRdXG4gICAgXVxuXG5yZWN0SW50ZXJzZWN0ID0gKHJlY3QxLCByZWN0MikgLT5cbiAgICAoTWF0aC5hYnMocmVjdDEueCArIHJlY3QxLndpZHRoLzIgLSByZWN0Mi54IC0gcmVjdDIud2lkdGgvMikgKiAyIDwgKHJlY3QxLndpZHRoICsgcmVjdDIud2lkdGgpKSBhbmRcbiAgICAgICAgKE1hdGguYWJzKHJlY3QxLnkgKyByZWN0MS5oZWlnaHQvMiAtIHJlY3QyLnkgLSByZWN0Mi5oZWlnaHQvMikgKiAyIDwgKHJlY3QxLmhlaWdodCArIHJlY3QyLmhlaWdodCkpXG5cbnFUcmVlVW5pcSA9IChhcnIpIC0+XG4gICAgc2VlbiA9IHt9XG4gICAgdW5pcXVlcyA9IFtdXG5cbiAgICBmb3IgeCBpbiBhcnJcbiAgICAgICAgaWYgIXNlZW5beC5fcXRyZWVpZF1cbiAgICAgICAgICAgIHVuaXF1ZXMucHVzaCB4XG4gICAgICAgICAgICBzZWVuW3guX3F0cmVlaWRdID0gdHJ1ZVxuICAgIHVuaXF1ZXNcblxuY2xhc3MgTm9kZVxuICAgIE5FID0gMFxuICAgIE5XID0gMVxuICAgIFNXID0gMlxuICAgIFNFID0gM1xuXG4gICAgY29uc3RydWN0b3I6IChAcmVjdCwgQGRlcHRoLCBAbWF4RGVwdGgsIEBtYXhDaGlsZHJlbikgLT5cbiAgICAgICAgQGNoaWxkcmVuID0gW11cbiAgICAgICAgQG5vZGVzID0gW11cblxuICAgICAgICBAbXlDbGFzcyA9IE5vZGVcblxuICAgICAgICBAbmV4dElkID0gMFxuXG4gICAgX2JpbjogKGl0ZW0pIC0+XG4gICAgICAgIGNlbnRlciA9IHJlY3RDZW50ZXIgQHJlY3RcblxuICAgICAgICBpZiBpdGVtLnggPCBjZW50ZXJbMF1cbiAgICAgICAgICAgIGlmIGl0ZW0ueSA8IGNlbnRlclsxXVxuICAgICAgICAgICAgICAgIE5XXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgU1dcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgaXRlbS55IDwgY2VudGVyWzFdXG4gICAgICAgICAgICAgICAgTkVcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBTRVxuXG4gICAgaW5zZXJ0OiAoaXRlbSkgLT5cbiAgICAgICAgaXRlbS5fcXRyZWVpZCA9IEBuZXh0SWQrK1xuICAgICAgICBpZiBAbm9kZXMubGVuZ3RoXG4gICAgICAgICAgICBAbm9kZXNbQF9iaW4oaXRlbSldLmluc2VydCBpdGVtXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBjaGlsZHJlbi5wdXNoIGl0ZW1cblxuICAgICAgICAgICAgaWYgQGNoaWxkcmVuLmxlbmd0aCA+IEBtYXhDaGlsZHJlbiBhbmQgQGRlcHRoIDwgQG1heERlcHRoXG4gICAgICAgICAgICAgICAgQHN1YmRpdmlkZSgpXG5cbiAgICAgICAgICAgICAgICBAaW5zZXJ0IGl0ZW0gZm9yIGl0ZW0gaW4gQGNoaWxkcmVuXG5cbiAgICAgICAgICAgICAgICBAY2hpbGRyZW4ubGVuZ3RoID0gMFxuXG4gICAgcmV0cmlldmU6IChpdGVtKSAtPlxuICAgICAgICBpZiBAbm9kZXMubGVuZ3RoXG4gICAgICAgICAgICBAbm9kZXNbQF9iaW4oaXRlbSldLnJldHJpZXZlIGl0ZW1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGNoaWxkcmVuXG5cbiAgICBzdWJkaXZpZGU6IC0+XG4gICAgICAgIGhhbGZXaWR0aCA9IEByZWN0LndpZHRoIC8gMlxuICAgICAgICBoYWxmSGVpZ2h0ID0gQHJlY3QuaGVpZ2h0IC8gMlxuICAgICAgICBbY2VudGVyWCwgY2VudGVyWV0gPSByZWN0Q2VudGVyIEByZWN0XG5cbiAgICAgICAgQG5vZGVzW05FXSA9IG5ldyBAbXlDbGFzcyhcbiAgICAgICAgICAgIHt4OiBjZW50ZXJYLCB5OiBAcmVjdC55LCB3aWR0aDogaGFsZldpZHRoLCBoZWlnaHQ6IGhhbGZIZWlnaHR9LFxuICAgICAgICAgICAgQGRlcHRoICsgMSwgQG1heERlcHRoLCBAbWF4Q2hpbGRyZW4pXG4gICAgICAgIEBub2Rlc1tOV10gPSBuZXcgQG15Q2xhc3MoXG4gICAgICAgICAgICB7eDogQHJlY3QueCwgeTogQHJlY3QueSwgd2lkdGg6IGhhbGZXaWR0aCwgaGVpZ2h0OiBoYWxmSGVpZ2h0fSxcbiAgICAgICAgICAgIEBkZXB0aCArIDEsIEBtYXhEZXB0aCwgQG1heENoaWxkcmVuKVxuICAgICAgICBAbm9kZXNbU1ddID0gbmV3IEBteUNsYXNzKFxuICAgICAgICAgICAge3g6IEByZWN0LngsIHk6IGNlbnRlclksIHdpZHRoOiBoYWxmV2lkdGgsIGhlaWdodDogaGFsZkhlaWdodH0sXG4gICAgICAgICAgICBAZGVwdGggKyAxLCBAbWF4RGVwdGgsIEBtYXhDaGlsZHJlbilcbiAgICAgICAgQG5vZGVzW1NFXSA9IG5ldyBAbXlDbGFzcyhcbiAgICAgICAgICAgIHt4OiBjZW50ZXJYLCB5OiBjZW50ZXJZLCB3aWR0aDogaGFsZldpZHRoLCBoZWlnaHQ6IGhhbGZIZWlnaHR9LFxuICAgICAgICAgICAgQGRlcHRoICsgMSwgQG1heERlcHRoLCBAbWF4Q2hpbGRyZW4pXG5cbiAgICBjbGVhcjogLT5cbiAgICAgICAgQGNoaWxkcmVuLmxlbmd0aCA9IDBcbiAgICAgICAgbm9kZS5jbGVhcigpIGZvciBub2RlIGluIEBub2Rlc1xuICAgICAgICBAbm9kZXMubGVuZ3RoID0gMFxuXG5cbmNsYXNzIEJvdW5kTm9kZSBleHRlbmRzIE5vZGVcbiAgICBjb25zdHJ1Y3RvcjogKHJlY3QsIGRlcHRoLCBtYXhEZXB0aCwgbWF4Q2hpbGRyZW4pIC0+XG4gICAgICAgIHN1cGVyIHJlY3QsIGRlcHRoLCBtYXhEZXB0aCwgbWF4Q2hpbGRyZW5cbiAgICAgICAgQG15Q2xhc3MgPSBCb3VuZE5vZGVcblxuICAgIGluc2VydDogKGl0ZW0pIC0+XG4gICAgICAgIGlmIGl0ZW0uX3F0cmVlaWQgPT0gdW5kZWZpbmVkXG4gICAgICAgICAgICBpdGVtLl9xdHJlZWlkID0gQG5leHRJZCsrXG4gICAgICAgIGlmIEBub2Rlcy5sZW5ndGhcbiAgICAgICAgICAgIGZvciBub2RlIGluIEBub2Rlc1xuICAgICAgICAgICAgICAgIGlmIHJlY3RJbnRlcnNlY3Qgbm9kZS5yZWN0LCBpdGVtXG4gICAgICAgICAgICAgICAgICAgIG5vZGUuaW5zZXJ0IGl0ZW1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGNoaWxkcmVuLnB1c2ggaXRlbVxuXG4gICAgICAgICAgICBpZiBAY2hpbGRyZW4ubGVuZ3RoID4gQG1heENoaWxkcmVuIGFuZCBAZGVwdGggPCBAbWF4RGVwdGhcbiAgICAgICAgICAgICAgICBAc3ViZGl2aWRlKClcblxuICAgICAgICAgICAgICAgIEBpbnNlcnQgaXRlbSBmb3IgaXRlbSBpbiBAY2hpbGRyZW5cblxuICAgICAgICAgICAgICAgIEBjaGlsZHJlbi5sZW5ndGggPSAwXG5cbiAgICByZXRyaWV2ZTogKGl0ZW0pIC0+XG4gICAgICAgIGlmIEBub2Rlcy5sZW5ndGhcbiAgICAgICAgICAgIGl0ZW1zID0gW11cbiAgICAgICAgICAgIGZvciBub2RlIGluIEBub2Rlc1xuICAgICAgICAgICAgICAgIGlmIHJlY3RJbnRlcnNlY3Qgbm9kZS5yZWN0LCBpdGVtXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2guYXBwbHkgaXRlbXMsIG5vZGUucmV0cmlldmUoaXRlbSlcbiAgICAgICAgICAgIHFUcmVlVW5pcSBpdGVtc1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAY2hpbGRyZW5cblxuXG5jbGFzcyBRdWFkVHJlZVxuICAgIGNvbnN0cnVjdG9yOiAocmVjdCwgbWF4RGVwdGggPSAxMCwgbWF4Q2hpbGRyZW4gPSAxMCkgLT5cbiAgICAgICAgQHJvb3QgPSBuZXcgTm9kZSByZWN0LCAwLCBtYXhEZXB0aCwgbWF4Q2hpbGRyZW5cblxuICAgIGluc2VydDogKGl0ZW1PckFycmF5KSAtPlxuICAgICAgICBpZiBpdGVtT3JBcnJheSBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICBAcm9vdC5pbnNlcnQgaXRlbSBmb3IgaXRlbSBpbiBpdGVtT3JBcnJheVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAcm9vdC5pbnNlcnQgaXRlbU9yQXJyYXlcblxuICAgIGNsZWFyOiAtPlxuICAgICAgICBAcm9vdC5jbGVhcigpXG5cbiAgICByZXRyaWV2ZTogKGl0ZW0pIC0+XG4gICAgICAgIEByb290LnJldHJpZXZlKGl0ZW0pLnNsaWNlKDApXG5cblxuY2xhc3MgQm91bmRRdWFkVHJlZSBleHRlbmRzIFF1YWRUcmVlXG4gICAgY29uc3RydWN0b3I6IChyZWN0LCBtYXhEZXB0aCA9IDEwLCBtYXhDaGlsZHJlbiA9IDEwKSAtPlxuICAgICAgICBAcm9vdCA9IG5ldyBCb3VuZE5vZGUgcmVjdCwgMCwgbWF4RGVwdGgsIG1heENoaWxkcmVuXG5cbmV4cG9ydHMuUXVhZFRyZWUgPSBRdWFkVHJlZVxuZXhwb3J0cy5Cb3VuZFF1YWRUcmVlID0gQm91bmRRdWFkVHJlZVxuIiwiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUnXG5SZXNvdXJjZXMgPSByZXF1aXJlICcuL3Jlc291cmNlcy5jb2ZmZWUnXG5zeXN0ZW0gPSByZXF1aXJlICcuL3N5c3RlbS5jb2ZmZWUnXG51dGlsID0gcmVxdWlyZSAnLi91dGlsLmNvZmZlZSdcblxuY2xhc3MgUmVuZGVyZXJcbiAgICBjb25zdHJ1Y3RvcjogKGNhbnZhcykgLT5cbiAgICAgICAgQGNhbnZhcyA9IGNhbnZhc1xuICAgICAgICBAY3R4ID0gY2FudmFzLmdldENvbnRleHQgJzJkJ1xuXG4gICAgICAgIGNsYXNzIFN0YXRpY1JlbmRlcmluZ1N5c3RlbSBleHRlbmRzIHN5c3RlbS5CYXNpY1N5c3RlbVxuICAgICAgICAgICAgY29uc3RydWN0b3I6IChAY3R4KSAtPlxuICAgICAgICAgICAgICAgIHN1cGVyIFsncG9zaXRpb24nLCAnc3RhdGljc3ByaXRlJ11cblxuICAgICAgICAgICAgYWN0aW9uOiAoZW50aXR5LCBkdCkgLT5cbiAgICAgICAgICAgICAgICBwb3NpdGlvbiA9IGVudGl0eS5jb21wb25lbnRzLnBvc2l0aW9uXG4gICAgICAgICAgICAgICAgc3RhdGljU3ByaXRlID0gZW50aXR5LmNvbXBvbmVudHMuc3RhdGljc3ByaXRlXG5cbiAgICAgICAgICAgICAgICBAY3R4LmRyYXdJbWFnZSBSZXNvdXJjZXMuZ2V0KHN0YXRpY1Nwcml0ZS51cmwpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0aWNTcHJpdGUucG9zWzBdLCBzdGF0aWNTcHJpdGUucG9zWzFdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0aWNTcHJpdGUuc2l6ZVswXSwgc3RhdGljU3ByaXRlLnNpemVbMV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uLnBvc1swXSwgcG9zaXRpb24ucG9zWzFdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0aWNTcHJpdGUuc2l6ZVswXSwgc3RhdGljU3ByaXRlLnNpemVbMV1cblxuXG4gICAgICAgIGNsYXNzIEFuaW1hdGVkUmVuZGVyaW5nU3lzdGVtIGV4dGVuZHMgc3lzdGVtLkJhc2ljU3lzdGVtXG4gICAgICAgICAgICBjb25zdHJ1Y3RvcjogKEBjdHgpIC0+XG4gICAgICAgICAgICAgICAgc3VwZXIgWydwb3NpdGlvbicsICdhbmltYXRlZHNwcml0ZSddXG5cbiAgICAgICAgICAgIGFjdGlvbjogKGVudGl0eSwgZHQpIC0+XG4gICAgICAgICAgICAgICAgcG9zaXRpb24gPSBlbnRpdHkuY29tcG9uZW50cy5wb3NpdGlvblxuICAgICAgICAgICAgICAgIGFuaW1hdGVkU3ByaXRlID0gZW50aXR5LmNvbXBvbmVudHMuYW5pbWF0ZWRzcHJpdGVcblxuICAgICAgICAgICAgICAgIGlmIGFuaW1hdGVkU3ByaXRlLnNwZWVkID4gMFxuICAgICAgICAgICAgICAgICAgICBpZHggPSBNYXRoLmZsb29yKFxuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZWRTcHJpdGUuaW5kZXggKz0gYW5pbWF0ZWRTcHJpdGUuc3BlZWQgKiBkdClcbiAgICAgICAgICAgICAgICAgICAgbWF4ID0gYW5pbWF0ZWRTcHJpdGUuZnJhbWVJbmRpY2VzLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICBmcmFtZUluZGV4ID0gYW5pbWF0ZWRTcHJpdGUuZnJhbWVJbmRpY2VzW2lkeCAlIG1heF1cblxuICAgICAgICAgICAgICAgICAgICBpZiBhbmltYXRlZFNwcml0ZS5vbmNlIGFuZCBpZHggPiBtYXhcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGVkU3ByaXRlLmRvbmUgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAjIERvbid0IGRyYXdcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgZnJhbWVJbmRleCA9IDBcblxuICAgICAgICAgICAgICAgIHNwcml0ZVBvc2l0aW9uID0gYW5pbWF0ZWRTcHJpdGUucG9zLnNsaWNlKClcbiAgICAgICAgICAgICAgICB4eVN3aXRjaCA9IGlmIGFuaW1hdGVkU3ByaXRlLmRpciA9PSAndmVydGljYWwnIHRoZW4gMSBlbHNlIDBcbiAgICAgICAgICAgICAgICBzcHJpdGVQb3NpdGlvblt4eVN3aXRjaF0gKz1cbiAgICAgICAgICAgICAgICAgICAgZnJhbWVJbmRleCAqIGFuaW1hdGVkU3ByaXRlLnNpemVbeHlTd2l0Y2hdXG5cbiAgICAgICAgICAgICAgICBAY3R4LmRyYXdJbWFnZSBSZXNvdXJjZXMuZ2V0KGFuaW1hdGVkU3ByaXRlLnVybCksXG4gICAgICAgICAgICAgICAgICAgIHNwcml0ZVBvc2l0aW9uWzBdLCBzcHJpdGVQb3NpdGlvblsxXSxcbiAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZWRTcHJpdGUuc2l6ZVswXSwgYW5pbWF0ZWRTcHJpdGUuc2l6ZVsxXSxcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb24ucG9zWzBdLCBwb3NpdGlvbi5wb3NbMV1cbiAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZWRTcHJpdGUuc2l6ZVswXSwgYW5pbWF0ZWRTcHJpdGUuc2l6ZVsxXVxuXG5cbiAgICAgICAgY2xhc3MgQ29sb3JCb3hSZW5kZXJpbmdTeXN0ZW0gZXh0ZW5kcyBzeXN0ZW0uQmFzaWNTeXN0ZW1cbiAgICAgICAgICAgIGNvbnN0cnVjdG9yOiAoQGN0eCkgLT5cbiAgICAgICAgICAgICAgICBzdXBlciBbJ3Bvc2l0aW9uJywgJ2NvbG9yYm94J11cblxuICAgICAgICAgICAgYWN0aW9uOiAoZW50aXR5KSAtPlxuICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gZW50aXR5LmNvbXBvbmVudHMucG9zaXRpb25cbiAgICAgICAgICAgICAgICBjb2xvcmJveCA9IGVudGl0eS5jb21wb25lbnRzLmNvbG9yYm94XG5cbiAgICAgICAgICAgICAgICBAY3R4LnNhdmUoKVxuICAgICAgICAgICAgICAgIEBjdHguc2V0RmlsbENvbG9yKGNvbG9yYm94LmNvbG9yKVxuICAgICAgICAgICAgICAgIEBjdHguZmlsbFJlY3QocG9zaXRpb24ucG9zWzBdLCBwb3NpdGlvbi5wb3NbMV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcmJveC5zaXplWzBdLCBjb2xvcmJveC5zaXplWzFdKVxuICAgICAgICAgICAgICAgIEBjdHgucmVzdG9yZSgpXG5cbiAgICAgICAgQHN5c3RlbSA9IG5ldyBzeXN0ZW0uQ29tcHNpdGVTeXN0ZW0oXG4gICAgICAgICAgICBuZXcgU3RhdGljUmVuZGVyaW5nU3lzdGVtKEBjdHgpLFxuICAgICAgICAgICAgbmV3IEFuaW1hdGVkUmVuZGVyaW5nU3lzdGVtKEBjdHgpLFxuICAgICAgICAgICAgbmV3IENvbG9yQm94UmVuZGVyaW5nU3lzdGVtKEBjdHgpKVxuXG4gICAgICAgIEBjbGVhckNhbnZhcyA9IChkdCkgPT5cbiAgICAgICAgICAgIEBjdHguZmlsbFN0eWxlID0gXCJsaWdodGdyZXlcIlxuICAgICAgICAgICAgQGN0eC5maWxsUmVjdCAwLCAwLCBAY2FudmFzLndpZHRoLCBAY2FudmFzLmhlaWdodFxuXG4gICAgICAgIEBkcmF3RnJhbWVyYXRlID0gKGR0KSA9PlxuICAgICAgICAgICAgQHVwZGF0ZUFuZERyYXdGcmFtZXJhdGUgZHQgaWYgQHNob3dGcmFtZXJhdGVcblxuICAgICAgICBAZnJhbWVyYXRlcyA9IFtdXG4gICAgICAgIEBzaG93RnJhbWVyYXRlID0gdHJ1ZVxuXG4gICAgdG9nZ2xlRnJhbWVyYXRlOiAtPlxuICAgICAgICBAc2hvd0ZyYW1lcmF0ZSA9ICFAc2hvd0ZyYW1lcmF0ZVxuXG4gICAgdXBkYXRlQW5kRHJhd0ZyYW1lcmF0ZTogKGR0KSAtPlxuICAgICAgICBkcmF3RnJhbWVyYXRlID0gPT5cbiAgICAgICAgICAgIEBjdHguc2F2ZSgpXG4gICAgICAgICAgICBAY3R4LmZpbGxTdHlsZSA9IFwiYmxhY2tcIlxuICAgICAgICAgICAgQGN0eC5mb250ID0gXCIzMHB4IHNhbnMtc2VyaWZcIlxuICAgICAgICAgICAgQGN0eC5maWxsVGV4dCB1dGlsLmF2ZXJhZ2UoQGZyYW1lcmF0ZXMpLnRvRml4ZWQoMSksIDUwLCA1MFxuICAgICAgICAgICAgQGN0eC5yZXN0b3JlKClcbiAgICAgICAgQGZyYW1lcmF0ZXMucHVzaCgxL2R0KVxuICAgICAgICB3aGlsZSBAZnJhbWVyYXRlcy5sZW5ndGggPiAxMFxuICAgICAgICAgICAgQGZyYW1lcmF0ZXMuc2hpZnQoKVxuICAgICAgICBkcmF3RnJhbWVyYXRlKClcblxuICAgIGRyYXdRdWFkVHJlZU5vZGU6IChub2RlKSAtPlxuICAgICAgICBAZHJhd1F1YWRUcmVlTm9kZSBuIGZvciBuIGluIG5vZGUubm9kZXNcbiAgICAgICAgcmVjdCA9IG5vZGUucmVjdFxuICAgICAgICBAY3R4LnN0cm9rZVJlY3QgcmVjdC54LCByZWN0LnksIHJlY3Qud2lkdGgsIHJlY3QuaGVpZ2h0XG4gICAgICAgIEBjdHguc3Ryb2tlVGV4dCBub2RlLmNoaWxkcmVuLmxlbmd0aCwgcmVjdC54ICsgcmVjdC53aWR0aC8yLCByZWN0LnkgKyByZWN0LmhlaWdodC8yXG5cbm1vZHVsZS5leHBvcnRzID0gUmVuZGVyZXJcbiIsIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlJ1xuXG53aW5kb3cuaW1ncyA9IFtdXG5SZXNvdXJjZXMgPSBkbyAtPlxuICAgIHJlc291cmNlcyA9IHt9XG4gICAgY2FsbGJhY2tzID0gW11cblxuICAgIHJlYWR5ID0gLT5cbiAgICAgICAgXy5hbGwgXy52YWx1ZXMocmVzb3VyY2VzKVxuXG4gICAgX2xvYWQgPSAodXJsKSAtPlxuICAgICAgICBpZiByZXNvdXJjZXNbdXJsXVxuICAgICAgICAgICAgcmV0dXJuIHJlc291cmNlc1t1cmxdXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGltZyA9IG5ldyBJbWFnZSgpXG4gICAgICAgICAgICB3aW5kb3cuaW1ncy5wdXNoIGltZ1xuICAgICAgICAgICAgaW1nLm9ubG9hZCA9IC0+XG4gICAgICAgICAgICAgICAgcmVzb3VyY2VzW3VybF0gPSBpbWdcbiAgICAgICAgICAgICAgICBpZiByZWFkeSgpXG4gICAgICAgICAgICAgICAgICAgIGNiKCkgZm9yIGNiIGluIGNhbGxiYWNrc1xuICAgICAgICAgICAgcmVzb3VyY2VzW3VybF0gPSBmYWxzZVxuICAgICAgICAgICAgXy5kZWZlcigtPiBpbWcuc3JjID0gdXJsKVxuXG4gICAgbG9hZCA9ICh1cmxPckFycmF5KSAtPlxuICAgICAgICBpZiB1cmxPckFycmF5IGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgIF9sb2FkIHVybCBmb3IgdXJsIGluIHVybE9yQXJyYXlcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgX2xvYWQgdXJsT3JBcnJheVxuXG4gICAgZ2V0ID0gKHVybCkgLT4gcmVzb3VyY2VzW3VybF1cblxuICAgIG9uUmVhZHkgPSAoY2FsbGJhY2spIC0+XG4gICAgICAgIGNhbGxiYWNrcy5wdXNoIGNhbGxiYWNrXG4gICAgICAgIGlmIHJlYWR5KCkgYW5kICEgXy5pc0VtcHR5IHJlc291cmNlc1xuICAgICAgICAgICAgY2FsbGJhY2soKVxuXG4gICAge1xuICAgICAgICBsb2FkOiBsb2FkLFxuICAgICAgICBnZXQ6IGdldCxcbiAgICAgICAgb25SZWFkeTogb25SZWFkeVxuICAgIH1cblxubW9kdWxlLmV4cG9ydHMgPSBSZXNvdXJjZXNcbiIsIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlJ1xuXG5jbGFzcyBTeXN0ZW1cbiAgICBjb25zdHJ1Y3RvcjogLT5cbiAgICAgICAgQGNhY2hlID0ge31cblxuICAgIGJ1aWxkQ2FjaGU6IChlbnRpdGllcykgLT5cbiAgICAgICAgQGNsZWFyQ2FjaGUoKVxuICAgICAgICBAdXBkYXRlQ2FjaGUgZW50aXR5IGZvciBpZCwgZW50aXR5IG9mIGVudGl0aWVzXG5cbiAgICBjbGVhckNhY2hlOiAtPlxuICAgICAgICBAY2FjaGUgPSB7fVxuXG4gICAgdXBkYXRlQ2FjaGU6IChlbnRpdHkpIC0+XG4gICAgICAgICMgaWYgY29tcG9uZW50cyBpcyBmYWxzZXksIHdlIG5lZWQgdG8gZGVsZXRlIHRoZSBlbnRpdHlcbiAgICAgICAgaWYgIWVudGl0eS5jb21wb25lbnRzIG9yICFAc2F0aXNmaWVzIGVudGl0eS5jb21wb25lbnRzXG4gICAgICAgICAgICBpZiBfLmhhcyBAY2FjaGUsIGVudGl0eS5pZFxuICAgICAgICAgICAgICAgIGRlbGV0ZSBAY2FjaGVbZW50aXR5LmlkXVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAY2FjaGVbZW50aXR5LmlkXSA9IHRydWVcblxuICAgIHJ1bjogKGVudGl0aWVzLCBkdCkgLT5cbiAgICAgICAgQGFjdGlvbiBlbnRpdGllc1tpZF0sIGR0LCBlbnRpdGllcyBmb3IgaWQgaW4gXy5rZXlzKEBjYWNoZSlcblxuICAgIGFjdGlvbjogKGVudGl0eSwgZHQsIGVudGl0aWVzKS0+XG5cbiAgICBzYXRpc2ZpZXM6IC0+IGZhbHNlXG5cblxuY2xhc3MgQmFzaWNTeXN0ZW0gZXh0ZW5kcyBTeXN0ZW1cbiAgICBjb25zdHJ1Y3RvcjogKEByZXF1aXJlZENvbXBvbmVudHMpIC0+XG4gICAgICAgIHN1cGVyKClcblxuICAgIHNhdGlzZmllczogKGNvbXBvbmVudHMpIC0+XG4gICAgICAgIF8uZXZlcnkgQHJlcXVpcmVkQ29tcG9uZW50cywgKHJlcXVpcmVkKSAtPiBfLmhhcyBjb21wb25lbnRzLCByZXF1aXJlZFxuXG5cbmNsYXNzIENvbXBzaXRlU3lzdGVtIGV4dGVuZHMgU3lzdGVtXG4gICAgY29uc3RydWN0b3I6IChAc3lzdGVtcy4uLikgLT5cblxuICAgIGJ1aWxkQ2FjaGU6IChlbnRpdGllcykgLT5cbiAgICAgICAgc3lzdGVtLmJ1aWxkQ2FjaGUgZW50aXRpZXMgZm9yIHN5c3RlbSBpbiBAc3lzdGVtc1xuXG4gICAgdXBkYXRlQ2FjaGU6IChlbnRpdHkpIC0+XG4gICAgICAgIHN5c3RlbS51cGRhdGVDYWNoZSBlbnRpdHkgZm9yIHN5c3RlbSBpbiBAc3lzdGVtc1xuXG4gICAgcnVuOiAoZW50aXRpZXMsIGR0KSAtPlxuICAgICAgICBzeXN0ZW0ucnVuIGVudGl0aWVzLCBkdCBmb3Igc3lzdGVtIGluIEBzeXN0ZW1zXG5cbiAgICBhY3Rpb246IChlbnRpdHksIGR0LCBlbnRpdGllcykgLT5cbiAgICAgICAgc3lzdGVtLmFjdGlvbiBlbnRpdHksIGR0LCBlbnRpdGllcyBmb3Igc3lzdGVtIGluIEBzeXN0ZW1zXG5cbmV4cG9ydHMuQmFzaWNTeXN0ZW0gPSBCYXNpY1N5c3RlbVxuZXhwb3J0cy5TeXN0ZW0gPSBTeXN0ZW1cbmV4cG9ydHMuQ29tcHNpdGVTeXN0ZW0gPSBDb21wc2l0ZVN5c3RlbVxuIiwiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUnXG5RdWFkVHJlZSA9IHJlcXVpcmUgJy4uL3F1YWR0cmVlLmNvZmZlZSdcbnN5c3RlbSA9IHJlcXVpcmUoJy4uL3N5c3RlbS5jb2ZmZWUnKVxudmVjdXRpbCA9IHJlcXVpcmUgJy4uL3ZlY3V0aWwuY29mZmVlJ1xuXG5tYWtlUXVhZFRyZWVJdGVtID0gKGVudGl0eSkgLT5cbiAgICB7XG4gICAgICAgIHg6IGVudGl0eS5jb21wb25lbnRzLnBvc2l0aW9uLnBvc1swXSxcbiAgICAgICAgeTogZW50aXR5LmNvbXBvbmVudHMucG9zaXRpb24ucG9zWzFdLFxuICAgICAgICB3aWR0aDogZW50aXR5LmNvbXBvbmVudHMuY29sbGlzaW9uLmJvdW5kaW5nQm94U2l6ZVswXSxcbiAgICAgICAgaGVpZ2h0OiBlbnRpdHkuY29tcG9uZW50cy5jb2xsaXNpb24uYm91bmRpbmdCb3hTaXplWzFdXG4gICAgICAgIGlkOiBlbnRpdHkuaWRcbiAgICB9XG5cbmNsYXNzIENvbGxpc2lvblN5c3RlbSBleHRlbmRzIHN5c3RlbS5CYXNpY1N5c3RlbVxuICAgIGNvbnN0cnVjdG9yOiAoQGNhbnZhc1NpemUpIC0+XG4gICAgICAgIHN1cGVyIFsnY29sbGlzaW9uJywgJ3Bvc2l0aW9uJ11cblxuICAgICAgICBAcXVhZFRyZWUgPSBuZXcgUXVhZFRyZWUuQm91bmRRdWFkVHJlZSh7XG4gICAgICAgICAgICB4OiAwLCB5OiAwLCB3aWR0aDogQGNhbnZhc1NpemVbMF0sIGhlaWdodDogQGNhbnZhc1NpemVbMV1cbiAgICAgICAgfSwgNSwgMTApXG5cbiAgICAgICAgQHNob3VsZERyYXdRdWFkVHJlZSA9IGZhbHNlXG4gICAgICAgIEBzaG91bGREcmF3Q29sbGlzaW9uQm94ZXMgPSBmYWxzZVxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyICdrZXlwcmVzcycsIChlKSA9PlxuICAgICAgICAgICAgZS5rZXkgPz0gU3RyaW5nLmZyb21DaGFyQ29kZSBlLmNoYXJDb2RlXG4gICAgICAgICAgICBzd2l0Y2ggZS5rZXlcbiAgICAgICAgICAgICAgICB3aGVuIFwicVwiIHRoZW4gQHNob3VsZERyYXdRdWFkVHJlZSA9ICFAc2hvdWxkRHJhd1F1YWRUcmVlXG4gICAgICAgICAgICAgICAgd2hlbiBcImNcIiB0aGVuIEBzaG91bGREcmF3Q29sbGlzaW9uQm94ZXMgPVxuICAgICAgICAgICAgICAgICAgICAhQHNob3VsZERyYXdDb2xsaXNpb25Cb3hlc1xuXG4gICAgYWN0aW9uOiAoZW50aXR5LCBkdCwgZW50aXRpZXMpIC0+XG4gICAgICAgIHBvc2l0aW9uID0gZW50aXR5LmNvbXBvbmVudHMucG9zaXRpb25cbiAgICAgICAgY29sbGlzaW9uID0gZW50aXR5LmNvbXBvbmVudHMuY29sbGlzaW9uXG5cbiAgICAgICAgZGlkQ29sbGlkZSA9IGZhbHNlXG4gICAgICAgIGZvciBpdGVtIGluIEBxdWFkVHJlZS5yZXRyaWV2ZSh7XG4gICAgICAgICAgICB4OiBwb3NpdGlvbi5wb3NbMF0sXG4gICAgICAgICAgICB5OiBwb3NpdGlvbi5wb3NbMV0sXG4gICAgICAgICAgICB3aWR0aDogY29sbGlzaW9uLmJvdW5kaW5nQm94U2l6ZVswXSxcbiAgICAgICAgICAgIGhlaWdodDogY29sbGlzaW9uLmJvdW5kaW5nQm94U2l6ZVsxXVxuICAgICAgICB9KVxuICAgICAgICAgICAgb3RoZXJFbnRpdHkgPSBlbnRpdGllc1tpdGVtLmlkXVxuICAgICAgICAgICAgaWYgb3RoZXJFbnRpdHkuaWQgIT0gZW50aXR5LmlkXG4gICAgICAgICAgICAgICAgaWYgdmVjdXRpbC5yZWN0SW50ZXJzZWN0KFxuICAgICAgICAgICAgICAgICAgICBbcG9zaXRpb24ucG9zLCBjb2xsaXNpb24uYm91bmRpbmdCb3hTaXplXSxcbiAgICAgICAgICAgICAgICAgICAgW290aGVyRW50aXR5LmNvbXBvbmVudHMucG9zaXRpb24ucG9zLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3RoZXJFbnRpdHkuY29tcG9uZW50cy5jb2xsaXNpb24uYm91bmRpbmdCb3hTaXplXVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgZGlkQ29sbGlkZSA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgaWYgY29sbGlzaW9uLnNob3VsZENvbGxpZGUgZW50aXR5LCBvdGhlckVudGl0eVxuICAgICAgICAgICAgICAgICAgICAgICAgY29sbGlzaW9uLmRpZENvbGxpZGUgZW50aXR5LCBvdGhlckVudGl0eVxuXG4gICAgICAgIEBkcmF3Q29sbGlzaW9uQm94IGVudGl0eSwgZGlkQ29sbGlkZSBpZiBAc2hvdWxkRHJhd0NvbGxpc2lvbkJveGVzXG5cbiAgICBydW46IChlbnRpdGllcywgZHQpIC0+XG4gICAgICAgIEBxdWFkVHJlZS5jbGVhcigpXG4gICAgICAgIEBxdWFkVHJlZS5pbnNlcnQgbWFrZVF1YWRUcmVlSXRlbShlbnRpdGllc1tpXSkgZm9yIGkgaW4gXy5rZXlzKEBjYWNoZSlcbiAgICAgICAgc3VwZXIgZW50aXRpZXMsIGR0XG4gICAgICAgIEBkcmF3UXVhZFRyZWUoKSBpZiBAc2hvdWxkRHJhd1F1YWRUcmVlXG5cbiAgICBkcmF3UXVhZFRyZWU6IC0+XG4gICAgICAgIHJlbmRlcmVyLmRyYXdRdWFkVHJlZU5vZGUgQHF1YWRUcmVlLnJvb3RcblxuICAgIGRyYXdDb2xsaXNpb25Cb3g6IChlbnRpdHksIGNvbGxpZGluZykgLT5cbiAgICAgICAgcmVuZGVyZXIuY3R4LnNhdmUoKVxuICAgICAgICByZW5kZXJlci5jdHguc2V0U3Ryb2tlQ29sb3IoaWYgY29sbGlkaW5nIHRoZW4gJ3JlZCcgZWxzZSAnZ3JlZW4nKVxuICAgICAgICByZW5kZXJlci5jdHguc3Ryb2tlUmVjdCBlbnRpdHkuY29tcG9uZW50cy5wb3NpdGlvbi5wb3MuLi4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudGl0eS5jb21wb25lbnRzLmNvbGxpc2lvbi5ib3VuZGluZ0JveFNpemUuLi5cbiAgICAgICAgcmVuZGVyZXIuY3R4LnJlc3RvcmUoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbGxpc2lvblN5c3RlbVxuIiwic3lzdGVtID0gcmVxdWlyZSAnLi4vc3lzdGVtLmNvZmZlZSdcblxuY2xhc3MgTGlmZXRpbWVTeXN0ZW0gZXh0ZW5kcyBzeXN0ZW0uQmFzaWNTeXN0ZW1cbiAgICBjb25zdHJ1Y3RvcjogLT5cbiAgICAgICAgc3VwZXIgW1wibGlmZXRpbWVcIl1cblxuICAgIGFjdGlvbjogKGVudGl0eSwgZHQpIC0+XG4gICAgICAgIGVudGl0eS5jb21wb25lbnRzLmxpZmV0aW1lLmxpZmV0aW1lIC09IGR0XG4gICAgICAgIGlmIGVudGl0eS5jb21wb25lbnRzLmxpZmV0aW1lLmxpZmV0aW1lIDw9IDBcbiAgICAgICAgICAgIGVudGl0eS5kZXN0cm95KClcblxubW9kdWxlLmV4cG9ydHMgPSBMaWZldGltZVN5c3RlbVxuIiwiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUnXG5zeXN0ZW0gPSByZXF1aXJlKCcuLi9zeXN0ZW0uY29mZmVlJylcbnZlY3V0aWwgPSByZXF1aXJlICcuLi92ZWN1dGlsLmNvZmZlZSdcblxuY2xhc3MgTW92ZVRvd2FyZFBsYXllclN5c3RlbSBleHRlbmRzIHN5c3RlbS5CYXNpY1N5c3RlbVxuICAgIGNvbnN0cnVjdG9yOiAtPlxuICAgICAgICBzdXBlciBbJ3ZlbG9jaXR5JywgJ3Bvc2l0aW9uJywgJ21vdmV0b3dhcmRwbGF5ZXInXVxuICAgICAgICBAcGxheWVyID0gbnVsbFxuXG4gICAgYWN0aW9uOiAoZW50aXR5LCBkdCkgLT5cbiAgICAgICAgaWYgQHBsYXllclxuICAgICAgICAgICAgZGlyZWN0aW9uID0gdmVjdXRpbC5kaXJlY3Rpb24oQHBsYXllci5jb21wb25lbnRzLnBvc2l0aW9uLnBvcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudGl0eS5jb21wb25lbnRzLnBvc2l0aW9uLnBvcylcbiAgICAgICAgICAgIGVudGl0eS5jb21wb25lbnRzLnZlbG9jaXR5LnZlY3RvciA9IChcbiAgICAgICAgICAgICAgICB2ZWN1dGlsLnNjYWxlIGRpcmVjdGlvbiwgZW50aXR5LmNvbXBvbmVudHMubW92ZXRvd2FyZHBsYXllci5zcGVlZClcblxuICAgIHVwZGF0ZUNhY2hlOiAoZW50aXR5KSAtPlxuICAgICAgICBzdXBlciBlbnRpdHlcbiAgICAgICAgaWYgZW50aXR5LmNvbXBvbmVudHMgPT0gbnVsbFxuICAgICAgICAgICAgaWYgQHBsYXllcj8uaWQgPT0gZW50aXR5LmlkXG4gICAgICAgICAgICAgICAgQHBsYXllciA9IG51bGxcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgXy5oYXMgZW50aXR5LmNvbXBvbmVudHMsICdwbGF5ZXInXG4gICAgICAgICAgICAgICAgQHBsYXllciA9IGVudGl0eVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1vdmVUb3dhcmRQbGF5ZXJTeXN0ZW1cbiIsInN5c3RlbSA9IHJlcXVpcmUgJy4uL3N5c3RlbS5jb2ZmZWUnXG5cbmNsYXNzIFBoeXNpY3NTeXN0ZW0gZXh0ZW5kcyBzeXN0ZW0uQmFzaWNTeXN0ZW1cbiAgICBjb25zdHJ1Y3RvcjogLT5cbiAgICAgICAgc3VwZXIgW1wicG9zaXRpb25cIiwgXCJ2ZWxvY2l0eVwiXVxuXG4gICAgYWN0aW9uOiAoZW50aXR5LCBkdCkgLT5cbiAgICAgICAgcG9zaXRpb24gPSBlbnRpdHkuY29tcG9uZW50cy5wb3NpdGlvblxuICAgICAgICB2ZWxvY2l0eSA9IGVudGl0eS5jb21wb25lbnRzLnZlbG9jaXR5XG5cbiAgICAgICAgcG9zaXRpb24ucG9zWzBdICs9IHZlbG9jaXR5LnZlY3RvclswXSAqIGR0XG4gICAgICAgIHBvc2l0aW9uLnBvc1sxXSArPSB2ZWxvY2l0eS52ZWN0b3JbMV0gKiBkdFxuXG5tb2R1bGUuZXhwb3J0cyA9IFBoeXNpY3NTeXN0ZW1cbiIsIklucHV0ID0gcmVxdWlyZSAnLi4vaW5wdXQuY29mZmVlJ1xuc3lzdGVtID0gcmVxdWlyZSAnLi4vc3lzdGVtLmNvZmZlZSdcblxuY2xhc3MgUGxheWVyQ29udHJvbFN5c3RlbSBleHRlbmRzIHN5c3RlbS5CYXNpY1N5c3RlbVxuICAgIGNvbnN0cnVjdG9yOiAtPlxuICAgICAgICBzdXBlciBbXCJwbGF5ZXJjb250cm9sXCIsIFwidmVsb2NpdHlcIl1cblxuICAgIGFjdGlvbjogKGVudGl0eSwgZHQpIC0+XG4gICAgICAgIHZlbG9jaXR5ID0gZW50aXR5LmNvbXBvbmVudHMudmVsb2NpdHlcbiAgICAgICAgcGxheWVyU3BlZWQgPSBlbnRpdHkuY29tcG9uZW50cy5wbGF5ZXJjb250cm9sLnBsYXllclNwZWVkXG5cbiAgICAgICAgaWYgSW5wdXQuaXNEb3duKCdMRUZUJykgfHwgSW5wdXQuaXNEb3duKCdhJylcbiAgICAgICAgICAgIHZlbG9jaXR5LnZlY3RvclswXSA9IC1wbGF5ZXJTcGVlZFxuICAgICAgICBlbHNlIGlmIElucHV0LmlzRG93bignUklHSFQnKSB8fCBJbnB1dC5pc0Rvd24oJ2QnKVxuICAgICAgICAgICAgdmVsb2NpdHkudmVjdG9yWzBdID0gcGxheWVyU3BlZWRcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdmVsb2NpdHkudmVjdG9yWzBdID0gMFxuXG4gICAgICAgIGlmIElucHV0LmlzRG93bignVVAnKSB8fCBJbnB1dC5pc0Rvd24oJ3cnKVxuICAgICAgICAgICAgdmVsb2NpdHkudmVjdG9yWzFdID0gLXBsYXllclNwZWVkXG4gICAgICAgIGVsc2UgaWYgSW5wdXQuaXNEb3duKCdET1dOJykgfHwgSW5wdXQuaXNEb3duKCdzJylcbiAgICAgICAgICAgIHZlbG9jaXR5LnZlY3RvclsxXSA9IHBsYXllclNwZWVkXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHZlbG9jaXR5LnZlY3RvclsxXSA9IDBcblxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXJDb250cm9sU3lzdGVtXG4iLCJJbnB1dCA9IHJlcXVpcmUgJy4uL2lucHV0LmNvZmZlZSdcbnN5c3RlbSA9IHJlcXVpcmUgJy4uL3N5c3RlbS5jb2ZmZWUnXG5cbmNsYXNzIFNwZWxsY2FzdGluZ1N5c3RlbSBleHRlbmRzIHN5c3RlbS5CYXNpY1N5c3RlbVxuICAgIGNvbnN0cnVjdG9yOiAtPlxuICAgICAgICBzdXBlciBbXCJwb3NpdGlvblwiLCBcInNwZWxsY2FzdGVyXCJdXG5cbiAgICBhY3Rpb246IChlbnRpdHksIGR0KSAtPlxuICAgICAgICBpZiBJbnB1dC5tb3VzZS5pc0Rvd25cbiAgICAgICAgICAgIG5ldyBlbnRpdHkuY29tcG9uZW50cy5zcGVsbGNhc3Rlci5zcGVsbHNbMF0oZW50aXR5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBJbnB1dC5tb3VzZS5wb3NSZWxhdGl2ZVRvKGNhbnZhcykpXG5cbm1vZHVsZS5leHBvcnRzID0gU3BlbGxjYXN0aW5nU3lzdGVtXG4iLCJfID0gcmVxdWlyZSAndW5kZXJzY29yZSdcbklucHV0ID0gcmVxdWlyZSAnLi4vaW5wdXQuY29mZmVlJ1xuc3lzdGVtID0gcmVxdWlyZSAnLi4vc3lzdGVtLmNvZmZlZSdcbnZlY3V0aWwgPSByZXF1aXJlICcuLi92ZWN1dGlsLmNvZmZlZSdcblxuY2VudGVyID0gKGNvbXBvbmVudHMpIC0+XG4gICAgdmVjdXRpbC5hZGQyZChcbiAgICAgICAgY29tcG9uZW50cy5wb3NpdGlvbi5wb3MsXG4gICAgICAgIHZlY3V0aWwuc2NhbGUoKFxuICAgICAgICAgICAgaWYgXy5oYXMgY29tcG9uZW50cywgJ3N0YXRpY3Nwcml0ZSdcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzLnN0YXRpY3Nwcml0ZS5zaXplXG4gICAgICAgICAgICBlbHNlIGlmIF8uaGFzIGNvbXBvbmVudHMsICdhbmltYXRlZHNwcml0ZSdcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzLmFuaW1hdGVkc3ByaXRlLnNpemVcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzLmNvbG9yYm94LnNpemUpLCAwLjUpKVxuXG5jbGFzcyBTcHJpdGVUdXJuaW5nU3lzdGVtIGV4dGVuZHMgc3lzdGVtLlN5c3RlbVxuICAgIHNhdGlzZmllczogKGNvbXBvbmVudHMpIC0+XG4gICAgICAgIF8uaGFzKGNvbXBvbmVudHMsICd0dXJuYWJsZScpIGFuZFxuICAgICAgICBfLmhhcyhjb21wb25lbnRzLCAncG9zaXRpb24nKSBhbmRcbiAgICAgICAgICAgIChfLmhhcyhjb21wb25lbnRzLCAnc3RhdGljc3ByaXRlJykgb3JcbiAgICAgICAgICAgICBfLmhhcyhjb21wb25lbnRzLCAnYW5pbWF0ZWRzcHJpdGUnKSBvclxuICAgICAgICAgICAgIF8uaGFzKGNvbXBvbmVudHMsICdjb2xvcmJveCcpKVxuXG4gICAgYWN0aW9uOiAoZW50aXR5LCBkdCkgLT5cbiAgICAgICAgdmVjdG9yID0gdmVjdXRpbC5zdWIyZChJbnB1dC5tb3VzZS5wb3NSZWxhdGl2ZVRvKGNhbnZhcyksIGNlbnRlcihlbnRpdHkuY29tcG9uZW50cykpXG4gICAgICAgIHRoZXRhID0gdmVjdXRpbC5hbmdsZU9mSW5jaWRlbmNlIHZlY3RvclxuICAgICAgICB0aGV0YSArPSAoTWF0aC5UQVUgLyAxNikgJSBNYXRoLlRBVSAjIG9mZnNldFxuXG4gICAgICAgIGluZGV4ID0gTWF0aC5mbG9vcih0aGV0YSAvIChNYXRoLlRBVSAvIDgpKVxuXG4gICAgICAgIHNwcml0ZSA9IGVudGl0eS5jb21wb25lbnRzLnR1cm5hYmxlLnNwcml0ZXNbaW5kZXhdXG5cbiAgICAgICAgaWYgc3ByaXRlP1xuICAgICAgICAgICAgaWYgXy5oYXMgZW50aXR5LmNvbXBvbmVudHMsIFwic3RhdGljc3ByaXRlXCJcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzLnN0YXRpY3Nwcml0ZSA9IHNwcml0ZVxuICAgICAgICAgICAgZWxzZSBpZiBfLmhhcyBlbnRpdHkuY29tcG9uZW50cywgXCJhbmltYXRlZHNwcml0ZVwiXG4gICAgICAgICAgICAgICAgZW50aXR5LmNvbXBvbmVudHMuYW5pbWF0ZWRzcHJpdGUgPSBzcHJpdGVcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBlbnRpdHkuY29tcG9uZW50cy5jb2xvcmJveCA9IHNwcml0ZVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNwcml0ZVR1cm5pbmdTeXN0ZW1cbiIsInN5c3RlbSA9IHJlcXVpcmUgJy4uL3N5c3RlbS5jb2ZmZWUnXG5cbmNsYXNzIFN0b3BBZnRlclN5c3RlbSBleHRlbmRzIHN5c3RlbS5CYXNpY1N5c3RlbVxuICAgIGNvbnN0cnVjdG9yOiAtPlxuICAgICAgICBzdXBlciBbXCJ2ZWxvY2l0eVwiLCBcImNyZWF0ZWRhdFwiLCBcInN0b3BzYWZ0ZXJcIl1cblxuICAgIGFjdGlvbjogKGVudGl0eSwgZHQpIC0+XG4gICAgICAgIGlmIERhdGUubm93KCkgLSBlbnRpdHkuY29tcG9uZW50cy5jcmVhdGVkYXQuY3JlYXRlZEF0ID4gZW50aXR5LmNvbXBvbmVudHMuc3RvcHNhZnRlci50aW1lXG4gICAgICAgICAgICBlbnRpdHkuZGVzdHJveSgpXG4gICAgICAgICAgICBlbnRpdHkuY29tcG9uZW50cy52ZWxvY2l0eS52ZWN0b3JbMF0gPSAwXG4gICAgICAgICAgICBlbnRpdHkuY29tcG9uZW50cy52ZWxvY2l0eS52ZWN0b3JbMV0gPSAwXG5cbm1vZHVsZS5leHBvcnRzID0gU3RvcEFmdGVyU3lzdGVtXG4iLCJfID0gcmVxdWlyZSAndW5kZXJzY29yZSdcblxuc3VtID0gKGxpc3QpIC0+XG4gICAgXy5mb2xkbCBsaXN0LCAoKHMsIHgpIC0+IHMgKyB4KSwgMFxuXG5hdmVyYWdlID0gKGxpc3QpIC0+XG4gICAgc3VtKGxpc3QpIC8gbGlzdC5sZW5ndGhcblxua2V5Rm9yQ29tcG9uZW50ID0gKGNvbXBvbmVudCkgLT5cbiAgICBjb21wb25lbnQuY29uc3RydWN0b3IubmFtZS50b0xvd2VyQ2FzZSgpXG5cbmV4cG9ydHMuc3VtID0gc3VtXG5leHBvcnRzLmF2ZXJhZ2UgPSBhdmVyYWdlXG5leHBvcnRzLmtleUZvckNvbXBvbmVudCA9IGtleUZvckNvbXBvbmVudFxuIiwiTWF0aC5UQVUgPSAyICogTWF0aC5QSVxuXG5tYWduaXR1ZGUgPSAodikgLT5cbiAgICBNYXRoLnNxcnQodlswXSAqIHZbMF0gKyB2WzFdICogdlsxXSlcblxubm9ybWFsaXplID0gKHYpIC0+XG4gICAgbSA9IG1hZ25pdHVkZSB2XG4gICAgW3ZbMF0gLyBtLCB2WzFdIC8gbV1cblxuYWRkMmQgPSAodjEsIHYyKSAtPlxuICAgIFt2MVswXSArIHYyWzBdLCB2MVsxXSArIHYyWzFdXVxuXG5zdWIyZCA9ICh2MSwgdjIpIC0+XG4gICAgW3YxWzBdIC0gdjJbMF0sIHYxWzFdIC0gdjJbMV1dXG5cbnNjYWxlID0gKHYsIHMpIC0+XG4gICAgW3ZbMF0gKiBzLCB2WzFdICogc11cblxuc2NhbGVUbyA9ICh2LCBzKSAtPlxuICAgIHNjYWxlKG5vcm1hbGl6ZSh2KSwgcylcblxuZGlzdGFuY2UgPSAodjEsIHYyKSAtPlxuICAgIG1hZ25pdHVkZShzdWIyZCh2MSwgdjIpKVxuXG5kaXJlY3Rpb24gPSAodG8sIGZyb20pIC0+XG4gICAgbm9ybWFsaXplKHN1YjJkIHRvLCBmcm9tKVxuXG5hbmdsZU9mSW5jaWRlbmNlID0gKHYsIGZsaXB5ID0gdHJ1ZSkgLT5cbiAgICB0aGV0YSA9IE1hdGguYXRhbjIgKGlmIGZsaXB5IHRoZW4gLXZbMV0gZWxzZSB2WzFdKSwgdlswXVxuICAgICMgZm9yY2UgdGhldGEgcG9zaXRpdmVcbiAgICB0aGV0YSArPSBNYXRoLlRBVSBpZiB0aGV0YSA8IDBcbiAgICByZXR1cm4gdGhldGFcblxuTWF0aC5yYWRUb0RlZyA9IChyKSAtPlxuICAgIHIgLyBNYXRoLlRBVSAqIDM2MFxuXG5hbG9uZ1BlcmltZXRlciA9IChyZWN0LCBhbG9uZykgLT5cbiAgICBbW3gsIHldLCBbd2lkdGgsIGhlaWdodF1dID0gcmVjdFxuICAgIHBlcmltZXRlciA9IDIgKiAod2lkdGggKyBoZWlnaHQpXG4gICAgYWxvbmcgPSBwZXJpbWV0ZXIgKiBhbG9uZ1xuICAgIGlmIGFsb25nIDwgd2lkdGhcbiAgICAgICAgW3ggKyBhbG9uZywgeV1cbiAgICBlbHNlIGlmIGFsb25nIDwgd2lkdGggKyBoZWlnaHRcbiAgICAgICAgW3ggKyB3aWR0aCwgeSArIGFsb25nIC0gd2lkdGhdXG4gICAgZWxzZSBpZiBhbG9uZyA8IDIgKiB3aWR0aCArIGhlaWdodFxuICAgICAgICBbeCArIGFsb25nIC0gKHdpZHRoICsgaGVpZ2h0KSwgeSArIGhlaWdodF1cbiAgICBlbHNlXG4gICAgICAgIFt4LCB5ICsgYWxvbmcgLSAyICogd2lkdGggLSBoZWlnaHRdXG5cbnJlY3RJbnRlcnNlY3QgPSAocmVjdDEsIHJlY3QyKSAtPlxuICAgIChNYXRoLmFicyhyZWN0MVswXVswXSArIHJlY3QxWzFdWzBdLzIgLSByZWN0MlswXVswXSAtIHJlY3QyWzFdWzBdLzIpICogMiA8IChyZWN0MVsxXVswXSArIHJlY3QyWzFdWzBdKSkgYW5kXG4gICAgICAgIChNYXRoLmFicyhyZWN0MVswXVsxXSArIHJlY3QxWzFdWzFdLzIgLSByZWN0MlswXVsxXSAtIHJlY3QyWzFdWzFdLzIpICogMiA8IChyZWN0MVsxXVsxXSArIHJlY3QyWzFdWzFdKSlcblxuZXhwb3J0cy5tYWduaXR1ZGUgPSBtYWduaXR1ZGVcbmV4cG9ydHMubm9ybWFsaXplID0gbm9ybWFsaXplXG5leHBvcnRzLmFkZDJkID0gYWRkMmRcbmV4cG9ydHMuc3ViMmQgPSBzdWIyZFxuZXhwb3J0cy5zY2FsZSA9IHNjYWxlXG5leHBvcnRzLnNjYWxlVG8gPSBzY2FsZVRvXG5leHBvcnRzLmRpc3RhbmNlID0gZGlzdGFuY2VcbmV4cG9ydHMuZGlyZWN0aW9uID0gZGlyZWN0aW9uXG5leHBvcnRzLmFuZ2xlT2ZJbmNpZGVuY2UgPSBhbmdsZU9mSW5jaWRlbmNlXG5leHBvcnRzLmFsb25nUGVyaW1ldGVyID0gYWxvbmdQZXJpbWV0ZXJcbmV4cG9ydHMucmVjdEludGVyc2VjdCA9IHJlY3RJbnRlcnNlY3RcbiJdfQ==
;