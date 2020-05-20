const request = require('supertest');
const mongoose = require('mongoose');

const {app, disconnect} = require('../src/app');
const SectionSchema = mongoose.model('section');
const {setTestSession} = require('../api/controllers/authController');

/**
 * Generates sample section data for use in the tests
 * @return {Object}
 */
function createTestSections() {
  return {
    testSection1: {
      'type': 'Feature',
      'properties': {
        'OBJECTID': 35,
        'PED_ROUTE': 'ONE ILLINOIS CENTER - TWO ILLINOIS CENTER WALKWAY',
        'SHAPE_LEN': 201.999236,
      },
      'geometry': {
        'type': 'MultiLineString',
        'coordinates': [[
          [-87.623053972872867, 41.887066159936772],
          [-87.623071155091367, 41.88762032643141],
        ]],
      },
    },
    testSection2: {
      'type': 'Feature',
      'properties': {
        'OBJECTID': 2,
        'PED_ROUTE': 'AON CENTRE - FAIRMONT HOTEL WALKWAY',
        'SHAPE_LEN': 184.031003,
      },
      'geometry': {
        'type': 'MultiLineString',
        'coordinates': [[
          [-87.621511269296406, 41.885464563831313],
          [-87.621513092454805, 41.885550166600517],
          [-87.62152142023217, 41.885898082439354],
          [-87.621523238269518, 41.88596949223745],
        ]],
      },
    },
    testSection3: {
      'type': 'Feature',
      'properties': {
        'OBJECTID': 38,
        'PED_ROUTE': 'SMURFIT STONE WALKWAY',
        'SHAPE_LEN': 90.057617,
      },
      'geometry': {
        'type': 'MultiLineString',
        'coordinates': [[
          [-87.624755968412131, 41.884629051714491],
          [-87.624797796048625, 41.884647932209852],
          [-87.624799419337918, 41.884801145209671],
          [-87.624722622644171, 41.884802176847792],
        ]],
      },
    },
  };
}

let {testSection1, testSection2, testSection3} = createTestSections();

beforeAll(async () => {
  setTestSession('1000');
});

beforeEach(async () => {
  ({testSection1, testSection2, testSection3} = createTestSections());
  await SectionSchema.deleteMany({}).exec();
});

afterAll(async () => {
  disconnect();
});

describe('Test the root of the section api', () => {
  test('Getting all sections should return an empty array', async () => {
    await request(app).get('/api/pedway/section').then((response) => {
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  test('Adding a section without authentication should fail', async () => {
    await request(app)
        .post('/api/pedway/section')
        .send(testSection1)
        .then((response) => {
          expect(response.statusCode).toBe(401);
        });
  });

  test('Getting all sections after adding a single one', async () => {
    // Add a test section
    await request(app)
        .post('/api/pedway/section')
        .set('Cookie', ['sessionId=1000'])
        .send(testSection1)
        .then((response) => {
          expect(response.statusCode).toBe(200);
          expect(typeof response.body).toBe('object');
          const section = response.body;
          expect(section.properties.OBJECTID)
              .toBe(testSection1.properties.OBJECTID);
          expect(section.properties.PED_ROUTE)
              .toBe(testSection1.properties.PED_ROUTE);
        });

    // Retrieve all sections, which should be the one we just added
    await request(app).get('/api/pedway/section').then((response) => {
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);

      const section = response.body[0];

      expect(section.properties.OBJECTID)
          .toBe(testSection1.properties.OBJECTID);
      expect(section.properties.PED_ROUTE)
          .toBe(testSection1.properties.PED_ROUTE);
    });
  });

  test.each([
    {sections: [testSection1]},
    {sections: [testSection1, testSection2]},
    {sections: [testSection1, testSection2, testSection3]},
  ])('Check additions: %p', async (args) => {
    // Add each section
    for (let i = 0; i < args.sections.length; i++) {
      await request(app)
          .post('/api/pedway/section')
          .set('Cookie', ['sessionId=1000'])
          .send(args.sections[i]);
    }

    // Check that we return the correct number of sections
    await request(app).get('/api/pedway/section').then((response) => {
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(args.sections.length);
    });
  });

  test('Uniqueness of OBJECTID enforced', async () => {
    // Try to create the first test section
    await request(app)
        .post('/api/pedway/section')
        .set('Cookie', ['sessionId=1000'])
        .send(testSection1);

    // Try to create the first test section again
    await request(app)
        .post('/api/pedway/section')
        .set('Cookie', ['sessionId=1000'])
        .send(testSection1);

    // Ensure there is only one test entrance total
    await request(app).get('/api/pedway/section').then((response) => {
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
    });
  });
});

describe('Test the of the section api by id', () => {
  beforeEach(async () => {
    await request(app)
        .post('/api/pedway/section')
        .set('Cookie', ['sessionId=1000'])
        .send(testSection1);
  });

  test('Getting a section', async () => {
    await request(app).get('/api/pedway/section/35').then((response) => {
      expect(response.statusCode).toBe(200);
      expect(typeof response.body).toBe('object');
      const section = response.body;

      expect(section.properties.OBJECTID).toBe(35);
      expect(section.properties.PED_ROUTE)
          .toBe(testSection1.properties.PED_ROUTE);
    });
  });

  test('Getting an section that doesn\'t exist', async () => {
    await request(app).get('/api/pedway/section/1000').then((response) => {
      expect(response.statusCode).toBe(200);
      expect(typeof response.body).toBe('object');
      expect(response.body).toBe(null);
    });
  });

  test('Getting an section with a non-integer id', async () => {
    await request(app).get('/api/pedway/section/test').then((response) => {
      expect(response.statusCode).toBe(400);
      expect(typeof response.body).toBe('object');
      expect(response.body.message).toBeTruthy();
    });
  });

  test('Updating a section', async () => {
    // Modify the first test section
    testSection1.properties.PED_ROUTE = 'NEW NAME';

    // Try to update the section with authentication
    await request(app)
        .post('/api/pedway/section/35')
        .set('Cookie', ['sessionId=1000'])
        .send(testSection1)
        .then((response) => {
          expect(response.statusCode).toBe(200);
        });

    // Check if the section was updated
    await request(app).get('/api/pedway/section/35').then((response) => {
      expect(response.statusCode).toBe(200);
      expect(typeof response.body).toBe('object');
      const section = response.body;

      expect(section.properties.OBJECTID)
          .toBe(testSection1.properties.OBJECTID);
      expect(section.properties.PED_ROUTE)
          .toBe(testSection1.properties.PED_ROUTE);
    });
  });

  test('Updating a section without admin rights should fail', async () => {
    // Modify the first test section
    testSection1.properties.PED_ROUTE = 'NEW NAME';

    // Try to update the section without authentication
    await request(app)
        .post('/api/pedway/section/35')
        .send(testSection1)
        .then((response) => {
          expect(response.statusCode).toBe(401);
        });

    // Check if the section was updated
    await request(app).get('/api/pedway/section/35').then((response) => {
      expect(response.statusCode).toBe(200);
      expect(typeof response.body).toBe('object');
      const section = response.body;

      expect(section.properties.OBJECTID)
          .toBe(testSection1.properties.OBJECTID);
      expect(section.properties.PED_ROUTE)
          .not.toBe(testSection1.properties.PED_ROUTE);
    });
  });
});
