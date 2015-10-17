function machinepackToPlugin(module, pkg, ns){
  var scxml = require('scxml');

  var plugin = {};

  plugin[ns] = {};

  //TODO: provide a mechanism to register plugin globally. Like, not on the object.

  //register two custom methods on SCION
  Object.keys(module).forEach(function(machinepackId){
    var machinepack = module[machinepackId];

    plugin[ns][machinepackId] = function(action){
      return pkg + '.' + machinepackId + '({\n' +
        Object.keys(machinepack.inputs).map(function(key){
          var inputExpression;
          if(action[key]){
            inputExpression = JSON.stringify(action[key]);
          } else if(action[key + 'expr']){
            inputExpression = action[key + 'expr'];
          } else if (machinepack.inputs[key].required) {
            throw new Error('Compiler error: missing required attribute ' + key);
          } else {
            //ignore. input is missing, but not required
          }

          return '    ' + key + ' : ' + inputExpression; 
        }).join(',\n') + 
      '\n}).exec({\n' +
        //exits map to events
        Object.keys(machinepack.exits).map(function(key){
          return '    ' + key + ' : (function(result){ this.send({name : ' + JSON.stringify(pkg + '.' + key) + ', data : result}); }).bind(this)'
        }).join(',\n') + 
      '\n});'
    }
  });
  return plugin; 
}

module.exports.machinepackToPlugin = machinepackToPlugin;
