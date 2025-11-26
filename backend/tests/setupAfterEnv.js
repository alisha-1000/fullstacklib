const bcrypt = require("bcryptjs");

bcrypt.setRandomFallback((len) => {
  const random = [];
  for (let i = 0; i < len; i += 1) {
    random.push(Math.floor(Math.random() * 256));
  }
  return random;
});

afterEach(() => {
  jest.restoreAllMocks();
});

