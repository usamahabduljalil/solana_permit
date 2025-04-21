import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { createPermitAndSign } from './signPermit.js';

// Generate keypairs for owner and spender
const owner = Keypair.generate();
const spender = Keypair.generate();

// Create permit data
const permitData = {
  spender: spender.publicKey.toBytes(),
  token_account: owner.publicKey.toBytes(),
  destination_account: spender.publicKey.toBytes(),
  amount: BigInt(1000000), // Use BigInt for u64
  nonce: BigInt(1), // Use BigInt for u64
  deadline: BigInt(Math.floor(Date.now() / 1000 + 600)), // Use BigInt for i64
};

// Create and sign the permit
try {
  const { permit, signature, serialized } = createPermitAndSign(owner, permitData);

  // Log the results
  console.log('Permit:');
  console.log('  Owner:', bs58.encode(permit.owner));
  console.log('  Spender:', bs58.encode(permit.spender));
  console.log('  Token Account:', bs58.encode(permit.token_account));
  console.log('  Destination:', bs58.encode(permit.destination_account));
  console.log('  Amount:', permit.amount.toString());
  console.log('  Nonce:', permit.nonce.toString());
  console.log('  Deadline:', permit.deadline.toString());

  console.log('\nSignature (base58):', signature);
  console.log('Serialized Permit (hex):', serialized);
} catch (err) {
  console.error('Error:', err.message);
}