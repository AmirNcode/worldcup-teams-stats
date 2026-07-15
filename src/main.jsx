import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { DataProvider } from './lib/data.jsx'
import { F1DataProvider } from './f1/lib/data.jsx'
import { LeaguesDataProvider } from './leagues/lib/data.jsx'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <DataProvider>
        <F1DataProvider>
          <LeaguesDataProvider>
            <App />
          </LeaguesDataProvider>
        </F1DataProvider>
      </DataProvider>
    </HashRouter>
  </React.StrictMode>,
)
