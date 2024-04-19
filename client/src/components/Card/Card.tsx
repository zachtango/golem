import { useAssets } from '../../contexts/AssetsContext';
import { MerchantCardId, PointCardId } from '../../../../shared';

export default function Card({
    type,
    id,
    used=false,
    onClick=() => {}
} : {
    type: 'PointCard' | 'MerchantCard',
    id: PointCardId | MerchantCardId,
    used?: boolean,
    onClick?: () => void
}) {
    const {
        pointCards,
        merchantCards
    } = useAssets()

    const svg = type === 'PointCard' ? pointCards![id] : merchantCards![id]

    return (
        <div
            className='card'
            onClick={onClick}
            style={{
                opacity: !used ? 1 : 0.5
            }}    
        >
            {svg}
        </div>
    );
}
