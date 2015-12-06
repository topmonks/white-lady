# white-lady
Mocha interface for Nightmare driven tests

```
npm install white-lady
mocha --ui white-lady
```

```
const expect = require('chai').expect;

describePage('Home page', '/', function() {
  it('should have page title', function*() {
    const title = yield this.page.title();
    expect(title).to.equal('page title');
  });
});
```
