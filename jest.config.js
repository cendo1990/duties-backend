module.exports = {
    preset: 'ts-jest',
    transformIgnorePatterns: ["node_modules/(?!(.*))"],
    transform: {
      '^.+\\.(ts|tsx)?$': 'ts-jest',
      '^.+\\.(js|jsx)$': 'babel-jest',
    }
};