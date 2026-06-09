var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/react/cjs/react.development.js
var require_react_development = __commonJS({
  "node_modules/react/cjs/react.development.js"(exports, module) {
    "use strict";
    (function() {
      function defineDeprecationWarning(methodName, info) {
        Object.defineProperty(Component.prototype, methodName, {
          get: function() {
            console.warn(
              "%s(...) is deprecated in plain JavaScript React classes. %s",
              info[0],
              info[1]
            );
          }
        });
      }
      function getIteratorFn(maybeIterable) {
        if (null === maybeIterable || "object" !== typeof maybeIterable)
          return null;
        maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
        return "function" === typeof maybeIterable ? maybeIterable : null;
      }
      function warnNoop(publicInstance, callerName) {
        publicInstance = (publicInstance = publicInstance.constructor) && (publicInstance.displayName || publicInstance.name) || "ReactClass";
        var warningKey = publicInstance + "." + callerName;
        didWarnStateUpdateForUnmountedComponent[warningKey] || (console.error(
          "Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.",
          callerName,
          publicInstance
        ), didWarnStateUpdateForUnmountedComponent[warningKey] = true);
      }
      function Component(props, context, updater) {
        this.props = props;
        this.context = context;
        this.refs = emptyObject;
        this.updater = updater || ReactNoopUpdateQueue;
      }
      function ComponentDummy() {
      }
      function PureComponent(props, context, updater) {
        this.props = props;
        this.context = context;
        this.refs = emptyObject;
        this.updater = updater || ReactNoopUpdateQueue;
      }
      function noop() {
      }
      function testStringCoercion(value) {
        return "" + value;
      }
      function checkKeyStringCoercion(value) {
        try {
          testStringCoercion(value);
          var JSCompiler_inline_result = false;
        } catch (e) {
          JSCompiler_inline_result = true;
        }
        if (JSCompiler_inline_result) {
          JSCompiler_inline_result = console;
          var JSCompiler_temp_const = JSCompiler_inline_result.error;
          var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
          JSCompiler_temp_const.call(
            JSCompiler_inline_result,
            "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
            JSCompiler_inline_result$jscomp$0
          );
          return testStringCoercion(value);
        }
      }
      function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type)
          return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch (type) {
          case REACT_FRAGMENT_TYPE:
            return "Fragment";
          case REACT_PROFILER_TYPE:
            return "Profiler";
          case REACT_STRICT_MODE_TYPE:
            return "StrictMode";
          case REACT_SUSPENSE_TYPE:
            return "Suspense";
          case REACT_SUSPENSE_LIST_TYPE:
            return "SuspenseList";
          case REACT_ACTIVITY_TYPE:
            return "Activity";
        }
        if ("object" === typeof type)
          switch ("number" === typeof type.tag && console.error(
            "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
          ), type.$$typeof) {
            case REACT_PORTAL_TYPE:
              return "Portal";
            case REACT_CONTEXT_TYPE:
              return type.displayName || "Context";
            case REACT_CONSUMER_TYPE:
              return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
              var innerType = type.render;
              type = type.displayName;
              type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
              return type;
            case REACT_MEMO_TYPE:
              return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
              innerType = type._payload;
              type = type._init;
              try {
                return getComponentNameFromType(type(innerType));
              } catch (x) {
              }
          }
        return null;
      }
      function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE)
          return "<...>";
        try {
          var name = getComponentNameFromType(type);
          return name ? "<" + name + ">" : "<...>";
        } catch (x) {
          return "<...>";
        }
      }
      function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
      }
      function UnknownOwner() {
        return Error("react-stack-top-frame");
      }
      function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
          var getter = Object.getOwnPropertyDescriptor(config, "key").get;
          if (getter && getter.isReactWarning) return false;
        }
        return void 0 !== config.key;
      }
      function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
          specialPropKeyWarningShown || (specialPropKeyWarningShown = true, console.error(
            "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
            displayName
          ));
        }
        warnAboutAccessingKey.isReactWarning = true;
        Object.defineProperty(props, "key", {
          get: warnAboutAccessingKey,
          configurable: true
        });
      }
      function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = true, console.error(
          "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
        ));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
      }
      function ReactElement(type, key, props, owner, debugStack, debugTask) {
        var refProp = props.ref;
        type = {
          $$typeof: REACT_ELEMENT_TYPE,
          type,
          key,
          props,
          _owner: owner
        };
        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
          enumerable: false,
          get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", { enumerable: false, value: null });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: null
        });
        Object.defineProperty(type, "_debugStack", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
      }
      function cloneAndReplaceKey(oldElement, newKey) {
        newKey = ReactElement(
          oldElement.type,
          newKey,
          oldElement.props,
          oldElement._owner,
          oldElement._debugStack,
          oldElement._debugTask
        );
        oldElement._store && (newKey._store.validated = oldElement._store.validated);
        return newKey;
      }
      function validateChildKeys(node) {
        isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
      }
      function isValidElement(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
      }
      function escape(key) {
        var escaperLookup = { "=": "=0", ":": "=2" };
        return "$" + key.replace(/[=:]/g, function(match) {
          return escaperLookup[match];
        });
      }
      function getElementKey(element, index) {
        return "object" === typeof element && null !== element && null != element.key ? (checkKeyStringCoercion(element.key), escape("" + element.key)) : index.toString(36);
      }
      function resolveThenable(thenable) {
        switch (thenable.status) {
          case "fulfilled":
            return thenable.value;
          case "rejected":
            throw thenable.reason;
          default:
            switch ("string" === typeof thenable.status ? thenable.then(noop, noop) : (thenable.status = "pending", thenable.then(
              function(fulfilledValue) {
                "pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
              },
              function(error) {
                "pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
              }
            )), thenable.status) {
              case "fulfilled":
                return thenable.value;
              case "rejected":
                throw thenable.reason;
            }
        }
        throw thenable;
      }
      function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
        var type = typeof children;
        if ("undefined" === type || "boolean" === type) children = null;
        var invokeCallback = false;
        if (null === children) invokeCallback = true;
        else
          switch (type) {
            case "bigint":
            case "string":
            case "number":
              invokeCallback = true;
              break;
            case "object":
              switch (children.$$typeof) {
                case REACT_ELEMENT_TYPE:
                case REACT_PORTAL_TYPE:
                  invokeCallback = true;
                  break;
                case REACT_LAZY_TYPE:
                  return invokeCallback = children._init, mapIntoArray(
                    invokeCallback(children._payload),
                    array,
                    escapedPrefix,
                    nameSoFar,
                    callback
                  );
              }
          }
        if (invokeCallback) {
          invokeCallback = children;
          callback = callback(invokeCallback);
          var childKey = "" === nameSoFar ? "." + getElementKey(invokeCallback, 0) : nameSoFar;
          isArrayImpl(callback) ? (escapedPrefix = "", null != childKey && (escapedPrefix = childKey.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
            return c;
          })) : null != callback && (isValidElement(callback) && (null != callback.key && (invokeCallback && invokeCallback.key === callback.key || checkKeyStringCoercion(callback.key)), escapedPrefix = cloneAndReplaceKey(
            callback,
            escapedPrefix + (null == callback.key || invokeCallback && invokeCallback.key === callback.key ? "" : ("" + callback.key).replace(
              userProvidedKeyEscapeRegex,
              "$&/"
            ) + "/") + childKey
          ), "" !== nameSoFar && null != invokeCallback && isValidElement(invokeCallback) && null == invokeCallback.key && invokeCallback._store && !invokeCallback._store.validated && (escapedPrefix._store.validated = 2), callback = escapedPrefix), array.push(callback));
          return 1;
        }
        invokeCallback = 0;
        childKey = "" === nameSoFar ? "." : nameSoFar + ":";
        if (isArrayImpl(children))
          for (var i = 0; i < children.length; i++)
            nameSoFar = children[i], type = childKey + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(
              nameSoFar,
              array,
              escapedPrefix,
              type,
              callback
            );
        else if (i = getIteratorFn(children), "function" === typeof i)
          for (i === children.entries && (didWarnAboutMaps || console.warn(
            "Using Maps as children is not supported. Use an array of keyed ReactElements instead."
          ), didWarnAboutMaps = true), children = i.call(children), i = 0; !(nameSoFar = children.next()).done; )
            nameSoFar = nameSoFar.value, type = childKey + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(
              nameSoFar,
              array,
              escapedPrefix,
              type,
              callback
            );
        else if ("object" === type) {
          if ("function" === typeof children.then)
            return mapIntoArray(
              resolveThenable(children),
              array,
              escapedPrefix,
              nameSoFar,
              callback
            );
          array = String(children);
          throw Error(
            "Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead."
          );
        }
        return invokeCallback;
      }
      function mapChildren(children, func, context) {
        if (null == children) return children;
        var result = [], count = 0;
        mapIntoArray(children, result, "", "", function(child) {
          return func.call(context, child, count++);
        });
        return result;
      }
      function lazyInitializer(payload) {
        if (-1 === payload._status) {
          var ioInfo = payload._ioInfo;
          null != ioInfo && (ioInfo.start = ioInfo.end = performance.now());
          ioInfo = payload._result;
          var thenable = ioInfo();
          thenable.then(
            function(moduleObject) {
              if (0 === payload._status || -1 === payload._status) {
                payload._status = 1;
                payload._result = moduleObject;
                var _ioInfo = payload._ioInfo;
                null != _ioInfo && (_ioInfo.end = performance.now());
                void 0 === thenable.status && (thenable.status = "fulfilled", thenable.value = moduleObject);
              }
            },
            function(error) {
              if (0 === payload._status || -1 === payload._status) {
                payload._status = 2;
                payload._result = error;
                var _ioInfo2 = payload._ioInfo;
                null != _ioInfo2 && (_ioInfo2.end = performance.now());
                void 0 === thenable.status && (thenable.status = "rejected", thenable.reason = error);
              }
            }
          );
          ioInfo = payload._ioInfo;
          if (null != ioInfo) {
            ioInfo.value = thenable;
            var displayName = thenable.displayName;
            "string" === typeof displayName && (ioInfo.name = displayName);
          }
          -1 === payload._status && (payload._status = 0, payload._result = thenable);
        }
        if (1 === payload._status)
          return ioInfo = payload._result, void 0 === ioInfo && console.error(
            "lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))\n\nDid you accidentally put curly braces around the import?",
            ioInfo
          ), "default" in ioInfo || console.error(
            "lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))",
            ioInfo
          ), ioInfo.default;
        throw payload._result;
      }
      function resolveDispatcher() {
        var dispatcher = ReactSharedInternals.H;
        null === dispatcher && console.error(
          "Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem."
        );
        return dispatcher;
      }
      function releaseAsyncTransition() {
        ReactSharedInternals.asyncTransitions--;
      }
      function enqueueTask(task) {
        if (null === enqueueTaskImpl)
          try {
            var requireString = ("require" + Math.random()).slice(0, 7);
            enqueueTaskImpl = (module && module[requireString]).call(
              module,
              "timers"
            ).setImmediate;
          } catch (_err) {
            enqueueTaskImpl = function(callback) {
              false === didWarnAboutMessageChannel && (didWarnAboutMessageChannel = true, "undefined" === typeof MessageChannel && console.error(
                "This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning."
              ));
              var channel = new MessageChannel();
              channel.port1.onmessage = callback;
              channel.port2.postMessage(void 0);
            };
          }
        return enqueueTaskImpl(task);
      }
      function aggregateErrors(errors) {
        return 1 < errors.length && "function" === typeof AggregateError ? new AggregateError(errors) : errors[0];
      }
      function popActScope(prevActQueue, prevActScopeDepth) {
        prevActScopeDepth !== actScopeDepth - 1 && console.error(
          "You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. "
        );
        actScopeDepth = prevActScopeDepth;
      }
      function recursivelyFlushAsyncActWork(returnValue, resolve, reject) {
        var queue = ReactSharedInternals.actQueue;
        if (null !== queue)
          if (0 !== queue.length)
            try {
              flushActQueue(queue);
              enqueueTask(function() {
                return recursivelyFlushAsyncActWork(returnValue, resolve, reject);
              });
              return;
            } catch (error) {
              ReactSharedInternals.thrownErrors.push(error);
            }
          else ReactSharedInternals.actQueue = null;
        0 < ReactSharedInternals.thrownErrors.length ? (queue = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, reject(queue)) : resolve(returnValue);
      }
      function flushActQueue(queue) {
        if (!isFlushing) {
          isFlushing = true;
          var i = 0;
          try {
            for (; i < queue.length; i++) {
              var callback = queue[i];
              do {
                ReactSharedInternals.didUsePromise = false;
                var continuation = callback(false);
                if (null !== continuation) {
                  if (ReactSharedInternals.didUsePromise) {
                    queue[i] = callback;
                    queue.splice(0, i);
                    return;
                  }
                  callback = continuation;
                } else break;
              } while (1);
            }
            queue.length = 0;
          } catch (error) {
            queue.splice(0, i + 1), ReactSharedInternals.thrownErrors.push(error);
          } finally {
            isFlushing = false;
          }
        }
      }
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
      var REACT_ELEMENT_TYPE = /* @__PURE__ */ Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = /* @__PURE__ */ Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = /* @__PURE__ */ Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = /* @__PURE__ */ Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = /* @__PURE__ */ Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = /* @__PURE__ */ Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = /* @__PURE__ */ Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = /* @__PURE__ */ Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = /* @__PURE__ */ Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = /* @__PURE__ */ Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = /* @__PURE__ */ Symbol.for("react.memo"), REACT_LAZY_TYPE = /* @__PURE__ */ Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = /* @__PURE__ */ Symbol.for("react.activity"), MAYBE_ITERATOR_SYMBOL = Symbol.iterator, didWarnStateUpdateForUnmountedComponent = {}, ReactNoopUpdateQueue = {
        isMounted: function() {
          return false;
        },
        enqueueForceUpdate: function(publicInstance) {
          warnNoop(publicInstance, "forceUpdate");
        },
        enqueueReplaceState: function(publicInstance) {
          warnNoop(publicInstance, "replaceState");
        },
        enqueueSetState: function(publicInstance) {
          warnNoop(publicInstance, "setState");
        }
      }, assign = Object.assign, emptyObject = {};
      Object.freeze(emptyObject);
      Component.prototype.isReactComponent = {};
      Component.prototype.setState = function(partialState, callback) {
        if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState)
          throw Error(
            "takes an object of state variables to update or a function which returns an object of state variables."
          );
        this.updater.enqueueSetState(this, partialState, callback, "setState");
      };
      Component.prototype.forceUpdate = function(callback) {
        this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
      };
      var deprecatedAPIs = {
        isMounted: [
          "isMounted",
          "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."
        ],
        replaceState: [
          "replaceState",
          "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."
        ]
      };
      for (fnName in deprecatedAPIs)
        deprecatedAPIs.hasOwnProperty(fnName) && defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
      ComponentDummy.prototype = Component.prototype;
      deprecatedAPIs = PureComponent.prototype = new ComponentDummy();
      deprecatedAPIs.constructor = PureComponent;
      assign(deprecatedAPIs, Component.prototype);
      deprecatedAPIs.isPureReactComponent = true;
      var isArrayImpl = Array.isArray, REACT_CLIENT_REFERENCE = /* @__PURE__ */ Symbol.for("react.client.reference"), ReactSharedInternals = {
        H: null,
        A: null,
        T: null,
        S: null,
        actQueue: null,
        asyncTransitions: 0,
        isBatchingLegacy: false,
        didScheduleLegacyUpdate: false,
        didUsePromise: false,
        thrownErrors: [],
        getCurrentStack: null,
        recentlyCreatedOwnerStacks: 0
      }, hasOwnProperty = Object.prototype.hasOwnProperty, createTask = console.createTask ? console.createTask : function() {
        return null;
      };
      deprecatedAPIs = {
        react_stack_bottom_frame: function(callStackForError) {
          return callStackForError();
        }
      };
      var specialPropKeyWarningShown, didWarnAboutOldJSXRuntime;
      var didWarnAboutElementRef = {};
      var unknownOwnerDebugStack = deprecatedAPIs.react_stack_bottom_frame.bind(
        deprecatedAPIs,
        UnknownOwner
      )();
      var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
      var didWarnAboutMaps = false, userProvidedKeyEscapeRegex = /\/+/g, reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
        if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
          var event = new window.ErrorEvent("error", {
            bubbles: true,
            cancelable: true,
            message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
            error
          });
          if (!window.dispatchEvent(event)) return;
        } else if ("object" === typeof process && "function" === typeof process.emit) {
          process.emit("uncaughtException", error);
          return;
        }
        console.error(error);
      }, didWarnAboutMessageChannel = false, enqueueTaskImpl = null, actScopeDepth = 0, didWarnNoAwaitAct = false, isFlushing = false, queueSeveralMicrotasks = "function" === typeof queueMicrotask ? function(callback) {
        queueMicrotask(function() {
          return queueMicrotask(callback);
        });
      } : enqueueTask;
      deprecatedAPIs = Object.freeze({
        __proto__: null,
        c: function(size) {
          return resolveDispatcher().useMemoCache(size);
        }
      });
      var fnName = {
        map: mapChildren,
        forEach: function(children, forEachFunc, forEachContext) {
          mapChildren(
            children,
            function() {
              forEachFunc.apply(this, arguments);
            },
            forEachContext
          );
        },
        count: function(children) {
          var n = 0;
          mapChildren(children, function() {
            n++;
          });
          return n;
        },
        toArray: function(children) {
          return mapChildren(children, function(child) {
            return child;
          }) || [];
        },
        only: function(children) {
          if (!isValidElement(children))
            throw Error(
              "React.Children.only expected to receive a single React element child."
            );
          return children;
        }
      };
      exports.Activity = REACT_ACTIVITY_TYPE;
      exports.Children = fnName;
      exports.Component = Component;
      exports.Fragment = REACT_FRAGMENT_TYPE;
      exports.Profiler = REACT_PROFILER_TYPE;
      exports.PureComponent = PureComponent;
      exports.StrictMode = REACT_STRICT_MODE_TYPE;
      exports.Suspense = REACT_SUSPENSE_TYPE;
      exports.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
      exports.__COMPILER_RUNTIME = deprecatedAPIs;
      exports.act = function(callback) {
        var prevActQueue = ReactSharedInternals.actQueue, prevActScopeDepth = actScopeDepth;
        actScopeDepth++;
        var queue = ReactSharedInternals.actQueue = null !== prevActQueue ? prevActQueue : [], didAwaitActCall = false;
        try {
          var result = callback();
        } catch (error) {
          ReactSharedInternals.thrownErrors.push(error);
        }
        if (0 < ReactSharedInternals.thrownErrors.length)
          throw popActScope(prevActQueue, prevActScopeDepth), callback = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, callback;
        if (null !== result && "object" === typeof result && "function" === typeof result.then) {
          var thenable = result;
          queueSeveralMicrotasks(function() {
            didAwaitActCall || didWarnNoAwaitAct || (didWarnNoAwaitAct = true, console.error(
              "You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"
            ));
          });
          return {
            then: function(resolve, reject) {
              didAwaitActCall = true;
              thenable.then(
                function(returnValue) {
                  popActScope(prevActQueue, prevActScopeDepth);
                  if (0 === prevActScopeDepth) {
                    try {
                      flushActQueue(queue), enqueueTask(function() {
                        return recursivelyFlushAsyncActWork(
                          returnValue,
                          resolve,
                          reject
                        );
                      });
                    } catch (error$0) {
                      ReactSharedInternals.thrownErrors.push(error$0);
                    }
                    if (0 < ReactSharedInternals.thrownErrors.length) {
                      var _thrownError = aggregateErrors(
                        ReactSharedInternals.thrownErrors
                      );
                      ReactSharedInternals.thrownErrors.length = 0;
                      reject(_thrownError);
                    }
                  } else resolve(returnValue);
                },
                function(error) {
                  popActScope(prevActQueue, prevActScopeDepth);
                  0 < ReactSharedInternals.thrownErrors.length ? (error = aggregateErrors(
                    ReactSharedInternals.thrownErrors
                  ), ReactSharedInternals.thrownErrors.length = 0, reject(error)) : reject(error);
                }
              );
            }
          };
        }
        var returnValue$jscomp$0 = result;
        popActScope(prevActQueue, prevActScopeDepth);
        0 === prevActScopeDepth && (flushActQueue(queue), 0 !== queue.length && queueSeveralMicrotasks(function() {
          didAwaitActCall || didWarnNoAwaitAct || (didWarnNoAwaitAct = true, console.error(
            "A component suspended inside an `act` scope, but the `act` call was not awaited. When testing React components that depend on asynchronous data, you must await the result:\n\nawait act(() => ...)"
          ));
        }), ReactSharedInternals.actQueue = null);
        if (0 < ReactSharedInternals.thrownErrors.length)
          throw callback = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, callback;
        return {
          then: function(resolve, reject) {
            didAwaitActCall = true;
            0 === prevActScopeDepth ? (ReactSharedInternals.actQueue = queue, enqueueTask(function() {
              return recursivelyFlushAsyncActWork(
                returnValue$jscomp$0,
                resolve,
                reject
              );
            })) : resolve(returnValue$jscomp$0);
          }
        };
      };
      exports.cache = function(fn) {
        return function() {
          return fn.apply(null, arguments);
        };
      };
      exports.cacheSignal = function() {
        return null;
      };
      exports.captureOwnerStack = function() {
        var getCurrentStack = ReactSharedInternals.getCurrentStack;
        return null === getCurrentStack ? null : getCurrentStack();
      };
      exports.cloneElement = function(element, config, children) {
        if (null === element || void 0 === element)
          throw Error(
            "The argument must be a React element, but you passed " + element + "."
          );
        var props = assign({}, element.props), key = element.key, owner = element._owner;
        if (null != config) {
          var JSCompiler_inline_result;
          a: {
            if (hasOwnProperty.call(config, "ref") && (JSCompiler_inline_result = Object.getOwnPropertyDescriptor(
              config,
              "ref"
            ).get) && JSCompiler_inline_result.isReactWarning) {
              JSCompiler_inline_result = false;
              break a;
            }
            JSCompiler_inline_result = void 0 !== config.ref;
          }
          JSCompiler_inline_result && (owner = getOwner());
          hasValidKey(config) && (checkKeyStringCoercion(config.key), key = "" + config.key);
          for (propName in config)
            !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
        }
        var propName = arguments.length - 2;
        if (1 === propName) props.children = children;
        else if (1 < propName) {
          JSCompiler_inline_result = Array(propName);
          for (var i = 0; i < propName; i++)
            JSCompiler_inline_result[i] = arguments[i + 2];
          props.children = JSCompiler_inline_result;
        }
        props = ReactElement(
          element.type,
          key,
          props,
          owner,
          element._debugStack,
          element._debugTask
        );
        for (key = 2; key < arguments.length; key++)
          validateChildKeys(arguments[key]);
        return props;
      };
      exports.createContext = function(defaultValue) {
        defaultValue = {
          $$typeof: REACT_CONTEXT_TYPE,
          _currentValue: defaultValue,
          _currentValue2: defaultValue,
          _threadCount: 0,
          Provider: null,
          Consumer: null
        };
        defaultValue.Provider = defaultValue;
        defaultValue.Consumer = {
          $$typeof: REACT_CONSUMER_TYPE,
          _context: defaultValue
        };
        defaultValue._currentRenderer = null;
        defaultValue._currentRenderer2 = null;
        return defaultValue;
      };
      exports.createElement = function(type, config, children) {
        for (var i = 2; i < arguments.length; i++)
          validateChildKeys(arguments[i]);
        i = {};
        var key = null;
        if (null != config)
          for (propName in didWarnAboutOldJSXRuntime || !("__self" in config) || "key" in config || (didWarnAboutOldJSXRuntime = true, console.warn(
            "Your app (or one of its dependencies) is using an outdated JSX transform. Update to the modern JSX transform for faster performance: https://react.dev/link/new-jsx-transform"
          )), hasValidKey(config) && (checkKeyStringCoercion(config.key), key = "" + config.key), config)
            hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (i[propName] = config[propName]);
        var childrenLength = arguments.length - 2;
        if (1 === childrenLength) i.children = children;
        else if (1 < childrenLength) {
          for (var childArray = Array(childrenLength), _i = 0; _i < childrenLength; _i++)
            childArray[_i] = arguments[_i + 2];
          Object.freeze && Object.freeze(childArray);
          i.children = childArray;
        }
        if (type && type.defaultProps)
          for (propName in childrenLength = type.defaultProps, childrenLength)
            void 0 === i[propName] && (i[propName] = childrenLength[propName]);
        key && defineKeyPropWarningGetter(
          i,
          "function" === typeof type ? type.displayName || type.name || "Unknown" : type
        );
        var propName = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        return ReactElement(
          type,
          key,
          i,
          getOwner(),
          propName ? Error("react-stack-top-frame") : unknownOwnerDebugStack,
          propName ? createTask(getTaskName(type)) : unknownOwnerDebugTask
        );
      };
      exports.createRef = function() {
        var refObject = { current: null };
        Object.seal(refObject);
        return refObject;
      };
      exports.forwardRef = function(render) {
        null != render && render.$$typeof === REACT_MEMO_TYPE ? console.error(
          "forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...))."
        ) : "function" !== typeof render ? console.error(
          "forwardRef requires a render function but was given %s.",
          null === render ? "null" : typeof render
        ) : 0 !== render.length && 2 !== render.length && console.error(
          "forwardRef render functions accept exactly two parameters: props and ref. %s",
          1 === render.length ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined."
        );
        null != render && null != render.defaultProps && console.error(
          "forwardRef render functions do not support defaultProps. Did you accidentally pass a React component?"
        );
        var elementType = { $$typeof: REACT_FORWARD_REF_TYPE, render }, ownName;
        Object.defineProperty(elementType, "displayName", {
          enumerable: false,
          configurable: true,
          get: function() {
            return ownName;
          },
          set: function(name) {
            ownName = name;
            render.name || render.displayName || (Object.defineProperty(render, "name", { value: name }), render.displayName = name);
          }
        });
        return elementType;
      };
      exports.isValidElement = isValidElement;
      exports.lazy = function(ctor) {
        ctor = { _status: -1, _result: ctor };
        var lazyType = {
          $$typeof: REACT_LAZY_TYPE,
          _payload: ctor,
          _init: lazyInitializer
        }, ioInfo = {
          name: "lazy",
          start: -1,
          end: -1,
          value: null,
          owner: null,
          debugStack: Error("react-stack-top-frame"),
          debugTask: console.createTask ? console.createTask("lazy()") : null
        };
        ctor._ioInfo = ioInfo;
        lazyType._debugInfo = [{ awaited: ioInfo }];
        return lazyType;
      };
      exports.memo = function(type, compare) {
        null == type && console.error(
          "memo: The first argument must be a component. Instead received: %s",
          null === type ? "null" : typeof type
        );
        compare = {
          $$typeof: REACT_MEMO_TYPE,
          type,
          compare: void 0 === compare ? null : compare
        };
        var ownName;
        Object.defineProperty(compare, "displayName", {
          enumerable: false,
          configurable: true,
          get: function() {
            return ownName;
          },
          set: function(name) {
            ownName = name;
            type.name || type.displayName || (Object.defineProperty(type, "name", { value: name }), type.displayName = name);
          }
        });
        return compare;
      };
      exports.startTransition = function(scope) {
        var prevTransition = ReactSharedInternals.T, currentTransition = {};
        currentTransition._updatedFibers = /* @__PURE__ */ new Set();
        ReactSharedInternals.T = currentTransition;
        try {
          var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
          null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
          "object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && (ReactSharedInternals.asyncTransitions++, returnValue.then(releaseAsyncTransition, releaseAsyncTransition), returnValue.then(noop, reportGlobalError));
        } catch (error) {
          reportGlobalError(error);
        } finally {
          null === prevTransition && currentTransition._updatedFibers && (scope = currentTransition._updatedFibers.size, currentTransition._updatedFibers.clear(), 10 < scope && console.warn(
            "Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table."
          )), null !== prevTransition && null !== currentTransition.types && (null !== prevTransition.types && prevTransition.types !== currentTransition.types && console.error(
            "We expected inner Transitions to have transferred the outer types set and that you cannot add to the outer Transition while inside the inner.This is a bug in React."
          ), prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
        }
      };
      exports.unstable_useCacheRefresh = function() {
        return resolveDispatcher().useCacheRefresh();
      };
      exports.use = function(usable) {
        return resolveDispatcher().use(usable);
      };
      exports.useActionState = function(action, initialState, permalink) {
        return resolveDispatcher().useActionState(
          action,
          initialState,
          permalink
        );
      };
      exports.useCallback = function(callback, deps) {
        return resolveDispatcher().useCallback(callback, deps);
      };
      exports.useContext = function(Context) {
        var dispatcher = resolveDispatcher();
        Context.$$typeof === REACT_CONSUMER_TYPE && console.error(
          "Calling useContext(Context.Consumer) is not supported and will cause bugs. Did you mean to call useContext(Context) instead?"
        );
        return dispatcher.useContext(Context);
      };
      exports.useDebugValue = function(value, formatterFn) {
        return resolveDispatcher().useDebugValue(value, formatterFn);
      };
      exports.useDeferredValue = function(value, initialValue) {
        return resolveDispatcher().useDeferredValue(value, initialValue);
      };
      exports.useEffect = function(create, deps) {
        null == create && console.warn(
          "React Hook useEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        );
        return resolveDispatcher().useEffect(create, deps);
      };
      exports.useEffectEvent = function(callback) {
        return resolveDispatcher().useEffectEvent(callback);
      };
      exports.useId = function() {
        return resolveDispatcher().useId();
      };
      exports.useImperativeHandle = function(ref, create, deps) {
        return resolveDispatcher().useImperativeHandle(ref, create, deps);
      };
      exports.useInsertionEffect = function(create, deps) {
        null == create && console.warn(
          "React Hook useInsertionEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        );
        return resolveDispatcher().useInsertionEffect(create, deps);
      };
      exports.useLayoutEffect = function(create, deps) {
        null == create && console.warn(
          "React Hook useLayoutEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        );
        return resolveDispatcher().useLayoutEffect(create, deps);
      };
      exports.useMemo = function(create, deps) {
        return resolveDispatcher().useMemo(create, deps);
      };
      exports.useOptimistic = function(passthrough, reducer) {
        return resolveDispatcher().useOptimistic(passthrough, reducer);
      };
      exports.useReducer = function(reducer, initialArg, init) {
        return resolveDispatcher().useReducer(reducer, initialArg, init);
      };
      exports.useRef = function(initialValue) {
        return resolveDispatcher().useRef(initialValue);
      };
      exports.useState = function(initialState) {
        return resolveDispatcher().useState(initialState);
      };
      exports.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
        return resolveDispatcher().useSyncExternalStore(
          subscribe,
          getSnapshot,
          getServerSnapshot
        );
      };
      exports.useTransition = function() {
        return resolveDispatcher().useTransition();
      };
      exports.version = "19.2.4";
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
    })();
  }
});

