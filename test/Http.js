var Http = require('machinepack-http');
var scionMachinepack = require('../');
var scxml = require('scxml');

var PKG = 'Http';
var NS = "https://github.com/mikermcneil/machinepack-http/";    //TODO: maybe this can be derived from the package.json?

var customRuntimeGlobals = {};
customRuntimeGlobals[PKG] = Http;

var plugin = scionMachinepack.machinepackToPlugin(Http, PKG, NS); 

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

