const assert = require('assert');
const index = require('./index')


describe('String testing', function () {
    it('Should return \"Hello, World!\"', function () {
      assert.equal(index.please(), "Hello, World!");
    });
});