// node_modules/react/index.js
var require_react = __commonJS({
  "node_modules/react/index.js"(exports, module) {
    "use strict";
    if (false) {
      module.exports = null;
    } else {
      module.exports = require_react_development();
    }
  }
});

// node_modules/react/cjs/react-jsx-runtime.development.js
var require_react_jsx_runtime_development = __commonJS({
  "node_modules/react/cjs/react-jsx-runtime.development.js"(exports) {
    "use strict";
    (function() {
      function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type)
          return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch (type) {
          case REACT_FRAGMENT_TYPE:
            return "Fragment";
          case REACT_PROFILER_TYPE:
            return "Profiler";
          case REACT_STRICT_MODE_TYPE:
            return "StrictMode";
          case REACT_SUSPENSE_TYPE:
            return "Suspense";
          case REACT_SUSPENSE_LIST_TYPE:
            return "SuspenseList";
          case REACT_ACTIVITY_TYPE:
            return "Activity";
        }
        if ("object" === typeof type)
          switch ("number" === typeof type.tag && console.error(
            "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
          ), type.$$typeof) {
            case REACT_PORTAL_TYPE:
              return "Portal";
            case REACT_CONTEXT_TYPE:
              return type.displayName || "Context";
            case REACT_CONSUMER_TYPE:
              return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
              var innerType = type.render;
              type = type.displayName;
              type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
              return type;
            case REACT_MEMO_TYPE:
              return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
              innerType = type._payload;
              type = type._init;
              try {
                return getComponentNameFromType(type(innerType));
              } catch (x) {
              }
          }
        return null;
      }
      function testStringCoercion(value) {
        return "" + value;
      }
      function checkKeyStringCoercion(value) {
        try {
          testStringCoercion(value);
          var JSCompiler_inline_result = false;
        } catch (e) {
          JSCompiler_inline_result = true;
        }
        if (JSCompiler_inline_result) {
          JSCompiler_inline_result = console;
          var JSCompiler_temp_const = JSCompiler_inline_result.error;
          var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
          JSCompiler_temp_const.call(
            JSCompiler_inline_result,
            "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
            JSCompiler_inline_result$jscomp$0
          );
          return testStringCoercion(value);
        }
      }
      function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE)
          return "<...>";
        try {
          var name = getComponentNameFromType(type);
          return name ? "<" + name + ">" : "<...>";
        } catch (x) {
          return "<...>";
        }
      }
      function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
      }
      function UnknownOwner() {
        return Error("react-stack-top-frame");
      }
      function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
          var getter = Object.getOwnPropertyDescriptor(config, "key").get;
          if (getter && getter.isReactWarning) return false;
        }
        return void 0 !== config.key;
      }
      function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
          specialPropKeyWarningShown || (specialPropKeyWarningShown = true, console.error(
            "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
            displayName
          ));
        }
        warnAboutAccessingKey.isReactWarning = true;
        Object.defineProperty(props, "key", {
          get: warnAboutAccessingKey,
          configurable: true
        });
      }
      function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = true, console.error(
          "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
        ));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
      }
      function ReactElement(type, key, props, owner, debugStack, debugTask) {
        var refProp = props.ref;
        type = {
          $$typeof: REACT_ELEMENT_TYPE,
          type,
          key,
          props,
          _owner: owner
        };
        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
          enumerable: false,
          get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", { enumerable: false, value: null });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: null
        });
        Object.defineProperty(type, "_debugStack", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
      }
      function jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStack, debugTask) {
        var children = config.children;
        if (void 0 !== children)
          if (isStaticChildren)
            if (isArrayImpl(children)) {
              for (isStaticChildren = 0; isStaticChildren < children.length; isStaticChildren++)
                validateChildKeys(children[isStaticChildren]);
              Object.freeze && Object.freeze(children);
            } else
              console.error(
                "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
              );
          else validateChildKeys(children);
        if (hasOwnProperty.call(config, "key")) {
          children = getComponentNameFromType(type);
          var keys = Object.keys(config).filter(function(k) {
            return "key" !== k;
          });
          isStaticChildren = 0 < keys.length ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
          didWarnAboutKeySpread[children + isStaticChildren] || (keys = 0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}", console.error(
            'A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />',
            isStaticChildren,
            children,
            keys,
            children
          ), didWarnAboutKeySpread[children + isStaticChildren] = true);
        }
        children = null;
        void 0 !== maybeKey && (checkKeyStringCoercion(maybeKey), children = "" + maybeKey);
        hasValidKey(config) && (checkKeyStringCoercion(config.key), children = "" + config.key);
        if ("key" in config) {
          maybeKey = {};
          for (var propName in config)
            "key" !== propName && (maybeKey[propName] = config[propName]);
        } else maybeKey = config;
        children && defineKeyPropWarningGetter(
          maybeKey,
          "function" === typeof type ? type.displayName || type.name || "Unknown" : type
        );
        return ReactElement(
          type,
          children,
          maybeKey,
          getOwner(),
          debugStack,
          debugTask
        );
      }
      function validateChildKeys(node) {
        isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
      }
      function isValidElement(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
      }
      var React2 = require_react(), REACT_ELEMENT_TYPE = /* @__PURE__ */ Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = /* @__PURE__ */ Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = /* @__PURE__ */ Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = /* @__PURE__ */ Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = /* @__PURE__ */ Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = /* @__PURE__ */ Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = /* @__PURE__ */ Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = /* @__PURE__ */ Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = /* @__PURE__ */ Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = /* @__PURE__ */ Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = /* @__PURE__ */ Symbol.for("react.memo"), REACT_LAZY_TYPE = /* @__PURE__ */ Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = /* @__PURE__ */ Symbol.for("react.activity"), REACT_CLIENT_REFERENCE = /* @__PURE__ */ Symbol.for("react.client.reference"), ReactSharedInternals = React2.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, hasOwnProperty = Object.prototype.hasOwnProperty, isArrayImpl = Array.isArray, createTask = console.createTask ? console.createTask : function() {
        return null;
      };
      React2 = {
        react_stack_bottom_frame: function(callStackForError) {
          return callStackForError();
        }
      };
      var specialPropKeyWarningShown;
      var didWarnAboutElementRef = {};
      var unknownOwnerDebugStack = React2.react_stack_bottom_frame.bind(
        React2,
        UnknownOwner
      )();
      var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
      var didWarnAboutKeySpread = {};
      exports.Fragment = REACT_FRAGMENT_TYPE;
      exports.jsx = function(type, config, maybeKey) {
        var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        return jsxDEVImpl(
          type,
          config,
          maybeKey,
          false,
          trackActualOwner ? Error("react-stack-top-frame") : unknownOwnerDebugStack,
          trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask
        );
      };
      exports.jsxs = function(type, config, maybeKey) {
        var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        return jsxDEVImpl(
          type,
          config,
          maybeKey,
          true,
          trackActualOwner ? Error("react-stack-top-frame") : unknownOwnerDebugStack,
          trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask
        );
      };
    })();
  }
});

