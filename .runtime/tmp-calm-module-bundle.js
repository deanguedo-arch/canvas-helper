"use strict";
(() => {
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

  // projects/calm-module/workspace/main.jsx
  var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
  var { useState, useEffect, useMemo, useRef } = React;
  var Card = ({ children, className = "" }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `bg-white rounded-[2rem] p-6 md:p-10 mb-8 border-2 border-slate-100 shadow-[0_8px_0_0_#e2e8f0,0_15px_40px_rgba(0,0,0,0.05)] transition-all duration-300 print:break-inside-avoid print:shadow-none print:border-slate-300 ${className}`, children });
  var SectionTitle = ({ children, subtitle }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mb-10 text-center md:text-left print:break-after-avoid", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { className: "text-3xl md:text-4xl font-black text-slate-800 tracking-tight", children }),
    subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-3 inline-block bg-violet-100 text-violet-700 px-4 py-1.5 rounded-full text-sm font-bold border-2 border-violet-200 print:border-none print:bg-transparent print:p-0 print:text-slate-600", children: subtitle })
  ] });
  var Label = ({ children, description }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mb-2 mt-6 print:break-after-avoid", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "block text-base font-bold text-slate-700", children }),
    description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-sm font-medium text-slate-500 mt-1", children: description })
  ] });
  var HintToggle = ({ example }) => {
    const [isOpen, setIsOpen] = useState(false);
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mb-3 mt-1 print:hidden", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "button",
        {
          onClick: () => setIsOpen(!isOpen),
          className: "text-xs font-black uppercase tracking-wider text-violet-500 hover:text-violet-700 transition-colors flex items-center bg-violet-50 px-3 py-1.5 rounded-xl border-2 border-violet-100 hover:border-violet-300 active:bg-violet-100",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "fa-solid fa-lightbulb w-4 h-4 mr-2" }),
            isOpen ? "Hide Idea" : "Need an idea?"
          ]
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `transition-all duration-300 overflow-hidden ${isOpen ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"}`, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "p-4 bg-slate-50 text-slate-600 text-sm font-medium rounded-2xl border-2 border-slate-200 border-dashed", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { className: "text-slate-800 block mb-1", children: "Example Answer:" }),
        '"',
        example,
        '"'
      ] }) })
    ] });
  };
  var Input = ({ value, onChange, placeholder, type = "text" }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "input",
    {
      type,
      value,
      onChange,
      placeholder,
      className: "w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-5 py-4 text-slate-800 font-medium placeholder-slate-400 focus:bg-white focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-200 outline-none hover:border-violet-300 print:bg-white print:border-slate-300 print:shadow-none"
    }
  );
  var Textarea = ({ value, onChange, placeholder, rows = 3 }) => {
    const textareaRef = useRef(null);
    useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [value]);
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "textarea",
      {
        ref: textareaRef,
        value,
        onChange,
        placeholder,
        rows,
        className: "w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-5 py-4 text-slate-800 font-medium placeholder-slate-400 focus:bg-white focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-colors duration-200 outline-none hover:border-violet-300 resize-none leading-relaxed overflow-hidden print:bg-white print:border-slate-300 print:shadow-none"
      }
    );
  };
  var PillRadioGroup = ({ options, name, value, onChange }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex flex-wrap gap-3 mt-3 mb-6 print:break-inside-avoid", children: options.map((opt) => {
    const isSelected = value === opt;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "label",
      {
        className: `
                    cursor-pointer select-none inline-flex items-center px-5 py-3 rounded-2xl text-sm font-bold transition-all duration-200 border-2
                    ${isSelected ? "bg-violet-500 border-violet-600 text-white shadow-[0_4px_0_0_#5b21b6] translate-y-[-2px] print:bg-violet-100 print:text-violet-900 print:border-violet-400 print:shadow-none print:translate-y-0" : "bg-white border-slate-200 text-slate-600 shadow-[0_4px_0_0_#e2e8f0] hover:border-violet-200 hover:text-violet-600 active:translate-y-[2px] active:shadow-none print:shadow-none"}
                  `,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              type: "radio",
              name,
              value: opt,
              checked: isSelected,
              onChange: (e) => onChange(e.target.value),
              className: "sr-only"
            }
          ),
          opt
        ]
      },
      opt
    );
  }) });
  var KnowledgeDrop = ({ title, children, defaultOpen = true, color = "sky" }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const colorStyles = {
      sky: "bg-sky-50 border-sky-200 text-sky-900 shadow-[0_4px_0_0_#bae6fd]",
      amber: "bg-amber-50 border-amber-200 text-amber-900 shadow-[0_4px_0_0_#fde68a]",
      emerald: "bg-emerald-50 border-emerald-200 text-emerald-900 shadow-[0_4px_0_0_#a7f3d0]",
      rose: "bg-rose-50 border-rose-200 text-rose-900 shadow-[0_4px_0_0_#fecdd3]",
      violet: "bg-violet-50 border-violet-200 text-violet-900 shadow-[0_4px_0_0_#ddd6fe]"
    };
    const iconColors = {
      sky: "bg-sky-200 text-sky-700",
      amber: "bg-amber-200 text-amber-700",
      emerald: "bg-emerald-200 text-emerald-700",
      rose: "bg-rose-200 text-rose-700",
      violet: "bg-violet-200 text-violet-700"
    };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `rounded-2xl border-2 mb-8 transition-all duration-300 overflow-hidden print:break-inside-avoid print:shadow-none ${colorStyles[color]}`, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "button",
        {
          onClick: () => setIsOpen(!isOpen),
          className: "w-full flex items-center justify-between p-4 md:p-5 focus:outline-none focus:bg-white/50 transition-colors print:hidden",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `p-2 rounded-xl flex items-center justify-center ${iconColors[color]}`, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "fa-solid fa-lightbulb text-lg" }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "font-black text-lg md:text-xl tracking-tight", children: [
                "Read This First: ",
                title
              ] })
            ] }),
            isOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "fa-solid fa-chevron-up text-xl opacity-60" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "fa-solid fa-chevron-down text-xl opacity-60" })
          ]
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "hidden print:flex items-center gap-3 p-4 border-b-2 border-slate-200", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "fa-solid fa-lightbulb w-5 h-5" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "font-black text-lg tracking-tight", children: [
          "Read This First: ",
          title
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `transition-all duration-300 ease-in-out print:max-h-none print:opacity-100 ${isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "p-5 md:p-6 pt-0 text-base font-medium leading-relaxed opacity-90 border-t-2 border-white/40 mt-2 print:border-none print:pt-4", children }) })
    ] });
  };
  var hasTeacherReportValue = (value) => {
    if (typeof value === "string") return value.trim().length > 0;
    if (value === null || value === void 0) return false;
    if (Array.isArray(value)) return value.some((item) => hasTeacherReportValue(item));
    if (typeof value === "object") return Object.values(value).some((item) => hasTeacherReportValue(item));
    return true;
  };
  var escapeTeacherReportHtml = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  var renderTeacherReportAnswer = (value) => {
    if (!hasTeacherReportValue(value)) {
      return '<span class="answer-empty-chip">Not answered</span>';
    }
    return `<div class="report-answer">${escapeTeacherReportHtml(String(value)).replace(/\n/g, "<br>")}</div>`;
  };
  var renderTeacherReportCardGrid = (items) => items.map((item) => `
            <article class="report-card">
                <h3>${escapeTeacherReportHtml(item.label)}</h3>
                ${renderTeacherReportAnswer(item.value)}
            </article>
        `).join("");
  var buildTeacherReportSection = (eyebrow, title, content) => `
            <section class="report-section">
                <div class="report-section-heading">
                    <p class="report-section-eyebrow">${escapeTeacherReportHtml(eyebrow)}</p>
                    <h2>${escapeTeacherReportHtml(title)}</h2>
                </div>
                ${content}
            </section>
        `;
  function buildCalmModule1TeacherReport(fd, { overallPercentage }) {
    const inventorySection = buildTeacherReportSection(
      "Module 1",
      "My Inventory",
      `<div class="report-grid">
                    ${renderTeacherReportCardGrid([
        { label: "How much sleep do I need?", value: fd.invSleep },
        { label: "Best snacks for energy?", value: fd.invSnacks },
        { label: "Times of day I need to eat?", value: fd.invEatTimes },
        { label: "Time I have the MOST energy?", value: fd.invEnergyHigh },
        { label: "Time I have the LEAST energy?", value: fd.invEnergyLow },
        { label: "Exercise that energizes me?", value: fd.invExerciseEnergize },
        { label: "Activities that help me relax?", value: fd.invRelax },
        { label: "Pencils or pens?", value: fd.invPencilsPens },
        { label: "How do I stay organized?", value: fd.invOrganized },
        { label: "Write or type assignments?", value: fd.invWriteType },
        { label: "Are electronics distracting?", value: fd.invElectronics },
        { label: "Does music help me study?", value: fd.invMusic },
        { label: "Where do I prefer to sit?", value: fd.invSit },
        { label: "Best reading format?", value: fd.invReadFrom },
        { label: "Does paper color matter?", value: fd.invColor },
        { label: "Does print type matter?", value: fd.invPrintType },
        { label: "Do I prefer to make my own goals, or have a teacher make them? Explain.", value: fd.invGoals },
        { label: "Tricks I use to keep myself focused:", value: fd.invFocusTricks },
        { label: "Special things teachers can do to help me:", value: fd.invTeacherHelp }
      ])}
                 </div>`
    );
    const goalsSection = buildTeacherReportSection(
      "Module 2",
      "Goal Setting",
      `<div class="report-grid">
                    ${renderTeacherReportCardGrid([
        { label: "Here's what I want to achieve", value: fd.goalAchieve },
        { label: "My main MEASURE for this achievement", value: fd.goalMeasure },
        { label: "Who?", value: fd.goalWho },
        { label: "How?", value: fd.goalHow },
        { label: "What?", value: fd.goalWhat },
        { label: "When?", value: fd.goalWhen },
        { label: "Is it ATTAINABLE (in your control)? Explain.", value: fd.goalAttainable },
        { label: "Is it REALISTIC? Explain.", value: fd.goalRealistic },
        { label: "Is it TIMED (has a deadline)? Explain.", value: fd.goalTimed },
        { label: "Why is goal setting important?", value: fd.goalImportance },
        { label: "What other goals could you set?", value: fd.goalOther }
      ])}
                </div>`
    );
    const romanticSection = buildTeacherReportSection(
      "Module 3",
      "Romantic Relationships",
      `<div class="report-grid">
                     ${renderTeacherReportCardGrid([
        { label: "What was easiest to rank? Explain.", value: fd.romEasiest },
        { label: "What was most difficult? Explain.", value: fd.romHardest },
        { label: "Where do your ideas about a 'normal' relationship come from?", value: fd.romNormal },
        { label: "What happens if a relationship skips steps or progresses unhealthily?", value: fd.romUnhealthyProg }
      ])}
                </div>`
    );
    const evaluatingSection = buildTeacherReportSection(
      "Module 4",
      "Evaluating Relationships",
      `<div class="report-grid">
                    ${renderTeacherReportCardGrid([
        { label: "How do you feel in a healthy relationship?", value: fd.evalFeelHealthy },
        { label: "How do you feel in an unhealthy relationship?", value: fd.evalFeelUnhealthy },
        { label: "Why do people stay in unhealthy relationships?", value: fd.evalWhyStay }
      ])}
                </div>`
    );
    const alcoholSection = buildTeacherReportSection(
      "Module 5",
      "Alcohol Awareness",
      `<div class="report-grid">
                    ${renderTeacherReportCardGrid([
        { label: "Why do you think people drink?", value: fd.alcWhyDrink },
        { label: "What do you personally think about alcohol?", value: fd.alcThoughts },
        { label: "Why is it tied to holidays/celebrations?", value: fd.alcCelebrate },
        { label: "What would you say if offered a drink?", value: fd.alcOffered },
        { label: "How much should you drink? Explain.", value: fd.alcHowMuch },
        { label: "Who could you speak to if you wanted to learn more about alcohol? List 2 resources.", value: fd.alcResources }
      ])}
                </div>`
    );
    const tobaccoSection = buildTeacherReportSection(
      "Module 6",
      "Vaping & Tobacco Awareness",
      `<div class="report-grid">
                    ${renderTeacherReportCardGrid([
        { label: "What do you know about traditional cigarettes?", value: fd.tobKnow },
        { label: "What do you know about Vapes / E-cigarettes?", value: fd.vapeKnow },
        { label: "Why do you think teens start vaping?", value: fd.vapeWhy },
        { label: "Cannabis is legal in Canada. What are your thoughts on its use among teenagers?", value: fd.weedThoughts },
        { label: "If a friend wanted to start vaping or smoking, how would you convince them not to?", value: fd.tobConvince }
      ])}
                </div>`
    );
    const riskSection = buildTeacherReportSection(
      "Module 7",
      "Risk Taking",
      `<div class="report-grid">
                    ${renderTeacherReportCardGrid([
        { label: "How did you determine how 'risky' a situation was? Explain your logic.", value: fd.riskDetermine },
        { label: "Why do you think someone would WANT to take an unhealthy risk?", value: fd.riskWhyUnhealthy }
      ])}
                </div>`
    );
    const addictionsSection = buildTeacherReportSection(
      "Module 8",
      "Addictions",
      `<div class="report-grid">
                    ${renderTeacherReportCardGrid([
        { label: "Define the term 'addiction' using a dictionary", value: fd.addDefine },
        { label: "List 3 different things people can be addicted to", value: fd.addTypes },
        { label: "Scenario 1: Rachel", value: fd.addScen1 },
        { label: "Scenario 2: Antoine", value: fd.addScen2 },
        { label: "Scenario 3: Bailey", value: fd.addScen3 }
      ])}
                </div>`
    );
    const mentalHealthSection = buildTeacherReportSection(
      "Module 9",
      "Mental Health",
      `<div class="report-grid">
                    ${renderTeacherReportCardGrid([
        { label: "Why is it hard to talk about?", value: fd.mhHardTalk },
        { label: "Emotions tied to depression?", value: fd.mhEmotions },
        { label: "How to spot it in a friend?", value: fd.mhKnowWrong },
        { label: "How to help a friend who is depressed?", value: fd.mhHelpFriend },
        { label: "What to do if YOU feel depressed?", value: fd.mhHelpSelf }
      ])}
                </div>`
    );
    const taskASection = buildTeacherReportSection(
      "Summative Task A",
      "Life Map",
      `<div class="report-grid">
                    ${renderTeacherReportCardGrid([
        { label: "Proudest accomplishment? Why?", value: fd.mapAccomplish },
        { label: "Hardest obstacle? Why?", value: fd.mapObstacle },
        { label: "Strategies used to manage changes?", value: fd.mapStrategies },
        { label: "Skills gained from obstacles?", value: fd.mapSkills }
      ])}
                </div>
                ${fd.mapImageData ? `<div class="image-card"><img src="${fd.mapImageData}" alt="Student Life Map" /></div>` : ""}
                `
    );
    const taskBSection = buildTeacherReportSection(
      "Summative Task B",
      "Inside Out",
      `<div class="report-grid">
                    ${renderTeacherReportCardGrid([
        { label: "1. Joy is usually in charge of Riley. Which emotion(s) do you feel most often? Explain.", value: fd.ioQ1 },
        { label: "2. Riley moves to San Francisco. Have you ever gone through a big transition? Explain.", value: fd.ioQ2 },
        { label: "3. How are the glowing 'core memories' made? What might yours be?", value: fd.ioQ3 },
        { label: "4. What do the core memories have to do with Riley's personality? Explain.", value: fd.ioQ4 },
        { label: "5. Sadness colors a memory blue. Can our current moods color our past memories? Explain.", value: fd.ioQ5 },
        { label: "6. Were the core memories changed forever, or just temporarily filtered? Explain.", value: fd.ioQ6 },
        { label: "7. Riley feels pressure to be a 'happy girl'. Is this fair of her mom to ask? Explain.", value: fd.ioQ7 },
        { label: "8. Does society value certain emotions over others? Which ones? Explain.", value: fd.ioQ8 },
        { label: "9. Why does Joy learn that Sadness is also important?", value: fd.ioQ9 },
        { label: "10. Is it easier for certain demographics (age/gender) to express different emotions? Why?", value: fd.ioQ10 }
      ])}
                </div>`
    );
    const reportHtml = `<!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>CALM Module 1 Teacher Report</title>
                    <style>
                        :root { color-scheme: light; --ink: #0f172a; --muted: #475569; --line: #dbe4f0; --panel: #ffffff; --panel-soft: #f8fafc; --accent: #6d28d9; --accent-soft: #f5f3ff; --warning: #92400e; --warning-soft: #fff7ed; }
                        * { box-sizing: border-box; }
                        body { margin: 0; padding: 2rem; background: #f1f5f9; color: var(--ink); font-family: Inter, "Segoe UI", Arial, sans-serif; }
                        .report-shell { max-width: 1100px; margin: 0 auto; }
                        .report-hero { background: linear-gradient(135deg, #4c1d95, #7c3aed 52%, #c4b5fd); color: white; border-radius: 2rem; padding: 2rem; margin-bottom: 1.5rem; box-shadow: 0 24px 60px rgba(76, 29, 149, 0.22); }
                        .report-hero h1 { margin: 0 0 0.6rem; font-size: 2rem; line-height: 1.05; }
                        .report-hero p { margin: 0; color: rgba(255, 255, 255, 0.88); font-size: 1rem; }
                        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 0.9rem; margin-top: 1.4rem; }
                        .summary-stat { background: rgba(255, 255, 255, 0.14); border: 1px solid rgba(255, 255, 255, 0.18); border-radius: 1.25rem; padding: 0.95rem 1rem; }
                        .summary-stat-label { display: block; font-size: 0.72rem; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255, 255, 255, 0.74); margin-bottom: 0.35rem; }
                        .summary-stat-value { font-size: 1.05rem; font-weight: 800; line-height: 1.35; }
                        .report-section { background: var(--panel); border: 1px solid var(--line); border-radius: 1.8rem; padding: 1.4rem; margin-bottom: 1.2rem; box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06); }
                        .report-section-heading { margin-bottom: 1rem; }
                        .report-section-eyebrow { margin: 0 0 0.3rem; font-size: 0.72rem; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); }
                        .report-section-heading h2 { margin: 0; font-size: 1.45rem; line-height: 1.15; }
                        .report-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 0.9rem; }
                        .report-card { background: var(--panel-soft); border: 1px solid var(--line); border-radius: 1.25rem; padding: 1rem; break-inside: avoid; }
                        .report-card-wide { grid-column: 1 / -1; }
                        .report-card h3 { margin: 0 0 0.65rem; font-size: 0.75rem; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
                        .report-answer { font-size: 0.95rem; line-height: 1.6; color: var(--ink); }
                        .answer-empty-chip { display: inline-flex; align-items: center; gap: 0.35rem; border-radius: 999px; padding: 0.3rem 0.7rem; background: var(--warning-soft); color: var(--warning); font-size: 0.8rem; font-weight: 700; }
                        .image-card { background: white; border: 1px solid var(--line); border-radius: 1.5rem; padding: 1rem; margin-top: 1rem; }
                        .image-card img { display: block; max-width: 100%; height: auto; border-radius: 1rem; border: 1px solid var(--line); }
                        @media print { body { background: white; padding: 0; } .report-hero { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
                    </style>
                </head>
                <body>
                    <div class="report-shell">
                        <header class="report-hero">
                            <h1>CALM Module 1 Teacher Report</h1>
                            <p>Personal Choices response summary for review, printing, and discussion.</p>
                            <div class="summary-grid">
                                <div class="summary-stat"><span class="summary-stat-label">Student</span><div class="summary-stat-value">${hasTeacherReportValue(fd.studentName) ? escapeTeacherReportHtml(fd.studentName) : "Not provided"}</div></div>
                                <div class="summary-stat"><span class="summary-stat-label">Progress</span><div class="summary-stat-value">${overallPercentage}%</div></div>
                                <div class="summary-stat"><span class="summary-stat-label">Generated</span><div class="summary-stat-value">${escapeTeacherReportHtml((/* @__PURE__ */ new Date()).toLocaleString())}</div></div>
                            </div>
                        </header>
                        ${inventorySection}
                        ${goalsSection}
                        ${romanticSection}
                        ${evaluatingSection}
                        ${alcoholSection}
                        ${tobaccoSection}
                        ${riskSection}
                        ${addictionsSection}
                        ${mentalHealthSection}
                        ${taskASection}
                        ${taskBSection}
                    </div>
                </body>
            </html>`;
    return reportHtml;
  }
  function App() {
    const [activeTab, setActiveTab] = useState("overview");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [printMode, setPrintMode] = useState(false);
    const [saveStatus, setSaveStatus] = useState("Saved");
    const prevStatsRef = useRef();
    const defaultFormData = {
      studentName: "",
      invSleep: "",
      invSnacks: "",
      invEatTimes: "",
      invEnergyHigh: "",
      invEnergyLow: "",
      invExerciseEnergize: "",
      invExerciseTired: "",
      invRelax: "",
      invPencilsPens: "",
      invOrganized: "",
      invWriteType: "",
      invElectronics: "",
      invMusic: "",
      invSit: "",
      invReadFrom: "",
      invColor: "",
      invPrintType: "",
      invSizeSpacing: "",
      invGoals: "",
      invDirections: {},
      invFocusTricks: "",
      invTeacherHelp: "",
      goalAchieve: "",
      goalMeasure: "",
      goalWho: "",
      goalWhat: "",
      goalWhen: "",
      goalHow: "",
      goalAttainable: "",
      goalRealistic: "",
      goalTimed: "",
      goalImportance: "",
      goalOther: "",
      romRankings: {},
      romEasiest: "",
      romHardest: "",
      romNormal: "",
      romUnhealthyProg: "",
      evalRels: ["", "", "", "", ""],
      evalHealthyList: ["", "", "", "", ""],
      evalUnhealthyList: ["", "", "", "", ""],
      evalFeelHealthy: "",
      evalFeelUnhealthy: "",
      evalWhyStay: "",
      alcWhyDrink: "",
      alcThoughts: "",
      alcCelebrate: "",
      alcOffered: "",
      alcHowMuch: "",
      alcProsCons: [{ pro: "", con: "" }, { pro: "", con: "" }, { pro: "", con: "" }],
      alcResources: "",
      tobKnow: "",
      tobNeg: "",
      tobPos: "",
      tobWhyStart: "",
      tobConvince: "",
      vapeKnow: "",
      vapeWhy: "",
      weedThoughts: "",
      riskRatings: {},
      riskHealthy: ["", "", "", "", ""],
      riskUnhealthy: ["", "", "", "", ""],
      riskDetermine: "",
      riskWhyUnhealthy: "",
      addDefine: "",
      addTypes: "",
      addScen1: "",
      addScen2: "",
      addScen3: "",
      mhHardTalk: "",
      mhEmotions: "",
      mhKnowWrong: "",
      mhHelpFriend: "",
      mhHelpSelf: "",
      mapAccomplish: "",
      mapObstacle: "",
      mapStrategies: "",
      mapSkills: "",
      mapImageData: "",
      ioQ1: "",
      ioQ2: "",
      ioQ3: "",
      ioQ4: "",
      ioQ5: "",
      ioQ6: "",
      ioQ7: "",
      ioQ8: "",
      ioQ9: "",
      ioQ10: ""
    };
    const [formData, setFormData] = useState(() => {
      try {
        const saved = localStorage.getItem("calm_workbook_data");
        if (saved) {
          const parsed = JSON.parse(saved);
          const getArray = (val, defaultVal) => Array.isArray(val) ? val : defaultVal;
          const getObj = (val, defaultVal) => typeof val === "object" && val !== null ? val : defaultVal;
          return {
            ...defaultFormData,
            ...parsed,
            studentName: parsed.studentName || "",
            evalRels: getArray(parsed.evalRels, defaultFormData.evalRels),
            evalHealthyList: getArray(parsed.evalHealthyList, defaultFormData.evalHealthyList),
            evalUnhealthyList: getArray(parsed.evalUnhealthyList, defaultFormData.evalUnhealthyList),
            alcProsCons: getArray(parsed.alcProsCons, defaultFormData.alcProsCons),
            riskHealthy: getArray(parsed.riskHealthy, defaultFormData.riskHealthy),
            riskUnhealthy: getArray(parsed.riskUnhealthy, defaultFormData.riskUnhealthy),
            invDirections: getObj(parsed.invDirections, defaultFormData.invDirections),
            romRankings: getObj(parsed.romRankings, defaultFormData.romRankings),
            riskRatings: getObj(parsed.riskRatings, defaultFormData.riskRatings)
          };
        }
      } catch (e) {
        console.error("Failed to parse saved data, resetting to default.", e);
      }
      return defaultFormData;
    });
    useEffect(() => {
      setSaveStatus("Saving...");
      localStorage.setItem("calm_workbook_data", JSON.stringify(formData));
      const timeoutId = setTimeout(() => setSaveStatus("Saved"), 500);
      return () => clearTimeout(timeoutId);
    }, [formData]);
    const updateForm = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));
    const updateArrayField = (field, index, value) => {
      const newArr = [...formData[field]];
      newArr[index] = value;
      updateForm(field, newArr);
    };
    const handleResetWorkbook = () => {
      if (window.confirm("\u{1F6A8} WARNING: This will completely delete all your answers. Are you sure you want to start over?")) {
        setFormData(defaultFormData);
        localStorage.removeItem("calm_workbook_data");
        setActiveTab("overview");
        window.scrollTo(0, 0);
      }
    };
    const progressData = useMemo(() => {
      const getCompletedCount = (fields) => {
        return fields.reduce((acc, f) => {
          if (typeof f === "string" && f.trim() !== "") return acc + 1;
          if (typeof f === "number") return acc + 1;
          if (Array.isArray(f) && f.length > 0) return acc + f.filter((v) => String(v).trim() !== "").length;
          if (typeof f === "object" && f !== null && Object.keys(f).length > 0) return acc + Object.values(f).filter((v) => String(v).trim() !== "").length;
          return acc;
        }, 0);
      };
      const stats = {
        overview: { completed: 1, total: 1 },
        inventory: {
          completed: getCompletedCount([
            formData.invSleep,
            formData.invSnacks,
            formData.invEatTimes,
            formData.invEnergyHigh,
            formData.invEnergyLow,
            formData.invExerciseEnergize,
            formData.invExerciseTired,
            formData.invRelax,
            formData.invPencilsPens,
            formData.invOrganized,
            formData.invWriteType,
            formData.invElectronics,
            formData.invMusic,
            formData.invSit,
            formData.invReadFrom,
            formData.invColor,
            formData.invPrintType,
            formData.invSizeSpacing,
            formData.invGoals,
            formData.invFocusTricks,
            formData.invTeacherHelp,
            formData.invDirections
          ]),
          total: 22
        },
        goals: {
          completed: getCompletedCount([
            formData.goalAchieve,
            formData.goalMeasure,
            formData.goalWho,
            formData.goalHow,
            formData.goalWhat,
            formData.goalWhen,
            formData.goalAttainable,
            formData.goalRealistic,
            formData.goalTimed,
            formData.goalImportance,
            formData.goalOther
          ]),
          total: 11
        },
        romantic: {
          completed: getCompletedCount([
            formData.romEasiest,
            formData.romHardest,
            formData.romNormal,
            formData.romUnhealthyProg,
            formData.romRankings
          ]),
          total: 5
        },
        evaluating: {
          completed: getCompletedCount([
            formData.evalRels,
            formData.evalHealthyList,
            formData.evalUnhealthyList,
            formData.evalFeelHealthy,
            formData.evalFeelUnhealthy,
            formData.evalWhyStay
          ]),
          total: 6
        },
        alcohol: {
          completed: getCompletedCount([
            formData.alcWhyDrink,
            formData.alcThoughts,
            formData.alcCelebrate,
            formData.alcOffered,
            formData.alcHowMuch,
            formData.alcResources,
            formData.alcProsCons
          ]),
          total: 7
        },
        tobacco: {
          completed: getCompletedCount([
            formData.tobKnow,
            formData.tobNeg,
            formData.tobPos,
            formData.tobWhyStart,
            formData.tobConvince,
            formData.vapeKnow,
            formData.vapeWhy,
            formData.weedThoughts
          ]),
          total: 8
        },
        risk: {
          completed: getCompletedCount([
            formData.riskDetermine,
            formData.riskWhyUnhealthy,
            formData.riskHealthy,
            formData.riskUnhealthy,
            formData.riskRatings
          ]),
          total: 5
        },
        addictions: {
          completed: getCompletedCount([
            formData.addDefine,
            formData.addTypes,
            formData.addScen1,
            formData.addScen2,
            formData.addScen3
          ]),
          total: 5
        },
        mentalhealth: {
          completed: getCompletedCount([
            formData.mhHardTalk,
            formData.mhEmotions,
            formData.mhKnowWrong,
            formData.mhHelpFriend,
            formData.mhHelpSelf
          ]),
          total: 5
        },
        taskA: {
          completed: getCompletedCount([
            formData.mapAccomplish,
            formData.mapObstacle,
            formData.mapStrategies,
            formData.mapSkills,
            formData.mapImageData
          ]),
          total: 5
        },
        taskB: {
          completed: getCompletedCount([
            formData.ioQ1,
            formData.ioQ2,
            formData.ioQ3,
            formData.ioQ4,
            formData.ioQ5,
            formData.ioQ6,
            formData.ioQ7,
            formData.ioQ8,
            formData.ioQ9,
            formData.ioQ10
          ]),
          total: 10
        }
      };
      let totalCompleted = 0;
      let totalFields = 0;
      Object.keys(stats).forEach((key) => {
        totalCompleted += stats[key].completed;
        totalFields += stats[key].total;
        stats[key].isComplete = stats[key].completed >= stats[key].total;
      });
      const overallPercentage = totalFields === 0 ? 0 : Math.round(totalCompleted / totalFields * 100);
      return { stats, overallPercentage };
    }, [formData]);
    useEffect(() => {
      if (!prevStatsRef.current) {
        prevStatsRef.current = progressData.stats;
        return;
      }
      let newlyCompleted = false;
      Object.keys(progressData.stats).forEach((key) => {
        const isNowComplete = progressData.stats[key].isComplete;
        const wasComplete = prevStatsRef.current[key]?.isComplete;
        if (isNowComplete && !wasComplete) {
          newlyCompleted = true;
        }
      });
      if (newlyCompleted && window.confetti) {
        const duration = 2e3;
        const end = Date.now() + duration;
        (function frame() {
          window.confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ["#8b5cf6", "#10b981", "#f59e0b", "#f43f5e", "#0ea5e9"],
            zIndex: 9999
          });
          window.confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ["#8b5cf6", "#10b981", "#f59e0b", "#f43f5e", "#0ea5e9"],
            zIndex: 9999
          });
          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        })();
      }
      prevStatsRef.current = progressData.stats;
    }, [progressData]);
    const relationshipSteps = [
      "Intercourse",
      "Talking On The Phone",
      "Basic Communication (Shared Interests)",
      "Exchanging Messages",
      '"Steady" Dating (Exclusive)',
      "Dating",
      "Basic Trust (Keeping Secrets)",
      "Birth Control and STI Protection",
      "Simple Kissing",
      "Minor Touching (Holding Hands)",
      "Intimacy (Non-Sexual)",
      "Love",
      "Eye Contact",
      "Long-Term Commitment",
      "Touching (Long Embraces)",
      "Flirting"
    ];
    const riskQuestions = [
      "1. Rate the risk of singing in a choir in front of the entire school.",
      "2. What if there is a long solo part where you have to sing by yourself?",
      "3. How would you rate the risk of trying cannabis at a party for the first time?",
      "4. What if you know people who are dependent on using cannabis on a regular basis?",
      "5. How would you rate driving 15 km over the speed limit on the highway?",
      "6. What if the road is dry and there is hardly any traffic?",
      "7. Rate the risk of standing up for something you strongly believe in?",
      "8. What if your friends are against you and this creates conflict?",
      "9. Rate the risk of drinking two beers before going to a party.",
      '10. What if you have "blacked out" at parties before?',
      "11. Rate the risk of buying a $5.00 raffle ticket.",
      "12. What if it is your last $5.00 until the end of the week?",
      "13. Rate the risk of speaking in a debate.",
      "14. What if your opponent is the Prime Minister of Canada?",
      "15. How risky would you find being involved in a sporting event?",
      "16. What if your skill level is very low in this sport?",
      "17. Rate the risk of injecting a drug using a needle.",
      "18. What if someone else has used the needle before?",
      "19. Rate the risk of smoking a cigarette every so often.",
      "20. What if you knew that this would lead to a pack-a-day habit?"
    ];
    const tabs = [
      { id: "overview", label: "Overview", icon: "fa-solid fa-book-open", color: "text-sky-500", bg: "bg-sky-100" },
      { id: "inventory", label: "My Inventory", icon: "fa-regular fa-square-check", color: "text-amber-500", bg: "bg-amber-100" },
      { id: "goals", label: "Goal Setting", icon: "fa-solid fa-bullseye", color: "text-emerald-500", bg: "bg-emerald-100" },
      { id: "romantic", label: "Romance", icon: "fa-solid fa-heart", color: "text-rose-500", bg: "bg-rose-100" },
      { id: "evaluating", label: "Relationships", icon: "fa-solid fa-users", color: "text-orange-500", bg: "bg-orange-100" },
      { id: "alcohol", label: "Alcohol", icon: "fa-solid fa-wine-glass", color: "text-fuchsia-500", bg: "bg-fuchsia-100" },
      { id: "tobacco", label: "Vapes & Tobacco", icon: "fa-solid fa-ban", color: "text-slate-500", bg: "bg-slate-200" },
      { id: "risk", label: "Risk Taking", icon: "fa-solid fa-triangle-exclamation", color: "text-red-500", bg: "bg-red-100" },
      { id: "addictions", label: "Addictions", icon: "fa-solid fa-wave-square", color: "text-indigo-500", bg: "bg-indigo-100" },
      { id: "mentalhealth", label: "Mental Health", icon: "fa-solid fa-brain", color: "text-cyan-500", bg: "bg-cyan-100" },
      { id: "taskA", label: "Life Map", icon: "fa-solid fa-map", color: "text-lime-600", bg: "bg-lime-100" },
      { id: "taskB", label: "Inside Out", icon: "fa-solid fa-film", color: "text-purple-500", bg: "bg-purple-100" },
      { id: "submit", label: "Final Review", icon: "fa-solid fa-file-circle-check", color: "text-blue-500", bg: "bg-blue-100" }
    ];
    const handlePrint = () => {
      setPrintMode(true);
      setTimeout(() => {
        window.print();
        setPrintMode(false);
      }, 500);
    };
    const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          let scaleSize = 1;
          if (img.width > MAX_WIDTH) {
            scaleSize = MAX_WIDTH / img.width;
          }
          canvas.width = img.width * scaleSize;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
          updateForm("mapImageData", compressedDataUrl);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    };
    const generateTeacherExport = () => {
      const { overallPercentage } = progressData;
      if (overallPercentage === 0) {
        window.alert("There is nothing to print yet. Add some responses first.");
        return;
      }
      const reportHtml = buildCalmModule1TeacherReport(formData, { overallPercentage });
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        window.alert("Print preview was blocked. Allow pop-ups for this site and try again.");
        return;
      }
      printWindow.document.open();
      printWindow.document.write(reportHtml);
      printWindow.document.close();
      window.setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 250);
    };
    const renderOverview = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { className: "border-t-[8px] border-t-violet-500", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex flex-col items-center text-center mb-12 print:mb-6", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-20 h-20 bg-violet-100 rounded-[2rem] flex items-center justify-center mb-6 shadow-[0_4px_0_0_#ddd6fe] print:shadow-none print:border-2 print:border-violet-200", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "fa-solid fa-book-open text-4xl text-violet-600" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { className: "text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-4", children: "nextSTEP High School" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex flex-wrap justify-center gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "bg-slate-100 text-slate-600 px-4 py-2 rounded-xl font-bold text-sm border-2 border-slate-200", children: "Fort Saskatchewan" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "bg-slate-100 text-slate-600 px-4 py-2 rounded-xl font-bold text-sm border-2 border-slate-200", children: "Sherwood Park" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "bg-slate-100 text-slate-600 px-4 py-2 rounded-xl font-bold text-sm border-2 border-slate-200", children: "Vegreville" })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mb-10 bg-blue-50 p-6 rounded-[2rem] border-2 border-blue-100 text-center print:bg-white print:border-2 print:border-slate-300", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "font-bold text-blue-800 print:text-slate-800", children: "\u{1F44B} Welcome! Your progress is automatically saved to your browser as you work. When you are finished, click the Final Review tab to verify your answers." }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mt-4", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Student Name" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { value: formData.studentName, onChange: (e) => updateForm("studentName", e.target.value), placeholder: "Enter your name here" })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { children: "Career & Life Management" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "text-slate-600 space-y-6 text-lg font-medium leading-relaxed print:text-base", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "CALM is a compulsory course for Alberta High School students. It is the final component of the grade 1-12 Health Promotion Program. It is a 3 credit course, and is broken up into 3 modules." }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "The aim of CALM is to enable students to make well informed, considered decisions and choices in all aspects of their lives." }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-slate-50 rounded-[2rem] p-8 mt-8 border-2 border-slate-200 shadow-[inset_0_4px_10px_rgba(0,0,0,0.02)] print:bg-white print:shadow-none print:border-slate-300 print:break-inside-avoid", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "font-black text-slate-800 mb-6 text-2xl", children: "The 3 Pillars of Life Choices:" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "space-y-4", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-start bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm print:shadow-none print:border-slate-300", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center font-black text-xl mr-4 flex-shrink-0", children: "1" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { className: "text-slate-800 text-lg block mb-1", children: "Personal Choices" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-sm", children: "Apply understanding of well-being and personal health to daily teenage decisions." })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-start bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm print:shadow-none print:border-slate-300", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-xl mr-4 flex-shrink-0", children: "2" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { className: "text-slate-800 text-lg block mb-1", children: "Resource Choices" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-sm", children: "Understand and make responsible decisions in the use of your resources." })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-start bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm print:shadow-none print:border-slate-300", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-black text-xl mr-4 flex-shrink-0", children: "3" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { className: "text-slate-800 text-lg block mb-1", children: "Career & Life Choices" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-sm", children: "Develop processes for managing personal and lifelong career growth." })
              ] })
            ] })
          ] })
        ] })
      ] })
    ] });
    const renderInventory = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { subtitle: "Consider who you are, what you value, and what works best for you.", children: "What Works For Me" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mb-12 print:break-inside-avoid", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { className: "text-2xl font-black text-slate-800 mb-6 flex items-center", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "bg-sky-100 text-sky-600 w-10 h-10 rounded-xl flex items-center justify-center mr-3 border-2 border-sky-200 shadow-sm print:shadow-none", children: "1" }),
          "Looking after myself"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 bg-sky-50 p-6 md:p-8 rounded-[2rem] border-2 border-sky-100 print:bg-white print:border-slate-300", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "How much sleep do I need?" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { value: formData.invSleep, onChange: (e) => updateForm("invSleep", e.target.value) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Best snacks for energy?" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { value: formData.invSnacks, onChange: (e) => updateForm("invSnacks", e.target.value) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Times of day I need to eat?" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { value: formData.invEatTimes, onChange: (e) => updateForm("invEatTimes", e.target.value) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Time I have the MOST energy?" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { value: formData.invEnergyHigh, onChange: (e) => updateForm("invEnergyHigh", e.target.value) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Time I have the LEAST energy?" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { value: formData.invEnergyLow, onChange: (e) => updateForm("invEnergyLow", e.target.value) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Exercise that energizes me?" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { value: formData.invExerciseEnergize, onChange: (e) => updateForm("invExerciseEnergize", e.target.value) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "md:col-span-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Activities that help me relax?" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { value: formData.invRelax, onChange: (e) => updateForm("invRelax", e.target.value) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mb-12 print:break-inside-avoid", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { className: "text-2xl font-black text-slate-800 mb-6 flex items-center", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "bg-amber-100 text-amber-600 w-10 h-10 rounded-xl flex items-center justify-center mr-3 border-2 border-amber-200 shadow-sm print:shadow-none", children: "2" }),
          "Tools that help me learn"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 bg-amber-50 p-6 md:p-8 rounded-[2rem] border-2 border-amber-100 print:bg-white print:border-slate-300", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Pencils or pens?" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { value: formData.invPencilsPens, onChange: (e) => updateForm("invPencilsPens", e.target.value) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "How do I stay organized?" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { value: formData.invOrganized, onChange: (e) => updateForm("invOrganized", e.target.value) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Write or type assignments?" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { value: formData.invWriteType, onChange: (e) => updateForm("invWriteType", e.target.value) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Are electronics distracting?" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { value: formData.invElectronics, onChange: (e) => updateForm("invElectronics", e.target.value) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "md:col-span-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Does music help me study?" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { value: formData.invMusic, onChange: (e) => updateForm("invMusic", e.target.value) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mb-12 print:break-inside-avoid", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { className: "text-2xl font-black text-slate-800 mb-6 flex items-center", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "bg-emerald-100 text-emerald-600 w-10 h-10 rounded-xl flex items-center justify-center mr-3 border-2 border-emerald-200 shadow-sm print:shadow-none", children: "3" }),
          "In the classroom"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "space-y-2 bg-emerald-50 p-6 md:p-8 rounded-[2rem] border-2 border-emerald-100 print:bg-white print:border-slate-300", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-x-6", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Where do I prefer to sit?" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { value: formData.invSit, onChange: (e) => updateForm("invSit", e.target.value) })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Best reading format?" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { value: formData.invReadFrom, onChange: (e) => updateForm("invReadFrom", e.target.value) })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Does paper color matter?" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { value: formData.invColor, onChange: (e) => updateForm("invColor", e.target.value) })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Does print type matter?" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { value: formData.invPrintType, onChange: (e) => updateForm("invPrintType", e.target.value) })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Do I prefer to make my own goals, or have a teacher make them? Explain." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.invGoals, onChange: (e) => updateForm("invGoals", e.target.value) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mb-8 print:break-inside-avoid", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { className: "text-2xl font-black text-slate-800 mb-2 flex items-center", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "bg-purple-100 text-purple-600 w-10 h-10 rounded-xl flex items-center justify-center mr-3 border-2 border-purple-200 shadow-sm print:shadow-none", children: "4" }),
          "Directions that work for me"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-sm font-bold text-purple-600 mb-6 ml-14 bg-purple-100 inline-block px-3 py-1 rounded-lg print:bg-transparent print:border-2 print:border-slate-300 print:text-slate-600", children: "1 = Least Effective, 5 = Most Effective" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "space-y-4 bg-purple-50 p-6 md:p-8 rounded-[2rem] border-2 border-purple-100 print:bg-white print:border-slate-300", children: [
          "Teacher explains out loud",
          "Teacher writes directions on paper",
          "Teacher does an example for me",
          "Teacher asks another student to explain",
          "Teacher reads the instructions to me",
          "I read the directions on my own",
          "I try it and then check with teacher",
          "I try it and compare with another student"
        ].map((dir) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex flex-col md:flex-row md:items-center justify-between bg-white p-4 rounded-2xl border-2 border-purple-100 shadow-sm print:shadow-none print:border-slate-200 print:break-inside-avoid", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-slate-800 font-bold text-base md:w-1/2 mb-4 md:mb-0", children: dir }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex gap-2", children: [1, 2, 3, 4, 5].map((num) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "cursor-pointer relative group", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "input",
              {
                type: "radio",
                name: `dir_${dir}`,
                className: "sr-only peer",
                checked: formData.invDirections[dir] === num,
                onChange: () => setFormData((prev) => ({
                  ...prev,
                  invDirections: { ...prev.invDirections, [dir]: num }
                }))
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `w-10 h-10 md:w-12 md:h-12 rounded-xl border-2 flex items-center justify-center text-base font-black transition-all ${formData.invDirections[dir] === num ? "bg-purple-500 text-white border-purple-600 shadow-[0_4px_0_0_#7e22ce] -translate-y-1 print:bg-purple-100 print:text-purple-900 print:shadow-none print:translate-y-0" : "border-slate-200 text-slate-400 bg-white print:border-slate-300"}`, children: num })
          ] }, num)) })
        ] }, dir)) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mt-8 space-y-6 print:break-inside-avoid", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Tricks I use to keep myself focused:" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.invFocusTricks, onChange: (e) => updateForm("invFocusTricks", e.target.value) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Special things teachers can do to help me:" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.invTeacherHelp, onChange: (e) => updateForm("invTeacherHelp", e.target.value) })
          ] })
        ] })
      ] })
    ] });
    const renderGoals = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { subtitle: "Set clear targets (e.g., getting a car, graduating, starting a career).", children: "Goal Setting Builder" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(KnowledgeDrop, { title: "The SMART Method", color: "emerald", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "mb-3", children: [
          "A goal without a plan is just a wish! To make sure you actually hit your targets, use the ",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "SMART" }),
          " method. Your goals should be:"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", { className: "space-y-2 list-disc pl-5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Specific:" }),
            ` What exactly are you trying to do? (Don't just say "get better at guitar", say "learn to play Wonderwall on guitar").`
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Measurable:" }),
            " How will you know when you've succeeded?"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Attainable:" }),
            " Is it within your power to do this, or does it rely on luck/other people?"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Realistic:" }),
            " Do you have the resources, skill, and time to pull this off right now?"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Timed:" }),
            " When is the exact deadline?"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "space-y-10", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-200 print:bg-white print:border-slate-300 print:break-inside-avoid", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { description: "e.g.: Learn to speak Spanish", children: "1. Here's what I want to achieve:" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { value: formData.goalAchieve, onChange: (e) => updateForm("goalAchieve", e.target.value) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-200 print:bg-white print:border-slate-300 print:break-inside-avoid", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { description: "What will I see/hear/feel when it's done? e.g.: All 10 modules completed.", children: "2. My main MEASURE for this achievement:" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.goalMeasure, onChange: (e) => updateForm("goalMeasure", e.target.value) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-emerald-50 p-8 rounded-[2rem] border-2 border-emerald-200 relative print:bg-white print:border-slate-300 print:break-inside-avoid", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -top-5 right-10 bg-emerald-500 text-white font-black px-6 py-2 rounded-full border-4 border-white shadow-sm transform rotate-3 print:hidden", children: "Mad Libs Style!" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { description: "Combine your answers into one epic sentence.", children: "3. Specific Goal Statement:" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mt-6", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-white p-4 rounded-2xl border-2 border-emerald-100 print:border-slate-300", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "text-sm font-black text-emerald-600 uppercase mb-2 block print:text-slate-600", children: "Who?" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { placeholder: "I am...", value: formData.goalWho, onChange: (e) => updateForm("goalWho", e.target.value) })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-white p-4 rounded-2xl border-2 border-emerald-100 print:border-slate-300", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "text-sm font-black text-emerald-600 uppercase mb-2 block print:text-slate-600", children: "How?" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { placeholder: "proudly finishing...", value: formData.goalHow, onChange: (e) => updateForm("goalHow", e.target.value) })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-white p-4 rounded-2xl border-2 border-emerald-100 print:border-slate-300", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "text-sm font-black text-emerald-600 uppercase mb-2 block print:text-slate-600", children: "What?" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { placeholder: "module ten...", value: formData.goalWhat, onChange: (e) => updateForm("goalWhat", e.target.value) })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-white p-4 rounded-2xl border-2 border-emerald-100 print:border-slate-300", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "text-sm font-black text-emerald-600 uppercase mb-2 block print:text-slate-600", children: "When?" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { placeholder: "by December 31st.", value: formData.goalWhen, onChange: (e) => updateForm("goalWhen", e.target.value) })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-white p-6 rounded-2xl border-4 border-emerald-400 border-dashed mt-8 text-center transform rotate-1 shadow-sm transition-all duration-300 print:transform-none print:border-slate-300", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-sm font-bold text-emerald-600 uppercase tracking-widest mb-3 print:text-slate-600", children: "Your Dynamic Goal Statement:" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "text-2xl md:text-3xl font-black text-emerald-800 leading-tight", children: [
              '"',
              formData.goalWho || "[Who]",
              " ",
              formData.goalHow || "[How]",
              " ",
              formData.goalWhat || "[What]",
              " ",
              formData.goalWhen || "[When]",
              '"'
            ] })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-amber-50 p-8 rounded-[2rem] border-2 border-amber-200 print:bg-white print:border-slate-300 print:break-inside-avoid", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "4. The Reality Check:" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "space-y-4 mt-4", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "p-5 border-2 border-white bg-amber-100/50 rounded-2xl print:bg-white print:border-slate-200", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "flex items-start mb-3 cursor-pointer", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", className: "mt-1 mr-3 h-6 w-6 rounded-lg border-2 border-amber-300 text-amber-500 focus:ring-amber-500 transition-colors print:border-slate-400" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-base font-bold text-slate-800", children: "Is it ATTAINABLE (in your control)? Explain." })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.goalAttainable, onChange: (e) => updateForm("goalAttainable", e.target.value), rows: 2 })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "p-5 border-2 border-white bg-amber-100/50 rounded-2xl print:bg-white print:border-slate-200", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "flex items-start mb-3 cursor-pointer", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", className: "mt-1 mr-3 h-6 w-6 rounded-lg border-2 border-amber-300 text-amber-500 focus:ring-amber-500 transition-colors print:border-slate-400" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-base font-bold text-slate-800", children: "Is it REALISTIC? Explain." })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.goalRealistic, onChange: (e) => updateForm("goalRealistic", e.target.value), rows: 2 })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "p-5 border-2 border-white bg-amber-100/50 rounded-2xl print:bg-white print:border-slate-200", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "flex items-start mb-3 cursor-pointer", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", className: "mt-1 mr-3 h-6 w-6 rounded-lg border-2 border-amber-300 text-amber-500 focus:ring-amber-500 transition-colors print:border-slate-400" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-base font-bold text-slate-800", children: "Is it TIMED (has a deadline)? Explain." })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.goalTimed, onChange: (e) => updateForm("goalTimed", e.target.value), rows: 2 })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 print:break-inside-avoid", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Why is goal setting important?" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HintToggle, { example: "It gives me a clear roadmap so I don't get distracted. It helps me measure my progress so I know if I'm actually moving forward." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.goalImportance, onChange: (e) => updateForm("goalImportance", e.target.value) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "What other goals could you set?" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HintToggle, { example: "Saving $500 for a car, getting an 80% in Math, or learning how to cook 3 healthy meals by summer." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.goalOther, onChange: (e) => updateForm("goalOther", e.target.value) })
          ] })
        ] })
      ] })
    ] });
    const renderRomantic = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { subtitle: "Mapping how relationships grow and develop.", children: "Romantic Relationships" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-rose-50 p-8 rounded-[2rem] border-2 border-rose-200 mb-10 shadow-sm relative overflow-hidden print:bg-white print:border-slate-300 print:break-inside-avoid", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "fa-solid fa-heart absolute -right-10 -bottom-10 text-[16rem] text-rose-100 opacity-50 print:hidden" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "relative z-10", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "text-2xl font-black text-rose-900 mb-3", children: "Relationship Timeline" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-base font-medium text-rose-700 mb-8 max-w-2xl print:text-slate-600", children: "Rank the 16 steps below from 1 (First) to 16 (Last) to show how you think a relationship usually progresses." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: relationshipSteps.map((step, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center space-x-4 bg-white p-3 rounded-2xl border-2 border-rose-100 focus-within:border-rose-400 focus-within:shadow-[0_4px_0_0_#fda4af] transition-all group print:border-slate-200 print:shadow-none", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "input",
              {
                type: "number",
                min: "1",
                max: "16",
                className: "w-16 h-12 text-center bg-rose-50 border-2 border-rose-200 rounded-xl text-rose-900 font-black text-lg focus:outline-none focus:bg-white focus:border-rose-400 transition-colors print:bg-white print:border-slate-300 print:text-slate-800",
                value: formData.romRankings[step] || "",
                onChange: (e) => setFormData((prev) => ({
                  ...prev,
                  romRankings: { ...prev.romRankings, [step]: e.target.value }
                }))
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-sm font-bold text-slate-700 group-hover:text-rose-600 transition-colors", children: step })
          ] }, idx)) })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "space-y-6 print:break-inside-avoid", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "What was easiest to rank? Explain." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.romEasiest, onChange: (e) => updateForm("romEasiest", e.target.value) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "What was most difficult? Explain." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.romHardest, onChange: (e) => updateForm("romHardest", e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Where do your ideas about a 'normal' relationship come from?" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HintToggle, { example: "Mostly from movies, TV shows, and seeing how my parents or older siblings act in their relationships." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.romNormal, onChange: (e) => updateForm("romNormal", e.target.value) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "What happens if a relationship skips steps or progresses unhealthily?" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HintToggle, { example: "Someone might get emotionally hurt, trust could be broken, or the relationship might crash and burn because it moved too fast." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.romUnhealthyProg, onChange: (e) => updateForm("romUnhealthyProg", e.target.value) })
        ] })
      ] })
    ] });
    const renderEvaluating = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { subtitle: "Identify which relationships are supportive and which are toxic.", children: "Evaluating Relationships" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-orange-50 p-8 rounded-[2rem] border-2 border-orange-200 mb-10 print:bg-white print:border-slate-300 print:break-inside-avoid", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { description: "List 5 people you have a relationship with (family, school, work, online).", children: "Your Network Map" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "space-y-4 mt-6", children: [0, 1, 2, 3, 4].map((idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center bg-white p-2 rounded-2xl border-2 border-orange-100 print:border-slate-200", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-shrink-0 w-10 h-10 bg-orange-100 text-orange-600 font-black rounded-xl flex items-center justify-center mr-3 print:bg-slate-100 print:text-slate-600 print:border-2 print:border-slate-300", children: idx + 1 }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              className: "flex-1 bg-transparent border-none font-bold text-slate-700 focus:outline-none focus:ring-0 px-2",
              placeholder: `Name & Type (e.g., Mom - Family)`,
              value: formData.evalRels[idx],
              onChange: (e) => updateArrayField("evalRels", idx, e.target.value)
            }
          )
        ] }, idx)) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "text-3xl font-black text-slate-800 mb-8 text-center print:break-before-page print:mt-10", children: "The Vibe Check" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KnowledgeDrop, { title: "Green Flags vs. Red Flags", color: "amber", defaultOpen: false, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid md:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { className: "text-emerald-700 block mb-2", children: "\u2705 Green Flags (Healthy)" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", { className: "list-disc pl-5 space-y-1 text-sm", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: 'They respect your boundaries and the word "No".' }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "You feel energized and happy after hanging out with them." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "They celebrate your wins and encourage your goals." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "You can communicate openly without fear of them exploding." })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { className: "text-rose-700 block mb-2", children: "\u{1F6A9} Red Flags (Unhealthy)" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", { className: "list-disc pl-5 space-y-1 text-sm", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "They try to isolate you from your other friends or family." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: 'They constantly make you feel guilty or "crazy" (gaslighting).' }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "They pressure you into doing things you aren't comfortable with." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "The relationship feels like a rollercoaster (extreme highs and terrible lows)." })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 print:break-inside-avoid", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-emerald-50 p-8 rounded-[2rem] border-2 border-emerald-200 shadow-[0_8px_0_0_#a7f3d0] print:bg-white print:border-slate-300 print:shadow-none", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", { className: "font-black text-emerald-800 text-2xl mb-6 flex items-center print:text-slate-800", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "bg-emerald-200 p-2 rounded-xl mr-3 print:bg-transparent print:p-0", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "fa-regular fa-square-check text-emerald-700 text-xl print:text-slate-800" }) }),
            "Green Flags"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "space-y-4", children: [0, 1, 2, 3, 4].map((idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            Input,
            {
              placeholder: `Healthy trait ${idx + 1}`,
              value: formData.evalHealthyList[idx],
              onChange: (e) => updateArrayField("evalHealthyList", idx, e.target.value)
            },
            idx
          )) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-rose-50 p-8 rounded-[2rem] border-2 border-rose-200 shadow-[0_8px_0_0_#fecdd3] print:bg-white print:border-slate-300 print:shadow-none", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", { className: "font-black text-rose-800 text-2xl mb-6 flex items-center print:text-slate-800", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "bg-rose-200 p-2 rounded-xl mr-3 print:bg-transparent print:p-0", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "fa-solid fa-triangle-exclamation text-rose-700 text-xl print:text-slate-800" }) }),
            "Red Flags"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "space-y-4", children: [0, 1, 2, 3, 4].map((idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            Input,
            {
              placeholder: `Toxic trait ${idx + 1}`,
              value: formData.evalUnhealthyList[idx],
              onChange: (e) => updateArrayField("evalUnhealthyList", idx, e.target.value)
            },
            idx
          )) })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "space-y-6 print:break-inside-avoid", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: [
              "Think about your relationship with ",
              formData.evalRels[0] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-orange-600 bg-orange-100 px-2 py-1 rounded-md print:bg-transparent print:border print:border-slate-300", children: formData.evalRels[0] }) : "someone close to you",
              ". How do you feel in a healthy relationship?"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.evalFeelHealthy, onChange: (e) => updateForm("evalFeelHealthy", e.target.value) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: [
              "Think about your relationship with ",
              formData.evalRels[1] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-orange-600 bg-orange-100 px-2 py-1 rounded-md print:bg-transparent print:border print:border-slate-300", children: formData.evalRels[1] }) : "another person",
              ". How do you feel in an unhealthy relationship?"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.evalFeelUnhealthy, onChange: (e) => updateForm("evalFeelUnhealthy", e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Why do people stay in unhealthy relationships?" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HintToggle, { example: "They might be afraid of being alone, they might hope the person will change, or they might not even realize it's toxic because they are used to it." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.evalWhyStay, onChange: (e) => updateForm("evalWhyStay", e.target.value) })
        ] })
      ] })
    ] });
    const renderAlcohol = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { subtitle: "Navigating the choices and consequences surrounding drinking.", children: "Alcohol Awareness" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 print:break-inside-avoid", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-200 print:bg-white print:border-slate-300", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Why do you think people drink?" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HintToggle, { example: "To fit in, to relax after a stressful day, or because it's socially expected at events like weddings." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.alcWhyDrink, onChange: (e) => updateForm("alcWhyDrink", e.target.value) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-200 print:bg-white print:border-slate-300", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "What do you personally think about alcohol?" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.alcThoughts, onChange: (e) => updateForm("alcThoughts", e.target.value) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-200 print:bg-white print:border-slate-300", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Why is it tied to holidays/celebrations?" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.alcCelebrate, onChange: (e) => updateForm("alcCelebrate", e.target.value) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-200 print:bg-white print:border-slate-300", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "What would you say if offered a drink?" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HintToggle, { example: "I might say 'No thanks, I'm driving today' or 'I'm good with soda right now'." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.alcOffered, onChange: (e) => updateForm("alcOffered", e.target.value) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-200 md:col-span-2 print:bg-white print:border-slate-300", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "How much should you drink? Explain." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.alcHowMuch, onChange: (e) => updateForm("alcHowMuch", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-fuchsia-50 p-4 md:p-8 rounded-[2rem] border-2 border-fuchsia-200 mb-8 print:bg-white print:border-slate-300 print:break-inside-avoid", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "text-2xl font-black text-fuchsia-900 mb-6 print:text-slate-800", children: "Action & Consequence" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "overflow-x-auto", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { className: "min-w-full border-separate border-spacing-y-4", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { className: "text-left text-fuchsia-800 print:text-slate-700", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "px-4 pb-2 font-black uppercase tracking-wider text-sm w-1/4", children: "The Choice" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "px-4 pb-2 font-black uppercase tracking-wider text-sm text-emerald-600 print:text-slate-700 w-3/8", children: "The Good (Pros)" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "px-4 pb-2 font-black uppercase tracking-wider text-sm text-rose-600 print:text-slate-700 w-3/8", children: "The Bad (Cons)" })
          ] }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: ["Not to Drink", "Drink Moderately", "Drink Too Much"].map((choice, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { className: "bg-white", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { className: "p-4 border-2 border-r-0 border-fuchsia-100 rounded-l-2xl font-black text-slate-800 text-lg print:border-slate-300", children: choice }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { className: "p-4 border-y-2 border-fuchsia-100 print:border-slate-300", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              Textarea,
              {
                rows: 2,
                placeholder: "e.g. Healthier body...",
                value: formData.alcProsCons[idx].pro,
                onChange: (e) => {
                  const newArr = [...formData.alcProsCons];
                  newArr[idx].pro = e.target.value;
                  updateForm("alcProsCons", newArr);
                }
              }
            ) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { className: "p-4 border-2 border-l-0 border-fuchsia-100 rounded-r-2xl print:border-slate-300", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              Textarea,
              {
                rows: 2,
                placeholder: "e.g. Missing out socially...",
                value: formData.alcProsCons[idx].con,
                onChange: (e) => {
                  const newArr = [...formData.alcProsCons];
                  newArr[idx].con = e.target.value;
                  updateForm("alcProsCons", newArr);
                }
              }
            ) })
          ] }, choice)) })
        ] }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "print:break-inside-avoid", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Who could you speak to if you wanted to learn more about alcohol? List 2 resources." }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.alcResources, onChange: (e) => updateForm("alcResources", e.target.value) })
      ] })
    ] });
    const renderTobacco = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { subtitle: "Understanding the effects and choices surrounding vaping, cannabis, and tobacco use.", children: "Vaping & Tobacco Awareness" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bg-red-50 border-4 border-red-500 p-6 md:p-8 rounded-[2rem] mb-10 shadow-[0_8px_0_0_#ef4444] transform rotate-1 print:transform-none print:shadow-none print:border-2 print:border-slate-400 print:bg-white", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { className: "text-2xl md:text-3xl font-black text-red-700 uppercase tracking-widest flex items-center justify-center print:text-slate-800", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "fa-solid fa-triangle-exclamation mr-4 text-3xl text-red-600 print:text-slate-800" }),
        "Warning: Highly Addictive"
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "space-y-6", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 print:break-inside-avoid", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "What do you know about traditional cigarettes?" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.tobKnow, onChange: (e) => updateForm("tobKnow", e.target.value) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "What do you know about Vapes / E-cigarettes?" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.vapeKnow, onChange: (e) => updateForm("vapeKnow", e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "my-10 p-8 bg-slate-800 text-slate-100 rounded-[2rem] border-4 border-slate-900 shadow-[0_8px_0_0_#0f172a] text-lg font-medium leading-relaxed print:bg-white print:text-slate-800 print:border-2 print:border-slate-300 print:shadow-none print:break-inside-avoid", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "mb-4", children: [
            "Tobacco and most vape juices contain ",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "nicotine" }),
            ', a highly addictive chemical that rewires how your developing brain handles stress and reward. People develop a tolerance quickly, needing more just to feel "normal".'
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "mb-6", children: "Vaping carries serious risks for lung health and delivers massive nicotine concentrations. Quitting is tough but highly possible with support!" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex flex-col md:flex-row gap-4 justify-center", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bg-emerald-400 text-slate-900 px-6 py-4 rounded-xl font-black text-lg text-center shadow-[0_4px_0_0_#047857] -rotate-1 print:transform-none print:bg-transparent print:border-2 print:border-slate-300 print:shadow-none", children: "AlbertaQuits: 1-866-710-QUIT" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bg-sky-400 text-slate-900 px-6 py-4 rounded-xl font-black text-lg text-center shadow-[0_4px_0_0_#0369a1] rotate-1 print:transform-none print:bg-transparent print:border-2 print:border-slate-300 print:shadow-none", children: "KidsHelpPhone: Text CONNECT to 686868" })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 print:break-inside-avoid", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Why do you think teens start vaping?" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.vapeWhy, onChange: (e) => updateForm("vapeWhy", e.target.value) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Cannabis is legal in Canada. What are your thoughts on its use among teenagers?" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.weedThoughts, onChange: (e) => updateForm("weedThoughts", e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-sky-50 p-6 rounded-[2rem] border-2 border-sky-200 print:bg-white print:border-slate-300 print:break-inside-avoid", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "If a friend wanted to start vaping or smoking, how would you convince them not to?" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.tobConvince, onChange: (e) => updateForm("tobConvince", e.target.value) })
        ] })
      ] })
    ] });
    const renderRisk = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { subtitle: "Learning the difference between calculated risks and careless ones.", children: "Risk Taking" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mb-12", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "text-3xl font-black text-slate-800 mb-8", children: "The Risk Meter" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "space-y-6", children: riskQuestions.map((q, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-slate-50 p-6 md:p-8 rounded-[2rem] border-2 border-slate-200 hover:border-violet-300 transition-colors print:bg-white print:border-slate-300 print:break-inside-avoid", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "font-bold text-slate-800 mb-4 text-lg", children: q }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            PillRadioGroup,
            {
              options: ["No risk", "Minimal", "Some risk", "Significant", "High risk"],
              name: `risk_${idx}`,
              value: formData.riskRatings[idx],
              onChange: (val) => setFormData((prev) => ({
                ...prev,
                riskRatings: { ...prev.riskRatings, [idx]: val }
              }))
            }
          )
        ] }, idx)) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-indigo-50 p-6 rounded-[2rem] border-2 border-indigo-200 mb-12 print:bg-white print:border-slate-300 print:break-inside-avoid", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: 'How did you determine how "risky" a situation was? Explain your logic.' }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HintToggle, { example: "I asked myself: Could this physically hurt me? Could it ruin my reputation or get me arrested? Do the benefits outweigh the potential bad consequences?" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.riskDetermine, onChange: (e) => updateForm("riskDetermine", e.target.value) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "text-3xl font-black text-slate-800 mb-8 text-center print:break-before-page print:mt-10", children: "Healthy vs Unhealthy Risks" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(KnowledgeDrop, { title: "Not all risks are bad!", color: "sky", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "mb-3", children: 'When we hear the word "risk", we usually think of danger. But growing up requires taking risks! The trick is knowing the difference:' }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", { className: "space-y-3", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
            "\u{1F4C8} ",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Healthy Risks:" }),
            ` Pushing yourself outside your comfort zone to grow. The "worst-case scenario" might be feeling embarrassed or failing, but you won't get hurt. `,
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: "(e.g., trying out for a play, applying for a hard job, standing up for a friend)." })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
            "\u2620\uFE0F ",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Unhealthy Risks:" }),
            " Actions that are needlessly dangerous, illegal, or could cause long-term physical/mental harm to you or others. ",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: "(e.g., driving drunk, trying addictive drugs, sharing inappropriate photos online)." })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10 print:break-inside-avoid", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-lime-50 p-8 rounded-[2rem] border-2 border-lime-200 shadow-[0_8px_0_0_#d9f99d] print:bg-white print:border-slate-300 print:shadow-none", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { className: "font-black text-lime-800 text-2xl mb-2 print:text-slate-800", children: "Healthy Risks" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-sm font-bold text-lime-600 mb-6 uppercase tracking-wider print:text-slate-500", children: "Growth-oriented activities" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "space-y-4", children: [0, 1, 2, 3, 4].map((idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { placeholder: `Good Risk ${idx + 1}`, value: formData.riskHealthy[idx], onChange: (e) => updateArrayField("riskHealthy", idx, e.target.value) }, idx)) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-rose-50 p-8 rounded-[2rem] border-2 border-rose-200 shadow-[0_8px_0_0_#fecdd3] print:bg-white print:border-slate-300 print:shadow-none", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { className: "font-black text-rose-800 text-2xl mb-2 print:text-slate-800", children: "Unhealthy Risks" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-sm font-bold text-rose-600 mb-6 uppercase tracking-wider print:text-slate-500", children: "Needlessly dangerous" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "space-y-4", children: [0, 1, 2, 3, 4].map((idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { placeholder: `Bad Risk ${idx + 1}`, value: formData.riskUnhealthy[idx], onChange: (e) => updateArrayField("riskUnhealthy", idx, e.target.value) }, idx)) })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "print:break-inside-avoid", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Why do you think someone would WANT to take an unhealthy risk?" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.riskWhyUnhealthy, onChange: (e) => updateForm("riskWhyUnhealthy", e.target.value) })
      ] })
    ] });
    const renderAddictions = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { subtitle: "Understanding the spectrum of addiction.", children: "Addictions" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 print:break-inside-avoid", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-200 print:bg-white print:border-slate-300", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: 'Define the term "addiction" using a dictionary:' }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.addDefine, onChange: (e) => updateForm("addDefine", e.target.value) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-200 print:bg-white print:border-slate-300", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "List 3 different things people can be addicted to:" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.addTypes, onChange: (e) => updateForm("addTypes", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-indigo-600 p-8 md:p-10 rounded-[3rem] shadow-[0_12px_0_0_#3730a3] mb-12 text-white print:bg-white print:text-slate-800 print:border-2 print:border-slate-300 print:shadow-none print:break-inside-avoid", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "text-3xl font-black text-white mb-8 text-center print:text-slate-800", children: "The Addiction Continuum" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "p-6 rounded-3xl bg-white/10 border-2 border-white/20 backdrop-blur-sm print:bg-transparent print:border-slate-300", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-12 h-12 bg-emerald-400 rounded-2xl flex items-center justify-center font-black text-xl text-emerald-900 mb-4 print:bg-slate-200 print:text-slate-800", children: "1" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { className: "text-xl block mb-2", children: "No Use" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-sm font-medium opacity-90 print:opacity-100", children: "No use due to age, religion, or health risks." })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "p-6 rounded-3xl bg-white/10 border-2 border-white/20 backdrop-blur-sm print:bg-transparent print:border-slate-300", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-12 h-12 bg-sky-400 rounded-2xl flex items-center justify-center font-black text-xl text-sky-900 mb-4 print:bg-slate-200 print:text-slate-800", children: "2" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { className: "text-xl block mb-2", children: "Use" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-sm font-medium opacity-90 print:opacity-100", children: 'Experimentation or "social use" to enhance good experiences.' })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "p-6 rounded-3xl bg-white/10 border-2 border-white/20 backdrop-blur-sm print:bg-transparent print:border-slate-300", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center font-black text-xl text-amber-900 mb-4 print:bg-slate-200 print:text-slate-800", children: "3" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { className: "text-xl block mb-2", children: "Misuse" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-sm font-medium opacity-90 print:opacity-100", children: "Experiencing negative consequences (trouble, regret) but ignoring them." })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "p-6 rounded-3xl bg-white/10 border-2 border-white/20 backdrop-blur-sm print:bg-transparent print:border-slate-300", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center font-black text-xl text-white mb-4 print:bg-slate-200 print:text-slate-800", children: "4" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { className: "text-xl block mb-2", children: "Dependency" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-sm font-medium opacity-90 print:opacity-100", children: "Interferes with major life areas. No longer a choice." })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "text-3xl font-black text-slate-800 mb-8 print:break-before-page print:mt-10", children: "Scenario Analysis" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "space-y-8", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-sky-50 rounded-[2rem] border-2 border-sky-200 overflow-hidden print:bg-white print:border-slate-300 print:break-inside-avoid", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "p-6 bg-sky-100/50 border-b-2 border-sky-200 print:bg-slate-50 print:border-slate-300", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "font-bold text-sky-900 text-lg print:text-slate-800", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Scenario 1:" }),
            " Rachel can't wait to finish school so she can get home and start drinking. Every day after school, Rachel has at least 5 beers to mellow her out. Her friends and family have expressed concern. She has a hard time sleeping without it."
          ] }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "p-6", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.addScen1, onChange: (e) => updateForm("addScen1", e.target.value), placeholder: "Identify the stage and justify..." }) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-amber-50 rounded-[2rem] border-2 border-amber-200 overflow-hidden print:bg-white print:border-slate-300 print:break-inside-avoid", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "p-6 bg-amber-100/50 border-b-2 border-amber-200 print:bg-slate-50 print:border-slate-300", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "font-bold text-amber-900 text-lg print:text-slate-800", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Scenario 2:" }),
            " Antoine has never touched a cigarette. After losing his father to lung cancer, Antoine has decided that he will never try one."
          ] }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "p-6", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.addScen2, onChange: (e) => updateForm("addScen2", e.target.value), placeholder: "Identify the stage and justify..." }) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-rose-50 rounded-[2rem] border-2 border-rose-200 overflow-hidden print:bg-white print:border-slate-300 print:break-inside-avoid", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "p-6 bg-rose-100/50 border-b-2 border-rose-200 print:bg-slate-50 print:border-slate-300", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "font-bold text-rose-900 text-lg print:text-slate-800", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Scenario 3:" }),
            " Bailey has a craving. She wants one, but doesn't have one. She notices a half full pack on the table beside her, and decides to steal one when no one is looking."
          ] }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "p-6", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.addScen3, onChange: (e) => updateForm("addScen3", e.target.value), placeholder: "Identify the stage and justify..." }) })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mt-12 p-8 bg-slate-900 text-white rounded-[3rem] text-center shadow-[0_8px_0_0_#0f172a] print:bg-white print:border-2 print:border-slate-300 print:text-slate-800 print:shadow-none print:break-inside-avoid", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "fa-solid fa-wave-square text-5xl mb-4 text-emerald-400 print:text-slate-800" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "font-bold text-slate-300 mb-2 text-lg print:text-slate-800", children: "For more information, or to find support for addictions, contact Alberta Health Services (AHS):" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-sm font-black text-slate-900 bg-emerald-400 inline-block px-6 py-3 rounded-xl mt-4 border-2 border-emerald-500 print:bg-transparent print:border-slate-300", children: "Addiction Help Line: 1-866-332-2322" })
      ] })
    ] });
    const renderMentalHealth = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { subtitle: "Recognizing signs of depression and seeking support.", children: "Mental Health" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 print:break-inside-avoid", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-cyan-50 p-8 rounded-[2rem] border-2 border-cyan-200 print:bg-white print:border-slate-300", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "text-2xl font-black text-cyan-900 mb-4 print:text-slate-800", children: "You are not alone" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-base font-medium text-cyan-800 leading-relaxed print:text-slate-600", children: "When you're depressed, it can feel like no one understands. But depression is far more common in teens than you may think. It is not a hopeless case. With proper treatment and healthy choices, that fog eventually lifts." })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-rose-50 p-8 rounded-[2rem] border-2 border-rose-200 shadow-[0_8px_0_0_#fecdd3] print:bg-white print:border-slate-300 print:shadow-none", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "text-2xl font-black text-rose-900 mb-4 print:text-slate-800", children: "Warning Signs" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", { className: "text-base font-bold text-rose-800 space-y-3 print:text-slate-600", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "\u{1F6A8} Irritable, sad, or angry" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "\u{1F6A8} Nothing seems fun anymore" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "\u{1F6A8} Feeling worthless or guilty" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "\u{1F6A8} Sleeping too much or not enough" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { className: "text-red-600 bg-red-100 p-3 rounded-xl mt-4 border-2 border-red-200 print:bg-transparent print:border-slate-300", children: "\u{1F525} Thinking about death or suicide. (Seek help immediately!)" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 print:break-inside-avoid", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-200 print:bg-white print:border-slate-300", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Why is it hard to talk about?" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HintToggle, { example: "People often feel embarrassed, worry that others will judge them, or fear being seen as 'weak'." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.mhHardTalk, onChange: (e) => updateForm("mhHardTalk", e.target.value) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-200 print:bg-white print:border-slate-300", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Emotions tied to depression?" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.mhEmotions, onChange: (e) => updateForm("mhEmotions", e.target.value) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-200 print:bg-white print:border-slate-300", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "How to spot it in a friend?" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.mhKnowWrong, onChange: (e) => updateForm("mhKnowWrong", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-indigo-50 p-8 rounded-[3rem] border-2 border-indigo-200 mb-10 print:bg-white print:border-slate-300 print:break-inside-avoid", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "text-3xl font-black text-indigo-900 mb-8 text-center print:text-slate-800", children: "How to fight back" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-6 text-base font-medium text-indigo-800 print:text-slate-700", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-white border-2 border-indigo-100 p-6 rounded-2xl shadow-sm print:border-slate-300 print:shadow-none", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { className: "text-xl font-black block mb-2", children: "1. One day at a time" }),
            "Start with small goals. Stay connected."
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-white border-2 border-indigo-100 p-6 rounded-2xl shadow-sm print:border-slate-300 print:shadow-none", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { className: "text-xl font-black block mb-2", children: "2. Don't isolate" }),
            "Spend time with upbeat friends. Avoid toxic people."
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-white border-2 border-indigo-100 p-6 rounded-2xl shadow-sm print:border-slate-300 print:shadow-none", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { className: "text-xl font-black block mb-2", children: "3. Body Health" }),
            "Exercise releases endorphins. Eat good food."
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-white border-2 border-indigo-100 p-6 rounded-2xl shadow-sm print:border-slate-300 print:shadow-none", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { className: "text-xl font-black block mb-2", children: "4. Ask for help" }),
            "Talk to a teacher or doctor. Avoid drugs/alcohol."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 print:break-inside-avoid", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "How to help a friend who is depressed?" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.mhHelpFriend, onChange: (e) => updateForm("mhHelpFriend", e.target.value) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "What to do if YOU feel depressed?" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.mhHelpSelf, onChange: (e) => updateForm("mhHelpSelf", e.target.value) })
        ] })
      ] })
    ] });
    const renderTaskA = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { subtitle: "Draw your journey so far.", children: "Summative Task A: Life Map" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-lime-400 p-8 md:p-10 rounded-[3rem] mb-10 shadow-[0_12px_0_0_#4d7c0f] transform -rotate-1 print:transform-none print:bg-white print:border-2 print:border-slate-300 print:shadow-none print:break-inside-avoid", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { className: "font-black text-3xl text-lime-900 mb-6 flex items-center print:text-slate-800", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "fa-solid fa-map text-3xl mr-4 text-lime-800 print:text-slate-800" }),
          "The Mission"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", { className: "list-decimal pl-6 space-y-4 text-lime-900 font-bold text-lg print:text-slate-600", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Create a colourful map showing your life to date (Physical paper, slides, etc)." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Start with birth. Mark the ups and downs along your road." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Identify the TRANSITIONS (How did you get through it? What did you learn?)." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Include 10 major events." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Add: Dates, Places, Symbols, Pictures." })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mb-12 print:break-inside-avoid", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Upload your map" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-sm font-medium text-slate-500 mb-4", children: "Take a photo of your drawing and upload it here!" }),
        formData.mapImageData ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "relative bg-slate-50 border-4 border-slate-200 p-4 rounded-[2rem] inline-block max-w-full shadow-sm group", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: formData.mapImageData, alt: "Student Life Map", className: "rounded-2xl max-h-[500px] object-contain print:max-h-full" }),
          !printMode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              onClick: () => updateForm("mapImageData", ""),
              className: "absolute -top-4 -right-4 bg-rose-500 text-white p-3 rounded-xl border-2 border-rose-600 shadow-[0_4px_0_0_#9f1239] hover:-translate-y-1 hover:shadow-[0_6px_0_0_#9f1239] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center opacity-0 group-hover:opacity-100",
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "fa-solid fa-trash-can text-lg" })
            }
          )
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "flex flex-col items-center justify-center w-full h-64 bg-lime-50 border-4 border-dashed border-lime-300 rounded-[2rem] cursor-pointer hover:bg-lime-100 hover:border-lime-400 transition-all group shadow-[inset_0_4px_10px_rgba(0,0,0,0.02)] print:bg-white print:border-slate-300 print:shadow-none", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-20 h-20 bg-lime-200 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 print:hidden", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "fa-solid fa-cloud-arrow-up text-4xl text-lime-700" }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "font-black text-xl text-lime-800 mb-2 print:text-slate-500", children: "[ Map Image Will Appear Here ]" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-lime-600 font-medium print:hidden", children: "JPEG, PNG, or take a photo" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "image/*", className: "hidden", onChange: handleImageUpload })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-slate-50 p-8 rounded-[2rem] border-2 border-slate-200 print:bg-white print:border-slate-300 print:break-inside-avoid", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "text-2xl font-black text-slate-800 mb-6", children: "Reflection" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "space-y-6", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "1. Proudest accomplishment? Why?" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.mapAccomplish, onChange: (e) => updateForm("mapAccomplish", e.target.value) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "2. Hardest obstacle? Why?" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.mapObstacle, onChange: (e) => updateForm("mapObstacle", e.target.value) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "3. Strategies used to manage changes?" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HintToggle, { example: "I talked to my parents, I took a break from social media, and I started writing my thoughts down." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.mapStrategies, onChange: (e) => updateForm("mapStrategies", e.target.value) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "4. Skills gained from obstacles?" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData.mapSkills, onChange: (e) => updateForm("mapSkills", e.target.value) })
          ] })
        ] })
      ] })
    ] });
    const renderTaskB = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { subtitle: "Analyze emotions and decision making through film.", children: "Summative Task B: Inside Out" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-purple-100 border-4 border-purple-300 p-6 md:p-8 rounded-[3rem] mb-10 shadow-[0_8px_0_0_#d8b4fe] print:bg-white print:border-2 print:border-slate-300 print:shadow-none print:break-inside-avoid", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex flex-col md:flex-row items-center gap-6 mb-8 print:hidden", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "fa-solid fa-film text-5xl md:text-6xl text-purple-500 flex-shrink-0" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-purple-900 text-lg md:text-xl font-bold leading-relaxed", children: 'Study the Pixar film "Inside Out". It explores how emotions drive our decisions. Need a refresher? Watch the trailer below, then answer the questions!' })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "relative w-full overflow-hidden rounded-2xl border-4 border-purple-300 shadow-md bg-black print:hidden", style: { paddingTop: "56.25%" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "iframe",
          {
            className: "absolute top-0 left-0 w-full h-full",
            src: "https://www.youtube.com/embed/yRUAzGQ3nSY?rel=0",
            title: "Inside Out Official Trailer",
            allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
            allowFullScreen: true
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mt-8 bg-white/60 p-6 rounded-2xl border-2 border-purple-200 print:mt-0 print:border-none print:bg-transparent", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { className: "font-black text-purple-900 mb-3 print:text-slate-800", children: "Quick Character Recap:" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex flex-wrap gap-2 text-sm font-bold", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "bg-yellow-200 text-yellow-800 px-3 py-1.5 rounded-xl border-2 border-yellow-300 print:border-slate-300 print:bg-white print:text-slate-600", children: "Joy (Yellow)" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "bg-blue-200 text-blue-800 px-3 py-1.5 rounded-xl border-2 border-blue-300 print:border-slate-300 print:bg-white print:text-slate-600", children: "Sadness (Blue)" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "bg-red-200 text-red-800 px-3 py-1.5 rounded-xl border-2 border-red-300 print:border-slate-300 print:bg-white print:text-slate-600", children: "Anger (Red)" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "bg-green-200 text-green-800 px-3 py-1.5 rounded-xl border-2 border-green-300 print:border-slate-300 print:bg-white print:text-slate-600", children: "Disgust (Green)" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "bg-purple-200 text-purple-800 px-3 py-1.5 rounded-xl border-2 border-purple-300 print:border-slate-300 print:bg-white print:text-slate-600", children: "Fear (Purple)" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "space-y-8 bg-slate-50 p-6 md:p-8 rounded-[2rem] border-2 border-slate-200 print:bg-transparent print:border-none print:p-0", children: [
        { id: "ioQ1", q: "1. Joy is usually in charge of Riley. Which emotion(s) do you feel most often? Explain." },
        { id: "ioQ2", q: "2. Riley moves to San Francisco. Have you ever gone through a big transition? Explain." },
        { id: "ioQ3", q: "3. How are the glowing 'core memories' made? What might yours be?" },
        { id: "ioQ4", q: "4. What do the core memories have to do with Riley's personality? Explain." },
        { id: "ioQ5", q: "5. Sadness colors a memory blue. Can our current moods color our past memories? Explain." },
        { id: "ioQ6", q: "6. Were the core memories changed forever, or just temporarily filtered? Explain." },
        { id: "ioQ7", q: "7. Riley feels pressure to be a 'happy girl'. Is this fair of her mom to ask? Explain." },
        { id: "ioQ8", q: "8. Does society value certain emotions over others? Which ones? Explain." },
        { id: "ioQ9", q: "9. Why does Joy learn that Sadness is also important?" },
        { id: "ioQ10", q: "10. Is it easier for certain demographics (age/gender) to express different emotions? Why?" }
      ].map(({ id, q }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm transition-all focus-within:border-purple-300 print:break-inside-avoid print:border-slate-300 print:shadow-none", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: q }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { value: formData[id], onChange: (e) => updateForm(id, e.target.value) })
      ] }, id)) })
    ] });
    const renderSubmit = () => {
      const is100Percent = progressData.overallPercentage === 100;
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { className: "border-t-[8px] border-t-blue-500", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { subtitle: "Let's make sure you haven't missed anything!", children: "Final Review" }),
        !is100Percent && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-amber-50 border-4 border-amber-400 p-6 md:p-8 rounded-[2rem] mb-10 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left transform -rotate-1 print:hidden", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-16 h-16 bg-amber-200 rounded-full flex items-center justify-center flex-shrink-0 shadow-[0_4px_0_0_#f59e0b]", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "fa-solid fa-triangle-exclamation text-3xl text-amber-700" }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { className: "font-black text-amber-900 text-2xl mb-2", children: "Wait up! You have missing answers." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "text-amber-800 font-medium text-lg leading-relaxed", children: [
              "Your workbook is only ",
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { className: "text-xl bg-amber-200 px-2 py-1 rounded-lg", children: [
                progressData.overallPercentage,
                "%"
              ] }),
              " complete. Review the checklist below to see which sections still need attention."
            ] })
          ] })
        ] }),
        is100Percent && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-emerald-50 border-4 border-emerald-400 p-6 md:p-8 rounded-[2rem] mb-10 shadow-[0_8px_0_0_#34d399] flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left transform rotate-1 print:hidden", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-16 h-16 bg-emerald-400 rounded-full flex items-center justify-center flex-shrink-0 shadow-[0_4px_0_0_#059669]", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "fa-solid fa-check text-4xl text-white" }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { className: "font-black text-emerald-900 text-2xl mb-2", children: "Amazing job! 100% Complete!" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-emerald-800 font-medium text-lg leading-relaxed", children: "You've answered every single question in the workbook. Give yourself a well-deserved high-five! You have officially finished this activity." })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "text-2xl font-black text-slate-800 mb-6 print:hidden", children: "Module Checklist" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12 print:hidden", children: tabs.filter((t) => t.id !== "submit").map((tab) => {
          const stats = progressData.stats[tab.id];
          const isComplete = stats?.isComplete;
          return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "button",
            {
              onClick: () => {
                setActiveTab(tab.id);
                window.scrollTo({ top: 0, behavior: "smooth" });
              },
              className: `p-4 rounded-2xl border-4 flex items-center justify-between transition-all hover:-translate-y-1 active:translate-y-0 text-left ${isComplete ? "bg-emerald-50 border-emerald-200 hover:border-emerald-300" : "bg-slate-50 border-slate-200 hover:border-slate-300 shadow-[0_4px_0_0_#e2e8f0]"}`,
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `p-2 rounded-xl flex items-center justify-center w-10 h-10 ${isComplete ? "bg-emerald-200" : "bg-slate-200"}`, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: `${tab.icon} ${isComplete ? "text-emerald-700" : "text-slate-500"} text-lg` }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `font-bold text-lg ${isComplete ? "text-emerald-900" : "text-slate-700"}`, children: tab.label })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: `font-black text-sm px-3 py-1 rounded-xl ${isComplete ? "bg-emerald-400 text-emerald-900" : "bg-white border-2 border-slate-200 text-slate-600"}`, children: [
                  stats?.completed,
                  "/",
                  stats?.total
                ] })
              ]
            },
            tab.id
          );
        }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mt-8 text-center print:hidden", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-slate-500 font-medium mb-4", children: "When you are ready, you can generate a report for your teacher." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "button",
            {
              onClick: generateTeacherExport,
              className: "inline-flex items-center px-8 py-4 bg-violet-500 border-2 border-violet-600 rounded-2xl shadow-[0_6px_0_0_#5b21b6] text-white font-black text-lg hover:bg-violet-400 hover:-translate-y-1 hover:shadow-[0_8px_0_0_#5b21b6] active:translate-y-[6px] active:shadow-none transition-all",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "fa-solid fa-print mr-2" }),
                "Print Teacher Report"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mt-16 pt-8 border-t-2 border-slate-200 border-dashed text-center print:hidden", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-slate-500 font-medium mb-4", children: "Sharing this computer with another student? Clear your data so they can start fresh." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "button",
            {
              onClick: handleResetWorkbook,
              className: "inline-flex items-center px-6 py-3 bg-white text-rose-600 font-bold border-2 border-rose-200 hover:border-rose-500 hover:bg-rose-50 rounded-2xl transition-all shadow-sm",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "fa-solid fa-rotate-left w-5 h-5 mr-2" }),
                "Reset entire workbook"
              ]
            }
          )
        ] })
      ] });
    };
    const renderContent = () => {
      switch (activeTab) {
        case "overview":
          return renderOverview();
        case "inventory":
          return renderInventory();
        case "goals":
          return renderGoals();
        case "romantic":
          return renderRomantic();
        case "evaluating":
          return renderEvaluating();
        case "alcohol":
          return renderAlcohol();
        case "tobacco":
          return renderTobacco();
        case "risk":
          return renderRisk();
        case "addictions":
          return renderAddictions();
        case "mentalhealth":
          return renderMentalHealth();
        case "taskA":
          return renderTaskA();
        case "taskB":
          return renderTaskB();
        case "submit":
          return renderSubmit();
        default:
          return renderOverview();
      }
    };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "min-h-screen bg-[#f1f5f9] flex flex-col md:flex-row font-sans selection:bg-violet-300 selection:text-violet-900 print:bg-white", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "md:hidden bg-violet-600 text-white p-4 flex justify-between items-center sticky top-0 z-50 border-b-4 border-violet-800 print:hidden", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "font-black text-xl tracking-tight", children: "CALM Workbook" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex gap-2", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => setIsMobileMenuOpen(!isMobileMenuOpen), className: "p-2 bg-violet-500 hover:bg-violet-400 rounded-xl transition-colors border-2 border-violet-400", children: isMobileMenuOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "fa-solid fa-xmark text-xl" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "fa-solid fa-bars text-xl" }) }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `
                ${isMobileMenuOpen ? "block" : "hidden"} 
                md:flex w-full md:w-72 lg:w-80 bg-violet-600 text-violet-100 flex-shrink-0 flex-col h-auto md:h-screen md:sticky md:top-0 z-40 overflow-y-auto shadow-[8px_0_30px_rgba(0,0,0,0.1)] border-r-4 border-violet-800 print:hidden
              `, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "p-8 hidden md:block border-b-4 border-violet-500/50", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-violet-600 font-black text-4xl mb-6 shadow-[0_6px_0_0_#4c1d95] transform -rotate-3", children: "C" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { className: "text-3xl font-black text-white mb-2 tracking-tight", children: "CALM" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { className: "text-sm font-bold bg-violet-800 text-violet-200 inline-block px-3 py-1 rounded-lg uppercase tracking-widest", children: "Module 1" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", { className: "flex-1 px-4 py-6 space-y-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mb-8 bg-violet-700/40 p-5 rounded-2xl border-2 border-violet-500/50 shadow-inner", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex justify-between items-center mb-3", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-sm font-black text-violet-200 uppercase tracking-widest", children: "Progress" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "text-sm font-black text-white bg-violet-500 px-3 py-1 rounded-xl shadow-[0_2px_0_0_#4c1d95]", children: [
                progressData.overallPercentage,
                "%"
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-4 bg-violet-900/60 rounded-full overflow-hidden border-2 border-violet-800/80 shadow-inner", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "div",
              {
                className: "h-full bg-gradient-to-r from-emerald-400 to-emerald-300 rounded-full transition-all duration-1000 ease-out relative",
                style: { width: `${progressData.overallPercentage}%` },
                children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-0 left-0 w-full h-full bg-white/20" })
              }
            ) })
          ] }),
          tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const tabStats = progressData.stats[tab.id];
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
              "button",
              {
                onClick: () => {
                  setActiveTab(tab.id);
                  setIsMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                },
                className: `w-full flex items-center px-4 py-4 rounded-2xl text-base font-bold transition-all duration-200 border-2 ${isActive ? `bg-white text-slate-800 border-white shadow-[0_4px_0_0_#4c1d95] transform scale-[1.02] z-10 relative` : "bg-violet-500/30 border-transparent text-violet-100 hover:bg-violet-500/50 hover:border-violet-400"}`,
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${isActive ? tab.bg : "bg-violet-500/50"}`, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: `${tab.icon} text-lg ${isActive ? tab.color : "text-violet-200"}` }) }),
                  tab.label,
                  tabStats?.isComplete && tab.id !== "submit" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ml-auto w-7 h-7 bg-emerald-400 text-emerald-900 rounded-[0.6rem] flex items-center justify-center shadow-[0_3px_0_0_#059669] transform rotate-3", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "fa-solid fa-check font-black" }) }) : tabStats?.completed > 0 && tab.id !== "submit" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `ml-auto text-xs font-black px-2 py-1.5 rounded-xl border-2 ${isActive ? "bg-slate-100 text-slate-500 border-slate-200" : "bg-violet-800/50 text-violet-300 border-violet-500/30"}`, children: [
                    tabStats.completed,
                    "/",
                    tabStats.total
                  ] }) : null
                ]
              },
              tab.id
            );
          })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex-1 max-w-5xl mx-auto w-full p-4 md:p-10 lg:p-14 overflow-y-auto print:p-0 print:max-w-full print:overflow-visible", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mb-10 flex flex-wrap items-center justify-end gap-4 print:hidden", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "inline-flex items-center bg-white px-4 py-2 rounded-xl shadow-[0_4px_0_0_#e2e8f0] border-2 border-slate-200 transform rotate-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: `fa-solid fa-floppy-disk w-4 h-4 mr-2 transition-colors ${saveStatus === "Saving..." ? "text-amber-500 animate-pulse" : "text-emerald-500"}` }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-sm font-bold text-slate-600", children: saveStatus })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "animate-in fade-in slide-in-from-bottom-8 duration-500 print:animate-none", children: renderContent() }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mt-12 space-y-6 print:hidden", children: [
          progressData.stats[activeTab]?.isComplete && activeTab !== "submit" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-emerald-400 p-6 rounded-[2rem] border-4 border-emerald-500 shadow-[0_8px_0_0_#059669] flex flex-col sm:flex-row items-center justify-between text-emerald-900 animate-in zoom-in duration-500", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center mb-4 sm:mb-0", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-12 h-12 bg-white rounded-full flex items-center justify-center mr-4", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-2xl", children: "\u{1F389}" }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "text-2xl font-black", children: "Section Complete!" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
              "button",
              {
                onClick: () => {
                  const idx = tabs.findIndex((t) => t.id === activeTab);
                  if (idx < tabs.length - 1) {
                    setActiveTab(tabs[idx + 1].id);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                },
                className: "w-full sm:w-auto px-6 py-3 bg-white text-emerald-700 font-black rounded-xl hover:bg-emerald-50 hover:scale-105 active:scale-95 transition-all shadow-sm",
                children: [
                  "Go to Next Module ",
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "fa-solid fa-arrow-right ml-2" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex justify-between items-center px-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
              "button",
              {
                className: `flex items-center px-6 py-4 bg-white border-2 border-slate-200 rounded-2xl shadow-[0_6px_0_0_#e2e8f0] text-slate-700 font-black text-lg hover:bg-slate-50 hover:-translate-y-1 hover:shadow-[0_8px_0_0_#e2e8f0] active:translate-y-[6px] active:shadow-none transition-all ${tabs.findIndex((t) => t.id === activeTab) === 0 ? "opacity-0 pointer-events-none" : ""}`,
                onClick: () => {
                  const idx = tabs.findIndex((t) => t.id === activeTab);
                  if (idx > 0) {
                    setActiveTab(tabs[idx - 1].id);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                },
                tabIndex: tabs.findIndex((t) => t.id === activeTab) === 0 ? -1 : 0,
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "fa-solid fa-chevron-left w-6 h-6 mr-2" }),
                  "Back"
                ]
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
              "button",
              {
                className: `flex items-center px-8 py-4 bg-violet-500 border-2 border-violet-600 rounded-2xl shadow-[0_6px_0_0_#5b21b6] text-white font-black text-lg hover:bg-violet-400 hover:-translate-y-1 hover:shadow-[0_8px_0_0_#5b21b6] active:translate-y-[6px] active:shadow-none transition-all ${tabs.findIndex((t) => t.id === activeTab) === tabs.length - 1 ? "opacity-0 pointer-events-none" : ""}`,
                onClick: () => {
                  const idx = tabs.findIndex((t) => t.id === activeTab);
                  if (idx < tabs.length - 1) {
                    setActiveTab(tabs[idx + 1].id);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                },
                tabIndex: tabs.findIndex((t) => t.id === activeTab) === tabs.length - 1 ? -1 : 0,
                children: [
                  "Next",
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "fa-solid fa-chevron-right w-6 h-6 ml-2" })
                ]
              }
            )
          ] })
        ] })
      ] })
    ] });
  }
  var root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(App, {}));
})();
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
