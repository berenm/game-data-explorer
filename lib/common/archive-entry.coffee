path = require 'path'

module.exports =
class ArchiveEntry
  constructor: (@path, @type) ->
    @name = null

    if @isDirectory()
      @children = []

  add: (entry) ->
    if not @isParentOf(entry)
      return false

    segments = entry.getPath().substring(@getPath().length + 1).split(path.sep)
    if segments.length is 0
      return false

    if segments.length is 1
      @children.push(entry)
      return true

    else
      name = segments[0]
      child = @findEntryWithName(@children, name)
      if not child?
        child = new ArchiveEntry('' + (@getPath()) + path.sep + name, 5)
        @children.push(child)

      if child.isDirectory()
        return child.add(entry)
      else
        return false

  isParentOf: (entry) ->
    @isDirectory() and entry.getPath().indexOf('' + (@getPath()) + path.sep) is 0

  getPath: ->
    return @path

  getName: ->
    if @name?
      return @name
    else
      return @name = path.basename(@path)

  isFile: ->
    return @type is 0

  isDirectory: ->
    return @type is 5

  isSymbolicLink: ->
    return @type is 2

  toString: ->
    return @getPath()

  findEntryWithName: (entries, name) ->
    for entry in entries
      if name is entry.getName()
        return entry
    return null
