import chai from "chai";

const originalNot = Object.getOwnPropertyDescriptor(chai.Assertion.prototype, "not").get;

Object.defineProperty(chai.Assertion.prototype, "not", {
  get () {
    Object.assign(this, this.assignedNot);
    return originalNot.apply(this);
  },

  set (newNot) {
    this.assignedNot = newNot;
    return newNot;
  },
});

// Combine both jest and chai matchers on expect
const originalExpect = global.expect;

global.expect = (actual) => {
  const originalMatchers = originalExpect(actual);
  const chaiMatchers = chai.expect(actual);
  const combinedMatchers = Object.assign(chaiMatchers, originalMatchers);
  return combinedMatchers;
};
