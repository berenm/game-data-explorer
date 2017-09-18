/** @babel */

import path from 'path'

import {Disposable, Directory, Emitter, PathWatcher} from 'atom'

import {fs} from './util'

export default class BinaryFile {
    // Public: Configures a new File instance, no files are accessed.
    //
    // * `filePath` A {String} containing the absolute path to the file
    constructor(filePath) {
      this.filePath = path.normalize(filePath)

      this.realPath = null
      this.subscriptionCount = 0
      this.emitter = new Emitter()
      this.changes = []
      this.flatten = []

      this.fileDesc = null
      this.fileSize = -1
    }

    /*
    Section: Event Subscription
    */

    // Public: Invoke the given callback when the file's contents change.
    //
    // * `callback` {Function} to be called when the file's contents change.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
    onDidChange(callback) {
      return this.registerSubscription(this.emitter.on('did-change', callback))
    }

    // Public: Invoke the given callback when the file's path changes.
    //
    // * `callback` {Function} to be called when the file's path changes.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
    onDidRename(callback) {
      return this.registerSubscription(this.emitter.on('did-rename', callback))
    }

    // Public: Invoke the given callback when the file is deleted.
    //
    // * `callback` {Function} to be called when the file is deleted.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
    onDidDelete(callback) {
      return this.registerSubscription(this.emitter.on('did-delete', callback))
    }

    // Public: Invoke the given callback when there is an error with the watch.
    // When your callback has been invoked, the file will have unsubscribed from
    // the file watches.
    //
    // * `callback` {Function} callback
    //   * `errorObject` {Object}
    //     * `error` {Object} the error object
    //     * `handle` {Function} call this to indicate you have handled the error.
    //       The error will not be thrown if this function is called.
    onWillThrowWatchError(callback) {
      return this.emitter.on('will-throw-watch-error', callback)
    }

    /*
    Section: File Metadata
    */

    // Public: Returns a {Boolean}, always true.
    isFile() { return true }

    // Public: Returns a {Boolean}, always false.
    isDirectory() { return false }

    // Public: Returns a promise that resolves to a {Boolean}, true if the file
    // exists, false otherwise.
    async exists() {
      return fs.existsAsync(this.getPath())
    }

    // Public: Returns a {Boolean}, true if the file exists, false otherwise.
    existsSync() {
      return fs.existsSync(this.getPath())
    }

    async open() {
      if (this.fileDesc !== null) return true
      this.fileDesc = await fs.openAsync(this.filePath, 'r+')
      this.fileSize = await fs.fstatAsync(this.fileDesc).size
      this.flatten = this.flattenChanges()
      return true
    }

    openSync() {
      if (this.fileDesc !== null) return true
      this.fileDesc = fs.openSync(this.filePath, 'r+')
      this.fileSize = fs.fstatSync(this.fileDesc).size
      this.flatten = this.flattenChanges()
      return true
    }

    /*
    Section: Managing Paths
    */

    // Public: Returns the {String} path for the file.
    get path() { return this.filePath }
    get file() { return this.fileDesc }
    get size() { return this.fileSize }

    // Public: Return the {String} filename without any directory information.
    get basename() { return path.basename(this.filePath) }

    // Public: Returns a promise that resolves to the file's completely resolved {String} path.
    async getRealPath() {
      if (this.realPath !== null) return this.realPath
      this.realPath = await fs.realpathAsync(this.filePath)
      return this.realPath
    }

    // Public: Returns this file's completely resolved {String} path.
    getRealPathSync() {
      if (this.realPath !== null) return this.realPath
      this.realPath = fs.realpathSync(this.filePath)
      return this.realPath
    }

    /*
    Section: Traversing
    */

    // Public: Return the {Directory} that contains this file.
    get parent() { return new Directory(path.dirname(this.filePath)) }

    /*
    Section: Reading and Writing
    */

    insertAt(offset, buffer) {
      this.changes.push({type: 'insert', offset: offset, data: buffer})
      this.flatten = this.flattenChanges()
      this.emitter.emit('did-change')
    }

    deleteAt(offset, size) {
      this.changes.push({type: 'delete', offset: offset, size: size})
      this.flatten = this.flattenChanges()
      this.emitter.emit('did-change')
    }

    readSync(position, length) {
      if (this.fileDesc === null) throw new Error("File isn't opened yet")

      let buffer = new Buffer(length)
      let bufferLength = 0

      for (let i = 0; i < this.flatten.length - 1; i++) {
        let change = this.flatten[i]
        let nextChange = this.flatten[i + 1]
        if (nextChange.offset < position)
          continue

        let skipLength = Math.max(0, position - change.offset)
        let copyLength = Math.min(change.data.length - skipLength, length - bufferLength)
        if (change.data.length > skipLength && copyLength > 0) {
          change.data.copy(buffer, bufferLength, skipLength, skipLength + copyLength)
          bufferLength += copyLength
          skipLength = Math.max(0, skipLength - copyLength)
        }

        let readLength = Math.min(nextChange.offset - (change.offset + change.data.length), length - bufferLength)
        bufferLength += fs.readSync(this.fileDesc, buffer, bufferLength, readLength, change.fileOffset + skipLength)
      }

      return buffer.slice(0, bufferLength)
    }

