/**
 * @copyright 2015 Topmonks s.r.o.
 */
require('mocha-generators').install();
const Mocha = require('mocha');
const Suite = require('mocha/lib/suite');
const Test = require('mocha/lib/test');
const Nightmare = require('nightmare');
const url = require('url');

const ROOT_URL = process.env.ROOT_URL || 'http://localhost:3001';
console.log('Testing server:', ROOT_URL);
const page = path => url.resolve(ROOT_URL, path);

const text = function(selector, done) {
    this._evaluate(function(selector) {
        var el = document.querySelector(selector);
        return el.textContent;
    }, done, selector);
};

Nightmare.prototype.textOf = function() {
    var args = [].slice.call(arguments);
    this._queue.push([text, args]);
    return this;
};

module.exports = Mocha.interfaces['white-lady'] = function(suite) {
    var suites = [suite];

    suite.on('pre-require', function(context, file, mocha) {
        /**
         * Execute before running tests.
         */
        context.before = function (fn) {
            suites[0].beforeAll(fn);
        };

        /**
         * Execute after running tests.
         */
        context.after = function (fn) {
            suites[0].afterAll(fn);
        };

        /**
         * Execute before each test case.
         */
        context.beforeEach = function (fn) {
            suites[0].beforeEach(fn);
        };

        /**
         * Execute after each test case.
         */
        context.afterEach = function (fn) {
            suites[0].afterEach(fn);
        };

        /**
         * Describe a "suite" with the given `title` and callback `fn` containing
         * nested suites and/or tests.
         */
        context.describe = context.context = function (title, fn) {
            var suite = Suite.create(suites[0], title);
            suites.unshift(suite);
            fn.call(suite);
            suites.shift();
            return suite;
        };

        /**
         * Describe a page "suite"
         * @param title
         * @param path page path
         * @param fn
         * @returns {Suite}
         */
        context.describePage = function(title, path, fn) {
            var suite = Suite.create(suites[0], title);
            suites.unshift(suite);

            var nightmare;
            context.before(function() {
                this.page = nightmare = new Nightmare();
            });
            context.beforeEach(function() {
                nightmare.goto(page(path));
            });
            context.after(function*() {
                this.page = null;
                yield nightmare.end();
            });

            fn.call(suite);
            suites.shift();
            return suite;
        };

        /**
         * Pending describe.
         */
        context.xdescribe = context.xcontext = context.describe.skip = function (title, fn) {
            var suite = Suite.create(suites[0], title);
            suite.pending = true;
            suites.unshift(suite);
            fn.call(suite);
            suites.shift();
        };

        /**
         * Exclusive suite.
         */
        context.describe.only = function (title, fn) {
            var suite = context.describe(title, fn);
            mocha.grep(suite.fullTitle());
        };

        /**
         * Describe a specification or test-case with the given `title` and
         * callback `fn` acting as a thunk.
         */
        context.it = context.specify = function (title, fn) {
            var suite = suites[0];
            if (suite.pending) {
                fn = null;
            }
            var test = new Test(title, fn);
            suite.addTest(test);
            return test;
        };

        /**
         * Exclusive test-case.
         */
        context.it.only = function (title, fn) {
            var test = context.it(title, fn);
            mocha.grep(test.fullTitle());
        };

        /**
         * Pending test case.
         */
        context.xit = context.xspecify = context.it.skip = function (title) {
            context.it(title);
        };
    });
};
