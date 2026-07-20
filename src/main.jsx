import { createRoot } from 'react-dom/client'
import { useEffect } from 'react'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { store } from './app/store.js'
import { Provider, useDispatch } from 'react-redux'
import { fetchMe } from './features/authSlice.js'

// ছোট একটা wrapper: app চালু হওয়ার সাথে সাথে একবার "আমি কে?" জিজ্ঞেস করে।
// cookie browser এ থাকলে fetchMe সফল হবে → refresh করলেও logged in থাকবে।
const AppWithAuth = () => {
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(fetchMe())
    }, [])

    return <App />
}

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <Provider store={store}>
            <AppWithAuth />
        </Provider>
    </BrowserRouter>,
)
