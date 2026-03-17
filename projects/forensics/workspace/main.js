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

// projects/forensics/workspace/main.jsx
import __CanvasHelperReactDomClient from "https://esm.sh/react-dom@19.1.1/client";
import React, { useEffect, useMemo, useState } from "https://esm.sh/react@19.1.1";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  ArrowLeft,
  ArrowRight,
  FileText,
  ClipboardCheck,
  Library,
  Search,
  PlayCircle,
  FileImage,
  FileQuestion,
  FileBadge,
  Bookmark
} from "https://esm.sh/lucide-react@0.542.0?deps=react@19.1.1";

// projects/forensics/workspace/d2l-map-data.js
var d2lCourseMapData = {
  "exportRoot": "D2LCCExport_129076_23-24 _ Forensic Studies 25 _ Per 1(A-B) _ Sec S3_202631302 (2)",
  "courseTitle": "23-24 | Forensic Studies 25 | Per 1(A-B) | Sec S3",
  "summary": {
    "moduleCount": 12,
    "itemCount": 194,
    "lessonCount": 3,
    "assignmentCount": 12,
    "quizCount": 9,
    "pdfCount": 4,
    "htmlCount": 147
  },
  "modules": [
    {
      "id": "ib7ee5bf4-9b7d-4317-aef9-941056c1a919",
      "title": "Course Information",
      "kind": "module",
      "depth": 0,
      "children": [
        {
          "id": "i4031cb8c-ff6d-4d7c-94af-dad177b0bfcd",
          "title": "Disclaimer (Please Read)",
          "kind": "html",
          "depth": 1,
          "identifierRef": "i38bb199b-4241-4c0b-926c-a4b722720f94_R",
          "resource": {
            "identifierRef": "i38bb199b-4241-4c0b-926c-a4b722720f94_R",
            "hrefs": [
              "\u0441ontent/ib526d33e-efed-4365-93ee-351aec4b56ab/Content/label_3489.html"
            ]
          },
          "children": []
        },
        {
          "id": "i15cf36f7-0c7f-406e-9759-050b45de7d0d",
          "title": "Course outline (MUST READ)",
          "kind": "pdf",
          "depth": 1,
          "identifierRef": "ic32e45ce-ad53-44d9-aa2f-6b98fb94a3b8_R",
          "resource": {
            "identifierRef": "ic32e45ce-ad53-44d9-aa2f-6b98fb94a3b8_R",
            "hrefs": [
              "\u0441ontent/idd074817-3b63-4e7f-b095-637a00ea461e/FS25 outline (summer school).pdf"
            ]
          },
          "children": []
        },
        {
          "id": "i5a614480-0679-43e6-aaeb-edf3fe3c8ed5",
          "title": "How to Be Successful in an Independent Study Course (1)",
          "kind": "pdf",
          "depth": 1,
          "identifierRef": "i6518e920-07ec-4fb7-b6f7-91566dac9383_R",
          "resource": {
            "identifierRef": "i6518e920-07ec-4fb7-b6f7-91566dac9383_R",
            "hrefs": [
              "\u0441ontent/i3838d916-02d0-4c57-bfa7-2032c66a71c4/How to Be Successful in an Independent Study Course (1).pdf"
            ]
          },
          "children": []
        },
        {
          "id": "ieb61da0b-5827-4907-a7d3-a7799094eaf2",
          "title": "How to Properly Cite Sources",
          "kind": "html",
          "depth": 1,
          "identifierRef": "ic655ee15-2fb7-4c53-ae86-38e8cac66c84_R",
          "resource": {
            "identifierRef": "ic655ee15-2fb7-4c53-ae86-38e8cac66c84_R",
            "hrefs": [
              "\u0441ontent/i0d0b4605-e0e8-481c-84d0-9813d78b146d/How to Properly Cite Sources.html"
            ]
          },
          "children": []
        },
        {
          "id": "i15f84f1f-5d31-415d-8d74-6c737bfff702",
          "title": "Enabling Brightspace Notifications",
          "kind": "pdf",
          "depth": 1,
          "identifierRef": "ia9180c55-d251-4f65-aab7-03101ce4a73f_R",
          "resource": {
            "identifierRef": "ia9180c55-d251-4f65-aab7-03101ce4a73f_R",
            "hrefs": [
              "\u0441ontent/ib7a62d52-13b2-4e83-b033-ce43a865602c/Enabling Brightspace Notifications (3).pdf"
            ]
          },
          "children": []
        },
        {
          "id": "iabcbb368-5629-4c2a-9bac-d4e514e2d2c4",
          "title": "Assignment Submission",
          "kind": "html",
          "depth": 1,
          "identifierRef": "i4c0326d7-addb-4891-af08-1c23b6494da5_R",
          "resource": {
            "identifierRef": "i4c0326d7-addb-4891-af08-1c23b6494da5_R",
            "hrefs": [
              "\u0441ontent/i1b9d5df3-0b57-4109-9a00-d3f42192d5e2/Assignment Submission.html"
            ]
          },
          "children": []
        },
        {
          "id": "i374cef97-56e7-48ab-a1b1-87788cb09763",
          "title": "Course Outline (Please Read)",
          "kind": "lesson",
          "depth": 1,
          "children": []
        }
      ]
    },
    {
      "id": "i5bef5e19-bdd8-4b3a-a194-f04e803f08a0",
      "title": "1 Introduction to Crime Scenes",
      "kind": "module",
      "depth": 0,
      "children": [
        {
          "id": "ie691ad24-9085-4ef2-8b5b-3309cd26ae7d",
          "title": "Introduction to Crime Scenes Assignment",
          "kind": "assignment",
          "depth": 1,
          "identifierRef": "ic5a980cb-8064-4ad8-a24d-1a9a87d051ba_R",
          "resource": {
            "identifierRef": "ic5a980cb-8064-4ad8-a24d-1a9a87d051ba_R",
            "hrefs": [
              "assignment/i85281f98-0aa9-4147-93a9-d14de5638519/assignment_b6a8e263-9662-47af-aa54-308b48f20040.xml"
            ]
          },
          "children": []
        },
        {
          "id": "i577559fe-804d-4b3a-bb3d-a68a5e436048",
          "title": "M1 Introduction to Crime Scenes Quiz",
          "kind": "quiz",
          "depth": 1,
          "identifierRef": "i689833ea-a32c-4f20-b6f7-c4d4cf3c3b8a_R",
          "resource": {
            "identifierRef": "i689833ea-a32c-4f20-b6f7-c4d4cf3c3b8a_R",
            "hrefs": [
              "quiz/ia861a9ae-dc07-4f6b-99b0-024595a223ae/qti_b450f83a-7ca7-4007-af5b-164602338fea.xml"
            ]
          },
          "children": []
        },
        {
          "id": "i7a192f83-d7fe-4dc0-bae3-698e7b672649",
          "title": "Introduction to Crime Scenes",
          "kind": "folder",
          "depth": 1,
          "children": [
            {
              "id": "if635b481-6c84-438c-86c3-4ea7508fccef",
              "title": "An Introduction to the Crime Scene",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i98877856-7f61-4ee3-a5d4-7dccaae09c9c_R",
              "resource": {
                "identifierRef": "i98877856-7f61-4ee3-a5d4-7dccaae09c9c_R",
                "hrefs": [
                  "\u0441ontent/ib4f8e92c-f47c-458f-92db-bcfce642e0ac/Content/book_1408/chapter_11885.html"
                ]
              },
              "children": []
            },
            {
              "id": "i28e73c00-c21b-48af-9437-29460e0aff5f",
              "title": "Real Life CSI - Crime Scene Cleaners",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i75752d61-5d26-4c0c-a791-1792d082a17d_R",
              "resource": {
                "identifierRef": "i75752d61-5d26-4c0c-a791-1792d082a17d_R",
                "hrefs": [
                  "\u0441ontent/i145c4276-895a-4176-b79e-d1ff5e43abab/Content/book_1408/chapter_11883.html"
                ]
              },
              "children": []
            },
            {
              "id": "i43da7f8f-b64f-4b0f-8cf1-67ce20e0d307",
              "title": "16x9 - Behind the Yellow Line: Real CSI Documentary",
              "kind": "html",
              "depth": 2,
              "identifierRef": "idac80810-54cd-4e71-bd5f-1d7e01b03e69_R",
              "resource": {
                "identifierRef": "idac80810-54cd-4e71-bd5f-1d7e01b03e69_R",
                "hrefs": [
                  "\u0441ontent/i78f7ffe3-b9d9-4c70-b311-76b6ce197989/Content/book_1408/chapter_11884.html"
                ]
              },
              "children": []
            },
            {
              "id": "i7de2e2bd-1ab4-47eb-a512-0380408d555f",
              "title": "Processing the Crime Scene",
              "kind": "html",
              "depth": 2,
              "identifierRef": "id4dbc1cd-1c1f-4990-8a1f-7cc75c011175_R",
              "resource": {
                "identifierRef": "id4dbc1cd-1c1f-4990-8a1f-7cc75c011175_R",
                "hrefs": [
                  "\u0441ontent/i21c03e04-97e1-45c3-958f-505b4cb31daf/Content/book_1408/chapter_11886.html"
                ]
              },
              "children": []
            },
            {
              "id": "i0801837c-bd67-4bfa-af9d-c115d15ffa79",
              "title": "Police Officers",
              "kind": "html",
              "depth": 2,
              "identifierRef": "ie3965912-004b-4d81-9ffd-6b7609c9795f_R",
              "resource": {
                "identifierRef": "ie3965912-004b-4d81-9ffd-6b7609c9795f_R",
                "hrefs": [
                  "\u0441ontent/ic8944dad-2388-45f0-a664-0df82c726799/Content/book_1408/chapter_11887.html"
                ]
              },
              "children": []
            },
            {
              "id": "i8705d170-c99b-47d4-8ac6-b2e67ffe983b",
              "title": "CSI",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i47c646f6-2bff-4fbd-be79-c4a1af2aba54_R",
              "resource": {
                "identifierRef": "i47c646f6-2bff-4fbd-be79-c4a1af2aba54_R",
                "hrefs": [
                  "\u0441ontent/ibf0b130b-7eab-4e5e-ae32-62ee711d10cc/Content/book_1408/chapter_11888.html"
                ]
              },
              "children": []
            },
            {
              "id": "i4b166187-370a-45bc-9d01-59dff699d2b4",
              "title": "District Attorney",
              "kind": "html",
              "depth": 2,
              "identifierRef": "ic5cb2d87-7657-40e6-8cda-8e06e4bd73d5_R",
              "resource": {
                "identifierRef": "ic5cb2d87-7657-40e6-8cda-8e06e4bd73d5_R",
                "hrefs": [
                  "\u0441ontent/i8aaaf903-004c-45c5-ba4f-1c91252f4db2/Content/book_1408/chapter_11889.html"
                ]
              },
              "children": []
            },
            {
              "id": "i0b08118c-951d-48c4-801c-3c1706e5e8a4",
              "title": "Medical Examiner",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i548e6c0b-1e65-481b-a063-c304f5fc74b8_R",
              "resource": {
                "identifierRef": "i548e6c0b-1e65-481b-a063-c304f5fc74b8_R",
                "hrefs": [
                  "\u0441ontent/i1dd32948-6d00-43ba-947d-c27925c5cc42/Content/book_1408/chapter_11890.html"
                ]
              },
              "children": []
            },
            {
              "id": "ib2cdc574-a087-47f6-b1a9-19784ed07404",
              "title": "Specialists",
              "kind": "html",
              "depth": 2,
              "identifierRef": "idd1789cb-66a9-4cfd-acb3-a40e24fa9383_R",
              "resource": {
                "identifierRef": "idd1789cb-66a9-4cfd-acb3-a40e24fa9383_R",
                "hrefs": [
                  "\u0441ontent/i723a2fd3-09bd-40ec-af8a-7e3670629895/Content/book_1408/chapter_11891.html"
                ]
              },
              "children": []
            },
            {
              "id": "i088ed9d1-2761-4243-a167-992f8b076581",
              "title": "The Seven S's Of Crime Scene Investigation",
              "kind": "html",
              "depth": 2,
              "identifierRef": "iec754e54-58db-4556-aa49-598dcbfa2afb_R",
              "resource": {
                "identifierRef": "iec754e54-58db-4556-aa49-598dcbfa2afb_R",
                "hrefs": [
                  "\u0441ontent/i7c8b5b16-2ade-4e08-b175-fae7381f6a99/Content/book_1408/chapter_11892.html"
                ]
              },
              "children": []
            },
            {
              "id": "id31b1a83-13b0-4eb6-a71c-582921e6f2a0",
              "title": "Securing",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i0827201a-5918-4e34-9cba-07d3027507d2_R",
              "resource": {
                "identifierRef": "i0827201a-5918-4e34-9cba-07d3027507d2_R",
                "hrefs": [
                  "\u0441ontent/iebd03ccd-7d17-4c19-b2cf-d0fc179923f1/Content/book_1408/chapter_11893.html"
                ]
              },
              "children": []
            },
            {
              "id": "i444613c4-96a7-4f69-80c2-5844a6268701",
              "title": "Separating",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i3df8bf70-3e80-4781-a778-6cc537f00def_R",
              "resource": {
                "identifierRef": "i3df8bf70-3e80-4781-a778-6cc537f00def_R",
                "hrefs": [
                  "\u0441ontent/iad4dd2d3-6578-41b4-a79e-eca9af51e72d/Content/book_1408/chapter_11894.html"
                ]
              },
              "children": []
            },
            {
              "id": "i469d0eb5-df5f-41a6-a43a-6b5b3afc6e53",
              "title": "Scanning",
              "kind": "html",
              "depth": 2,
              "identifierRef": "ifce8a3b5-2059-43e1-819b-16874f371cf1_R",
              "resource": {
                "identifierRef": "ifce8a3b5-2059-43e1-819b-16874f371cf1_R",
                "hrefs": [
                  "\u0441ontent/i5f78a9ae-c5f4-462c-8d7b-2aaab7b14ece/Content/book_1408/chapter_11895.html"
                ]
              },
              "children": []
            },
            {
              "id": "i1edd54e0-b197-45a1-924b-03ea06bfc230",
              "title": "Seeing",
              "kind": "html",
              "depth": 2,
              "identifierRef": "ib2e483d9-9893-4734-885d-02fb7734d6c1_R",
              "resource": {
                "identifierRef": "ib2e483d9-9893-4734-885d-02fb7734d6c1_R",
                "hrefs": [
                  "\u0441ontent/i04eaaf96-15f3-4d22-8c72-1f8893c40a00/Content/book_1408/chapter_11896.html"
                ]
              },
              "children": []
            },
            {
              "id": "i8e4417e1-d832-4b81-963c-f99a5fed5af8",
              "title": "Sketching",
              "kind": "html",
              "depth": 2,
              "identifierRef": "if71156f1-f90f-49e8-9648-c4157eac00a5_R",
              "resource": {
                "identifierRef": "if71156f1-f90f-49e8-9648-c4157eac00a5_R",
                "hrefs": [
                  "\u0441ontent/i27904728-efdb-495c-b96e-e3217f61e36b/Content/book_1408/chapter_11897.html"
                ]
              },
              "children": []
            },
            {
              "id": "if4d6203a-9bb3-4e8b-ad73-8bacf38b2d8f",
              "title": "Sample Sketch",
              "kind": "html",
              "depth": 2,
              "identifierRef": "if170f16c-d926-4fde-8971-bc80c032804a_R",
              "resource": {
                "identifierRef": "if170f16c-d926-4fde-8971-bc80c032804a_R",
                "hrefs": [
                  "\u0441ontent/i6a54d984-7139-4715-8bfc-64907cac2062/Content/book_1408/chapter_11898.html"
                ]
              },
              "children": []
            },
            {
              "id": "i73308cba-b0ed-428b-9122-1669046027ca",
              "title": "Searching",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i4576a0f6-fd9d-434d-9ede-28a14226767c_R",
              "resource": {
                "identifierRef": "i4576a0f6-fd9d-434d-9ede-28a14226767c_R",
                "hrefs": [
                  "\u0441ontent/ife0cae32-5e92-4d0a-8430-e84d30b74a9b/Content/book_1408/chapter_11899.html"
                ]
              },
              "children": []
            },
            {
              "id": "i5017bb69-db41-48b1-9f36-b5f3c309c12f",
              "title": "Search Patterns",
              "kind": "html",
              "depth": 2,
              "identifierRef": "ie7117700-083a-4597-a052-f3397cec9c6b_R",
              "resource": {
                "identifierRef": "ie7117700-083a-4597-a052-f3397cec9c6b_R",
                "hrefs": [
                  "\u0441ontent/i21b757e3-5303-4251-9ff3-90b3781291f0/Content/book_1408/chapter_11900.html"
                ]
              },
              "children": []
            },
            {
              "id": "i73a9f57d-db7d-42ff-8017-d1078d0b3f73",
              "title": "Securing and Collecting Evidence",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i87ec3a3d-311f-462b-a28c-1fc755c8c9f4_R",
              "resource": {
                "identifierRef": "i87ec3a3d-311f-462b-a28c-1fc755c8c9f4_R",
                "hrefs": [
                  "\u0441ontent/id1e21dce-1088-42b4-b312-58e35f9f7093/Content/book_1408/chapter_11901.html"
                ]
              },
              "children": []
            },
            {
              "id": "i35ef7b92-372b-4702-a0b5-0c3f5001a22d",
              "title": "Paper Bindle",
              "kind": "html",
              "depth": 2,
              "identifierRef": "idbb9c2fc-9a35-440a-9530-f3158fa3577e_R",
              "resource": {
                "identifierRef": "idbb9c2fc-9a35-440a-9530-f3158fa3577e_R",
                "hrefs": [
                  "\u0441ontent/i81a11c1b-42d8-4fc3-ad60-8b9e1f9ca83c/Content/book_1408/chapter_11902.html"
                ]
              },
              "children": []
            },
            {
              "id": "i7dfddcda-d76d-4d9e-ba05-75dd8cb1c169",
              "title": "Chain of Custody",
              "kind": "html",
              "depth": 2,
              "identifierRef": "idcf2cd48-edb8-47e1-821a-3a49d92100da_R",
              "resource": {
                "identifierRef": "idcf2cd48-edb8-47e1-821a-3a49d92100da_R",
                "hrefs": [
                  "\u0441ontent/ica867618-581c-46c7-be97-e1a5c991ab16/Content/book_1408/chapter_11903.html"
                ]
              },
              "children": []
            },
            {
              "id": "i56942e9b-1237-4c64-9e7a-751cb8e4a30c",
              "title": "Crime Scene Safety",
              "kind": "html",
              "depth": 2,
              "identifierRef": "ic59c7133-477b-42f1-82fb-5270f2e48ba8_R",
              "resource": {
                "identifierRef": "ic59c7133-477b-42f1-82fb-5270f2e48ba8_R",
                "hrefs": [
                  "\u0441ontent/i17370884-5a56-416d-91ab-8541069a5e81/Content/book_1408/chapter_12201.html"
                ]
              },
              "children": []
            },
            {
              "id": "i43d92514-0888-49b8-b553-44ebaa05d320",
              "title": "Unit Assessments",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i3fcc2f7f-746e-452b-856d-d9170bfe0dfa_R",
              "resource": {
                "identifierRef": "i3fcc2f7f-746e-452b-856d-d9170bfe0dfa_R",
                "hrefs": [
                  "\u0441ontent/id39fc4c9-5340-4b3b-a8de-25fddcdab307/Content/book_1408/chapter_12262.html"
                ]
              },
              "children": []
            }
          ]
        }
      ]
    },
    {
      "id": "i7f42688c-2c36-4fef-a4ee-92c49843d548",
      "title": "2 Types of Evidence and Fingerprint Analysis",
      "kind": "module",
      "depth": 0,
      "children": [
        {
          "id": "i0692fe9d-7a5b-4d0b-b651-bdaca5cccc42",
          "title": "Types of Evidence and Fingerprint Analysis Assignment",
          "kind": "assignment",
          "depth": 1,
          "identifierRef": "i471fcd5a-ad4c-40db-b2c4-d7ec0bccebfa_R",
          "resource": {
            "identifierRef": "i471fcd5a-ad4c-40db-b2c4-d7ec0bccebfa_R",
            "hrefs": [
              "assignment/i0073cf68-ef89-4190-b368-d429ee0816f0/assignment_80f86dff-581e-4e9f-abe9-d5407d926f3f.xml"
            ]
          },
          "children": []
        },
        {
          "id": "i01cf0e72-5d16-4908-84ba-6790a0b5a19e",
          "title": "Fingerprint Case Studies Assignment",
          "kind": "assignment",
          "depth": 1,
          "identifierRef": "i84d48ef1-1ee0-495c-aeaa-df311123a7e3_R",
          "resource": {
            "identifierRef": "i84d48ef1-1ee0-495c-aeaa-df311123a7e3_R",
            "hrefs": [
              "assignment/i20dfab48-a342-491f-8077-34397a216ad6/assignment_5c66b2fe-5be0-4060-a68e-a6ca11dd1ffb.xml"
            ]
          },
          "children": []
        },
        {
          "id": "ic7df97dd-4c5c-4963-b961-250a0a2b4bda",
          "title": "M2 Types of Evidence and Fingerprint Analysis Assessment",
          "kind": "quiz",
          "depth": 1,
          "identifierRef": "i176fee22-2598-4845-9c48-9e2765af3e15_R",
          "resource": {
            "identifierRef": "i176fee22-2598-4845-9c48-9e2765af3e15_R",
            "hrefs": [
              "quiz/i0649d126-890d-4d3e-b83f-c563065521db/qti_c38fc56d-87c6-481d-958a-c13ba81b9304.xml"
            ]
          },
          "children": []
        },
        {
          "id": "ia2efde08-69f4-498c-b6ed-fe7d89264bd3",
          "title": "Types of Evidence and Fingerprint Analysis",
          "kind": "folder",
          "depth": 1,
          "children": [
            {
              "id": "i3f489113-2c72-43ca-a716-1567961c928f",
              "title": "Types of Evidence and Fingerprint Analysis",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i2814bd16-f341-4468-8c86-7a1661fbda17_R",
              "resource": {
                "identifierRef": "i2814bd16-f341-4468-8c86-7a1661fbda17_R",
                "hrefs": [
                  "\u0441ontent/i2fbe29e6-e968-4c68-8cd5-dde0abd398b1/Content/book_1412/chapter_11952.html"
                ]
              },
              "children": []
            },
            {
              "id": "iefe2acfb-b9bc-4f52-938c-017c14008e9b",
              "title": "Evidence Types",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i7bb29dee-babd-4866-82e2-ba9d2b009bcc_R",
              "resource": {
                "identifierRef": "i7bb29dee-babd-4866-82e2-ba9d2b009bcc_R",
                "hrefs": [
                  "\u0441ontent/i01a08fc7-ba72-40e7-83cd-07fe01d50d49/Content/book_1412/chapter_11953.html"
                ]
              },
              "children": []
            },
            {
              "id": "ie3ea3edf-3164-45fb-becf-6e9246104bce",
              "title": "Value of Evidence",
              "kind": "html",
              "depth": 2,
              "identifierRef": "id9fcc2df-5471-4248-8e0a-409a4c8971f9_R",
              "resource": {
                "identifierRef": "id9fcc2df-5471-4248-8e0a-409a4c8971f9_R",
                "hrefs": [
                  "\u0441ontent/i7024e9f0-219f-4bb5-9972-3b3b58365841/Content/book_1412/chapter_11954.html"
                ]
              },
              "children": []
            },
            {
              "id": "i7dba649c-68b2-488b-bb6e-d058382c4763",
              "title": "Evidence Types Case Study",
              "kind": "html",
              "depth": 2,
              "identifierRef": "idb335369-56f2-4ec3-904a-38faee17f7cf_R",
              "resource": {
                "identifierRef": "idb335369-56f2-4ec3-904a-38faee17f7cf_R",
                "hrefs": [
                  "\u0441ontent/i57b023f1-0b7e-4404-9d89-c9ef9914a6ac/Content/book_1412/chapter_11955.html"
                ]
              },
              "children": []
            },
            {
              "id": "ibb5a600f-9796-48f5-82ca-1ac1b4064289",
              "title": "Brief History of Fingerprinting",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i9b321a90-dc82-47c7-a7b7-7cd2621e7fb4_R",
              "resource": {
                "identifierRef": "i9b321a90-dc82-47c7-a7b7-7cd2621e7fb4_R",
                "hrefs": [
                  "\u0441ontent/ided21828-5e62-49a3-aae1-6cf000ed83f6/Content/book_1412/chapter_11957.html"
                ]
              },
              "children": []
            },
            {
              "id": "i3da31399-83fb-46ec-8111-0f8101649c16",
              "title": "Fingerprint Analysis",
              "kind": "html",
              "depth": 2,
              "identifierRef": "iabe762d4-8a2a-49d9-b390-12417df7c6f4_R",
              "resource": {
                "identifierRef": "iabe762d4-8a2a-49d9-b390-12417df7c6f4_R",
                "hrefs": [
                  "\u0441ontent/i2e500d83-0ea4-4c77-b639-f6acc6f291bd/Content/book_1412/chapter_11978.html"
                ]
              },
              "children": []
            },
            {
              "id": "ie8ceb5e7-f6b4-4812-8049-f030724e39ee",
              "title": "Types of Fingerprint Evidence",
              "kind": "html",
              "depth": 2,
              "identifierRef": "id46b28f1-2eba-41ec-b655-77ec1ceadade_R",
              "resource": {
                "identifierRef": "id46b28f1-2eba-41ec-b655-77ec1ceadade_R",
                "hrefs": [
                  "\u0441ontent/i6090376e-1b88-4285-b676-c3fa0cee7a43/Content/book_1412/chapter_11958.html"
                ]
              },
              "children": []
            },
            {
              "id": "i3bbffc17-f0e1-4f8f-bf76-6b419e5653ea",
              "title": "How a Match is Made",
              "kind": "html",
              "depth": 2,
              "identifierRef": "ibb246754-f237-4fa7-85f2-a6b1713d65d4_R",
              "resource": {
                "identifierRef": "ibb246754-f237-4fa7-85f2-a6b1713d65d4_R",
                "hrefs": [
                  "\u0441ontent/i61d13a78-3d18-40e9-a7f7-3a44fbf59e80/Content/book_1412/chapter_11959.html"
                ]
              },
              "children": []
            },
            {
              "id": "if711e164-853a-487d-9ec6-f8fd5b1e8a7a",
              "title": "Fingerprint Case Study: John Dillinger",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i1cccae0c-9255-4aaa-a02e-ec53f607b7a2_R",
              "resource": {
                "identifierRef": "i1cccae0c-9255-4aaa-a02e-ec53f607b7a2_R",
                "hrefs": [
                  "\u0441ontent/i6fc5f283-0bc6-4999-9efe-01ac5381f0b7/Content/book_1412/chapter_11960.html"
                ]
              },
              "children": []
            },
            {
              "id": "ie2ca1b88-2376-4300-987b-24ca0bbb36e0",
              "title": "Latent Fingerprint Enhancement",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i474328c9-5a30-45b0-8005-3d96d6b0c88e_R",
              "resource": {
                "identifierRef": "i474328c9-5a30-45b0-8005-3d96d6b0c88e_R",
                "hrefs": [
                  "\u0441ontent/iab21127f-086e-4953-8181-f8bb4215377c/Content/book_1412/chapter_11962.html"
                ]
              },
              "children": []
            },
            {
              "id": "i8a066e90-e61c-41fa-9267-59886b94e2bc",
              "title": "Latent Fingerprint Enhancement (2)",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i0a2de926-241c-4b2b-a594-8fc00186cd05_R",
              "resource": {
                "identifierRef": "i0a2de926-241c-4b2b-a594-8fc00186cd05_R",
                "hrefs": [
                  "\u0441ontent/i9ec10d7b-a450-4c8b-a353-b07095a6ce0d/Content/book_1412/chapter_11963.html"
                ]
              },
              "children": []
            },
            {
              "id": "i55418e5b-ff27-4c80-9a18-b8bbb418822f",
              "title": "Latent Fingerprint Enhancement (3)",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i5ab56310-cc1a-47d4-8210-09e900001ac1_R",
              "resource": {
                "identifierRef": "i5ab56310-cc1a-47d4-8210-09e900001ac1_R",
                "hrefs": [
                  "\u0441ontent/iadb4c43b-aea4-42c7-b8a1-b9af3831ec0a/Content/book_1412/chapter_11964.html"
                ]
              },
              "children": []
            },
            {
              "id": "i8eee8412-0c11-46f1-a1f3-2331506dc29d",
              "title": "Experiment : Short-Term vs Long-Term Latent Fingerprint Samples (Optional)",
              "kind": "html",
              "depth": 2,
              "identifierRef": "ie3402ea0-3bce-4de2-b4d4-7f01ea08e975_R",
              "resource": {
                "identifierRef": "ie3402ea0-3bce-4de2-b4d4-7f01ea08e975_R",
                "hrefs": [
                  "\u0441ontent/i7086da89-4a39-41df-95b6-f5475be69bd3/Content/book_1412/chapter_11965.html"
                ]
              },
              "children": []
            },
            {
              "id": "i693e8526-037b-4861-903a-02900dacc3af",
              "title": "Experiment: Finding and Lifiting Latent Fingerprints Using Lifting Powders (Optional)",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i467c8053-11ed-4b51-b7d4-421ed507f170_R",
              "resource": {
                "identifierRef": "i467c8053-11ed-4b51-b7d4-421ed507f170_R",
                "hrefs": [
                  "\u0441ontent/i90b6e6d0-c199-4ca3-b49c-6d3bd91c111d/Content/book_1412/chapter_11966.html"
                ]
              },
              "children": []
            },
            {
              "id": "i97613a11-8c67-432b-aebd-79e6cf528bf8",
              "title": "Case Study: The Zodiac Killer",
              "kind": "html",
              "depth": 2,
              "identifierRef": "ie8ef5078-5f0a-44e7-a112-627685db1f9c_R",
              "resource": {
                "identifierRef": "ie8ef5078-5f0a-44e7-a112-627685db1f9c_R",
                "hrefs": [
                  "\u0441ontent/i13e076dd-cf2b-46f6-86bc-7534a3937931/Content/book_1412/chapter_11972.html"
                ]
              },
              "children": []
            },
            {
              "id": "ia1103986-abd1-4261-a6b9-bd2e3204f7c2",
              "title": "Case Study: The Zodiac Killer (continued)",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i1d4f4ee7-89d8-496f-8f8b-1c779935b6b1_R",
              "resource": {
                "identifierRef": "i1d4f4ee7-89d8-496f-8f8b-1c779935b6b1_R",
                "hrefs": [
                  "\u0441ontent/i15a39b8f-ec37-4634-8131-2bbce7798ca9/Content/book_1412/chapter_11973.html"
                ]
              },
              "children": []
            },
            {
              "id": "i9a164b82-0c08-4401-b651-0a2fbadc1ad0",
              "title": "Case Study: Bank Robbery Mystery",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i3844fa0d-4c00-4090-9919-8d822031b091_R",
              "resource": {
                "identifierRef": "i3844fa0d-4c00-4090-9919-8d822031b091_R",
                "hrefs": [
                  "\u0441ontent/i865e453c-30d0-4618-b4a7-cccf59e06d95/Content/book_1412/chapter_11974.html"
                ]
              },
              "children": []
            },
            {
              "id": "if4bb7013-26ee-428c-8d36-e0f8293a1c20",
              "title": "Evidence and Fingerprints Online Activity (Optional)",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i9c907f48-b101-4d72-ba2d-d85b1f7bdcdd_R",
              "resource": {
                "identifierRef": "i9c907f48-b101-4d72-ba2d-d85b1f7bdcdd_R",
                "hrefs": [
                  "\u0441ontent/iee4cbe70-dce6-45f9-844f-a33022c2b3e8/Content/book_1412/chapter_11977.html"
                ]
              },
              "children": []
            },
            {
              "id": "i244a337d-c251-4b42-ab64-daa3048bf20e",
              "title": "Unit Assessments",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i6c4132b2-8117-4512-b700-525e1aea2dcd_R",
              "resource": {
                "identifierRef": "i6c4132b2-8117-4512-b700-525e1aea2dcd_R",
                "hrefs": [
                  "\u0441ontent/ic7ec92a5-2b40-41dd-bb6a-630476029c2f/Content/book_1412/chapter_12263.html"
                ]
              },
              "children": []
            }
          ]
        }
      ]
    },
    {
      "id": "ifee2fd69-90bc-4e96-940f-1f499df7e3e5",
      "title": "3 Trace Evidence",
      "kind": "module",
      "depth": 0,
      "children": [
        {
          "id": "i004dee17-c08d-468a-a71e-f42c16522d5d",
          "title": "Trace Evidence Assignment",
          "kind": "assignment",
          "depth": 1,
          "identifierRef": "i4f233cb8-246e-4242-a2d3-275fc2ee3bb8_R",
          "resource": {
            "identifierRef": "i4f233cb8-246e-4242-a2d3-275fc2ee3bb8_R",
            "hrefs": [
              "assignment/ia4effbb5-11e6-405e-a610-94c25bdcd18e/assignment_ed348d79-dd81-485b-be5f-fefe59594acb.xml"
            ]
          },
          "children": []
        },
        {
          "id": "i6b06beb6-d60d-48d2-9e72-f9c4bfc409bf",
          "title": "Trace Evidence Case Studies Assignment",
          "kind": "assignment",
          "depth": 1,
          "identifierRef": "iee56c695-81e2-415f-89f9-17a173d1571e_R",
          "resource": {
            "identifierRef": "iee56c695-81e2-415f-89f9-17a173d1571e_R",
            "hrefs": [
              "assignment/id0a71404-7f00-4bd1-b380-ae695903a2fb/assignment_156bf40b-261a-4e73-9bf3-354be6aaf4a7.xml"
            ]
          },
          "children": []
        },
        {
          "id": "i22936ee3-59e8-47b9-a747-2c86ab6feac7",
          "title": "M3 Trace Evidence Assessment",
          "kind": "quiz",
          "depth": 1,
          "identifierRef": "i3d4d0fb0-e744-45dc-8571-36bab3ee90de_R",
          "resource": {
            "identifierRef": "i3d4d0fb0-e744-45dc-8571-36bab3ee90de_R",
            "hrefs": [
              "quiz/i8a6fcedb-c38d-48ed-84dc-c0afdf4990b9/qti_6cad72c2-63f3-4200-9d60-a4dc07c4dbe1.xml"
            ]
          },
          "children": []
        },
        {
          "id": "i1b0a0e85-56bb-422e-aa6c-140a75263dcc",
          "title": "Trace Evidence",
          "kind": "folder",
          "depth": 1,
          "children": [
            {
              "id": "i6f51abd7-313e-4432-8cd6-bd38a727f349",
              "title": "What is Trace Evidence?",
              "kind": "html",
              "depth": 2,
              "identifierRef": "ib8676a0e-69c8-4f0d-bf97-4026bd162d25_R",
              "resource": {
                "identifierRef": "ib8676a0e-69c8-4f0d-bf97-4026bd162d25_R",
                "hrefs": [
                  "\u0441ontent/i768ac1ae-b062-42f8-8c3d-1f70191c5808/Content/book_1413/chapter_11979.html"
                ]
              },
              "children": []
            },
            {
              "id": "i49c910bd-6b1b-4b6c-9278-0ae877f06f7c",
              "title": "Identifying Trace Evidence",
              "kind": "html",
              "depth": 2,
              "identifierRef": "ifa3f0b49-e42a-429f-a690-e2cf2ca8d405_R",
              "resource": {
                "identifierRef": "ifa3f0b49-e42a-429f-a690-e2cf2ca8d405_R",
                "hrefs": [
                  "\u0441ontent/i15e6ef30-f8fe-4a0a-856e-16275d9a167b/Content/book_1413/chapter_11980.html"
                ]
              },
              "children": []
            },
            {
              "id": "i161e15d4-843d-4349-bf28-647eabb110f0",
              "title": "Collection of Trace Evidence",
              "kind": "html",
              "depth": 2,
              "identifierRef": "iaba02f9a-d02e-417a-8ac8-08ef7f6e399e_R",
              "resource": {
                "identifierRef": "iaba02f9a-d02e-417a-8ac8-08ef7f6e399e_R",
                "hrefs": [
                  "\u0441ontent/ica1ea031-d879-4f12-bdbb-f2c344cca0c0/Content/book_1413/chapter_11981.html"
                ]
              },
              "children": []
            },
            {
              "id": "ie30a22ce-2f0a-48af-a679-f2bf1acee29e",
              "title": "Collecting Trace Evidence at Home",
              "kind": "html",
              "depth": 2,
              "identifierRef": "iaf43e709-34d5-4159-93a3-868e768c4a1b_R",
              "resource": {
                "identifierRef": "iaf43e709-34d5-4159-93a3-868e768c4a1b_R",
                "hrefs": [
                  "\u0441ontent/ie3d6727a-8313-4c39-bc2e-9d14b0d5185a/Content/book_1413/chapter_11982.html"
                ]
              },
              "children": []
            },
            {
              "id": "ie032f9d3-cf53-43f7-9f3d-cb3f81967e62",
              "title": "Microscopic Analysis of Hair",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i461fb075-30d8-4f68-b2c3-3d0da552d977_R",
              "resource": {
                "identifierRef": "i461fb075-30d8-4f68-b2c3-3d0da552d977_R",
                "hrefs": [
                  "\u0441ontent/i01769305-1d04-4b96-ae17-df848a52c31f/Content/book_1413/chapter_12223.html"
                ]
              },
              "children": []
            },
            {
              "id": "ied799bb6-cf86-4eea-b59f-449553aed5b8",
              "title": "Hair Evidence",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i7f0f44cd-2fa9-44c2-acff-80dc588f9f56_R",
              "resource": {
                "identifierRef": "i7f0f44cd-2fa9-44c2-acff-80dc588f9f56_R",
                "hrefs": [
                  "\u0441ontent/i55c747ee-6cb8-43b0-b421-10feff383073/Content/book_1413/chapter_12224.html"
                ]
              },
              "children": []
            },
            {
              "id": "i42063c03-7639-429b-82f4-24f56c2cfe91",
              "title": "Useful Types of Hair Samples",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i09e83891-c13d-4416-b3a1-598b76846ac9_R",
              "resource": {
                "identifierRef": "i09e83891-c13d-4416-b3a1-598b76846ac9_R",
                "hrefs": [
                  "\u0441ontent/i1e97890f-81bf-446d-ab50-004a1547d227/Content/book_1413/chapter_12225.html"
                ]
              },
              "children": []
            },
            {
              "id": "ic5b0b4ca-471a-4498-be94-eb07ca414de5",
              "title": "Animal Hair",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i7cf2d86e-e278-4c6b-9638-051821ee7d52_R",
              "resource": {
                "identifierRef": "i7cf2d86e-e278-4c6b-9638-051821ee7d52_R",
                "hrefs": [
                  "\u0441ontent/iecafb11f-ca0d-4ad8-a0e7-43d399f4371a/Content/book_1413/chapter_12226.html"
                ]
              },
              "children": []
            },
            {
              "id": "ied152132-70d7-4bcc-a3f4-3b45940e71a8",
              "title": "Features of Hair",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i77f690c2-2b4f-4d0c-8a81-dab79e49c55b_R",
              "resource": {
                "identifierRef": "i77f690c2-2b4f-4d0c-8a81-dab79e49c55b_R",
                "hrefs": [
                  "\u0441ontent/i140bff09-0cf0-4230-8bf1-25cf6daf71f2/Content/book_1413/chapter_12227.html"
                ]
              },
              "children": []
            },
            {
              "id": "i3b0d5c8a-a85b-4406-9b0d-defc6b36e516",
              "title": "Crime Case Study - The Central Park Five",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i0b186bb0-178e-4c77-b193-64d4bdcca851_R",
              "resource": {
                "identifierRef": "i0b186bb0-178e-4c77-b193-64d4bdcca851_R",
                "hrefs": [
                  "\u0441ontent/i09fc2f90-b5a6-46d8-a876-6a6e38b8956f/Content/book_1413/chapter_12228.html"
                ]
              },
              "children": []
            },
            {
              "id": "if564a995-6f4a-44e6-81fc-740e1bdd14bb",
              "title": "Fibre Analysis",
              "kind": "html",
              "depth": 2,
              "identifierRef": "ic719c0c7-2c47-43f9-8735-6432052fb72d_R",
              "resource": {
                "identifierRef": "ic719c0c7-2c47-43f9-8735-6432052fb72d_R",
                "hrefs": [
                  "\u0441ontent/iab328ad4-59b6-47fe-95ca-ea0efa2a4f0e/Content/book_1413/chapter_12229.html"
                ]
              },
              "children": []
            },
            {
              "id": "i8e95acb1-9fa0-4d3a-bdd9-e8491e30173a",
              "title": "Fibre Evidence",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i4edb837d-ff46-420d-96a7-c83aea15762f_R",
              "resource": {
                "identifierRef": "i4edb837d-ff46-420d-96a7-c83aea15762f_R",
                "hrefs": [
                  "\u0441ontent/if1ac80aa-363d-4683-9fbc-9311d6a6ff50/Fibre Evidence.html"
                ]
              },
              "children": []
            },
            {
              "id": "i3b377c89-24f8-459f-8094-618da18fb4ac",
              "title": "Crime Case Study - Samuel Morgan",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i78f51f39-1487-47a4-8c3f-e400efee0e84_R",
              "resource": {
                "identifierRef": "i78f51f39-1487-47a4-8c3f-e400efee0e84_R",
                "hrefs": [
                  "\u0441ontent/i6ab2040d-c5b1-490e-ba4c-3f876aa81850/Content/book_1413/chapter_12230.html"
                ]
              },
              "children": []
            },
            {
              "id": "i0612faea-6f92-4051-a7b8-981508f390f4",
              "title": "Real CSI Hair and Fiber Analysis",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i3669c1ae-e9c8-4e09-ba17-60346a4eb646_R",
              "resource": {
                "identifierRef": "i3669c1ae-e9c8-4e09-ba17-60346a4eb646_R",
                "hrefs": [
                  "\u0441ontent/i92f88147-44ef-4d6c-97f9-d770b6676aab/Content/book_1413/chapter_12231.html"
                ]
              },
              "children": []
            },
            {
              "id": "i9105e7e8-47b1-4e0f-bf27-69e59a3ad5e0",
              "title": "Unit Assessments",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i259654b3-ad73-4e7a-aa26-89ec63d530d7_R",
              "resource": {
                "identifierRef": "i259654b3-ad73-4e7a-aa26-89ec63d530d7_R",
                "hrefs": [
                  "\u0441ontent/if41b09c7-b23d-40cb-9002-9f552abf2c20/Content/book_1413/chapter_12264.html"
                ]
              },
              "children": []
            }
          ]
        }
      ]
    },
    {
      "id": "i880135f2-de82-4381-887f-255d14069eba",
      "title": "4 Body Fluid Evidence",
      "kind": "module",
      "depth": 0,
      "children": [
        {
          "id": "ibcf723e3-4183-4163-95a3-69f8bd5cbe32",
          "title": "Body Fluid Assignment",
          "kind": "assignment",
          "depth": 1,
          "identifierRef": "i840aab1c-38b7-437f-b3b3-7eb7812a9743_R",
          "resource": {
            "identifierRef": "i840aab1c-38b7-437f-b3b3-7eb7812a9743_R",
            "hrefs": [
              "assignment/i2f6d626c-a477-4b3d-ace8-63aa9fc45fdc/assignment_a20c2933-ad33-4b9d-9221-9eee7272528c.xml"
            ]
          },
          "children": []
        },
        {
          "id": "i96f27a7d-c688-4c44-a775-c85345b95014",
          "title": "Body Fluid Evidence Case Studies Assignment",
          "kind": "assignment",
          "depth": 1,
          "identifierRef": "id6db1fe6-1014-43c7-a5bb-07c6b436ebb0_R",
          "resource": {
            "identifierRef": "id6db1fe6-1014-43c7-a5bb-07c6b436ebb0_R",
            "hrefs": [
              "assignment/i16176291-5154-45bd-8891-b2c9517b1a3c/assignment_701e84be-65c1-4997-b793-347fd65867af.xml"
            ]
          },
          "children": []
        },
        {
          "id": "i3f3ea2bd-7610-4cc3-ae3e-23df4f71f622",
          "title": "M4 Body Fluid Evidence Assessment",
          "kind": "quiz",
          "depth": 1,
          "identifierRef": "ide47a03e-e200-48b8-870b-4794f4ba9f27_R",
          "resource": {
            "identifierRef": "ide47a03e-e200-48b8-870b-4794f4ba9f27_R",
            "hrefs": [
              "quiz/i812c9f87-9415-4069-8a6b-de07d58d1d65/qti_73c126d9-c527-4dd8-821c-9b217bfbc484.xml"
            ]
          },
          "children": []
        },
        {
          "id": "i67a670b7-b438-4eee-b282-27358e5b2f17",
          "title": "All About Blood",
          "kind": "folder",
          "depth": 1,
          "children": [
            {
              "id": "ic0de1ba6-d3ad-4d26-819a-23bfa8b64357",
              "title": "Body Fluid Evidence",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i3ba12bb7-9080-4168-92be-42cd80c81116_R",
              "resource": {
                "identifierRef": "i3ba12bb7-9080-4168-92be-42cd80c81116_R",
                "hrefs": [
                  "\u0441ontent/ie2c27177-23ad-417f-b0ec-34dd4f47add4/Content/book_1416/chapter_11992.html"
                ]
              },
              "children": []
            },
            {
              "id": "ifc2054dc-56c1-4a44-ab91-2e0befb57d2a",
              "title": "Blood Components",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i50af7670-7ab9-464e-aef2-a527b45f927a_R",
              "resource": {
                "identifierRef": "i50af7670-7ab9-464e-aef2-a527b45f927a_R",
                "hrefs": [
                  "\u0441ontent/iaa3f78e9-0e4d-4433-9909-e9f94598ef9b/Content/book_1416/chapter_11993.html"
                ]
              },
              "children": []
            },
            {
              "id": "i24e3a273-a2d7-4e05-992c-76956617a827",
              "title": "Blood Typing",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i9114e431-1a8f-40c1-a8c2-ef72d08ed6d0_R",
              "resource": {
                "identifierRef": "i9114e431-1a8f-40c1-a8c2-ef72d08ed6d0_R",
                "hrefs": [
                  "\u0441ontent/i2ce3b936-b6db-4d86-9174-1bfa407805e8/Content/book_1416/chapter_11994.html"
                ]
              },
              "children": []
            },
            {
              "id": "i10c64a73-f7b5-4381-86ac-f02ed84ffb27",
              "title": "Lesson One - All About Blood",
              "kind": "html",
              "depth": 2,
              "identifierRef": "icf09851d-1d57-4aac-893a-ef1488a5a3c2_R",
              "resource": {
                "identifierRef": "icf09851d-1d57-4aac-893a-ef1488a5a3c2_R",
                "hrefs": [
                  "\u0441ontent/i3e9bc723-a8fd-4f14-a0c8-b8ba53d493a5/Content/book_1416/chapter_11995.html"
                ]
              },
              "children": []
            },
            {
              "id": "i67687164-6bfb-449a-8055-a884aa95a7e9",
              "title": "Lesson 2 Blood Evidence",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i61c2d2ac-014f-4070-8e70-6047bb600f00_R",
              "resource": {
                "identifierRef": "i61c2d2ac-014f-4070-8e70-6047bb600f00_R",
                "hrefs": [
                  "\u0441ontent/ic503e56b-480c-4035-8911-fd2e03231c0a/Content/book_1416/chapter_11996.html"
                ]
              },
              "children": []
            },
            {
              "id": "i8d52afe1-21f5-4915-84b2-7bfe5bfaebc0",
              "title": "Blood Evidence - Phenolphthalein",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i4da22585-42a8-4678-8920-7393b5ce7a8f_R",
              "resource": {
                "identifierRef": "i4da22585-42a8-4678-8920-7393b5ce7a8f_R",
                "hrefs": [
                  "\u0441ontent/i205ddaa3-0c3e-4015-b814-bcfd45b83422/Content/book_1416/chapter_11997.html"
                ]
              },
              "children": []
            },
            {
              "id": "i8baaa418-dd6f-47c8-896b-af74433074e1",
              "title": "Phenolphthalein: Confirming that it IS blood",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i3243b1fa-b9cb-4475-b7f5-b3d97e2a84da_R",
              "resource": {
                "identifierRef": "i3243b1fa-b9cb-4475-b7f5-b3d97e2a84da_R",
                "hrefs": [
                  "\u0441ontent/ia75e99a0-4dca-4672-b2a6-7732eee561b9/Content/book_1416/chapter_12092.html"
                ]
              },
              "children": []
            },
            {
              "id": "ibea2612e-ac26-4e9f-8482-a8bfa67ed3fc",
              "title": "Blood Evidence - The Luminol Test",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i2473a472-7bf4-4ecc-a766-fd8319cb05d7_R",
              "resource": {
                "identifierRef": "i2473a472-7bf4-4ecc-a766-fd8319cb05d7_R",
                "hrefs": [
                  "\u0441ontent/ic6856f52-3e5a-447d-8054-f101d18b7e83/Content/book_1416/chapter_11998.html"
                ]
              },
              "children": []
            },
            {
              "id": "i3bbb0203-9471-4cd4-8e00-094950396fd0",
              "title": "Blood Splatter Evidence",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i559eaa3e-f43b-40fc-8e9c-e89fff7a733b_R",
              "resource": {
                "identifierRef": "i559eaa3e-f43b-40fc-8e9c-e89fff7a733b_R",
                "hrefs": [
                  "\u0441ontent/i7be4c40f-f204-43dd-abe1-ab2d1ce0d168/Content/book_1416/chapter_11999.html"
                ]
              },
              "children": []
            },
            {
              "id": "ia9959851-1614-46dc-a1fd-780244e0b8c4",
              "title": "Lesson 3 - Other Body Fluid Evidence",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i55542b45-084e-40be-83df-300b199e0de1_R",
              "resource": {
                "identifierRef": "i55542b45-084e-40be-83df-300b199e0de1_R",
                "hrefs": [
                  "\u0441ontent/id48e1acc-4b2a-454b-90ea-2b6e674c34b7/Content/book_1416/chapter_12000.html"
                ]
              },
              "children": []
            },
            {
              "id": "i236f879e-3feb-4667-89be-410c82757543",
              "title": "Other Body Fluid Evidence",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i2b4f1cd6-6653-4832-8487-a5d85dd094cc_R",
              "resource": {
                "identifierRef": "i2b4f1cd6-6653-4832-8487-a5d85dd094cc_R",
                "hrefs": [
                  "\u0441ontent/i0cf5b8a9-296e-4e86-999b-cc1b41e7bedb/Content/book_1416/chapter_12001.html"
                ]
              },
              "children": []
            },
            {
              "id": "ib7cb9b29-d15f-4746-b340-34156cb9c6c8",
              "title": "Semen",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i7b6115bd-759e-417d-96e5-427316491ecf_R",
              "resource": {
                "identifierRef": "i7b6115bd-759e-417d-96e5-427316491ecf_R",
                "hrefs": [
                  "\u0441ontent/i3797c9c5-f2ad-4efa-85f5-b8076db01e9f/Content/book_1416/chapter_12002.html"
                ]
              },
              "children": []
            },
            {
              "id": "i40e489d5-4dca-41da-a913-485b57695690",
              "title": "Sexual Assault (Rape) Kits",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i913e4725-c0ee-4cb3-8460-f1c48f351ebe_R",
              "resource": {
                "identifierRef": "i913e4725-c0ee-4cb3-8460-f1c48f351ebe_R",
                "hrefs": [
                  "\u0441ontent/if532604f-6158-49b3-b6d8-a62c92b9fa61/Content/book_1416/chapter_12003.html"
                ]
              },
              "children": []
            },
            {
              "id": "i77bd444a-2112-4a07-ad54-93a36b8401b9",
              "title": "Lesson 4 - Case Studies",
              "kind": "html",
              "depth": 2,
              "identifierRef": "ia634471d-25dd-4ffe-912a-b9f01eb892a4_R",
              "resource": {
                "identifierRef": "ia634471d-25dd-4ffe-912a-b9f01eb892a4_R",
                "hrefs": [
                  "\u0441ontent/idb2aad29-9fb4-49f3-b708-a4ab6cc8f3f7/Content/book_1416/chapter_12004.html"
                ]
              },
              "children": []
            },
            {
              "id": "i32897cf2-9a8a-4922-b4d0-1691a63fb4e2",
              "title": "Cases Involving Body Fluid Evidence",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i958a050a-cd7e-47b5-be39-0e355b154d82_R",
              "resource": {
                "identifierRef": "i958a050a-cd7e-47b5-be39-0e355b154d82_R",
                "hrefs": [
                  "\u0441ontent/id1c5d466-6de5-40d1-b769-f2ff1a8539da/Content/book_1416/chapter_12005.html"
                ]
              },
              "children": []
            },
            {
              "id": "i190ce663-f1c9-48d2-b7d1-19bf265e49e0",
              "title": "Historical Crime Case #1",
              "kind": "html",
              "depth": 2,
              "identifierRef": "if8a759b7-e5e9-46ad-a843-93cf5a93b665_R",
              "resource": {
                "identifierRef": "if8a759b7-e5e9-46ad-a843-93cf5a93b665_R",
                "hrefs": [
                  "\u0441ontent/i29afd473-aa24-4b9f-8e36-623197d67aae/Historical Crime Case 1.html"
                ]
              },
              "children": []
            },
            {
              "id": "ib2ecd5a9-c9f6-4796-9b3c-084f40096d5b",
              "title": "Historical Crime Case #2",
              "kind": "html",
              "depth": 2,
              "identifierRef": "ie8d603d1-5051-4c8c-b98a-1f5ddbe8322f_R",
              "resource": {
                "identifierRef": "ie8d603d1-5051-4c8c-b98a-1f5ddbe8322f_R",
                "hrefs": [
                  "\u0441ontent/if2691d26-8a13-400b-a2a9-5f2ce94b6451/Historical Crime Case 2.html"
                ]
              },
              "children": []
            },
            {
              "id": "i6ca4511a-7de5-4d6d-86e4-5311483b965d",
              "title": "Fictional Crime Case #1",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i7026667f-1290-4cfe-ba77-893a0685eb83_R",
              "resource": {
                "identifierRef": "i7026667f-1290-4cfe-ba77-893a0685eb83_R",
                "hrefs": [
                  "\u0441ontent/ia99eccc6-303b-41ad-b23c-79a8ac38bb7a/Content/book_1416/chapter_12006.html"
                ]
              },
              "children": []
            },
            {
              "id": "ie396a8c3-19cc-46b3-b107-1e3521a32e52",
              "title": "Fictional Crime Case #2",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i06374291-336b-4a56-a021-b1b24d4e10c4_R",
              "resource": {
                "identifierRef": "i06374291-336b-4a56-a021-b1b24d4e10c4_R",
                "hrefs": [
                  "\u0441ontent/i6225ab1a-cfcc-4c23-9234-75205f061981/Fictional Crime Case 2.html"
                ]
              },
              "children": []
            },
            {
              "id": "ibf949d55-b81b-4099-a96f-ca901c7bc859",
              "title": "What is Blood?",
              "kind": "html",
              "depth": 2,
              "identifierRef": "ie2b616e0-16eb-4633-af14-5c1d4720770a_R",
              "resource": {
                "identifierRef": "ie2b616e0-16eb-4633-af14-5c1d4720770a_R",
                "hrefs": [
                  "\u0441ontent/i828a8600-f807-4ec3-bb74-0b84f53999f5/Content/book_1416/chapter_12088.html"
                ]
              },
              "children": []
            },
            {
              "id": "i5ed42cdd-d044-4b4b-9503-56c79f36e465",
              "title": "Blood Types",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i3ae1f9b3-107e-42bc-9aae-50144d481f6f_R",
              "resource": {
                "identifierRef": "i3ae1f9b3-107e-42bc-9aae-50144d481f6f_R",
                "hrefs": [
                  "\u0441ontent/i9242df94-c9b7-489b-b1a6-57dc75d05f46/Content/book_1416/chapter_12089.html"
                ]
              },
              "children": []
            },
            {
              "id": "i5e715fc6-8cf0-46f4-8d5c-cee4fc30dce5",
              "title": "Identifying Blood Types",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i85edba16-f0c7-4c0e-b098-d6ca18d4c29a_R",
              "resource": {
                "identifierRef": "i85edba16-f0c7-4c0e-b098-d6ca18d4c29a_R",
                "hrefs": [
                  "\u0441ontent/i427da8fa-a34c-4cad-8a56-cac73b0234b8/Content/book_1416/chapter_12090.html"
                ]
              },
              "children": []
            },
            {
              "id": "icd07765e-4ff3-4daf-86d1-4832ad2482b4",
              "title": "Blood Typing in a Lab",
              "kind": "html",
              "depth": 2,
              "identifierRef": "idb79d5f7-ebfb-43fb-b5e1-b0ebf68ef3fa_R",
              "resource": {
                "identifierRef": "idb79d5f7-ebfb-43fb-b5e1-b0ebf68ef3fa_R",
                "hrefs": [
                  "\u0441ontent/i48ddaf17-e5b6-4a93-8959-251d8dc39ee2/Content/book_1416/chapter_12091.html"
                ]
              },
              "children": []
            },
            {
              "id": "i6891a99c-54ba-46c8-9879-0fde9d69a923",
              "title": "Unit Assessments",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i5f965f62-e7d7-4e38-b0a3-a0c57c124a05_R",
              "resource": {
                "identifierRef": "i5f965f62-e7d7-4e38-b0a3-a0c57c124a05_R",
                "hrefs": [
                  "\u0441ontent/i5888a0ec-c4ab-403d-a497-3448599b51ee/Content/book_1416/chapter_12265.html"
                ]
              },
              "children": []
            }
          ]
        }
      ]
    },
    {
      "id": "ife102be2-d324-438d-93bd-7b57b1a24c27",
      "title": "5 Forensic Detection of Impaired Driving",
      "kind": "module",
      "depth": 0,
      "children": [
        {
          "id": "i33e63085-dae2-41cc-a3f7-1a0a8ae53bc1",
          "title": "Forensic Detection of Impaired Driving",
          "kind": "html",
          "depth": 1,
          "identifierRef": "ie1714b63-ba3a-4d06-a5fc-ae603680f9c9_R",
          "resource": {
            "identifierRef": "ie1714b63-ba3a-4d06-a5fc-ae603680f9c9_R",
            "hrefs": [
              "\u0441ontent/i828b93d1-ea6b-427c-bde2-90c72532124b/Content/section_2945.html"
            ]
          },
          "children": []
        },
        {
          "id": "ic860eb8e-e4e6-4f27-ab65-bd7d6d49fef2",
          "title": "Impaired Driving Assignment",
          "kind": "assignment",
          "depth": 1,
          "identifierRef": "id2a49b3a-e5dd-4404-b13c-16650ade8d68_R",
          "resource": {
            "identifierRef": "id2a49b3a-e5dd-4404-b13c-16650ade8d68_R",
            "hrefs": [
              "assignment/i316fb168-8139-44c3-819d-919e8ff64c4f/assignment_cb1120b8-2590-498d-99d3-ad5d436c8b3f.xml"
            ]
          },
          "children": []
        },
        {
          "id": "i9d28e287-64f3-4166-a240-d818a548bab1",
          "title": "M5 Impaired Driving and Alcohol Assessment",
          "kind": "quiz",
          "depth": 1,
          "identifierRef": "ic00f9459-ea23-43cd-b4a2-0f4bd2f50d26_R",
          "resource": {
            "identifierRef": "ic00f9459-ea23-43cd-b4a2-0f4bd2f50d26_R",
            "hrefs": [
              "quiz/i720c105e-6226-41ad-a4da-7a6b22879680/qti_d0914048-cd17-42af-a699-a42dea600e08.xml"
            ]
          },
          "children": []
        },
        {
          "id": "ia3aade88-5edf-4551-9b35-29d2d8634d47",
          "title": "Forensic Detection of Impaired Driving",
          "kind": "folder",
          "depth": 1,
          "children": [
            {
              "id": "i2a3368bf-47cb-4d26-982d-28ca1a3ccf32",
              "title": "Forensic Detection of Impaired Driving",
              "kind": "html",
              "depth": 2,
              "identifierRef": "icac393a1-1532-49cd-93c7-f84c0dcadb05_R",
              "resource": {
                "identifierRef": "icac393a1-1532-49cd-93c7-f84c0dcadb05_R",
                "hrefs": [
                  "\u0441ontent/i18824365-5daf-43b4-868a-2443fe223d70/Content/book_1417/chapter_12007.html"
                ]
              },
              "children": []
            },
            {
              "id": "i82c0c4e2-d6b6-4ccf-a331-63c376ad7120",
              "title": "Lesson 1 Alcohol and its Effects Upon the Body",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i7bfdaebe-ea37-4c3b-8dde-43a52d6f7c5f_R",
              "resource": {
                "identifierRef": "i7bfdaebe-ea37-4c3b-8dde-43a52d6f7c5f_R",
                "hrefs": [
                  "\u0441ontent/icf90943a-6519-4195-81c6-97709fc6665f/Content/book_1417/chapter_12008.html"
                ]
              },
              "children": []
            },
            {
              "id": "i2b08dc3e-eed2-4044-9de7-dcfa0a554583",
              "title": "Scientifc Description of Alcohol",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i9c485c52-7bf5-44c2-a857-4ffcd32a6fef_R",
              "resource": {
                "identifierRef": "i9c485c52-7bf5-44c2-a857-4ffcd32a6fef_R",
                "hrefs": [
                  "\u0441ontent/i94056bde-11ed-48f9-aad5-0e89433d1c42/Content/book_1417/chapter_12009.html"
                ]
              },
              "children": []
            },
            {
              "id": "i8dc7b4b2-1f47-4e3b-889b-854f1b01a028",
              "title": "The Breakdown of Alcohol by the Body",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i7ded033e-007c-483b-8eec-1b6e61dc900c_R",
              "resource": {
                "identifierRef": "i7ded033e-007c-483b-8eec-1b6e61dc900c_R",
                "hrefs": [
                  "\u0441ontent/ib7ddc073-af51-4d55-af05-3050a838decd/Content/book_1417/chapter_12010.html"
                ]
              },
              "children": []
            },
            {
              "id": "ifd0882e9-e466-4ebe-915a-250d3a16f966",
              "title": "Behavioral Effects of Alcohol Consumption",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i2e91e393-dafc-436e-b827-859307a9a69a_R",
              "resource": {
                "identifierRef": "i2e91e393-dafc-436e-b827-859307a9a69a_R",
                "hrefs": [
                  "\u0441ontent/i308b5599-08d0-4eae-851b-a20de4c7a092/Content/book_1417/chapter_12011.html"
                ]
              },
              "children": []
            },
            {
              "id": "ie6f5a9b3-fc83-4396-b6de-635270750d90",
              "title": "The Drunkometer",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i203dac19-285c-4086-8e0a-793bca6c6409_R",
              "resource": {
                "identifierRef": "i203dac19-285c-4086-8e0a-793bca6c6409_R",
                "hrefs": [
                  "\u0441ontent/ie400334c-7162-4600-b3f3-f341d5dc39e3/Content/book_1417/chapter_12012.html"
                ]
              },
              "children": []
            },
            {
              "id": "i23acb7d3-78be-47a6-92f9-1fd57831bb63",
              "title": "Lesson 2 - The Breathalyzer",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i20d7a24f-ada5-487d-b5f2-a36db8e19f43_R",
              "resource": {
                "identifierRef": "i20d7a24f-ada5-487d-b5f2-a36db8e19f43_R",
                "hrefs": [
                  "\u0441ontent/i62193d4d-642f-42e4-9055-a182d989d8be/Content/book_1417/chapter_12013.html"
                ]
              },
              "children": []
            },
            {
              "id": "id653775b-8d57-4c58-be9a-0bdd58e7a2a6",
              "title": "The Breathalyzer",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i720bb18d-e1eb-4118-94d1-061e2745eadf_R",
              "resource": {
                "identifierRef": "i720bb18d-e1eb-4118-94d1-061e2745eadf_R",
                "hrefs": [
                  "\u0441ontent/i7c28a6cf-9418-4bcb-849b-8ae4d26e1ba3/Content/book_1417/chapter_12014.html"
                ]
              },
              "children": []
            },
            {
              "id": "ic5605436-2f8e-4ce3-8a8a-b96abe20893b",
              "title": "Determining BAC",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i4eeae54d-f10b-4146-9849-fc13420c3872_R",
              "resource": {
                "identifierRef": "i4eeae54d-f10b-4146-9849-fc13420c3872_R",
                "hrefs": [
                  "\u0441ontent/ie628f048-15ec-445c-adf8-77ff7c591aae/Content/book_1417/chapter_12015.html"
                ]
              },
              "children": []
            },
            {
              "id": "i8bc2feea-862d-4b83-9c79-4f084a43ccdc",
              "title": "Drawbacks to The Breathalyzer",
              "kind": "html",
              "depth": 2,
              "identifierRef": "if44dd7f3-38e7-4b55-9e78-f785615e3372_R",
              "resource": {
                "identifierRef": "if44dd7f3-38e7-4b55-9e78-f785615e3372_R",
                "hrefs": [
                  "\u0441ontent/ic28f2325-81d0-4f37-ad27-b7256b039ccb/Content/book_1417/chapter_12016.html"
                ]
              },
              "children": []
            },
            {
              "id": "ifec80eb7-abe0-4bec-ae2f-9cb0ec581ff1",
              "title": "The Intoxilyzer & Consequences of Impaired Driving",
              "kind": "html",
              "depth": 2,
              "identifierRef": "ida9099b2-fc2a-4e19-a0e1-59df119e06ec_R",
              "resource": {
                "identifierRef": "ida9099b2-fc2a-4e19-a0e1-59df119e06ec_R",
                "hrefs": [
                  "\u0441ontent/ib8d3d327-12ff-4bfd-82fd-b80ac6183481/Content/book_1417/chapter_12017.html"
                ]
              },
              "children": []
            },
            {
              "id": "i2f0c0a2a-1789-4978-bf9f-a393a2473b51",
              "title": "The Intoxilyzer",
              "kind": "html",
              "depth": 2,
              "identifierRef": "iaba8b4e6-3290-4757-9872-053285b0c997_R",
              "resource": {
                "identifierRef": "iaba8b4e6-3290-4757-9872-053285b0c997_R",
                "hrefs": [
                  "\u0441ontent/i6d24cb51-52f6-4a9b-8065-d30e619f26a6/Content/book_1417/chapter_12018.html"
                ]
              },
              "children": []
            },
            {
              "id": "ib8f798be-cc13-489e-a188-4cf60d1e4106",
              "title": "Operation of BAC Testing Devices",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i6eb182e0-0bf0-48e1-b697-eacfcf517d69_R",
              "resource": {
                "identifierRef": "i6eb182e0-0bf0-48e1-b697-eacfcf517d69_R",
                "hrefs": [
                  "\u0441ontent/i6cbc2e88-2f07-4d56-93f2-d921a0193630/Content/book_1417/chapter_12019.html"
                ]
              },
              "children": []
            },
            {
              "id": "ia7c70001-8fe3-411a-9db8-80e24b692ce1",
              "title": "Refusal to Provide a Breath Sample",
              "kind": "html",
              "depth": 2,
              "identifierRef": "ia5e9301b-e410-4934-bf5a-e98e0eba3d84_R",
              "resource": {
                "identifierRef": "ia5e9301b-e410-4934-bf5a-e98e0eba3d84_R",
                "hrefs": [
                  "\u0441ontent/i56adc209-55ac-4897-9106-b794a97c179d/Content/book_1417/chapter_12020.html"
                ]
              },
              "children": []
            },
            {
              "id": "i6174533b-0c9f-4e06-8249-185466ed3e1f",
              "title": "Lesson 4 - Criminal Cases Involving Impaired Driving",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i35af9480-2c1c-4277-9c32-e9d7fee32bd1_R",
              "resource": {
                "identifierRef": "i35af9480-2c1c-4277-9c32-e9d7fee32bd1_R",
                "hrefs": [
                  "\u0441ontent/i5e596270-8345-44b2-85ec-7f2112a41913/Content/book_1417/chapter_12021.html"
                ]
              },
              "children": []
            },
            {
              "id": "if1d015fc-d40c-4937-9b23-d8a48e377f73",
              "title": "The Drunken Russian Diplomat",
              "kind": "html",
              "depth": 2,
              "identifierRef": "ie90cb1f9-9604-406a-8710-3a20893efe7e_R",
              "resource": {
                "identifierRef": "ie90cb1f9-9604-406a-8710-3a20893efe7e_R",
                "hrefs": [
                  "\u0441ontent/i0216cc8c-cf1f-4893-aa90-74eb3b43fcda/Content/book_1417/chapter_12022.html"
                ]
              },
              "children": []
            },
            {
              "id": "i1ca4687a-d747-44ed-ab2e-ee81f18b5db0",
              "title": "The Death of Princess Diana",
              "kind": "html",
              "depth": 2,
              "identifierRef": "iadc85a4b-800a-41fe-8de7-cd045dac0c6b_R",
              "resource": {
                "identifierRef": "iadc85a4b-800a-41fe-8de7-cd045dac0c6b_R",
                "hrefs": [
                  "\u0441ontent/i2b5fcc4e-bc3b-4fed-ab4c-e39906258b3f/Content/book_1417/chapter_12023.html"
                ]
              },
              "children": []
            },
            {
              "id": "i8b619587-8182-42c3-9953-84404be9fecd",
              "title": "Unit Assessments",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i25145ab9-98d0-4148-adea-327375bd2d6d_R",
              "resource": {
                "identifierRef": "i25145ab9-98d0-4148-adea-327375bd2d6d_R",
                "hrefs": [
                  "\u0441ontent/ieca1c862-c709-473e-89df-73127a3c47e8/Content/book_1417/chapter_12266.html"
                ]
              },
              "children": []
            }
          ]
        }
      ]
    },
    {
      "id": "i10403f8a-20b2-468c-8b8c-fb9a5328a9bc",
      "title": "6 Polygraphing and Document Analysis",
      "kind": "module",
      "depth": 0,
      "children": [
        {
          "id": "i28f58d4e-408f-4fcd-ac74-ae9ae7ab0a97",
          "title": "Polygraphing and Forensic Writing Analysis Assignment",
          "kind": "assignment",
          "depth": 1,
          "identifierRef": "ief70a777-5de9-4616-9102-33b7799af1fb_R",
          "resource": {
            "identifierRef": "ief70a777-5de9-4616-9102-33b7799af1fb_R",
            "hrefs": [
              "assignment/i5416ee1b-c173-4bcc-80e8-e3c1fae36848/assignment_be6af394-1214-4204-8113-714364f1d5c9.xml"
            ]
          },
          "children": []
        },
        {
          "id": "i2b17b59b-4f80-476e-8983-c08839be1893",
          "title": "Polygraphing and Forensic Writing Case Studies Assignment",
          "kind": "assignment",
          "depth": 1,
          "identifierRef": "i9a9dd6fd-0f6a-4702-a904-6f6882738e49_R",
          "resource": {
            "identifierRef": "i9a9dd6fd-0f6a-4702-a904-6f6882738e49_R",
            "hrefs": [
              "assignment/i545d89a9-d9bd-4555-91b4-35ef6d318388/assignment_2ed7a9ba-d16e-4e5e-bdb0-61b4dd95bf84.xml"
            ]
          },
          "children": []
        },
        {
          "id": "icad04973-39d6-4778-83e6-e0f334adafe3",
          "title": "M6 The Polygraph and Writing Analysis Assessment",
          "kind": "quiz",
          "depth": 1,
          "identifierRef": "i16e388c7-dd47-434e-9d23-3ab5677bf427_R",
          "resource": {
            "identifierRef": "i16e388c7-dd47-434e-9d23-3ab5677bf427_R",
            "hrefs": [
              "quiz/ibae7c23f-6c67-4b1b-8b38-1501622aa4e6/qti_551f8e26-6682-4b3d-a8da-8e22ebdcf220.xml"
            ]
          },
          "children": []
        },
        {
          "id": "ibf9f696b-7ebc-4348-9905-696a9654685d",
          "title": "Polygraphing and Document Analysis",
          "kind": "folder",
          "depth": 1,
          "children": [
            {
              "id": "i152b409a-ea91-4ab2-b850-4642bc7f6d36",
              "title": "Polygraph Testing & Forensic Document Analysis",
              "kind": "html",
              "depth": 2,
              "identifierRef": "iedc24bbd-742f-4f85-bc5c-9b8d2f83c739_R",
              "resource": {
                "identifierRef": "iedc24bbd-742f-4f85-bc5c-9b8d2f83c739_R",
                "hrefs": [
                  "\u0441ontent/i21fc9773-877f-49ab-893d-c4f7c2c19448/Content/book_1418/chapter_12024.html"
                ]
              },
              "children": []
            },
            {
              "id": "ie4a5c05a-2261-4bfa-b514-10f913a2b702",
              "title": "Lesson 1 - The Polygraph Instrument",
              "kind": "html",
              "depth": 2,
              "identifierRef": "ia4a8f3bd-dbef-47f4-b5f4-f03d48b59566_R",
              "resource": {
                "identifierRef": "ia4a8f3bd-dbef-47f4-b5f4-f03d48b59566_R",
                "hrefs": [
                  "\u0441ontent/ia5c7c2b4-1e9b-4279-9c4e-efd45abb03ae/Content/book_1418/chapter_12025.html"
                ]
              },
              "children": []
            },
            {
              "id": "ic513ade1-d651-4e7c-a9c4-b4548ebc4106",
              "title": "The Human Nervous System",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i9abff1b5-0f29-4482-9145-a6f795731a6d_R",
              "resource": {
                "identifierRef": "i9abff1b5-0f29-4482-9145-a6f795731a6d_R",
                "hrefs": [
                  "\u0441ontent/ia2ca2ecb-3750-4094-9486-e6e0e2d522ea/Content/book_1418/chapter_12026.html"
                ]
              },
              "children": []
            },
            {
              "id": "i93a14c6f-1845-4b2a-ac62-e89e3ee9854f",
              "title": "The Sympathetic Nervous System",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i2bd67098-4622-478e-9138-601cecb5711d_R",
              "resource": {
                "identifierRef": "i2bd67098-4622-478e-9138-601cecb5711d_R",
                "hrefs": [
                  "\u0441ontent/ic94b2b09-e90f-495d-9084-0cb905e08fe8/Content/book_1418/chapter_12027.html"
                ]
              },
              "children": []
            },
            {
              "id": "i646d6543-46d6-42db-a139-255ae601dcb1",
              "title": "The Invention of the Polygraph",
              "kind": "html",
              "depth": 2,
              "identifierRef": "id6ff2cd8-6da6-40c2-a84b-a0629d5e7bdb_R",
              "resource": {
                "identifierRef": "id6ff2cd8-6da6-40c2-a84b-a0629d5e7bdb_R",
                "hrefs": [
                  "\u0441ontent/i38c48eab-1542-4f6d-8852-1d3643a3d094/Content/book_1418/chapter_12028.html"
                ]
              },
              "children": []
            },
            {
              "id": "i94bb5fae-f9de-4277-a4e2-4512dacf9829",
              "title": "Polograph Data",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i19d58e4a-7b57-4d75-888b-d7a181369b93_R",
              "resource": {
                "identifierRef": "i19d58e4a-7b57-4d75-888b-d7a181369b93_R",
                "hrefs": [
                  "\u0441ontent/ieede7310-7252-4ea7-b239-ae98402ce479/Content/book_1418/chapter_12029.html"
                ]
              },
              "children": []
            },
            {
              "id": "ibb4bd4dc-3feb-483a-99fc-838656e1998f",
              "title": "Lesson 2 - The Polygraph Exam",
              "kind": "html",
              "depth": 2,
              "identifierRef": "ifbcb047a-1e48-4cb4-97fa-004e22b05639_R",
              "resource": {
                "identifierRef": "ifbcb047a-1e48-4cb4-97fa-004e22b05639_R",
                "hrefs": [
                  "\u0441ontent/ieb74262a-13e6-4bcb-b504-562d8053d730/Content/book_1418/chapter_12030.html"
                ]
              },
              "children": []
            },
            {
              "id": "ifa7febe5-04b3-4457-89e8-e5cd0665f43d",
              "title": "Phases of the Exam",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i857dcda7-fef7-4b8c-b237-5fe135619aa3_R",
              "resource": {
                "identifierRef": "i857dcda7-fef7-4b8c-b237-5fe135619aa3_R",
                "hrefs": [
                  "\u0441ontent/i3ef76257-9096-4f62-8f92-b296e1386cc9/Content/book_1418/chapter_12031.html"
                ]
              },
              "children": []
            },
            {
              "id": "i42d027ae-cef3-4383-9a36-d4862c4e6ef0",
              "title": "Phases of the Exam II",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i9634a12e-3254-43b9-a9b9-c9e92d0f711b_R",
              "resource": {
                "identifierRef": "i9634a12e-3254-43b9-a9b9-c9e92d0f711b_R",
                "hrefs": [
                  "\u0441ontent/i8edf298b-e9ff-4bb0-89de-dbf1e5e2f7a4/Content/book_1418/chapter_12032.html"
                ]
              },
              "children": []
            },
            {
              "id": "id2c5c1a9-6ad2-4385-ba8d-ca6762fbb131",
              "title": "Polygraph Readings",
              "kind": "html",
              "depth": 2,
              "identifierRef": "id7c3f5c2-1d95-4429-9ef5-9e26651102d0_R",
              "resource": {
                "identifierRef": "id7c3f5c2-1d95-4429-9ef5-9e26651102d0_R",
                "hrefs": [
                  "\u0441ontent/i389226fa-4098-4e3b-8744-dffc641fac3a/Content/book_1418/chapter_12033.html"
                ]
              },
              "children": []
            },
            {
              "id": "i21302c7d-169a-4b50-bb27-3294b129f5b5",
              "title": "Polygraph Examinar Training",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i027746bd-e651-4b7e-a53f-3e8f52a19d8c_R",
              "resource": {
                "identifierRef": "i027746bd-e651-4b7e-a53f-3e8f52a19d8c_R",
                "hrefs": [
                  "\u0441ontent/i8c6713da-9c8b-41e3-8877-5889ba9d71a2/Content/book_1418/chapter_12034.html"
                ]
              },
              "children": []
            },
            {
              "id": "ic24d3403-6fec-4e2d-aa02-1e0e156496b7",
              "title": "Case Study - The JonBenet Ramsey Case",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i1a1298a8-2621-41f2-8d9b-1045a4526436_R",
              "resource": {
                "identifierRef": "i1a1298a8-2621-41f2-8d9b-1045a4526436_R",
                "hrefs": [
                  "\u0441ontent/i3c41cc47-cbc8-40f2-8763-d225cbee3378/Content/book_1418/chapter_12035.html"
                ]
              },
              "children": []
            },
            {
              "id": "i85f3a8ed-3124-48c8-8979-5cd61bf379e5",
              "title": "Lesson 3 - Forensic Writing Analysis",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i49d4ee1e-cb90-4fc7-bae8-32b829ac2de5_R",
              "resource": {
                "identifierRef": "i49d4ee1e-cb90-4fc7-bae8-32b829ac2de5_R",
                "hrefs": [
                  "\u0441ontent/i0f26b308-575d-4298-b45e-2b628913bd42/Content/book_1418/chapter_12036.html"
                ]
              },
              "children": []
            },
            {
              "id": "i20fa92a5-b5e3-4ac7-984e-79bef4233699",
              "title": "Graphology",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i864ded23-2ae0-491c-a714-b2f0aae5adab_R",
              "resource": {
                "identifierRef": "i864ded23-2ae0-491c-a714-b2f0aae5adab_R",
                "hrefs": [
                  "\u0441ontent/i88bfb601-8b90-4e70-beb3-9bbfc67f6212/Content/book_1418/chapter_12037.html"
                ]
              },
              "children": []
            },
            {
              "id": "i09e967d7-ebba-4282-89ec-e1e8586c6ddc",
              "title": "Writing Style",
              "kind": "html",
              "depth": 2,
              "identifierRef": "ia71d0c65-2af2-4ef7-b23d-019c977548da_R",
              "resource": {
                "identifierRef": "ia71d0c65-2af2-4ef7-b23d-019c977548da_R",
                "hrefs": [
                  "\u0441ontent/i6a149735-6b5b-48e0-a47a-95549fa6faa9/Content/book_1418/chapter_12038.html"
                ]
              },
              "children": []
            },
            {
              "id": "i1b5a467d-921a-4015-9836-90cdec917170",
              "title": "Document Criminal Profiling",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i7d56ebab-b131-4500-bddf-618956cffdd3_R",
              "resource": {
                "identifierRef": "i7d56ebab-b131-4500-bddf-618956cffdd3_R",
                "hrefs": [
                  "\u0441ontent/iebace7d3-648a-4ec1-a080-ddfcef46a54d/Content/book_1418/chapter_12039.html"
                ]
              },
              "children": []
            },
            {
              "id": "i4efea31a-0d5b-4386-a9ed-d0586e2fe1d3",
              "title": "Case Study - The 9/11 Letters",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i840d0a66-0d71-4701-8dca-e99f3a62b92a_R",
              "resource": {
                "identifierRef": "i840d0a66-0d71-4701-8dca-e99f3a62b92a_R",
                "hrefs": [
                  "\u0441ontent/i00a14084-6c73-4470-8732-7f5422e60dfe/Content/book_1418/chapter_12040.html"
                ]
              },
              "children": []
            },
            {
              "id": "i5d1e99cd-ace7-4d2f-a257-09d52e9a3afc",
              "title": "Chromatography",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i7a4fd071-c9c2-4b85-b33e-7a6cf6bdd538_R",
              "resource": {
                "identifierRef": "i7a4fd071-c9c2-4b85-b33e-7a6cf6bdd538_R",
                "hrefs": [
                  "\u0441ontent/i2bc0fb46-6a9c-45e6-9505-39ec39daa7cd/Content/book_1418/chapter_12041.html"
                ]
              },
              "children": []
            },
            {
              "id": "id766d846-6f1c-4d37-b9e0-af7cbfa7d983",
              "title": "Lesson 4 Polygraphing & Writing Analysis Case Studies",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i2e82967c-28ca-4513-8da6-2cbcc6dbf080_R",
              "resource": {
                "identifierRef": "i2e82967c-28ca-4513-8da6-2cbcc6dbf080_R",
                "hrefs": [
                  "\u0441ontent/i28f50839-9318-4d75-bd15-457ab3d3cc04/Content/book_1418/chapter_12042.html"
                ]
              },
              "children": []
            },
            {
              "id": "i9e086559-da88-4939-b1b9-56b2aa0c8d1e",
              "title": "Susan Smith",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i0ea5096e-356e-4d20-9f45-cfd6e2f85839_R",
              "resource": {
                "identifierRef": "i0ea5096e-356e-4d20-9f45-cfd6e2f85839_R",
                "hrefs": [
                  "\u0441ontent/i9de295d9-d55b-4a60-ac4a-1e9ca89e7f72/Content/book_1418/chapter_12043.html"
                ]
              },
              "children": []
            },
            {
              "id": "i8b641114-9993-4c14-be1c-d370a652aece",
              "title": "The Lindbergh Baby",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i4c326970-f6f9-4f0e-bf84-7aca1758ce5c_R",
              "resource": {
                "identifierRef": "i4c326970-f6f9-4f0e-bf84-7aca1758ce5c_R",
                "hrefs": [
                  "\u0441ontent/i7d5f46b8-ccf0-4b56-a4a6-c2c0fa7a94aa/Content/book_1418/chapter_12044.html"
                ]
              },
              "children": []
            },
            {
              "id": "i001473d9-09cc-4d36-90ef-92e5fe6cfab7",
              "title": "Unit Assessments",
              "kind": "html",
              "depth": 2,
              "identifierRef": "ib51f571d-2624-4dcd-9502-a3a9b5d439bb_R",
              "resource": {
                "identifierRef": "ib51f571d-2624-4dcd-9502-a3a9b5d439bb_R",
                "hrefs": [
                  "\u0441ontent/ie5b53cfb-42a4-4b54-9c00-95598a5e4fbf/Content/book_1418/chapter_12267.html"
                ]
              },
              "children": []
            }
          ]
        }
      ]
    },
    {
      "id": "i744be06f-bedc-4aeb-a959-f982bfa0e928",
      "title": "7 Forensic Genetics",
      "kind": "module",
      "depth": 0,
      "children": [
        {
          "id": "ibdccf79a-307d-4890-87df-9391e81ea330",
          "title": "Forensic DNA Evidence Assignment",
          "kind": "assignment",
          "depth": 1,
          "identifierRef": "id3354df4-298d-4bff-908f-3e4879e0c059_R",
          "resource": {
            "identifierRef": "id3354df4-298d-4bff-908f-3e4879e0c059_R",
            "hrefs": [
              "assignment/iab670b44-d54f-4cb2-b05f-3a4159f485cb/assignment_b6123174-aa7b-484e-a261-e2c6b8664d06.xml"
            ]
          },
          "children": []
        },
        {
          "id": "i86d8ded5-314d-47ff-bf2d-263f881c1b3c",
          "title": "M7 Forensic Genetics Assessment",
          "kind": "quiz",
          "depth": 1,
          "identifierRef": "i8cf2b025-fb09-4d27-8985-9b42463fc24e_R",
          "resource": {
            "identifierRef": "i8cf2b025-fb09-4d27-8985-9b42463fc24e_R",
            "hrefs": [
              "quiz/if2023d59-0710-42dd-b018-74b36116bbbc/qti_46edd57d-5104-4ccd-a042-91f57b9a12c2.xml"
            ]
          },
          "children": []
        },
        {
          "id": "ic31622c6-6311-46fe-99bd-f32c6240dc0d",
          "title": "Forensic Genetics",
          "kind": "folder",
          "depth": 1,
          "children": [
            {
              "id": "ia27ffb41-a84d-4ae6-9ede-ef0bc6aa3523",
              "title": "Forensic Genetics",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i8e89d5be-42d7-4206-8a4c-11dc9b28274a_R",
              "resource": {
                "identifierRef": "i8e89d5be-42d7-4206-8a4c-11dc9b28274a_R",
                "hrefs": [
                  "\u0441ontent/i5ab5b8bc-ea65-480c-9da5-effe6a5367a6/Content/book_1419/chapter_12045.html"
                ]
              },
              "children": []
            },
            {
              "id": "i699f20fd-0595-4266-b77b-7cadf2b64f50",
              "title": "Lesson 1 DNA",
              "kind": "html",
              "depth": 2,
              "identifierRef": "iec3752b6-92fc-4a21-b949-0662624680aa_R",
              "resource": {
                "identifierRef": "iec3752b6-92fc-4a21-b949-0662624680aa_R",
                "hrefs": [
                  "\u0441ontent/i5d4f2f7c-e59a-46c8-9c32-c75ed83f90e6/Content/book_1419/chapter_12046.html"
                ]
              },
              "children": []
            },
            {
              "id": "i9e3fcee3-43ab-48be-94bb-a8fee127cd9c",
              "title": "The Cell",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i061b9287-18e6-499a-b46b-61e2d8c21b48_R",
              "resource": {
                "identifierRef": "i061b9287-18e6-499a-b46b-61e2d8c21b48_R",
                "hrefs": [
                  "\u0441ontent/if7f77bcb-3fd8-4082-8c3f-1846bd6ab392/Content/book_1419/chapter_12047.html"
                ]
              },
              "children": []
            },
            {
              "id": "ie515d9ab-c167-404a-821f-7322f32b6e86",
              "title": "DNA",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i932ea864-38fe-4f20-b8a7-751341d307d7_R",
              "resource": {
                "identifierRef": "i932ea864-38fe-4f20-b8a7-751341d307d7_R",
                "hrefs": [
                  "\u0441ontent/i71043ac1-3088-4bee-bbd4-206b7b84385f/Content/book_1419/chapter_12048.html"
                ]
              },
              "children": []
            },
            {
              "id": "i15c25b4f-2232-4c28-a99c-cb86c8f40154",
              "title": "DNA Analysis",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i8a2068f2-f341-40ef-8700-9bf4bfa6499f_R",
              "resource": {
                "identifierRef": "i8a2068f2-f341-40ef-8700-9bf4bfa6499f_R",
                "hrefs": [
                  "\u0441ontent/i4f858c22-ca10-4f32-93ce-ceffae7d291a/Content/book_1419/chapter_12049.html"
                ]
              },
              "children": []
            },
            {
              "id": "i29333480-1510-422f-bca5-6463ba01af04",
              "title": "RFLP vs PCR",
              "kind": "html",
              "depth": 2,
              "identifierRef": "iefd4b1a1-3b51-4d2b-8b25-cc06619f3886_R",
              "resource": {
                "identifierRef": "iefd4b1a1-3b51-4d2b-8b25-cc06619f3886_R",
                "hrefs": [
                  "\u0441ontent/i0f9723f9-0ae9-4109-a1ef-5ff80cae7681/Content/book_1419/chapter_12050.html"
                ]
              },
              "children": []
            },
            {
              "id": "i48bf5822-254b-44b3-b7b1-4eb518c89682",
              "title": "RFLP Step-by-Step",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i4416aec6-832b-4a63-85ef-abc58d960d88_R",
              "resource": {
                "identifierRef": "i4416aec6-832b-4a63-85ef-abc58d960d88_R",
                "hrefs": [
                  "\u0441ontent/i9af372bf-bd8b-4b30-bfb5-f143a26fd95a/Content/book_1419/chapter_12051.html"
                ]
              },
              "children": []
            },
            {
              "id": "i6ead9656-6d03-4ffd-9188-1185cbb484be",
              "title": "Lesson 2 mtDNA",
              "kind": "html",
              "depth": 2,
              "identifierRef": "ib9979f3b-6135-4bbe-982b-c18a49509f02_R",
              "resource": {
                "identifierRef": "ib9979f3b-6135-4bbe-982b-c18a49509f02_R",
                "hrefs": [
                  "\u0441ontent/i17dc985a-a256-48e6-ac53-7d6e6be9945e/Content/book_1419/chapter_12052.html"
                ]
              },
              "children": []
            },
            {
              "id": "iede6e816-e881-4b3e-8f09-f94ad54e314c",
              "title": "Mitochondrial DNA",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i9054667f-373a-46df-be7c-a4676bb23ad9_R",
              "resource": {
                "identifierRef": "i9054667f-373a-46df-be7c-a4676bb23ad9_R",
                "hrefs": [
                  "\u0441ontent/i148eaf13-e685-4f16-b445-643f7511fbf0/Content/book_1419/chapter_12053.html"
                ]
              },
              "children": []
            },
            {
              "id": "i5130b58c-5934-4e1b-8e08-dacb591b976c",
              "title": "mtDNA vs. nuclear DNA",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i903ab2b9-fb08-458b-8b33-5d7e7a275d66_R",
              "resource": {
                "identifierRef": "i903ab2b9-fb08-458b-8b33-5d7e7a275d66_R",
                "hrefs": [
                  "\u0441ontent/ic0d89ebf-700c-4baa-a78d-5f8f50f59d3c/Content/book_1419/chapter_12054.html"
                ]
              },
              "children": []
            },
            {
              "id": "id8a4ee3b-6f38-41db-ae76-fd0c2f8c9864",
              "title": "Case Study - Unknown Soldiers",
              "kind": "html",
              "depth": 2,
              "identifierRef": "ic2ca4ca0-d2f2-4652-b2c2-82d9f6f20d55_R",
              "resource": {
                "identifierRef": "ic2ca4ca0-d2f2-4652-b2c2-82d9f6f20d55_R",
                "hrefs": [
                  "\u0441ontent/i864f0f6f-54b2-4d9d-aae2-cc3872177ec8/Content/book_1419/chapter_12055.html"
                ]
              },
              "children": []
            },
            {
              "id": "i941ac936-af73-41f4-b66e-5afe2f84795c",
              "title": "Case Study: 9-11",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i13fca346-3a28-4939-8757-26c5f3eb0903_R",
              "resource": {
                "identifierRef": "i13fca346-3a28-4939-8757-26c5f3eb0903_R",
                "hrefs": [
                  "\u0441ontent/i16157390-e22b-49f6-b519-ab6887cba9b3/Content/book_1419/chapter_12056.html"
                ]
              },
              "children": []
            },
            {
              "id": "i8a71a99c-4314-486a-8cf7-433f5fe5a7df",
              "title": "Lesson 3 - DNA Profiling and Population Frequency",
              "kind": "html",
              "depth": 2,
              "identifierRef": "ib1a3c9d5-3d3c-47e7-a31a-4382bb207404_R",
              "resource": {
                "identifierRef": "ib1a3c9d5-3d3c-47e7-a31a-4382bb207404_R",
                "hrefs": [
                  "\u0441ontent/i533446d7-727a-47e8-80c9-77dec9de40e8/Content/book_1419/chapter_12057.html"
                ]
              },
              "children": []
            },
            {
              "id": "if95855d4-2528-499d-88e6-4713f1865135",
              "title": "Population Frequency",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i29ff042b-27c0-4625-92cb-42cac081701d_R",
              "resource": {
                "identifierRef": "i29ff042b-27c0-4625-92cb-42cac081701d_R",
                "hrefs": [
                  "\u0441ontent/ida124b68-5b7d-43eb-aa93-2ca97b516eb9/Content/book_1419/chapter_12058.html"
                ]
              },
              "children": []
            },
            {
              "id": "i374a9770-41ea-4526-af99-03173651dc2f",
              "title": "Probability Ratios",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i6499942d-a0a9-4291-8d1a-e140a37e5d66_R",
              "resource": {
                "identifierRef": "i6499942d-a0a9-4291-8d1a-e140a37e5d66_R",
                "hrefs": [
                  "\u0441ontent/iff6599cd-22b5-4ddb-9dd8-588b092451ba/Content/book_1419/chapter_12059.html"
                ]
              },
              "children": []
            },
            {
              "id": "ieeec08ce-43e6-4f35-ab5d-725eeeee883c",
              "title": "DNA Matching",
              "kind": "html",
              "depth": 2,
              "identifierRef": "iebaeef10-13c4-4167-8fa8-bf14df8e8c24_R",
              "resource": {
                "identifierRef": "iebaeef10-13c4-4167-8fa8-bf14df8e8c24_R",
                "hrefs": [
                  "\u0441ontent/i72306f28-aaf6-4150-a663-00ad493b2588/Content/book_1419/chapter_12060.html"
                ]
              },
              "children": []
            },
            {
              "id": "i0768bd9a-9aee-4de7-bba8-380a113f6d02",
              "title": "DNA & The Law",
              "kind": "html",
              "depth": 2,
              "identifierRef": "i953da15a-a1ed-4824-822e-548075b6a702_R",
              "resource": {
                "identifierRef": "i953da15a-a1ed-4824-822e-548075b6a702_R",
                "hrefs": [
                  "\u0441ontent/i73921e7a-03fe-4d7e-991e-0209b5fd9ec8/Content/book_1419/chapter_12061.html"
                ]
              },
              "children": []
            },
            {
              "id": "i03999c9b-d045-4bd5-a0a9-9aaf4b6654e7",
              "title": "Case Study - OJ Simpson",
              "kind": "html",
              "depth": 2,
              "identifierRef": "id323b870-6e36-407a-99f6-d7c9ec8c89a5_R",
              "resource": {
                "identifierRef": "id323b870-6e36-407a-99f6-d7c9ec8c89a5_R",
                "hrefs": [
                  "\u0441ontent/i42d255ea-4a86-47e1-9752-2824b5a18232/Content/book_1419/chapter_12062.html"
                ]
              },
              "children": []
            },
            {
              "id": "i34457469-131a-4633-a3b4-72f724968929",
              "title": "Lesson 4 - Forensic Genetics Case Studies",
              "kind": "html",
              "depth": 2,
              "identifierRef": "iff42d57a-bb7f-437d-afa6-fca9bc61244d_R",
              "resource": {
                "identifierRef": "iff42d57a-bb7f-437d-afa6-fca9bc61244d_R",
                "hrefs": [
                  "\u0441ontent/id02bf765-6520-4f5c-8952-f223950c5123/Content/book_1419/chapter_12063.html"
                ]
              },
              "children": []
            },
            {
              "id": "i8c5491e0-81f6-43a8-b04a-0189102cf190",
              "title": "Punky Gustavson",
              "kind": "html",
              "depth": 2,
              "identifierRef": "ief4c7bd9-bfd5-47e6-8c7d-5e5aeeae6569_R",
              "resource": {
                "identifierRef": "ief4c7bd9-bfd5-47e6-8c7d-5e5aeeae6569_R",
                "hrefs": [
                  "\u0441ontent/i2d953e88-05b7-46e8-ab99-8bbdc6aa7e88/Content/book_1419/chapter_12064.html"
                ]
              },
              "children": []
            },
            {
              "id": "i2a2d8f2a-b2db-4459-9b5f-23dd065f3d7e",
              "title": "A Case of Wrongful Conviction",
              "kind": "html",
              "depth": 2,
              "identifierRef": "ibd525447-e193-4018-adcd-12c236002940_R",
              "resource": {
                "identifierRef": "ibd525447-e193-4018-adcd-12c236002940_R",
                "hrefs": [
                  "\u0441ontent/i8fca4d43-9030-4991-9ce9-e078260f3c51/Content/book_1419/chapter_12065.html"
                ]
              },
              "children": []
            },
            {
              "id": "i479e1855-9f92-43e6-aaf6-c9767874f48f",
              "title": "Unit Assessments",
              "kind": "html",
              "depth": 2,
              "identifierRef": "ibbc5631f-6beb-4260-b4e9-e6de25dc60c8_R",
              "resource": {
                "identifierRef": "ibbc5631f-6beb-4260-b4e9-e6de25dc60c8_R",
                "hrefs": [
                  "\u0441ontent/i00aa5552-393f-4865-a8aa-b1cc8ab39953/Content/book_1419/chapter_12268.html"
                ]
              },
              "children": []
            }
          ]
        }
      ]
    },
    {
      "id": "i76f36ae7-4dfa-4a4c-b6bc-cf2cf066a2da",
      "title": "8 Careers in Forensic Science",
      "kind": "module",
      "depth": 0,
      "children": [
        {
          "id": "i8708b7ac-9c45-49fe-a9cf-cde5c14d53d4",
          "title": "Careers in Forensic Science Assignment",
          "kind": "assignment",
          "depth": 1,
          "identifierRef": "i7b8973b9-b4cd-4cf8-b888-df6d273753b0_R",
          "resource": {
            "identifierRef": "i7b8973b9-b4cd-4cf8-b888-df6d273753b0_R",
            "hrefs": [
              "assignment/i24fee453-9acd-4444-8071-e09f3820538b/assignment_08f87e49-036a-44cd-83ce-c62f268fd692.xml"
            ]
          },
          "children": []
        },
        {
          "id": "ic0c05870-9869-4108-bef1-79ac92d0862d",
          "title": "Careers in Forensic Science",
          "kind": "lesson",
          "depth": 1,
          "children": []
        }
      ]
    },
    {
      "id": "i83a6cafa-5fc7-400f-b391-32a704f33bd1",
      "title": "FINAL EXAM",
      "kind": "module",
      "depth": 0,
      "children": [
        {
          "id": "i64fca951-f77a-48d0-a583-0e59c608e561",
          "title": "Final Exam",
          "kind": "quiz",
          "depth": 1,
          "identifierRef": "ia12fd0f7-b6b5-4c2d-86a5-962a7ee76f85_R",
          "resource": {
            "identifierRef": "ia12fd0f7-b6b5-4c2d-86a5-962a7ee76f85_R",
            "hrefs": [
              "quiz/iff8bcc71-7b4c-4375-97b0-34578e035807/qti_4632d8f3-6ca3-4b63-b1da-7529406b7280.xml"
            ]
          },
          "children": []
        },
        {
          "id": "i1814558a-4b52-477e-9d2a-6dc6e2a1abe8",
          "title": "Final Exam Instructions",
          "kind": "lesson",
          "depth": 1,
          "children": []
        }
      ]
    },
    {
      "id": "iee0264ff-100f-4543-9003-b1a3625c56e2",
      "title": "Extra Credits",
      "kind": "module",
      "depth": 0,
      "children": [
        {
          "id": "i71d5f8f5-d477-46f5-a52d-db5b80892052",
          "title": "Student Centred Learning Self Reflection",
          "kind": "quiz",
          "depth": 1,
          "identifierRef": "iabd09d7a-56de-480b-a5be-a2c673faffbc_R",
          "resource": {
            "identifierRef": "iabd09d7a-56de-480b-a5be-a2c673faffbc_R",
            "hrefs": [
              "quiz/if6c0c29f-ed1a-455a-bc1b-2d0cf76d2723/qti_8b1686f5-fbce-4017-9acf-5954776ae9e7.xml"
            ]
          },
          "children": []
        }
      ]
    },
    {
      "id": "id3fcf94d-6bad-4431-92a2-a163243cac4b",
      "title": "Teacher Resources (KEEP HIDDEN)",
      "kind": "module",
      "depth": 0,
      "children": [
        {
          "id": "iab8d080b-5ae5-489e-8d12-4818e7304517",
          "title": "Forensic Science 25 Answer Keys",
          "kind": "pdf",
          "depth": 1,
          "identifierRef": "i11a1c4a8-757c-4946-827a-e8a102e7aa4c_R",
          "resource": {
            "identifierRef": "i11a1c4a8-757c-4946-827a-e8a102e7aa4c_R",
            "hrefs": [
              "\u0441ontent/ie0299797-cf54-494f-af1d-80d66242ee26/Forensic Science 25 Answer Keys.pdf"
            ]
          },
          "children": []
        }
      ]
    }
  ]
};
var d2l_map_data_default = d2lCourseMapData;

