import { LivraisonModule } from './livraison.module';

describe('InvoiceModule', () => {
  let invoiceModule: LivraisonModule;

  beforeEach(() => {
    invoiceModule = new LivraisonModule();
  });

  it('should create an instance', () => {
    expect(invoiceModule).toBeTruthy();
  });
});
