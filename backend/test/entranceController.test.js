const request = require('supertest');
const mongoose = require('mongoose');

const {app, disconnect} = require('../src/app');
const EntranceSchema = mongoose.model('entrance');
const {setTestSession} = require('../api/controllers/authController');

/**
 * Generates sample entrance data for use in the tests
 * @return {Object}
 */
function createTestEntrances() {
  return {
    testEntrance1: {
      'type': 'Feature',
      'geometry': {'type': 'Point', 'coordinates': [-87.6306729, 41.8862637]},
      'id': 'node/1469254509',
    },
    testEntrance2: {
      'type': 'Feature',
      'geometry': {'type': 'Point', 'coordinates': [-87.6308302, 41.8859675]},
      'id': 'node/1469254512',
    },
    testEntrance3: {
      'type': 'Feature',
      'geometry': {'type': 'Point', 'coordinates': [-87.6306746, 41.8863129]},
      'id': 'node/1469254519',
    },
  };
}

let {testEntrance1, testEntrance2, testEntrance3} = createTestEntrances();

beforeAll(async () => {
  setTestSession('1000');
});

beforeEach(async () => {
  ({testEntrance1, testEntrance2, testEntrance3} = createTestEntrances());
  await EntranceSchema.deleteMany({}).exec();
});

afterAll(async () => {
  disconnect();
});

describe('Test the root of the entrance api', () => {
  test('Getting all entrances should return an empty array', async () => {
    await request(app).get('/api/pedway/entrance').then((response) => {
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  test('Adding an entrance without authentication should fail', async () => {
    await request(app)
        .post('/api/pedway/entrance')
        .send(testEntrance1)
        .then((response) => {
          expect(response.statusCode).toBe(401);
        });
  });

  test('Getting all entrances after adding a single one', async () => {
    testEntrance1.status = 'closed';

    // Add a test entrance
    await request(app)
        .post('/api/pedway/entrance')
        .set('Cookie', ['sessionId=1000'])
        .send(testEntrance1)
        .then((response) => {
          expect(response.statusCode).toBe(200);
          expect(typeof response.body).toBe('object');
          const entrance = response.body;
          expect(entrance.id).toBe(testEntrance1.id);
          expect(entrance.status).toBe('closed');
        });

    // Retrieve all entrances, which should be the one we just added
    await request(app).get('/api/pedway/entrance').then((response) => {
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);

      const entrance = response.body[0];

      expect(entrance.id).toBe(testEntrance1.id);
      expect(entrance.status).toBe('closed');
    });
  });

  test.each([
    {entrances: [testEntrance1]},
    {entrances: [testEntrance1, testEntrance2]},
    {entrances: [testEntrance1, testEntrance2, testEntrance3]},
  ])('Check additions: %p', async (args) => {
    // Add each entrance
    for (let i = 0; i < args.entrances.length; i++) {
      await request(app)
          .post('/api/pedway/entrance')
          .set('Cookie', ['sessionId=1000'])
          .send(args.entrances[i]);
    }

    // Check that we return the correct number of entrances
    await request(app).get('/api/pedway/entrance').then((response) => {
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(args.entrances.length);
    });
  });

  test('Check for default status of open', async () => {
    await request(app)
        .post('/api/pedway/entrance')
        .set('Cookie', ['sessionId=1000'])
        .send(testEntrance1)
        .then((response) => {
          expect(response.body.status).toBe('open');
        });
  });

  test('Uniqueness of id enforced', async () => {
    // Try to create the first test entrance
    await request(app)
        .post('/api/pedway/entrance')
        .set('Cookie', ['sessionId=1000'])
        .send(testEntrance1);

    // Try to create the first test entrance again
    await request(app)
        .post('/api/pedway/entrance')
        .set('Cookie', ['sessionId=1000'])
        .send(testEntrance1);

    // Ensure there is only one test entrance total
    await request(app).get('/api/pedway/entrance').then((response) => {
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
    });
  });
});

describe('Test the of the entrance api by id', () => {
  beforeEach(async () => {
    await request(app)
        .post('/api/pedway/entrance')
        .set('Cookie', ['sessionId=1000'])
        .send(testEntrance1);
  });

  test('Getting an entrance', async () => {
    await request(app).get('/api/pedway/entrance/node/1469254509').then((response) => {
      expect(response.statusCode).toBe(200);
      expect(typeof response.body).toBe('object');
      const entrance = response.body;

      expect(entrance.id).toBe(testEntrance1.id);
      expect(entrance.status).toBe('open');
    });
  });

  test('Getting an entrance that doesn\'t exist', async () => {
    await request(app).get('/api/pedway/entrance/node/test').then((response) => {
      expect(response.statusCode).toBe(200);
      expect(typeof response.body).toBe('object');
      expect(response.body).toBe(null);
    });
  });

  test('Updating an entrance', async () => {
    // Modify the first test entrance
    testEntrance1.status = 'closed';

    // Try to update the entrance with authentication
    await request(app)
        .post('/api/pedway/entrance/node/1469254509')
        .set('Cookie', ['sessionId=1000'])
        .send(testEntrance1)
        .then((response) => {
          expect(response.statusCode).toBe(200);
        });

    // Check if the entrance was updated
    await request(app).get('/api/pedway/entrance/node/1469254509').then((response) => {
      expect(response.statusCode).toBe(200);
      expect(typeof response.body).toBe('object');
      const entrance = response.body;

      expect(entrance.id).toBe(testEntrance1.id);
      expect(entrance.status).toBe('closed');
    });
  });


  test('Updating an entrance without admin rights should fail', async () => {
    // Modify the first test entrance
    testEntrance1.status = 'closed';

    // Try to update the entrance without authentication
    await request(app)
        .post('/api/pedway/entrance/node/1469254509')
        .send(testEntrance1)
        .then((response) => {
          expect(response.statusCode).toBe(401);
        });

    // Check if the section was updated
    await request(app).get('/api/pedway/entrance/node/1469254509').then((response) => {
      expect(response.statusCode).toBe(200);
      expect(typeof response.body).toBe('object');
      const entrance = response.body;

      expect(entrance.id).toBe(testEntrance1.id);
      expect(entrance.status).not.toBe('closed');
    });
  });
});
