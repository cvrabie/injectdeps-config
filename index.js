'use strict';

module.exports = (config, settings) => (container) => {
  if(!container) container = require('injectdeps').getContainer();
  this.settings = settings || {};
  if (!this.settings) this.settings = {};
  if (!this.settings.root) this.settings.root = '';
  if (!this.settings.prefix) this.settings.prefix = '';
  if (!this.settings.typeHints) this.settings.typeHints = {};
  if (!this.settings.log) this.settings.log = false;
  if (!this.settings.objects) this.settings.objects = false;

  if (this.settings.root === '') {
    this.all = config;
  }
  else if (config.has(this.settings.root)) {
    this.all = config.get(this.settings.root);
  }
  else {
    throw new Error(`Could not find configuration root ${this.settings.root}!`);
  }

  if(this.settings.log) this.logs = [];

  this.bindString = function(val, path) {
    if (this.settings.log) this.logs.push(`Binding ${path} to string ${val}`);
    container.bindName(path).toScalarValue(val);
  };

  this.bindNumber = function(val, path) {
    if (this.settings.log) this.logs.push(`Binding ${path} to number ${val}`);
    container.bindName(path).toScalarValue(val);
  };

  this.bindBoolean = function(val, path) {
    if (this.settings.log) this.logs.push(`Binding ${path} to boolean ${val}`);
    container.bindName(path).toScalarValue(val);
  };

  this.bindArray = function (val, path) {
    if (this.settings.log) {
      if (this.settings.typeHints[path] === 'string')
        this.logs.push(`Binding ${path} to string[] ${val}`);
      else if (this.settings.typeHints[path] === 'number')
        this.logs.push(`Binding ${path} to number[] ${val}`);
      else
        this.logs.push(`Binding ${path} to any[] ${val}`);
    }
    container.bindName(path).toPlainObject(val);
  };

  this.bindUnknown = function (val, path) {
    if (typeof val === 'string') this.bindString(val, path);
    else if (typeof val === 'number') this.bindNumber(val, path);
    else if (typeof val === 'boolean') this.bindBoolean(val, path);
    else if (val instanceof Array) this.bindArray(val, path);
    else if (typeof val === 'object') this.bindAllInObject(val, path);
  };

  this.bindAllInObject = function (obj, path) {
    if (this.settings.objects) {
      if (this.settings.log) {
        this.logs.push(`Binding ${path} to Object ${obj}`);
      }
      container.bindName(path).toPlainObject(obj);
    }
    if (path && path.length > 0) {
      path = `${path}.`;
    }
    for (let k in obj) {
      if (obj.hasOwnProperty(k)) {
        this.bindUnknown(obj[k], path + k);
      }
    }
  };

  if(this.all){
    //actually bind config
    this.bindAllInObject(this.all, this.settings.prefix);
    if(this.settings.log) this.settings.logs = this.logs;
  }
  return container;
};