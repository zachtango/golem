import pointCards from '../../../shared/PointCards.json'
import merchantCards from '../../../shared/MerchantCards.json'
import { MerchantCard, PointCard } from '@shared/index'


export class CardService {
    
    public getPointCard(id: number): PointCard {
        if (id < 0 || id >= pointCards.length) {
            throw new Error(`Point card id ${id} invalid`)
        }

        return pointCards[id] as PointCard
    }

    public getMerchantCard(id: number): MerchantCard {
        if (id < 0 || id >= merchantCards.length) {
            throw new Error(`Merchant card id ${id} invalid`)
        }

        return merchantCards[id] as MerchantCard
    }

}