// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';

// Store the real Date
const RealDate = Date;

// Create a fixed default date for testing
const defaultMockDate = new Date('2024-01-08T12:00:00Z');

// Function to set the mock date
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

// Set the default mock date
setMockDate(defaultMockDate);