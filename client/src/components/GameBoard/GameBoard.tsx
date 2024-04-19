import { GameInfo, MerchantCardId, Player, PointCardId } from "../../../../shared";
import { useAssets } from "../../contexts/AssetsContext";
import Spinner from "../Spinner/Spinner";
import EndStats from "./EndStats";
import FieldBoard from "./FieldBoard";
import PlayerBoard from "./PlayerBoard";


type BoardProps = GameInfo & {
    ownPlayer: Player,
    player: Player,
    onActiveMerchantCardClick: (id: MerchantCardId) => void,
    onActivePointCardClick: (id: PointCardId) => void,
    onPlayerMerchantCardClick: (id: MerchantCardId) => void
}


export default function Board({
    ownPlayer,
    player,

    // id,
    // round,
    // turn,
    // maxGolems,
    isComplete,

    numCopperTokens,
    numSilverTokens,

    activePointCardIds,
    activeMerchantCardIds,
    fieldCrystals,

    players,

    // actions,

    onActiveMerchantCardClick,
    onActivePointCardClick,
    onPlayerMerchantCardClick
} : BoardProps) {
    const {
        pointCards,
        merchantCards
    } = useAssets()
    
    let children = (
        <div className='center'>
            <Spinner />
        </div>
    )

    if (pointCards && merchantCards) {
        children = isComplete ? (
            <EndStats
                players={players}
            />
        ) : (
            <>
                <FieldBoard
                    activePointCardIds={activePointCardIds}
                    activeMerchantCardIds={activeMerchantCardIds}
                    numSilverTokens={numSilverTokens}
                    numCopperTokens={numCopperTokens}
                    fieldCrystals={fieldCrystals}
                    onActiveMerchantCardClick={onActiveMerchantCardClick}
                    onActivePointCardClick={onActivePointCardClick}

                />
                <PlayerBoard
                    isOwnPlayer={ownPlayer.id === player.id}
                    {...player}

                    onPlayerMerchantCardClick={onPlayerMerchantCardClick}
                />
            </>
        )
    }

    return (
        <div className='game-board'>
            {children}
        </div>
    )
}