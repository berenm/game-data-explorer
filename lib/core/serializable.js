/** @babel */

export default class Serializable {
  static includeInto(clazz, module) {
    clazz.deserialize = function(parameters) {
      if (clazz.validate) parameters = clazz.validate(parameters)
      if (parameters) return new (clazz)(parameters)
    }
    clazz.prototype.serialize = function() { return Object.assign({ deserializer: 'GameDataExplorer', class: `${clazz.name}`, module: `${module}`, version: clazz.version }, this.serialized) }
    clazz.prototype.isEqual = function(other) { return other instanceof clazz && this.serialize() === other.serialize() }
  }
}
