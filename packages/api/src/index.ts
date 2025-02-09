import { registerAppleWalletPassTemplate } from './lib/apple-wallet.js';
import { GOOGLE_WALLET_CLASS, registerGoogleWalletClass } from './lib/google-wallet.js';
import { writeSchema } from './schema.js';
import { startApiServer } from './server/express.js';
import { maintenance } from './server/maintenance.js';

// Validates env variables before doing anything else
import './lib/env.js';
startApiServer();

maintenance.listen(4002, () => {
  console.info('Maintenance page server listening at http://localhost:4002');
});

await writeSchema();

const id = await registerGoogleWalletClass(GOOGLE_WALLET_CLASS);
if (id) console.info(`Registered Google Wallet pass class ${id}`);
const template = await registerAppleWalletPassTemplate();
if (template) console.info(`Registered Apple Wallet pass template ${template.passTypeIdentifier}`);
