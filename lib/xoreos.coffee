fs = require 'fs'
path = require 'path'
cprocess = require 'child_process'
spawn = cprocess.spawn

{KEYV1,BIFFV1} = require './data/keybiff'

class ArchiveEntry
  constructor: (@path, @type) ->
    @name = null

    if @isDirectory()
      @children = []

  add: (entry) ->
    if !@isParentOf(entry)
      return false;

    segments = entry.getPath().substring(@getPath().length + 1).split(path.sep);
    if segments.length == 0
      return false;

    if segments.length == 1
      @children.push(entry);
      return true;

    else
      name = segments[0];
      child = @findEntryWithName(@children, name);
      if child == null
        child = new ArchiveEntry("" + (@getPath()) + path.sep + name, 5);
        @children.push(child);

      if child.isDirectory()
        return child.add(entry);
      else
        return false;

  isParentOf: (entry) ->
    @isDirectory() && entry.getPath().indexOf("" + (@getPath()) + path.sep) == 0

  getPath: ->
    return @path

  getName: ->
    if @name != null
      return @name
    else
      return @name = path.basename(@path)

  isFile: ->
    return @type == 0

  isDirectory: ->
    return @type == 5

  isSymbolicLink: ->
    return @type == 2

  toString: ->
    return @getPath()

  findEntryWithName: (entries, name) ->
    for entry in entries
      if name == entry.getName()
        return entry
    return null

module.exports =
  readFile: (keyFile, archivePath, entryPath, callback) ->
    bif = keyFile.bifs[path.dirname(entryPath)]
    res = bif.ress[path.basename(entryPath)]

    bif.data ?= fs.readFileSync(path.dirname(archivePath) + path.sep + bif.path)
    bif.file ?= BIFFV1.parse(bif.data)

    res = bif.file.variableResources[res.resId]
    callback(null, bif.data.slice(res.offset, res.offset+res.size))

  list: (archivePath, callback) ->
    keyFile = KEYV1.parse(fs.readFileSync(archivePath))

    entry = new ArchiveEntry(archivePath, 5)

    for _, bif of keyFile.bifs
      entry.add(new ArchiveEntry(archivePath + path.sep + bif.path, 5))
      for resPath, res of bif.ress
        entry.add(new ArchiveEntry(archivePath + path.sep + bif.path + path.sep + resPath, 0))

    callback(null, keyFile, [entry])
