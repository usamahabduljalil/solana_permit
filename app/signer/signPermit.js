import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import * as borsh from 'borsh';
import nacl from 'tweetnacl';

// Define the Permit class
class Permit {
  constructor({ owner, spender, token_account, destination_account, amount, nonce, deadline }) {
    this.owner = owner; // Uint8Array (32 bytes)
    this.spender = spender; // Uint8Array (32 bytes)
    this.token_account = token_account; // Uint8Array (32 bytes)
    this.destination_account = destination_account; // Uint8Array (32 bytes)
    this.amount = amount; // BigInt (u64)
    this.nonce = nonce; // BigInt (u64)
    this.deadline = deadline; // BigInt (i64)
  }
}

// Define the Borsh schema
const PermitSchema = new Map([
  [
    Permit,
    {
      kind: 'struct',
      fields: [
        ['owner', [32]], // 32-byte array for public key
        ['spender', [32]], // 32-byte array for public key
        ['token_account', [32]], // 32-byte array for public key
        ['destination_account', [32]], // 32-byte array for public key
        ['amount', 'u64'], // Unsigned 64-bit integer
        ['nonce', 'u64'], // Unsigned 64-bit integer
        ['deadline', 'i64'], // Signed 64-bit integer
      ],
    },
  ],
]);

export function createPermitAndSign(ownerKeypair, permitData) {
  // Validate ownerKeypair
  if (!(ownerKeypair instanceof Keypair)) {
    throw new Error('ownerKeypair must be a Keypair instance');
  }

  // Validate permitData
  if (!permitData.spender || !permitData.token_account || !permitData.destination_account) {
    throw new Error('permitData is missing required fields');
  }

  // Create the permit instance
  const permit = new Permit({
    owner: ownerKeypair.publicKey.toBytes(), // Convert public key to byte array
    spender: permitData.spender,
    token_account: permitData.token_account,
    destination_account: permitData.destination_account,
    amount: BigInt(permitData.amount), // Ensure BigInt for u64
    nonce: BigInt(permitData.nonce), // Ensure BigInt for u64
    deadline: BigInt(permitData.deadline), // Ensure BigInt for i64
  });
  // Serialize the permit data
  let serialized;
  try {
    serialized = borsh.serialize(PermitSchema, permit);
  } catch (err) {
    throw new Error(`Failed to serialize permit: ${err.message}`);
  }

  // Sign the serialized data using tweetnacl
  const signature = nacl.sign.detached(serialized, ownerKeypair.secretKey);

  return {
    permit,
    signature: bs58.encode(signature), // Encode signature as base58
    serialized: Buffer.from(serialized).toString('hex'), // Serialize as hex
  };
}