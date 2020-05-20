require('dotenv').config();

module.exports = {
  launch: {
    headless: !process.env.NOT_HEADLESS,
  },
};
