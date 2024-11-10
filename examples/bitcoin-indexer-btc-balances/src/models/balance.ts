import { Schema, generateModelFromSchema } from '@easylayer/bitcoin-indexer';

  //balance:<address>:<txid_vout>
export const BalanceSchema = new Schema({
  prefix: 'balance',
  separator: ':',
  paths: {
    address: {
      type: 'dynamic',
      required: true,
    },
    txid_vout: {
      type: 'dynamic',
      required: true,
    }
  },
  values: {
    type: 'string'
  },
  relations: {
    utxo: {
      target: 'output',
      join_paths: [
        { name: 'txid_vout', referencedPathName: 'txid_vout' }
      ]
    }
  }
});

export const BalanceModel = generateModelFromSchema(BalanceSchema);

  

