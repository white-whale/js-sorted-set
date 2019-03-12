numberComparator = (a, b) -> a - b
lengthComparator = (a, b) -> a.length - b.length

AbstractSortedSet = require('../../src/SortedSet/AbstractSortedSet')

module.exports =
  describeStrategy: (description, strategy) ->
    describe description, ->
      priv = undefined

      describe 'starting empty', ->
        beforeEach ->
          priv = new strategy(comparator: numberComparator)

        it 'should not contain a value', ->
          expect(priv.contains(2)).to.eq(false)

        it 'should store its data in an array for easy testing', ->
          expect(priv.toArray()).to.deep.eq([])

        it 'should insert an element', ->
          priv.insert(4)
          expect(priv.toArray()).to.deep.eq([4])

        it 'should fail to remove an element', ->
          expect(-> priv.remove(4)).to.throw('Value not in set')

        it 'should fail to remove a !== element', ->
          priv.insert(4)
          expect(-> priv.remove('4')).to.throw('Value not in set')

        it 'should return an iterator with no next or previous', ->
          iterator = priv.findIterator(4)
          expect(iterator.hasNext()).to.eq(false)
          expect(iterator.hasPrevious()).to.eq(false)
          expect(iterator.next()).to.eq(null)
          expect(iterator.previous()).to.eq(null)
          expect(iterator.value()).to.eq(null)

        it 'should return a beginIterator', ->
          iterator = priv.beginIterator()
          expect(iterator.value()).to.eq(null)

        it 'should return an endIterator', ->
          iterator = priv.endIterator()
          expect(iterator.value()).to.eq(null)

        it 'should do nothing in forEachImpl()', ->
          callback = sinon.spy()
          priv.forEachImpl(callback)
          expect(callback).not.to.have.been.called

      describe 'with some numbers', ->
        beforeEach ->
          priv = new strategy(comparator: numberComparator)
          # Insert in this order so binary tree isn't one-sided
          priv.insert(2)
          priv.insert(1)
          priv.insert(3)

        it 'should insert at the beginning', ->
          priv.insert(0)
          expect(priv.toArray()).to.deep.eq([0, 1, 2, 3])

        it 'should insert in the middle', ->
          priv.insert(2.5)
          expect(priv.toArray()).to.deep.eq([1, 2, 2.5, 3])

        it 'should insert at the end', ->
          priv.insert(4)
          expect(priv.toArray()).to.deep.eq([1, 2, 3, 4])

        it 'should throw an error when inserting a duplicate value', ->
          expect(-> priv.insert(1)).to.throw()

        it 'should remove from the beginning', ->
          priv.remove(1)
          expect(priv.toArray()).to.deep.eq([2, 3])

        it 'should remove from the end', ->
          priv.remove(3)
          expect(priv.toArray()).to.deep.eq([1, 2])

        it 'should remove from the middle', ->
          priv.remove(2)
          expect(priv.toArray()).to.deep.eq([1, 3])

        it 'should clear', ->
          priv.clear()
          expect(priv.toArray()).to.deep.eq([])

        it 'should allow insert after clear', ->
          priv.clear()
          priv.insert(4)
          priv.insert(2)
          expect(priv.toArray()).to.deep.eq([ 2, 4 ])

        it 'should contain the first value', ->
          expect(priv.contains(1)).to.eq(true)

        it 'should contain the last value', ->
          expect(priv.contains(3)).to.eq(true)

        it 'should contain a middle value', ->
          expect(priv.contains(2)).to.eq(true)

        it 'should not contain a value below the lowest', ->
          expect(priv.contains(0)).to.eq(false)

        it 'should not contain a value above the highest', ->
          expect(priv.contains(4)).to.eq(false)

        it 'should not contain a value in between two values', ->
          expect(priv.contains(1.5)).to.eq(false)

        it 'should return false from contain', ->
          expect(priv.contains(4)).to.eq(false)

        it 'should return a begin iterator', ->
          iterator = priv.beginIterator()
          expect(iterator.previous()).to.eq(null)
          expect(iterator.value()).to.eq(1)

        it 'should return an end iterator', ->
          iterator = priv.endIterator()
          expect(iterator.next()).to.eq(null)
          expect(iterator.value()).to.eq(null)

        it 'should find an iterator', ->
          iterator = priv.findIterator(2)
          expect(iterator.value()).to.eq(2)

        it 'should find an iterator between values', ->
          iterator = priv.findIterator(1.5)
          expect(iterator.value()).to.eq(2)

        it 'should find an iterator with a value above the max', ->
          iterator = priv.findIterator(3.5)
          expect(iterator.value()).to.eq(null)

        it 'should find an iterator with a value below the min', ->
          iterator = priv.findIterator(0.5)
          expect(iterator.value()).to.eq(1)

        it 'should find a previous iterator', ->
          iterator = priv.findIterator(2).previous()
          expect(iterator.value()).to.eq(1)

        it 'should find a next iterator', ->
          iterator = priv.findIterator(2).next()
          expect(iterator.value()).to.eq(3)

        it 'should step to previous from the end iterator', ->
          iterator = priv.endIterator().previous()
          expect(iterator.value()).to.eq(3)

        it 'should step to end from a previous iterator', ->
          iterator = priv.findIterator(3).next()
          expect(iterator.value()).to.eq(null)

        it 'should fail to setValue()', ->
          iterator = priv.findIterator(2)
          expect(-> iterator.setValue(2.5)).to.throw()

        it 'should iterate in forEachImpl', ->
          set = 'foo'
          thisArg = 'moo'
          spy = sinon.spy()
          priv.forEachImpl(spy, set, thisArg)
          expect(spy).to.have.callCount(3)
          expect(spy.thisValues[0]).to.eq(thisArg)
          expect(spy.args[0]).to.deep.eq([ 1, 0, set  ])
          expect(spy.args[1]).to.deep.eq([ 2, 1, set  ])
          expect(spy.args[2]).to.deep.eq([ 3, 2, set  ])

      describe 'with allowSetValue', ->
        beforeEach ->
          priv = new strategy(comparator: numberComparator, allowSetValue: true)
          priv.insert(1)
          priv.insert(2)

        it 'should allow you to use setValue(), even to do something stupid', ->
          iterator = priv.findIterator(2)
          iterator.setValue(0)
          expect(priv.toArray()).to.deep.eq([1, 0])

        it 'should not allow setValue() on an end iterator', ->
          iterator = priv.endIterator()
          expect(-> iterator.setValue(2.5)).to.throw()

      describe 'with collision options', ->
        it 'should ignore the value when insertionCollisionStrategy = ingore', ->
          priv = new strategy(comparator: lengthComparator, insertionCollisionStrategy: 'ignore')
          priv.insert('a');
          priv.insert('b');
          expect(priv.toArray()).to.deep.eq(['a'])

        it 'should replace the value when insertionCollisionStrategy = replace', ->
          priv = new strategy(comparator: lengthComparator, insertionCollisionStrategy: 'replace')
          priv.insert('a');
          priv.insert('b');
          expect(priv.toArray()).to.deep.eq(['b'])

        it 'should ignore the removal when removeNullStrategy = ignore', ->
          priv = new strategy(comparator: numberComparator, removeNullStrategy: 'ignore')
          priv.remove(1);
          expect(priv.toArray()).to.deep.eq([])

        it 'should ignore the removal when removing a different value with the same comparison', ->
          priv = new strategy(comparator: lengthComparator, removeNullStrategy: 'ignore')
          priv.insert('a');
          priv.remove('b');
          expect(priv.toArray()).to.deep.eq(['a'])

        it 'should update length correctly when insertion is ignored', ->
          priv = new AbstractSortedSet(strategy: strategy, comparator: lengthComparator, insertionCollisionStrategy: 'ignore')
          priv.insert('a');
          priv.insert('b');
          expect(priv.toArray()).to.deep.eq(['a'])
          expect(priv.length).to.equal(1)

        it 'should update length correctly when insertion is replaced', ->
          priv = new AbstractSortedSet(strategy: strategy, comparator: lengthComparator, insertionCollisionStrategy: 'replace')
          priv.insert('a');
          priv.insert('b');
          expect(priv.toArray()).to.deep.eq(['b'])
          expect(priv.length).to.equal(1)

        it 'should update length correctly when removal is ignored', ->
          priv = new AbstractSortedSet(strategy: strategy, comparator: lengthComparator, removeNullStrategy: 'ignore')
          priv.remove('a');
          expect(priv.toArray()).to.deep.eq([])
          expect(priv.length).to.equal(0)

        it 'should not update length when ignoring the removal of a different value with the same comparison', ->
          priv = new AbstractSortedSet(strategy: strategy, comparator: lengthComparator, removeNullStrategy: 'ignore')
          priv.insert('a');
          priv.remove('b');
          expect(priv.toArray()).to.deep.eq(['a'])
          expect(priv.length).to.equal(1)

        it 'should still work correctly after an insertion is ignored', ->
          priv = new AbstractSortedSet(strategy: strategy, comparator: lengthComparator, insertionCollisionStrategy: 'ignore')
          priv.insert('ab');
          priv.insert('abcd');
          priv.insert('a');
          expect(priv.toArray()).to.deep.eq(['a', 'ab', 'abcd'])
          priv.insert('no');
          expect(priv.toArray()).to.deep.eq(['a', 'ab', 'abcd'])
          priv.insert('');
          priv.insert('abc');
          priv.insert('bad');
          priv.insert('abcde');
          expect(priv.toArray()).to.deep.eq(['', 'a', 'ab', 'abc', 'abcd', 'abcde'])
          expect(priv.length).to.equal(6)

        it 'should still work correctly after an insertion is replaced', ->
          priv = new AbstractSortedSet(strategy: strategy, comparator: lengthComparator, insertionCollisionStrategy: 'replace')
          priv.insert('no');
          priv.insert('abcd');
          priv.insert('a');
          expect(priv.toArray()).to.deep.eq(['a', 'no', 'abcd'])
          priv.insert('ab');
          expect(priv.toArray()).to.deep.eq(['a', 'ab', 'abcd'])
          priv.insert('');
          priv.insert('bad');
          priv.insert('abc');
          priv.insert('abcde');
          expect(priv.toArray()).to.deep.eq(['', 'a', 'ab', 'abc', 'abcd', 'abcde'])
          expect(priv.length).to.equal(6)

        it 'should still work correctly after a removal is ignored', ->
          priv = new AbstractSortedSet(strategy: strategy, comparator: lengthComparator, removeNullStrategy: 'ignore')
          priv.remove('a');
          priv.insert('a');
          expect(priv.toArray()).to.deep.eq(['a'])
          priv.remove('b');
          priv.insert('no');
          priv.insert('abc');
          expect(priv.toArray()).to.deep.eq(['a', 'no', 'abc'])
          priv.remove('no');
          priv.insert('ab');
          expect(priv.toArray()).to.deep.eq(['a', 'ab', 'abc'])
          expect(priv.length).to.equal(3)
