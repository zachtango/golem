import './ActionLog.css'
import { Action, Player } from '../../../../shared'


export default function ActionLog({
    actions,
    players
}: {
    actions: Action[],
    players: Player[]
}) {

    return (
        <div className='action-log'>
            <div className='content'>
                {actions.slice().reverse().map((action, i) => {
                    let cssClass;
                    let text;
                    const player = players.find(p => p.id === action.playerId) as Player

                    switch (action.type) {
                        case 'BuyPointCard':
                            cssClass = 'buy-point-card'
                            text = `${player.name} bought a golem`
                            break
                        case 'PickUpMerchantCard':
                            cssClass = 'pick-up-merchant-card'
                            text = `${player.name} picked up a merchant card`
                            break
                        case 'PlayMerchantCard':
                            cssClass = 'play-merchant-card'
                            text = `${player.name} played a merchant card`
                            break
                        case 'RemoveCrystalOverflow':
                            cssClass = 'remove-crystal-overflow'
                            text = `${player.name} gave away crystals`
                            break
                        case 'Rest':
                            cssClass = 'rest'
                            text = `${player.name} rested`
                            break
                    }

                    return (
                        <div
                            key={i}
                            className={`${cssClass} ${i % 2 ? 'odd' : 'even'}`}
                        >
                            {text}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}