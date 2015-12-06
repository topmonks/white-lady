/**
 * @copyright 2015 Topmonks s.r.o.
 */
const Mocha = require('mocha');
const Suite = require('mocha/lib/suite');
const Test = require('mocha/lib/test');
const Nightmare = require('nightmare');
const url = require('url');

const DEBUG = Boolean(process.env.DEBUG);
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

/**
 *
 * @param {Suite} suite Root suite.
 * @type {Function}
 */
module.exports = Mocha.interfaces['white-lady'] = function(suite) {
    var suites = [suite];

    suite.on('pre-require', function(context, file, mocha) {
        var common = require('mocha/lib/interfaces/common')(suites, context);

        context.before = common.before;
        context.after = common.after;
        context.beforeEach = common.beforeEach;
        context.afterEach = common.afterEach;
        context.run = mocha.options.delay && common.runWithSuite(suite);

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
            suite.file = file;
            suites.unshift(suite);

            var nightmare;
            suite.beforeAll(function() {
                this.page = nightmare = new Nightmare({ show: DEBUG });
            });
            suite.beforeEach(function() {
                nightmare.goto(page(path));
            });
            suite.afterAll(function(done) {
                this.page = null;
                nightmare.end(done);
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
            test.file = file;
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