    writeSync() {
      if (this.fileDesc === null) throw new Error("File isn't opened yet")

      let flatten = this.flatten
      this.flatten = []
      this.changes = []

      const readFileData = (startIndex, endFileOffset) => {
        for (let i = startIndex; i < flatten.length - 1; i++) {
          let change = flatten[i]
          if (change.fileOffset > endFileOffset)
            break

          let nextChange = flatten[i + 1]
          let fileReadSize = Math.min(nextChange.offset - (change.offset + change.data.length),
                                      endFileOffset - change.fileOffset)
          if (fileReadSize <= 0)
            continue

          let buffer = new Buffer(fileReadSize)
          let bufferLength = fs.readSync(this.fileDesc, buffer, 0, fileReadSize, change.fileOffset)
          change.data = Buffer.concat([ change.data, buffer.slice(0, bufferLength) ])
          change.fileOffset += bufferLength
        }
      }

      for (let i = 0; i < flatten.length - 1; i++) {
        let change = flatten[i]
        let nextChange = flatten[i + 1]
        readFileData(i, nextChange.offset)
        fs.writeSync(this.fileDesc, change.data, 0, change.data.length, change.offset)
      }

      this.emitter.emit('did-change')
    }

    /*
    Section: Private
    */

    flattenChanges() {
      let flatten = [{ offset: 0, fileOffset: 0, data: new Buffer(0) }]
      if (this.fileSize > 0)
        flatten.push({ offset: this.fileSize, fileOffset: this.fileSize, data: new Buffer(0) })

      const upperBound = (offset) => {
        for (let [i, item] of flatten.entries())
          if (item.offset > offset) return i
        return flatten.length
      }

      const applyInsert = (change) => {
        let i = upperBound(change.offset)
        let prev = flatten[i - 1]
        let diff = change.offset - prev.offset

        if (prev.data.length >= diff) {
          prev.data = Buffer.concat([prev.data.slice(0, diff),
                                     change.data,
                                     prev.data.slice(diff)])
        } else {
          flatten.splice(i++, 0, {
            offset: change.offset,
            fileOffset: prev.fileOffset + diff,
            data: change.data
          })
        }

        for (let j = i; j < flatten.length; j++)
          flatten[j].offset += change.data.length
      }

      const applyDelete = (change) => {
        let i = upperBound(change.offset)
        let prev = flatten[i - 1]
        let diff = change.offset - prev.offset

        if (prev.data.length > diff) {
          if (diff + change.size > prev.data.length)
            prev.fileOffset += diff + change.size - prev.data.length
          prev.data = Buffer.concat([prev.data.slice(0, diff), prev.data.slice(diff + change.size)])

          let changeEnd = change.offset + change.size
          while (i < flatten.length && changeEnd >= flatten[i].offset) {
            let deleteCount = changeEnd - flatten[i].offset

            prev.fileOffset = flatten[i].fileOffset
            if (deleteCount > flatten[i].data.length)
              prev.fileOffset += deleteCount - flatten[i].data.length
            prev.data = Buffer.concat([prev.data, flatten[i].data.slice(deleteCount)])

            flatten.splice(i, 1)
          }
        } else {
          if (prev.offset !== change.offset) {
            flatten.splice(i, 0, {
              offset: change.offset,
              fileOffset: prev.fileOffset + (diff - prev.data.length),
              data: prev.data.slice(diff)
            })
            prev.data = prev.data.slice(0, diff)
            prev = flatten[i]
            i = i + 1
          }

          prev.fileOffset += change.size
          prev.offset = change.offset
          prev.data = prev.data.slice(change.size)
        }

        for (let j = i; j < flatten.length; j++)
          flatten[j].offset -= change.size

        while (i < flatten.length && prev.offset >= flatten[i].offset) {
          flatten[i].fileOffset += (prev.offset - flatten[i].offset)
          flatten[i].offset = prev.offset
          flatten[i].data = flatten[i].data.slice(prev.offset - flatten[i].offset)
          flatten.splice(i - 1, 1)
        }
      }

      for (let change of this.changes) {
        switch (change.type) {
          case 'delete':
            if (change.size == 0) continue
            applyDelete(change)
            break
          case 'insert':
            applyInsert(change)
            break
        }
      }

      let last = flatten[flatten.length - 1]
      if (this.fileSize === 0)
        flatten.push({ offset: last.offset + last.data.length, fileOffset: this.fileSize, data: new Buffer(0) })

      return flatten
    }

    registerSubscription(subscription) {
      this.subscriptionCount++
      try {
        this.subscribeToNativeChangeEvents()
      } catch (error) {
        /* ignore */
      }
      return new Disposable(() => {
        this.disposeSubscription(subscription)
      })
    }

    disposeSubscription(subscription) {
      this.subscriptionCount--
      if (this.subscriptionCount === 0)
        this.unsubscribeFromNativeChangeEvents()
      subscription.dispose()
    }

    handleNativeChangeEvent(eventType, eventPath) {
      switch (eventType) {
        case 'delete':
          this.cachedContents = null
          this.unsubscribeFromNativeChangeEvents()
          setTimeout((() => this.detectResurrection()), 50)
          break
        case 'rename':
          this.setPath(eventPath)
          this.emitter.emit('did-rename')
          break
        case 'resurrect':
          this.subscribeToNativeChangeEvents()
          /* fallthrough */
        case 'change':
          this.cachedContents = null
          this.emitter.emit('did-change')
          break
      }
    }

    async detectResurrection() {
      if (await this.exists()) {
        this.handleNativeChangeEvent('resurrect')
      } else {
        return this.emitter.emit('did-delete')
      }
    }

    subscribeToNativeChangeEvents() {
      if (this.watchSubscription != null) return
      this.watchSubscription = PathWatcher.watch(this.filePath, (...args) => {
        return this.handleNativeChangeEvent(...Array.from(args || []))
      })
    }

    unsubscribeFromNativeChangeEvents() {
      if (this.watchSubscription == null) return
      this.watchSubscription.close()
    }

    hasSubscriptions() {
      return this.subscriptionCount > 0
    }
}
