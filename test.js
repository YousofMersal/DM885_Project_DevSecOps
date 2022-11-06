const assert = require('assert');
const index = require('./index')


describe('String testing' // Subject matter
         , function () {
    it('Testing if function please() returns \"Hello, World!\"' // Describtion of test
       , function () {
      assert.equal(
          
          index.please()        // Function to test
          ,
          "Hello, World!");     // Value function should return
        
    });
});