// projects/forensics/workspace/main.jsx
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
var actualHtmlSamples = {
  citeSources: `
    <div class="lesson-html">
      <h1>When asked to provide your sources use the following link to help you cite using APA or MLA formats:</h1>
      <div class="image-banner">Exported image banner preserved here in the real build</div>
      <p><strong>External citation helper:</strong> EasyBib / Chegg citation guidance link</p>
    </div>
  `,
  evidenceOverview: `
    <div class="lesson-html">
      <h3>Module Overview</h3>
      <h2>Types of Evidence &amp; Fingerprint Analysis</h2>
      <p>A person cannot be convicted of a crime simply because the police believe that he or she is guilty. The only way to convict a person successfully of a criminal act is by obtaining evidence that proves the individual committed the crime. This is known as the burden of proof.</p>
      <p>Fingerprint collection and fingerprint pattern analysis have been used to apprehend and convict criminals for over 100 years. Because individual fingerprint patterns are unique, fingerprints distinguish one person from another.</p>
      <ul>
        <li>introduce two categories of physical evidence with examples of each type</li>
        <li>explain the cause of and types of fingerprint patterns</li>
        <li>explain techniques used to enhance hidden fingerprints</li>
        <li>examine historical and fictional criminal investigations</li>
      </ul>
    </div>
  `,
  evidenceTypes: `
    <div class="lesson-html">
      <h2>Identified Evidence and Individualized Evidence</h2>
      <p>Physical evidence from a crime scene comes in many different forms, such as fingerprints, hair, blood, saliva, semen, skin, bone, bullet casings, paint fragments, and fibers.</p>
      <p>Finding and interpreting physical evidence is crucial because it can prove that a crime has been committed, establish the identity of suspects, exonerate the innocent, corroborate testimony, and be more reliable than eyewitness evidence.</p>
      <table>
        <thead>
          <tr><th>Individualized Physical Evidence</th><th>Identified Physical Evidence</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>Unique and directly linked to a specific person or source. Examples: fingerprints, DNA, bullet casings, dental impressions.</td>
            <td>Shares a common source or class. Examples: clothing, shoe prints, blood type, paint chips.</td>
          </tr>
        </tbody>
      </table>
    </div>
  `
};
var courseSeed = {
  title: "Forensic Studies 25",
  subtitle: "Course content mapped from the Brightspace export",
  stats: { topLevelSections: 12, totalNodes: 172 },
  modules: [
    {
      id: "course-info",
      title: "Course Information",
      lessonCount: 2,
      lessons: [
        {
          id: "outline",
          title: "Course outline (MUST READ)",
          type: "pdf",
          sourceFile: "\u0441ontent/idd074817-3b63-4e7f-b095-637a00ea461e/FS25 outline (summer school).pdf",
          pdfMeta: { pages: 14, size: "652 KB" },
          learn: {
            heading: "Course outline (MUST READ)",
            excerpt: "This source exports as a PDF. In the real player this opens inside an in-app PDF viewer instead of throwing students into a detached file download.",
            bullets: [
              "Preserve PDF inside the lesson shell",
              "Show page navigation and zoom",
              "Keep previous/next navigation around the PDF",
              "Avoid breaking the course flow"
            ],
            callout: "Static source files should stay integrated into the course experience instead of becoming detached downloads."
          },
          resources: ["Original PDF source", "Course shell metadata"]
        },
        {
          id: "cite",
          title: "How to Properly Cite Sources",
          type: "html-reading",
          sourceFile: "\u0441ontent/i0d0b4605-e0e8-481c-84d0-9813d78b146d/How to Properly Cite Sources.html",
          htmlSample: actualHtmlSamples.citeSources,
          learn: {
            heading: "How to Properly Cite Sources",
            excerpt: "The exported file is a simple HTML page with supporting images and an external citation resource.",
            bullets: [
              "Simple HTML reading page",
              "Uses supporting images",
              "Includes an external citation help link",
              "Needs modern spacing and image treatment"
            ],
            callout: "This is the kind of page builders oversimplify when they should just render it cleanly."
          },
          resources: ["Original HTML page", "External citation help link"]
        }
      ]
    },
    {
      id: "m2-evidence-fingerprints",
      title: "2 Types of Evidence and Fingerprint Analysis",
      lessonCount: 22,
      lessons: [
        {
          id: "overview",
          title: "Types of Evidence and Fingerprint Analysis",
          type: "html-reading",
          sourceFile: "\u0441ontent/i2fbe29e6-e968-4c68-8cd5-dde0abd398b1/Content/book_1412/chapter_11952.html",
          htmlSample: actualHtmlSamples.evidenceOverview,
          learn: {
            heading: "Types of Evidence & Fingerprint Analysis",
            excerpt: "This is a text-rich lesson, not just a slide. The player needs to preserve the reading and make it easier to navigate.",
            bullets: [
              "Burden of proof",
              "Physical evidence matters",
              "Fingerprinting has long investigative value",
              "Text-rich lesson that should stay intact"
            ],
            callout: "This is exactly the kind of lesson AI builders butcher when they start summarizing."
          },
          resources: ["Original HTML reading", "Fingerprint analysis sequence"]
        },
        {
          id: "evidence-types",
          title: "Evidence Types",
          type: "html-reading",
          sourceFile: "\u0441ontent/i01a08fc7-ba72-40e7-83cd-07fe01d50d49/Content/book_1412/chapter_11953.html",
          htmlSample: actualHtmlSamples.evidenceTypes,
          learn: {
            heading: "Identified Evidence and Individualized Evidence",
            excerpt: "The lesson lists examples such as fingerprints, hair, blood, saliva, semen, skin, bone, bullet casings, paint fragments, and fibres, and explains why interpreting evidence matters.",
            bullets: [
              "Evidence categories",
              "Examples of physical evidence",
              "Interpretation matters",
              "Strong candidate for glossary support"
            ],
            callout: "This should become easier to compare, not shorter."
          },
          resources: ["Original HTML page", "Evidence sorting practice"]
        },
        {
          id: "assignment",
          title: "Types of Evidence and Fingerprint Analysis Assignment",
          type: "assignment",
          sourceFile: "assignment/i0073cf68-ef89-4190-b368-d429ee0816f0/assignment_80f86dff-581e-4e9f-abe9-d5407d926f3f.xml",
          assignmentMeta: { points: 20, submissionType: "file upload" },
          assignmentXml: {
            intro: "After a crime has occurred, criminal investigators use scientific techniques and/or forensic science experts to help identify and interpret physical evidence from the crime scene.",
            individualized: "Individualized Physical Evidence is unique and can be directly linked to a specific person and/or source. Examples: fingerprints, DNA, bullets, dental impressions.",
            identified: "Identified Physical Evidence shares a common source and can be grouped into a class of items having similar properties. Examples: clothing, shoe prints, blood type.",
            task: "Complete the assignment, make your own copy of the linked document, add your name, and submit the file below.",
            reminder: "If you need a refresher on submissions, use the Course Information section."
          },
          resources: ["Assignment XML", "Submission workflow"]
        },
        {
          id: "assessment",
          title: "M2 Types of Evidence and Fingerprint Analysis Assessment",
          type: "quiz",
          sourceFile: "quiz/i0649d126-890d-4d3e-b83f-c563065521db/qti_c38fc56d-87c6-481d-958a-c13ba81b9304.xml",
          quizMeta: { attempts: 1, timeLimitMinutes: 120, profile: "Examination" },
          quizSample: {
            question: "Which of the following is an identified piece of physical evidence?",
            choices: ["Blood type", "Bullet casings", "Nuclear DNA", "Fingerprint impression"],
            answerIndex: 0
          },
          resources: ["QTI XML", "Assessment settings"]
        },
        {
          id: "slide",
          title: "Brief History of Fingerprinting",
          type: "image-slide",
          sourceFile: "\u0441ontent/ided21828-5e62-49a3-aae1-6cf000ed83f6/Content/book_1412/chapter_11957.html",
          learn: {
            heading: "Brief History of Fingerprinting",
            excerpt: "This lesson appears in the fingerprint sequence and should flow into pattern types, matching logic, and case studies.",
            bullets: [
              "Belongs in fingerprint learning arc",
              "Would benefit from a timeline treatment",
              "Should connect to later case studies",
              "Media-first presentation"
            ],
            callout: "History content gets lost when builders flatten modules."
          },
          resources: ["Original source file", "Fingerprint sequence map"]
        },
        {
          id: "video",
          title: "Real Life CSI - Crime Scene Cleaners",
          type: "embedded-video",
          sourceFile: "\u0441ontent/i145c4276-895a-4176-b79e-d1ff5e43abab/Content/book_1408/chapter_11883.html",
          learn: {
            heading: "Real Life CSI - Crime Scene Cleaners",
            excerpt: "Video nodes should keep transcript links, surrounding lesson notes, and next-step navigation visible.",
            bullets: [
              "Responsive embed",
              "Keep video in shell",
              "Keep transcript and notes nearby",
              "Do not detach media from module flow"
            ],
            callout: "Video pages should not become awkward dead-end wrappers."
          },
          resources: ["Embedded media page", "Related lesson notes"]
        }
      ]
    }
  ]
};
function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-");
}
function flattenCourseNodes(nodes) {
  const results = [];
  for (const node of nodes || []) {
    if (node.resource?.hrefs?.length) {
      results.push(node);
    }
    if (node.children?.length) {
      results.push(...flattenCourseNodes(node.children));
    }
  }
  return results;
}
function mapKindToLessonType(kind, sourceFile, title) {
  const normalizedTitle = String(title || "");
  if (kind === "assignment" || sourceFile?.includes("/assignment/")) return "assignment";
  if (kind === "quiz" || sourceFile?.includes("/quiz/") || sourceFile?.includes("qti_")) return "quiz";
  if (kind === "pdf" || sourceFile?.toLowerCase().endsWith(".pdf")) return "pdf";
  if (/real life csi|documentary|video|youtube|vimeo/i.test(normalizedTitle)) return "embedded-video";
  if (/slide|photo|image|gallery/i.test(normalizedTitle)) return "image-slide";
  if (kind === "html" || sourceFile?.toLowerCase().endsWith(".html") || sourceFile?.toLowerCase().endsWith(".htm")) return "html-reading";
  return "html-reading";
}
function isHiddenLabel(value) {
  const label = String(value || "").toLowerCase();
  return label.includes("keep hidden") || label.includes("teacher resources") || label.includes("instructor only");
}
function buildCourseFromD2LMap(seed, d2lMap) {
  if (!d2lMap?.modules?.length) {
    return seed;
  }
  const seededLessons = seed.modules.flatMap((module) => module.lessons);
  const seededBySource = new Map(
    seededLessons.filter((lesson) => lesson.sourceFile).map((lesson) => [lesson.sourceFile, lesson])
  );
  const seededByTitle = new Map(
    seededLessons.map((lesson) => [lesson.title.trim().toLowerCase(), lesson])
  );
  const modules = (d2lMap.modules || []).map((moduleNode) => {
    const moduleHidden = isHiddenLabel(moduleNode.title);
    const leaves = flattenCourseNodes(moduleNode.children);
    const isCourseInfoModule = (moduleNode.title || "").trim().toLowerCase() === "course information";
    const courseInfoExcludedTitles = /* @__PURE__ */ new Set([
      "assignment submission",
      "enabling brightspace notifications"
    ]);
    const filteredLeaves = leaves.filter((node) => {
      if (!isCourseInfoModule) return true;
      const title = (node.title || "").trim().toLowerCase();
      return !courseInfoExcludedTitles.has(title);
    });
    const lessons = filteredLeaves.map((node, index) => {
      const sourceFile = node.resource?.hrefs?.[0] ?? "";
      const seeded = seededBySource.get(sourceFile) ?? seededByTitle.get((node.title || "").trim().toLowerCase());
      const type = mapKindToLessonType(node.kind, sourceFile, node.title);
      const id = slugify(node.id || `${moduleNode.id}-${index}-${node.title}`);
      const lessonHidden = moduleHidden || isHiddenLabel(node.title);
      if (seeded) {
        return {
          ...seeded,
          id,
          title: node.title || seeded.title,
          type: seeded.type || type,
          sourceFile: sourceFile || seeded.sourceFile,
          resources: seeded.resources?.length ? seeded.resources : sourceFile ? [sourceFile] : [],
          isHidden: lessonHidden
        };
      }
      return {
        id,
        title: node.title || `Lesson ${index + 1}`,
        type,
        sourceFile: sourceFile || `manifest:${node.id}`,
        resources: sourceFile ? [sourceFile] : [],
        isHidden: lessonHidden,
        learn: {
          heading: node.title || `Lesson ${index + 1}`,
          excerpt: "Mapped from the D2L manifest hierarchy. This node is included in the shell so navigation follows the real course sequence.",
          bullets: [
            "Manifest-derived lesson title",
            "Source path preserved for traceability",
            "Supports richer renderer mappings when available"
          ],
          callout: "This lesson is mapped from the course manifest with normalized module and lesson labels."
        }
      };
    });
    return {
      id: slugify(moduleNode.id || moduleNode.title || "module"),
      title: moduleNode.title,
      lessonCount: lessons.length,
      isHidden: moduleHidden,
      lessons
    };
  }).filter((module) => module.lessons.length > 0);
  if (!modules.length) {
    return seed;
  }
  return {
    title: "Forensic Studies 25",
    subtitle: `Course content (${d2lMap.courseTitle})`,
    stats: {
      topLevelSections: d2lMap.summary?.moduleCount ?? modules.length,
      totalNodes: d2lMap.summary?.itemCount ?? modules.reduce((sum, module) => sum + module.lessons.length, 0)
    },
    modules
  };
}
var course = buildCourseFromD2LMap(courseSeed, d2l_map_data_default);
var resolvedCourse = course ?? courseSeed;
var resolvedModules = resolvedCourse.modules?.length ? resolvedCourse.modules : courseSeed.modules;
var flatLessons = resolvedModules.flatMap(
  (module) => module.lessons.map((lesson) => ({
    ...lesson,
    moduleId: module.id,
    moduleTitle: module.title,
    moduleLessonCount: module.lessonCount
  }))
);
function normalizePath(path) {
  return String(path || "").replace(/\\/g, "/").replace(/^\/+/, "").replace(/\/{2,}/g, "/");
}
function stripQueryAndHash(pathValue) {
  return String(pathValue || "").split("#")[0].split("?")[0];
}
function decodePathValue(pathValue) {
  const stripped = stripQueryAndHash(pathValue);
  let decoded = stripped;
  try {
    decoded = decodeURIComponent(stripped);
  } catch {
    decoded = stripped;
  }
  return decoded.replace(/\\\\/g, "/").split("/").map((part) => {
    try {
      return decodeURIComponent(part);
    } catch {
      return part;
    }
  }).join("/");
}
function joinPath(base, next) {
  if (!base) return normalizePath(next);
  if (!next) return normalizePath(base);
  return normalizePath(`${base.replace(/\/+$/, "")}/${next.replace(/^\/+/, "")}`);
}
function dirname(path) {
  const normalized = normalizePath(path);
  const index = normalized.lastIndexOf("/");
  return index === -1 ? "" : normalized.slice(0, index);
}
function resolveRelativePath(baseFile, relativeValue) {
  if (!relativeValue) return relativeValue;
  if (/^(https?:|data:|#|mailto:|tel:)/i.test(relativeValue)) return relativeValue;
  const decodedRelative = decodePathValue(relativeValue);
  if (decodedRelative.startsWith("/")) return decodedRelative;
  const baseDir = dirname(baseFile);
  const combined = joinPath(baseDir, decodedRelative);
  const parts = [];
  for (const part of combined.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") {
      parts.pop();
      continue;
    }
    parts.push(part);
  }
  return parts.join("/");
}
function encodePath(path) {
  return normalizePath(path).split("/").map((part) => encodeURIComponent(part)).join("/");
}
function buildReferenceUrl(relativePath) {
  return `/preview/references/raw/forensics/${encodePath(relativePath)}`;
}
function buildWorkspaceAssetUrl(relativePath) {
  return `/preview/workspace/forensics/${encodePath(relativePath)}`;
}
var module4RemoteImageFallbacks = {
  "https://lh4.googleusercontent.com/mwvzxUf61aqdm9oG9VyiGdKou-VQ2yHvqtFDv6rJT9lgiNDEOhwvS2rHpeSWwBtmKhimbxnLOPTOjHx7_JBnMDMJBFuozH4mS0chn5BF4uQMRbkyn4j1DGPaWhCdK4DJghQ6TBo-eZKgBPjbBQ": "\u0441ontent/i2ce3b936-b6db-4d86-9174-1bfa407805e8/Content/Blood Typing.jpg",
  "https://lh6.googleusercontent.com/pM26gAa_Xhvbfdoj1ema-YP6WFlsgY2Ucg_CByG1J7coyB-aJXwZD3eu0cS6tGg30N1LVPr-B-Np9xmD3_WYZfNMn7xO-VyfIbdUNsGv8dCDR81Upd7nRCc-YGYmtUfKHHHzpyS2H0cBD_pwOA": "\u0441ontent/i828a8600-f807-4ec3-bb74-0b84f53999f5/Content/Red Blood Cells.PNG",
  "https://lh3.googleusercontent.com/gj7N2Oif-4X2zfjkub58PbgAWt3XKxxCk-GF_PI9pnLmzig9Sm-eZDKfWtM_CLkbEesr_3iWfQ3qJg1c1REQKy3BkrxOSC0BLI60QrltkcCrT-HwPZUZRQ8ZlsTID5FaxZA3X7SOLscM14fouA": "\u0441ontent/i828a8600-f807-4ec3-bb74-0b84f53999f5/Content/White Blood Cells.PNG",
  "https://lh6.googleusercontent.com/A0XYWVnt-KsIFRtn-iJ2fyit8XQWxuznFqmFZe0i3FL17baTAZI6OvGjbKvJoYjGB4K0tlWQpY5ERY0LTOSqip1J3luRdNyzy983phkU37RgGpp7vUfqXKBUqtDQOJLohFxZJZwzURYrNLjKLw": "\u0441ontent/i2ce3b936-b6db-4d86-9174-1bfa407805e8/Content/Blood Typing.jpg"
};
var MODULE4_TAMMY_PARROT_COMIC_PATH = "assets/module4/tammy-parrot-comic.png";
var MODULE4_BLOOD_SPILL_PATH = "assets/module4/blood-spill.jpg";
function stripScriptsAndRewriteLinks(html, sourceFile, exportRoot) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const normalizedSource = normalizePath(sourceFile || "");
  const normalizedSourceNoQuery = normalizedSource.split("?")[0].split("#")[0];
  const normalizedSourceLower = normalizedSourceNoQuery.toLowerCase();
  doc.querySelectorAll("script, style, link[rel='stylesheet']").forEach((el) => el.remove());
  doc.querySelectorAll("meta, title, head").forEach((el) => el.remove());
  doc.querySelectorAll("[aria-hidden='true'], .sr-only, .visually-hidden").forEach((el) => el.remove());
  const remapRootPath = (value) => {
    const normalized = decodePathValue(String(value || ""));
    if (!normalized.startsWith("/")) return "";
    const trimmed = normalized.slice(1);
    if (/^(content|assignment|quiz|сontent)\//i.test(trimmed)) {
      return exportRoot ? joinPath(exportRoot, trimmed) : trimmed;
    }
    return "";
  };
  if (normalizedSourceLower.endsWith("chapter_12006.html") || normalizedSourceLower.includes("chapter_12006")) {
    const paragraphs = Array.from(doc.body.querySelectorAll("p")).filter((p) => (p.textContent || "").trim());
    const insertAfter = paragraphs.length ? paragraphs[paragraphs.length - 1] : doc.body.lastElementChild;
    if (insertAfter) {
      const wrapper = doc.createElement("div");
      const img = doc.createElement("img");
      img.setAttribute("src", buildWorkspaceAssetUrl(MODULE4_TAMMY_PARROT_COMIC_PATH));
      img.setAttribute("alt", "Tammy's Parrot case summary");
      img.setAttribute("style", "max-width:100%;display:block;margin:16px auto;");
      wrapper.appendChild(img);
      insertAfter.parentNode?.insertBefore(wrapper, insertAfter.nextSibling);
    }
  }
  const rewriteAttr = (selector, attr) => {
    doc.querySelectorAll(selector).forEach((el) => {
      const value = el.getAttribute(attr);
      if (!value) return;
      if (attr === "src" && /^https?:/i.test(value)) {
        const fallbackPath = module4RemoteImageFallbacks[value];
        if (fallbackPath) {
          const withRoot2 = exportRoot ? joinPath(exportRoot, fallbackPath) : fallbackPath;
          el.setAttribute(attr, buildReferenceUrl(withRoot2));
          return;
        }
      }
      if (
        attr === "src" &&
        (normalizedSourceLower.endsWith("historical crime case 2.html") || normalizedSourceLower.includes("historical%20crime%20case%202.html") || normalizedSourceLower.includes("historicalcrimecase2") || normalizedSourceLower.includes("historical%20crime%20case%202"))
      ) {
        const normalizedValue = decodePathValue(value);
        if (normalizedValue.toLowerCase().includes("hallway.png")) {
          el.setAttribute(attr, buildWorkspaceAssetUrl(MODULE4_BLOOD_SPILL_PATH));
          return;
        }
      }
      if (/^(https?:|data:|#|mailto:|tel:)/i.test(value)) return;
      const decodedValue = decodePathValue(value);
      const remappedRoot = remapRootPath(decodedValue);
      if (remappedRoot) {
        el.setAttribute(attr, buildReferenceUrl(remappedRoot));
        return;
      }
      const resolved = resolveRelativePath(sourceFile, decodedValue);
      if (!resolved || resolved.startsWith("/")) return;
      const withRoot = exportRoot ? joinPath(exportRoot, resolved) : resolved;
      el.setAttribute(attr, buildReferenceUrl(withRoot));
    });
  };
  rewriteAttr("img[src]", "src");
  rewriteAttr("a[href]", "href");
  rewriteAttr("source[src]", "src");
  rewriteAttr("iframe[src]", "src");
  rewriteAttr("video[src]", "src");
  rewriteAttr("object[data]", "data");
  doc.querySelectorAll("p").forEach((paragraph) => {
    const text = paragraph.textContent?.replace(/\u00a0/g, " ").trim() || "";
    if (!text && !paragraph.querySelector("img, a, iframe, video")) {
      paragraph.remove();
    }
  });
  doc.querySelectorAll("footer").forEach((footer) => {
    const text = footer.textContent?.replace(/\u00a0/g, " ").trim() || "";
    if (!text && !footer.querySelector("img, a")) {
      footer.remove();
    }
  });
  return doc.body.innerHTML || html;
}
function hasMeaningfulHtmlContent(html) {
  if (!html) return false;
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const text = (doc.body.textContent || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
  const mediaLike = doc.querySelectorAll("img, table, iframe, video, object, ul li, ol li").length;
  return text.length >= 40 || mediaLike > 0;
}
function splitHtmlIntoSections(html) {
  if (!html) return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
  const root = doc.body.firstElementChild || doc.body;
  const nodes = Array.from(root.childNodes || []);
  const sections = [];
  let current = null;
  let untitledIndex = 1;
  const pushCurrent = () => {
    if (!current) return;
    const content = current.parts.join("").trim();
    if (!content) return;
    sections.push({
      id: `section-${sections.length + 1}`,
      title: current.title,
      html: content
    });
  };
  for (const node of nodes) {
    const tag = node.nodeType === 1 ? node.tagName.toLowerCase() : "";
    const outer = node.nodeType === 1 ? node.outerHTML : node.textContent?.trim() ? `<p>${node.textContent}</p>` : "";
    if (!outer) continue;
    if (/^h[1-3]$/.test(tag)) {
      pushCurrent();
      const headingText = node.textContent?.trim() || `Section ${untitledIndex++}`;
      current = { title: headingText, parts: [outer] };
      continue;
    }
    if (!current) {
      current = { title: `Section ${untitledIndex++}`, parts: [] };
    }
    current.parts.push(outer);
  }
  pushCurrent();
  return sections;
}
function decodeHtmlEntities(value) {
  if (!value) return "";
  const node = document.createElement("textarea");
  node.innerHTML = value;
  return node.value;
}
function getElementsByLocalName(root, localName) {
  return Array.from(root.getElementsByTagName("*")).filter((el) => el.localName === localName);
}
function normalizeAssignmentHtml(html, sourceFile, exportRoot) {
  if (!html) return "";
  return stripScriptsAndRewriteLinks(`<div>${html}</div>`, sourceFile, exportRoot).replace(/^<div>/i, "").replace(/<\/div>\s*$/i, "");
}
function parseAssignmentXml(xmlText, sourceFile, exportRoot) {
  const xml = new DOMParser().parseFromString(xmlText, "application/xml");
  const title = getElementsByLocalName(xml, "title")[0]?.textContent?.trim() || "Assignment";
  const textNode = getElementsByLocalName(xml, "instructor_text")[0];
  const rawHtml = decodeHtmlEntities(textNode?.textContent || "");
  const textHtml = normalizeAssignmentHtml(rawHtml, sourceFile, exportRoot);
  const pointsRaw = getElementsByLocalName(xml, "gradable")[0]?.getAttribute("points_possible");
  const formatNodes = getElementsByLocalName(xml, "format");
  const textOnly = textHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const sentenceChunks = textOnly.split(/(?<=[.!?])\s+/).map((chunk) => chunk.trim()).filter(Boolean);
  const taskSentence = sentenceChunks.find((chunk) => /\b(complete|submit|upload|click|make a copy)\b/i.test(chunk)) || sentenceChunks[0] || "";
  const reminderSentence = sentenceChunks.find((chunk) => /\b(refresher|remember|if you need)\b/i.test(chunk)) || sentenceChunks[sentenceChunks.length - 1] || "";
  const links = [];
  const linkDoc = new DOMParser().parseFromString(`<div>${textHtml}</div>`, "text/html");
  linkDoc.querySelectorAll("a[href]").forEach((anchor) => {
    const href = anchor.getAttribute("href") || "";
    const label = (anchor.textContent || "").trim() || href;
    if (!href) return;
    links.push({ href, label });
  });
  return {
    title,
    assignmentMeta: {
      points: Number(pointsRaw || 0) || 0,
      submissionType: formatNodes[0]?.getAttribute("type") || "submission",
      submissionFormats: formatNodes.map((node) => node.getAttribute("type") || "").filter(Boolean)
    },
    assignmentXml: {
      intro: textHtml,
      task: taskSentence,
      reminder: reminderSentence,
      links
    }
  };
}
function parseQuizXml(xmlText) {
  const xml = new DOMParser().parseFromString(xmlText, "application/xml");
  const items = getElementsByLocalName(xml, "item");
  if (!items.length) return null;
  const questions = items.map((item, itemIndex) => {
    const matTexts = getElementsByLocalName(item, "mattext").map((el) => decodeHtmlEntities(el.textContent || ""));
    const question = matTexts[0] || `Quiz question ${itemIndex + 1}`;
    const choiceNodes = getElementsByLocalName(item, "response_label");
    const choices = choiceNodes.map((node) => {
      const text = getElementsByLocalName(node, "mattext")[0]?.textContent || "";
      return decodeHtmlEntities(text).replace(/<[^>]+>/g, "").trim();
    });
    const correctId = getElementsByLocalName(item, "respcondition").find((node) => getElementsByLocalName(node, "setvar").length > 0)?.getElementsByTagName("varequal")[0]?.textContent?.trim();
    const choiceIds = choiceNodes.map((node) => node.getAttribute("ident"));
    const answerIndex = correctId ? Math.max(0, choiceIds.indexOf(correctId)) : 0;
    return {
      id: item.getAttribute("ident") || `item-${itemIndex + 1}`,
      question: question.replace(/<[^>]+>/g, "").trim(),
      choices: choices.filter(Boolean),
      answerIndex
    };
  }).filter((question) => question.question && question.choices.length > 0);
  if (!questions.length) return null;
  const metadataFields = getElementsByLocalName(xml, "qtimetadatafield");
  const readMeta = (label) => {
    const field = metadataFields.find(
      (node) => getElementsByLocalName(node, "fieldlabel")[0]?.textContent?.trim() === label
    );
    return getElementsByLocalName(field || xml, "fieldentry")[0]?.textContent?.trim();
  };
  return {
    quizMeta: {
      profile: readMeta("qmd_assessmenttype") || "Assessment",
      attempts: Number(readMeta("cc_maxattempts") || 1),
      timeLimitMinutes: Number(readMeta("qmd_timelimit") || 0),
      questionCount: questions.length
    },
    quizSample: questions[0],
    quizQuestions: questions
  };
}
var FORENSIC_THEME = {
  panel: "rounded-2xl border border-white/[0.08] bg-[#141821] shadow-[0_18px_40px_rgba(0,0,0,0.45)]",
  panelSoft: "rounded-2xl border border-white/[0.08] bg-[#101216] shadow-[0_16px_36px_rgba(0,0,0,0.4)]",
  buttonPrimary: "rounded-lg border border-[#dc2626]/70 bg-[#b91c1c] px-4 py-2.5 text-sm font-semibold text-[#f3f4f6] transition duration-200 hover:bg-[#dc2626] hover:shadow-[0_0_0_1px_rgba(220,38,38,0.35),0_10px_24px_rgba(185,28,28,0.28)]",
  buttonSecondary: "rounded-lg border border-white/[0.12] bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-[#d1d5db] transition duration-200 hover:border-white/[0.26] hover:bg-white/[0.07] hover:text-[#f3f4f6]",
  overline: "text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6b7280]"
};
var MODULE1_ASSIGNMENT_EMBED_PATH = "./assets/module1assignment.html";
var MODULE2_ASSIGNMENT_EMBED_PATH = "./assets/module2assignment.html";
var MODULE3_ASSIGNMENT_EMBED_PATH = "./assets/module3assignment.html";
var MODULE4_ASSIGNMENT_EMBED_PATH = "./assets/module4assignment.html";
var MODULE5_ASSIGNMENT_EMBED_PATH = "./assets/module5assignment.html";
var MODULE6_ASSIGNMENT_EMBED_PATH = "./assets/module6assignment.html";
var MODULE7_ASSIGNMENT_EMBED_PATH = "./assets/module7assignment.html";
function Badge({ children, className = "", ...props }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "span",
    {
      ...props,
      className: `rounded-md border border-white/[0.12] bg-white/[0.03] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#a1a8b3] ${className}`.trim(),
      children
    }
  );
}
function typeLabel(type) {
  const map = {
    assignment: "ASSIGNMENT",
    "lab-assignment": "ASSIGNMENT",
    quiz: "QUIZ",
    pdf: "PDF",
    "embedded-video": "VIDEO",
    "image-slide": "SLIDE",
    "html-reading": "READING"
  };
  return map[type] || "RESOURCE";
}
function formatLessonTitleForDisplay(lesson) {
  const rawTitle = String(lesson?.title || "").trim();
  if (!rawTitle) return rawTitle;
  const moduleAssessmentMatch = rawTitle.match(/^M\s*(\d+)\s+(.+?)\s+Assessment$/i);
  if (moduleAssessmentMatch) {
    const moduleNumber = moduleAssessmentMatch[1];
    const topic = moduleAssessmentMatch[2].trim();
    return `Module ${moduleNumber} Assessment: ${topic}`;
  }
  return rawTitle;
}
function formatModuleTitleForDisplay(title) {
  const rawTitle = String(title || "").trim();
  if (!rawTitle) return rawTitle;
  const numberedModuleMatch = rawTitle.match(/^(\d+)\s+(.+)$/);
  if (numberedModuleMatch) {
    const moduleNumber = numberedModuleMatch[1];
    const moduleName = numberedModuleMatch[2].trim();
    return `Module ${moduleNumber}: ${moduleName}`;
  }
  return rawTitle;
}
function HtmlRenderer({ html }) {
  const sections = useMemo(() => splitHtmlIntoSections(html), [html]);
  const [sectionMode, setSectionMode] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({});
  useEffect(() => {
    setSectionMode(false);
    setCollapsedSections({});
  }, [html]);
  const collapseAll = () => {
    setCollapsedSections(Object.fromEntries(sections.map((section) => [section.id, true])));
  };
  const expandAll = () => {
    setCollapsedSections({});
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `${FORENSIC_THEME.panel} p-6`, "data-testid": "renderer-html", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mb-4 flex flex-wrap justify-end gap-2", children: sections.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          onClick: () => setSectionMode((prev) => !prev),
          className: FORENSIC_THEME.buttonSecondary,
          "data-testid": "section-mode-toggle",
          children: sectionMode ? "Single flow" : "Section mode"
        }
      ),
      sectionMode && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            onClick: expandAll,
            className: FORENSIC_THEME.buttonSecondary,
            "data-testid": "section-expand-all",
            children: "Expand all"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            onClick: collapseAll,
            className: FORENSIC_THEME.buttonSecondary,
            "data-testid": "section-collapse-all",
            children: "Collapse all"
          }
        )
      ] })
    ] }) }),
    sectionMode && sections.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "space-y-3", children: sections.map((section) => {
      const collapsed = !!collapsedSections[section.id];
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rounded-xl border border-white/[0.1] bg-white/[0.02]", "data-testid": "section-container", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "button",
          {
            onClick: () => setCollapsedSections((prev) => ({ ...prev, [section.id]: !prev[section.id] })),
            className: "flex w-full items-center justify-between px-4 py-3 text-left transition duration-200 hover:bg-white/[0.03]",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-sm font-semibold text-[#f3f4f6]", children: section.title }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: FORENSIC_THEME.overline, children: collapsed ? "Expand" : "Collapse" })
            ]
          }
        ),
        !collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "div",
          {
            className: "max-w-none border-t border-white/[0.08] px-4 py-4 text-[#cbd5e1] [&_*]:!text-[#e5e7eb] [&_.image-banner]:my-4 [&_.image-banner]:rounded-xl [&_.image-banner]:border [&_.image-banner]:border-white/[0.1] [&_.image-banner]:bg-white/[0.04] [&_.image-banner]:p-8 [&_.image-banner]:text-center [&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:!text-[#f8fafc] [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:!text-[#f8fafc] [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:!text-[#f1f5f9] [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_p]:leading-7 [&_p]:!text-[#e5e7eb] [&_li]:!text-[#e5e7eb] [&_strong]:!text-[#f8fafc] [&_em]:!text-[#e2e8f0] [&_table]:mt-4 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-white/[0.12] [&_td]:p-3 [&_th]:border [&_th]:border-white/[0.14] [&_th]:bg-white/[0.06] [&_th]:p-3 [&_ul]:list-disc [&_ul]:pl-6",
            dangerouslySetInnerHTML: { __html: section.html }
          }
        )
      ] }, section.id);
    }) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "div",
      {
        className: "max-w-none text-[#cbd5e1] [&_*]:!text-[#e5e7eb] [&_.image-banner]:my-4 [&_.image-banner]:rounded-xl [&_.image-banner]:border [&_.image-banner]:border-white/[0.1] [&_.image-banner]:bg-white/[0.04] [&_.image-banner]:p-8 [&_.image-banner]:text-center [&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:!text-[#f8fafc] [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:!text-[#f8fafc] [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:!text-[#f1f5f9] [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_p]:leading-7 [&_p]:!text-[#e5e7eb] [&_li]:!text-[#e5e7eb] [&_strong]:!text-[#f8fafc] [&_em]:!text-[#e2e8f0] [&_table]:mt-4 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-white/[0.12] [&_td]:p-3 [&_th]:border [&_th]:border-white/[0.14] [&_th]:bg-white/[0.06] [&_th]:p-3 [&_ul]:list-disc [&_ul]:pl-6",
        dangerouslySetInnerHTML: { __html: html }
      }
    )
  ] });
}
function PdfRenderer({ meta, title, sourceUrl }) {
  const pages = meta?.pages || 1;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `${FORENSIC_THEME.panel} p-6`, "data-testid": "renderer-pdf", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mb-5 flex items-center justify-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: FORENSIC_THEME.overline, children: "Course PDF" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { className: "mt-1 text-lg font-semibold text-[#f3f4f6]", children: title })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: meta?.size || "PDF" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { children: [
          pages,
          " pages"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid gap-4 lg:grid-cols-[180px_1fr]", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `${FORENSIC_THEME.panelSoft} p-3`, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `mb-3 ${FORENSIC_THEME.overline}`, children: "Pages" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "space-y-2", children: Array.from({ length: Math.min(pages, 6) }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "div",
          {
            className: `rounded-xl border px-3 py-2 text-sm ${i === 0 ? "border-[#b91c1c]/70 bg-[#1a1215] text-[#fecaca]" : "border-white/[0.1] bg-white/[0.02] text-[#a1a8b3]"}`,
            children: [
              "Page ",
              i + 1
            ]
          },
          i
        )) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `${FORENSIC_THEME.panelSoft} p-4`, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mb-4 flex items-center justify-between text-sm text-[#a1a8b3]", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
            "Page 1 of ",
            pages
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: FORENSIC_THEME.buttonSecondary, children: "Fit" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: FORENSIC_THEME.buttonSecondary, children: "\u2212" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: FORENSIC_THEME.buttonSecondary, children: "+" })
          ] })
        ] }),
        sourceUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "iframe",
          {
            src: sourceUrl,
            title,
            className: "mx-auto min-h-[520px] w-full max-w-[760px] rounded-xl border border-white/20 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
          }
        ) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto flex min-h-[520px] max-w-[760px] items-center justify-center rounded-xl border border-white/20 bg-white/[0.02] p-8 text-center text-sm leading-7 text-[#a1a8b3] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]", children: "PDF page canvas would render here with real pagination, zoom, and outline support." })
      ] })
    ] })
  ] });
}
function SlideRenderer({ title }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `${FORENSIC_THEME.panel} p-6`, "data-testid": "renderer-slide", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mb-4 flex items-center justify-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: FORENSIC_THEME.overline, children: "Evidence media" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { className: "mt-1 text-lg font-semibold text-[#f3f4f6]", children: title })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "responsive media" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "zoom ready" })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "overflow-hidden rounded-2xl border border-white/[0.12] bg-slate-950/95", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex min-h-[460px] items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(185,28,28,0.18),_transparent_36%),linear-gradient(180deg,_#141821,_#090a0d)] p-10 text-center", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileImage, { className: "h-7 w-7 text-[#fecaca]" }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { className: "text-2xl font-semibold text-[#f3f4f6]", children: title }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "mx-auto mt-3 max-w-xl text-sm leading-7 text-[#cbd5e1]", children: "Original exported slide/image asset would render here with preserved visuals, zoom support, and optional caption treatment." })
    ] }) }) })
  ] });
}
function AssignmentRenderer({ data, meta, title }) {
  const introHtml = data?.intro || "";
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `${FORENSIC_THEME.panel} p-6`, "data-testid": "renderer-assignment", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mb-5 flex items-center justify-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: FORENSIC_THEME.overline, children: "Case assignment" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { className: "mt-1 text-lg font-semibold text-[#f3f4f6]", children: title })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { children: [
          meta?.points || 0,
          " pts"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: meta?.submissionType || "submission" }),
        meta?.submissionFormats?.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { children: [
          meta.submissionFormats.length,
          " formats"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid gap-5 lg:grid-cols-[1.1fr_0.9fr]", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "space-y-4 text-sm leading-7 text-[#cbd5e1]", children: [
        introHtml ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "div",
          {
            className: "max-w-none [&_img]:mx-auto [&_img]:my-4 [&_img]:h-auto [&_img]:max-w-full [&_p]:mb-3",
            dangerouslySetInnerHTML: { __html: introHtml }
          }
        ) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "No assignment instructions are available yet." }),
        (data?.individualized || data?.identified) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid gap-4 lg:grid-cols-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rounded-xl border border-white/[0.12] bg-[#112015] p-4", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "text-[11px] font-semibold uppercase tracking-[0.14em] text-[#86efac]", children: "Individualized evidence" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "mt-2 text-[#dcfce7]", children: data?.individualized || "Not specified." })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rounded-xl border border-white/[0.12] bg-[#111d2a] p-4", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "text-[11px] font-semibold uppercase tracking-[0.14em] text-[#93c5fd]", children: "Identified evidence" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "mt-2 text-[#dbeafe]", children: data?.identified || "Not specified." })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "space-y-4", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `${FORENSIC_THEME.panelSoft} p-4`, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: FORENSIC_THEME.overline, children: "Assignment note" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "mt-3 text-sm leading-7 text-[#cbd5e1]", children: "Assignment submissions are managed outside this app flow. This view preserves assignment context only." })
      ] }) })
    ] })
  ] });
}
function EmbeddedAssignmentRenderer({ title, srcPath }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `${FORENSIC_THEME.panel} p-6`, "data-testid": "renderer-assignment", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mb-5 flex items-center justify-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: FORENSIC_THEME.overline, children: "Case assignment" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { className: "mt-1 text-lg font-semibold text-[#f3f4f6]", children: title })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "interactive lab" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "rounded-2xl border border-white/[0.12] bg-[#0f172a]", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "iframe",
      {
        src: srcPath,
        title,
        className: "h-[1600px] min-h-[1600px] w-full md:h-[1800px] md:min-h-[1800px] xl:h-[2000px] xl:min-h-[2000px]"
      }
    ) })
  ] });
}
function QuizRenderer({ quiz, questions, meta }) {
  const parsedQuestions = questions?.length ? questions : quiz ? [quiz] : [];
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answersByQuestion, setAnswersByQuestion] = useState({});
  const [feedbackByQuestion, setFeedbackByQuestion] = useState({});
  const activeQuestion = parsedQuestions[questionIndex] || parsedQuestions[0];
  const activeQuestionId = activeQuestion?.id || `question-${questionIndex}`;
  const currentSelected = answersByQuestion[activeQuestionId];
  const showFeedback = !!feedbackByQuestion[activeQuestionId];
  const correct = currentSelected === activeQuestion?.answerIndex;
  const answeredCount = parsedQuestions.filter((question) => answersByQuestion[question.id] !== void 0).length;
  const correctCount = parsedQuestions.filter((question) => answersByQuestion[question.id] === question.answerIndex).length;
  const resetQuizAttempt = () => {
    setQuestionIndex(0);
    setAnswersByQuestion({});
    setFeedbackByQuestion({});
  };
  const generateQuizReport = () => {
    const safe = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
    const rows = parsedQuestions.map((question, idx) => {
      const selectedIndex = answersByQuestion[question.id];
      const selectedLabel = selectedIndex === void 0 ? "Not answered" : question.choices?.[selectedIndex] || "Not answered";
      const result = selectedIndex === void 0 ? "Pending" : selectedIndex === question.answerIndex ? "Correct" : "Incorrect";
      return `
          <tr>
            <td>${idx + 1}</td>
            <td>${safe(question.question || "Untitled question")}</td>
            <td>${safe(selectedLabel)}</td>
            <td>${result}</td>
          </tr>
        `;
    }).join("");
    const reportHtml = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Assignments Report</title>
          <style>
            body { font-family: 'Avenir Next', 'Segoe UI', sans-serif; margin: 32px; color: #0f172a; }
            h1 { margin: 0 0 8px; font-size: 28px; }
            p { margin: 0 0 6px; color: #334155; }
            .chips { margin: 16px 0 18px; display: flex; gap: 8px; flex-wrap: wrap; }
            .chip { border: 1px solid #cbd5e1; border-radius: 999px; padding: 6px 12px; font-size: 12px; font-weight: 700; color: #334155; }
            table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 13px; }
            th, td { border: 1px solid #e2e8f0; text-align: left; vertical-align: top; padding: 10px; }
            th { background: #f8fafc; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #475569; }
          </style>
        </head>
        <body>
          <h1>Assignments Report</h1>
          <p><strong>Score:</strong> ${correctCount}/${parsedQuestions.length}</p>
          <p><strong>Answered:</strong> ${answeredCount}/${parsedQuestions.length}</p>
          <div class="chips">
            <span class="chip">${parsedQuestions.length} questions</span>
            <span class="chip">${meta?.profile || "Module assessment"}</span>
            <span class="chip">Retakes allowed</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Question</th>
                <th>Your Answer</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `;
    const reportBlob = new Blob([reportHtml], { type: "text/html" });
    const reportUrl = URL.createObjectURL(reportBlob);
    const reportWindow = window.open(reportUrl, "_blank");
    if (!reportWindow) {
      URL.revokeObjectURL(reportUrl);
      return;
    }
    window.setTimeout(() => {
      reportWindow.focus();
      reportWindow.print();
      URL.revokeObjectURL(reportUrl);
    }, 350);
  };
  useEffect(() => {
    resetQuizAttempt();
  }, [questions, quiz]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `${FORENSIC_THEME.panel} p-6`, "data-testid": "renderer-quiz", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mb-5 flex items-center justify-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: FORENSIC_THEME.overline, children: "Assignments" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { className: "mt-1 text-lg font-semibold text-[#f3f4f6]", children: "Module assessment" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { children: [
          parsedQuestions.length,
          " questions"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { children: [
          correctCount,
          "/",
          parsedQuestions.length,
          " correct"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { "data-testid": "quiz-progress", children: [
          answeredCount,
          "/",
          parsedQuestions.length,
          " answered"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      parsedQuestions.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mb-4 flex flex-wrap gap-2", "data-testid": "quiz-question-nav", children: parsedQuestions.map((question, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "button",
        {
          onClick: () => {
            setQuestionIndex(idx);
          },
          className: `rounded-lg border px-3 py-1.5 text-xs font-semibold transition duration-200 ${questionIndex === idx ? "border-[#b91c1c]/70 bg-[#1a1215] text-[#fecaca]" : "border-white/[0.12] bg-white/[0.02] text-[#a1a8b3] hover:border-white/[0.24] hover:text-[#f3f4f6]"}`,
          "data-testid": "quiz-question-button",
          "data-current": questionIndex === idx ? "true" : "false",
          children: [
            "Q",
            idx + 1,
            " ",
            answersByQuestion[question.id] !== void 0 ? "\u2022" : ""
          ]
        },
        question.id
      )) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mb-4 h-2 overflow-hidden rounded-full bg-white/[0.08]", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "div",
        {
          className: "h-full rounded-full bg-[#b91c1c]",
          style: { width: `${parsedQuestions.length ? answeredCount / parsedQuestions.length * 100 : 0}%` }
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-sm leading-7 text-[#d1d5db]", children: activeQuestion?.question || "No quiz question parsed." }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-5 space-y-3", children: activeQuestion?.choices?.map((choice, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          onClick: () => {
            setAnswersByQuestion((prev) => ({ ...prev, [activeQuestionId]: idx }));
            setFeedbackByQuestion((prev) => ({ ...prev, [activeQuestionId]: false }));
          },
          className: `w-full rounded-2xl border p-4 text-left text-sm transition ${currentSelected === idx ? "border-[#b91c1c]/70 bg-[#1a1215] text-[#f3f4f6]" : "border-white/[0.12] bg-white/[0.02] text-[#cbd5e1] hover:border-white/[0.24] hover:bg-white/[0.05]"}`,
          "data-testid": "quiz-answer-choice",
          children: choice
        },
        idx
      )) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mt-5 flex flex-wrap gap-3", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            onClick: () => setFeedbackByQuestion((prev) => ({ ...prev, [activeQuestionId]: true })),
            className: `w-full sm:w-auto ${FORENSIC_THEME.buttonPrimary}`,
            "data-testid": "quiz-check-answer",
            children: "Check answer"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            onClick: () => {
              setAnswersByQuestion((prev) => ({ ...prev, [activeQuestionId]: void 0 }));
              setFeedbackByQuestion((prev) => ({ ...prev, [activeQuestionId]: false }));
            },
            className: `w-full sm:w-auto ${FORENSIC_THEME.buttonSecondary}`,
            children: "Clear answer"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            onClick: resetQuizAttempt,
            className: `w-full sm:w-auto ${FORENSIC_THEME.buttonSecondary}`,
            children: "Retake quiz"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            onClick: generateQuizReport,
            className: `w-full sm:w-auto ${FORENSIC_THEME.buttonSecondary}`,
            children: "Generate report"
          }
        ),
        parsedQuestions.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            onClick: () => {
              if (questionIndex < parsedQuestions.length - 1) {
                setQuestionIndex((idx) => idx + 1);
              }
            },
            className: `w-full sm:w-auto ${FORENSIC_THEME.buttonSecondary}`,
            "data-testid": "quiz-next-question",
            children: "Next question"
          }
        )
      ] }),
      showFeedback && currentSelected !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `mt-5 rounded-2xl border p-4 ${correct ? "border-emerald-400/35 bg-emerald-950/30" : "border-[#dc2626]/45 bg-[#2d0f14]"}`, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `text-sm font-semibold ${correct ? "text-emerald-300" : "text-rose-300"}`, children: correct ? "Correct" : "Wrong" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: `mt-2 text-sm leading-7 ${correct ? "text-emerald-100" : "text-rose-100"}`, children: [
          "In the exported quiz, the correct answer is ",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: activeQuestion?.choices?.[activeQuestion?.answerIndex] }),
          "."
        ] })
      ] })
    ] }) })
  ] });
}
function VideoRenderer({ title }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `${FORENSIC_THEME.panel} p-6`, "data-testid": "renderer-video", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mb-4 flex items-center justify-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: FORENSIC_THEME.overline, children: "Media sequence" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { className: "mt-1 text-lg font-semibold text-[#f3f4f6]", children: title })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "responsive embed" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "overflow-hidden rounded-2xl border border-white/[0.12] bg-slate-950", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex aspect-video items-center justify-center bg-[radial-gradient(circle_at_top,rgba(185,28,28,0.16),transparent_42%),linear-gradient(135deg,#101216,#08090c)]", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "text-center", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayCircle, { className: "mx-auto h-14 w-14 text-[#fecaca]" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-3 text-lg font-semibold text-[#f3f4f6]", children: title }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "mt-2 max-w-lg text-sm text-[#cbd5e1]", children: "The real build would embed the exported video page cleanly here instead of leaving it as an awkward detached Brightspace wrapper." })
    ] }) }) })
  ] });
}
function SourceFallback({ activeLesson, sourcePreview }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rounded-2xl border border-[#b91c1c]/45 bg-[#2a1216] p-6 shadow-[0_16px_34px_rgba(0,0,0,0.45)]", "data-testid": "renderer-fallback", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { className: "text-lg font-semibold text-[#fecaca]", children: "Content unavailable in this view" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "mt-3 text-sm leading-7 text-[#fee2e2]", children: "This item is still part of the module, but this content type is not fully rendered yet." }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mt-4 space-y-2 rounded-xl border border-white/[0.12] bg-white/[0.04] p-4 text-xs text-[#e2e8f0]", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Type:" }),
        " ",
        typeLabel(activeLesson?.type)
      ] }),
      sourcePreview?.error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Status:" }),
        " Rendering is still in progress for this item."
      ] })
    ] })
  ] });
}
function renderNodePreview(activeLesson, sourcePreview) {
  const isSourceCritical = ["html-reading", "pdf", "assignment", "quiz"].includes(activeLesson.type);
  if (isSourceCritical && sourcePreview?.status === "loading") {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `${FORENSIC_THEME.panelSoft} p-6 text-sm text-[#a1a8b3]`, children: "Loading content..." });
  }
  if (isSourceCritical && sourcePreview?.status === "error") {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SourceFallback, { activeLesson, sourcePreview });
  }
  if (activeLesson.type === "html-reading") {
    const html = sourcePreview?.kind === "html" ? sourcePreview.html : activeLesson.htmlSample;
    if (html) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HtmlRenderer, { html });
  }
  if (activeLesson.type === "pdf") {
    const sourceUrl = sourcePreview?.kind === "pdf" ? sourcePreview.url : void 0;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfRenderer, { meta: activeLesson.pdfMeta, title: activeLesson.title, sourceUrl });
  }
  if (activeLesson.type === "image-slide") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlideRenderer, { title: activeLesson.title });
  if (activeLesson.type === "assignment") {
    const parsedData = sourcePreview?.kind === "assignment" ? sourcePreview.assignmentXml : activeLesson.assignmentXml;
    const parsedMeta = sourcePreview?.kind === "assignment" ? sourcePreview.assignmentMeta : activeLesson.assignmentMeta;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssignmentRenderer, { data: parsedData, meta: parsedMeta, title: activeLesson.title });
  }
  if (activeLesson.type === "lab-assignment") {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmbeddedAssignmentRenderer, { title: activeLesson.title, srcPath: activeLesson.embedPath || MODULE4_ASSIGNMENT_EMBED_PATH });
  }
  if (activeLesson.type === "quiz") {
    const quiz = sourcePreview?.kind === "quiz" ? sourcePreview.quizSample : activeLesson.quizSample;
    const questions = sourcePreview?.kind === "quiz" ? sourcePreview.quizQuestions : activeLesson.quizQuestions;
    const meta = sourcePreview?.kind === "quiz" ? sourcePreview.quizMeta : activeLesson.quizMeta;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuizRenderer, { quiz, questions, meta });
  }
  if (activeLesson.type === "embedded-video") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoRenderer, { title: activeLesson.title });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SourceFallback, { activeLesson, sourcePreview });
}
function ChapterLessonCard({ lesson }) {
  const [sourcePreview, setSourcePreview] = useState({ status: "idle", kind: null });
  useEffect(() => {
    let cancelled = false;
    async function loadSourcePreview() {
      if (!lesson?.sourceFile) {
        if (!cancelled) setSourcePreview({ status: "idle", kind: null });
        return;
      }
      const sourcePath = normalizePath(lesson.sourceFile);
      const exportRoot = normalizePath(d2l_map_data_default.exportRoot || "");
      const candidates = [joinPath(exportRoot, sourcePath), sourcePath].filter(Boolean);
      if (!cancelled) {
        setSourcePreview({ status: "loading", kind: null });
      }
      for (const candidate of candidates) {
        const url = buildReferenceUrl(candidate);
        try {
          const response = await fetch(url);
          if (!response.ok) continue;
          if (lesson.type === "pdf") {
            if (!cancelled) setSourcePreview({ status: "ready", kind: "pdf", url });
            return;
          }
          const text = await response.text();
          if (lesson.type === "html-reading") {
            const html = stripScriptsAndRewriteLinks(text, sourcePath, exportRoot);
            if (!hasMeaningfulHtmlContent(html)) continue;
            if (!cancelled) setSourcePreview({ status: "ready", kind: "html", html, sourcePath: candidate });
            return;
          }
          if (lesson.type === "assignment") {
            const parsed = parseAssignmentXml(text, sourcePath, exportRoot);
            if (!cancelled) setSourcePreview({ status: "ready", kind: "assignment", ...parsed, sourcePath: candidate });
            return;
          }
          if (lesson.type === "quiz") {
            const parsed = parseQuizXml(text);
            if (!cancelled) {
              if (parsed) {
                setSourcePreview({ status: "ready", kind: "quiz", ...parsed, sourcePath: candidate });
              } else {
                setSourcePreview({ status: "error", kind: null, error: "Could not parse quiz XML content." });
              }
            }
            return;
          }
          if (!cancelled) {
            setSourcePreview({ status: "ready", kind: "text", text, sourcePath: candidate });
          }
          return;
        } catch {
        }
      }
      if (!cancelled) {
        setSourcePreview({
          status: "error",
          kind: null,
          error: "Unable to load content preview."
        });
      }
    }
    loadSourcePreview();
    return () => {
      cancelled = true;
    };
  }, [lesson?.id, lesson?.sourceFile, lesson?.type]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: `${FORENSIC_THEME.panel} p-8`, "data-testid": "chapter-lesson-card", "data-lesson-type": lesson.type, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mb-4 flex flex-wrap items-center gap-2", children: lesson.type !== "html-reading" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: typeLabel(lesson.type) }) : null }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "text-2xl font-semibold tracking-tight text-[#f3f4f6]", children: formatLessonTitleForDisplay(lesson) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-6", children: renderNodePreview(lesson, sourcePreview) })
  ] });
}
function ForensicCoursePlayerPreviewRestored() {
  const [activeChapterId, setActiveChapterId] = useState(resolvedModules[0]?.id ?? "");
  const [activeModuleView, setActiveModuleView] = useState("content");
  const [chapterVisited, setChapterVisited] = useState({});
  const [query, setQuery] = useState("");
  const [includeHidden, setIncludeHidden] = useState(false);
  const [isChapterMenuCollapsed, setIsChapterMenuCollapsed] = useState(false);
  const filteredModules = resolvedModules.filter((module) => includeHidden || !module.isHidden).map((module) => ({
    ...module,
    lessons: module.lessons
  })).filter((module) => module.title.toLowerCase().includes(query.toLowerCase()) || query.length === 0);
  const shouldFallbackToSeed = query.length === 0 && filteredModules.length === 0 && resolvedModules.length > 0;
  const effectiveModules = shouldFallbackToSeed ? resolvedModules : filteredModules;
  const fallbackCourse = useMemo(() => buildCourseFromD2LMap(courseSeed, d2l_map_data_default), []);
  const fallbackModules = fallbackCourse?.modules?.length ? fallbackCourse.modules : courseSeed.modules;
  const fallbackFilteredModules = useMemo(
    () => fallbackModules.filter((module) => includeHidden || !module.isHidden).map((module) => ({
      ...module,
      lessons: module.lessons
    })).filter((module) => module.title.toLowerCase().includes(query.toLowerCase()) || query.length === 0),
    [fallbackModules, includeHidden, query]
  );
  const shouldUseFallbackCourse = query.length === 0 && effectiveModules.length === 0 && fallbackFilteredModules.length > 0;
  const finalModules = shouldUseFallbackCourse ? fallbackFilteredModules : effectiveModules;
  const emergencyModule = {
    id: "e2e-seed",
    title: "E2E Seed Module",
    lessonCount: 1,
    lessons: []
  };
  const safeModules = finalModules.length > 0 ? finalModules : fallbackFilteredModules.length > 0 ? fallbackFilteredModules : [emergencyModule];
  const activeChapter = useMemo(
    () => safeModules.find((module) => module.id === activeChapterId) || safeModules[0],
    [activeChapterId, safeModules]
  );
  const chapterLessonGroups = useMemo(() => {
    const moduleTwoExcludedTitles = /* @__PURE__ */ new Set([
      "evidence and fingerprints online activity (optional)"
    ]);
    const isUnitAssessmentSection = (title) => (title || "").trim().toLowerCase().includes("unit assessment");
    const isModuleTwo = (activeChapter?.title || "").toLowerCase().includes("types of evidence and fingerprint analysis");
    const normalizedLessons = (activeChapter?.lessons || []).filter((lesson) => !isUnitAssessmentSection(lesson.title)).filter((lesson) => {
      if (!isModuleTwo) return true;
      return !moduleTwoExcludedTitles.has((lesson.title || "").trim().toLowerCase());
    }).map((lesson) => ({
      ...lesson,
      moduleTitle: formatModuleTitleForDisplay(activeChapter.title),
      moduleLessonCount: activeChapter.lessonCount,
      moduleHidden: activeChapter.isHidden
    }));
    const chapterTitleLower = (activeChapter?.title || "").toLowerCase();
    const isModuleOne = chapterTitleLower.includes("introduction to crime scenes");
    const isModuleThree = chapterTitleLower.includes("trace evidence");
    const isModuleFour = chapterTitleLower.includes("body fluid evidence");
    const isModuleFive = chapterTitleLower.includes("forensic detection of impaired driving");
    const isModuleSix = chapterTitleLower.includes("polygraphing and document analysis");
    const isModuleSeven = chapterTitleLower.includes("forensic genetics");
    const syntheticLessons = [];
    if (isModuleTwo) {
      syntheticLessons.push({
        id: "module2-fingerprint-analysis-lab",
        title: "Fingerprint Analysis Lab Assignment",
        type: "lab-assignment",
        embedPath: MODULE2_ASSIGNMENT_EMBED_PATH,
        sourceFile: MODULE2_ASSIGNMENT_EMBED_PATH,
        resources: [MODULE2_ASSIGNMENT_EMBED_PATH],
        moduleTitle: formatModuleTitleForDisplay(activeChapter.title),
        moduleLessonCount: activeChapter.lessonCount,
        moduleHidden: activeChapter.isHidden
      });
    }
    if (isModuleOne) {
      syntheticLessons.push({
        id: "module1-crime-scene-lab",
        title: "Crime Scene Certification Lab",
        type: "lab-assignment",
        embedPath: MODULE1_ASSIGNMENT_EMBED_PATH,
        sourceFile: MODULE1_ASSIGNMENT_EMBED_PATH,
        resources: [MODULE1_ASSIGNMENT_EMBED_PATH],
        moduleTitle: formatModuleTitleForDisplay(activeChapter.title),
        moduleLessonCount: activeChapter.lessonCount,
        moduleHidden: activeChapter.isHidden
      });
    }
    if (isModuleThree) {
      syntheticLessons.push({
        id: "module3-trace-evidence-lab",
        title: "Trace Evidence Lab Assignment",
        type: "lab-assignment",
        embedPath: MODULE3_ASSIGNMENT_EMBED_PATH,
        sourceFile: MODULE3_ASSIGNMENT_EMBED_PATH,
        resources: [MODULE3_ASSIGNMENT_EMBED_PATH],
        moduleTitle: formatModuleTitleForDisplay(activeChapter.title),
        moduleLessonCount: activeChapter.lessonCount,
        moduleHidden: activeChapter.isHidden
      });
    }
    if (isModuleFour) {
      syntheticLessons.push({
        id: "module4-body-fluid-analysis-lab",
        title: "Body Fluid Analysis Lab Assignment",
        type: "lab-assignment",
        embedPath: MODULE4_ASSIGNMENT_EMBED_PATH,
        sourceFile: MODULE4_ASSIGNMENT_EMBED_PATH,
        resources: [MODULE4_ASSIGNMENT_EMBED_PATH],
        moduleTitle: formatModuleTitleForDisplay(activeChapter.title),
        moduleLessonCount: activeChapter.lessonCount,
        moduleHidden: activeChapter.isHidden
      });
    }
    if (isModuleFive) {
      syntheticLessons.push({
        id: "module5-impaired-driving-lab",
        title: "Impaired Driving Assignment Lab",
        type: "lab-assignment",
        embedPath: MODULE5_ASSIGNMENT_EMBED_PATH,
        sourceFile: MODULE5_ASSIGNMENT_EMBED_PATH,
        resources: [MODULE5_ASSIGNMENT_EMBED_PATH],
        moduleTitle: formatModuleTitleForDisplay(activeChapter.title),
        moduleLessonCount: activeChapter.lessonCount,
        moduleHidden: activeChapter.isHidden
      });
    }
    if (isModuleSix) {
      syntheticLessons.push({
        id: "module6-polygraph-document-lab",
        title: "Polygraph and Document Analysis Lab",
        type: "lab-assignment",
        embedPath: MODULE6_ASSIGNMENT_EMBED_PATH,
        sourceFile: MODULE6_ASSIGNMENT_EMBED_PATH,
        resources: [MODULE6_ASSIGNMENT_EMBED_PATH],
        moduleTitle: formatModuleTitleForDisplay(activeChapter.title),
        moduleLessonCount: activeChapter.lessonCount,
        moduleHidden: activeChapter.isHidden
      });
    }
    if (isModuleSeven) {
      syntheticLessons.push({
        id: "module7-forensic-genetics-lab",
        title: "Forensic Genetics Lab Assignment",
        type: "lab-assignment",
        embedPath: MODULE7_ASSIGNMENT_EMBED_PATH,
        sourceFile: MODULE7_ASSIGNMENT_EMBED_PATH,
        resources: [MODULE7_ASSIGNMENT_EMBED_PATH],
        moduleTitle: formatModuleTitleForDisplay(activeChapter.title),
        moduleLessonCount: activeChapter.lessonCount,
        moduleHidden: activeChapter.isHidden
      });
    }
    const lessonsWithSynthetic = [...syntheticLessons, ...normalizedLessons];
    return {
      contentLessons: lessonsWithSynthetic.filter(
        (lesson) => lesson.type !== "quiz" && lesson.type !== "assignment" && lesson.type !== "lab-assignment"
      ),
      assignmentLessons: lessonsWithSynthetic.filter(
        (lesson) => lesson.type === "quiz" || lesson.type === "assignment" || lesson.type === "lab-assignment"
      )
    };
  }, [activeChapter]);
  const chapterLessons = chapterLessonGroups.contentLessons;
  const chapterAssignments = chapterLessonGroups.assignmentLessons;
  const progress = safeModules.length ? Math.round(Object.values(chapterVisited).filter(Boolean).length / safeModules.length * 100) : 0;
  useEffect(() => {
    if (!safeModules.length) {
      return;
    }
    const isVisible = safeModules.some((module) => module.id === activeChapterId);
    if (!isVisible) {
      setActiveChapterId(safeModules[0].id);
    }
  }, [safeModules, activeChapterId]);
  useEffect(() => {
    if (activeModuleView !== "assignments") return;
    if (chapterAssignments.length > 0) return;
    setActiveModuleView("content");
  }, [activeModuleView, chapterAssignments.length]);
  useEffect(() => {
    if (!activeChapter?.id) return;
    setChapterVisited((prev) => ({ ...prev, [activeChapter.id]: true }));
  }, [activeChapter?.id]);
  if (!activeChapter) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "forensic-app min-h-screen bg-[#0a0b0d] p-10 text-[#a1a8b3]", children: "No chapters were mapped from the D2L course map yet." });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "forensic-app min-h-screen bg-[radial-gradient(circle_at_18%_-10%,rgba(185,28,28,0.2),transparent_36%),radial-gradient(circle_at_84%_0%,rgba(148,163,184,0.12),transparent_34%),#0a0b0d] text-[#f3f4f6]", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: `
        .forensic-app {
          font-family: "Manrope", "Inter", "Segoe UI", sans-serif;
        }
        .forensic-app h1,
        .forensic-app h2,
        .forensic-app h3,
        .forensic-app h4 {
          font-family: "Space Grotesk", "Manrope", "Inter", sans-serif;
          letter-spacing: -0.015em;
        }
        .forensic-app * {
          transition-timing-function: cubic-bezier(0.2, 0, 0, 1);
        }
      ` }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex min-h-screen", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "aside",
        {
          className: `sticky top-0 h-screen shrink-0 overflow-hidden border-r border-white/[0.08] bg-[#101216]/90 backdrop-blur-xl transition-[width] duration-200 ${isChapterMenuCollapsed ? "w-16" : "w-[340px]"}`,
          "data-testid": "chapter-menu-panel",
          "data-collapsed": isChapterMenuCollapsed ? "true" : "false",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `border-b border-white/[0.08] ${isChapterMenuCollapsed ? "px-2 py-4" : "px-5 py-5"}`, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `mb-3 flex ${isChapterMenuCollapsed ? "justify-center" : "items-start justify-between gap-3"}`, children: [
                !isChapterMenuCollapsed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: FORENSIC_THEME.overline, children: "Case file" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { className: "mt-1 text-xl font-semibold text-[#f3f4f6]", children: resolvedCourse.title })
                ] }) : null,
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "button",
                  {
                    onClick: () => setIsChapterMenuCollapsed((prev) => !prev),
                    className: `flex h-10 w-10 items-center justify-center rounded-lg border transition duration-200 ${isChapterMenuCollapsed ? "border-[#dc2626]/70 bg-[#b91c1c] text-[#fef2f2] hover:bg-[#dc2626] hover:shadow-[0_0_0_1px_rgba(220,38,38,0.45)]" : "border-white/[0.14] bg-white/[0.04] text-[#d1d5db] hover:border-white/[0.28] hover:bg-white/[0.08] hover:text-[#f3f4f6]"}`,
                    "data-testid": "chapter-menu-toggle",
                    "aria-expanded": isChapterMenuCollapsed ? "false" : "true",
                    "aria-label": isChapterMenuCollapsed ? "Open chapter menu" : "Collapse chapter menu",
                    title: isChapterMenuCollapsed ? "Open chapter menu" : "Collapse chapter menu",
                    children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "flex flex-col gap-1.5", children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `block h-[2px] w-4 rounded-full ${isChapterMenuCollapsed ? "bg-[#fef2f2]" : "bg-[#d1d5db]"}` }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `block h-[2px] w-4 rounded-full ${isChapterMenuCollapsed ? "bg-[#fef2f2]" : "bg-[#d1d5db]"}` }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `block h-[2px] w-4 rounded-full ${isChapterMenuCollapsed ? "bg-[#fef2f2]" : "bg-[#d1d5db]"}` })
                    ] })
                  }
                )
              ] }),
              isChapterMenuCollapsed ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `${FORENSIC_THEME.panelSoft} p-3`, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mb-2 flex items-center justify-between text-sm", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-medium text-[#a1a8b3]", children: "Progress" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "font-semibold text-[#f3f4f6]", children: [
                      progress,
                      "%"
                    ] })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-2 overflow-hidden rounded-full bg-white/[0.08]", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-full rounded-full bg-[#b91c1c]", style: { width: `${progress}%` } }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mt-3 grid grid-cols-2 gap-2 text-xs text-[#6b7280]", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rounded-lg border border-white/[0.08] bg-white/[0.03] p-2", children: [
                      resolvedCourse.stats.topLevelSections,
                      " sections"
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rounded-lg border border-white/[0.08] bg-white/[0.03] p-2", children: [
                      resolvedCourse.stats.totalNodes,
                      " nodes"
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "relative mt-4", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "input",
                    {
                      value: query,
                      onChange: (e) => setQuery(e.target.value),
                      placeholder: "Search chapter titles",
                      className: "w-full rounded-lg border border-white/[0.12] bg-white/[0.03] py-2.5 pl-9 pr-3 text-sm text-[#e5e7eb] outline-none placeholder:text-[#6b7280] focus:border-[#b91c1c]/70",
                      "data-testid": "lesson-search"
                    }
                  )
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mt-3 flex items-center justify-between rounded-xl border border-white/[0.1] bg-white/[0.03] px-3 py-2.5", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: FORENSIC_THEME.overline, children: "Visibility" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "text-xs text-[#a1a8b3]", "data-testid": "mode-indicator", children: includeHidden ? "Archive mode" : "Learner mode" })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "button",
                    {
                      onClick: () => setIncludeHidden((prev) => !prev),
                      className: `rounded-lg border px-3 py-1.5 text-xs font-semibold transition duration-200 ${includeHidden ? "border-[#f59e0b]/40 bg-[#3b2b11] text-[#fcd34d]" : "border-[#b91c1c]/55 bg-[#1a1215] text-[#fecaca]"}`,
                      "data-testid": "mode-toggle",
                      children: includeHidden ? "Hide admin-only" : "Show archive"
                    }
                  )
                ] })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "div",
              {
                className: `${isChapterMenuCollapsed ? "hidden" : "h-[calc(100vh-245px)] overflow-y-auto px-3 py-4"}`,
                "data-testid": "module-list",
                children: safeModules.map((module) => {
                  const isActive = module.id === activeChapter.id;
                  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                    "div",
                    {
                      className: "mb-3 rounded-xl border border-white/[0.1] bg-[#141821] p-2 shadow-[0_14px_30px_rgba(0,0,0,0.35)]",
                      "data-testid": "module-panel",
                      "data-module-title": module.title,
                      "data-module-hidden": module.isHidden ? "true" : "false",
                      "data-module-expanded": isActive ? "true" : "false",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                          "button",
                          {
                            onClick: () => {
                              setActiveChapterId(module.id);
                              setActiveModuleView("content");
                            },
                            className: "flex w-full items-center justify-between rounded-lg px-2 py-2 text-left transition duration-200 hover:bg-white/[0.04]",
                            "data-testid": "module-toggle",
                            "data-module-title": module.title,
                            "data-expanded": isActive ? "true" : "false",
                            children: [
                              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "text-sm font-semibold text-[#f3f4f6]", children: formatModuleTitleForDisplay(module.title) }),
                                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "text-xs text-[#6b7280]", children: [
                                  module.lessonCount,
                                  " items in export"
                                ] })
                              ] }),
                              module.isHidden && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "hidden module" }),
                              isActive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4 text-[#a1a8b3]" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-4 w-4 text-[#6b7280]" })
                            ]
                          }
                        ),
                        isActive && module.lessons?.some((lesson) => lesson.type === "quiz" || lesson.type === "assignment") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-1 rounded-lg border border-white/[0.08] bg-white/[0.03] p-1", "data-testid": "module-submenu", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                          "button",
                          {
                            onClick: (event) => {
                              event.stopPropagation();
                              setActiveChapterId(module.id);
                              setActiveModuleView("assignments");
                            },
                            className: `flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs font-semibold uppercase tracking-[0.12em] transition ${activeModuleView === "assignments" ? "bg-[#1f1014] text-[#fecaca] ring-1 ring-[#dc2626]/45" : "text-[#a1a8b3] hover:bg-white/[0.06] hover:text-[#f3f4f6]"}`,
                            "data-testid": "module-assignments-tab",
                            "data-module-title": module.title,
                            children: [
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Assignments" }),
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[10px] text-[#6b7280]", children: module.lessons.filter((lesson) => lesson.type === "quiz" || lesson.type === "assignment").length })
                            ]
                          }
                        ) }) : null
                      ]
                    },
                    module.id
                  );
                })
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { className: "flex-1 overflow-y-auto", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "sticky top-0 z-10 border-b border-white/[0.08] bg-[#101216]/95 shadow-[0_10px_24px_rgba(0,0,0,0.45)] backdrop-blur-xl", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "px-8 py-5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mb-2 flex flex-wrap items-center gap-2 text-sm text-[#a1a8b3]", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[#f3f4f6]", children: formatModuleTitleForDisplay(activeChapter.title) }),
            includeHidden && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "archive mode" }),
            activeChapter.isHidden && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "admin-only" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { className: "text-3xl font-semibold tracking-tight text-[#f3f4f6]", "data-testid": "lesson-title", children: formatModuleTitleForDisplay(activeChapter.title) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-3", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: activeModuleView === "assignments" ? "assignments view" : "content view" }) })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto max-w-7xl px-8 py-10", children: activeModuleView === "assignments" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "space-y-6", "data-testid": "module-assignments-view", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: `${FORENSIC_THEME.panel} p-8`, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mb-5 flex items-center justify-between", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "text-xl font-semibold text-[#f3f4f6]", children: "Assignments" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { children: [
                chapterAssignments.length,
                " assessments"
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "text-sm text-[#a1a8b3]", children: [
              "Assessment items for ",
              formatModuleTitleForDisplay(activeChapter.title),
              " are grouped in this dedicated view."
            ] })
          ] }),
          chapterAssignments.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: `${FORENSIC_THEME.panel} p-8`, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "text-xl font-semibold text-[#f3f4f6]", children: "No assignments in this module" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "mt-3 text-sm text-[#a1a8b3]", children: "Return to the module content view or choose another module with assessment items." })
          ] }) : chapterAssignments.map((lesson) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChapterLessonCard, { lesson }, lesson.id))
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "space-y-6", "data-testid": "module-content-view", children: [
          chapterLessons.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: `${FORENSIC_THEME.panel} p-8`, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "text-xl font-semibold text-[#f3f4f6]", children: "No learner content in this module" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "mt-3 text-sm text-[#a1a8b3]", children: "This module currently contains only assessment items. Use the Assignments tab under the module name." })
          ] }) : null,
          chapterLessons.map((lesson) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChapterLessonCard, { lesson }, lesson.id))
        ] }) })
      ] })
    ] })
  ] });
}
var __canvasHelperRootElement = document.getElementById("root");
if (__canvasHelperRootElement) {
  __CanvasHelperReactDomClient.createRoot(__canvasHelperRootElement).render(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ForensicCoursePlayerPreviewRestored, {}));
}
export {
  ForensicCoursePlayerPreviewRestored as default
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
