import { createRoot } from 'react-dom/client'
import { useEffect } from 'react'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { store } from './app/store.js'
import { Provider, useDispatch, useSelector } from 'react-redux'
import { fetchMe } from './features/authSlice.js'
import { connectSocket, disconnectSocket } from './services/socket.js'

// ছোট একটা wrapper: app চালু হওয়ার সাথে সাথে একবার "আমি কে?" জিজ্ঞেস করে।
// cookie browser এ থাকলে fetchMe সফল হবে → refresh করলেও logged in থাকবে।
const AppWithAuth = () => {
    const dispatch = useDispatch()
    // user login থাকলে socket connect, logout হলে disconnect।
    // cookie তখন set আছে, তাই handshake auth পাস করবে।
    const user = useSelector((state) => state.auth.user)

    useEffect(() => {
        dispatch(fetchMe())
    }, [])

    useEffect(() => {
        if (user) {
            connectSocket()
        } else {
            disconnectSocket()
        }
    }, [user])

    return <App />
}

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <Provider store={store}>
            <AppWithAuth />
        </Provider>
    </BrowserRouter>,
)
