// extends JS Error with message and status
class ExpressError extends Error {
  constructor(message, status) {
    super();
    this.message = message;
    this.status = status;
    // console.error(this.stack);
    // if (process.env.NODE_ENV !== "test") console.error(this.stack); // use this to not log stack if not in test
  }
}
module.exports = ExpressError;