// node_modules/react/jsx-runtime.js
var require_jsx_runtime = __commonJS({
  "node_modules/react/jsx-runtime.js"(exports, module) {
    "use strict";
    if (false) {
      module.exports = null;
    } else {
      module.exports = require_react_jsx_runtime_development();
    }
  }
});

// projects/forensicstudiesoption2-nextstep-test/workspace/assignments/module5assignment.jsx
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
import React, { useState, useEffect, useRef } from "https://esm.sh/react@19.1.1";
import { Brain, Car, Scale, AlertTriangle, Activity, Info, Beer, Wine, Martini, User, Clock, Calculator, FileText, ClipboardList } from "https://esm.sh/lucide-react@0.542.0?deps=react@19.1.1";
var MODULE5_ASSIGNMENT_STORAGE_KEY = "forensics::module5assignment::v1";
function readModule5AssignmentState() {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(MODULE5_ASSIGNMENT_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (_error) {
    return null;
  }
}
function writeModule5AssignmentState(state) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(MODULE5_ASSIGNMENT_STORAGE_KEY, JSON.stringify(state));
  } catch (_error) {
  }
}
var BAC_STAGES = [
  {
    id: 0,
    name: "Sober / Normal",
    range: [0, 29],
    symptoms: ["Normal behavior", "No visible signs of impairment"],
    brainParts: "None significantly affected",
    drivingImpact: "Normal driving ability. Reaction times and judgment are at baseline.",
    color: "bg-emerald-100 border-emerald-500 text-emerald-800",
    glowColor: "",
    highlight: []
  },
  {
    id: 1,
    name: "Euphoria",
    range: [30, 120],
    symptoms: ["Increased sociability and talkativeness", "Lowered inhibitions", "Mild impairment of judgment and control", "Overconfidence"],
    brainParts: "Frontal Lobe",
    drivingImpact: "Overconfidence can lead to risky driving behaviors (e.g., speeding). There is a declining ability to divide attention between steering, scanning, and tracking speed.",
    color: "bg-yellow-100 border-yellow-400 text-yellow-800",
    glowColor: "rgba(234, 179, 8, 0.6)",
    // yellow
    highlight: ["frontal"]
  },
  {
    id: 2,
    name: "Excitement",
    range: [90, 250],
    symptoms: ["Emotional instability", "Loss of critical judgment", "Slower reaction time", "Sensory impairment (vision/hearing)"],
    brainParts: "Frontal Lobe, Parietal Lobe, Occipital Lobe",
    drivingImpact: "Reduced coordination makes it difficult to steer smoothly. Impaired tracking makes it hard to focus on moving objects. Slower reaction time means taking longer to hit the brakes.",
    color: "bg-orange-100 border-orange-500 text-orange-800",
    glowColor: "rgba(249, 115, 22, 0.6)",
    // orange
    highlight: ["frontal", "parietal", "occipital"]
  },
  {
    id: 3,
    name: "Confusion",
    range: [180, 300],
    symptoms: ["Disorientation and mental confusion", "Dizziness", "Exaggerated emotions", "Disturbed vision and perception of color/motion"],
    brainParts: "Cerebellum, Frontal Lobe, Occipital Lobe",
    drivingImpact: "Major loss of balance and coordination. Highly impaired vehicle control\u2014the driver cannot maintain lane position. Visual disturbances cause misjudgment of distances.",
    color: "bg-red-100 border-red-500 text-red-800",
    glowColor: "rgba(239, 68, 68, 0.6)",
    // red
    highlight: ["cerebellum", "frontal", "parietal", "occipital"]
  },
  {
    id: 4,
    name: "Stupor",
    range: [250, 400],
    symptoms: ["Apathy and general inertia", "Approaching loss of motor functions", "Inability to stand or walk", "Vomiting and incontinence"],
    brainParts: "Diencephalon, Motor Cortex, Cerebellum",
    drivingImpact: "Completely unable to drive. Cannot operate vehicle controls safely or process the driving environment.",
    color: "bg-rose-200 border-rose-600 text-rose-900",
    glowColor: "rgba(225, 29, 72, 0.7)",
    // rose
    highlight: ["diencephalon", "cerebellum", "frontal", "parietal", "occipital"]
  },
  {
    id: 5,
    name: "Coma",
    range: [350, 500],
    symptoms: ["Complete unconsciousness", "Depressed reflexes", "Subnormal body temperature", "Impairment of circulation and respiration", "Possible death"],
    brainParts: "Medulla Oblongata (Brain Stem) & Entire Brain",
    drivingImpact: "Unconscious. Fatalities highly likely due to alcohol poisoning or asphyxiation.",
    color: "bg-purple-200 border-purple-700 text-purple-900",
    glowColor: "rgba(126, 34, 206, 0.8)",
    // purple
    highlight: ["stem", "diencephalon", "cerebellum", "frontal", "parietal", "occipital"]
  }
];
function ImpairedDrivingApp() {
  const [persistedState] = useState(() => readModule5AssignmentState());
  const assignmentRootRef = useRef(null);
  const [bac, setBac] = useState(Number(persistedState?.bac) || 0);
  const [activeStage, setActiveStage] = useState(BAC_STAGES[0]);
  const [activeTab, setActiveTab] = useState(persistedState?.activeTab || "brain");
  const [weight, setWeight] = useState(Number(persistedState?.weight) || 160);
  const [sex, setSex] = useState(persistedState?.sex || "M");
  const [hours, setHours] = useState(Number(persistedState?.hours) || 1);
  const [drinks, setDrinks] = useState(
    persistedState?.drinks && typeof persistedState.drinks === "object" ? {
      beer: Number(persistedState.drinks.beer) || 0,
      wine: Number(persistedState.drinks.wine) || 0,
      liquor: Number(persistedState.drinks.liquor) || 0
    } : { beer: 0, wine: 0, liquor: 0 }
  );
  const [assignmentResponses, setAssignmentResponses] = useState(
    persistedState?.assignmentResponses && typeof persistedState.assignmentResponses === "object" ? persistedState.assignmentResponses : {}
  );
  const getAssignmentFieldKey = (field, index) => {
    const existing = field.getAttribute("data-persist-key");
    if (existing) {
      return existing;
    }
    const derivedBase = field.name || field.placeholder || field.type || "field";
    const derived = `${derivedBase}::${index + 1}`;
    field.setAttribute("data-persist-key", derived);
    return derived;
  };
  useEffect(() => {
    const assignmentRoot = assignmentRootRef.current;
    if (!assignmentRoot) {
      return void 0;
    }
    const fields = Array.from(assignmentRoot.querySelectorAll("textarea, select, input[type='text']"));
    fields.forEach((field, index) => {
      const key = getAssignmentFieldKey(field, index);
      if (Object.prototype.hasOwnProperty.call(assignmentResponses, key)) {
        field.value = assignmentResponses[key] ?? "";
      }
    });
    const handleFieldChange = (event) => {
      const field = event.target;
      if (!field || !field.matches?.("textarea, select, input[type='text']")) {
        return;
      }
      const key = getAssignmentFieldKey(field, fields.indexOf(field));
      setAssignmentResponses((prev) => ({ ...prev, [key]: field.value ?? "" }));
    };
    assignmentRoot.addEventListener("input", handleFieldChange);
    assignmentRoot.addEventListener("change", handleFieldChange);
    return () => {
      assignmentRoot.removeEventListener("input", handleFieldChange);
      assignmentRoot.removeEventListener("change", handleFieldChange);
    };
  }, [assignmentResponses]);
  useEffect(() => {
    writeModule5AssignmentState({
      bac,
      activeTab,
      weight,
      sex,
      hours,
      drinks,
      assignmentResponses
    });
  }, [bac, activeTab, weight, sex, hours, drinks, assignmentResponses]);
  useEffect(() => {
    if (activeTab === "calc") {
      const totalDrinks = drinks.beer + drinks.wine + drinks.liquor;
      if (totalDrinks === 0) {
        setBac(0);
        return;
      }
      const alcoholGrams = totalDrinks * 14;
      const weightGrams = weight * 453.592;
      const r = sex === "M" ? 0.68 : 0.55;
      let rawBacPct = alcoholGrams / (weightGrams * r) * 100;
      let finalBacPct = rawBacPct - 0.015 * hours;
      if (finalBacPct < 0) finalBacPct = 0;
      const finalBacMg = Math.min(500, Math.round(finalBacPct * 1e3));
      setBac(finalBacMg);
    }
  }, [drinks, weight, sex, hours, activeTab]);
  useEffect(() => {
    let currentStage = BAC_STAGES[0];
    for (let i = BAC_STAGES.length - 1; i >= 0; i--) {
      if (bac >= BAC_STAGES[i].range[0]) {
        currentStage = BAC_STAGES[i];
        break;
      }
    }
    setActiveStage(currentStage);
  }, [bac]);
  const isHighlighted = (part) => activeStage.highlight.includes(part);
  const bacPercentage = (bac / 1e3).toFixed(3);
  const isOverLimit = bac >= 80;
  const escapeHtml = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const findPromptForField = (field, indexInView) => {
    const row = field.closest("tr");
    if (row) {
      const leadCell = row.querySelector("td, th");
      const leadText = leadCell ? leadCell.innerText.trim() : "";
      if (leadText) return leadText;
    }
    const section = field.closest("section");
    if (section) {
      const sectionPrompt = section.querySelector("h3");
      if (sectionPrompt && sectionPrompt.innerText.trim()) {
        return sectionPrompt.innerText.trim();
      }
    }
    const wrapper = field.closest("div");
    if (wrapper) {
      const label = wrapper.querySelector(":scope > label");
      if (label && label.innerText.trim()) return label.innerText.trim();
    }
    if (field.placeholder && field.placeholder.trim()) return field.placeholder.trim();
    return `Response ${indexInView + 1}`;
  };
  const exportAssignmentReport = () => {
    const assignmentRoot = document.querySelector('[data-assignment-root="module5"]');
    if (!assignmentRoot) return;
    const fields = Array.from(assignmentRoot.querySelectorAll("textarea, select, input[type='text']"));
    const items = [];
    fields.forEach((field, idx) => {
      const rawValue = field.value ?? "";
      const value = rawValue.trim();
      if (!value || value === "-" || value === "Select...") return;
      items.push({
        prompt: findPromptForField(field, idx),
        value
      });
    });
    const generatedAt = (/* @__PURE__ */ new Date()).toLocaleString();
    const responses = items.length ? items.map(
      (item, idx) => `
              <div class="entry">
                <div class="entry-index">${idx + 1}.</div>
                <div class="entry-body">
                  <div class="entry-prompt">${escapeHtml(item.prompt)}</div>
                  <div class="entry-value">${escapeHtml(item.value).replace(/\n/g, "<br>")}</div>
                </div>
              </div>
            `
    ).join("") : `<p>No responses captured yet. Complete at least one field and try again.</p>`;
    const reportHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Impaired Driving Assignment Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 30px; color: #0f172a; background: #fff; line-height: 1.45; }
          .report-header { border-bottom: 2px solid #1e293b; padding-bottom: 12px; margin-bottom: 20px; }
          .report-header h1 { margin: 0 0 6px 0; font-size: 22px; letter-spacing: 0.03em; text-transform: uppercase; }
          .report-meta { margin: 0; font-size: 12px; color: #334155; }
          .entry { display: flex; gap: 8px; margin-bottom: 10px; page-break-inside: avoid; }
          .entry-index { width: 24px; font-weight: 700; }
          .entry-body { flex: 1; }
          .entry-prompt { font-weight: 700; margin-bottom: 3px; }
          .entry-value { white-space: normal; }
          @media print { body { margin: 18px; } }
        </style>
      </head>
      <body>
        <header class="report-header">
          <h1>Impaired Driving Assignment Report</h1>
          <p class="report-meta">Generated: ${escapeHtml(generatedAt)}</p>
        </header>
        ${responses}
      </body>
      </html>
    `;
    let printFrame = document.getElementById("module5-assignment-print-frame");
    if (!printFrame) {
      printFrame = document.createElement("iframe");
      printFrame.id = "module5-assignment-print-frame";
      printFrame.setAttribute("aria-hidden", "true");
      printFrame.style.position = "fixed";
      printFrame.style.right = "0";
      printFrame.style.bottom = "0";
      printFrame.style.width = "0";
      printFrame.style.height = "0";
      printFrame.style.border = "0";
      document.body.appendChild(printFrame);
    }
    printFrame.onload = function() {
      setTimeout(() => {
        if (printFrame.contentWindow) {
          printFrame.contentWindow.focus();
          printFrame.contentWindow.print();
        }
      }, 120);
    };
    printFrame.srcdoc = reportHtml;
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "max-w-6xl mx-auto space-y-6", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", { className: "bg-white rounded-2xl shadow-sm p-6 border border-slate-200", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", { className: "text-3xl font-bold text-slate-900 flex items-center gap-3", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "text-blue-600 w-8 h-8" }),
          "BAC Impairment Simulator"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-slate-500 mt-2 text-lg", children: "Explore the physiological and behavioral changes caused by alcohol consumption." })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `flex items-center gap-3 px-5 py-4 rounded-xl border-2 transition-colors duration-500 ${isOverLimit ? "bg-red-50 border-red-500 text-red-700" : "bg-green-50 border-green-500 text-green-700"}`, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scale, { className: `w-8 h-8 ${isOverLimit ? "text-red-600" : "text-green-600"}` }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-xs font-bold uppercase tracking-wider opacity-80", children: "Canadian Law (Criminal Code)" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "font-bold text-lg", children: isOverLimit ? "Guilty of Impaired Driving" : "Below Criminal Limit" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-sm", children: "Legal Limit: 80 mg/100mL (0.08%)" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex bg-slate-200 p-1 rounded-xl mb-6 w-fit mx-auto md:mx-0 overflow-x-auto", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "button",
        {
          onClick: () => setActiveTab("brain"),
          className: `flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all whitespace-nowrap ${activeTab === "brain" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brain, { className: "w-5 h-5" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "hidden sm:inline", children: "Brain Map & Slider" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "sm:hidden", children: "Brain Map" })
          ]
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "button",
        {
          onClick: () => setActiveTab("calc"),
          className: `flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all whitespace-nowrap ${activeTab === "calc" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calculator, { className: "w-5 h-5" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "hidden sm:inline", children: "Drink Calculator" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "sm:hidden", children: "Calculator" })
          ]
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "button",
        {
          onClick: () => setActiveTab("assignment"),
          className: `flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all whitespace-nowrap ${activeTab === "assignment" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "w-5 h-5" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "hidden sm:inline", children: "Assignment Worksheet" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "sm:hidden", children: "Assignment" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `grid grid-cols-1 lg:grid-cols-12 gap-6 ${activeTab === "assignment" ? "hidden" : ""}`, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "lg:col-span-5 space-y-6", children: activeTab === "brain" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "animate-in fade-in zoom-in-95 duration-300 space-y-6", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-white rounded-2xl shadow-sm p-6 border border-slate-200", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { className: "text-xl font-bold mb-6 flex items-center gap-2", children: "Blood Alcohol Concentration (BAC)" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "space-y-6", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex justify-between items-end", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "text-5xl font-black tracking-tighter text-blue-600", children: [
                bac,
                " ",
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-xl font-medium text-slate-500", children: "mg/100mL" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "text-xl font-bold text-slate-400", children: [
                bacPercentage,
                "% BAC"
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "input",
              {
                type: "range",
                min: "0",
                max: "500",
                value: bac,
                onChange: (e) => setBac(Number(e.target.value)),
                className: "w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex justify-between text-xs font-semibold text-slate-400", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "0 (Sober)" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "250 (Danger)" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "500 (Fatal)" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-white rounded-2xl shadow-sm p-6 border border-slate-200 flex flex-col items-center", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { className: "w-full text-lg font-bold mb-4 flex items-center gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brain, { className: "w-5 h-5 text-slate-500" }),
            "Affected Brain Regions (Anatomical View)"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "relative w-full max-w-md aspect-square bg-slate-50 rounded-xl p-2 overflow-hidden shadow-inner border border-slate-200 flex items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { viewBox: "0 0 500 450", className: "w-full h-full drop-shadow-lg filter transition-all duration-500", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("defs", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pattern", { id: "cerebellum-stripes", width: "12", height: "8", patternUnits: "userSpaceOnUse", patternTransform: "rotate(-10)", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M 0,4 Q 6,0 12,4", fill: "none", stroke: "#64748b", strokeWidth: "1.5", opacity: "0.4" }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("radialGradient", { id: "diencephalon-glow", cx: "50%", cy: "50%", r: "50%", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", { offset: "0%", stopColor: activeStage.glowColor, stopOpacity: "1" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", { offset: "100%", stopColor: activeStage.glowColor, stopOpacity: "0" })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { className: "transition-all duration-700 ease-out", style: { transform: isHighlighted("stem") ? "scale(1.03)" : "scale(1)", transformOrigin: "260px 320px" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "path",
                {
                  d: "M 240,260 C 235,300 230,350 240,400 L 280,390 C 285,350 285,300 280,270 C 260,265 250,265 240,260 Z",
                  fill: isHighlighted("stem") ? activeStage.glowColor : "#e2e8f0",
                  stroke: isHighlighted("stem") ? "#334155" : "#94a3b8",
                  strokeWidth: "2"
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M 250,270 C 250,320 245,360 250,395", stroke: "#cbd5e1", strokeWidth: "2", fill: "none" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M 270,270 C 270,320 275,360 270,390", stroke: "#cbd5e1", strokeWidth: "2", fill: "none" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { className: "transition-all duration-700 ease-out", style: { transform: isHighlighted("cerebellum") ? "scale(1.03)" : "scale(1)", transformOrigin: "340px 300px" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "path",
                {
                  d: "M 280,270 C 300,320 350,360 400,340 C 440,320 440,260 380,240 C 360,250 320,260 280,270 Z",
                  fill: isHighlighted("cerebellum") ? activeStage.glowColor : "#d3dce6",
                  stroke: isHighlighted("cerebellum") ? "#334155" : "#94a3b8",
                  strokeWidth: "2"
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "path",
                {
                  d: "M 280,270 C 300,320 350,360 400,340 C 440,320 440,260 380,240 C 360,250 320,260 280,270 Z",
                  fill: "url(#cerebellum-stripes)"
                }
              )
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "path",
              {
                className: "transition-all duration-700 ease-out",
                d: "M 140,180 C 130,220 160,250 190,260 C 230,275 280,285 330,265 C 360,255 380,230 380,210 C 340,210 300,200 250,170 C 210,150 170,160 140,180 Z",
                fill: isHighlighted("temporal") || isHighlighted("diencephalon") ? activeStage.glowColor : "#f1f5f9",
                stroke: isHighlighted("temporal") || isHighlighted("diencephalon") ? "#334155" : "#94a3b8",
                strokeWidth: "2",
                style: { transform: isHighlighted("temporal") || isHighlighted("diencephalon") ? "scale(1.02)" : "scale(1)", transformOrigin: "260px 220px" }
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "path",
              {
                className: "transition-all duration-700 ease-out",
                d: "M 380,210 C 420,220 460,200 470,160 C 480,120 450,80 410,70 C 410,110 390,160 380,210 Z",
                fill: isHighlighted("occipital") ? activeStage.glowColor : "#f8fafc",
                stroke: isHighlighted("occipital") ? "#334155" : "#94a3b8",
                strokeWidth: "2",
                style: { transform: isHighlighted("occipital") ? "scale(1.02)" : "scale(1)", transformOrigin: "420px 150px" }
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "path",
              {
                className: "transition-all duration-700 ease-out",
                d: "M 260,20 C 330,20 380,40 410,70 C 380,110 370,160 380,210 C 340,210 300,160 250,170 C 240,110 250,60 260,20 Z",
                fill: isHighlighted("parietal") ? activeStage.glowColor : "#f8fafc",
                stroke: isHighlighted("parietal") ? "#334155" : "#94a3b8",
                strokeWidth: "2",
                style: { transform: isHighlighted("parietal") ? "scale(1.02)" : "scale(1)", transformOrigin: "330px 110px" }
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "path",
              {
                className: "transition-all duration-700 ease-out",
                d: "M 260,20 C 150,20 50,60 40,140 C 35,170 80,190 140,180 C 170,160 210,150 250,170 C 240,110 250,60 260,20 Z",
                fill: isHighlighted("frontal") ? activeStage.glowColor : "#ffffff",
                stroke: isHighlighted("frontal") ? "#334155" : "#94a3b8",
                strokeWidth: "2",
                style: { transform: isHighlighted("frontal") ? "scale(1.02)" : "scale(1)", transformOrigin: "150px 100px" }
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "ellipse",
              {
                cx: "250",
                cy: "180",
                rx: "45",
                ry: "30",
                fill: "url(#diencephalon-glow)",
                opacity: isHighlighted("diencephalon") ? 1 : 0,
                className: "transition-opacity duration-700 pointer-events-none"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { opacity: "0.35", fill: "none", stroke: "#334155", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", className: "pointer-events-none", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M 75,120 Q 100,105 110,140 T 130,160" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M 115,75 Q 150,60 145,110 T 175,145" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M 175,45 Q 180,80 200,110 T 235,145" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M 220,35 Q 210,80 245,120" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M 60,145 Q 80,165 100,160" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M 285,35 Q 280,80 275,150" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M 335,45 Q 310,100 315,160" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M 375,65 Q 350,110 345,175" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M 290,100 Q 320,110 340,90" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M 430,95 Q 400,130 405,175" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M 455,135 Q 430,160 425,200" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M 410,140 Q 430,160 450,160" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M 160,205 Q 200,185 240,205 T 320,225" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M 180,235 Q 220,215 260,235 T 340,245" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M 220,195 Q 240,220 260,210" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { className: `transition-opacity duration-500 pointer-events-none ${isHighlighted("frontal") ? "opacity-100" : "opacity-40"}`, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", { x: "140", y: "110", textAnchor: "middle", fontSize: "16", fontWeight: "800", fill: "none", stroke: "white", strokeWidth: "4", strokeLinejoin: "round", children: "Frontal Lobe" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", { x: "140", y: "110", textAnchor: "middle", fontSize: "16", fontWeight: "800", fill: "#0f172a", children: "Frontal Lobe" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { className: `transition-opacity duration-500 pointer-events-none ${isHighlighted("parietal") ? "opacity-100" : "opacity-40"}`, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", { x: "325", y: "110", textAnchor: "middle", fontSize: "16", fontWeight: "800", fill: "none", stroke: "white", strokeWidth: "4", strokeLinejoin: "round", children: "Parietal Lobe" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", { x: "325", y: "110", textAnchor: "middle", fontSize: "16", fontWeight: "800", fill: "#0f172a", children: "Parietal Lobe" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { className: `transition-opacity duration-500 pointer-events-none ${isHighlighted("occipital") ? "opacity-100" : "opacity-40"}`, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", { x: "430", y: "150", textAnchor: "middle", fontSize: "14", fontWeight: "800", fill: "none", stroke: "white", strokeWidth: "4", strokeLinejoin: "round", children: "Occipital" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", { x: "430", y: "150", textAnchor: "middle", fontSize: "14", fontWeight: "800", fill: "#0f172a", children: "Occipital" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { className: `transition-opacity duration-500 pointer-events-none ${isHighlighted("temporal") || isHighlighted("diencephalon") ? "opacity-100" : "opacity-40"}`, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", { x: "240", y: "235", textAnchor: "middle", fontSize: "15", fontWeight: "800", fill: "none", stroke: "white", strokeWidth: "4", strokeLinejoin: "round", children: "Temporal Lobe" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", { x: "240", y: "235", textAnchor: "middle", fontSize: "15", fontWeight: "800", fill: "#0f172a", children: "Temporal Lobe" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { className: `transition-opacity duration-500 pointer-events-none ${isHighlighted("cerebellum") ? "opacity-100" : "opacity-40"}`, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", { x: "345", y: "315", textAnchor: "middle", fontSize: "16", fontWeight: "800", fill: "none", stroke: "white", strokeWidth: "4", strokeLinejoin: "round", children: "Cerebellum" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", { x: "345", y: "315", textAnchor: "middle", fontSize: "16", fontWeight: "800", fill: "#0f172a", children: "Cerebellum" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { className: `transition-opacity duration-500 pointer-events-none ${isHighlighted("stem") ? "opacity-100" : "opacity-40"}`, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", { x: "210", y: "340", textAnchor: "middle", fontSize: "14", fontWeight: "800", fill: "none", stroke: "white", strokeWidth: "4", strokeLinejoin: "round", children: "Brain Stem" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", { x: "210", y: "340", textAnchor: "middle", fontSize: "14", fontWeight: "800", fill: "#0f172a", children: "Brain Stem" })
            ] })
          ] }) })
        ] })
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "space-y-6 animate-in fade-in zoom-in-95 duration-300", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-white rounded-2xl shadow-sm p-6 border border-slate-200", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { className: "text-xl font-bold mb-4 flex items-center gap-2 text-slate-800", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "w-5 h-5 text-slate-500" }),
            " Person Profile"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "space-y-5", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex gap-4", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => setSex("M"), className: `flex-1 py-3 rounded-xl font-bold border-2 transition-all ${sex === "M" ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`, children: "Male" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => setSex("F"), className: `flex-1 py-3 rounded-xl font-bold border-2 transition-all ${sex === "F" ? "border-pink-500 bg-pink-50 text-pink-700 shadow-sm" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`, children: "Female" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "text-sm font-bold text-slate-600 flex justify-between mb-2", children: [
                "Body Weight: ",
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "text-blue-600", children: [
                  weight,
                  " lbs"
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "range", min: "100", max: "300", step: "5", value: weight, onChange: (e) => setWeight(Number(e.target.value)), className: "w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-white rounded-2xl shadow-sm p-6 border border-slate-200", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { className: "text-xl font-bold mb-4 flex items-center gap-2 text-slate-800", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Martini, { className: "w-5 h-5 text-slate-500" }),
            " Drinks Consumed"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid grid-cols-3 gap-3", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex flex-col items-center p-3 bg-amber-50 border border-amber-200 rounded-xl", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Beer, { className: "w-8 h-8 text-amber-600 mb-2" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-bold text-xl text-amber-900", children: drinks.beer }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-3", children: "Beer (12oz)" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex gap-2 mt-auto w-full", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => setDrinks((d) => ({ ...d, beer: Math.max(0, d.beer - 1) })), className: "flex-1 py-1 bg-white rounded shadow-sm border border-amber-100 text-amber-600 font-black hover:bg-amber-100 transition-colors", children: "-" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => setDrinks((d) => ({ ...d, beer: d.beer + 1 })), className: "flex-1 py-1 bg-white rounded shadow-sm border border-amber-100 text-amber-600 font-black hover:bg-amber-100 transition-colors", children: "+" })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex flex-col items-center p-3 bg-rose-50 border border-rose-200 rounded-xl", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wine, { className: "w-8 h-8 text-rose-600 mb-2" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-bold text-xl text-rose-900", children: drinks.wine }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[10px] font-bold uppercase tracking-wider text-rose-700 mb-3", children: "Wine (5oz)" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex gap-2 mt-auto w-full", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => setDrinks((d) => ({ ...d, wine: Math.max(0, d.wine - 1) })), className: "flex-1 py-1 bg-white rounded shadow-sm border border-rose-100 text-rose-600 font-black hover:bg-rose-100 transition-colors", children: "-" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => setDrinks((d) => ({ ...d, wine: d.wine + 1 })), className: "flex-1 py-1 bg-white rounded shadow-sm border border-rose-100 text-rose-600 font-black hover:bg-rose-100 transition-colors", children: "+" })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex flex-col items-center p-3 bg-indigo-50 border border-indigo-200 rounded-xl", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Martini, { className: "w-8 h-8 text-indigo-600 mb-2" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-bold text-xl text-indigo-900", children: drinks.liquor }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[10px] font-bold uppercase tracking-wider text-indigo-700 mb-3", children: "Shot (1.5oz)" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex gap-2 mt-auto w-full", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => setDrinks((d) => ({ ...d, liquor: Math.max(0, d.liquor - 1) })), className: "flex-1 py-1 bg-white rounded shadow-sm border border-indigo-100 text-indigo-600 font-black hover:bg-indigo-100 transition-colors", children: "-" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => setDrinks((d) => ({ ...d, liquor: d.liquor + 1 })), className: "flex-1 py-1 bg-white rounded shadow-sm border border-indigo-100 text-indigo-600 font-black hover:bg-indigo-100 transition-colors", children: "+" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mt-6 border-t border-slate-100 pt-6", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { className: "text-md font-bold mb-4 flex items-center gap-2 text-slate-800", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "w-5 h-5 text-slate-500" }),
              " Time Elapsed"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "text-sm font-bold text-slate-600 flex justify-between mb-2", children: [
              "Hours since first drink: ",
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "text-blue-600", children: [
                hours,
                " hrs"
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "range", min: "0", max: "8", step: "0.5", value: hours, onChange: (e) => setHours(Number(e.target.value)), className: "w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl shadow-md p-6 flex flex-col items-center justify-center text-center", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "font-bold text-blue-100 uppercase tracking-wider text-xs mb-1", children: "Estimated BAC Result" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "text-6xl font-black tracking-tighter drop-shadow-md", children: [
            bac,
            " ",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-2xl font-medium text-blue-200", children: "mg/100mL" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "mt-3 text-blue-100 text-sm max-w-xs leading-tight", children: "Calculated using the standard Widmark Formula based on weight, sex, and time elapsed." })
        ] })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "lg:col-span-7 flex flex-col gap-6", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `rounded-2xl shadow-sm p-6 border-2 transition-all duration-500 ${activeStage.color}`, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex justify-between items-center mb-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { className: "text-3xl font-black uppercase tracking-tight", children: [
              activeStage.name,
              " Stage"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "text-lg font-bold bg-white/50 px-3 py-1 rounded-full", children: [
              activeStage.range[0],
              " - ",
              activeStage.range[1],
              " mg/100mL"
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "opacity-90 font-medium flex items-center gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTriangle, { className: "w-5 h-5" }),
            activeStage.range[0] > 0 ? "Impairment is active and worsening." : "No alcohol detected."
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-white rounded-2xl shadow-sm p-6 border border-slate-200 flex flex-col h-full", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { className: "text-lg font-bold mb-4 flex items-center gap-2 text-slate-800", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "w-5 h-5 text-rose-500" }),
              "Physiological & Behavioral Symptoms"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "space-y-3 flex-grow", children: activeStage.symptoms.map((symptom, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { className: "flex items-start gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "leading-snug", children: symptom })
            ] }, idx)) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-6 p-4 bg-slate-100 rounded-xl border border-slate-200", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "text-sm font-bold text-slate-700 flex flex-col", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-xs uppercase tracking-wider text-slate-500 mb-1", children: "Parts of Brain Affected" }),
              activeStage.brainParts
            ] }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-white rounded-2xl shadow-sm p-6 border border-slate-200 flex flex-col h-full", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { className: "text-lg font-bold mb-4 flex items-center gap-2 text-slate-800", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Car, { className: "w-5 h-5 text-blue-500" }),
              "Impact on Driving Ability"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bg-blue-50 text-blue-900 p-5 rounded-xl border border-blue-100 flex-grow text-lg leading-relaxed shadow-inner", children: activeStage.drivingImpact }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mt-6 flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-800", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "w-6 h-6 flex-shrink-0 text-amber-600" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "text-sm", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Assignment Helper:" }),
                " Need to identify two symptoms and explain how they impair driving? Look at the lists above."
              ] })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "div",
      {
        ref: assignmentRootRef,
        className: `space-y-8 animate-in fade-in zoom-in-95 duration-300 ${activeTab === "assignment" ? "block" : "hidden"}`,
        "data-assignment-root": "module5",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-slate-800 text-white p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { className: "text-3xl font-black flex items-center gap-3", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { className: "text-blue-400 w-8 h-8" }),
                "Impaired Driving Assignment"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-slate-300 mt-2 text-lg", children: "Use the simulator to research and complete this worksheet." })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "button",
                {
                  type: "button",
                  onClick: exportAssignmentReport,
                  className: "rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/20",
                  children: "Print / Save PDF"
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bg-blue-600/30 border border-blue-400/50 text-blue-100 px-5 py-2 rounded-xl text-lg font-bold shadow-inner", children: "27 Marks Total" })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "p-6 md:p-8 space-y-12", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "space-y-4", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex justify-between items-end border-b-2 border-slate-100 pb-2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "text-xl font-bold text-slate-800", children: "1. Complete the chart summarizing physiological and behavioral changes." }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-sm font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full whitespace-nowrap", children: "(10 marks)" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "overflow-x-auto rounded-xl border border-slate-200 shadow-sm", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { className: "w-full text-left border-collapse", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { className: "bg-slate-100 text-slate-700", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "p-4 border-b border-slate-200 font-bold w-1/4", children: "BAC (mg/100mL)" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "p-4 border-b border-slate-200 font-bold w-2/5", children: "Symptoms" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "p-4 border-b border-slate-200 font-bold w-1/3", children: "Part(s) of Brain Affected" })
                ] }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { className: "bg-white divide-y divide-slate-100", children: [
                  { level: "Euphoria", range: "30-120" },
                  { level: "Excitement", range: "90-250" },
                  { level: "Confusion", range: "180-300" },
                  { level: "Stupor", range: "250-400" },
                  { level: "Coma", range: "350-500" }
                ].map((row, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { className: "hover:bg-slate-50 transition-colors", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { className: "p-4 font-bold text-slate-700", children: [
                    row.level,
                    " ",
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "text-slate-400 font-medium", children: [
                      "(",
                      row.range,
                      ")"
                    ] })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { className: "p-2", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", { className: "w-full min-h-[80px] p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y text-sm", placeholder: "Type symptoms here..." }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { className: "p-2", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", { className: "w-full min-h-[80px] p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y text-sm", placeholder: "Type brain parts here..." }) })
                ] }, idx)) })
              ] }) })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "space-y-4", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex justify-between items-start border-b-2 border-slate-100 pb-2 gap-4", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "text-xl font-bold text-slate-800", children: "2. Identify two specific symptoms caused by alcohol consumption that impair a person\u2019s ability to drive. Explain, in detail, how these two symptoms impair a person\u2019s ability to drive safely." }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-sm font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full whitespace-nowrap mt-1", children: "(4 marks)" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "textarea",
                {
                  className: "w-full min-h-[150px] p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y leading-relaxed text-slate-700",
                  placeholder: "Example: 1) Slower reaction time means... \n2) Disturbed vision means..."
                }
              )
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "space-y-4", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex justify-between items-end border-b-2 border-slate-100 pb-2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "text-xl font-bold text-slate-800", children: "3. State the BAC that defines a person as intoxicated under the law and guilty of impaired driving in Canada." }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-sm font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full whitespace-nowrap", children: "(1 mark)" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "input",
                {
                  type: "text",
                  className: "w-full md:w-1/2 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-700 font-medium",
                  placeholder: "Enter BAC level here..."
                }
              )
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "space-y-4", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex justify-between items-start border-b-2 border-slate-100 pb-2 gap-4", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "text-xl font-bold text-slate-800", children: "4. Given the information about the symptoms of alcohol consumption at various BACs, do you feel that the legal limit for impaired driving is too low, too high or just right? Justify your answer." }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-sm font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full whitespace-nowrap mt-1", children: "(2 marks)" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "textarea",
                {
                  className: "w-full min-h-[120px] p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y leading-relaxed text-slate-700",
                  placeholder: "I feel the limit is [too low / too high / just right] because based on the physiological symptoms..."
                }
              )
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "space-y-6", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex justify-between items-start border-b-2 border-slate-100 pb-2 gap-4", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "text-xl font-bold text-slate-800", children: "5. Research 2 cases of impaired driving crimes in Canada." }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-slate-500 mt-2 font-medium", children: "For each case, answer the following questions:" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", { className: "list-disc list-inside text-slate-600 mt-2 space-y-1 ml-2", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Describe the case in detail. What happened? Who was involved?" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "What were the legal consequences for the driver?" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "What were the consequences for the victim(s) and/or their friends and family?" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Do you feel that the punishment was fair? Explain why or why not." }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Provide sources for your information." })
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-sm font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full whitespace-nowrap mt-1", children: "(10 marks)" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-blue-50/50 border border-blue-100 rounded-2xl p-6 space-y-4", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", { className: "text-lg font-black text-blue-900 flex items-center gap-2", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "w-5 h-5 text-blue-600" }),
                    "Case Study 1"
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "textarea",
                    {
                      className: "w-full min-h-[300px] p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y leading-relaxed text-slate-700",
                      placeholder: "Type your response for Case 1 here... Remember to include what happened, consequences, your opinion on fairness, and your sources."
                    }
                  )
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 space-y-4", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", { className: "text-lg font-black text-indigo-900 flex items-center gap-2", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "w-5 h-5 text-indigo-600" }),
                    "Case Study 2"
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "textarea",
                    {
                      className: "w-full min-h-[300px] p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y leading-relaxed text-slate-700",
                      placeholder: "Type your response for Case 2 here... Remember to include what happened, consequences, your opinion on fairness, and your sources."
                    }
                  )
                ] })
              ] })
            ] })
          ] })
        ] })
      }
    )
  ] }) });
}
export {
  ImpairedDrivingApp as default
};
/*! Bundled license information:

react/cjs/react.development.js:
  (**
   * @license React
   * react.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react-jsx-runtime.development.js:
  (**
   * @license React
   * react-jsx-runtime.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
