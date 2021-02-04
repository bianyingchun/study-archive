var util = require('./util');
function CacheFactory(cacheId, option){
  var caches = {};
  if(caches[cacheId]){
     return caches[cacheId];
  }
  function Cache(cachedId , options){
    var size = 0,
    stats = util.extend({}, options),
    data = {},
    capacity = (options && options.capacity) || Number.MAX_VALUE,
    lruHash = {},
    freshEnd = null,//最近使用的元素
    staleEnd = null;//未使用时间最长的元素
    return {
                 /**
                  * 往缓存中添加一个元素
                  * 将最近使用的元素置为新增元素
                  * @param key
                  * @param value
                  * @returns {*}
                  */
                 put : function(key, value){
                     var lruEntry = lruHash[key] || (lruHash[key] = {key:key});
                     refresh(lruEntry);

                     if(!(key in data)){
                         size++;
                     }
                     data[key] = value;
                     if(size > capacity){
                         this.remove(staleEnd.key);
                     }
                     return value;
                 },

                 /**
                  * 获取key指定值的value
                  * 将最近使用的置置为该值
                  * @param key
                  * @returns {*}
                  */
                 get : function(key){
                    var lruEntry = lruHash[key];
                     if(!lruEntry){
                         return;
                     }
                     refresh(lruEntry);
                     return data[key];
                 },

                  remove : function(key){
                     var lruEntry = lruHash[key];
                      if(!lruEntry){
                          return;
                      }
                      if(lruEntry == freshEnd){
                          freshEnd = lruEntry.p;
                      }

                      if(lruEntry == staleEnd){
                          staleEnd = staleEnd.n;
                      }

                      link(lruEntry.n, lruEntry.p);
                      delete lruHash[key];
                      delete data[key];
                      size--;
                  },
                 removeAll:function(){
                   data = {};
                     size = 0;
                     lruHash = {};
                     freshEnd = staleEnd = null;
                 },
                 destroy: function() {
                     data = null;
                     stats = null;
                     lruHash = null;
                     delete caches[cacheId];
                 },
                 info:function(){
                     return util.extend({}, stats, {size:size});
                 }
               }

               function refresh(entry){
                   if(entry != freshEnd){
                       if(!staleEnd){
                           staleEnd = entry;
                       }else if(staleEnd == entry){
                           staleEnd = staleEnd.n;
                       }
                       link(entry.n, entry.p);
                       link(entry, freshEnd);
                   }
               }

               function link(nextEntry, prevEntry){
                   if(nextEntry != prevEntry){
                       if(nextEntry){
                           nextEntry.p = prevEntry;
                       }
                       if(prevEntry){
                           prevEntry.n = nextEntry;
                       }
                   }
               }
           }

           caches[cacheId] = Cache(Cache, option);

           CacheFactory.info = function(){
                var info = {};
               util.forEach(caches, function(cache, cacheId){
                    info[cacheId] = cache.info();
               });
               return info;
           };

           return caches[cacheId];
       }

var cache1 = CacheFactory("test1",{capacity:2});
        cache1.put("key1", "value1");
        cache1.get("key1");
        cache1.put("key2", "value2");
        cache1.put("key3", "value3");
        console.log(cache1.get("key1") + "--" + cache1.get("key2") + "--" + cache1.get("key3"))
        console.log(cache1)
