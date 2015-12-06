# white-lady
Mocha interface for Nightmare driven tests

```
npm install --save-dev white-lady mocha-generators
mocha --ui white-lady
```

```javascript
require('mocha-generators').install();
const expect = require('chai').expect;

describePage('Home page', '/', function() {
  it('should have page title', function*() {
    const title = yield this.page.title();
    expect(title).to.equal('page title');
  });
});
```
