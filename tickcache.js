var TickCache = {
   env: {},
   /*
    * Checks to see if the TickCache's environment has the key, if it does return the associated value, otherwise set the value of the given key to the return value of func
    */
   cache: function(key, func) {
      let check = TickCache.env[key];
      if (check) {
         return check;
      }
      else {
         let value = func();
         TickCache.env[key] = value;
         return value;
      }
   }
}

module.exports = TickCache;