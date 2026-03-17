var __create = Object.create;var __defProp = Object.defineProperty;var __getOwnPropDesc = Object.getOwnPropertyDescriptor;var __getOwnPropNames = Object.getOwnPropertyNames;var __getProtoOf = Object.getPrototypeOf;var __hasOwnProp = Object.prototype.hasOwnProperty;var __commonJS = (cb, mod) => function __require() {  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;};var __copyProps = (to, from, except, desc) => {  if (from && typeof from === "object" || typeof from === "function") {    for (let key of __getOwnPropNames(from))      if (!__hasOwnProp.call(to, key) && key !== except)        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });  }  return to;};var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(  // If the importer is in node compatibility mode or this is not an ESM  // file that has been converted to a CommonJS file using a Babel-  // compatible transform (i.e. "__esModule" has not been set), then set  // "default" to the CommonJS "module.exports" for node compatibility.  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,  mod));// node_modules/react/cjs/react.development.jsvar require_react_development = __commonJS({  "node_modules/react/cjs/react.development.js"(exports, module) {    "use strict";    (function() {      function defineDeprecationWarning(methodName, info) {        Object.defineProperty(Component.prototype, methodName, {          get: function() {            console.warn(              "%s(...) is deprecated in plain JavaScript React classes. %s",              info[0],              info[1]            );          }        });      }      function getIteratorFn(maybeIterable) {        if (null === maybeIterable || "object" !== typeof maybeIterable)          return null;        maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];        return "function" === typeof maybeIterable ? maybeIterable : null;      }      function warnNoop(publicInstance, callerName) {        publicInstance = (publicInstance = publicInstance.constructor) && (publicInstance.displayName || publicInstance.name) || "ReactClass";        var warningKey = publicInstance + "." + callerName;        didWarnStateUpdateForUnmountedComponent[warningKey] || (console.error(          "Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.",          callerName,          publicInstance        ), didWarnStateUpdateForUnmountedComponent[warningKey] = true);      }      function Component(props, context, updater) {        this.props = props;        this.context = context;        this.refs = emptyObject;        this.updater = updater || ReactNoopUpdateQueue;      }      function ComponentDummy() {      }      function PureComponent(props, context, updater) {        this.props = props;        this.context = context;        this.refs = emptyObject;        this.updater = updater || ReactNoopUpdateQueue;      }      function noop() {      }      function testStringCoercion(value) {        return "" + value;      }      function checkKeyStringCoercion(value) {        try {          testStringCoercion(value);          var JSCompiler_inline_result = false;        } catch (e) {          JSCompiler_inline_result = true;        }        if (JSCompiler_inline_result) {          JSCompiler_inline_result = console;          var JSCompiler_temp_const = JSCompiler_inline_result.error;          var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";          JSCompiler_temp_const.call(            JSCompiler_inline_result,            "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",            JSCompiler_inline_result$jscomp$0          );          return testStringCoercion(value);        }      }      function getComponentNameFromType(type) {        if (null == type) return null;        if ("function" === typeof type)          return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;        if ("string" === typeof type) return type;        switch (type) {          case REACT_FRAGMENT_TYPE:            return "Fragment";          case REACT_PROFILER_TYPE:            return "Profiler";          case REACT_STRICT_MODE_TYPE:            return "StrictMode";          case REACT_SUSPENSE_TYPE:            return "Suspense";          case REACT_SUSPENSE_LIST_TYPE:            return "SuspenseList";          case REACT_ACTIVITY_TYPE:            return "Activity";        }        if ("object" === typeof type)          switch ("number" === typeof type.tag && console.error(            "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."          ), type.$$typeof) {            case REACT_PORTAL_TYPE:              return "Portal";            case REACT_CONTEXT_TYPE:              return type.displayName || "Context";            case REACT_CONSUMER_TYPE:              return (type._context.displayName || "Context") + ".Consumer";            case REACT_FORWARD_REF_TYPE:              var innerType = type.render;              type = type.displayName;              type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");              return type;            case REACT_MEMO_TYPE:              return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";            case REACT_LAZY_TYPE:              innerType = type._payload;              type = type._init;              try {                return getComponentNameFromType(type(innerType));              } catch (x) {              }          }        return null;      }      function getTaskName(type) {        if (type === REACT_FRAGMENT_TYPE) return "<>";        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE)          return "<...>";        try {          var name = getComponentNameFromType(type);          return name ? "<" + name + ">" : "<...>";        } catch (x) {          return "<...>";        }      }      function getOwner() {        var dispatcher = ReactSharedInternals.A;        return null === dispatcher ? null : dispatcher.getOwner();      }      function UnknownOwner() {        return Error("react-stack-top-frame");      }      function hasValidKey(config) {        if (hasOwnProperty.call(config, "key")) {          var getter = Object.getOwnPropertyDescriptor(config, "key").get;          if (getter && getter.isReactWarning) return false;        }        return void 0 !== config.key;      }      function defineKeyPropWarningGetter(props, displayName) {        function warnAboutAccessingKey() {          specialPropKeyWarningShown || (specialPropKeyWarningShown = true, console.error(            "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",            displayName          ));        }        warnAboutAccessingKey.isReactWarning = true;        Object.defineProperty(props, "key", {          get: warnAboutAccessingKey,          configurable: true        });      }      function elementRefGetterWithDeprecationWarning() {        var componentName = getComponentNameFromType(this.type);        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = true, console.error(          "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."        ));        componentName = this.props.ref;        return void 0 !== componentName ? componentName : null;      }      function ReactElement(type, key, props, owner, debugStack, debugTask) {        var refProp = props.ref;        type = {          $$typeof: REACT_ELEMENT_TYPE,          type,          key,          props,          _owner: owner        };        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {          enumerable: false,          get: elementRefGetterWithDeprecationWarning        }) : Object.defineProperty(type, "ref", { enumerable: false, value: null });        type._store = {};        Object.defineProperty(type._store, "validated", {          configurable: false,          enumerable: false,          writable: true,          value: 0        });        Object.defineProperty(type, "_debugInfo", {          configurable: false,          enumerable: false,          writable: true,          value: null        });        Object.defineProperty(type, "_debugStack", {          configurable: false,          enumerable: false,          writable: true,          value: debugStack        });        Object.defineProperty(type, "_debugTask", {          configurable: false,          enumerable: false,          writable: true,          value: debugTask        });        Object.freeze && (Object.freeze(type.props), Object.freeze(type));        return type;      }      function cloneAndReplaceKey(oldElement, newKey) {        newKey = ReactElement(          oldElement.type,          newKey,          oldElement.props,          oldElement._owner,          oldElement._debugStack,          oldElement._debugTask        );        oldElement._store && (newKey._store.validated = oldElement._store.validated);        return newKey;      }      function validateChildKeys(node) {        isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));      }      function isValidElement(object) {        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;      }      function escape(key) {        var escaperLookup = { "=": "=0", ":": "=2" };        return "$" + key.replace(/[=:]/g, function(match) {          return escaperLookup[match];        });      }      function getElementKey(element, index) {        return "object" === typeof element && null !== element && null != element.key ? (checkKeyStringCoercion(element.key), escape("" + element.key)) : index.toString(36);      }      function resolveThenable(thenable) {        switch (thenable.status) {          case "fulfilled":            return thenable.value;          case "rejected":            throw thenable.reason;          default:            switch ("string" === typeof thenable.status ? thenable.then(noop, noop) : (thenable.status = "pending", thenable.then(              function(fulfilledValue) {                "pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);              },              function(error) {                "pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);              }            )), thenable.status) {              case "fulfilled":                return thenable.value;              case "rejected":                throw thenable.reason;            }        }        throw thenable;      }      function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {        var type = typeof children;        if ("undefined" === type || "boolean" === type) children = null;        var invokeCallback = false;        if (null === children) invokeCallback = true;        else          switch (type) {            case "bigint":            case "string":            case "number":              invokeCallback = true;              break;            case "object":              switch (children.$$typeof) {                case REACT_ELEMENT_TYPE:                case REACT_PORTAL_TYPE:                  invokeCallback = true;                  break;                case REACT_LAZY_TYPE:                  return invokeCallback = children._init, mapIntoArray(                    invokeCallback(children._payload),                    array,                    escapedPrefix,                    nameSoFar,                    callback                  );              }          }        if (invokeCallback) {          invokeCallback = children;          callback = callback(invokeCallback);          var childKey = "" === nameSoFar ? "." + getElementKey(invokeCallback, 0) : nameSoFar;          isArrayImpl(callback) ? (escapedPrefix = "", null != childKey && (escapedPrefix = childKey.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {            return c;          })) : null != callback && (isValidElement(callback) && (null != callback.key && (invokeCallback && invokeCallback.key === callback.key || checkKeyStringCoercion(callback.key)), escapedPrefix = cloneAndReplaceKey(            callback,            escapedPrefix + (null == callback.key || invokeCallback && invokeCallback.key === callback.key ? "" : ("" + callback.key).replace(              userProvidedKeyEscapeRegex,              "$&/"            ) + "/") + childKey          ), "" !== nameSoFar && null != invokeCallback && isValidElement(invokeCallback) && null == invokeCallback.key && invokeCallback._store && !invokeCallback._store.validated && (escapedPrefix._store.validated = 2), callback = escapedPrefix), array.push(callback));          return 1;        }        invokeCallback = 0;        childKey = "" === nameSoFar ? "." : nameSoFar + ":";        if (isArrayImpl(children))          for (var i = 0; i < children.length; i++)            nameSoFar = children[i], type = childKey + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(              nameSoFar,              array,              escapedPrefix,              type,              callback            );        else if (i = getIteratorFn(children), "function" === typeof i)          for (i === children.entries && (didWarnAboutMaps || console.warn(            "Using Maps as children is not supported. Use an array of keyed ReactElements instead."          ), didWarnAboutMaps = true), children = i.call(children), i = 0; !(nameSoFar = children.next()).done; )            nameSoFar = nameSoFar.value, type = childKey + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(              nameSoFar,              array,              escapedPrefix,              type,              callback            );        else if ("object" === type) {          if ("function" === typeof children.then)            return mapIntoArray(              resolveThenable(children),              array,              escapedPrefix,              nameSoFar,              callback            );          array = String(children);          throw Error(            "Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead."          );        }        return invokeCallback;      }      function mapChildren(children, func, context) {        if (null == children) return children;        var result = [], count = 0;        mapIntoArray(children, result, "", "", function(child) {          return func.call(context, child, count++);        });        return result;      }      function lazyInitializer(payload) {        if (-1 === payload._status) {          var ioInfo = payload._ioInfo;          null != ioInfo && (ioInfo.start = ioInfo.end = performance.now());          ioInfo = payload._result;          var thenable = ioInfo();          thenable.then(            function(moduleObject) {              if (0 === payload._status || -1 === payload._status) {                payload._status = 1;                payload._result = moduleObject;                var _ioInfo = payload._ioInfo;                null != _ioInfo && (_ioInfo.end = performance.now());                void 0 === thenable.status && (thenable.status = "fulfilled", thenable.value = moduleObject);              }            },            function(error) {              if (0 === payload._status || -1 === payload._status) {                payload._status = 2;                payload._result = error;                var _ioInfo2 = payload._ioInfo;                null != _ioInfo2 && (_ioInfo2.end = performance.now());                void 0 === thenable.status && (thenable.status = "rejected", thenable.reason = error);              }            }          );          ioInfo = payload._ioInfo;          if (null != ioInfo) {            ioInfo.value = thenable;            var displayName = thenable.displayName;            "string" === typeof displayName && (ioInfo.name = displayName);          }          -1 === payload._status && (payload._status = 0, payload._result = thenable);        }        if (1 === payload._status)          return ioInfo = payload._result, void 0 === ioInfo && console.error(            "lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))\n\nDid you accidentally put curly braces around the import?",            ioInfo          ), "default" in ioInfo || console.error(            "lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))",            ioInfo          ), ioInfo.default;        throw payload._result;      }      function resolveDispatcher() {        var dispatcher = ReactSharedInternals.H;        null === dispatcher && console.error(          "Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem."        );        return dispatcher;      }      function releaseAsyncTransition() {        ReactSharedInternals.asyncTransitions--;      }      function enqueueTask(task) {        if (null === enqueueTaskImpl)          try {            var requireString = ("require" + Math.random()).slice(0, 7);            enqueueTaskImpl = (module && module[requireString]).call(              module,              "timers"            ).setImmediate;          } catch (_err) {            enqueueTaskImpl = function(callback) {              false === didWarnAboutMessageChannel && (didWarnAboutMessageChannel = true, "undefined" === typeof MessageChannel && console.error(                "This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning."              ));              var channel = new MessageChannel();              channel.port1.onmessage = callback;              channel.port2.postMessage(void 0);            };          }        return enqueueTaskImpl(task);      }      function aggregateErrors(errors) {        return 1 < errors.length && "function" === typeof AggregateError ? new AggregateError(errors) : errors[0];      }      function popActScope(prevActQueue, prevActScopeDepth) {        prevActScopeDepth !== actScopeDepth - 1 && console.error(          "You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. "        );        actScopeDepth = prevActScopeDepth;      }      function recursivelyFlushAsyncActWork(returnValue, resolve, reject) {        var queue = ReactSharedInternals.actQueue;        if (null !== queue)          if (0 !== queue.length)            try {              flushActQueue(queue);              enqueueTask(function() {                return recursivelyFlushAsyncActWork(returnValue, resolve, reject);              });              return;            } catch (error) {              ReactSharedInternals.thrownErrors.push(error);            }          else ReactSharedInternals.actQueue = null;        0 < ReactSharedInternals.thrownErrors.length ? (queue = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, reject(queue)) : resolve(returnValue);      }      function flushActQueue(queue) {        if (!isFlushing) {          isFlushing = true;          var i = 0;          try {            for (; i < queue.length; i++) {              var callback = queue[i];              do {                ReactSharedInternals.didUsePromise = false;                var continuation = callback(false);                if (null !== continuation) {                  if (ReactSharedInternals.didUsePromise) {                    queue[i] = callback;                    queue.splice(0, i);                    return;                  }                  callback = continuation;                } else break;              } while (1);            }            queue.length = 0;          } catch (error) {            queue.splice(0, i + 1), ReactSharedInternals.thrownErrors.push(error);          } finally {            isFlushing = false;          }        }      }      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());      var REACT_ELEMENT_TYPE = /* @__PURE__ */ Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = /* @__PURE__ */ Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = /* @__PURE__ */ Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = /* @__PURE__ */ Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = /* @__PURE__ */ Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = /* @__PURE__ */ Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = /* @__PURE__ */ Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = /* @__PURE__ */ Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = /* @__PURE__ */ Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = /* @__PURE__ */ Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = /* @__PURE__ */ Symbol.for("react.memo"), REACT_LAZY_TYPE = /* @__PURE__ */ Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = /* @__PURE__ */ Symbol.for("react.activity"), MAYBE_ITERATOR_SYMBOL = Symbol.iterator, didWarnStateUpdateForUnmountedComponent = {}, ReactNoopUpdateQueue = {        isMounted: function() {          return false;        },        enqueueForceUpdate: function(publicInstance) {          warnNoop(publicInstance, "forceUpdate");        },        enqueueReplaceState: function(publicInstance) {          warnNoop(publicInstance, "replaceState");        },        enqueueSetState: function(publicInstance) {          warnNoop(publicInstance, "setState");        }      }, assign = Object.assign, emptyObject = {};      Object.freeze(emptyObject);      Component.prototype.isReactComponent = {};      Component.prototype.setState = function(partialState, callback) {        if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState)          throw Error(            "takes an object of state variables to update or a function which returns an object of state variables."          );        this.updater.enqueueSetState(this, partialState, callback, "setState");      };      Component.prototype.forceUpdate = function(callback) {        this.updater.enqueueForceUpdate(this, callback, "forceUpdate");      };      var deprecatedAPIs = {        isMounted: [          "isMounted",          "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."        ],        replaceState: [          "replaceState",          "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."        ]      };      for (fnName in deprecatedAPIs)        deprecatedAPIs.hasOwnProperty(fnName) && defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);      ComponentDummy.prototype = Component.prototype;      deprecatedAPIs = PureComponent.prototype = new ComponentDummy();      deprecatedAPIs.constructor = PureComponent;      assign(deprecatedAPIs, Component.prototype);      deprecatedAPIs.isPureReactComponent = true;      var isArrayImpl = Array.isArray, REACT_CLIENT_REFERENCE = /* @__PURE__ */ Symbol.for("react.client.reference"), ReactSharedInternals = {        H: null,        A: null,        T: null,        S: null,        actQueue: null,        asyncTransitions: 0,        isBatchingLegacy: false,        didScheduleLegacyUpdate: false,        didUsePromise: false,        thrownErrors: [],        getCurrentStack: null,        recentlyCreatedOwnerStacks: 0      }, hasOwnProperty = Object.prototype.hasOwnProperty, createTask = console.createTask ? console.createTask : function() {        return null;      };      deprecatedAPIs = {        react_stack_bottom_frame: function(callStackForError) {          return callStackForError();        }      };      var specialPropKeyWarningShown, didWarnAboutOldJSXRuntime;      var didWarnAboutElementRef = {};      var unknownOwnerDebugStack = deprecatedAPIs.react_stack_bottom_frame.bind(        deprecatedAPIs,        UnknownOwner      )();      var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));      var didWarnAboutMaps = false, userProvidedKeyEscapeRegex = /\/+/g, reportGlobalError = "function" === typeof reportError ? reportError : function(error) {        if ("object" === typeof window && "function" === typeof window.ErrorEvent) {          var event = new window.ErrorEvent("error", {            bubbles: true,            cancelable: true,            message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),            error          });          if (!window.dispatchEvent(event)) return;        } else if ("object" === typeof process && "function" === typeof process.emit) {          process.emit("uncaughtException", error);          return;        }        console.error(error);      }, didWarnAboutMessageChannel = false, enqueueTaskImpl = null, actScopeDepth = 0, didWarnNoAwaitAct = false, isFlushing = false, queueSeveralMicrotasks = "function" === typeof queueMicrotask ? function(callback) {        queueMicrotask(function() {          return queueMicrotask(callback);        });      } : enqueueTask;      deprecatedAPIs = Object.freeze({        __proto__: null,        c: function(size) {          return resolveDispatcher().useMemoCache(size);        }      });      var fnName = {        map: mapChildren,        forEach: function(children, forEachFunc, forEachContext) {          mapChildren(            children,            function() {              forEachFunc.apply(this, arguments);            },            forEachContext          );        },        count: function(children) {          var n = 0;          mapChildren(children, function() {            n++;          });          return n;        },        toArray: function(children) {          return mapChildren(children, function(child) {            return child;          }) || [];        },        only: function(children) {          if (!isValidElement(children))            throw Error(              "React.Children.only expected to receive a single React element child."            );          return children;        }      };      exports.Activity = REACT_ACTIVITY_TYPE;      exports.Children = fnName;      exports.Component = Component;      exports.Fragment = REACT_FRAGMENT_TYPE;      exports.Profiler = REACT_PROFILER_TYPE;      exports.PureComponent = PureComponent;      exports.StrictMode = REACT_STRICT_MODE_TYPE;      exports.Suspense = REACT_SUSPENSE_TYPE;      exports.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;      exports.__COMPILER_RUNTIME = deprecatedAPIs;      exports.act = function(callback) {        var prevActQueue = ReactSharedInternals.actQueue, prevActScopeDepth = actScopeDepth;        actScopeDepth++;        var queue = ReactSharedInternals.actQueue = null !== prevActQueue ? prevActQueue : [], didAwaitActCall = false;        try {          var result = callback();        } catch (error) {          ReactSharedInternals.thrownErrors.push(error);        }        if (0 < ReactSharedInternals.thrownErrors.length)          throw popActScope(prevActQueue, prevActScopeDepth), callback = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, callback;        if (null !== result && "object" === typeof result && "function" === typeof result.then) {          var thenable = result;          queueSeveralMicrotasks(function() {            didAwaitActCall || didWarnNoAwaitAct || (didWarnNoAwaitAct = true, console.error(              "You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"            ));          });          return {            then: function(resolve, reject) {              didAwaitActCall = true;              thenable.then(                function(returnValue) {                  popActScope(prevActQueue, prevActScopeDepth);                  if (0 === prevActScopeDepth) {                    try {                      flushActQueue(queue), enqueueTask(function() {                        return recursivelyFlushAsyncActWork(                          returnValue,                          resolve,                          reject                        );                      });                    } catch (error$0) {                      ReactSharedInternals.thrownErrors.push(error$0);                    }                    if (0 < ReactSharedInternals.thrownErrors.length) {                      var _thrownError = aggregateErrors(                        ReactSharedInternals.thrownErrors                      );                      ReactSharedInternals.thrownErrors.length = 0;                      reject(_thrownError);                    }                  } else resolve(returnValue);                },                function(error) {                  popActScope(prevActQueue, prevActScopeDepth);                  0 < ReactSharedInternals.thrownErrors.length ? (error = aggregateErrors(                    ReactSharedInternals.thrownErrors                  ), ReactSharedInternals.thrownErrors.length = 0, reject(error)) : reject(error);                }              );            }          };        }        var returnValue$jscomp$0 = result;        popActScope(prevActQueue, prevActScopeDepth);        0 === prevActScopeDepth && (flushActQueue(queue), 0 !== queue.length && queueSeveralMicrotasks(function() {          didAwaitActCall || didWarnNoAwaitAct || (didWarnNoAwaitAct = true, console.error(            "A component suspended inside an `act` scope, but the `act` call was not awaited. When testing React components that depend on asynchronous data, you must await the result:\n\nawait act(() => ...)"          ));        }), ReactSharedInternals.actQueue = null);        if (0 < ReactSharedInternals.thrownErrors.length)          throw callback = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, callback;        return {          then: function(resolve, reject) {            didAwaitActCall = true;            0 === prevActScopeDepth ? (ReactSharedInternals.actQueue = queue, enqueueTask(function() {              return recursivelyFlushAsyncActWork(                returnValue$jscomp$0,                resolve,                reject              );            })) : resolve(returnValue$jscomp$0);          }        };      };      exports.cache = function(fn) {        return function() {          return fn.apply(null, arguments);        };      };      exports.cacheSignal = function() {        return null;      };      exports.captureOwnerStack = function() {        var getCurrentStack = ReactSharedInternals.getCurrentStack;        return null === getCurrentStack ? null : getCurrentStack();      };      exports.cloneElement = function(element, config, children) {        if (null === element || void 0 === element)          throw Error(            "The argument must be a React element, but you passed " + element + "."          );        var props = assign({}, element.props), key = element.key, owner = element._owner;        if (null != config) {          var JSCompiler_inline_result;          a: {            if (hasOwnProperty.call(config, "ref") && (JSCompiler_inline_result = Object.getOwnPropertyDescriptor(              config,              "ref"            ).get) && JSCompiler_inline_result.isReactWarning) {              JSCompiler_inline_result = false;              break a;            }            JSCompiler_inline_result = void 0 !== config.ref;          }          JSCompiler_inline_result && (owner = getOwner());          hasValidKey(config) && (checkKeyStringCoercion(config.key), key = "" + config.key);          for (propName in config)            !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);        }        var propName = arguments.length - 2;        if (1 === propName) props.children = children;        else if (1 < propName) {          JSCompiler_inline_result = Array(propName);          for (var i = 0; i < propName; i++)            JSCompiler_inline_result[i] = arguments[i + 2];          props.children = JSCompiler_inline_result;        }        props = ReactElement(          element.type,          key,          props,          owner,          element._debugStack,          element._debugTask        );        for (key = 2; key < arguments.length; key++)          validateChildKeys(arguments[key]);        return props;      };      exports.createContext = function(defaultValue) {        defaultValue = {          $$typeof: REACT_CONTEXT_TYPE,          _currentValue: defaultValue,          _currentValue2: defaultValue,          _threadCount: 0,          Provider: null,          Consumer: null        };        defaultValue.Provider = defaultValue;        defaultValue.Consumer = {          $$typeof: REACT_CONSUMER_TYPE,          _context: defaultValue        };        defaultValue._currentRenderer = null;        defaultValue._currentRenderer2 = null;        return defaultValue;      };      exports.createElement = function(type, config, children) {        for (var i = 2; i < arguments.length; i++)          validateChildKeys(arguments[i]);        i = {};        var key = null;        if (null != config)          for (propName in didWarnAboutOldJSXRuntime || !("__self" in config) || "key" in config || (didWarnAboutOldJSXRuntime = true, console.warn(            "Your app (or one of its dependencies) is using an outdated JSX transform. Update to the modern JSX transform for faster performance: https://react.dev/link/new-jsx-transform"          )), hasValidKey(config) && (checkKeyStringCoercion(config.key), key = "" + config.key), config)            hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (i[propName] = config[propName]);        var childrenLength = arguments.length - 2;        if (1 === childrenLength) i.children = children;        else if (1 < childrenLength) {          for (var childArray = Array(childrenLength), _i = 0; _i < childrenLength; _i++)            childArray[_i] = arguments[_i + 2];          Object.freeze && Object.freeze(childArray);          i.children = childArray;        }        if (type && type.defaultProps)          for (propName in childrenLength = type.defaultProps, childrenLength)            void 0 === i[propName] && (i[propName] = childrenLength[propName]);        key && defineKeyPropWarningGetter(          i,          "function" === typeof type ? type.displayName || type.name || "Unknown" : type        );        var propName = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;        return ReactElement(          type,          key,          i,          getOwner(),          propName ? Error("react-stack-top-frame") : unknownOwnerDebugStack,          propName ? createTask(getTaskName(type)) : unknownOwnerDebugTask        );      };      exports.createRef = function() {        var refObject = { current: null };        Object.seal(refObject);        return refObject;      };      exports.forwardRef = function(render) {        null != render && render.$$typeof === REACT_MEMO_TYPE ? console.error(          "forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...))."        ) : "function" !== typeof render ? console.error(          "forwardRef requires a render function but was given %s.",          null === render ? "null" : typeof render        ) : 0 !== render.length && 2 !== render.length && console.error(          "forwardRef render functions accept exactly two parameters: props and ref. %s",          1 === render.length ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined."        );        null != render && null != render.defaultProps && console.error(          "forwardRef render functions do not support defaultProps. Did you accidentally pass a React component?"        );        var elementType = { $$typeof: REACT_FORWARD_REF_TYPE, render }, ownName;        Object.defineProperty(elementType, "displayName", {          enumerable: false,          configurable: true,          get: function() {            return ownName;          },          set: function(name) {            ownName = name;            render.name || render.displayName || (Object.defineProperty(render, "name", { value: name }), render.displayName = name);          }        });        return elementType;      };      exports.isValidElement = isValidElement;      exports.lazy = function(ctor) {        ctor = { _status: -1, _result: ctor };        var lazyType = {          $$typeof: REACT_LAZY_TYPE,          _payload: ctor,          _init: lazyInitializer        }, ioInfo = {          name: "lazy",          start: -1,          end: -1,          value: null,          owner: null,          debugStack: Error("react-stack-top-frame"),          debugTask: console.createTask ? console.createTask("lazy()") : null        };        ctor._ioInfo = ioInfo;        lazyType._debugInfo = [{ awaited: ioInfo }];        return lazyType;      };      exports.memo = function(type, compare) {        null == type && console.error(          "memo: The first argument must be a component. Instead received: %s",          null === type ? "null" : typeof type        );        compare = {          $$typeof: REACT_MEMO_TYPE,          type,          compare: void 0 === compare ? null : compare        };        var ownName;        Object.defineProperty(compare, "displayName", {          enumerable: false,          configurable: true,          get: function() {            return ownName;          },          set: function(name) {            ownName = name;            type.name || type.displayName || (Object.defineProperty(type, "name", { value: name }), type.displayName = name);          }        });        return compare;      };      exports.startTransition = function(scope) {        var prevTransition = ReactSharedInternals.T, currentTransition = {};        currentTransition._updatedFibers = /* @__PURE__ */ new Set();        ReactSharedInternals.T = currentTransition;        try {          var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;          null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);          "object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && (ReactSharedInternals.asyncTransitions++, returnValue.then(releaseAsyncTransition, releaseAsyncTransition), returnValue.then(noop, reportGlobalError));        } catch (error) {          reportGlobalError(error);        } finally {          null === prevTransition && currentTransition._updatedFibers && (scope = currentTransition._updatedFibers.size, currentTransition._updatedFibers.clear(), 10 < scope && console.warn(            "Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table."          )), null !== prevTransition && null !== currentTransition.types && (null !== prevTransition.types && prevTransition.types !== currentTransition.types && console.error(            "We expected inner Transitions to have transferred the outer types set and that you cannot add to the outer Transition while inside the inner.This is a bug in React."          ), prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;        }      };      exports.unstable_useCacheRefresh = function() {        return resolveDispatcher().useCacheRefresh();      };      exports.use = function(usable) {        return resolveDispatcher().use(usable);      };      exports.useActionState = function(action, initialState, permalink) {        return resolveDispatcher().useActionState(          action,          initialState,          permalink        );      };      exports.useCallback = function(callback, deps) {        return resolveDispatcher().useCallback(callback, deps);      };      exports.useContext = function(Context) {        var dispatcher = resolveDispatcher();        Context.$$typeof === REACT_CONSUMER_TYPE && console.error(          "Calling useContext(Context.Consumer) is not supported and will cause bugs. Did you mean to call useContext(Context) instead?"        );        return dispatcher.useContext(Context);      };      exports.useDebugValue = function(value, formatterFn) {        return resolveDispatcher().useDebugValue(value, formatterFn);      };      exports.useDeferredValue = function(value, initialValue) {        return resolveDispatcher().useDeferredValue(value, initialValue);      };      exports.useEffect = function(create, deps) {        null == create && console.warn(          "React Hook useEffect requires an effect callback. Did you forget to pass a callback to the hook?"        );        return resolveDispatcher().useEffect(create, deps);      };      exports.useEffectEvent = function(callback) {        return resolveDispatcher().useEffectEvent(callback);      };      exports.useId = function() {        return resolveDispatcher().useId();      };      exports.useImperativeHandle = function(ref, create, deps) {        return resolveDispatcher().useImperativeHandle(ref, create, deps);      };      exports.useInsertionEffect = function(create, deps) {        null == create && console.warn(          "React Hook useInsertionEffect requires an effect callback. Did you forget to pass a callback to the hook?"        );        return resolveDispatcher().useInsertionEffect(create, deps);      };      exports.useLayoutEffect = function(create, deps) {        null == create && console.warn(          "React Hook useLayoutEffect requires an effect callback. Did you forget to pass a callback to the hook?"        );        return resolveDispatcher().useLayoutEffect(create, deps);      };      exports.useMemo = function(create, deps) {        return resolveDispatcher().useMemo(create, deps);      };      exports.useOptimistic = function(passthrough, reducer) {        return resolveDispatcher().useOptimistic(passthrough, reducer);      };      exports.useReducer = function(reducer, initialArg, init) {        return resolveDispatcher().useReducer(reducer, initialArg, init);      };      exports.useRef = function(initialValue) {        return resolveDispatcher().useRef(initialValue);      };      exports.useState = function(initialState) {        return resolveDispatcher().useState(initialState);      };      exports.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {        return resolveDispatcher().useSyncExternalStore(          subscribe,          getSnapshot,          getServerSnapshot        );      };      exports.useTransition = function() {        return resolveDispatcher().useTransition();      };      exports.version = "19.2.4";      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());    })();  }});// node_modules/react/index.jsvar require_react = __commonJS({  "node_modules/react/index.js"(exports, module) {    "use strict";    if (false) {      module.exports = null;    } else {      module.exports = require_react_development();    }  }});// node_modules/react/cjs/react-jsx-runtime.development.jsvar require_react_jsx_runtime_development = __commonJS({  "node_modules/react/cjs/react-jsx-runtime.development.js"(exports) {    "use strict";    (function() {      function getComponentNameFromType(type) {        if (null == type) return null;        if ("function" === typeof type)          return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;        if ("string" === typeof type) return type;        switch (type) {          case REACT_FRAGMENT_TYPE:            return "Fragment";          case REACT_PROFILER_TYPE:            return "Profiler";          case REACT_STRICT_MODE_TYPE:            return "StrictMode";          case REACT_SUSPENSE_TYPE:            return "Suspense";          case REACT_SUSPENSE_LIST_TYPE:            return "SuspenseList";          case REACT_ACTIVITY_TYPE:            return "Activity";        }        if ("object" === typeof type)          switch ("number" === typeof type.tag && console.error(            "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."          ), type.$$typeof) {            case REACT_PORTAL_TYPE:              return "Portal";            case REACT_CONTEXT_TYPE:              return type.displayName || "Context";            case REACT_CONSUMER_TYPE:              return (type._context.displayName || "Context") + ".Consumer";            case REACT_FORWARD_REF_TYPE:              var innerType = type.render;              type = type.displayName;              type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");              return type;            case REACT_MEMO_TYPE:              return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";            case REACT_LAZY_TYPE:              innerType = type._payload;              type = type._init;              try {                return getComponentNameFromType(type(innerType));              } catch (x) {              }          }        return null;      }      function testStringCoercion(value) {        return "" + value;      }      function checkKeyStringCoercion(value) {        try {          testStringCoercion(value);          var JSCompiler_inline_result = false;        } catch (e) {          JSCompiler_inline_result = true;        }        if (JSCompiler_inline_result) {          JSCompiler_inline_result = console;          var JSCompiler_temp_const = JSCompiler_inline_result.error;          var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";          JSCompiler_temp_const.call(            JSCompiler_inline_result,            "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",            JSCompiler_inline_result$jscomp$0          );          return testStringCoercion(value);        }      }      function getTaskName(type) {        if (type === REACT_FRAGMENT_TYPE) return "<>";        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE)          return "<...>";        try {          var name = getComponentNameFromType(type);          return name ? "<" + name + ">" : "<...>";        } catch (x) {          return "<...>";        }      }      function getOwner() {        var dispatcher = ReactSharedInternals.A;        return null === dispatcher ? null : dispatcher.getOwner();      }      function UnknownOwner() {        return Error("react-stack-top-frame");      }      function hasValidKey(config) {        if (hasOwnProperty.call(config, "key")) {          var getter = Object.getOwnPropertyDescriptor(config, "key").get;          if (getter && getter.isReactWarning) return false;        }        return void 0 !== config.key;      }      function defineKeyPropWarningGetter(props, displayName) {        function warnAboutAccessingKey() {          specialPropKeyWarningShown || (specialPropKeyWarningShown = true, console.error(            "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",            displayName          ));        }        warnAboutAccessingKey.isReactWarning = true;        Object.defineProperty(props, "key", {          get: warnAboutAccessingKey,          configurable: true        });      }      function elementRefGetterWithDeprecationWarning() {        var componentName = getComponentNameFromType(this.type);        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = true, console.error(          "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."        ));        componentName = this.props.ref;        return void 0 !== componentName ? componentName : null;      }      function ReactElement(type, key, props, owner, debugStack, debugTask) {        var refProp = props.ref;        type = {          $$typeof: REACT_ELEMENT_TYPE,          type,          key,          props,          _owner: owner        };        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {          enumerable: false,          get: elementRefGetterWithDeprecationWarning        }) : Object.defineProperty(type, "ref", { enumerable: false, value: null });        type._store = {};        Object.defineProperty(type._store, "validated", {          configurable: false,          enumerable: false,          writable: true,          value: 0        });        Object.defineProperty(type, "_debugInfo", {          configurable: false,          enumerable: false,          writable: true,          value: null        });        Object.defineProperty(type, "_debugStack", {          configurable: false,          enumerable: false,          writable: true,          value: debugStack        });        Object.defineProperty(type, "_debugTask", {          configurable: false,          enumerable: false,          writable: true,          value: debugTask        });        Object.freeze && (Object.freeze(type.props), Object.freeze(type));        return type;      }      function jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStack, debugTask) {        var children = config.children;        if (void 0 !== children)          if (isStaticChildren)            if (isArrayImpl(children)) {              for (isStaticChildren = 0; isStaticChildren < children.length; isStaticChildren++)                validateChildKeys(children[isStaticChildren]);              Object.freeze && Object.freeze(children);            } else              console.error(                "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."              );          else validateChildKeys(children);        if (hasOwnProperty.call(config, "key")) {          children = getComponentNameFromType(type);          var keys = Object.keys(config).filter(function(k) {            return "key" !== k;          });          isStaticChildren = 0 < keys.length ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";          didWarnAboutKeySpread[children + isStaticChildren] || (keys = 0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}", console.error(            'A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />',            isStaticChildren,            children,            keys,            children          ), didWarnAboutKeySpread[children + isStaticChildren] = true);        }        children = null;        void 0 !== maybeKey && (checkKeyStringCoercion(maybeKey), children = "" + maybeKey);        hasValidKey(config) && (checkKeyStringCoercion(config.key), children = "" + config.key);        if ("key" in config) {          maybeKey = {};          for (var propName in config)            "key" !== propName && (maybeKey[propName] = config[propName]);        } else maybeKey = config;        children && defineKeyPropWarningGetter(          maybeKey,          "function" === typeof type ? type.displayName || type.name || "Unknown" : type        );        return ReactElement(          type,          children,          maybeKey,          getOwner(),          debugStack,          debugTask        );      }      function validateChildKeys(node) {        isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));      }      function isValidElement(object) {        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;      }      var React2 = require_react(), REACT_ELEMENT_TYPE = /* @__PURE__ */ Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = /* @__PURE__ */ Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = /* @__PURE__ */ Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = /* @__PURE__ */ Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = /* @__PURE__ */ Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = /* @__PURE__ */ Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = /* @__PURE__ */ Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = /* @__PURE__ */ Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = /* @__PURE__ */ Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = /* @__PURE__ */ Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = /* @__PURE__ */ Symbol.for("react.memo"), REACT_LAZY_TYPE = /* @__PURE__ */ Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = /* @__PURE__ */ Symbol.for("react.activity"), REACT_CLIENT_REFERENCE = /* @__PURE__ */ Symbol.for("react.client.reference"), ReactSharedInternals = React2.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, hasOwnProperty = Object.prototype.hasOwnProperty, isArrayImpl = Array.isArray, createTask = console.createTask ? console.createTask : function() {        return null;      };      React2 = {        react_stack_bottom_frame: function(callStackForError) {          return callStackForError();        }      };      var specialPropKeyWarningShown;      var didWarnAboutElementRef = {};      var unknownOwnerDebugStack = React2.react_stack_bottom_frame.bind(        React2,        UnknownOwner      )();      var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));      var didWarnAboutKeySpread = {};      exports.Fragment = REACT_FRAGMENT_TYPE;      exports.jsx = function(type, config, maybeKey) {        var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;        return jsxDEVImpl(          type,          config,          maybeKey,          false,          trackActualOwner ? Error("react-stack-top-frame") : unknownOwnerDebugStack,          trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask        );      };      exports.jsxs = function(type, config, maybeKey) {        var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;        return jsxDEVImpl(          type,          config,          maybeKey,          true,          trackActualOwner ? Error("react-stack-top-frame") : unknownOwnerDebugStack,          trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask        );      };    })();  }});// node_modules/react/jsx-runtime.jsvar require_jsx_runtime = __commonJS({  "node_modules/react/jsx-runtime.js"(exports, module) {    "use strict";    if (false) {      module.exports = null;    } else {      module.exports = require_react_jsx_runtime_development();    }  }});// projects/forensics35/workspace/main.jsximport __CanvasHelperReactDomClient from "https://esm.sh/react-dom@19.1.1/client";import React, { useEffect, useMemo, useState } from "https://esm.sh/react@19.1.1";import {  ChevronDown,  ChevronRight,  CheckCircle2,  Circle,  ArrowLeft,  ArrowRight,  FileText,  ClipboardCheck,  Library,  Search,  PlayCircle,  FileImage,  FileQuestion,  FileBadge,  Bookmark} from "https://esm.sh/lucide-react@0.542.0?deps=react@19.1.1";// projects/forensics35/workspace/d2l-map-data.jsvar d2lCourseMapData = {
    "schemaVersion":  1,
    "projectId":  "cd13848b-03fd-45b2-8e5a-05663680f8de",
    "projectSlug":  "forensics35",
    "generatedAt":  "2026-03-17T21:13:00.862Z",
    "manifestPath":  "C:\\Users\\dean.guedo\\Documents\\GitHub\\canvas-helper\\projects\\resources\\forensics35\\imsmanifest.xml",
    "courseTitle":  "23-24 | Forensic Studies 35 | Per 1(A-B) | Sec S3",
    "summary":  {
                    "moduleCount":  10,
                    "itemCount":  266,
                    "lessonCount":  7,
                    "assignmentCount":  6,
                    "quizCount":  32,
                    "pdfCount":  17,
                    "htmlCount":  169
                },
    "modules":  [
                    {
                        "id":  "ife43a35d-e088-4d16-a057-0578c5cf4b08",
                        "title":  "Course Information",
                        "kind":  "module",
                        "depth":  0,
                        "children":  [
                                         {
                                             "id":  "i4ca4182f-62fa-4dee-9653-0a92626d413c",
                                             "title":  "Disclaimer",
                                             "kind":  "html",
                                             "depth":  1,
                                             "identifierRef":  "i1bb7e054-49cb-4612-acb9-69a00b81c3a7_R",
                                             "resource":  {
                                                              "identifierRef":  "i1bb7e054-49cb-4612-acb9-69a00b81c3a7_R",
                                                              "hrefs":  [
                                                                            "сontent/i798b6ea7-edd4-4ad1-bb72-b48a381b0b19/Content/section_115.html"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "i81f1854f-3950-4374-bf9f-a8494f38ab2f",
                                             "title":  "Course outline (MUST READ)",
                                             "kind":  "pdf",
                                             "depth":  1,
                                             "identifierRef":  "i585cccfd-3f7b-4d8c-9650-f3942675c85d_R",
                                             "resource":  {
                                                              "identifierRef":  "i585cccfd-3f7b-4d8c-9650-f3942675c85d_R",
                                                              "hrefs":  [
                                                                            "сontent/i99b0af31-4d98-4547-88a4-c26ee05e28d0/FS35 outline (summer school).pdf"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "i13e8047b-819b-47ab-830d-f23ba064dbb8",
                                             "title":  "How to Be Successful in an Independent Study Course (1)",
                                             "kind":  "pdf",
                                             "depth":  1,
                                             "identifierRef":  "if3bb5ca3-9131-47d3-b835-bb82ae016e7a_R",
                                             "resource":  {
                                                              "identifierRef":  "if3bb5ca3-9131-47d3-b835-bb82ae016e7a_R",
                                                              "hrefs":  [
                                                                            "сontent/id802b638-4042-4fe7-a1f2-9f9ec9f038ff/How to Be Successful in an Independent Study Course (1).pdf"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "i62e5b691-2a8f-4973-a88d-7eb018dddc18",
                                             "title":  "Assignment Submission",
                                             "kind":  "html",
                                             "depth":  1,
                                             "identifierRef":  "i75812f83-54b1-4df5-87e1-1be471847ac8_R",
                                             "resource":  {
                                                              "identifierRef":  "i75812f83-54b1-4df5-87e1-1be471847ac8_R",
                                                              "hrefs":  [
                                                                            "сontent/ia7111e00-26da-49ec-b7b5-4b86971a1faf/Assignment Submission.html"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         }
                                     ]
                    },
                    {
                        "id":  "id63f3c6c-fcca-41bd-b883-cb8a02b377f8",
                        "title":  "1. Forensic Toxicology",
                        "kind":  "module",
                        "depth":  0,
                        "children":  [
                                         {
                                             "id":  "i6f424252-1f43-4c1b-8d13-1e48c5fec240",
                                             "title":  "Overview",
                                             "kind":  "html",
                                             "depth":  1,
                                             "identifierRef":  "i598e715d-68e3-4a06-ac89-880b05cf0c70_R",
                                             "resource":  {
                                                              "identifierRef":  "i598e715d-68e3-4a06-ac89-880b05cf0c70_R",
                                                              "hrefs":  [
                                                                            "сontent/i1cc0d3da-0402-41c1-9623-05538f2dbec6/Content/book_2/chapter_3.html"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "id38b7d6d-ac61-4238-a9f0-26bbd604ef24",
                                             "title":  "Module 1 Assignment (Print)",
                                             "kind":  "pdf",
                                             "depth":  1,
                                             "identifierRef":  "i8ddda604-2f87-46a8-b161-ef8e5520834d_R",
                                             "resource":  {
                                                              "identifierRef":  "i8ddda604-2f87-46a8-b161-ef8e5520834d_R",
                                                              "hrefs":  [
                                                                            "сontent/i52456243-2654-4885-942e-a9f26c5bf4cb/NXT FS35-3 Module 1 Assignment.pdf"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "ib488ffcc-f6ae-4bc4-9c76-cef2a8679f28",
                                             "title":  "Module 1 Assignment (Online)",
                                             "kind":  "html",
                                             "depth":  1,
                                             "identifierRef":  "i703f2ead-ea5c-4b5d-95af-9d3bc3e4f2dc_R",
                                             "resource":  {
                                                              "identifierRef":  "i703f2ead-ea5c-4b5d-95af-9d3bc3e4f2dc_R",
                                                              "hrefs":  [
                                                                            "сontent/iae1ba046-a520-46a2-a0d7-b11c6cbefc06/Module 1 Assignment (Online).html"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "i662f88c1-a966-491e-8fb3-d3355f49ba44",
                                             "title":  "Module 1: Forensic Toxicology Assessment",
                                             "kind":  "html",
                                             "depth":  1,
                                             "identifierRef":  "i54cc9b85-ff75-4908-b65f-ba43c29ef6e6_R",
                                             "resource":  {
                                                              "identifierRef":  "i54cc9b85-ff75-4908-b65f-ba43c29ef6e6_R",
                                                              "hrefs":  [
                                                                            "сontent/i4051e20c-066f-40bf-b637-c607b7743ae4/Content/book_2/chapter_5.html"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "i6f01775b-553e-498d-8e80-7b7a6b4422d5",
                                             "title":  "M1 Assignment Submission",
                                             "kind":  "assignment",
                                             "depth":  1,
                                             "identifierRef":  "i7b47d122-3cad-41ae-8ad9-932be31fa2f9_R",
                                             "resource":  {
                                                              "identifierRef":  "i7b47d122-3cad-41ae-8ad9-932be31fa2f9_R",
                                                              "hrefs":  [
                                                                            "assignment/i3acf59cc-be15-4305-a21e-1cf2237ee486/assignment_f472e564-10f8-4b02-a05f-28d147d97773.xml"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "ie2a08c5a-bdcc-4584-9c49-e2c2cf66f3e9",
                                             "title":  "Module 1 Forensic Toxicology Assessment",
                                             "kind":  "quiz",
                                             "depth":  1,
                                             "identifierRef":  "i23576d97-3be5-44ff-a0c5-7a18993e55c4_R",
                                             "resource":  {
                                                              "identifierRef":  "i23576d97-3be5-44ff-a0c5-7a18993e55c4_R",
                                                              "hrefs":  [
                                                                            "quiz/i9ce03756-8940-44f8-849e-038799e3180d/qti_7657b869-7c63-4c50-9e1b-4da975fdc6e3.xml"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "ibcb8f4d3-dea3-4fcb-b4f6-a63f927839b3",
                                             "title":  "Module 1 Forensic Toxicology",
                                             "kind":  "lesson",
                                             "depth":  1,
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "i39fe86b7-bf9e-4045-9d72-d5834cd06128",
                                             "title":  "Lesson A: The Effect of Illegal Drugs Upon the Human Body",
                                             "kind":  "folder",
                                             "depth":  1,
                                             "children":  [
                                                              {
                                                                  "id":  "ib6687756-c140-4050-ad9f-e901a6217810",
                                                                  "title":  "Defining Forensic Toxicology",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i4b21ee90-c738-4f8f-8008-36fe49331bed_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i4b21ee90-c738-4f8f-8008-36fe49331bed_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i6b9ab463-ab08-444a-b570-c77092b98266/Content/Lesson_9/page_38.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i8880ae53-e6ac-471d-a679-b680a9272d1f",
                                                                  "title":  "How Drugs Affect the Human Body (1)",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i61c4044b-1f79-4e0c-aa75-4d0949c670c4_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i61c4044b-1f79-4e0c-aa75-4d0949c670c4_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i85befa0a-b3e7-4f5a-ba36-65dc60566449/Content/Lesson_9/page_40.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i5d2dc3ee-3796-41a4-a159-305632cb4bc2",
                                                                  "title":  "How Drugs Affect the Human Body (2)",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "iff56508f-b772-4e40-a35a-208dbe2be348_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "iff56508f-b772-4e40-a35a-208dbe2be348_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i1df46601-c0f6-437a-a946-0267fc5ca1a9/Content/Lesson_9/page_42.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i80d10ac4-df18-4e3c-bc7f-d991cf3b248c",
                                                                  "title":  "Psychoactive Drugs",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i6a239930-a6e7-4350-baf4-b96805f63b7e_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i6a239930-a6e7-4350-baf4-b96805f63b7e_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i91d6b5d1-a70a-4820-8701-4ea7952c6b95/Content/Lesson_9/page_44.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "ied868991-ca17-47eb-86c9-6e3b494c3fb0",
                                                                  "title":  "Depressants",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "ib65f03ce-3928-42d5-951c-2a9c9224c8fe_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "ib65f03ce-3928-42d5-951c-2a9c9224c8fe_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i0de00804-4162-4c31-a0c7-d393db1b3d14/Content/Lesson_9/page_45.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i8d94ed80-44f6-499a-956c-bbb3a6a7452e",
                                                                  "title":  "Opiates",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i3dc2c913-a986-4beb-8aec-a2f076c20d3f_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i3dc2c913-a986-4beb-8aec-a2f076c20d3f_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/ib2fc3146-037b-4240-8532-b687b0b66f59/Content/Lesson_9/page_46.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i39b78405-95a0-4bf7-90e1-7158d8566bfd",
                                                                  "title":  "Marijuana",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i3631105a-d424-4c28-8f5e-185621ce8e07_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i3631105a-d424-4c28-8f5e-185621ce8e07_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i10f6f0c3-bf3e-424a-8c20-fefda9b052b7/Content/Lesson_9/page_47.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i7990e00e-d5be-48a5-bd0d-b582006e8ad6",
                                                                  "title":  "Barbiturates",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i27f32db4-aceb-4ebc-849e-5730f549b93d_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i27f32db4-aceb-4ebc-849e-5730f549b93d_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/ie220cd46-f93d-486a-84d0-8bea76c33179/Content/Lesson_9/page_55.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "ie0127eb3-1841-4520-9d8c-3fcbd71f4a5f",
                                                                  "title":  "Stimulants",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "ieb94e1a6-f4d3-4a6a-92aa-aa7875eef735_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "ieb94e1a6-f4d3-4a6a-92aa-aa7875eef735_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/ia7a34ea9-8ceb-4288-b983-5a5d3b4104ee/Content/Lesson_9/page_49.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "ia7826c43-4f1d-4436-a6a1-de1672fe5efe",
                                                                  "title":  "Cocaine",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i1cb35d03-a63e-472f-aea1-da7e8b7979c6_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i1cb35d03-a63e-472f-aea1-da7e8b7979c6_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i66fc6671-5c16-4d15-a6fc-5c6e61555101/Content/Lesson_9/page_50.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i05cf3ff9-9373-438e-b2ec-e66d2e78e42b",
                                                                  "title":  "Amphetamines",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i69a120d8-a8db-4c4d-bc8c-6f7c58304af8_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i69a120d8-a8db-4c4d-bc8c-6f7c58304af8_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/idda4d460-e174-42d3-b6b1-2a791daeafbb/Content/Lesson_9/page_56.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "if5eb3a48-5877-4262-b020-114e30e744de",
                                                                  "title":  "Drug Use and Crime",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i6fff3eec-46ab-4ebf-b4a9-0139cd29db11_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i6fff3eec-46ab-4ebf-b4a9-0139cd29db11_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/iace930a3-17db-4f6a-a595-6c04c21c41cd/Content/Lesson_9/page_52.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i50df6908-15d6-43df-a01c-cd19c2a1635b",
                                                                  "title":  "Case Study: Drug-Impaired Driving - A Deadly Mix",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "id36d6680-d93e-456a-af1f-756eaefbf4a2_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "id36d6680-d93e-456a-af1f-756eaefbf4a2_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i49561369-e0cc-4720-ac81-2cae2f032490/Content/Lesson_9/page_53.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i138f6df4-b15b-4636-bd39-159a4e05119a",
                                                                  "title":  "A. The Effects of Illegal Drugs Upon the Human Body Quiz",
                                                                  "kind":  "quiz",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i6ec05b9d-9ae2-481b-a095-146c6230fb80_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i6ec05b9d-9ae2-481b-a095-146c6230fb80_R",
                                                                                   "hrefs":  [
                                                                                                 "quiz/i7df7a07c-b722-4055-853c-ccb9b82a957e/qti_852249e6-acf9-4526-8ba8-c078cca5d7f6.xml"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              }
                                                          ]
                                         },
                                         {
                                             "id":  "ifba708d8-e610-44cc-8960-275d33f107a5",
                                             "title":  "Lesson B: The Effects of Poisons and Toxins",
                                             "kind":  "folder",
                                             "depth":  1,
                                             "children":  [
                                                              {
                                                                  "id":  "i5f2731d0-47c9-4200-ba70-4e9d7399624a",
                                                                  "title":  "What is a Poison?",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i49f6534a-a236-4dad-8349-810d7a26047d_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i49f6534a-a236-4dad-8349-810d7a26047d_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/id72c4bad-decf-4587-8c90-c1b3a4ccf6ba/Content/Lesson_10/page_57.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i7001d90b-68f5-4379-947c-2d3e7152d743",
                                                                  "title":  "Examples of Poisons",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "ibad051af-489f-4c07-9df0-7c864c64ea7b_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "ibad051af-489f-4c07-9df0-7c864c64ea7b_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i15878b93-f9d9-4370-a886-d44a5c985e10/Content/Lesson_10/page_60.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i5effe735-88c6-4e49-8280-5ee9f6430daf",
                                                                  "title":  "Common Poisons",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i0f164e3e-4b38-4290-8682-421ec59fbe33_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i0f164e3e-4b38-4290-8682-421ec59fbe33_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i1edebdc3-d746-49a9-890d-afb65ed5db62/Content/Lesson_10/page_63.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "id32bbe50-0ac8-401f-a177-a8227d7c7941",
                                                                  "title":  "Incidence of Poisoning",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i847502ad-85d3-4cb7-8936-808c0ae1bad9_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i847502ad-85d3-4cb7-8936-808c0ae1bad9_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i00639453-9984-4de4-bc8f-ee866e389c59/Content/Lesson_10/page_62.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "ia0ed20ca-8ce9-4b4c-a5fd-443ff392a318",
                                                                  "title":  "Case Study: The Tylenol Murders",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i42bb8ee9-4bf2-4d9f-be38-9a00a970f59a_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i42bb8ee9-4bf2-4d9f-be38-9a00a970f59a_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/icd32e0a4-49e4-402b-bd2b-dc6358fa29fe/Content/Lesson_10/page_65.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i3551e8a5-84b4-4aff-bfaf-b85c6fe1b129",
                                                                  "title":  "B. The Effects of Poisons and Toxins Quiz",
                                                                  "kind":  "quiz",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i0a4bc09e-fed8-4439-98de-04eecbf41e97_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i0a4bc09e-fed8-4439-98de-04eecbf41e97_R",
                                                                                   "hrefs":  [
                                                                                                 "quiz/ic11f2fcc-51e4-429a-8c91-2d7f2d8ad3c5/qti_a5e535c6-d734-4e86-8a4a-a56cb67771b9.xml"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              }
                                                          ]
                                         },
                                         {
                                             "id":  "i1dc86d9e-5104-4cee-a550-2254062a6d1e",
                                             "title":  "Lesson C: Forensic Toxicology Testing Techniques",
                                             "kind":  "folder",
                                             "depth":  1,
                                             "children":  [
                                                              {
                                                                  "id":  "ie83dbe61-6db0-42bb-bc67-fec83db9c031",
                                                                  "title":  "The Role of Toxicology in Forensic Investigations",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i71c16799-4999-4733-97dd-7a54c9eed812_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i71c16799-4999-4733-97dd-7a54c9eed812_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i74559aae-5e54-463b-917a-aa0540afa64b/Content/Lesson_11/page_68.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i824c46de-1300-4cfd-b483-39cbeb29cad8",
                                                                  "title":  "Extraction of Drugs, Toxins, or Poisons",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i8ff94985-798d-4ba2-9420-f8b37386663a_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i8ff94985-798d-4ba2-9420-f8b37386663a_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/iaec122a3-f9c9-42c5-b873-4dbf6d48e30f/Content/Lesson_11/page_70.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i552a7c6a-919b-4b56-9f8b-57c9afbd90ce",
                                                                  "title":  "Initial Screening for Drugs or Poisons",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i6b7ff2f4-8b9c-4552-8c1d-fd5a3a6e37e2_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i6b7ff2f4-8b9c-4552-8c1d-fd5a3a6e37e2_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i3623f618-9b81-4e78-a431-88a905ea07cd/Content/Lesson_11/page_71.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i171ff6f8-fe0e-4beb-b7ee-c9a4b1092f72",
                                                                  "title":  "Colour Testing",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i78f4915f-5869-4fae-9012-2920ae474e22_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i78f4915f-5869-4fae-9012-2920ae474e22_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i6fff40f9-9335-4937-8c26-3f4c1b1ccad7/Content/Lesson_11/page_72.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "iab687d2e-dc20-4cb2-8e47-4dff522181d7",
                                                                  "title":  "Microcrystallline Testing",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "if198d9ab-30e2-4288-903b-b7e0b43c9a17_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "if198d9ab-30e2-4288-903b-b7e0b43c9a17_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i16ef244c-e2c1-4044-864d-d2eaaca2443c/Content/Lesson_11/page_73.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "if93c53a4-9dbf-4e2b-8b31-5b81643d14ef",
                                                                  "title":  "Immunoassay Testing",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i01610dcd-ddd0-4e4d-a2e7-152d665f5633_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i01610dcd-ddd0-4e4d-a2e7-152d665f5633_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i0c8a099a-e2a8-4dc3-b91a-aa375badf979/Content/Lesson_11/page_74.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i306153fc-af5d-4047-bf9f-ad5cd5f98d08",
                                                                  "title":  "Gas Chromatography",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i249752c1-d378-45f8-82e5-fcc42c647094_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i249752c1-d378-45f8-82e5-fcc42c647094_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i5268e070-7860-404a-b8ab-f945b2618a86/Content/Lesson_11/page_76.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "id8b3ab06-2d72-4317-8900-f72ee88c47b0",
                                                                  "title":  "Confirmation Testing for Drugs, Toxins, or Poisons",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "ia5d55cc6-a4b7-4be5-8072-2acee4afa5f3_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "ia5d55cc6-a4b7-4be5-8072-2acee4afa5f3_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i811657b2-d1a8-43e8-99a6-e510747b745d/Content/Lesson_11/page_78.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "ib91fdc1f-bb16-430b-9803-1093da2f93c3",
                                                                  "title":  "Mass Spectrometry",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "if4f8e94d-1c35-4350-931b-bcba82ed204c_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "if4f8e94d-1c35-4350-931b-bcba82ed204c_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i9a588742-b75c-4318-b87d-8eaf7b1ef841/Content/Lesson_11/page_79.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i31dd4e3e-9f1c-4f2e-a65a-a56e67d2306a",
                                                                  "title":  "Criminal Case Study -  Poisoning of an Ex KGB Agent",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i962b7363-7679-4f3c-92b6-251facf43a87_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i962b7363-7679-4f3c-92b6-251facf43a87_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i23ad958c-d932-4494-861a-c4da7e60e9a9/Content/Lesson_12/page_82.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "ib45ce147-a016-4531-8850-c74b536fe900",
                                                                  "title":  "C. Forensic Toxicology Testing Techniques",
                                                                  "kind":  "quiz",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i4578b38c-d6cd-4f69-87b6-430a0f5269a9_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i4578b38c-d6cd-4f69-87b6-430a0f5269a9_R",
                                                                                   "hrefs":  [
                                                                                                 "quiz/i7f444df0-0e63-474a-859c-06ffa2fb6b5c/qti_3e3ac1f8-fc71-4bda-a0ac-7064f033ac56.xml"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              }
                                                          ]
                                         },
                                         {
                                             "id":  "i055d733d-1feb-4a1f-b6f8-9fa9db7db25c",
                                             "title":  "Lesson D: Criminal Case Studies Involving Forensic Toxicology",
                                             "kind":  "folder",
                                             "depth":  1,
                                             "children":  [
                                                              {
                                                                  "id":  "ib6384ea4-6664-4da3-a4d7-539da16f31f3",
                                                                  "title":  "Case Studies Overview",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "ide6281b7-2271-4d7c-8bbf-8060553d93be_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "ide6281b7-2271-4d7c-8bbf-8060553d93be_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i82e339d9-12b3-4d5f-93b7-372a11cb40f7/Content/Lesson_12/page_81.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i37aed3b0-8d53-4f41-a472-bef56e0b2d40",
                                                                  "title":  "Case Study #1 The Poisoning of a Politician",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "iac52dd5a-5afa-4b95-93dc-22a006443c51_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "iac52dd5a-5afa-4b95-93dc-22a006443c51_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/ie264ae97-57c7-42c9-bf5e-5c7a18f2a0c4/Content/Lesson_12/page_87.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i2bb827ed-b0cf-436f-8a2f-7d8e951039ec",
                                                                  "title":  "Case Study #2 The Jonestown Tragedy",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "icc2ef3cc-25c4-45e0-af22-8568d607686f_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "icc2ef3cc-25c4-45e0-af22-8568d607686f_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/if68900e5-4bc2-430e-b2fc-d182cb9f7bf4/Content/Lesson_12/page_85.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "ie1eb0176-fef5-4e98-a89f-594ccf50e4fc",
                                                                  "title":  "Case Study #3: Drug Overdose or Intentional Poisoning ? That is the Question",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i670cc419-db6e-4cb5-b860-79f6aa2a701f_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i670cc419-db6e-4cb5-b860-79f6aa2a701f_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i1aeeb331-1e37-463e-8194-8847bb5a0f96/Case Study 3 Drug Overdose or Intentional Poisoning  That is the Question.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i9cfcb880-17c6-4145-b3d2-8bebb09690d8",
                                                                  "title":  "D. Crime Case Studies Involving Forensic Toxicology Quiz",
                                                                  "kind":  "quiz",
                                                                  "depth":  2,
                                                                  "identifierRef":  "ic24dc34c-35ae-4ed0-8bc7-8c7ddc67fac0_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "ic24dc34c-35ae-4ed0-8bc7-8c7ddc67fac0_R",
                                                                                   "hrefs":  [
                                                                                                 "quiz/i63814fb1-4578-4b00-b96c-271220346b44/qti_17a42f7c-4a6b-4ba4-851f-62104ee74647.xml"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              }
                                                          ]
                                         }
                                     ]
                    },
                    {
                        "id":  "i5d6b1ea9-5095-4ad4-8ec9-89a06c737a8c",
                        "title":  "2. Law Enforcement Equipment",
                        "kind":  "module",
                        "depth":  0,
                        "children":  [
                                         {
                                             "id":  "ic91612c2-9aaa-4174-b1d8-37f75550d3c6",
                                             "title":  "Overview",
                                             "kind":  "html",
                                             "depth":  1,
                                             "identifierRef":  "i299db24a-7f98-44ea-9c80-12558f851eb1_R",
                                             "resource":  {
                                                              "identifierRef":  "i299db24a-7f98-44ea-9c80-12558f851eb1_R",
                                                              "hrefs":  [
                                                                            "сontent/idcee46cb-0182-4729-94a4-a577eb36c986/Content/book_3/chapter_6.html"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "i27345b5b-9665-4ab6-a65a-715e1d61b1ba",
                                             "title":  "Module 2 Assignment",
                                             "kind":  "pdf",
                                             "depth":  1,
                                             "identifierRef":  "i0610ede0-09bd-4e21-b040-29fbc98cefb1_R",
                                             "resource":  {
                                                              "identifierRef":  "i0610ede0-09bd-4e21-b040-29fbc98cefb1_R",
                                                              "hrefs":  [
                                                                            "сontent/i9d7bb690-e4ea-414f-b8a8-334ca3b7f49f/NXT FS35-3 Module 2 Assignment - Copy.pdf"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "ie48c2ed6-a2df-458d-9666-8f56003916b9",
                                             "title":  "Module 2 Assignment (Online)",
                                             "kind":  "html",
                                             "depth":  1,
                                             "identifierRef":  "i3d537c82-2b1c-435c-b078-a5ebdce7246d_R",
                                             "resource":  {
                                                              "identifierRef":  "i3d537c82-2b1c-435c-b078-a5ebdce7246d_R",
                                                              "hrefs":  [
                                                                            "сontent/i5b868f43-fb54-4dee-8384-cd5a40dae987/Module 2 Assignment (Online).html"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "i9e3cbaa9-dc26-433a-99b6-9135302a9125",
                                             "title":  "Module 2 Assessment",
                                             "kind":  "html",
                                             "depth":  1,
                                             "identifierRef":  "ie3938653-1b8f-4464-a016-b725fe1696a9_R",
                                             "resource":  {
                                                              "identifierRef":  "ie3938653-1b8f-4464-a016-b725fe1696a9_R",
                                                              "hrefs":  [
                                                                            "сontent/i2dfd85cb-a6c4-4a98-8710-2d1d7fb3da73/Module 2 Assessment.html"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "i9d29c918-d6d0-49af-9a6a-e7c921f606b8",
                                             "title":  "M2 Assignment Submission",
                                             "kind":  "assignment",
                                             "depth":  1,
                                             "identifierRef":  "i02156708-35c2-4dd2-a31b-251e89baef7b_R",
                                             "resource":  {
                                                              "identifierRef":  "i02156708-35c2-4dd2-a31b-251e89baef7b_R",
                                                              "hrefs":  [
                                                                            "assignment/i0d13383d-713c-4b67-989e-833b135fa42b/assignment_47c57ef5-f797-429b-8a84-73246e9fc1d9.xml"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "i5272a57e-ad2c-442c-a7dc-7ec04a36777e",
                                             "title":  "Module 2 Law Enforcement Equipment",
                                             "kind":  "lesson",
                                             "depth":  1,
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "ia366e21e-7bd6-4349-8411-11dcf07dc70d",
                                             "title":  "Module 2 Law Enforcement Equipment Assessment",
                                             "kind":  "quiz",
                                             "depth":  1,
                                             "identifierRef":  "ie8a00141-872f-48d8-a147-5cf9bffcb243_R",
                                             "resource":  {
                                                              "identifierRef":  "ie8a00141-872f-48d8-a147-5cf9bffcb243_R",
                                                              "hrefs":  [
                                                                            "quiz/i85bb0d48-5294-4741-a1a8-fc118351db50/qti_2a1ad64b-bdda-457c-b026-000e20ef9a1f.xml"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "icad40de1-ab1f-497f-9d89-664db8683b3d",
                                             "title":  "Lesson A: Bullet-Resistant Vests",
                                             "kind":  "folder",
                                             "depth":  1,
                                             "children":  [
                                                              {
                                                                  "id":  "i02cdabca-2d47-4e48-8d3d-a9af7fdbeeb0",
                                                                  "title":  "Body Armour",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "ic901bbef-40e6-47e1-b617-0a800d29364c_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "ic901bbef-40e6-47e1-b617-0a800d29364c_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/iae919666-c131-4040-9224-1dbffccbf195/Content/Lesson_13/page_88.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "id9f73ba9-8f44-4746-95ed-67c6512d6306",
                                                                  "title":  "Bullet-Resistant Vest",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i7b2ff934-2846-41d7-9efe-22b6a83c80e7_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i7b2ff934-2846-41d7-9efe-22b6a83c80e7_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i43212b97-8225-466a-a764-9c44ee5780eb/Content/Lesson_13/page_90.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i105b60c7-a3cf-4461-8509-8fd88213be30",
                                                                  "title":  "The Invention and Make-up of Kevlar",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "ib82b6360-b93c-44f3-9a63-cf11999b1525_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "ib82b6360-b93c-44f3-9a63-cf11999b1525_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i42e019ee-6a3a-4786-a7ac-8d54921d4f57/Content/Lesson_13/page_93.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i04534f3e-dc1b-4793-b3cf-e4796b7250da",
                                                                  "title":  "Properties and Uses of Kevlar",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i38f03f40-f89e-442d-809b-a354041a13d1_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i38f03f40-f89e-442d-809b-a354041a13d1_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/ie1933266-5c5d-4be2-bb1a-616ae0fcb158/Content/Lesson_13/page_94.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i5f521350-14ad-4951-bcd9-69326df05c82",
                                                                  "title":  "Case Study: Testing of the First Bullet-Resistant Vest",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "icd1c324d-7bde-467f-a2f3-0222521d19c9_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "icd1c324d-7bde-467f-a2f3-0222521d19c9_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/iaa717c57-be8c-49f6-8571-5abdae7c336f/Content/Lesson_13/page_96.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "ib13c0b6f-d22a-4b50-b657-abd394835109",
                                                                  "title":  "A. Bullet-Resistant Vests Quiz",
                                                                  "kind":  "quiz",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i36295ba4-b7a9-4238-a553-f35c401473a1_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i36295ba4-b7a9-4238-a553-f35c401473a1_R",
                                                                                   "hrefs":  [
                                                                                                 "quiz/i7d3ee5c8-eb22-43fb-a518-57c3c33ec831/qti_bbe527b8-3897-4bf8-9efc-89a143e4b72a.xml"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              }
                                                          ]
                                         },
                                         {
                                             "id":  "ie2224568-26c1-4312-a7ef-f608d0f8ca6c",
                                             "title":  "Lesson B. The Conducted Energy Device (CED)",
                                             "kind":  "folder",
                                             "depth":  1,
                                             "children":  [
                                                              {
                                                                  "id":  "i4c279ffe-d1fe-42c4-89e1-addcc7ea6f12",
                                                                  "title":  "The Conducted Energy Device (CED)",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i4fe3fcba-a98f-44e4-ada6-e9b91ec67700_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i4fe3fcba-a98f-44e4-ada6-e9b91ec67700_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i5bde860d-777c-4ba8-b7c2-c2c309c6d9c1/Content/Lesson_14/page_97.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "id8864a19-2c70-4d84-87c5-afca08eff91b",
                                                                  "title":  "Principles Behind CED Function",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i360b4e9e-f171-4235-8403-c651ce48330a_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i360b4e9e-f171-4235-8403-c651ce48330a_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/icf4127db-4f24-48a7-bb8f-c6c762c137e0/Content/Lesson_14/page_99.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i355885ca-3a61-41cf-a25c-571371ab32be",
                                                                  "title":  "Police Use of the CED",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i9f696f37-843f-478f-936f-6558e8fe0f1a_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i9f696f37-843f-478f-936f-6558e8fe0f1a_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i70d8d3fc-b336-4a6d-8038-62907b896765/Content/Lesson_14/page_101.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i72792370-1013-4e79-a70e-7d96340d2979",
                                                                  "title":  "Other Unique Uses of the CED",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i8aac89d0-5cb1-48bb-9e67-7e6a19b9d280_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i8aac89d0-5cb1-48bb-9e67-7e6a19b9d280_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/icaae23e5-0302-4239-819f-cfb8cbb385b0/Other Unique Uses of the CED.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i0fb368f8-923b-4ef4-8431-2ad763dae25d",
                                                                  "title":  "Crime Case Study: The Axe Wielding Parolee",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i63e8963e-840f-4eaf-bb4b-fd6b8b18c6b5_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i63e8963e-840f-4eaf-bb4b-fd6b8b18c6b5_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i6c238259-a7ac-4aaa-83f4-2b5a5a103179/Crime Case Study The Axe Wielding Parolee.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i737f76aa-c02c-4197-8909-4c3e96382955",
                                                                  "title":  "B. The Conducted Energy Device (CED) Quiz",
                                                                  "kind":  "quiz",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i36675d65-a8f9-46aa-a7fe-d77d4a17963f_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i36675d65-a8f9-46aa-a7fe-d77d4a17963f_R",
                                                                                   "hrefs":  [
                                                                                                 "quiz/i05125139-9394-4b06-bac6-32a7c5e2e2ae/qti_bd94872a-d802-415c-9665-98ccb0758d38.xml"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              }
                                                          ]
                                         },
                                         {
                                             "id":  "i0012a036-6a20-4f5c-bf79-c7d355ad1d88",
                                             "title":  "Lesson C: Pepper Spray and Tear Gas",
                                             "kind":  "folder",
                                             "depth":  1,
                                             "children":  [
                                                              {
                                                                  "id":  "if48b9581-3e74-478c-bf8b-e9f226c68247",
                                                                  "title":  "Pepper Spray",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i82867ad2-b356-4ae3-8b15-13dae7c02e09_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i82867ad2-b356-4ae3-8b15-13dae7c02e09_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i76edd222-96b9-4d58-9ff5-923553a3a392/Content/Lesson_15/page_103.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "if8ee4c91-7f51-49f1-af55-9314dca5a36d",
                                                                  "title":  "Physiological Effects of Pepper Spray",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i7aba7960-afcd-4946-83d4-ac231ea1fd82_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i7aba7960-afcd-4946-83d4-ac231ea1fd82_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i2d0eaadb-9a50-4235-b424-67440dd3be04/Content/Lesson_15/page_105.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "iee328258-342c-4a22-a807-936b0d4d598f",
                                                                  "title":  "Practical Use of Pepper Spray by Police",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "ib4d928a6-f37c-4074-9b62-6aef7e08ea4d_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "ib4d928a6-f37c-4074-9b62-6aef7e08ea4d_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i8d8b8919-825f-4250-b7ec-0ef3314db33d/Content/Lesson_15/page_107.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "ib0fa7d85-f8c2-47e6-b46f-7e78bfabc143",
                                                                  "title":  "Risks Related to Pepper Spray Exposure",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i287ec2cb-4f37-4342-baaa-a643113c42e8_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i287ec2cb-4f37-4342-baaa-a643113c42e8_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i930d288b-fa75-4a13-a7ae-8c6d95023ba2/Content/Lesson_15/page_109.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i8618cd78-6499-47c9-a7af-2e1fe14e2c86",
                                                                  "title":  "Tear Gas",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i29a3354b-e4ef-4723-bf77-7af8e582a04d_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i29a3354b-e4ef-4723-bf77-7af8e582a04d_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/ifb25fb0c-9dc5-4c2b-90b9-267a12b20176/Content/Lesson_16/page_110.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "if71eabd4-5074-40d8-921a-1e65b02ef9ff",
                                                                  "title":  "Properties of Tear Gas",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "idd56febb-59e7-4e46-9383-5adcb29e8d50_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "idd56febb-59e7-4e46-9383-5adcb29e8d50_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/ic463b5fb-b4a8-42a5-a685-c3daebd81b69/Content/Lesson_16/page_111.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i8013ea06-0175-4c22-8b4d-06b8a93ac093",
                                                                  "title":  "Physiological Effects of Tear Gas Exposure",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "ie86b31df-d342-4c32-8a1c-57104a8070c9_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "ie86b31df-d342-4c32-8a1c-57104a8070c9_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i4d950c80-d47d-452e-817d-e0f4ccefde5e/Content/Lesson_16/page_113.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i60eae0ae-d8a7-4671-9c7e-677069275427",
                                                                  "title":  "Practical Use of Tear Gas by Police",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "ifff5a6e9-2fde-4450-aebc-b948990b542a_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "ifff5a6e9-2fde-4450-aebc-b948990b542a_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i0e9423b4-4198-4ee9-a0fe-f5ebf09047e9/Content/Lesson_16/page_115.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i9959d36f-4f63-46e5-aa38-23265d0823a9",
                                                                  "title":  "Effects of Exposure to Tear Gas",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "ia5541a33-9f98-4b9d-8690-e082bef2caf1_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "ia5541a33-9f98-4b9d-8690-e082bef2caf1_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i67ebf2a9-2d2c-42e0-b961-7aa8694cd3ce/Content/Lesson_16/page_116.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i4bba32b1-2cec-47d4-aecd-06bba1485658",
                                                                  "title":  "Crime Case Study: Tear Gas - The 1997 APEC Summit",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i9de24f2b-10ae-4b70-bd26-f9cd0663ce17_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i9de24f2b-10ae-4b70-bd26-f9cd0663ce17_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i0ef20174-7b01-41e2-947d-ac3c931bf0dd/Crime Case Study Tear Gas - The 1997 APEC Summit.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "idff60db0-7b08-4f11-82cd-604bf738cfd8",
                                                                  "title":  "C. Pepper Spray and Tear Gas Quiz",
                                                                  "kind":  "quiz",
                                                                  "depth":  2,
                                                                  "identifierRef":  "ia6713549-3bb5-45a3-9208-55fbb28c0d88_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "ia6713549-3bb5-45a3-9208-55fbb28c0d88_R",
                                                                                   "hrefs":  [
                                                                                                 "quiz/i24336f07-e37c-497e-b5ec-690cd3fb9bda/qti_ea6a8220-f1f6-4e9c-bc7d-3a2e0ba8a0d1.xml"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              }
                                                          ]
                                         },
                                         {
                                             "id":  "if4d57995-42a9-4832-990f-3d444c6c2ae2",
                                             "title":  "Lesson D:  Case Study Involving Law Enforcement Safety Equipment",
                                             "kind":  "folder",
                                             "depth":  1,
                                             "children":  [
                                                              {
                                                                  "id":  "i2f841cca-0fa9-487a-9106-617f5305c04d",
                                                                  "title":  "Overview",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i6967bd9e-8802-46e1-993e-565471e0adc7_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i6967bd9e-8802-46e1-993e-565471e0adc7_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i5fd116b3-5611-4f7a-8b96-d3be229b8361/Content/Lesson_17/page_118.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i1e9ba895-0337-4c20-b968-6aa56985e02d",
                                                                  "title":  "Case Study: The North Hollywood Shootout",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i87c66069-b39d-44da-8380-182c0320b8f1_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i87c66069-b39d-44da-8380-182c0320b8f1_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/ia9019c09-86dc-48f8-acc2-fe3cb9bd4969/Content/Lesson_17/page_119.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i79f7603f-7793-44f1-ae61-2456f30bc44b",
                                                                  "title":  "Case Study: Murder Suspect Spends 48 Hours on a Crane",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "ic9917b4b-00cb-40ad-8de1-3f6488d8a6c1_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "ic9917b4b-00cb-40ad-8de1-3f6488d8a6c1_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i781f0c3b-3c6d-4ce8-89c4-ffece936d9ca/Case Study Murder Suspect Spends 48 Hours on a Crane.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i0cbb1e59-faf4-4b7c-8240-e6692c8b8eb6",
                                                                  "title":  "Case Study: Police Response to a \"Party out of Control\"",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i8349f93e-99b7-4113-b47e-59d733f69633_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i8349f93e-99b7-4113-b47e-59d733f69633_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/ib09cb6d2-f6ff-4d7a-a99e-e0e577f3832e/Case Study Police Response to a Party out of Control.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i6cb6b93c-9e64-4453-b24a-8d29d5ed14e8",
                                                                  "title":  "D. Case Study Involving Law Enforcement Safety Equipment",
                                                                  "kind":  "quiz",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i896778e1-e754-4ce1-b718-da2b585f5302_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i896778e1-e754-4ce1-b718-da2b585f5302_R",
                                                                                   "hrefs":  [
                                                                                                 "quiz/ide3f7e25-97cc-4e10-bffb-2f2742be1297/qti_c368b1ee-1f5c-4fd9-bf6a-f99b00660bbd.xml"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              }
                                                          ]
                                         }
                                     ]
                    },
                    {
                        "id":  "id0a347a8-06f2-498d-874f-61624425a604",
                        "title":  "3. Arson and Explosives",
                        "kind":  "module",
                        "depth":  0,
                        "children":  [
                                         {
                                             "id":  "i83616b7b-4382-41d1-ac5c-d2400e9c9fd2",
                                             "title":  "Overview",
                                             "kind":  "html",
                                             "depth":  1,
                                             "identifierRef":  "i06155221-8304-4440-b2b8-632d969b5620_R",
                                             "resource":  {
                                                              "identifierRef":  "i06155221-8304-4440-b2b8-632d969b5620_R",
                                                              "hrefs":  [
                                                                            "сontent/i7f8f0169-e345-4c5f-b663-7e56c371109f/Content/book_4/chapter_9.html"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "i6854a4f1-613b-4905-b79b-08055f71085c",
                                             "title":  "Module 3 Assignment",
                                             "kind":  "pdf",
                                             "depth":  1,
                                             "identifierRef":  "ib9428d20-bff0-4331-b2f8-4799bd2c6cbc_R",
                                             "resource":  {
                                                              "identifierRef":  "ib9428d20-bff0-4331-b2f8-4799bd2c6cbc_R",
                                                              "hrefs":  [
                                                                            "сontent/i2d93491b-9486-496f-93d5-1da498a68375/NXT FS35-3 Module 3 Assignment - Copy.pdf"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "i292a0d6a-b569-4d6e-86b0-d2dadc5c7ba2",
                                             "title":  "Module 3 Assignment (Online)",
                                             "kind":  "html",
                                             "depth":  1,
                                             "identifierRef":  "i8a4b4161-c534-46cb-be9b-dd305b8c2762_R",
                                             "resource":  {
                                                              "identifierRef":  "i8a4b4161-c534-46cb-be9b-dd305b8c2762_R",
                                                              "hrefs":  [
                                                                            "сontent/id8143c17-8c3c-4511-a1d2-cfb13de39cca/Module 3 Assignment (Online).html"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "ifd2a2c49-4fe0-4756-94fc-a68d275c5ccc",
                                             "title":  "Module 3 Assessment",
                                             "kind":  "html",
                                             "depth":  1,
                                             "identifierRef":  "i742f1976-d04d-4ce0-a938-cdfadfef7539_R",
                                             "resource":  {
                                                              "identifierRef":  "i742f1976-d04d-4ce0-a938-cdfadfef7539_R",
                                                              "hrefs":  [
                                                                            "сontent/i45b5c2ec-3cf3-4e20-941d-5273ae5f096a/Module 3 Assessment.html"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "iae6e2eb4-94a0-4d29-aff3-d8c4bcd78e6d",
                                             "title":  "Module 3 Arson and Explosives",
                                             "kind":  "lesson",
                                             "depth":  1,
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "ibb7860d2-f0a5-4bbe-9ab4-6177a1e06375",
                                             "title":  "M3 Assignment Submission",
                                             "kind":  "assignment",
                                             "depth":  1,
                                             "identifierRef":  "ia918df16-0b58-48a7-aeb7-b73520bb9399_R",
                                             "resource":  {
                                                              "identifierRef":  "ia918df16-0b58-48a7-aeb7-b73520bb9399_R",
                                                              "hrefs":  [
                                                                            "assignment/i6928e61b-0e33-4c30-96be-9a2513ff8161/assignment_ff4a62e3-8119-4045-9b16-f1ecb70a7b22.xml"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "if0134051-84ea-4102-9d27-13b03d97a5fd",
                                             "title":  "Module 3 Arson and Explosives Assessment",
                                             "kind":  "quiz",
                                             "depth":  1,
                                             "identifierRef":  "id12181f1-da18-46e4-9a46-e674517665a9_R",
                                             "resource":  {
                                                              "identifierRef":  "id12181f1-da18-46e4-9a46-e674517665a9_R",
                                                              "hrefs":  [
                                                                            "quiz/idade441b-a493-4a4a-95f2-9ef7beb630a4/qti_274e053e-0558-46bc-bf8f-d244f484d55f.xml"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "id7b438c1-b899-42f2-b6b6-1f67ce8d723f",
                                             "title":  "Lesson A: Combustion and Arson",
                                             "kind":  "folder",
                                             "depth":  1,
                                             "children":  [
                                                              {
                                                                  "id":  "i30b9b6f6-9b39-45f8-85d9-9b07398d3309",
                                                                  "title":  "Combustion",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "ia0ac1873-97c1-4c7c-9923-d096df7f7758_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "ia0ac1873-97c1-4c7c-9923-d096df7f7758_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i7f982384-da2c-4d71-b762-5d9207cf1681/Content/Lesson_18/page_122.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i30cd73d9-f460-4444-9d4e-58f6a6bf41f6",
                                                                  "title":  "Fuel in Combustion Reactions",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i558bb9dc-a5fd-4eff-a23f-bb3a00b082f5_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i558bb9dc-a5fd-4eff-a23f-bb3a00b082f5_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i1d3b57f1-0466-407d-8a5a-5fca66a37c28/Content/Lesson_18/page_124.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i80392052-d577-424d-bb31-29b0030c6c4b",
                                                                  "title":  "Oxidents in Combustion Reactions",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i6011becd-5f90-41f8-b76b-3ece50055aba_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i6011becd-5f90-41f8-b76b-3ece50055aba_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i5daf6d07-52bf-4d3b-a3be-d85cdeb21042/Content/Lesson_18/page_127.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i00c9e3e3-f274-4846-a14d-ab558f48ed91",
                                                                  "title":  "The Products of Combustion",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i7c94dc70-f90c-4251-b77e-8c1c9a224b00_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i7c94dc70-f90c-4251-b77e-8c1c9a224b00_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/id3228c18-7e70-4678-bab7-20eccbec546b/Content/Lesson_18/page_126.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i2a2daad1-0111-4d0b-8753-31237534e119",
                                                                  "title":  "Speed of Ignition",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "iaffaa9fb-5b61-4b2e-a85b-1ab001ff692f_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "iaffaa9fb-5b61-4b2e-a85b-1ab001ff692f_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i87f5074a-ac3f-44cf-b3b1-9cf58237d6f9/Content/Lesson_18/page_129.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "if051947a-45e0-4abe-82da-d97e816f639d",
                                                                  "title":  "Sites Targeted by Arsonists",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "ib9e0b182-f3cb-41f8-a878-317ee574f84a_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "ib9e0b182-f3cb-41f8-a878-317ee574f84a_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/id2243e94-7635-488b-bf0d-f2ef503d3d7f/Content/Lesson_19/page_131.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i98ee63a2-8287-4972-9617-2aa680031e23",
                                                                  "title":  "Motives for Arson",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "icb49507d-79f8-48a0-9e48-1352a9afb0ab_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "icb49507d-79f8-48a0-9e48-1352a9afb0ab_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i88d08ae2-b710-45ea-8008-2a644f70aa98/Content/Lesson_19/page_132.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i2140cd3a-c9f1-4c8a-80ce-738528529350",
                                                                  "title":  "Profile of an Arsonist",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i57a7327d-5785-42ce-881c-66410d43b6a0_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i57a7327d-5785-42ce-881c-66410d43b6a0_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/ib3d071e4-f60e-4d59-87c0-a928f5cc8859/Content/Lesson_19/page_134.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i29b40474-613a-4409-9dd5-b181fffc5716",
                                                                  "title":  "Fatal Home Fires in Alberta",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i1373da4e-8783-407c-b678-9f0522524d50_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i1373da4e-8783-407c-b678-9f0522524d50_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i209e200e-da18-4e9f-ba1c-a3ade4968a83/Content/Lesson_19/page_136.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "ifa68fbbb-3e8d-4a70-9b51-5235e8beb174",
                                                                  "title":  "A. Combustion and Arson",
                                                                  "kind":  "quiz",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i17d1f48c-0eda-49a4-b339-0fd2da995946_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i17d1f48c-0eda-49a4-b339-0fd2da995946_R",
                                                                                   "hrefs":  [
                                                                                                 "quiz/id9984a11-803c-4318-ba23-87e3fbebf69e/qti_cfb20697-0e49-4502-9f2f-1afdac9e3c6b.xml"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              }
                                                          ]
                                         },
                                         {
                                             "id":  "i7ad5817d-7b25-4473-8489-5c2ead1ab6c1",
                                             "title":  "Lesson B: Investigating Arson Fires",
                                             "kind":  "folder",
                                             "depth":  1,
                                             "children":  [
                                                              {
                                                                  "id":  "ib0015eb6-9b80-4d50-9b57-73a162f05a59",
                                                                  "title":  "Investigating Arson Fires",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i09ccdb0b-b3f8-47f6-ab0d-2c457497afd6_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i09ccdb0b-b3f8-47f6-ab0d-2c457497afd6_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i8edd24d5-f776-4555-ad2a-1e916ab56921/Content/Lesson_20/page_138.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i98aa93dd-abc7-4200-a48e-69979cfd3379",
                                                                  "title":  "Recognition of an Arson Fire",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i39ce51ba-887e-4c0e-83a6-cd57dcb7f0dd_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i39ce51ba-887e-4c0e-83a6-cd57dcb7f0dd_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/ic6f473e7-df82-4153-b79b-4123b1aca787/Content/Lesson_20/page_140.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i7edfddfc-c668-4238-beb1-696c65e6a502",
                                                                  "title":  "Four Areas of an Arson Investigation",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i23b9acec-689c-4599-8e26-85c0620c8360_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i23b9acec-689c-4599-8e26-85c0620c8360_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i7323e8fd-0a7a-4a44-ac5f-3b2129e39acc/Content/Lesson_20/page_141.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "if3f9b9b6-ac1a-4fe3-8d69-e8e52f08a480",
                                                                  "title":  "Indoor Fire Scene Investigation Tasks",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "iff0d66fc-bd45-4412-af5b-9e540724ec1e_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "iff0d66fc-bd45-4412-af5b-9e540724ec1e_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/if0793bbd-5860-48a5-9f7c-5209e8f2935a/Content/Lesson_20/page_142.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i2f4fb717-b77b-4556-9c13-c642d40073d0",
                                                                  "title":  "Burn Patterns",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i85134302-4f49-4e82-a9b7-414f42121d90_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i85134302-4f49-4e82-a9b7-414f42121d90_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i419ff834-22e4-4b3b-98df-e289630433d5/Content/Lesson_20/page_144.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "ie3468b18-bea5-4a3d-816a-df62368167cb",
                                                                  "title":  "Great Chicago Fire",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "id9fccdda-3298-4fab-ba84-943d50983faa_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "id9fccdda-3298-4fab-ba84-943d50983faa_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/ib673f419-8d16-4e55-8ef2-fa0a70d1da4a/Content/Lesson_20/page_146.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "id4bf38d5-9e9c-4cd9-b14a-75ac578999cb",
                                                                  "title":  "Collection of Fire Scene Evidence",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i1d914fae-708e-447c-b771-c4bf43bcf6b2_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i1d914fae-708e-447c-b771-c4bf43bcf6b2_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/idf677d24-ceb4-405d-a244-3583a738d9eb/Content/Lesson_20/page_147.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "iaed4dba3-9cd9-42ad-8da7-0bf03834ffcc",
                                                                  "title":  "Analysis of Fire Scene Evidence",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i03a050e8-689d-4970-a335-1f5cb9c39f00_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i03a050e8-689d-4970-a335-1f5cb9c39f00_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i58dec3bf-2ef2-41b4-b0c7-901c9f81181f/Content/Lesson_20/page_148.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i86a9a07d-60d7-4d65-83cf-570d36c6c4cb",
                                                                  "title":  "Case Study: The Expert Fire Setter",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "ia5c4f14a-9663-45e6-9066-818418f4f574_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "ia5c4f14a-9663-45e6-9066-818418f4f574_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/ia36b8c42-104f-4e02-aed6-3117dff77628/Content/Lesson_20/page_150.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i6158d8f0-134a-4646-a35b-e050c7396ec8",
                                                                  "title":  "B. Investigating Arson Fires",
                                                                  "kind":  "quiz",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i2a14d4f5-bd13-42d6-8d75-1fb62ed96759_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i2a14d4f5-bd13-42d6-8d75-1fb62ed96759_R",
                                                                                   "hrefs":  [
                                                                                                 "quiz/i68a861c0-b69c-47df-85e2-928a1e1e7352/qti_dbdb4dde-04b0-4322-ba48-9b3a4363d7bf.xml"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              }
                                                          ]
                                         },
                                         {
                                             "id":  "ic688acc0-9a17-4e8c-99a5-59a95439f726",
                                             "title":  "Lesson C: Explosives",
                                             "kind":  "folder",
                                             "depth":  1,
                                             "children":  [
                                                              {
                                                                  "id":  "ifb8b4c6d-a1fd-45ca-aa1d-d7d532d0971a",
                                                                  "title":  "Explosives",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i6267f358-6342-4df4-9025-743f6596b75f_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i6267f358-6342-4df4-9025-743f6596b75f_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i36b0379d-8579-4c66-80ac-dcad3d75253b/Content/Lesson_21/page_151.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "ied7aa83d-4b6e-4038-bd5e-06f91cb5aa17",
                                                                  "title":  "Parts of an Explosive",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i165035f5-4643-4604-bba3-2b2185699c8f_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i165035f5-4643-4604-bba3-2b2185699c8f_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/ie740331b-3714-4693-8b6b-e9995f52838a/Content/Lesson_21/page_152.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i30ce387b-8798-41d9-a7c5-b6e0a98914a8",
                                                                  "title":  "Fire Vs Explosion",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i13746a05-e7e0-4d50-89a2-759176f217ed_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i13746a05-e7e0-4d50-89a2-759176f217ed_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i5b9fc3f2-588f-4f87-82dc-89508eafd57a/Content/Lesson_21/page_154.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i61cdab65-d1c8-4ffc-9ea2-61f336ed1f06",
                                                                  "title":  "Categories of Explosives",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i3bfaf743-3107-47da-af41-bfc190c11c31_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i3bfaf743-3107-47da-af41-bfc190c11c31_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i0d4103c5-af88-440b-8465-6e33b9663aa1/Content/Lesson_21/page_159.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "iac62f8b0-45eb-459c-91f3-be6ff343e35b",
                                                                  "title":  "Forensic Explosion Detection and Identification",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i93e373fe-b7e6-4564-a031-e89b0bbd0766_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i93e373fe-b7e6-4564-a031-e89b0bbd0766_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i9c35c415-84e2-4061-961d-46b02d279ea8/Content/Lesson_21/page_157.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i4a4f619f-019b-4e77-9cc0-3c1bfc81ef96",
                                                                  "title":  "The Lockerbie Air Disaster",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i485f6bc8-1451-4061-a7ef-47afe91735b2_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i485f6bc8-1451-4061-a7ef-47afe91735b2_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/ie2b3119d-04e5-478b-a465-9c99622ad970/The Lockerbie Air Disaster.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i555c9f6d-83ec-4d1b-8b05-e28365162f1e",
                                                                  "title":  "C. Explosives",
                                                                  "kind":  "quiz",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i5bad563b-23f8-433c-8511-308c405cdf68_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i5bad563b-23f8-433c-8511-308c405cdf68_R",
                                                                                   "hrefs":  [
                                                                                                 "quiz/i3c7f0313-6fd5-47e1-b7ca-420b44063f89/qti_0007d544-9467-4ff3-bbcc-0337e82efd8d.xml"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              }
                                                          ]
                                         },
                                         {
                                             "id":  "i0edeb747-8085-4c27-b68a-9340f4d211b3",
                                             "title":  "Lesson D: Crime Case Studies Involving Arson and Explosives",
                                             "kind":  "folder",
                                             "depth":  1,
                                             "children":  [
                                                              {
                                                                  "id":  "ia7c495e8-0e5b-4425-a5ad-daf309b99a49",
                                                                  "title":  "A Deadly Serial Arsonist",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i7a7225aa-8093-469e-9834-2de5b684cd57_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i7a7225aa-8093-469e-9834-2de5b684cd57_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i09a0a670-1b28-477b-8835-d28420d82a95/A Deadly Serial Arsonist.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i1f6d79c9-ad96-4c90-92be-cd6f31e8906b",
                                                                  "title":  "The Oklahoma City Bombing",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "if6f42e9d-e6eb-4480-a2ae-8a82e7b7dc15_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "if6f42e9d-e6eb-4480-a2ae-8a82e7b7dc15_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i6a954f47-19f4-4ed8-8ea1-676a65410dfb/The Oklahoma City Bombing.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "id5b07de1-83fb-4961-99b0-918bac637313",
                                                                  "title":  "D. Crime Case Studies Involving Arson and Explosives",
                                                                  "kind":  "quiz",
                                                                  "depth":  2,
                                                                  "identifierRef":  "iecc923e4-f8f6-4360-9c8c-cb6af13f7432_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "iecc923e4-f8f6-4360-9c8c-cb6af13f7432_R",
                                                                                   "hrefs":  [
                                                                                                 "quiz/i363b1fe0-e16d-4673-a003-db0a474efcc0/qti_9fad6894-625a-4570-9e75-589fc8f816bb.xml"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              }
                                                          ]
                                         }
                                     ]
                    },
                    {
                        "id":  "icd698330-bfaa-4152-af72-cba8bd3d777a",
                        "title":  "4. Forensic Ballistics",
                        "kind":  "module",
                        "depth":  0,
                        "children":  [
                                         {
                                             "id":  "iea20c554-62bd-4168-ac1d-3b7534b31696",
                                             "title":  "Overview",
                                             "kind":  "html",
                                             "depth":  1,
                                             "identifierRef":  "i49b843bb-811e-4ad5-b47e-5f91541cd9de_R",
                                             "resource":  {
                                                              "identifierRef":  "i49b843bb-811e-4ad5-b47e-5f91541cd9de_R",
                                                              "hrefs":  [
                                                                            "сontent/i3b29ee1f-507b-419b-b9a0-bab83b861ed4/Content/book_5/chapter_12.html"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "i83170e4c-5345-4073-9347-1a19f81a31af",
                                             "title":  "Module 4 Assignment (Print)",
                                             "kind":  "pdf",
                                             "depth":  1,
                                             "identifierRef":  "i5c1ddc7a-4b95-4d97-bf36-12006c8fb63b_R",
                                             "resource":  {
                                                              "identifierRef":  "i5c1ddc7a-4b95-4d97-bf36-12006c8fb63b_R",
                                                              "hrefs":  [
                                                                            "сontent/i11dc3b58-7fab-4f69-bc85-44133b04f33d/NXT FS35-3 Module 4 Assignment.pdf"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "i0882f127-4a09-4f34-91ba-d79220e8c82d",
                                             "title":  "Module 4 Assignment (Online)",
                                             "kind":  "html",
                                             "depth":  1,
                                             "identifierRef":  "i3665efc3-fa62-426f-91b3-56d6a1db3498_R",
                                             "resource":  {
                                                              "identifierRef":  "i3665efc3-fa62-426f-91b3-56d6a1db3498_R",
                                                              "hrefs":  [
                                                                            "сontent/i08f89347-30da-4099-baaa-8f3bc3afae82/Module 4 Assignment (Online).html"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "ia9c5b18a-2a9b-45c0-a656-d424dbe05b3c",
                                             "title":  "Module Assessment",
                                             "kind":  "html",
                                             "depth":  1,
                                             "identifierRef":  "ida7bbb67-ae7b-4060-8a35-146088c5922a_R",
                                             "resource":  {
                                                              "identifierRef":  "ida7bbb67-ae7b-4060-8a35-146088c5922a_R",
                                                              "hrefs":  [
                                                                            "сontent/if8b0b1d1-9fa9-448f-9bfc-b1f882b73a55/Content/book_5/chapter_14.html"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "icc3a28a6-27ae-4d50-a3a5-5d7a4b7a82aa",
                                             "title":  "M4 Assignment Submission",
                                             "kind":  "assignment",
                                             "depth":  1,
                                             "identifierRef":  "ibd19b557-9bb2-4b6b-b74b-5a7b13d41495_R",
                                             "resource":  {
                                                              "identifierRef":  "ibd19b557-9bb2-4b6b-b74b-5a7b13d41495_R",
                                                              "hrefs":  [
                                                                            "assignment/i2d9c8718-037d-422f-ba3e-fe55e0111030/assignment_8715ada3-b323-4c65-b3b0-2f862bf16119.xml"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "i42fb2e2a-faea-4192-8b4f-0467751b3f12",
                                             "title":  "Module 4 Ballisitic Fingerprinting and Wound Ballistics Quiz",
                                             "kind":  "lesson",
                                             "depth":  1,
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "i0a544ecf-7b09-466c-adf6-f7ed5400c561",
                                             "title":  "Module 4 Ballisitic Fingerprinting and Wound Ballistics Assessment",
                                             "kind":  "quiz",
                                             "depth":  1,
                                             "identifierRef":  "i0d9a26ac-402b-4eae-8c4b-e0b3e9bfeb20_R",
                                             "resource":  {
                                                              "identifierRef":  "i0d9a26ac-402b-4eae-8c4b-e0b3e9bfeb20_R",
                                                              "hrefs":  [
                                                                            "quiz/i9ed41d54-71bf-4ea4-9ffe-d2ec7a24a358/qti_5ce8883e-ef10-4ec3-aaf2-7185bb119a76.xml"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "i3e6f000a-aaf3-49ec-afe3-b14ec89d2f61",
                                             "title":  "Lesson A: Fire Arm Basics",
                                             "kind":  "folder",
                                             "depth":  1,
                                             "children":  [
                                                              {
                                                                  "id":  "i43bf0f5f-33e5-497d-adac-6ff17c5b5ac4",
                                                                  "title":  "Internal, External and Terminal Ballistics",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i480d8e18-177e-4a26-97ad-1545f80cd36a_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i480d8e18-177e-4a26-97ad-1545f80cd36a_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i12e1c424-69bd-448c-b74c-dd7492034a62/Content/Lesson_23/page_165.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i304ae4f8-6c3f-448f-92c0-5c3114aaffe5",
                                                                  "title":  "Hand Guns - The Revolver",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i6a06eabf-3141-4828-bc80-295436e52838_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i6a06eabf-3141-4828-bc80-295436e52838_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i949477a2-9782-4a22-8d76-c68c3fc7230e/Content/Lesson_23/page_166.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i9a2256f1-ce8f-47ea-b028-556f95279d23",
                                                                  "title":  "Hand Guns - The Pistol",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "ib04eaeda-99f2-4dba-987b-c5016fdaa68f_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "ib04eaeda-99f2-4dba-987b-c5016fdaa68f_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i815fd613-475b-4496-a128-5730d10725de/Content/Lesson_23/page_168.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "if62494d0-36b5-4fa8-b77f-d5022a7894c1",
                                                                  "title":  "Long Arms - The Rifle",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i0a9bfd7a-1a39-46b5-a052-d65b21c56f60_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i0a9bfd7a-1a39-46b5-a052-d65b21c56f60_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i7027d62b-46aa-43f7-83df-e572f704a293/Content/Lesson_23/page_170.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i26528511-5ed4-4f9a-b544-682bf4476c7c",
                                                                  "title":  "Long Arms - The Shotgun",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i5af87f74-84b8-4a6c-a49e-9b7f81f0fd79_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i5af87f74-84b8-4a6c-a49e-9b7f81f0fd79_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/ic6281ac9-efeb-432d-8d5e-e1d6f0d6411f/Content/Lesson_23/page_172.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i2923471e-67d0-485f-89f4-9c588d3517ea",
                                                                  "title":  "Firearm Cartridge Main Parts",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "icf59566b-e6ec-4f48-a21a-daf15f49bd8f_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "icf59566b-e6ec-4f48-a21a-daf15f49bd8f_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i24309556-fa09-4bf2-8856-b6fdcb3da41c/Content/Lesson_24/page_174.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "ie1d806ea-283c-454b-b45c-521a328391d9",
                                                                  "title":  "A Handgun Cartridge",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i6cb0c8f2-5203-40f2-9f0a-47c2271f1e85_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i6cb0c8f2-5203-40f2-9f0a-47c2271f1e85_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i52e6a2be-8ac2-4c96-8f1b-faa06afe6a99/Content/Lesson_24/page_175.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "iac03fe65-d403-4527-af35-bf153965fd05",
                                                                  "title":  "A Rifle Cartridge",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "iba60a034-bb1b-4904-9221-dedaf4328fec_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "iba60a034-bb1b-4904-9221-dedaf4328fec_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i2dafe366-8cda-4059-b3ae-ca28b2af5a57/Content/Lesson_24/page_176.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i572f79d6-8cc7-4689-ae9d-253fad623b20",
                                                                  "title":  "Velocity, Kinetic Energy, and Trajectory of Firearms",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i5f91b8a5-2fc5-4c58-a9f8-943b60ed789f_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i5f91b8a5-2fc5-4c58-a9f8-943b60ed789f_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i8d6d3241-1f46-4d98-ab40-0d06dd19bdf7/Content/Lesson_24/page_177.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i151428f8-8c72-4d86-b446-d0c4e69b7212",
                                                                  "title":  "Comparison of the VELOCITY of Ammunition Fired from Various Firearms",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i01eeb537-b792-4978-b2c2-fd72b47d8640_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i01eeb537-b792-4978-b2c2-fd72b47d8640_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/ifb13f762-2daf-45ad-b1a9-ebb82f944bd5/Content/Lesson_24/page_178.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "ic96ad047-dca0-4fe9-8a58-8d0385728a6b",
                                                                  "title":  "A. Firearm Basics",
                                                                  "kind":  "quiz",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i36cff39d-1de2-4086-9c3d-bb5c6822962e_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i36cff39d-1de2-4086-9c3d-bb5c6822962e_R",
                                                                                   "hrefs":  [
                                                                                                 "quiz/i85fb504e-8b31-43dd-9909-fefc50ff86c9/qti_2de3d47c-9eff-4d88-b8af-b12cb394155b.xml"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              }
                                                          ]
                                         },
                                         {
                                             "id":  "iaff42d9e-4a2f-4b07-ab71-930758937ea7",
                                             "title":  "Lesson B: Ballistic Fingerprinting and Wound Ballistics",
                                             "kind":  "folder",
                                             "depth":  1,
                                             "children":  [
                                                              {
                                                                  "id":  "i5a10aab5-ec71-4cbd-9963-93d64742bae7",
                                                                  "title":  "Cartridge Identification Methods",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "ic809bffd-59b0-4757-81ff-2d5f2ac16f06_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "ic809bffd-59b0-4757-81ff-2d5f2ac16f06_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i5c639b95-14f3-42c9-961a-41db99f7c25e/Content/Lesson_25/page_181.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i96f1cf10-7cc8-49bf-b60d-621f148dd415",
                                                                  "title":  "Ballisitics Databases",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "ib8f9b170-18a5-48a7-8661-f913fc19fc1a_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "ib8f9b170-18a5-48a7-8661-f913fc19fc1a_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i105ded10-b5a5-488e-bcd5-5c62c28151ef/Content/Lesson_25/page_183.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "ib5a4a230-1889-4927-a9c9-9220ff9d575d",
                                                                  "title":  "Wound Ballistics",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i20bc5830-a498-4fc1-9343-2fae05bec66b_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i20bc5830-a498-4fc1-9343-2fae05bec66b_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/iabeaf8d6-e84f-4090-9621-cb9a1ac1c285/Wound Ballistics.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i11afbd40-9780-4ac9-8c51-829a4c3f4c10",
                                                                  "title":  "Crime Case Study: The JFK Assasination",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "ic6fb0590-a4cb-463c-a334-00afcaf08116_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "ic6fb0590-a4cb-463c-a334-00afcaf08116_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/if360829e-c006-4528-a067-95a8ee5ca3c1/Content/Lesson_25/page_184.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "ieef39b5b-df08-4deb-ad0f-b872272145fe",
                                                                  "title":  "B. Ballistic Fingerprinting and Wound Ballistics",
                                                                  "kind":  "quiz",
                                                                  "depth":  2,
                                                                  "identifierRef":  "id52fbaec-f83c-4546-b3e5-9df9e25a35cd_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "id52fbaec-f83c-4546-b3e5-9df9e25a35cd_R",
                                                                                   "hrefs":  [
                                                                                                 "quiz/id587754d-8cbf-4657-b810-4d33f5507965/qti_20a63b5c-f4e0-488b-a5d9-5926b790431b.xml"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              }
                                                          ]
                                         },
                                         {
                                             "id":  "ib8894543-45a2-4134-b795-65eeee66d369",
                                             "title":  "Lesson C: Testing for Gunshot Residue",
                                             "kind":  "folder",
                                             "depth":  1,
                                             "children":  [
                                                              {
                                                                  "id":  "id93eccea-2467-4d6e-b987-bf14a7f3fe42",
                                                                  "title":  "Overview",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "ic097cb09-b72c-45d1-a433-d3efd36be196_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "ic097cb09-b72c-45d1-a433-d3efd36be196_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i6a6d99c1-8251-4d30-ab32-5ccb86404b50/Content/Lesson_26/page_187.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i51d5e8a2-d782-499a-b0e7-3b434d132773",
                                                                  "title":  "The Evolution of Firearms and Gunpowder",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "ifeec6f05-d2fa-464a-aa43-6ffc4192eee4_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "ifeec6f05-d2fa-464a-aa43-6ffc4192eee4_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i4a8e29cd-ac87-4371-8a95-b5943972e0ba/Content/Lesson_26/page_188.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i77c0570d-447a-4277-b598-37af5c2fcd89",
                                                                  "title":  "Gun Shot Residue Testing",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i542de834-8650-44cd-bb48-680511a4d354_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i542de834-8650-44cd-bb48-680511a4d354_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i5e23223d-12a3-4d2e-b7e8-a41c47c47d60/Content/Lesson_26/page_190.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "ie6d8952b-f0cc-40dd-9e14-5ea285cb9658",
                                                                  "title":  "Gunshot Residue Analysis",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i1b3438d8-04a9-4a18-8b6f-433a34a55c80_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i1b3438d8-04a9-4a18-8b6f-433a34a55c80_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i294e966b-09ae-44e5-9a9a-4cbcb0c19775/Content/Lesson_26/page_192.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i3c45f93a-2f9e-4cf3-9b5a-fa08b1e60872",
                                                                  "title":  "Gun Residue Tests",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "ida4a6534-222b-4a42-a445-5d67d238fdd6_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "ida4a6534-222b-4a42-a445-5d67d238fdd6_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i0b488c06-2053-4b21-a708-ea48da47ac22/Content/Lesson_26/page_193.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "iafb438c5-b99f-4538-beea-4e7fdc0fcdee",
                                                                  "title":  "Validity of Gunshot Residue",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "idf1845d7-317a-49ec-99cf-9d64930e7e8f_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "idf1845d7-317a-49ec-99cf-9d64930e7e8f_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i8d794e4b-07ad-4c83-a460-832fba1cc8c2/Content/Lesson_26/page_197.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i78615728-00ba-44ab-82bb-fe6220ce63f8",
                                                                  "title":  "The Mysterious Murder of a Hollywood Star\u0027s Wife",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "ia4704135-7887-43d8-a23e-99ae349951d9_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "ia4704135-7887-43d8-a23e-99ae349951d9_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i6791c041-77cb-4efb-b0a2-8cbf8800a623/Content/Lesson_27/page_198.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i2434bef4-d4ad-487d-b78c-a6628b944712",
                                                                  "title":  "C. Testing for Gunshot Residue",
                                                                  "kind":  "quiz",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i8d699901-5b26-40b3-a454-4a41e960c7e4_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i8d699901-5b26-40b3-a454-4a41e960c7e4_R",
                                                                                   "hrefs":  [
                                                                                                 "quiz/i1c932935-dc32-4d1a-8a10-548f4f959a68/qti_f0c06206-62ab-4a80-87dc-64bac00f8cf4.xml"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              }
                                                          ]
                                         },
                                         {
                                             "id":  "i2a85bf28-5f88-4f6c-8b40-3789b474f036",
                                             "title":  "Lesson D: Criminal Case Studies Involving Gunshot Residue",
                                             "kind":  "folder",
                                             "depth":  1,
                                             "children":  [
                                                              {
                                                                  "id":  "ia0602fc6-5f95-4127-9d71-288802e56b74",
                                                                  "title":  "The Beltway Snipers",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i76a8bf87-fc99-4cf8-bacd-b9423b3e3d49_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i76a8bf87-fc99-4cf8-bacd-b9423b3e3d49_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i30bcd3b9-e06e-43f9-a4d2-a90d1bd180c1/Content/Lesson_27/page_199.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i8784a17a-b252-404e-acfa-e0c894a4b9ef",
                                                                  "title":  "Case Study: Distance, Shielding, and Movement - Critical Incident Response",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i691ee49a-e48d-44fb-a893-c0bdae0339ac_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i691ee49a-e48d-44fb-a893-c0bdae0339ac_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/ic213f42e-dc6c-4903-991a-7ced4d837246/Case Study Distance, Shielding, and Movement - Critical Incident Response.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i60c91402-e400-451d-bd15-0844937f733e",
                                                                  "title":  "D. Crime Case Studies Involving Forensic Ballistics",
                                                                  "kind":  "quiz",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i74a26a31-7d20-40b4-a35e-00990b458c61_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i74a26a31-7d20-40b4-a35e-00990b458c61_R",
                                                                                   "hrefs":  [
                                                                                                 "quiz/i173422c9-ad1b-482e-b616-dd032d5fa231/qti_b0179a50-5670-4d27-b392-58f713126815.xml"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              }
                                                          ]
                                         }
                                     ]
                    },
                    {
                        "id":  "if7fb6ce2-499a-4bde-9fcd-14a3a7baf0c4",
                        "title":  "5. Criminal Profiling",
                        "kind":  "module",
                        "depth":  0,
                        "children":  [
                                         {
                                             "id":  "ieca71124-997c-4c7f-9c91-1288ad908edd",
                                             "title":  "Overview",
                                             "kind":  "html",
                                             "depth":  1,
                                             "identifierRef":  "if5ec6fc2-7137-4f32-a881-349b48b5b04c_R",
                                             "resource":  {
                                                              "identifierRef":  "if5ec6fc2-7137-4f32-a881-349b48b5b04c_R",
                                                              "hrefs":  [
                                                                            "сontent/ic26c5a65-3f82-4e29-b06c-f53cb787554b/Content/book_6/chapter_15.html"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "i80c90f50-f0ee-4685-b346-91729fbef064",
                                             "title":  "Module 5 Assignment (Print)",
                                             "kind":  "pdf",
                                             "depth":  1,
                                             "identifierRef":  "ie35794c3-8223-407f-94ca-c7355c02aa69_R",
                                             "resource":  {
                                                              "identifierRef":  "ie35794c3-8223-407f-94ca-c7355c02aa69_R",
                                                              "hrefs":  [
                                                                            "сontent/i413e11fe-ec10-4433-9105-ed56cd2480dd/NXT FS35-3 Module 5 Assignment.pdf"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "id3a7efca-caab-48c3-bc96-633b975b2a73",
                                             "title":  "Module 5 Assignment (Online)",
                                             "kind":  "html",
                                             "depth":  1,
                                             "identifierRef":  "i5f71a96a-0cc3-484e-91f9-6c4560721bd8_R",
                                             "resource":  {
                                                              "identifierRef":  "i5f71a96a-0cc3-484e-91f9-6c4560721bd8_R",
                                                              "hrefs":  [
                                                                            "сontent/i943b7b99-513c-43db-8867-d0ae4ff0ec19/Module 5 Assignment (Online).html"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "i81f82b43-3947-4591-9718-7bcc4ce6a5a9",
                                             "title":  "Module 5 Assessment",
                                             "kind":  "html",
                                             "depth":  1,
                                             "identifierRef":  "ic8dcb6fe-fb93-4ce1-9fc2-26bac3eaa5c7_R",
                                             "resource":  {
                                                              "identifierRef":  "ic8dcb6fe-fb93-4ce1-9fc2-26bac3eaa5c7_R",
                                                              "hrefs":  [
                                                                            "сontent/id5a81e7a-49c9-466d-a781-2969ae054c79/Content/book_6/chapter_17.html"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "i669b5f03-93f1-4cae-ad63-1436f28e4176",
                                             "title":  "M5 Assignment Submission",
                                             "kind":  "assignment",
                                             "depth":  1,
                                             "identifierRef":  "i9ef55721-f8bf-47b1-8ac8-dbe7a1a7cf3f_R",
                                             "resource":  {
                                                              "identifierRef":  "i9ef55721-f8bf-47b1-8ac8-dbe7a1a7cf3f_R",
                                                              "hrefs":  [
                                                                            "assignment/i431c722d-b304-40b7-8c7e-4ab0dfe60987/assignment_cf3b343e-b244-4ba4-9aac-34c3deb73207.xml"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "id8872337-0a2d-4a99-a7f5-f15c1ebf3117",
                                             "title":  "Module 5 Criminal Profiling Quiz",
                                             "kind":  "lesson",
                                             "depth":  1,
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "i53bebbdc-0997-467a-aa4d-198d141cc507",
                                             "title":  "Module 5 Criminal Profiling Assessment",
                                             "kind":  "quiz",
                                             "depth":  1,
                                             "identifierRef":  "i99ac1f60-c8c0-4f26-970b-f0dac7cd2d53_R",
                                             "resource":  {
                                                              "identifierRef":  "i99ac1f60-c8c0-4f26-970b-f0dac7cd2d53_R",
                                                              "hrefs":  [
                                                                            "quiz/if83e971a-3a8f-40fe-b1ca-c9bf287cf7cd/qti_4f57ed9e-0afe-4fff-b6b4-cd5dbb5c77bc.xml"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "i1cacf4e9-6461-4a16-93ab-8f0dcf3423cd",
                                             "title":  "Lesson A: Creating a Criminal Profile",
                                             "kind":  "folder",
                                             "depth":  1,
                                             "children":  [
                                                              {
                                                                  "id":  "ie6201520-9f9c-4e05-8614-7fd7a38401c9",
                                                                  "title":  "Overview",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i5b1c7fbb-1a8c-412b-929f-eb466ca656e2_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i5b1c7fbb-1a8c-412b-929f-eb466ca656e2_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/ic9018858-5230-4425-8d4f-3cae425034f7/Content/Lesson_28/page_202.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i13105c94-bfc8-4105-b10a-eb6ef4c410d0",
                                                                  "title":  "History of Criminal Profiling",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "ie3e8adfc-29b3-4b34-82e8-9656176e14d5_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "ie3e8adfc-29b3-4b34-82e8-9656176e14d5_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/ia9082fa0-9413-40f8-87ef-61b7fdfe1d82/Content/Lesson_28/page_204.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i45164b68-4ee7-44bf-aa98-2d6f6271316e",
                                                                  "title":  "The FBI Criminal Profiling Method",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "ie533ebff-a1be-491d-ab05-e1a966983286_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "ie533ebff-a1be-491d-ab05-e1a966983286_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i87e5e797-4685-497e-b8a9-286fbe8e02dc/Content/Lesson_28/page_207.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i22ee1b46-4dcd-40ee-bdba-a65377c2214b",
                                                                  "title":  "Steps Involved in Criminal Profiling",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "ie6e398c7-f975-4ad8-9fee-73e0b8cdbae0_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "ie6e398c7-f975-4ad8-9fee-73e0b8cdbae0_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/ic206a8b7-2646-4897-a735-6222c830a687/Content/Lesson_28/page_205.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i3fa4d9c2-7177-444d-b71a-fde368fbfe65",
                                                                  "title":  "Personality and Behavioural Characteristics of a Criminal",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i47456e2c-5e36-4907-83a3-27d804011622_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i47456e2c-5e36-4907-83a3-27d804011622_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i62149581-8b6d-46c1-ad34-cb27ce4d40ee/Content/Lesson_28/page_208.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i81d29ab3-6aea-4c30-b92a-d6577a0b5ffb",
                                                                  "title":  "Personality and Behavioural Characteristics of a Criminal Page 2",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "ie0dd1c03-bf2a-4391-9f79-4d28d53070a7_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "ie0dd1c03-bf2a-4391-9f79-4d28d53070a7_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i460e29fd-2fd1-43bd-a0c5-128843fe7540/Content/Lesson_28/page_210.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i154baf7e-f028-48df-ac77-a79084ba2e82",
                                                                  "title":  "Criminal Profiling Case Study: The Mad Bomber",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "ibbd8590a-b578-46e8-9688-f28fde7f5dab_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "ibbd8590a-b578-46e8-9688-f28fde7f5dab_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/iaef7d959-9a4c-4f4e-a9cd-81c504391399/Content/Lesson_28/page_212.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i07e41f75-1bce-417c-82be-808e60647b02",
                                                                  "title":  "A. Creating a Criminal Profile",
                                                                  "kind":  "quiz",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i629e7339-4380-4d3b-a82f-089203f76b8e_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i629e7339-4380-4d3b-a82f-089203f76b8e_R",
                                                                                   "hrefs":  [
                                                                                                 "quiz/i77c8e457-97e2-4311-accb-3089f1832a13/qti_cadf59c6-7482-494f-bfe2-b11e3b8069aa.xml"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              }
                                                          ]
                                         },
                                         {
                                             "id":  "i912e89c2-a047-4427-86b9-189f75b0854e",
                                             "title":  "Lesson B: The Use of Criminal Profiling in Homicide Investigations",
                                             "kind":  "folder",
                                             "depth":  1,
                                             "children":  [
                                                              {
                                                                  "id":  "ia5277b80-4d6e-48c2-8ca0-ddd57df2ce58",
                                                                  "title":  "Overview",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "ie72e1a26-3f93-494f-a8de-8cb9875a847e_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "ie72e1a26-3f93-494f-a8de-8cb9875a847e_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i11772419-adfc-416c-a08f-fd986faaddb7/Content/Lesson_29/page_213.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i5e2b61e1-536a-4dda-ba30-d36f14d278f6",
                                                                  "title":  "Types of Murderers",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i51a49e51-1bab-4c36-b259-c7b335ea3a77_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i51a49e51-1bab-4c36-b259-c7b335ea3a77_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i2b9e1973-8e53-4b28-8a7f-bc9230f37f92/Content/Lesson_29/page_214.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i3b7a18a5-4df2-4bfe-859d-89765e7190b0",
                                                                  "title":  "Organized Offenders or Disorganized Offenders",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i589f25a8-17d5-42bc-8e01-b0fc1a27b116_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i589f25a8-17d5-42bc-8e01-b0fc1a27b116_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/ie49357ff-da60-48f1-ba75-1f5d9c593948/Content/Lesson_29/page_216.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "ia5dacd7f-af9f-4382-9946-cdf71ff16d03",
                                                                  "title":  "Combination Offenders",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i3655d62f-afb9-445d-9fa4-dfabd3e819c4_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i3655d62f-afb9-445d-9fa4-dfabd3e819c4_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/ia1e26f8b-46c4-447b-945e-c8d1403ce48e/Content/Lesson_29/page_219.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i6e257b59-5559-4448-a14f-3e122c54efdc",
                                                                  "title":  "Organized Offender Case Study: Ted Bundy",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i237585e2-74bf-46ec-aafb-9eca6d27aece_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i237585e2-74bf-46ec-aafb-9eca6d27aece_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i583373f1-a76b-4aaf-85be-5d4cc0599c4d/Content/Lesson_29/page_220.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i6cc980d2-0fb8-485c-bad7-f7b02ce2652e",
                                                                  "title":  "Disorganized Offender Case Study: Richard Trenton Chase",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i645772e9-c204-430c-8646-a826c515829f_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i645772e9-c204-430c-8646-a826c515829f_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i0fbf1bec-63c6-4f82-9f6d-d5686250f2b2/Content/Lesson_29/page_222.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i2d3dacad-ca5b-406b-a92f-7f438a42a637",
                                                                  "title":  "Disorganized Offender Case Study: Jeffrey Dahmer",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "id67ba18e-9107-4c88-9405-3a758c470f16_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "id67ba18e-9107-4c88-9405-3a758c470f16_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i2ea99dc3-98a4-4282-a285-5f587b76935f/Content/Lesson_29/page_225.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "iec63c308-74b1-47ab-a8d5-0438050646c4",
                                                                  "title":  "B. The Use of Criminal Profiling in Homicide Investigations",
                                                                  "kind":  "quiz",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i9cfdf08e-adb7-4ca4-907e-dff09fd289d3_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i9cfdf08e-adb7-4ca4-907e-dff09fd289d3_R",
                                                                                   "hrefs":  [
                                                                                                 "quiz/i6e80f95f-4e8e-4d60-bbe4-fc8099221194/qti_205398f8-0b90-4d56-b357-1ad2707c9d68.xml"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              }
                                                          ]
                                         },
                                         {
                                             "id":  "iadf317e2-cb17-45f9-89ba-70faa1980f7f",
                                             "title":  "Lesson C: Geographic Profiling",
                                             "kind":  "folder",
                                             "depth":  1,
                                             "children":  [
                                                              {
                                                                  "id":  "i0bdb24ff-a16d-45e5-b83c-e9a62f1be6ad",
                                                                  "title":  "General Description",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i5a2edab0-8608-4960-8869-8902d7d3a124_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i5a2edab0-8608-4960-8869-8902d7d3a124_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i377b3730-fc8c-43ef-8cb9-b4cf1bc6ef3e/Content/Lesson_30/page_226.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "ie7e70387-d844-4fb5-a4aa-6ecc21518b82",
                                                                  "title":  "History",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i4928eeb4-2eb5-410f-91d8-8a8c5593a5d1_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i4928eeb4-2eb5-410f-91d8-8a8c5593a5d1_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i5673c8e0-11d0-4b77-8049-d9115aee2320/Content/Lesson_30/page_227.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i1decf605-24c2-4869-889e-172e19f49a67",
                                                                  "title":  "Creation of Geographic Profiles",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i481e7c67-dc37-484e-b3b6-6652c233a8dc_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i481e7c67-dc37-484e-b3b6-6652c233a8dc_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/id5afbd77-c387-45e6-8880-2f25b3fcb73b/Content/Lesson_30/page_229.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i67bd4ba7-8d77-49f9-9ac9-f79a54e52fd1",
                                                                  "title":  "The Use of Geographic Profiling by Law Enforcement",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "ic5e03c72-08f3-495a-9818-70b41fdac0ef_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "ic5e03c72-08f3-495a-9818-70b41fdac0ef_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/icfc22e7e-1a35-4576-8fc7-56169a3322ee/Content/Lesson_30/page_231.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i11d7cb9c-e088-4715-9b60-924c43ce1d15",
                                                                  "title":  "How Police Construct a Geographic Profile",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i70711967-fcb6-4af7-bb17-b05f3ced7b35_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i70711967-fcb6-4af7-bb17-b05f3ced7b35_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/iba82a801-bede-44b1-95ed-424a2c4ee87b/Content/Lesson_30/page_232.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "ia969aa49-71c5-458d-9b9e-f99d887d6fe3",
                                                                  "title":  "Crime Case Study: Clifford Robert Olson",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i57a48c9f-5063-4170-be8b-f941b7a26fbe_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i57a48c9f-5063-4170-be8b-f941b7a26fbe_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/iba85bad6-99aa-4ae1-82c7-ef6d4a9a3e98/Content/Lesson_30/page_234.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i38f2fde6-286b-4a30-a9d2-2b89ff2840c1",
                                                                  "title":  "C. Geographic Profiling",
                                                                  "kind":  "quiz",
                                                                  "depth":  2,
                                                                  "identifierRef":  "iec0e41c4-e2b0-47e1-a643-eb95e2188f44_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "iec0e41c4-e2b0-47e1-a643-eb95e2188f44_R",
                                                                                   "hrefs":  [
                                                                                                 "quiz/i0ccd9323-c8e8-4f8f-bb16-aafdc8b2cb8a/qti_bb0102df-cd5d-409c-bc1f-3ef423f3ef90.xml"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              }
                                                          ]
                                         },
                                         {
                                             "id":  "i4ada5d40-333f-4889-8622-986d748c2710",
                                             "title":  "Lesson D: Criminal Profiling Crime Case Studies",
                                             "kind":  "folder",
                                             "depth":  1,
                                             "children":  [
                                                              {
                                                                  "id":  "i773cd245-7900-452f-8e2d-4504a826a704",
                                                                  "title":  "The Railway Killers",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i233a65bc-0338-4320-91f2-fd57d04de463_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i233a65bc-0338-4320-91f2-fd57d04de463_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i9b652248-a39f-44ab-94aa-c4a4340e6b8d/Content/Lesson_31/page_236.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "ia4554ee8-1819-49b3-ad86-6c8c5104115d",
                                                                  "title":  "The BTK Strangler",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i52bbb337-205a-469e-953c-06e3df921e66_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i52bbb337-205a-469e-953c-06e3df921e66_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/ie4bcb2ae-06d6-48ef-b504-e0cf4e9d7281/Content/Lesson_31/page_239.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i39b70636-afa5-4e4b-a6a6-cded5808eba7",
                                                                  "title":  "D. Criminal Profiling in Homicide Crime Case Studies",
                                                                  "kind":  "quiz",
                                                                  "depth":  2,
                                                                  "identifierRef":  "ie587aa58-d91b-42d0-aaa3-762cc4103cdc_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "ie587aa58-d91b-42d0-aaa3-762cc4103cdc_R",
                                                                                   "hrefs":  [
                                                                                                 "quiz/ia2da3f99-e192-41b9-874f-cd0fb9b3d9b5/qti_cd823fd1-757c-45a5-a999-90be859e91c0.xml"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              }
                                                          ]
                                         }
                                     ]
                    },
                    {
                        "id":  "i66ee3298-6f0b-4d4c-8992-aaa0102fa85c",
                        "title":  "6. Anthropology and Entomology",
                        "kind":  "module",
                        "depth":  0,
                        "children":  [
                                         {
                                             "id":  "i139f9115-b96d-44f1-b5fb-d3195aa2b04c",
                                             "title":  "Overview",
                                             "kind":  "html",
                                             "depth":  1,
                                             "identifierRef":  "if8ded564-d39f-4a23-878b-48824d91cf00_R",
                                             "resource":  {
                                                              "identifierRef":  "if8ded564-d39f-4a23-878b-48824d91cf00_R",
                                                              "hrefs":  [
                                                                            "сontent/i71f31a8f-0454-49c6-8ea5-1abd1bfb3a6f/Content/book_7/chapter_18.html"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "i950d83d4-5019-4c2a-915e-e5813092a41c",
                                             "title":  "Module 6 Assignment (Print)",
                                             "kind":  "pdf",
                                             "depth":  1,
                                             "identifierRef":  "ie8164f26-539b-4039-8e74-a472e6685e45_R",
                                             "resource":  {
                                                              "identifierRef":  "ie8164f26-539b-4039-8e74-a472e6685e45_R",
                                                              "hrefs":  [
                                                                            "сontent/if764fb3b-c224-4652-8384-7abcb395f836/NXT FS35-3 Module 6 Assignment.pdf"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "i99d092da-915c-4d21-8321-64d25fc60ff8",
                                             "title":  "Module 6 Assignment (Online)",
                                             "kind":  "html",
                                             "depth":  1,
                                             "identifierRef":  "i4603b257-dc4c-4fc3-9836-7cb3c71eadcd_R",
                                             "resource":  {
                                                              "identifierRef":  "i4603b257-dc4c-4fc3-9836-7cb3c71eadcd_R",
                                                              "hrefs":  [
                                                                            "сontent/idb266520-4da3-4db1-ac56-65cd81982e71/Module 6 Assignment (Online).html"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "i079652c0-997a-49f1-af13-ce590e978051",
                                             "title":  "Module 6 Assessment",
                                             "kind":  "html",
                                             "depth":  1,
                                             "identifierRef":  "i56ff304c-3ce7-40f5-8d84-4054f0e45902_R",
                                             "resource":  {
                                                              "identifierRef":  "i56ff304c-3ce7-40f5-8d84-4054f0e45902_R",
                                                              "hrefs":  [
                                                                            "сontent/ib27eef14-6843-4aa9-9720-098971333d1d/Content/book_7/chapter_20.html"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "i43db6be8-233c-4f44-af13-b381cf288985",
                                             "title":  "M6 Assignment Submission",
                                             "kind":  "assignment",
                                             "depth":  1,
                                             "identifierRef":  "i488660f5-1119-493e-b782-969a70351b73_R",
                                             "resource":  {
                                                              "identifierRef":  "i488660f5-1119-493e-b782-969a70351b73_R",
                                                              "hrefs":  [
                                                                            "assignment/i6c7fd40f-05be-475b-919a-c7e1bde19f75/assignment_1b34dbb8-5ef7-4914-b9ab-f53995f44c2e.xml"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "i6060492f-2a45-491e-90bb-0106968f3e19",
                                             "title":  "Module 6 Bone and Bugs Quiz",
                                             "kind":  "lesson",
                                             "depth":  1,
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "ia7f416b8-1e3c-41b8-8771-29bb457fa6d8",
                                             "title":  "Module 6 Bone and Bugs Assessment",
                                             "kind":  "quiz",
                                             "depth":  1,
                                             "identifierRef":  "i55ce550c-d67b-420c-b57c-531cf401f600_R",
                                             "resource":  {
                                                              "identifierRef":  "i55ce550c-d67b-420c-b57c-531cf401f600_R",
                                                              "hrefs":  [
                                                                            "quiz/i14a342f6-c744-4b1b-8c03-9dfd038ed461/qti_e3afa34b-2824-466b-8a80-f2a914b7c0af.xml"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "i6072089b-2553-4543-8c69-2cfad6a4a80f",
                                             "title":  "Lesson A: Determining Traumatic Injuries from Skeletal Remains",
                                             "kind":  "folder",
                                             "depth":  1,
                                             "children":  [
                                                              {
                                                                  "id":  "i7369aa0b-83a0-4a64-8dc1-28e39f379c14",
                                                                  "title":  "Inferring the Cause of Death from Skeletal Remains",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "id79c9592-91e5-41a9-9cae-df3bf416fb66_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "id79c9592-91e5-41a9-9cae-df3bf416fb66_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/ida8af3eb-2c88-4f45-8f25-5420c2433337/Content/Lesson_32/page_241.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i06822279-20d5-4cd8-8780-0eebc3ddb04b",
                                                                  "title":  "Force and Type of Bone Fractures",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "ia8b72dbf-d482-47a4-8f2b-3d14f4f076ed_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "ia8b72dbf-d482-47a4-8f2b-3d14f4f076ed_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/ie4ab8990-3b0c-495b-bbdf-7725ff92c44f/Content/Lesson_32/page_242.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i74122407-e4d6-4851-94bd-11aacaf129bf",
                                                                  "title":  "Determination of Trauma from Skeletal Remains",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "idea39b30-3779-45d4-a19c-41c5caf39dd4_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "idea39b30-3779-45d4-a19c-41c5caf39dd4_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i6e61d424-4f0d-4b2b-a594-6560e952774d/Content/Lesson_32/page_247.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i4804774c-1d32-4086-9d5a-34ddecd26fa5",
                                                                  "title":  "Case Study: The Infamous Serial Killer John Wayne Gacy",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "ifb5e8e7f-0e5f-4840-b0dc-ecb181ada7a5_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "ifb5e8e7f-0e5f-4840-b0dc-ecb181ada7a5_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/if58b20ff-fb47-408e-b320-2497bed117da/Content/Lesson_32/page_249.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i8e53fc0f-bfac-43a3-a4b1-31b4d111da15",
                                                                  "title":  "A. Determining Traumatic Injuries from Skeletal Remains",
                                                                  "kind":  "quiz",
                                                                  "depth":  2,
                                                                  "identifierRef":  "iad6c5827-daa9-4df1-8ce4-97ee8f664b5e_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "iad6c5827-daa9-4df1-8ce4-97ee8f664b5e_R",
                                                                                   "hrefs":  [
                                                                                                 "quiz/ifb5667f0-25b9-4a71-8a4c-4a638f429a63/qti_e138099d-58f8-4d52-a32e-5e01f41e98ea.xml"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              }
                                                          ]
                                         },
                                         {
                                             "id":  "i9b7827ae-f4b5-44db-9c1f-718d4fa4ea93",
                                             "title":  "Lesson B: Determining Ancestry and Sex from Human Skeletal Remains",
                                             "kind":  "folder",
                                             "depth":  1,
                                             "children":  [
                                                              {
                                                                  "id":  "i6be422fa-17e4-4168-9015-9a96b05f1a53",
                                                                  "title":  "Overview",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "iac8a7d00-a84a-4750-8442-5f743a7d695d_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "iac8a7d00-a84a-4750-8442-5f743a7d695d_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i505992ba-df56-43ce-bc39-1a502e5fe271/Content/Lesson_33/page_251.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "ib4bba3cc-c074-45b5-8619-f818f7daf806",
                                                                  "title":  "Using Bones to Determine Ancestry",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i5b5ce283-2a32-48c6-a5ed-d04f56d6d5ae_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i5b5ce283-2a32-48c6-a5ed-d04f56d6d5ae_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/iaaf84800-6929-45d9-8fcd-3f269845ae01/Content/Lesson_33/page_257.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "ica27d5f0-1335-4a60-8c56-79447a963df6",
                                                                  "title":  "Distinctions Between Human Bone and Animal Bone ~ Ribs",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "ie8399079-2244-403a-ac39-a75cbb904044_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "ie8399079-2244-403a-ac39-a75cbb904044_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i20d7c7b7-a212-44ca-86fc-17937b9c3000/Content/Lesson_33/page_252.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "ide5f2bed-b4b9-4a8b-ab75-aa08ad79cc04",
                                                                  "title":  "Using Bones to Determine Ancestry ~ Comparison of Cranial Features",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i16b80869-5ede-477a-a5ac-cdd5f7a3c41d_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i16b80869-5ede-477a-a5ac-cdd5f7a3c41d_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/ibf9b10f2-3e30-4823-954b-fb1bbc545481/Content/Lesson_33/page_258.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i728a8298-a486-4c53-8508-f8173c7a67a6",
                                                                  "title":  "Using Bones to Determine Sex of an Individual",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "ia9c9ac85-a4f6-433b-bd1b-ca3c45c3f95f_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "ia9c9ac85-a4f6-433b-bd1b-ca3c45c3f95f_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/ia57ca4cc-c99d-46d7-a91b-1edb079f2f6f/Content/Lesson_33/page_260.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i28115eeb-4f89-4e75-963e-890fd8d51682",
                                                                  "title":  "B. Determining Ancestry and Sex from Skeletal Remains",
                                                                  "kind":  "quiz",
                                                                  "depth":  2,
                                                                  "identifierRef":  "ie76022e2-19a5-4ba6-8b3b-c374012c9ee5_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "ie76022e2-19a5-4ba6-8b3b-c374012c9ee5_R",
                                                                                   "hrefs":  [
                                                                                                 "quiz/i7526bfbb-668d-4bc4-a78e-3c6e7d839fcd/qti_e78358cc-af9a-498c-8efb-ae7c8f81bfbd.xml"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              }
                                                          ]
                                         },
                                         {
                                             "id":  "i2ba21a17-78f4-43f4-9278-c38c6cdb74f7",
                                             "title":  "Lesson C: The Use of Forensic Entomology in Criminal Investigations",
                                             "kind":  "folder",
                                             "depth":  1,
                                             "children":  [
                                                              {
                                                                  "id":  "ie531a115-0a83-42c2-b451-5f243cf5e4ee",
                                                                  "title":  "Overview",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "iafef665c-f84a-4430-a2c3-df4838a43a67_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "iafef665c-f84a-4430-a2c3-df4838a43a67_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/ifd6f897b-7a49-4518-9677-c71822c1275d/Content/Lesson_35/page_271.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i5d5b55dd-347f-4ff0-9f7d-9f040e7e30d8",
                                                                  "title":  "Defining Forensic Entomology",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i2bd1462d-0444-47ee-962c-aea6b96ff658_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i2bd1462d-0444-47ee-962c-aea6b96ff658_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i2340a88b-7f0a-4412-aa74-f80e72776c1f/Content/Lesson_35/page_272.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i1ac86629-bbe8-4026-9411-1c1135e90304",
                                                                  "title":  "Estimating Time Since Death with Forensic Entomology",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "ib62dfa20-c1e3-47d1-acc4-de3185908d55_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "ib62dfa20-c1e3-47d1-acc4-de3185908d55_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i8f2c26ef-2027-40be-b694-00ae0231078f/Content/Lesson_35/page_274.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i98e3f3b0-fdfb-4fa3-a69f-0bf28a715087",
                                                                  "title":  "Initial Infestation of Human Remains",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i5e6da4e7-1796-4988-b11c-916db8302ace_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i5e6da4e7-1796-4988-b11c-916db8302ace_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i7121ceb1-b477-4b1d-ac2f-fc03f1991b9f/Content/Lesson_35/page_276.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "ib2069f31-cea4-437f-a87b-aa0e9fb8f2be",
                                                                  "title":  "The Effects of Weather Conditions upon Insect Infestation",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i7ad2a42d-d47d-43ff-92c5-dcab1562fca1_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i7ad2a42d-d47d-43ff-92c5-dcab1562fca1_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i1885017c-d6d8-4ba1-b006-9148abb68265/Content/Lesson_35/page_280.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i8c137cc5-01b0-40a2-8320-aac0e2522936",
                                                                  "title":  "Determining the Cause of Death using Forensic Entomology",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "ia9b474c4-2d9c-4e26-9bda-4377a6e44671_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "ia9b474c4-2d9c-4e26-9bda-4377a6e44671_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/idfe3f283-60fa-4408-b492-98a0d9b6739f/Content/Lesson_35/page_282.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i4a056fe2-493a-4f16-9999-b282883b9f89",
                                                                  "title":  "Using Forensic Entomology to Determine if a Body has been Moved after Death",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "ic89f8d8a-79a0-40a9-b970-48481e60528a_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "ic89f8d8a-79a0-40a9-b970-48481e60528a_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i2743d412-0aa0-4798-8bfc-e79b52ad826a/Content/Lesson_35/page_284.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i20ab3572-86a3-40bb-983e-bc4d880051b5",
                                                                  "title":  "Case Study: The Scientific Study of Insect Succession upon Dead Remains",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i8047fe3d-e4a0-427f-9005-d6460527a483_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i8047fe3d-e4a0-427f-9005-d6460527a483_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i535108ef-f395-4e1a-a811-41b0dbd752d5/Content/Lesson_34/page_263.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "ic9aa352f-856e-4cfb-8678-7d17c53fbaa2",
                                                                  "title":  "C. The Use of Forensic Entomology in Criminal Investigations",
                                                                  "kind":  "quiz",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i74260660-b77e-4f78-a7fb-b079fa1da145_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i74260660-b77e-4f78-a7fb-b079fa1da145_R",
                                                                                   "hrefs":  [
                                                                                                 "quiz/i9a6dda79-7f2c-4ed4-bb70-a77256937abf/qti_306b25e7-ff7f-45b7-a456-7c2cab316bff.xml"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              }
                                                          ]
                                         },
                                         {
                                             "id":  "iddbc2aca-2f37-4fcb-8465-50f962192654",
                                             "title":  "Lesson D: Bones and Bugs Case Studies",
                                             "kind":  "folder",
                                             "depth":  1,
                                             "children":  [
                                                              {
                                                                  "id":  "i13acbfaa-18c6-4d12-96f4-658e37f525a2",
                                                                  "title":  "Crime Case Studies Involving Forensic Anthropology and Forensic Entomology",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i465c67f5-95b7-4da8-bdf8-7aae76777393_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i465c67f5-95b7-4da8-bdf8-7aae76777393_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i17bbbbec-5f8a-4dab-8c2d-ffee6c802a55/Crime Case Studies Involving Forensic Anthropology and Forensic Entomology.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i29922fe1-c5d2-4f6b-b88c-4b682b0852dc",
                                                                  "title":  "Case Study : The Bones that Were Worth a Thousand Words",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "idcdce31c-714b-4c49-a8de-330e273491b0_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "idcdce31c-714b-4c49-a8de-330e273491b0_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i132d62ca-5a1b-40ae-b49d-c90a23291d4a/Content/Lesson_34/page_265.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "ifde4875a-bbf6-4218-9e77-3bfd41bca738",
                                                                  "title":  "Case Study: The Girl, The Army Sergeant, and The Bugs",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i463ca19c-8963-4003-a444-4483b640c4b6_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i463ca19c-8963-4003-a444-4483b640c4b6_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/ia7706767-ec0a-4768-83b1-e03636c42936/Content/Lesson_34/page_270.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "i34d65f9a-31ac-4376-a3ba-4cd79af992b2",
                                                                  "title":  "Case Study: The Farmhouse Murder",
                                                                  "kind":  "html",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i22960b7b-6ff8-492f-9a75-19cdb0bd5e76_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i22960b7b-6ff8-492f-9a75-19cdb0bd5e76_R",
                                                                                   "hrefs":  [
                                                                                                 "сontent/i3dece114-fd15-4728-92cf-a9a649ddb0e7/Content/Lesson_34/page_268.html"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              },
                                                              {
                                                                  "id":  "if71973bf-2735-41e0-bc64-b1e209c86f53",
                                                                  "title":  "D. Crime Case Studies Involving Forensic Anthropology and Forensic Entomology",
                                                                  "kind":  "quiz",
                                                                  "depth":  2,
                                                                  "identifierRef":  "i15c28d23-a25a-4b50-b321-194d2114970a_R",
                                                                  "resource":  {
                                                                                   "identifierRef":  "i15c28d23-a25a-4b50-b321-194d2114970a_R",
                                                                                   "hrefs":  [
                                                                                                 "quiz/i03ba268d-525c-448a-99c0-ee8270a47a0e/qti_ec3521f5-0e80-4cf2-bb23-2d9fbf034866.xml"
                                                                                             ]
                                                                               },
                                                                  "children":  [

                                                                               ]
                                                              }
                                                          ]
                                         }
                                     ]
                    },
                    {
                        "id":  "ic5016dac-bb43-4da5-8c15-b5ceeb44700b",
                        "title":  "7. Final Exam",
                        "kind":  "module",
                        "depth":  0,
                        "children":  [
                                         {
                                             "id":  "ie867116d-67ec-4e0a-9579-21116edced85",
                                             "title":  "7. Final Exam",
                                             "kind":  "html",
                                             "depth":  1,
                                             "identifierRef":  "iec4a5ec2-ad39-4825-8b40-a3c3358e4ec4_R",
                                             "resource":  {
                                                              "identifierRef":  "iec4a5ec2-ad39-4825-8b40-a3c3358e4ec4_R",
                                                              "hrefs":  [
                                                                            "сontent/i13aa3342-8a5f-42dd-92e6-d505cbfc4c02/Content/section_122.html"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "i54026ce8-f175-45a2-b54a-0d6280ebb06a",
                                             "title":  "Final Exam",
                                             "kind":  "lesson",
                                             "depth":  1,
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "i5083da76-ed61-4303-ac72-eef587fc11b6",
                                             "title":  "FS35 Final Exam",
                                             "kind":  "quiz",
                                             "depth":  1,
                                             "identifierRef":  "iae6bdad5-ca38-4c68-9b76-95eed5e4967e_R",
                                             "resource":  {
                                                              "identifierRef":  "iae6bdad5-ca38-4c68-9b76-95eed5e4967e_R",
                                                              "hrefs":  [
                                                                            "quiz/i5e4e8c9c-6600-421a-bd00-e34958764d99/qti_cb37bc33-3b8d-4052-b2bb-6c976fd140be.xml"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         }
                                     ]
                    },
                    {
                        "id":  "i477ca5d0-a362-4110-8448-dfb9404ece2d",
                        "title":  "Extra Credits",
                        "kind":  "module",
                        "depth":  0,
                        "children":  [
                                         {
                                             "id":  "iccd5bb50-7f53-43db-b0fa-4262fdee5af9",
                                             "title":  "Student Centred Learning Self Reflection",
                                             "kind":  "quiz",
                                             "depth":  1,
                                             "identifierRef":  "ieaeec3b7-01cc-4e68-aac6-29e18a51c93f_R",
                                             "resource":  {
                                                              "identifierRef":  "ieaeec3b7-01cc-4e68-aac6-29e18a51c93f_R",
                                                              "hrefs":  [
                                                                            "quiz/i20e5136a-beb0-4171-8e56-c17abb770178/qti_6b0d20f9-cb2d-46cc-8d6c-79cf22a710f6.xml"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         }
                                     ]
                    },
                    {
                        "id":  "i33599333-78ad-42d1-b453-68b9ac85bd46",
                        "title":  "Teacher Resources (Keep Hidden)",
                        "kind":  "module",
                        "depth":  0,
                        "children":  [
                                         {
                                             "id":  "i98a895f2-8083-4978-898b-4a6a039b8809",
                                             "title":  "M1 Assignment Answer Key",
                                             "kind":  "resource",
                                             "depth":  1,
                                             "identifierRef":  "i1d3f06a1-b382-438d-a4da-cb72a5eac47b_R",
                                             "resource":  {
                                                              "identifierRef":  "i1d3f06a1-b382-438d-a4da-cb72a5eac47b_R",
                                                              "hrefs":  [
                                                                            "сontent/idbc9f9eb-37f0-4020-9d9c-de65b2c232aa/NXT FS35 M1 Assignment Answer Key.docx"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "i72f6e04a-e362-4bcf-8b8f-ff9fb67af3d5",
                                             "title":  "M2 Assignment Answer Key",
                                             "kind":  "pdf",
                                             "depth":  1,
                                             "identifierRef":  "id931a508-9096-459f-802b-23ad8e96e94a_R",
                                             "resource":  {
                                                              "identifierRef":  "id931a508-9096-459f-802b-23ad8e96e94a_R",
                                                              "hrefs":  [
                                                                            "сontent/ie52c443c-bd5e-4d83-96a2-4982a07cc9e1/NXT FS35 M2 Assignment Answer Key.pdf"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "i63f3f46f-bdc7-4b40-a3cf-5636bdf1be5b",
                                             "title":  "M3 Assignment Answer Key",
                                             "kind":  "pdf",
                                             "depth":  1,
                                             "identifierRef":  "i9e647915-45ef-423e-aad2-8e4159bcb337_R",
                                             "resource":  {
                                                              "identifierRef":  "i9e647915-45ef-423e-aad2-8e4159bcb337_R",
                                                              "hrefs":  [
                                                                            "сontent/i44370b44-5116-4fe5-9e13-776481563145/NXT FS35-3 M3 Assignment Answer Key - Copy.pdf"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "ie2627904-54c5-4e47-8b73-fa110d96fc77",
                                             "title":  "M4 Assignment Answer Key",
                                             "kind":  "pdf",
                                             "depth":  1,
                                             "identifierRef":  "ic0f0361d-b8fc-4e9f-9ca9-bb96a67fc82b_R",
                                             "resource":  {
                                                              "identifierRef":  "ic0f0361d-b8fc-4e9f-9ca9-bb96a67fc82b_R",
                                                              "hrefs":  [
                                                                            "сontent/id7e4717a-786f-4019-874a-8321d2ee7fc9/_NXT FS35-3 Module 4 Assignment Answer Key.pdf"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "i02d85af8-1b39-441b-bcbb-1805ce5aed18",
                                             "title":  "Forensics_35_AB01_Key",
                                             "kind":  "pdf",
                                             "depth":  1,
                                             "identifierRef":  "ie3b56ea3-571c-467a-b03e-c3082b86c64d_R",
                                             "resource":  {
                                                              "identifierRef":  "ie3b56ea3-571c-467a-b03e-c3082b86c64d_R",
                                                              "hrefs":  [
                                                                            "сontent/ie9f2b656-c9d8-4fee-9ac1-6bbd550d946e/Forensics_35_AB01_Key.pdf"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "i5e28618f-03e9-4ec9-95b0-6eaecb4a65a4",
                                             "title":  "Forensics_35_AB02_Key",
                                             "kind":  "pdf",
                                             "depth":  1,
                                             "identifierRef":  "i411cd385-2e35-453a-b4d7-f998e30db64d_R",
                                             "resource":  {
                                                              "identifierRef":  "i411cd385-2e35-453a-b4d7-f998e30db64d_R",
                                                              "hrefs":  [
                                                                            "сontent/ib1ff4a56-96e9-497e-ad09-cd540a83ab86/Forensics_35_AB02_Key.pdf"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "if7ed4df5-9f5b-4215-81cd-8022eeb8bd18",
                                             "title":  "Forensics_35_AB03_Key",
                                             "kind":  "pdf",
                                             "depth":  1,
                                             "identifierRef":  "iadb4366f-ecbd-452f-bb06-422a75cfbaaa_R",
                                             "resource":  {
                                                              "identifierRef":  "iadb4366f-ecbd-452f-bb06-422a75cfbaaa_R",
                                                              "hrefs":  [
                                                                            "сontent/i7b309871-a372-4cf2-b08a-cf4d4b1ce691/Forensics_35_AB03_Key.pdf"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "iaf3d826e-f3dd-461a-8f64-2f7c1d22caa0",
                                             "title":  "Forensics_35_AB04_Key",
                                             "kind":  "pdf",
                                             "depth":  1,
                                             "identifierRef":  "ibb768829-86f9-43f4-895c-f60e2064cab2_R",
                                             "resource":  {
                                                              "identifierRef":  "ibb768829-86f9-43f4-895c-f60e2064cab2_R",
                                                              "hrefs":  [
                                                                            "сontent/i85fabbb6-cd20-40d6-a26d-48effc136e3a/Forensics_35_AB04_Key.pdf"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "i5bc1614c-004e-4edd-9f19-99a07ace095b",
                                             "title":  "Forensics_35_AB05_Key",
                                             "kind":  "pdf",
                                             "depth":  1,
                                             "identifierRef":  "i0d2fcd09-09b9-469c-8e06-e3f95d6e0e47_R",
                                             "resource":  {
                                                              "identifierRef":  "i0d2fcd09-09b9-469c-8e06-e3f95d6e0e47_R",
                                                              "hrefs":  [
                                                                            "сontent/idfe46fee-6d79-4f80-a7e2-67c388101569/Forensics_35_AB05_Key.pdf"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         },
                                         {
                                             "id":  "i7c60f1ec-4cc1-41e2-b3fd-47a6374da1d3",
                                             "title":  "Forensics_35_AB06_Key",
                                             "kind":  "pdf",
                                             "depth":  1,
                                             "identifierRef":  "i41a624c1-5f2f-4ee2-9838-24eddfa6693e_R",
                                             "resource":  {
                                                              "identifierRef":  "i41a624c1-5f2f-4ee2-9838-24eddfa6693e_R",
                                                              "hrefs":  [
                                                                            "сontent/i6ba75a57-bb56-40b1-9727-51576d8d6b4c/Forensics_35_AB06_Key.pdf"
                                                                        ]
                                                          },
                                             "children":  [

                                                          ]
                                         }
                                     ]
                    }
                ],
    "exportRoot":  ""
};var d2l_map_data_default = d2lCourseMapData;// projects/forensics35/workspace/main.jsxvar import_jsx_runtime = __toESM(require_jsx_runtime(), 1);var actualHtmlSamples = {  citeSources: `    <div class="lesson-html">      <h1>When asked to provide your sources use the following link to help you cite using APA or MLA formats:</h1>      <div class="image-banner">Exported image banner preserved here in the real build</div>      <p><strong>External citation helper:</strong> EasyBib / Chegg citation guidance link</p>    </div>  `,  evidenceOverview: `    <div class="lesson-html">      <h3>Module Overview</h3>      <h2>Types of Evidence &amp; Fingerprint Analysis</h2>      <p>A person cannot be convicted of a crime simply because the police believe that he or she is guilty. The only way to convict a person successfully of a criminal act is by obtaining evidence that proves the individual committed the crime. This is known as the burden of proof.</p>      <p>Fingerprint collection and fingerprint pattern analysis have been used to apprehend and convict criminals for over 100 years. Because individual fingerprint patterns are unique, fingerprints distinguish one person from another.</p>      <ul>        <li>introduce two categories of physical evidence with examples of each type</li>        <li>explain the cause of and types of fingerprint patterns</li>        <li>explain techniques used to enhance hidden fingerprints</li>        <li>examine historical and fictional criminal investigations</li>      </ul>    </div>  `,  evidenceTypes: `    <div class="lesson-html">      <h2>Identified Evidence and Individualized Evidence</h2>      <p>Physical evidence from a crime scene comes in many different forms, such as fingerprints, hair, blood, saliva, semen, skin, bone, bullet casings, paint fragments, and fibers.</p>      <p>Finding and interpreting physical evidence is crucial because it can prove that a crime has been committed, establish the identity of suspects, exonerate the innocent, corroborate testimony, and be more reliable than eyewitness evidence.</p>      <table>        <thead>          <tr><th>Individualized Physical Evidence</th><th>Identified Physical Evidence</th></tr>        </thead>        <tbody>          <tr>            <td>Unique and directly linked to a specific person or source. Examples: fingerprints, DNA, bullet casings, dental impressions.</td>            <td>Shares a common source or class. Examples: clothing, shoe prints, blood type, paint chips.</td>          </tr>        </tbody>      </table>    </div>  `};var courseSeed = {  title: "Forensic Studies 25",  subtitle: "Course content mapped from the Brightspace export",  stats: { topLevelSections: 12, totalNodes: 172 },  modules: [    {      id: "course-info",      title: "Course Information",      lessonCount: 2,      lessons: [        {          id: "outline",          title: "Course outline (MUST READ)",          type: "pdf",          sourceFile: "\u0441ontent/idd074817-3b63-4e7f-b095-637a00ea461e/FS25 outline (summer school).pdf",          pdfMeta: { pages: 14, size: "652 KB" },          learn: {            heading: "Course outline (MUST READ)",            excerpt: "This source exports as a PDF. In the real player this opens inside an in-app PDF viewer instead of throwing students into a detached file download.",            bullets: [              "Preserve PDF inside the lesson shell",              "Show page navigation and zoom",              "Keep previous/next navigation around the PDF",              "Avoid breaking the course flow"            ],            callout: "Static source files should stay integrated into the course experience instead of becoming detached downloads."          },          resources: ["Original PDF source", "Course shell metadata"]        },        {          id: "cite",          title: "How to Properly Cite Sources",          type: "html-reading",          sourceFile: "\u0441ontent/i0d0b4605-e0e8-481c-84d0-9813d78b146d/How to Properly Cite Sources.html",          htmlSample: actualHtmlSamples.citeSources,          learn: {            heading: "How to Properly Cite Sources",            excerpt: "The exported file is a simple HTML page with supporting images and an external citation resource.",            bullets: [              "Simple HTML reading page",              "Uses supporting images",              "Includes an external citation help link",              "Needs modern spacing and image treatment"            ],            callout: "This is the kind of page builders oversimplify when they should just render it cleanly."          },          resources: ["Original HTML page", "External citation help link"]        }      ]    },    {      id: "m2-evidence-fingerprints",      title: "2 Types of Evidence and Fingerprint Analysis",      lessonCount: 22,      lessons: [        {          id: "overview",          title: "Types of Evidence and Fingerprint Analysis",          type: "html-reading",          sourceFile: "\u0441ontent/i2fbe29e6-e968-4c68-8cd5-dde0abd398b1/Content/book_1412/chapter_11952.html",          htmlSample: actualHtmlSamples.evidenceOverview,          learn: {            heading: "Types of Evidence & Fingerprint Analysis",            excerpt: "This is a text-rich lesson, not just a slide. The player needs to preserve the reading and make it easier to navigate.",            bullets: [              "Burden of proof",              "Physical evidence matters",              "Fingerprinting has long investigative value",              "Text-rich lesson that should stay intact"            ],            callout: "This is exactly the kind of lesson AI builders butcher when they start summarizing."          },          resources: ["Original HTML reading", "Fingerprint analysis sequence"]        },        {          id: "evidence-types",          title: "Evidence Types",          type: "html-reading",          sourceFile: "\u0441ontent/i01a08fc7-ba72-40e7-83cd-07fe01d50d49/Content/book_1412/chapter_11953.html",          htmlSample: actualHtmlSamples.evidenceTypes,          learn: {            heading: "Identified Evidence and Individualized Evidence",            excerpt: "The lesson lists examples such as fingerprints, hair, blood, saliva, semen, skin, bone, bullet casings, paint fragments, and fibres, and explains why interpreting evidence matters.",            bullets: [              "Evidence categories",              "Examples of physical evidence",              "Interpretation matters",              "Strong candidate for glossary support"            ],            callout: "This should become easier to compare, not shorter."          },          resources: ["Original HTML page", "Evidence sorting practice"]        },        {          id: "assignment",          title: "Types of Evidence and Fingerprint Analysis Assignment",          type: "assignment",          sourceFile: "assignment/i0073cf68-ef89-4190-b368-d429ee0816f0/assignment_80f86dff-581e-4e9f-abe9-d5407d926f3f.xml",          assignmentMeta: { points: 20, submissionType: "file upload" },          assignmentXml: {            intro: "After a crime has occurred, criminal investigators use scientific techniques and/or forensic science experts to help identify and interpret physical evidence from the crime scene.",            individualized: "Individualized Physical Evidence is unique and can be directly linked to a specific person and/or source. Examples: fingerprints, DNA, bullets, dental impressions.",            identified: "Identified Physical Evidence shares a common source and can be grouped into a class of items having similar properties. Examples: clothing, shoe prints, blood type.",            task: "Complete the assignment, make your own copy of the linked document, add your name, and submit the file below.",            reminder: "If you need a refresher on submissions, use the Course Information section."          },          resources: ["Assignment XML", "Submission workflow"]        },        {          id: "assessment",          title: "M2 Types of Evidence and Fingerprint Analysis Assessment",          type: "quiz",          sourceFile: "quiz/i0649d126-890d-4d3e-b83f-c563065521db/qti_c38fc56d-87c6-481d-958a-c13ba81b9304.xml",          quizMeta: { attempts: 1, timeLimitMinutes: 120, profile: "Examination" },          quizSample: {            question: "Which of the following is an identified piece of physical evidence?",            choices: ["Blood type", "Bullet casings", "Nuclear DNA", "Fingerprint impression"],            answerIndex: 0          },          resources: ["QTI XML", "Assessment settings"]        },        {          id: "slide",          title: "Brief History of Fingerprinting",          type: "image-slide",          sourceFile: "\u0441ontent/ided21828-5e62-49a3-aae1-6cf000ed83f6/Content/book_1412/chapter_11957.html",          learn: {            heading: "Brief History of Fingerprinting",            excerpt: "This lesson appears in the fingerprint sequence and should flow into pattern types, matching logic, and case studies.",            bullets: [              "Belongs in fingerprint learning arc",              "Would benefit from a timeline treatment",              "Should connect to later case studies",              "Media-first presentation"            ],            callout: "History content gets lost when builders flatten modules."          },          resources: ["Original source file", "Fingerprint sequence map"]        },        {          id: "video",          title: "Real Life CSI - Crime Scene Cleaners",          type: "embedded-video",          sourceFile: "\u0441ontent/i145c4276-895a-4176-b79e-d1ff5e43abab/Content/book_1408/chapter_11883.html",          learn: {            heading: "Real Life CSI - Crime Scene Cleaners",            excerpt: "Video nodes should keep transcript links, surrounding lesson notes, and next-step navigation visible.",            bullets: [              "Responsive embed",              "Keep video in shell",              "Keep transcript and notes nearby",              "Do not detach media from module flow"            ],            callout: "Video pages should not become awkward dead-end wrappers."          },          resources: ["Embedded media page", "Related lesson notes"]        }      ]    }  ]};function slugify(value) {  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-");}function flattenCourseNodes(nodes) {  const results = [];  for (const node of nodes || []) {    if (node.resource?.hrefs?.length) {      results.push(node);    }    if (node.children?.length) {      results.push(...flattenCourseNodes(node.children));    }  }  return results;}function mapKindToLessonType(kind, sourceFile, title) {  const normalizedTitle = String(title || "");  if (kind === "assignment" || sourceFile?.includes("/assignment/")) return "assignment";  if (kind === "quiz" || sourceFile?.includes("/quiz/") || sourceFile?.includes("qti_")) return "quiz";  if (kind === "pdf" || sourceFile?.toLowerCase().endsWith(".pdf")) return "pdf";  if (/real life csi|documentary|video|youtube|vimeo/i.test(normalizedTitle)) return "embedded-video";  if (/slide|photo|image|gallery/i.test(normalizedTitle)) return "image-slide";  if (kind === "html" || sourceFile?.toLowerCase().endsWith(".html") || sourceFile?.toLowerCase().endsWith(".htm")) return "html-reading";  return "html-reading";}function isHiddenLabel(value) {  const label = String(value || "").toLowerCase();  return label.includes("keep hidden") || label.includes("teacher resources") || label.includes("instructor only");}function buildCourseFromD2LMap(seed, d2lMap) {  if (!d2lMap?.modules?.length) {    return seed;  }  const seededLessons = seed.modules.flatMap((module) => module.lessons);  const seededBySource = new Map(    seededLessons.filter((lesson) => lesson.sourceFile).map((lesson) => [lesson.sourceFile, lesson])  );  const seededByTitle = new Map(    seededLessons.map((lesson) => [lesson.title.trim().toLowerCase(), lesson])  );  const modules = (d2lMap.modules || []).map((moduleNode) => {    const moduleHidden = isHiddenLabel(moduleNode.title);    const leaves = flattenCourseNodes(moduleNode.children);    const isCourseInfoModule = (moduleNode.title || "").trim().toLowerCase() === "course information";    const courseInfoExcludedTitles = /* @__PURE__ */ new Set([      "assignment submission",      "enabling brightspace notifications"    ]);    const filteredLeaves = leaves.filter((node) => {      if (!isCourseInfoModule) return true;      const title = (node.title || "").trim().toLowerCase();      return !courseInfoExcludedTitles.has(title);    });    const lessons = filteredLeaves.map((node, index) => {      const sourceFile = node.resource?.hrefs?.[0] ?? "";      const seeded = seededBySource.get(sourceFile) ?? seededByTitle.get((node.title || "").trim().toLowerCase());      const type = mapKindToLessonType(node.kind, sourceFile, node.title);      const id = slugify(node.id || `${moduleNode.id}-${index}-${node.title}`);      const lessonHidden = moduleHidden || isHiddenLabel(node.title);      if (seeded) {        return {          ...seeded,          id,          title: node.title || seeded.title,          type: seeded.type || type,          sourceFile: sourceFile || seeded.sourceFile,          resources: seeded.resources?.length ? seeded.resources : sourceFile ? [sourceFile] : [],          isHidden: lessonHidden        };      }      return {        id,        title: node.title || `Lesson ${index + 1}`,        type,        sourceFile: sourceFile || `manifest:${node.id}`,        resources: sourceFile ? [sourceFile] : [],        isHidden: lessonHidden,        learn: {          heading: node.title || `Lesson ${index + 1}`,          excerpt: "Mapped from the D2L manifest hierarchy. This node is included in the shell so navigation follows the real course sequence.",          bullets: [            "Manifest-derived lesson title",            "Source path preserved for traceability",            "Supports richer renderer mappings when available"          ],          callout: "This lesson is mapped from the course manifest with normalized module and lesson labels."        }      };    });    return {      id: slugify(moduleNode.id || moduleNode.title || "module"),      title: moduleNode.title,      lessonCount: lessons.length,      isHidden: moduleHidden,      lessons    };  }).filter((module) => module.lessons.length > 0);  if (!modules.length) {    return seed;  }  return {    title: "Forensic Studies 25",    subtitle: `Course content (${d2lMap.courseTitle})`,    stats: {      topLevelSections: d2lMap.summary?.moduleCount ?? modules.length,      totalNodes: d2lMap.summary?.itemCount ?? modules.reduce((sum, module) => sum + module.lessons.length, 0)    },    modules  };}var course = buildCourseFromD2LMap(courseSeed, d2l_map_data_default);var resolvedCourse = course ?? courseSeed;var resolvedModules = resolvedCourse.modules?.length ? resolvedCourse.modules : courseSeed.modules;var flatLessons = resolvedModules.flatMap(  (module) => module.lessons.map((lesson) => ({    ...lesson,    moduleId: module.id,    moduleTitle: module.title,    moduleLessonCount: module.lessonCount  })));function normalizePath(path) {  return String(path || "").replace(/\\/g, "/").replace(/^\/+/, "").replace(/\/{2,}/g, "/");}function stripQueryAndHash(pathValue) {  return String(pathValue || "").split("#")[0].split("?")[0];}function decodePathValue(pathValue) {  const stripped = stripQueryAndHash(pathValue);  let decoded = stripped;  try {    decoded = decodeURIComponent(stripped);  } catch {    decoded = stripped;  }  return decoded.replace(/\\\\/g, "/").split("/").map((part) => {    try {      return decodeURIComponent(part);    } catch {      return part;    }  }).join("/");}function joinPath(base, next) {  if (!base) return normalizePath(next);  if (!next) return normalizePath(base);  return normalizePath(`${base.replace(/\/+$/, "")}/${next.replace(/^\/+/, "")}`);}function dirname(path) {  const normalized = normalizePath(path);  const index = normalized.lastIndexOf("/");  return index === -1 ? "" : normalized.slice(0, index);}function resolveRelativePath(baseFile, relativeValue) {  if (!relativeValue) return relativeValue;  if (/^(https?:|data:|#|mailto:|tel:)/i.test(relativeValue)) return relativeValue;  const decodedRelative = decodePathValue(relativeValue);  if (decodedRelative.startsWith("/")) return decodedRelative;  const baseDir = dirname(baseFile);  const combined = joinPath(baseDir, decodedRelative);  const parts = [];  for (const part of combined.split("/")) {    if (!part || part === ".") continue;    if (part === "..") {      parts.pop();      continue;    }    parts.push(part);  }  return parts.join("/");}function encodePath(path) {  return normalizePath(path).split("/").map((part) => encodeURIComponent(part)).join("/");}function buildReferenceUrl(relativePath) {  return `/preview/references/raw/forensics35/${encodePath(relativePath)}`;}function buildWorkspaceAssetUrl(relativePath) {  return `/preview/workspace/forensics35/${encodePath(relativePath)}`;}var module4RemoteImageFallbacks = {  "https://lh4.googleusercontent.com/mwvzxUf61aqdm9oG9VyiGdKou-VQ2yHvqtFDv6rJT9lgiNDEOhwvS2rHpeSWwBtmKhimbxnLOPTOjHx7_JBnMDMJBFuozH4mS0chn5BF4uQMRbkyn4j1DGPaWhCdK4DJghQ6TBo-eZKgBPjbBQ": "\u0441ontent/i2ce3b936-b6db-4d86-9174-1bfa407805e8/Content/Blood Typing.jpg",  "https://lh6.googleusercontent.com/pM26gAa_Xhvbfdoj1ema-YP6WFlsgY2Ucg_CByG1J7coyB-aJXwZD3eu0cS6tGg30N1LVPr-B-Np9xmD3_WYZfNMn7xO-VyfIbdUNsGv8dCDR81Upd7nRCc-YGYmtUfKHHHzpyS2H0cBD_pwOA": "\u0441ontent/i828a8600-f807-4ec3-bb74-0b84f53999f5/Content/Red Blood Cells.PNG",  "https://lh3.googleusercontent.com/gj7N2Oif-4X2zfjkub58PbgAWt3XKxxCk-GF_PI9pnLmzig9Sm-eZDKfWtM_CLkbEesr_3iWfQ3qJg1c1REQKy3BkrxOSC0BLI60QrltkcCrT-HwPZUZRQ8ZlsTID5FaxZA3X7SOLscM14fouA": "\u0441ontent/i828a8600-f807-4ec3-bb74-0b84f53999f5/Content/White Blood Cells.PNG",  "https://lh6.googleusercontent.com/A0XYWVnt-KsIFRtn-iJ2fyit8XQWxuznFqmFZe0i3FL17baTAZI6OvGjbKvJoYjGB4K0tlWQpY5ERY0LTOSqip1J3luRdNyzy983phkU37RgGpp7vUfqXKBUqtDQOJLohFxZJZwzURYrNLjKLw": "\u0441ontent/i2ce3b936-b6db-4d86-9174-1bfa407805e8/Content/Blood Typing.jpg"};var MODULE4_TAMMY_PARROT_COMIC_PATH = "assets/module4/tammy-parrot-comic.png";var MODULE4_BLOOD_SPILL_PATH = "assets/module4/blood-spill.jpg";function stripScriptsAndRewriteLinks(html, sourceFile, exportRoot) {  const parser = new DOMParser();  const doc = parser.parseFromString(html, "text/html");  const normalizedSource = normalizePath(sourceFile || "");  const normalizedSourceNoQuery = normalizedSource.split("?")[0].split("#")[0];  const normalizedSourceLower = normalizedSourceNoQuery.toLowerCase();  doc.querySelectorAll("script, style, link[rel='stylesheet']").forEach((el) => el.remove());  doc.querySelectorAll("meta, title, head").forEach((el) => el.remove());  doc.querySelectorAll("[aria-hidden='true'], .sr-only, .visually-hidden").forEach((el) => el.remove());  const remapRootPath = (value) => {    const normalized = decodePathValue(String(value || ""));    if (!normalized.startsWith("/")) return "";    const trimmed = normalized.slice(1);    if (/^(content|assignment|quiz|Ñontent)\//i.test(trimmed)) {      return exportRoot ? joinPath(exportRoot, trimmed) : trimmed;    }    return "";  };  if (normalizedSourceLower.endsWith("chapter_12006.html") || normalizedSourceLower.includes("chapter_12006")) {    const paragraphs = Array.from(doc.body.querySelectorAll("p")).filter((p) => (p.textContent || "").trim());    const insertAfter = paragraphs.length ? paragraphs[paragraphs.length - 1] : doc.body.lastElementChild;    if (insertAfter) {      const wrapper = doc.createElement("div");      const img = doc.createElement("img");      img.setAttribute("src", buildWorkspaceAssetUrl(MODULE4_TAMMY_PARROT_COMIC_PATH));      img.setAttribute("alt", "Tammy's Parrot case summary");      img.setAttribute("style", "max-width:100%;display:block;margin:16px auto;");      wrapper.appendChild(img);      insertAfter.parentNode?.insertBefore(wrapper, insertAfter.nextSibling);    }  }  const rewriteAttr = (selector, attr) => {    doc.querySelectorAll(selector).forEach((el) => {      const value = el.getAttribute(attr);      if (!value) return;      if (attr === "src" && /^https?:/i.test(value)) {        const fallbackPath = module4RemoteImageFallbacks[value];        if (fallbackPath) {          const withRoot2 = exportRoot ? joinPath(exportRoot, fallbackPath) : fallbackPath;          el.setAttribute(attr, buildReferenceUrl(withRoot2));          return;        }      }      if (        attr === "src" &&        (normalizedSourceLower.endsWith("historical crime case 2.html") || normalizedSourceLower.includes("historical%20crime%20case%202.html") || normalizedSourceLower.includes("historicalcrimecase2") || normalizedSourceLower.includes("historical%20crime%20case%202"))      ) {        const normalizedValue = decodePathValue(value);        if (normalizedValue.toLowerCase().includes("hallway.png")) {          el.setAttribute(attr, buildWorkspaceAssetUrl(MODULE4_BLOOD_SPILL_PATH));          return;        }      }      if (/^(https?:|data:|#|mailto:|tel:)/i.test(value)) return;      const decodedValue = decodePathValue(value);      const remappedRoot = remapRootPath(decodedValue);      if (remappedRoot) {        el.setAttribute(attr, buildReferenceUrl(remappedRoot));        return;      }      const resolved = resolveRelativePath(sourceFile, decodedValue);      if (!resolved || resolved.startsWith("/")) return;      const withRoot = exportRoot ? joinPath(exportRoot, resolved) : resolved;      el.setAttribute(attr, buildReferenceUrl(withRoot));    });  };  rewriteAttr("img[src]", "src");  rewriteAttr("a[href]", "href");  rewriteAttr("source[src]", "src");  rewriteAttr("iframe[src]", "src");  rewriteAttr("video[src]", "src");  rewriteAttr("object[data]", "data");  doc.querySelectorAll("p").forEach((paragraph) => {    const text = paragraph.textContent?.replace(/\u00a0/g, " ").trim() || "";    if (!text && !paragraph.querySelector("img, a, iframe, video")) {      paragraph.remove();    }  });  doc.querySelectorAll("footer").forEach((footer) => {    const text = footer.textContent?.replace(/\u00a0/g, " ").trim() || "";    if (!text && !footer.querySelector("img, a")) {      footer.remove();    }  });  return doc.body.innerHTML || html;}function hasMeaningfulHtmlContent(html) {  if (!html) return false;  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");  const text = (doc.body.textContent || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();  const mediaLike = doc.querySelectorAll("img, table, iframe, video, object, ul li, ol li").length;  return text.length >= 40 || mediaLike > 0;}function splitHtmlIntoSections(html) {  if (!html) return [];  const parser = new DOMParser();  const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");  const root = doc.body.firstElementChild || doc.body;  const nodes = Array.from(root.childNodes || []);  const sections = [];  let current = null;  let untitledIndex = 1;  const pushCurrent = () => {    if (!current) return;    const content = current.parts.join("").trim();    if (!content) return;    sections.push({      id: `section-${sections.length + 1}`,      title: current.title,      html: content    });  };  for (const node of nodes) {    const tag = node.nodeType === 1 ? node.tagName.toLowerCase() : "";    const outer = node.nodeType === 1 ? node.outerHTML : node.textContent?.trim() ? `<p>${node.textContent}</p>` : "";    if (!outer) continue;    if (/^h[1-3]$/.test(tag)) {      pushCurrent();      const headingText = node.textContent?.trim() || `Section ${untitledIndex++}`;      current = { title: headingText, parts: [outer] };      continue;    }    if (!current) {      current = { title: `Section ${untitledIndex++}`, parts: [] };    }    current.parts.push(outer);  }  pushCurrent();  return sections;}function decodeHtmlEntities(value) {  if (!value) return "";  const node = document.createElement("textarea");  node.innerHTML = value;  return node.value;}function getElementsByLocalName(root, localName) {  return Array.from(root.getElementsByTagName("*")).filter((el) => el.localName === localName);}function normalizeAssignmentHtml(html, sourceFile, exportRoot) {  if (!html) return "";  return stripScriptsAndRewriteLinks(`<div>${html}</div>`, sourceFile, exportRoot).replace(/^<div>/i, "").replace(/<\/div>\s*$/i, "");}var ASSIGNMENT_SUBMISSION_PHRASE = "When you have completed the assignment, upload your generated reports to your respective online classroom";function dedupeAssignmentSubmissionLine(html) {  if (!html) return "";  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");  let seen = false;  doc.body.querySelectorAll("h1, h2, h3, h4, h5, h6, p, div, span, li").forEach((el) => {    const text = (el.textContent || "").replace(/\s+/g, " ").trim();    if (text !== ASSIGNMENT_SUBMISSION_PHRASE) return;    if (seen) {      el.remove();      return;    }    seen = true;  });  doc.body.querySelectorAll("p, h1, h2, h3, h4, h5, h6, div, span, li").forEach((el) => {    const text = (el.textContent || "").replace(/\xA0/g, " ").trim();    if (!text && !el.querySelector("img, a, iframe, video, source, object")) {      el.remove();    }  });  return doc.body.innerHTML.replace(/^<div>/i, "").replace(/<\/div>\s*$/i, "");}function parseAssignmentXml(xmlText, sourceFile, exportRoot) {  const xml = new DOMParser().parseFromString(xmlText, "application/xml");  const title = getElementsByLocalName(xml, "title")[0]?.textContent?.trim() || "Assignment";  const textNode = getElementsByLocalName(xml, "instructor_text")[0];  const rawHtml = decodeHtmlEntities(textNode?.textContent || "");  const textHtml = dedupeAssignmentSubmissionLine(normalizeAssignmentHtml(rawHtml, sourceFile, exportRoot));  const pointsRaw = getElementsByLocalName(xml, "gradable")[0]?.getAttribute("points_possible");  const formatNodes = getElementsByLocalName(xml, "format");  const textOnly = textHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();  const sentenceChunks = textOnly.split(/(?<=[.!?])\s+/).map((chunk) => chunk.trim()).filter(Boolean);  const taskSentence = sentenceChunks.find((chunk) => /\b(complete|submit|upload|click|make a copy)\b/i.test(chunk)) || sentenceChunks[0] || "";  const reminderSentence = sentenceChunks.find((chunk) => /\b(refresher|remember|if you need)\b/i.test(chunk)) || sentenceChunks[sentenceChunks.length - 1] || "";  const links = [];  const linkDoc = new DOMParser().parseFromString(`<div>${textHtml}</div>`, "text/html");  linkDoc.querySelectorAll("a[href]").forEach((anchor) => {    const href = anchor.getAttribute("href") || "";    const label = (anchor.textContent || "").trim() || href;    if (!href) return;    links.push({ href, label });  });  return {    title,    assignmentMeta: {      points: Number(pointsRaw || 0) || 0,      submissionType: formatNodes[0]?.getAttribute("type") || "submission",      submissionFormats: formatNodes.map((node) => node.getAttribute("type") || "").filter(Boolean)    },    assignmentXml: {      intro: textHtml,      task: taskSentence,      reminder: reminderSentence,      links    }  };}function parseQuizXml(xmlText) {  const xml = new DOMParser().parseFromString(xmlText, "application/xml");  const items = getElementsByLocalName(xml, "item");  if (!items.length) return null;  const questions = items.map((item, itemIndex) => {    const matTexts = getElementsByLocalName(item, "mattext").map((el) => decodeHtmlEntities(el.textContent || ""));    const question = matTexts[0] || `Quiz question ${itemIndex + 1}`;    const choiceNodes = getElementsByLocalName(item, "response_label");    const choices = choiceNodes.map((node) => {      const text = getElementsByLocalName(node, "mattext")[0]?.textContent || "";      return decodeHtmlEntities(text).replace(/<[^>]+>/g, "").trim();    });    const correctId = getElementsByLocalName(item, "respcondition").find((node) => getElementsByLocalName(node, "setvar").length > 0)?.getElementsByTagName("varequal")[0]?.textContent?.trim();    const choiceIds = choiceNodes.map((node) => node.getAttribute("ident"));    const answerIndex = correctId ? Math.max(0, choiceIds.indexOf(correctId)) : 0;    return {      id: item.getAttribute("ident") || `item-${itemIndex + 1}`,      question: question.replace(/<[^>]+>/g, "").trim(),      choices: choices.filter(Boolean),      answerIndex    };  }).filter((question) => question.question && question.choices.length > 0);  if (!questions.length) return null;  const metadataFields = getElementsByLocalName(xml, "qtimetadatafield");  const readMeta = (label) => {    const field = metadataFields.find(      (node) => getElementsByLocalName(node, "fieldlabel")[0]?.textContent?.trim() === label    );    return getElementsByLocalName(field || xml, "fieldentry")[0]?.textContent?.trim();  };  return {    quizMeta: {      profile: readMeta("qmd_assessmenttype") || "Assessment",      attempts: Number(readMeta("cc_maxattempts") || 1),      timeLimitMinutes: Number(readMeta("qmd_timelimit") || 0),      questionCount: questions.length    },    quizSample: questions[0],    quizQuestions: questions  };}var FORENSIC_THEME = {  panel: "rounded-2xl border border-white/[0.08] bg-[#141821] shadow-[0_18px_40px_rgba(0,0,0,0.45)]",  panelSoft: "rounded-2xl border border-white/[0.08] bg-[#101216] shadow-[0_16px_36px_rgba(0,0,0,0.4)]",  buttonPrimary: "rounded-lg border border-[#dc2626]/70 bg-[#b91c1c] px-4 py-2.5 text-sm font-semibold text-[#f3f4f6] transition duration-200 hover:bg-[#dc2626] hover:shadow-[0_0_0_1px_rgba(220,38,38,0.35),0_10px_24px_rgba(185,28,28,0.28)]",  buttonSecondary: "rounded-lg border border-white/[0.12] bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-[#d1d5db] transition duration-200 hover:border-white/[0.26] hover:bg-white/[0.07] hover:text-[#f3f4f6]",  overline: "text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6b7280]"};var MODULE1_ASSIGNMENT_EMBED_PATH = "./assets/module1assignment.html";var MODULE2_ASSIGNMENT_EMBED_PATH = "./assets/module2assignment.html";var MODULE3_ASSIGNMENT_EMBED_PATH = "./assets/module3assignment.html";var MODULE4_ASSIGNMENT_EMBED_PATH = "./assets/module4assignment.html";var MODULE5_ASSIGNMENT_EMBED_PATH = "./assets/module5assignment.html";var MODULE6_ASSIGNMENT_EMBED_PATH = "./assets/module6assignment.html";var MODULE7_ASSIGNMENT_EMBED_PATH = "./assets/module7assignment.html";function Badge({ children, className = "", ...props }) {  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(    "span",    {      ...props,      className: `rounded-md border border-white/[0.12] bg-white/[0.03] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#a1a8b3] ${className}`.trim(),      children    }  );}function typeLabel(type) {  const map = {    assignment: "ASSIGNMENT",    "lab-assignment": "ASSIGNMENT",    quiz: "QUIZ",    pdf: "PDF",    "embedded-video": "VIDEO",    "image-slide": "SLIDE",    "html-reading": "READING"  };  return map[type] || "RESOURCE";}function formatLessonTitleForDisplay(lesson) {  const rawTitle = String(lesson?.title || "").trim();  if (!rawTitle) return rawTitle;  const moduleAssessmentMatch = rawTitle.match(/^M\s*(\d+)\s+(.+?)\s+Assessment$/i);  if (moduleAssessmentMatch) {    const moduleNumber = moduleAssessmentMatch[1];    const topic = moduleAssessmentMatch[2].trim();    return `Module ${moduleNumber} Assessment: ${topic}`;  }  return rawTitle;}function formatModuleTitleForDisplay(title) {  const rawTitle = String(title || "").trim();  if (!rawTitle) return rawTitle;  const numberedModuleMatch = rawTitle.match(/^(\d+)\s+(.+)$/);  if (numberedModuleMatch) {    const moduleNumber = numberedModuleMatch[1];    const moduleName = numberedModuleMatch[2].trim();    return `Module ${moduleNumber}: ${moduleName}`;  }  return rawTitle;}function HtmlRenderer({ html }) {  const sections = useMemo(() => splitHtmlIntoSections(html), [html]);  const [sectionMode, setSectionMode] = useState(false);  const [collapsedSections, setCollapsedSections] = useState({});  useEffect(() => {    setSectionMode(false);    setCollapsedSections({});  }, [html]);  const collapseAll = () => {    setCollapsedSections(Object.fromEntries(sections.map((section) => [section.id, true])));  };  const expandAll = () => {    setCollapsedSections({});  };  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `${FORENSIC_THEME.panel} p-6`, "data-testid": "renderer-html", children: [    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mb-4 flex flex-wrap justify-end gap-2", children: sections.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(        "button",        {          onClick: () => setSectionMode((prev) => !prev),          className: FORENSIC_THEME.buttonSecondary,          "data-testid": "section-mode-toggle",          children: sectionMode ? "Single flow" : "Section mode"        }      ),      sectionMode && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(          "button",          {            onClick: expandAll,            className: FORENSIC_THEME.buttonSecondary,            "data-testid": "section-expand-all",            children: "Expand all"          }        ),        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(          "button",          {            onClick: collapseAll,            className: FORENSIC_THEME.buttonSecondary,            "data-testid": "section-collapse-all",            children: "Collapse all"          }        )      ] })    ] }) }),    sectionMode && sections.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "space-y-3", children: sections.map((section) => {      const collapsed = !!collapsedSections[section.id];      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rounded-xl border border-white/[0.1] bg-white/[0.02]", "data-testid": "section-container", children: [        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(          "button",          {            onClick: () => setCollapsedSections((prev) => ({ ...prev, [section.id]: !prev[section.id] })),            className: "flex w-full items-center justify-between px-4 py-3 text-left transition duration-200 hover:bg-white/[0.03]",            children: [              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-sm font-semibold text-[#f3f4f6]", children: section.title }),              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: FORENSIC_THEME.overline, children: collapsed ? "Expand" : "Collapse" })            ]          }        ),        !collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(          "div",          {            className: "max-w-none border-t border-white/[0.08] px-4 py-4 text-[#cbd5e1] [&_*]:!text-[#e5e7eb] [&_.image-banner]:my-4 [&_.image-banner]:rounded-xl [&_.image-banner]:border [&_.image-banner]:border-white/[0.1] [&_.image-banner]:bg-white/[0.04] [&_.image-banner]:p-8 [&_.image-banner]:text-center [&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:!text-[#f8fafc] [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:!text-[#f8fafc] [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:!text-[#f1f5f9] [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_p]:leading-7 [&_p]:!text-[#e5e7eb] [&_li]:!text-[#e5e7eb] [&_strong]:!text-[#f8fafc] [&_em]:!text-[#e2e8f0] [&_table]:mt-4 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-white/[0.12] [&_td]:p-3 [&_th]:border [&_th]:border-white/[0.14] [&_th]:bg-white/[0.06] [&_th]:p-3 [&_ul]:list-disc [&_ul]:pl-6",            dangerouslySetInnerHTML: { __html: section.html }          }        )      ] }, section.id);    }) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(      "div",      {        className: "max-w-none text-[#cbd5e1] [&_*]:!text-[#e5e7eb] [&_.image-banner]:my-4 [&_.image-banner]:rounded-xl [&_.image-banner]:border [&_.image-banner]:border-white/[0.1] [&_.image-banner]:bg-white/[0.04] [&_.image-banner]:p-8 [&_.image-banner]:text-center [&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:!text-[#f8fafc] [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:!text-[#f8fafc] [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:!text-[#f1f5f9] [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_p]:leading-7 [&_p]:!text-[#e5e7eb] [&_li]:!text-[#e5e7eb] [&_strong]:!text-[#f8fafc] [&_em]:!text-[#e2e8f0] [&_table]:mt-4 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-white/[0.12] [&_td]:p-3 [&_th]:border [&_th]:border-white/[0.14] [&_th]:bg-white/[0.06] [&_th]:p-3 [&_ul]:list-disc [&_ul]:pl-6",        dangerouslySetInnerHTML: { __html: html }      }    )  ] });}function PdfRenderer({ meta, title, sourceUrl }) {  const pages = meta?.pages || 1;  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `${FORENSIC_THEME.panel} p-6`, "data-testid": "renderer-pdf", children: [    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mb-5 flex items-center justify-between", children: [      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: FORENSIC_THEME.overline, children: "Course PDF" }),        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { className: "mt-1 text-lg font-semibold text-[#f3f4f6]", children: title })      ] }),      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex gap-2", children: [        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: meta?.size || "PDF" }),        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { children: [          pages,          " pages"        ] })      ] })    ] }),    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid gap-4 lg:grid-cols-[180px_1fr]", children: [      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `${FORENSIC_THEME.panelSoft} p-3`, children: [        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `mb-3 ${FORENSIC_THEME.overline}`, children: "Pages" }),        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "space-y-2", children: Array.from({ length: Math.min(pages, 6) }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(          "div",          {            className: `rounded-xl border px-3 py-2 text-sm ${i === 0 ? "border-[#b91c1c]/70 bg-[#1a1215] text-[#fecaca]" : "border-white/[0.1] bg-white/[0.02] text-[#a1a8b3]"}`,            children: [              "Page ",              i + 1            ]          },          i        )) })      ] }),      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `${FORENSIC_THEME.panelSoft} p-4`, children: [        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mb-4 flex items-center justify-between text-sm text-[#a1a8b3]", children: [          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [            "Page 1 of ",            pages          ] }),          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex gap-2", children: [            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: FORENSIC_THEME.buttonSecondary, children: "Fit" }),            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: FORENSIC_THEME.buttonSecondary, children: "\u2212" }),            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: FORENSIC_THEME.buttonSecondary, children: "+" })          ] })        ] }),        sourceUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(          "iframe",          {            src: sourceUrl,            title,            className: "mx-auto min-h-[520px] w-full max-w-[760px] rounded-xl border border-white/20 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"          }        ) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto flex min-h-[520px] max-w-[760px] items-center justify-center rounded-xl border border-white/20 bg-white/[0.02] p-8 text-center text-sm leading-7 text-[#a1a8b3] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]", children: "PDF page canvas would render here with real pagination, zoom, and outline support." })      ] })    ] })  ] });}function SlideRenderer({ title }) {  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `${FORENSIC_THEME.panel} p-6`, "data-testid": "renderer-slide", children: [    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mb-4 flex items-center justify-between", children: [      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: FORENSIC_THEME.overline, children: "Evidence media" }),        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { className: "mt-1 text-lg font-semibold text-[#f3f4f6]", children: title })      ] }),      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex gap-2", children: [        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "responsive media" }),        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "zoom ready" })      ] })    ] }),    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "overflow-hidden rounded-2xl border border-white/[0.12] bg-slate-950/95", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex min-h-[460px] items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(185,28,28,0.18),_transparent_36%),linear-gradient(180deg,_#141821,_#090a0d)] p-10 text-center", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileImage, { className: "h-7 w-7 text-[#fecaca]" }) }),      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { className: "text-2xl font-semibold text-[#f3f4f6]", children: title }),      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "mx-auto mt-3 max-w-xl text-sm leading-7 text-[#cbd5e1]", children: "Original exported slide/image asset would render here with preserved visuals, zoom support, and optional caption treatment." })    ] }) }) })  ] });}function AssignmentRenderer({ data, meta, title }) {  const introHtml = data?.intro || "";  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `${FORENSIC_THEME.panel} p-6`, "data-testid": "renderer-assignment", children: [    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mb-5 flex items-center justify-between", children: [      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: FORENSIC_THEME.overline, children: "Case assignment" }),        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { className: "mt-1 text-lg font-semibold text-[#f3f4f6]", children: title })      ] }),      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex gap-2", children: [        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { children: [          meta?.points || 0,          " pts"        ] }),        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: meta?.submissionType || "submission" }),        meta?.submissionFormats?.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { children: [          meta.submissionFormats.length,          " formats"        ] })      ] })    ] }),    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "space-y-4 text-sm leading-7 text-[#cbd5e1]", children: [        introHtml ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(          "div",          {            className: "max-w-none [&_img]:mx-auto [&_img]:my-4 [&_img]:h-auto [&_img]:max-w-full [&_p]:mb-3",            dangerouslySetInnerHTML: { __html: introHtml }          }        ) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "No assignment instructions are available yet." }),        (data?.individualized || data?.identified) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid gap-4 lg:grid-cols-2", children: [          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rounded-xl border border-white/[0.12] bg-[#112015] p-4", children: [            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "text-[11px] font-semibold uppercase tracking-[0.14em] text-[#86efac]", children: "Individualized evidence" }),            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "mt-2 text-[#dcfce7]", children: data?.individualized || "Not specified." })          ] }),          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rounded-xl border border-white/[0.12] bg-[#111d2a] p-4", children: [            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "text-[11px] font-semibold uppercase tracking-[0.14em] text-[#93c5fd]", children: "Identified evidence" }),            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "mt-2 text-[#dbeafe]", children: data?.identified || "Not specified." })          ] })        ] })    ] })  ] });}function EmbeddedAssignmentRenderer({ title, srcPath, introHtml = "" }) {  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `${FORENSIC_THEME.panel} p-6`, "data-testid": "renderer-assignment", children: [    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mb-5 flex items-center justify-between", children: [      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: FORENSIC_THEME.overline, children: "Case assignment" }),        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { className: "mt-1 text-lg font-semibold text-[#f3f4f6]", children: title })      ] }),      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "interactive lab" })    ] }),    introHtml ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(      "div",      {        className: "mb-5 max-w-none text-sm leading-7 text-[#cbd5e1] [&_img]:mx-auto [&_img]:my-4 [&_img]:h-auto [&_img]:max-w-full [&_p]:mb-3 [&_strong]:text-[#f3f4f6]",        dangerouslySetInnerHTML: { __html: introHtml }      }    ) : null,    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "rounded-2xl border border-white/[0.12] bg-[#0f172a]", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(      "iframe",      {        src: srcPath,        title,        className: "h-[1600px] min-h-[1600px] w-full md:h-[1800px] md:min-h-[1800px] xl:h-[2000px] xl:min-h-[2000px]"      }    ) })  ] });}function QuizRenderer({ quiz, questions, meta }) {  const parsedQuestions = questions?.length ? questions : quiz ? [quiz] : [];  const [questionIndex, setQuestionIndex] = useState(0);  const [answersByQuestion, setAnswersByQuestion] = useState({});  const [feedbackByQuestion, setFeedbackByQuestion] = useState({});  const activeQuestion = parsedQuestions[questionIndex] || parsedQuestions[0];  const activeQuestionId = activeQuestion?.id || `question-${questionIndex}`;  const currentSelected = answersByQuestion[activeQuestionId];  const showFeedback = !!feedbackByQuestion[activeQuestionId];  const correct = currentSelected === activeQuestion?.answerIndex;  const answeredCount = parsedQuestions.filter((question) => answersByQuestion[question.id] !== void 0).length;  const correctCount = parsedQuestions.filter((question) => answersByQuestion[question.id] === question.answerIndex).length;  const resetQuizAttempt = () => {    setQuestionIndex(0);    setAnswersByQuestion({});    setFeedbackByQuestion({});  };  const generateQuizReport = () => {    const safe = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");    const rows = parsedQuestions.map((question, idx) => {      const selectedIndex = answersByQuestion[question.id];      const selectedLabel = selectedIndex === void 0 ? "Not answered" : question.choices?.[selectedIndex] || "Not answered";      const result = selectedIndex === void 0 ? "Pending" : selectedIndex === question.answerIndex ? "Correct" : "Incorrect";      return `          <tr>            <td>${idx + 1}</td>            <td>${safe(question.question || "Untitled question")}</td>            <td>${safe(selectedLabel)}</td>            <td>${result}</td>          </tr>        `;    }).join("");    const reportHtml = `      <!doctype html>      <html>        <head>          <meta charset="utf-8" />          <title>Assignments Report</title>          <style>            body { font-family: 'Avenir Next', 'Segoe UI', sans-serif; margin: 32px; color: #0f172a; }            h1 { margin: 0 0 8px; font-size: 28px; }            p { margin: 0 0 6px; color: #334155; }            .chips { margin: 16px 0 18px; display: flex; gap: 8px; flex-wrap: wrap; }            .chip { border: 1px solid #cbd5e1; border-radius: 999px; padding: 6px 12px; font-size: 12px; font-weight: 700; color: #334155; }            table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 13px; }            th, td { border: 1px solid #e2e8f0; text-align: left; vertical-align: top; padding: 10px; }            th { background: #f8fafc; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #475569; }          </style>        </head>        <body>          <h1>Assignments Report</h1>          <p><strong>Score:</strong> ${correctCount}/${parsedQuestions.length}</p>          <p><strong>Answered:</strong> ${answeredCount}/${parsedQuestions.length}</p>          <div class="chips">            <span class="chip">${parsedQuestions.length} questions</span>            <span class="chip">${meta?.profile || "Module assessment"}</span>            <span class="chip">Retakes allowed</span>          </div>          <table>            <thead>              <tr>                <th>#</th>                <th>Question</th>                <th>Your Answer</th>                <th>Result</th>              </tr>            </thead>            <tbody>${rows}</tbody>          </table>        </body>      </html>    `;    const reportBlob = new Blob([reportHtml], { type: "text/html" });    const reportUrl = URL.createObjectURL(reportBlob);    const reportWindow = window.open(reportUrl, "_blank");    if (!reportWindow) {      URL.revokeObjectURL(reportUrl);      return;    }    window.setTimeout(() => {      reportWindow.focus();      reportWindow.print();      URL.revokeObjectURL(reportUrl);    }, 350);  };  useEffect(() => {    resetQuizAttempt();  }, [questions, quiz]);  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `${FORENSIC_THEME.panel} p-6`, "data-testid": "renderer-quiz", children: [    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mb-5 flex items-center justify-between", children: [      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: FORENSIC_THEME.overline, children: "Assignments" }),        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { className: "mt-1 text-lg font-semibold text-[#f3f4f6]", children: "Module assessment" })      ] }),      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex flex-wrap gap-2", children: [        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { children: [          parsedQuestions.length,          " questions"        ] }),        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { children: [          correctCount,          "/",          parsedQuestions.length,          " correct"        ] }),        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { "data-testid": "quiz-progress", children: [          answeredCount,          "/",          parsedQuestions.length,          " answered"        ] })      ] })    ] }),    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [      parsedQuestions.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mb-4 flex flex-wrap gap-2", "data-testid": "quiz-question-nav", children: parsedQuestions.map((question, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(        "button",        {          onClick: () => {            setQuestionIndex(idx);          },          className: `rounded-lg border px-3 py-1.5 text-xs font-semibold transition duration-200 ${questionIndex === idx ? "border-[#b91c1c]/70 bg-[#1a1215] text-[#fecaca]" : "border-white/[0.12] bg-white/[0.02] text-[#a1a8b3] hover:border-white/[0.24] hover:text-[#f3f4f6]"}`,          "data-testid": "quiz-question-button",          "data-current": questionIndex === idx ? "true" : "false",          children: [            "Q",            idx + 1,            " ",            answersByQuestion[question.id] !== void 0 ? "\u2022" : ""          ]        },        question.id      )) }),      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mb-4 h-2 overflow-hidden rounded-full bg-white/[0.08]", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(        "div",        {          className: "h-full rounded-full bg-[#b91c1c]",          style: { width: `${parsedQuestions.length ? answeredCount / parsedQuestions.length * 100 : 0}%` }        }      ) }),      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-sm leading-7 text-[#d1d5db]", children: activeQuestion?.question || "No quiz question parsed." }),      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-5 space-y-3", children: activeQuestion?.choices?.map((choice, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(        "button",        {          onClick: () => {            setAnswersByQuestion((prev) => ({ ...prev, [activeQuestionId]: idx }));            setFeedbackByQuestion((prev) => ({ ...prev, [activeQuestionId]: false }));          },          className: `w-full rounded-2xl border p-4 text-left text-sm transition ${currentSelected === idx ? "border-[#b91c1c]/70 bg-[#1a1215] text-[#f3f4f6]" : "border-white/[0.12] bg-white/[0.02] text-[#cbd5e1] hover:border-white/[0.24] hover:bg-white/[0.05]"}`,          "data-testid": "quiz-answer-choice",          children: choice        },        idx      )) }),      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mt-5 flex flex-wrap gap-3", children: [        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(          "button",          {            onClick: () => setFeedbackByQuestion((prev) => ({ ...prev, [activeQuestionId]: true })),            className: `w-full sm:w-auto ${FORENSIC_THEME.buttonPrimary}`,            "data-testid": "quiz-check-answer",            children: "Check answer"          }        ),        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(          "button",          {            onClick: () => {              setAnswersByQuestion((prev) => ({ ...prev, [activeQuestionId]: void 0 }));              setFeedbackByQuestion((prev) => ({ ...prev, [activeQuestionId]: false }));            },            className: `w-full sm:w-auto ${FORENSIC_THEME.buttonSecondary}`,            children: "Clear answer"          }        ),        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(          "button",          {            onClick: resetQuizAttempt,            className: `w-full sm:w-auto ${FORENSIC_THEME.buttonSecondary}`,            children: "Retake quiz"          }        ),        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(          "button",          {            onClick: generateQuizReport,            className: `w-full sm:w-auto ${FORENSIC_THEME.buttonSecondary}`,            children: "Generate report"          }        ),        parsedQuestions.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(          "button",          {            onClick: () => {              if (questionIndex < parsedQuestions.length - 1) {                setQuestionIndex((idx) => idx + 1);              }            },            className: `w-full sm:w-auto ${FORENSIC_THEME.buttonSecondary}`,            "data-testid": "quiz-next-question",            children: "Next question"          }        )      ] }),      showFeedback && currentSelected !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `mt-5 rounded-2xl border p-4 ${correct ? "border-emerald-400/35 bg-emerald-950/30" : "border-[#dc2626]/45 bg-[#2d0f14]"}`, children: [        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `text-sm font-semibold ${correct ? "text-emerald-300" : "text-rose-300"}`, children: correct ? "Correct" : "Wrong" }),        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: `mt-2 text-sm leading-7 ${correct ? "text-emerald-100" : "text-rose-100"}`, children: [          "In the exported quiz, the correct answer is ",          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: activeQuestion?.choices?.[activeQuestion?.answerIndex] }),          "."        ] })      ] })    ] }) })  ] });}function VideoRenderer({ title }) {  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `${FORENSIC_THEME.panel} p-6`, "data-testid": "renderer-video", children: [    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mb-4 flex items-center justify-between", children: [      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: FORENSIC_THEME.overline, children: "Media sequence" }),        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { className: "mt-1 text-lg font-semibold text-[#f3f4f6]", children: title })      ] }),      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "responsive embed" })    ] }),    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "overflow-hidden rounded-2xl border border-white/[0.12] bg-slate-950", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex aspect-video items-center justify-center bg-[radial-gradient(circle_at_top,rgba(185,28,28,0.16),transparent_42%),linear-gradient(135deg,#101216,#08090c)]", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "text-center", children: [      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayCircle, { className: "mx-auto h-14 w-14 text-[#fecaca]" }),      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-3 text-lg font-semibold text-[#f3f4f6]", children: title }),      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "mt-2 max-w-lg text-sm text-[#cbd5e1]", children: "The real build would embed the exported video page cleanly here instead of leaving it as an awkward detached Brightspace wrapper." })    ] }) }) })  ] });}function SourceFallback({ activeLesson, sourcePreview }) {  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rounded-2xl border border-[#b91c1c]/45 bg-[#2a1216] p-6 shadow-[0_16px_34px_rgba(0,0,0,0.45)]", "data-testid": "renderer-fallback", children: [    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { className: "text-lg font-semibold text-[#fecaca]", children: "Content unavailable in this view" }),    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "mt-3 text-sm leading-7 text-[#fee2e2]", children: "This item is still part of the module, but this content type is not fully rendered yet." }),    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mt-4 space-y-2 rounded-xl border border-white/[0.12] bg-white/[0.04] p-4 text-xs text-[#e2e8f0]", children: [      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Type:" }),        " ",        typeLabel(activeLesson?.type)      ] }),      sourcePreview?.error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Status:" }),        " Rendering is still in progress for this item."      ] })    ] })  ] });}function renderNodePreview(activeLesson, sourcePreview) {  const isSourceCritical = ["html-reading", "pdf", "assignment", "quiz"].includes(activeLesson.type);  if (isSourceCritical && sourcePreview?.status === "loading") {    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `${FORENSIC_THEME.panelSoft} p-6 text-sm text-[#a1a8b3]`, children: "Loading content..." });  }  if (isSourceCritical && sourcePreview?.status === "error") {    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SourceFallback, { activeLesson, sourcePreview });  }  if (activeLesson.type === "html-reading") {    const html = sourcePreview?.kind === "html" ? sourcePreview.html : activeLesson.htmlSample;    if (html) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HtmlRenderer, { html });  }  if (activeLesson.type === "pdf") {    const sourceUrl = sourcePreview?.kind === "pdf" ? sourcePreview.url : void 0;    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfRenderer, { meta: activeLesson.pdfMeta, title: activeLesson.title, sourceUrl });  }  if (activeLesson.type === "image-slide") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlideRenderer, { title: activeLesson.title });  if (activeLesson.type === "assignment") {    const parsedData = sourcePreview?.kind === "assignment" ? sourcePreview.assignmentXml : activeLesson.assignmentXml;    const parsedMeta = sourcePreview?.kind === "assignment" ? sourcePreview.assignmentMeta : activeLesson.assignmentMeta;    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssignmentRenderer, { data: parsedData, meta: parsedMeta, title: activeLesson.title });  }  if (activeLesson.type === "lab-assignment") {    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmbeddedAssignmentRenderer, {      title: activeLesson.title,      srcPath: activeLesson.embedPath || MODULE4_ASSIGNMENT_EMBED_PATH,      introHtml: activeLesson.assignmentXml?.intro || activeLesson.introHtml || ""    });  }  if (activeLesson.type === "quiz") {    const quiz = sourcePreview?.kind === "quiz" ? sourcePreview.quizSample : activeLesson.quizSample;    const questions = sourcePreview?.kind === "quiz" ? sourcePreview.quizQuestions : activeLesson.quizQuestions;    const meta = sourcePreview?.kind === "quiz" ? sourcePreview.quizMeta : activeLesson.quizMeta;    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuizRenderer, { quiz, questions, meta });  }  if (activeLesson.type === "embedded-video") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoRenderer, { title: activeLesson.title });  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SourceFallback, { activeLesson, sourcePreview });}function ChapterLessonCard({ lesson }) {  const [sourcePreview, setSourcePreview] = useState({ status: "idle", kind: null });  useEffect(() => {    let cancelled = false;    async function loadSourcePreview() {      if (!lesson?.sourceFile) {        if (!cancelled) setSourcePreview({ status: "idle", kind: null });        return;      }      const sourcePath = normalizePath(lesson.sourceFile);      const exportRoot = normalizePath(d2l_map_data_default.exportRoot || "");      const candidates = [joinPath(exportRoot, sourcePath), sourcePath].filter(Boolean);      if (!cancelled) {        setSourcePreview({ status: "loading", kind: null });      }      for (const candidate of candidates) {        const url = buildReferenceUrl(candidate);        try {          const response = await fetch(url);          if (!response.ok) continue;          if (lesson.type === "pdf") {            if (!cancelled) setSourcePreview({ status: "ready", kind: "pdf", url });            return;          }          const text = await response.text();          if (lesson.type === "html-reading") {            const html = stripScriptsAndRewriteLinks(text, sourcePath, exportRoot);            if (!hasMeaningfulHtmlContent(html)) continue;            if (!cancelled) setSourcePreview({ status: "ready", kind: "html", html, sourcePath: candidate });            return;          }          if (lesson.type === "assignment") {            const parsed = parseAssignmentXml(text, sourcePath, exportRoot);            if (!cancelled) setSourcePreview({ status: "ready", kind: "assignment", ...parsed, sourcePath: candidate });            return;          }          if (lesson.type === "quiz") {            const parsed = parseQuizXml(text);            if (!cancelled) {              if (parsed) {                setSourcePreview({ status: "ready", kind: "quiz", ...parsed, sourcePath: candidate });              } else {                setSourcePreview({ status: "error", kind: null, error: "Could not parse quiz XML content." });              }            }            return;          }          if (!cancelled) {            setSourcePreview({ status: "ready", kind: "text", text, sourcePath: candidate });          }          return;        } catch {        }      }      if (!cancelled) {        setSourcePreview({          status: "error",          kind: null,          error: "Unable to load content preview."        });      }    }    loadSourcePreview();    return () => {      cancelled = true;    };  }, [lesson?.id, lesson?.sourceFile, lesson?.type]);  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: `${FORENSIC_THEME.panel} p-8`, "data-testid": "chapter-lesson-card", "data-lesson-type": lesson.type, children: [    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mb-4 flex flex-wrap items-center gap-2", children: lesson.type !== "html-reading" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: typeLabel(lesson.type) }) : null }),    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "text-2xl font-semibold tracking-tight text-[#f3f4f6]", children: formatLessonTitleForDisplay(lesson) }),    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-6", children: renderNodePreview(lesson, sourcePreview) })  ] });}function ForensicCoursePlayerPreviewRestored() {  const [activeChapterId, setActiveChapterId] = useState(resolvedModules[0]?.id ?? "");  const [activeModuleView, setActiveModuleView] = useState("content");  const [chapterVisited, setChapterVisited] = useState({});  const [query, setQuery] = useState("");  const [includeHidden, setIncludeHidden] = useState(false);  const [isChapterMenuCollapsed, setIsChapterMenuCollapsed] = useState(false);  const filteredModules = resolvedModules.filter((module) => includeHidden || !module.isHidden).map((module) => ({    ...module,    lessons: module.lessons  })).filter((module) => module.title.toLowerCase().includes(query.toLowerCase()) || query.length === 0);  const shouldFallbackToSeed = query.length === 0 && filteredModules.length === 0 && resolvedModules.length > 0;  const effectiveModules = shouldFallbackToSeed ? resolvedModules : filteredModules;  const fallbackCourse = useMemo(() => buildCourseFromD2LMap(courseSeed, d2l_map_data_default), []);  const fallbackModules = fallbackCourse?.modules?.length ? fallbackCourse.modules : courseSeed.modules;  const fallbackFilteredModules = useMemo(    () => fallbackModules.filter((module) => includeHidden || !module.isHidden).map((module) => ({      ...module,      lessons: module.lessons    })).filter((module) => module.title.toLowerCase().includes(query.toLowerCase()) || query.length === 0),    [fallbackModules, includeHidden, query]  );  const shouldUseFallbackCourse = query.length === 0 && effectiveModules.length === 0 && fallbackFilteredModules.length > 0;  const finalModules = shouldUseFallbackCourse ? fallbackFilteredModules : effectiveModules;  const emergencyModule = {    id: "e2e-seed",    title: "E2E Seed Module",    lessonCount: 1,    lessons: []  };  const safeModules = finalModules.length > 0 ? finalModules : fallbackFilteredModules.length > 0 ? fallbackFilteredModules : [emergencyModule];  const activeChapter = useMemo(    () => safeModules.find((module) => module.id === activeChapterId) || safeModules[0],    [activeChapterId, safeModules]  );  const chapterLessonGroups = useMemo(() => {    const moduleTwoExcludedTitles = /* @__PURE__ */ new Set([      "evidence and fingerprints online activity (optional)",      "types of evidence and fingerprint analysis assignment",      "fingerprint case studies assignment"    ]);    const moduleThreeExcludedTitles = /* @__PURE__ */ new Set([      "trace evidence assignment",      "trace evidence case studies assignment"    ]);    const moduleFourExcludedTitles = /* @__PURE__ */ new Set([      "body fluid assignment",      "body fluid evidence case studies assignment"    ]);    const moduleFiveExcludedTitles = /* @__PURE__ */ new Set([      "impaired driving assignment"    ]);    const moduleSixExcludedTitles = /* @__PURE__ */ new Set([      "polygraphing and forensic writing analysis assignment",      "polygraphing and forensic writing case studies assignment"    ]);    const moduleSevenExcludedTitles = /* @__PURE__ */ new Set([      "forensic dna evidence assignment"    ]);    const isUnitAssessmentSection = (title) => (title || "").trim().toLowerCase().includes("unit assessment");    const isModuleTwo = (activeChapter?.title || "").toLowerCase().includes("types of evidence and fingerprint analysis");    const isModuleThreeForFilter = (activeChapter?.title || "").toLowerCase().includes("trace evidence");    const isModuleFourForFilter = (activeChapter?.title || "").toLowerCase().includes("body fluid evidence");    const isModuleFiveForFilter = (activeChapter?.title || "").toLowerCase().includes("forensic detection of impaired driving");    const isModuleSixForFilter = (activeChapter?.title || "").toLowerCase().includes("polygraphing and document analysis");    const isModuleSevenForFilter = (activeChapter?.title || "").toLowerCase().includes("forensic genetics");    const normalizedLessons = (activeChapter?.lessons || []).filter((lesson) => !isUnitAssessmentSection(lesson.title)).filter((lesson) => {      const normalizedTitle = (lesson.title || "").trim().toLowerCase();      if (isModuleTwo) return !moduleTwoExcludedTitles.has(normalizedTitle);      if (isModuleThreeForFilter) return !moduleThreeExcludedTitles.has(normalizedTitle);      if (isModuleFourForFilter) return !moduleFourExcludedTitles.has(normalizedTitle);      if (isModuleFiveForFilter) return !moduleFiveExcludedTitles.has(normalizedTitle);      if (isModuleSixForFilter) return !moduleSixExcludedTitles.has(normalizedTitle);      if (isModuleSevenForFilter) return !moduleSevenExcludedTitles.has(normalizedTitle);      return true;    }).map((lesson) => ({      ...lesson,      moduleTitle: formatModuleTitleForDisplay(activeChapter.title),      moduleLessonCount: activeChapter.lessonCount,      moduleHidden: activeChapter.isHidden    }));    const chapterTitleLower = (activeChapter?.title || "").toLowerCase();    const isModuleOne = chapterTitleLower.includes("introduction to crime scenes");    const isModuleThree = chapterTitleLower.includes("trace evidence");    const isModuleFour = chapterTitleLower.includes("body fluid evidence");    const isModuleFive = chapterTitleLower.includes("forensic detection of impaired driving");    const isModuleSix = chapterTitleLower.includes("polygraphing and document analysis");    const isModuleSeven = chapterTitleLower.includes("forensic genetics");    const exportRoot = normalizePath(d2lCourseMapData.exportRoot || "");    const moduleThreeCaseStudiesImage = "https://upload.wikimedia.org/wikipedia/commons/2/2c/CSIRO_ScienceImage_8115_Human_hair_and_Merino_wool_fibre.jpg";    const moduleThreeTraceImage = buildReferenceUrl(      joinPath(exportRoot, "assignment/ia4effbb5-11e6-405e-a610-94c25bdcd18e/Content/hair evidence.jpg")    );    const moduleFourCaseStudiesImage = buildReferenceUrl(      joinPath(exportRoot, "assignment/i16176291-5154-45bd-8891-b2c9517b1a3c/Content/170829-F-DB515-0024.JPG")    );    const moduleSixPolygraphImage = buildReferenceUrl(      joinPath(exportRoot, "assignment/i5416ee1b-c173-4bcc-80e8-e3c1fae36848/Content/3034903278_5ef70f6f09_b.jpg")    );    const moduleTwoFingerprintLabIntro = [      '<div class="space-y-5">',      "<p>After a crime has occurred, criminal investigators use scientific techniques and/or forensic science experts to help identify and interpret physical evidence from the crime scene.</p>",      "<p>Physical evidence from a crime scene can include fingerprints, hair, blood, saliva, semen, skin, bone, bullets, bullet casings, paint fragments, and fibres.</p>",      "<h4 style=\"margin-top:10px;\">Individualized Physical Evidence</h4>",      "<p>Unique evidence that can be directly linked to a specific person and/or source. Examples: fingerprints, DNA, bullets, and dental impressions.</p>",      "<h4 style=\"margin-top:10px;\">Identified Physical Evidence</h4>",      "<p>Evidence that shares a common source and can be grouped into a class of items with similar properties. Examples: clothing, shoe prints, and blood type.</p>",      "<p>Fingerprint analysis has been used in many crime scenes as individualized evidence to tie a suspect to a crime scene. You will examine some of these historical cases in the following assignment.</p>",      "<p>Complete the following assignment about using fingerprint analysis to solve crimes. If you need a refresher on how to cite sources, please check out the <strong>How to Cite Sources</strong> tab in the Course Information section. Click on the image below to make a copy of the Fingerprint Analysis Case Studies Assignment. Remember to double click on the header to open it and add your name to the document.</p>",      "<p><strong>When you have completed the assignment, upload your generated reports to your respective online classroom.</strong></p>",      "</div>"    ].join("");    const moduleThreeTraceLabIntro = [      "<div>",      `<p style="text-align: center;"><img src="${moduleThreeCaseStudiesImage}" alt="Image result for hair microscope" width="501" height="401" class="img-responsive atto_image_button_text-bottom"></p>`,      "<p>Hair and fiber evidence has been used in many cases in the past to connect suspects with a crime. Occasionally, these cases are overturned with DNA evidence in the future. Despite this, trace evidence such as hair and fiber has many valuable uses in solving crimes. The following assignment will have you examine some of these cases.</p>",      `<p style="text-align: center;"><img src="${moduleThreeTraceImage}" alt="hair evidence" width="500" height="333" class="img-responsive atto_image_button_text-bottom"></p>`,      "<p>Microscopic evidence at a crime scene is called Trace Evidence. Hair and fiber are examples of this type of evidence and they can be valuable in an investigation. Although most hair and fiber are identified and not individualized, they can still be used in court to support cases.</p>",      "<p><strong>When you have completed the assignment, upload your generated reports to your respective online classroom.</strong></p>",      "</div>"    ].join("");    const moduleFourBodyFluidLabIntro = [      "<div>",      "<p>Body fluid evidence is one of the most common pieces of evidence that can be found at a crime scene, especially when a violent crime has occurred. This evidence can be extremely useful in helping investigators piece together the events of a crime. In this assignment you will demonstrate your understanding of body fluid evidence.</p>",      `<p style="text-align: center;"><img src="${moduleFourCaseStudiesImage}" alt="blood evidence" width="500" height="334" class="img-responsive atto_image_button_text-bottom"></p>`,      "<p>There are a number of historical case studies where blood stain and/or spatter evidence was used to successfully solve a crime and convict the perpetrator(s). Demonstrate your understanding of forensic serology by completing the following assignment.</p>",      "<p><strong>When you have completed the assignment, upload your generated reports to your respective online classroom.</strong></p>",      "</div>"    ].join("");    const moduleFiveImpairedDrivingLabIntro = [      "<div>",      "<p>Impaired driving is a crime that kills and injures too many Canadians each year. The tools and training that police officers use are important in the prevention of more accidents. In this unit you explored many of the useful tools that police use to detect impaired driving. Demonstrate your understanding of these tools in the assignment below.</p>",      "<p><strong>When you have completed the assignment, upload your generated reports to your respective online classroom.</strong></p>",      "</div>"    ].join("");    const moduleSixPolygraphLabIntro = [      "<div>",      `<p style="text-align: center;"><img src="${moduleSixPolygraphImage}" alt="polygraph" width="501" height="333" class="img-responsive atto_image_button_text-bottom"></p>`,      "<p>Polygraphing is a common tool used by investigators. Although it has been controversial, it has undeniable value to investigators when trying to solve crimes. Writing analysis is another common investigative tool that has been used to solve a number of crimes. In the assignment below, you will demonstrate your understanding of these forensic techniques.</p>",      "<p><strong>When you have completed the assignment, upload your generated reports to your respective online classroom.</strong></p>",      "</div>"    ].join("");    const moduleSevenGeneticsLabIntro = [      "<div>",      '<p style="text-align: center;"><img src="https://upload.wikimedia.org/wikipedia/commons/c/cb/Agarose_gel_slab_for_DNA_Analysis%2C_after_the_Electrophoresis_run.jpg" alt="Image result for DNA analysis" width="399" height="263" class="img-responsive atto_image_button_text-bottom"></p>',      "<p>Forensic DNA Analysis has been one of the most powerful and important tools that investigators use today. It can give strong evidence for a suspect's guilt or innocence and is an indispensable tool in the forensic world. The assignment below will allow you to demonstrate your understanding of DNA analysis in the context of forensic investigations.</p>",      "<p><strong>When you have completed the assignment, upload your generated reports to your respective online classroom.</strong></p>",      "</div>"    ].join("");    const syntheticLessons = [];    if (isModuleTwo) {      syntheticLessons.push({        id: "module2-fingerprint-analysis-description",        title: "Fingerprint Analysis Lab Assignment",        type: "assignment",        sourceFile: "",        resources: [],        assignmentMeta: { points: 35, submissionType: "file", submissionFormats: ["file"] },        assignmentXml: { intro: moduleTwoFingerprintLabIntro },        moduleTitle: formatModuleTitleForDisplay(activeChapter.title),        moduleLessonCount: activeChapter.lessonCount,        moduleHidden: activeChapter.isHidden      });      syntheticLessons.push({        id: "module2-fingerprint-analysis-lab",        title: "Fingerprint Analysis Interactive Assignment",        type: "lab-assignment",        embedPath: MODULE2_ASSIGNMENT_EMBED_PATH,        sourceFile: MODULE2_ASSIGNMENT_EMBED_PATH,        resources: [MODULE2_ASSIGNMENT_EMBED_PATH],        moduleTitle: formatModuleTitleForDisplay(activeChapter.title),        moduleLessonCount: activeChapter.lessonCount,        moduleHidden: activeChapter.isHidden      });    }    if (isModuleOne) {      syntheticLessons.push({        id: "module1-crime-scene-lab",        title: "Crime Scene Certification Lab",        type: "lab-assignment",        embedPath: MODULE1_ASSIGNMENT_EMBED_PATH,        sourceFile: MODULE1_ASSIGNMENT_EMBED_PATH,        resources: [MODULE1_ASSIGNMENT_EMBED_PATH],        moduleTitle: formatModuleTitleForDisplay(activeChapter.title),        moduleLessonCount: activeChapter.lessonCount,        moduleHidden: activeChapter.isHidden      });    }    if (isModuleThree) {      syntheticLessons.push({        id: "module3-trace-evidence-lab",        title: "Trace Evidence Lab Assignment",        type: "lab-assignment",        embedPath: MODULE3_ASSIGNMENT_EMBED_PATH,        sourceFile: MODULE3_ASSIGNMENT_EMBED_PATH,        resources: [MODULE3_ASSIGNMENT_EMBED_PATH],        assignmentXml: { intro: moduleThreeTraceLabIntro },        moduleTitle: formatModuleTitleForDisplay(activeChapter.title),        moduleLessonCount: activeChapter.lessonCount,        moduleHidden: activeChapter.isHidden      });    }    if (isModuleFour) {      syntheticLessons.push({        id: "module4-body-fluid-analysis-lab",        title: "Body Fluid Analysis Lab Assignment",        type: "lab-assignment",        embedPath: MODULE4_ASSIGNMENT_EMBED_PATH,        sourceFile: MODULE4_ASSIGNMENT_EMBED_PATH,        resources: [MODULE4_ASSIGNMENT_EMBED_PATH],        assignmentXml: { intro: moduleFourBodyFluidLabIntro },        moduleTitle: formatModuleTitleForDisplay(activeChapter.title),        moduleLessonCount: activeChapter.lessonCount,        moduleHidden: activeChapter.isHidden      });    }    if (isModuleFive) {      syntheticLessons.push({        id: "module5-impaired-driving-lab",        title: "Impaired Driving Assignment Lab",        type: "lab-assignment",        embedPath: MODULE5_ASSIGNMENT_EMBED_PATH,        sourceFile: MODULE5_ASSIGNMENT_EMBED_PATH,        resources: [MODULE5_ASSIGNMENT_EMBED_PATH],        assignmentXml: { intro: moduleFiveImpairedDrivingLabIntro },        moduleTitle: formatModuleTitleForDisplay(activeChapter.title),        moduleLessonCount: activeChapter.lessonCount,        moduleHidden: activeChapter.isHidden      });    }    if (isModuleSix) {      syntheticLessons.push({        id: "module6-polygraph-document-lab",        title: "Polygraph and Document Analysis Lab",        type: "lab-assignment",        embedPath: MODULE6_ASSIGNMENT_EMBED_PATH,        sourceFile: MODULE6_ASSIGNMENT_EMBED_PATH,        resources: [MODULE6_ASSIGNMENT_EMBED_PATH],        assignmentXml: { intro: moduleSixPolygraphLabIntro },        moduleTitle: formatModuleTitleForDisplay(activeChapter.title),        moduleLessonCount: activeChapter.lessonCount,        moduleHidden: activeChapter.isHidden      });    }    if (isModuleSeven) {      syntheticLessons.push({        id: "module7-forensic-genetics-lab",        title: "Forensic Genetics Lab Assignment",        type: "lab-assignment",        embedPath: MODULE7_ASSIGNMENT_EMBED_PATH,        sourceFile: MODULE7_ASSIGNMENT_EMBED_PATH,        resources: [MODULE7_ASSIGNMENT_EMBED_PATH],        assignmentXml: { intro: moduleSevenGeneticsLabIntro },        moduleTitle: formatModuleTitleForDisplay(activeChapter.title),        moduleLessonCount: activeChapter.lessonCount,        moduleHidden: activeChapter.isHidden      });    }    let lessonsWithSynthetic = [...syntheticLessons, ...normalizedLessons];    if (isModuleOne) {      const moduleOneLabId = "module1-crime-scene-lab";      const labIndex = lessonsWithSynthetic.findIndex((lesson) => lesson.id === moduleOneLabId);      if (labIndex !== -1) {        const [labLesson] = lessonsWithSynthetic.splice(labIndex, 1);        const introIndex = lessonsWithSynthetic.findIndex(          (lesson) => (lesson.title || "").trim().toLowerCase() === "introduction to crime scenes assignment"        );        const insertIndex = introIndex === -1 ? lessonsWithSynthetic.length : introIndex + 1;        lessonsWithSynthetic.splice(insertIndex, 0, labLesson);      }    }    return {      contentLessons: lessonsWithSynthetic.filter(        (lesson) => lesson.type !== "quiz" && lesson.type !== "assignment" && lesson.type !== "lab-assignment"      ),      assignmentLessons: lessonsWithSynthetic.filter(        (lesson) => lesson.type === "quiz" || lesson.type === "assignment" || lesson.type === "lab-assignment"      )    };  }, [activeChapter]);  const chapterLessons = chapterLessonGroups.contentLessons;  const chapterAssignments = chapterLessonGroups.assignmentLessons;  const progress = safeModules.length ? Math.round(Object.values(chapterVisited).filter(Boolean).length / safeModules.length * 100) : 0;  useEffect(() => {    if (!safeModules.length) {      return;    }    const isVisible = safeModules.some((module) => module.id === activeChapterId);    if (!isVisible) {      setActiveChapterId(safeModules[0].id);    }  }, [safeModules, activeChapterId]);  useEffect(() => {    if (activeModuleView !== "assignments") return;    if (chapterAssignments.length > 0) return;    setActiveModuleView("content");  }, [activeModuleView, chapterAssignments.length]);  useEffect(() => {    if (!activeChapter?.id) return;    setChapterVisited((prev) => ({ ...prev, [activeChapter.id]: true }));  }, [activeChapter?.id]);  if (!activeChapter) {    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "forensic-app min-h-screen bg-[#0a0b0d] p-10 text-[#a1a8b3]", children: "No chapters were mapped from the D2L course map yet." });  }  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "forensic-app min-h-screen bg-[radial-gradient(circle_at_18%_-10%,rgba(185,28,28,0.2),transparent_36%),radial-gradient(circle_at_84%_0%,rgba(148,163,184,0.12),transparent_34%),#0a0b0d] text-[#f3f4f6]", children: [    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: `        .forensic-app {          font-family: "Manrope", "Inter", "Segoe UI", sans-serif;        }        .forensic-app h1,        .forensic-app h2,        .forensic-app h3,        .forensic-app h4 {          font-family: "Space Grotesk", "Manrope", "Inter", sans-serif;          letter-spacing: -0.015em;        }        .forensic-app * {          transition-timing-function: cubic-bezier(0.2, 0, 0, 1);        }      ` }),    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex min-h-screen", children: [      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(        "aside",        {          className: `sticky top-0 h-screen shrink-0 overflow-hidden border-r border-white/[0.08] bg-[#101216]/90 backdrop-blur-xl transition-[width] duration-200 ${isChapterMenuCollapsed ? "w-16" : "w-[340px]"}`,          "data-testid": "chapter-menu-panel",          "data-collapsed": isChapterMenuCollapsed ? "true" : "false",          children: [            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `border-b border-white/[0.08] ${isChapterMenuCollapsed ? "px-2 py-4" : "px-5 py-5"}`, children: [              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `mb-3 flex ${isChapterMenuCollapsed ? "justify-center" : "items-start justify-between gap-3"}`, children: [                !isChapterMenuCollapsed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: FORENSIC_THEME.overline, children: "Case file" }),                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { className: "mt-1 text-xl font-semibold text-[#f3f4f6]", children: resolvedCourse.title })                ] }) : null,                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(                  "button",                  {                    onClick: () => setIsChapterMenuCollapsed((prev) => !prev),                    className: `flex h-10 w-10 items-center justify-center rounded-lg border transition duration-200 ${isChapterMenuCollapsed ? "border-[#dc2626]/70 bg-[#b91c1c] text-[#fef2f2] hover:bg-[#dc2626] hover:shadow-[0_0_0_1px_rgba(220,38,38,0.45)]" : "border-white/[0.14] bg-white/[0.04] text-[#d1d5db] hover:border-white/[0.28] hover:bg-white/[0.08] hover:text-[#f3f4f6]"}`,                    "data-testid": "chapter-menu-toggle",                    "aria-expanded": isChapterMenuCollapsed ? "false" : "true",                    "aria-label": isChapterMenuCollapsed ? "Open chapter menu" : "Collapse chapter menu",                    title: isChapterMenuCollapsed ? "Open chapter menu" : "Collapse chapter menu",                    children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "flex flex-col gap-1.5", children: [                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `block h-[2px] w-4 rounded-full ${isChapterMenuCollapsed ? "bg-[#fef2f2]" : "bg-[#d1d5db]"}` }),                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `block h-[2px] w-4 rounded-full ${isChapterMenuCollapsed ? "bg-[#fef2f2]" : "bg-[#d1d5db]"}` }),                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `block h-[2px] w-4 rounded-full ${isChapterMenuCollapsed ? "bg-[#fef2f2]" : "bg-[#d1d5db]"}` })                    ] })                  }                )              ] }),              isChapterMenuCollapsed ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `${FORENSIC_THEME.panelSoft} p-3`, children: [                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mb-2 flex items-center justify-between text-sm", children: [                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-medium text-[#a1a8b3]", children: "Progress" }),                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "font-semibold text-[#f3f4f6]", children: [                      progress,                      "%"                    ] })                  ] }),                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-2 overflow-hidden rounded-full bg-white/[0.08]", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-full rounded-full bg-[#b91c1c]", style: { width: `${progress}%` } }) }),                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mt-3 grid grid-cols-2 gap-2 text-xs text-[#6b7280]", children: [                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rounded-lg border border-white/[0.08] bg-white/[0.03] p-2", children: [                      resolvedCourse.stats.topLevelSections,                      " sections"                    ] }),                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rounded-lg border border-white/[0.08] bg-white/[0.03] p-2", children: [                      resolvedCourse.stats.totalNodes,                      " nodes"                    ] })                  ] })                ] }),                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "relative mt-4", children: [                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" }),                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(                    "input",                    {                      value: query,                      onChange: (e) => setQuery(e.target.value),                      placeholder: "Search chapter titles",                      className: "w-full rounded-lg border border-white/[0.12] bg-white/[0.03] py-2.5 pl-9 pr-3 text-sm text-[#e5e7eb] outline-none placeholder:text-[#6b7280] focus:border-[#b91c1c]/70",                      "data-testid": "lesson-search"                    }                  )                ] }),                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mt-3 flex items-center justify-between rounded-xl border border-white/[0.1] bg-white/[0.03] px-3 py-2.5", children: [                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: FORENSIC_THEME.overline, children: "Visibility" }),                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "text-xs text-[#a1a8b3]", "data-testid": "mode-indicator", children: includeHidden ? "Archive mode" : "Learner mode" })                  ] }),                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(                    "button",                    {                      onClick: () => setIncludeHidden((prev) => !prev),                      className: `rounded-lg border px-3 py-1.5 text-xs font-semibold transition duration-200 ${includeHidden ? "border-[#f59e0b]/40 bg-[#3b2b11] text-[#fcd34d]" : "border-[#b91c1c]/55 bg-[#1a1215] text-[#fecaca]"}`,                      "data-testid": "mode-toggle",                      children: includeHidden ? "Hide admin-only" : "Show archive"                    }                  )                ] })              ] })            ] }),            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(              "div",              {                className: `${isChapterMenuCollapsed ? "hidden" : "h-[calc(100vh-245px)] overflow-y-auto px-3 py-4"}`,                "data-testid": "module-list",                children: safeModules.map((module) => {                  const isActive = module.id === activeChapter.id;                  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(                    "div",                    {                      className: "mb-3 rounded-xl border border-white/[0.1] bg-[#141821] p-2 shadow-[0_14px_30px_rgba(0,0,0,0.35)]",                      "data-testid": "module-panel",                      "data-module-title": module.title,                      "data-module-hidden": module.isHidden ? "true" : "false",                      "data-module-expanded": isActive ? "true" : "false",                      children: [                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(                          "button",                          {                            onClick: () => {                              setActiveChapterId(module.id);                              setActiveModuleView("content");                            },                            className: "flex w-full items-center justify-between rounded-lg px-2 py-2 text-left transition duration-200 hover:bg-white/[0.04]",                            "data-testid": "module-toggle",                            "data-module-title": module.title,                            "data-expanded": isActive ? "true" : "false",                            children: [                              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [                                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "text-sm font-semibold text-[#f3f4f6]", children: formatModuleTitleForDisplay(module.title) }),                                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "text-xs text-[#6b7280]", children: [                                  module.lessonCount,                                  " items in export"                                ] })                              ] }),                              module.isHidden && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "hidden module" }),                              isActive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4 text-[#a1a8b3]" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-4 w-4 text-[#6b7280]" })                            ]                          }                        ),                        isActive && module.lessons?.some((lesson) => lesson.type === "quiz" || lesson.type === "assignment") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-1 rounded-lg border border-white/[0.08] bg-white/[0.03] p-1", "data-testid": "module-submenu", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(                          "button",                          {                            onClick: (event) => {                              event.stopPropagation();                              setActiveChapterId(module.id);                              setActiveModuleView("assignments");                            },                            className: `flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs font-semibold uppercase tracking-[0.12em] transition ${activeModuleView === "assignments" ? "bg-[#1f1014] text-[#fecaca] ring-1 ring-[#dc2626]/45" : "text-[#a1a8b3] hover:bg-white/[0.06] hover:text-[#f3f4f6]"}`,                            "data-testid": "module-assignments-tab",                            "data-module-title": module.title,                            children: [                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Assignments" }),                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[10px] text-[#6b7280]", children: module.lessons.filter((lesson) => lesson.type === "quiz" || lesson.type === "assignment").length })                            ]                          }                        ) }) : null                      ]                    },                    module.id                  );                })              }            )          ]        }      ),      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { className: "flex-1 overflow-y-auto", children: [        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "sticky top-0 z-10 border-b border-white/[0.08] bg-[#101216]/95 shadow-[0_10px_24px_rgba(0,0,0,0.45)] backdrop-blur-xl", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "px-8 py-5", children: [          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mb-2 flex flex-wrap items-center gap-2 text-sm text-[#a1a8b3]", children: [            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[#f3f4f6]", children: formatModuleTitleForDisplay(activeChapter.title) }),            includeHidden && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "archive mode" }),            activeChapter.isHidden && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "admin-only" })          ] }),          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { className: "text-3xl font-semibold tracking-tight text-[#f3f4f6]", "data-testid": "lesson-title", children: formatModuleTitleForDisplay(activeChapter.title) }),          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-3", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: activeModuleView === "assignments" ? "assignments view" : "content view" }) })        ] }) }),        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto max-w-7xl px-8 py-10", children: activeModuleView === "assignments" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "space-y-6", "data-testid": "module-assignments-view", children: [          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: `${FORENSIC_THEME.panel} p-8`, children: [            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mb-5 flex items-center justify-between", children: [              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "text-xl font-semibold text-[#f3f4f6]", children: "Assignments" }),              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { children: [                chapterAssignments.length,                " assessments"              ] })            ] }),            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "text-sm text-[#a1a8b3]", children: [              "Assessment items for ",              formatModuleTitleForDisplay(activeChapter.title),              " are grouped in this dedicated view."            ] })          ] }),          chapterAssignments.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: `${FORENSIC_THEME.panel} p-8`, children: [            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "text-xl font-semibold text-[#f3f4f6]", children: "No assignments in this module" }),            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "mt-3 text-sm text-[#a1a8b3]", children: "Return to the module content view or choose another module with assessment items." })          ] }) : chapterAssignments.map((lesson) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChapterLessonCard, { lesson }, lesson.id))        ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "space-y-6", "data-testid": "module-content-view", children: [          chapterLessons.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: `${FORENSIC_THEME.panel} p-8`, children: [            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "text-xl font-semibold text-[#f3f4f6]", children: "No learner content in this module" }),            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "mt-3 text-sm text-[#a1a8b3]", children: "This module currently contains only assessment items. Use the Assignments tab under the module name." })          ] }) : null,          chapterLessons.map((lesson) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChapterLessonCard, { lesson }, lesson.id))        ] }) })      ] })    ] })  ] });}var __canvasHelperRootElement = document.getElementById("root");if (__canvasHelperRootElement) {  __CanvasHelperReactDomClient.createRoot(__canvasHelperRootElement).render(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ForensicCoursePlayerPreviewRestored, {}));}export {  ForensicCoursePlayerPreviewRestored as default};/*! Bundled license information:react/cjs/react.development.js:  (**   * @license React   * react.development.js   *   * Copyright (c) Meta Platforms, Inc. and affiliates.   *   * This source code is licensed under the MIT license found in the   * LICENSE file in the root directory of this source tree.   *)react/cjs/react-jsx-runtime.development.js:  (**   * @license React   * react-jsx-runtime.development.js   *   * Copyright (c) Meta Platforms, Inc. and affiliates.   *   * This source code is licensed under the MIT license found in the   * LICENSE file in the root directory of this source tree.   *)*/