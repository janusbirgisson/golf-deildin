import '@testing-library/jest-dom';

const RealDate = Date;

const defaultMockDate = new Date('2024-01-08T12:00:00Z');

export function setMockDate(date) {
  const mockDate = new Date(date);
  
  class MockDate extends RealDate {
    constructor(...args) {
      if (args.length) {
        return new RealDate(...args);
      }
      return new RealDate(mockDate);
    }

    static now() {
      return mockDate.getTime();
    }
  }

  global.Date = MockDate;
}

setMockDate(defaultMockDate);