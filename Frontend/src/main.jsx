import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import {BrowserRouter} from 'react-router'
import App from './App.jsx'
import {Provider} from 'react-redux'
import { store } from './reduxStore.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter> 
    </Provider>
  </StrictMode>,
)
 