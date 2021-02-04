        var slice = [].slice;
        var toString = Object.prototype.toString();
        var getPrototypeOf = Object.getPrototypeOf;

        function isArrayLike(obj){
            if(obj == null || isWindow(obj)){
                return false;
            }

            var length = 'length' in Object(obj) && obj.length;
            if(obj.nodeType === NODE_TYPE_ELEMENT && length){
                return true;
            }

            return isString(obj) || isArray(obj) || length === 0 || typeof length === 'number' && length > 0 && (length - 1) in obj;
        }

        function isWindow(obj){
            return obj && obj.window === obj;
        }


        function isBlankObject(value){
            return value !== null && typeof value === 'object' && !getPrototypeOf(value);
        }

        function forEach(obj, iterator, context){
            var key, length;
            if(obj){
                if(isFunction(obj)){
                    for(key in obj){
                        if(key != 'prototype' && key != 'length' && key != 'name' && (!obj.hasOwnProperty || obj.hasOwnProperty(key))){
                            iterator.call(context, obj[key], key, obj);
                        }
                    }
                }else if(isArray(obj) || isArrayLike(obj)){
                    var isPrimitive = typeof obj != 'object';
                    for(key = 0, length = obj.length; key < length; key++){
                        if(isPrimitive || key in obj){
                            iterator.call(context, obj[key], key, obj);
                        }
                    }
                }else if(obj.forEach && obj.forEach !== forEach){
                    obj.forEach(iterator, context, obj);
                }else if(isBlankObject(obj)){
                    for(key in obj){
                        iterator.call(context, obj[key], key, obj);
                    }
                }else if(typeof obj.hasOwnProperty === 'function'){
                    for(key in obj){
                        iterator.call(context, obj[key], key, obj);
                    }
                }else{
                    for(key in obj){
                        if(hasOwnProperty.call(obj, key)){
                            iterator.call(context, obj[key], key, obj);
                        }
                    }
                }
            }
            return obj;
        }

        function extend(dst){
            var objs = slice.call(arguments, 1);
            for(var i = 0, ii = objs.length; i < ii; ++i){
                var obj = objs[i];
                if(!isObject(obj) && !isFunction(obj)) continue;
                var keys = Object.keys(obj);
                for(var j = 0, jj = keys.length; j < jj; j++){
                    var key = keys[j];
                    var src = obj[key];

                    if(isObject(src)){
                        if(isDate(src)){
                            dst[key] = new Date(src.valueOf());
                        }else if(isRegExp(src)){
                            dst[key] = new RegExp(src);
                        }else{
                            if(!isObject(dst[key])){
                                dst[key] = isArray(src) ? [] : {};
                            }
                            extend(dst[key], [src]);
                        }
                    }else{
                        dst[key] = src;
                    }
                }
            }


        }

        var isArray = Array.isArray;

        function isRegExp(value){
            return toString.call(value) === '[object RegExp]';
        }

        function isDate(value){
            return toString.call(value) === '[object Date]';
        }

        function isObject(value){
            return value !== null && typeof value === 'object';
        }

        function isFunction(value){
            return typeof value === 'function';
        }

    module.exports = {
        isRegExp :isRegExp,
        isDate:isDate,
        isObject :isObject,
        isFunction:isFunction,
        extend:extend,
        forEach:forEach,
        isBlankObject:isBlankObject,
        isWindow:isWindow,
        isArrayLike:isArrayLike
    }