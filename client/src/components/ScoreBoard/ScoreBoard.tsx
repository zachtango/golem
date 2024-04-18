import PlayerRow from './PlayerRow'
import Timer from '../Timer/Timer'
import './ScoreBoard.css'
import { getPoints } from '../../utils/utils'
import { Player } from '../../../../shared'

export default function ScoreBoard({
    ownPlayer,
    player,
    players,
    turn,
    onPlayerClick
} : {
    ownPlayer: Player,
    player: Player,
    players: Player[],
    turn: number,
    onPlayerClick: (player: Player) => void
}) {

    const currentPlayer = players.find(player => player.turn === turn) as Player

    return (
        <div className='score-board'>
            <div className='players'>
                <div className='points'>
                    You have {getPoints(ownPlayer)} points
                </div>
                {players.map(p => (
                    <PlayerRow
                        key={p.id}
                        selected={p.id === player.id}
                        {...p}
                        onClick={() => onPlayerClick(p)}
                    />
                ))}
            </div>
            <Timer
                userName={ownPlayer.id === currentPlayer.id ? 'Your' : currentPlayer.name + "'s"}
            />
        </div>
    )
}