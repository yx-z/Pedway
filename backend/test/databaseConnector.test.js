const connectDatabase = require('../src/databaseConnector');
mongoose = require('mongoose');

describe('Test the database connection', () => {
  test('it should connect and disconnect to the database', (done) => {
    const disconnect = connectDatabase();
    disconnect().then(() => {
      expect(mongoose.connection.readyState).toBe(0);
      done();
    });
  });

  test('it should connect and disconnect multiple times', (done) => {
    const disconnect = connectDatabase();
    disconnect().then(() => {
      expect(mongoose.connection.readyState).toBe(0);
      const disconnect = connectDatabase();
      disconnect().then(() => {
        expect(mongoose.connection.readyState).toBe(0);
        const disconnect = connectDatabase();
        disconnect().then(done);
      });
    });
  });

  test('it should not connect twice', (done) => {
    const disconnect = connectDatabase();
    expect(connectDatabase).toThrow(Error);
    disconnect().then(done);
  });

  test('it should discconnect twice', (done) => {
    const disconnect = connectDatabase();
    disconnect().then(() => {
      disconnect().then(done);
    });
  });
});
