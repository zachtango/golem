import './reset.css'
import './App.css'
import { useWebSocket } from './contexts/WebSocketContext'
import Home from './pages/Home/Home'
import Room from './pages/Room/Room'
import Game from './pages/Game/Game'


type PageType = 'Home' | 'Room' | 'Game'

function App() {
  const {
    status,
    user,
    room,
    game,
    send
  } = useWebSocket()

  if (status !== WebSocket.OPEN || !send) {
    return (
      <div>
        Connecting...
      </div>
    )
  }

  let page: PageType = 'Home';

  if (user && room) {
    page = game ? 'Game' : 'Room'
  }

  console.log(page, user, room, game)
  return (
    <>
      {page === 'Home' && user && <Home
        userName={user.name}
      />}
      {page === 'Room' && user && room && <Room
        userId={user.id}
        {...room}
      />}
      {page === 'Game' && user && room && game && <Game
        userId={user.id}
        {...game}
        chat={room.chat}
        activePointCardIds={game.activePointCardIds.slice().reverse()}
        activeMerchantCardIds={game.activeMerchantCardIds.slice().reverse()}
        fieldCrystals={game.fieldCrystals.slice().reverse()}
      />}

    </>
  )
}

export default App
