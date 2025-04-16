import { Keypair, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import * as borsh from 'borsh';

class Permit {
  constructor(fields) {
    Object.assign(this, fields);
  }
}

const PermitSchema = new Map([
  [Permit, {
    kind: 'struct',
    fields: [
      ['owner', [32]],
      ['spender', [32]],
      ['token_account', [32]],
      ['destination_account', [32]],
      ['amount', 'u64'],
      ['nonce', 'u64'],
      ['deadline', 'i64']
    ],
  }]
]);

export function createPermitAndSign(ownerKeypair, permitData) {
  const permit = new Permit({
    owner: ownerKeypair.publicKey.toBytes(),
    ...permitData,
  });

  const serialized = borsh.serialize(PermitSchema, permit);
  const signature = ownerKeypair.sign(serialized);

  return {
    permit,
    signature: bs58.encode(signature),
    serialized: Buffer.from(serialized).toString('hex'),
  };
}