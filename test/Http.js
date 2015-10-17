var Http = require('machinepack-http');
var scxml = require('scxml');

var PKG = 'Http';
var NS = "https://github.com/mikermcneil/machinepack-http/";    //TODO: maybe this can be derived from the package.json?
var plugin = {};

plugin[NS] = {};

//TODO: provide a mechanism to register plugin globally. Like, not on the object.

//register two custom methods on SCION
Object.keys(Http).forEach(function(machinepackId){
  var machinepack = Http[machinepackId];

  plugin[NS][machinepackId] = function(action){
    return PKG + '.' + machinepackId + '({\n' +
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
        return '    ' + key + ' : (function(result){ this.send({name : ' + JSON.stringify(PKG + '.' + key) + ', data : result}); }).bind(this)'
      }).join(',\n') + 
    '\n});'
  }
});

var customRuntimeGlobals = {};
customRuntimeGlobals[PKG] = Http;

scxml.pathToModel(__dirname + '/plugin.scxml', function(err, model) {
  console.log('model',model);
  if(err) throw err;

  var sc = new scxml.scion.Statechart(model);
  var initialConfig = sc.start();

  console.log('initialConfig ',initialConfig );
  /*
  expect(initialConfig).toEqual(['a']);

  var nextConfig = sc.gen("t");

  expect(nextConfig,['b']);

  expect(runtimeTest.customRuntimeCb1).toHaveBeenCalledWith('0');
  expect(runtimeTest.customRuntimeCb2).toHaveBeenCalledWith(1);
  expect(runtimeTest.customRuntimeCb3).toHaveBeenCalledWith(2);

  flag = true;
  */
}, 
{
  customActionElements : plugin,
  customRuntimeGlobals : customRuntimeGlobals 
});

