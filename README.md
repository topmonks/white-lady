# white-lady

Mocha interface for Nightmare driven tests

```
npm install --save-dev white-lady mocha mocha-generators chai
mocha --ui white-lady
```

Simple test scenario:

```
require('mocha-generators').install();
const expect = require('chai').expect;

describePage('Home page', '/', function() {
  it('should have page title', function*() {
    const title = yield this.page.title();
    expect(title).to.equal('page title');
  });
});
```

## Environment variables

You can change default behavior with ENV variables.

* `PORT` - you can change localhost port, default is `3001`
* `ROOT_URL` - you can change server URL, default is `http://localhost:${PORT}`
* `SHOW_WINDOW` - handy for debugging, shows browser window and does not close it

## UI automation API

We are using [Nightmare](http://nightmarejs.org) for UI automation.
[See the API](https://github.com/segmentio/nightmare#api)

White lady extends Nightmare prototype with handy helper functions

### .textOf(selector)

Reads the text content of selected element.
