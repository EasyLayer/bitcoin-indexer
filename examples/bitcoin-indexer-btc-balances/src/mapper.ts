import { IIndexerMapper } from '@easylayer/bitcoin-indexer';
import { ScriptUtilService } from '@easylayer/components/bitcoin-network-provider';
import { Currency, Money } from '@easylayer/common/arithmetic';
import { OutputModel, BalanceModel } from './models';

export class Mapper implements IIndexerMapper {
    public async index(block: any) {
        const currency: Currency = {
          code: 'BTC',
          minorUnit: 8,
        };

        const { height, tx } = block;

        const outputModels: InstanceType<typeof OutputModel>[] = [];
        const balanceModels: InstanceType<typeof BalanceModel>[] = [];

        if (!tx || tx.length === 0) {
          throw new Error(`Tx length = 0`);
        }

        for (const t of tx) {
          const { txid, vout, vin } = t;

          for (const output of vout) {
            const address = ScriptUtilService.getScriptHashFromScriptPubKey(output.scriptPubKey);
            const value = Money.fromDecimal(output.value, currency).toCents();

            if (!address) {
              continue;
            }

            const outputModel = new OutputModel();
            const balanceModel = new BalanceModel();

            await outputModel.put(
              { txid_vout: `${txid}_${output.n}` }, // output.n it's index
              { value }
            );

            outputModels.push(outputModel);

            await balanceModel.put(
              {
                address,
                txid_vout: `${txid}_${output.n}`
              },
              { value: '' }
            );

            balanceModels.push(balanceModel);
          }

          for (const input of vin) {
            if (input.txid && input.vout) {
              const outputModel = new OutputModel();

              await outputModel.del({
                txid_vout: `${input.txid}_${input.vout}`
              });

              outputModels.push(outputModel);
            }
          }
        }

        return [...outputModels, ...balanceModels];
    }

    public async reorganisation(blocksHashes: string[]) {
        return {} as any;
    }
}