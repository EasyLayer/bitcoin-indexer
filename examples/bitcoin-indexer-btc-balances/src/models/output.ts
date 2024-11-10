import { Schema, generateModelFromSchema } from '@easylayer/bitcoin-indexer';

// utxo:<txid_vout>
export const OutputSchema = new Schema({
  prefix: 'output',
  separator: ':',
  paths: {
    txid_vout: {
      type: 'dynamic',
      required: true,
    },
  },
  values: {
    type: 'object',
  },
  relations: {
    balance: {
      target: 'balance',
      join_paths: [
        { name: 'txid_vout', referencedPathName: 'txid_vout' }
      ]
    }
  }
});

export const OutputModel = generateModelFromSchema(OutputSchema);
