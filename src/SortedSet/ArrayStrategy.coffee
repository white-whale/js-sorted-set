class Iterator
  constructor: (@priv, @index) ->
    @data = @priv.data

  hasNext: -> @index < @data.length
  hasPrevious: -> @index > 0
  value: -> if @index < @data.length then @data[@index] else null
  setValue: (value) ->
    throw 'Must set options.allowSetValue' if !@priv.options.allowSetValue
    throw 'Cannot set value at end of set' if !@hasNext()
    @data[@index] = value

  next: ->
    if @index >= @data.length
      null
    else
      new Iterator(@priv, @index + 1)

  previous: ->
    if @index <= 0
      null
    else
      new Iterator(@priv, @index - 1)

binarySearchForIndex = (array, value, comparator) ->
  low = 0
  high = array.length
  while low < high
    mid = (low + high) >>> 1
    if comparator(array[mid], value) < 0
      low = mid + 1
    else
      high = mid
  low

class ArrayStrategy
  constructor: (@options) ->
    @comparator = @options.comparator
    @data = []
    if @options.insertionCollisionStrategy == 'replace'
      @insertionCollion = (value, index) ->
        @data[index] = value
        return null
    else if @options.insertionCollisionStrategy == 'ignore'
      @insertionCollion = -> null
    else
      @insertionCollion = -> throw 'Value already in set'

    if @options.removeNullStrategy == 'ignore'
      @removeNull = ->
    else
      @removeNull = -> throw 'Value not in set'

  toArray: -> @data

  insert: (value) ->
    index = binarySearchForIndex(@data, value, @comparator)

    if index < @data.length and @comparator(@data[index], value) == 0
      return@insertionCollion(value, index)

    @data.splice(index, 0, value)
    true
  remove: (value) ->
    index = binarySearchForIndex(@data, value, @comparator)
    if index >= @data.length or value != @data[index]
      @removeNull()
    else
      @data.splice(index, 1)

  clear: ->
    @data.length = 0

  contains: (value) ->
    index = binarySearchForIndex(@data, value, @comparator)
    @index != @data.length && @data[index] == value

  forEachImpl: (callback, sortedSet, thisArg) ->
    for value, index in @data
      callback.call(thisArg, value, index, sortedSet)
    undefined

  findIterator: (value) ->
    index = binarySearchForIndex(@data, value, @comparator)
    new Iterator(this, index)

  beginIterator: -> new Iterator(this, 0)
  endIterator: -> new Iterator(this, @data.length)

module.exports = ArrayStrategy
