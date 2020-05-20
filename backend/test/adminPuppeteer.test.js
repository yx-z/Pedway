const roles = require('../src/roles');

let server;
let EntranceSchema;
let UserSchema;
let setTestSession;

const TESTING_PORT = 3001;

beforeAll(async () => {
  process.env['PORT'] = TESTING_PORT;
  server = require('../src/server');
  EntranceSchema = require('../api/models/entranceModel');
  UserSchema = require('../api/models/userModel');

  ({setTestSession} = require('../api/controllers/authController'));
  setTestSession('1000');
});

beforeEach(async () => {
  await EntranceSchema.deleteMany({}).exec();
  await (
    new EntranceSchema({
      'type': 'Feature',
      'geometry': {'type': 'Point', 'coordinates': [-87.6281675, 41.8858832]},
      'id': 'node/1583441295',
      'status': 'open',
    }).save());
  await UserSchema.deleteMany({}).exec();
  // Add an ADMIN user
  await (new UserSchema({
    userId: '1111',
    name: '1',
    email: '1@1.com',
    permission: roles.ADMIN,
  }).save());
  // Set up the cookies for the test account
  await page.setCookie(
      {
        name: 'userId',
        value: '1111',
        domain: 'localhost',
      },
      {
        name: 'sessionId',
        value: '1000',
        domain: 'localhost',
      });
  await page.goto(
      'http://localhost:' + TESTING_PORT + '/admin.html',
      {waitUntil: ['load', 'networkidle0']});
});

afterAll(async () => {
  await server.close();
});

describe('Test the admin portal UI', () => {
  test('Entrances are displayed', async () => {
    const textArea = await page.$('#entrances');
    const text = await page.evaluate((element) => {
      return element.value;
    }, textArea);
    expect(text.includes('"id": "node/1583441295"')).toBe(true);
    expect(text.includes('"status": "open"')).toBe(true);
  });

  test('Closing an entrance', async () => {
    await page.type('#entranceId', 'node/1583441295');
    await page.select('#status', 'closed');
    await page.click('button');
    // Wait for the success to appear
    await page.waitForFunction(
        'document.querySelector(\'#successNotify\') && document.querySelector(\'#successNotify\').clientHeight != 0');

    const textArea = await page.$('#entrances');
    const text = await page.evaluate((element) => {
      return element.value;
    }, textArea);
    expect(text.includes('"id": "node/1583441295"')).toBe(true);
    expect(text.includes('"status": "closed"')).toBe(true);
  });
});
