!function(global, factory) {
    "object" == typeof exports && "undefined" != typeof module ? factory(exports, require("angular"), require("vue")) : "function" == typeof define && define.amd ? define("ngVue", [ "exports", "angular", "vue" ], factory) : factory(global.ngVue = global.ngVue || {}, global.angular, global.Vue);
}(this, function(exports, angular, Vue) {
    "use strict";
    var angular__default = "default" in angular ? angular.default : angular;
    Vue = "default" in Vue ? Vue.default : Vue;
    var nestRE = /^(attrs|props|on|nativeOn|class|style|hook)$/, babelHelperVueJsxMergeProps = function(objs) {
        return objs.reduce(function(a, b) {
            var aa, bb, key, nestedKey, temp;
            for (key in b) if (aa = a[key], bb = b[key], aa && nestRE.test(key)) if ("class" === key && ("string" == typeof aa && (temp = aa, 
            a[key] = aa = {}, aa[temp] = !0), "string" == typeof bb && (temp = bb, b[key] = bb = {}, 
            bb[temp] = !0)), "on" === key || "nativeOn" === key || "hook" === key) for (nestedKey in bb) aa[nestedKey] = mergeFn(aa[nestedKey], bb[nestedKey]); else if (Array.isArray(aa)) a[key] = aa.concat(bb); else if (Array.isArray(bb)) a[key] = [ aa ].concat(bb); else for (nestedKey in bb) aa[nestedKey] = bb[nestedKey]; else a[key] = b[key];
            return a;
        }, {});
    };
    function mergeFn(a, b) {
        return function() {
            a && a.apply(this, arguments), b && b.apply(this, arguments);
        };
    }
    function extractExpressions(exprType, attributes) {
        var objectExprKey = {
            props: "vProps",
            data: "vData",
            on: "vOn"
        }[exprType], objectPropExprRegExp = new RegExp(objectExprKey, "i"), objectExpr = attributes[objectExprKey];
        if (angular__default.isDefined(objectExpr)) return objectExpr;
        var expressions = Object.keys(attributes).filter(function(attr) {
            return objectPropExprRegExp.test(attr);
        });
        if (0 === expressions.length) return null;
        var exprsMap = {};
        return expressions.forEach(function(attrExprName) {
            var removedKey, letter, propName, exprName = (removedKey = objectExprKey, propName = attrExprName.slice(removedKey.length), 
            (letter = propName).charAt(0).toLowerCase() + letter.slice(1));
            exprsMap[exprName] = attributes[attrExprName];
        }), exprsMap;
    }
    var _extends = Object.assign || function(target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i];
            for (var key in source) Object.prototype.hasOwnProperty.call(source, key) && (target[key] = source[key]);
        }
        return target;
    }, toConsumableArray = function(arr) {
        if (Array.isArray(arr)) {
            for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];
            return arr2;
        }
        return Array.from(arr);
    };
    function notify(setter, inQuirkMode) {
        return function(newVal) {
            var value = newVal;
            inQuirkMode && (value = angular.isArray(newVal) ? [].concat(toConsumableArray(newVal)) : angular.isObject(newVal) ? _extends({}, newVal) : newVal), 
            setter(value);
        };
    }
    function watchExpressions(dataExprsMap, reactiveData, options, scope) {
        var expressions = dataExprsMap.props ? dataExprsMap.props : dataExprsMap.data;
        if (expressions) {
            var depth = options.depth, quirk = options.quirk, watcher = function(expressions, reactiveData) {
                return function(watchFunc) {
                    angular.isString(expressions) ? watchFunc(expressions, Vue.set.bind(Vue, reactiveData, "_v")) : Object.keys(expressions).forEach(function(name) {
                        watchFunc(expressions[name], Vue.set.bind(Vue, reactiveData._v, name));
                    });
                };
            }(expressions, reactiveData);
            switch (depth) {
              case "value":
                watcher(function(expression, setter) {
                    scope.$watch(expression, notify(setter, quirk), !0);
                });
                break;

              case "collection":
                watcher(function(expression, setter) {
                    scope.$watchCollection(expression, notify(setter, quirk));
                });
                break;

              case "reference":
              default:
                watcher(function(expression, setter) {
                    scope.$watch(expression, notify(setter, quirk));
                });
            }
        }
    }
    var transformers = {
        Object: function(value) {
            return [ value ];
        },
        Array: function(value) {
            return value;
        },
        String: function(value) {
            return value.split(/\s*,\s*/g).filter(Boolean).map(function(name) {
                return {
                    name: name
                };
            });
        }
    };
    function ngVueLinker(componentName, jqElement, elAttributes, scope, $injector) {
        var attributes, _this = this, _arguments = arguments, $ngVue = $injector.has("$ngVue") ? $injector.get("$ngVue") : null, $compile = $injector.get("$compile"), dataExprsMap = {
            data: extractExpressions("data", attributes = elAttributes),
            props: extractExpressions("props", attributes),
            events: extractExpressions("on", attributes)
        }, Component = function(name, $injector) {
            return angular__default.isFunction(name) ? name : $injector.get(name);
        }(componentName, $injector), directives = function(attributes, scope) {
            var directivesExpr = attributes.vDirectives;
            if (angular__default.isUndefined(directivesExpr)) return null;
            var value, directives = scope.$eval(directivesExpr), transformer = transformers[(value = directives, 
            value.constructor.name)];
            return transformer ? transformer(directives) : null;
        }(elAttributes, scope) || [], reactiveData = {
            _v: function(dataExprsMap, scope) {
                var expr = dataExprsMap[dataExprsMap.props ? "props" : "data"];
                if (!expr) return null;
                if (angular__default.isString(expr)) return scope.$eval(expr);
                var evaluatedValues = {};
                return Object.keys(expr).forEach(function(key) {
                    evaluatedValues[key] = scope.$eval(expr[key]);
                }), evaluatedValues;
            }(dataExprsMap, scope) || {}
        }, on = function(dataExprsMap, scope) {
            var events = dataExprsMap.events;
            if (!events || !angular__default.isObject(events)) return null;
            var evaluatedEvents = {};
            return Object.keys(events).forEach(function(eventName) {
                evaluatedEvents[eventName] = scope.$eval(events[eventName]);
                var fn = evaluatedEvents[eventName];
                angular__default.isFunction(fn) && (evaluatedEvents[eventName] = function() {
                    var _arguments = arguments;
                    return scope.$evalAsync(function() {
                        return fn.apply(null, _arguments);
                    });
                });
            }), evaluatedEvents;
        }(dataExprsMap, scope) || {}, inQuirkMode = !!$ngVue && $ngVue.inQuirkMode(), vueHooks = $ngVue ? $ngVue.getVueHooks() : {}, mounted = vueHooks.mounted;
        vueHooks.mounted = function() {
            if (jqElement[0].innerHTML.trim()) {
                var html = $compile(jqElement[0].innerHTML)(scope), slot = this.$refs.__slot__;
                slot.parentNode.replaceChild(html[0], slot);
            }
            angular__default.isFunction(mounted) && mounted.apply(this, arguments);
        }, elAttributes.renderSlot && setTimeout(function() {
            if (jqElement[0].innerHTML.trim()) {
                var html = $compile(jqElement[0].innerHTML)(scope), slot = _this.$refs.__slot__;
                slot.parentNode.replaceChild(html[0], slot);
            }
            angular__default.isFunction(mounted) && mounted.apply(_this, _arguments);
        }, 500);
        var vuexStore = $ngVue ? {
            store: $ngVue.getVuexStore()
        } : {}, watchOptions = {
            depth: elAttributes.watchDepth,
            quirk: inQuirkMode
        };
        watchExpressions(dataExprsMap, reactiveData, watchOptions, scope);
        var vueInstance = new Vue(_extends({
            name: "NgVue",
            el: jqElement[0],
            data: reactiveData,
            render: function(h) {
                return h(Component, babelHelperVueJsxMergeProps([ {
                    directives: directives
                }, {
                    props: reactiveData._v,
                    on: on
                } ]), [ h("span", {
                    ref: "__slot__"
                }) ]);
            }
        }, vueHooks, vuexStore));
        scope.$on("$destroy", function() {
            vueInstance.$destroy(), vueInstance.$el.remove();
        });
    }
    var ngVue = angular__default.module("ngVue", []).directive("vueComponent", [ "$injector", function($injector) {
        return {
            restrict: "E",
            link: function(scope, elem, attrs) {
                ngVueLinker(attrs.name, elem, attrs, scope, $injector);
            }
        };
    } ]).factory("createVueComponent", [ "$injector", function($injector) {
        return function(componentName, ngDirectiveConfig) {
            var config = {
                restrict: "E",
                link: function(scope, elem, attrs) {
                    ngVueLinker(componentName, elem, attrs, scope, $injector);
                }
            };
            return angular__default.extend(config, ngDirectiveConfig);
        };
    } ]);
    exports.ngVue = ngVue, Object.defineProperty(exports, "__esModule", {
        value: !0
    });
});
