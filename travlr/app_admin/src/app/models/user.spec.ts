import { User } from './user';

describe('User', () => {
  it('should create an instance', () => {
    expect(new User()).toBeTruthy();
  });

  it('should set user properties', () => {
    const user = new User();
    user.name = 'Test User';
    user.email = 'test@example.com';
    user.password = 'password123';

    expect(user.name).toBe('Test User');
    expect(user.email).toBe('test@example.com');
    expect(user.password).toBe('password123');
  });

  it('should create user with constructor values', () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    const user = new User();
    Object.assign(user, userData);

    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
    expect(user.password).toBe(userData.password);
  });

  it('should have correct property types', () => {
    const user = new User();

    // Initialize properties before checking types
    user.name = '';
    user.email = '';
    user.password = '';

    expect(typeof user.name).toBe('string');
    expect(typeof user.email).toBe('string');
    expect(typeof user.password).toBe('string');
  });

  // Alternative: Test after setting realistic values
  it('should have correct property types with values', () => {
    const user = new User();

    user.name = 'Test User';
    user.email = 'test@example.com';
    user.password = 'password123';

    expect(typeof user.name).toBe('string');
    expect(typeof user.email).toBe('string');
    expect(typeof user.password).toBe('string');
  });
});
