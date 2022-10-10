interface CacheService {
  get<T>(key: string, fn: () => Promise<T | null>): Promise<T | null>;
}

interface CachePayload<T> {
  data: T | null;
}

const wait = async (time: number): Promise<void> => {
  await new Promise((res) => setTimeout(res, time));
};

class Subject {
  private value;
}

class CacheServiceImpl implements CacheService {
  private readonly cache: Map<string, CachePayload<any>> = new Map();

  private resolverHash: { [key: string]: ((value: any) => void)[] } = {};
  private waitingHash: { [key: string]: boolean } = {};

  async get<T>(key: string, fn: () => Promise<T | null>): Promise<T | null> {
    const cacheValue = await this.getFromCache<T>(key);
    if (!cacheValue && !this.waitingHash[key]) {
      this.waitingHash[key] = true;
      const value = await fn();
      await this.set(key, value);
      this.resolverHash[key].forEach((res) => {
        res(value);
      });
      this.waitingHash[key] = false;
      delete this.resolverHash[key];
      return value;
    }
    if (!cacheValue && this.waitingHash[key]) {
      return new Promise<T | null>(async (res) => {
        if (this.resolverHash[key]) {
          this.resolverHash[key].push(res);
        } else {
          this.resolverHash[key] = [res];
        }
      });
    }

    return cacheValue ? cacheValue.data : null;
  }

  private async set<T>(key: string, value: T): Promise<void> {
    // external cache service
    await wait(10);
    this.cache.set(key, { data: value });
  }

  private async getFromCache<T>(key: string): Promise<CachePayload<T> | null> {
    // external cache service
    await wait(100);
    return this.cache.get(key) || null;
  }
}

interface UserRepository {
  getById(id: string): Promise<{ id: string } | null>;
}

class UserRepositoryImpl implements UserRepository {
  private readonly cacheService: CacheService = new CacheServiceImpl();

  async getById(id: string): Promise<{ id: string } | null> {
    return this.cacheService.get(`user:${id}`, () => this.getByIdFromDb(id));
  }

  private async getByIdFromDb(id: string): Promise<{ id: string } | null> {
    // external db
    await wait(1000);
    console.log(`[UserRepository]: getByIdFromDb ${id}`);
    return { id };
  }
}

const main = async () => {
  const userRepository: UserRepository = new UserRepositoryImpl();

  await Promise.all([
    userRepository.getById("1"),
    userRepository.getById("1"),
    userRepository.getById("1"),
    userRepository.getById("1"),
  ]);
  await userRepository.getById("1");
};

main();

/* for this problem I created an hash which keep tracking API hit status with user id,
     if we are in processig to get data for specific id then no new API get hit.
  */
