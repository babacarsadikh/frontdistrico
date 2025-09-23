import { ClientModule } from './client.module';

describe('clientModule', () => {
  let clientModule: ClientModule;

  beforeEach(() => {
    clientModule = new ClientModule();
  });

  it('should create an instance', () => {
    expect(clientModule).toBeTruthy();
  });
});
