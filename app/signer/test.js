import { Keypair, PublicKey } from '@solana/web3.js';
import { createPermitAndSign } from './signPermit.js';

const owner = Keypair.generate();
const spender = Keypair.generate();

const permitData = {
  spender: spender.publicKey.toBytes(),
  token_account: owner.publicKey.toBytes(),
  destination_account: spender.publicKey.toBytes(),
  amount: BigInt(1000000),
  nonce: BigInt(1),
  deadline: BigInt(Date.now() / 1000 + 600), // valid for 10 min
};

const { permit, signature, serialized } = createPermitAndSign(owner, permitData);

console.log("Permit Struct:", permit);
console.log("Signature (base58):", signature);
console.log("Serialized (hex):", serialized);