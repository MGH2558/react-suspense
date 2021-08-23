// Coordinate Suspending components with SuspenseList
// http://localhost:3000/isolated/exercise/07.js

import React, { Suspense, SuspenseList } from 'react'
import '../suspense-list/style-overrides.css'
import * as cn from '../suspense-list/app.module.css'
import Spinner from '../suspense-list/spinner'
import { createResource } from '../utils'
import { fetchUser, PokemonForm, PokemonErrorBoundary } from '../pokemon'

// 💰 this delay function just allows us to make a promise take longer to resolve
// so we can easily play around with the loading time of our code.
const delay = time => promiseResult =>
  new Promise(resolve => setTimeout(() => resolve(promiseResult), time))

// 🐨 feel free to play around with the delay timings.
const NavBar = React.lazy(() =>
  import('../suspense-list/nav-bar').then(delay(1000)),
)
const LeftNav = React.lazy(() =>
  import('../suspense-list/left-nav').then(delay(2000)),
)
const MainContent = React.lazy(() =>
  import('../suspense-list/main-content').then(delay(3000)),
)
const RightNav = React.lazy(() =>
  import('../suspense-list/right-nav').then(delay(4000)),
)

const fallback = (
  <div className={cn.spinnerContainer}>
    <Spinner />
  </div>
)
const SUSPENSE_CONFIG = { timeoutMs: 4000 }

function App() {
  const [startTransition] = React.useTransition(SUSPENSE_CONFIG)
  const [pokemonResource, setPokemonResource] = React.useState(null)

  function handleSubmit(pokemonName) {
    startTransition(() => {
      setPokemonResource(createResource(fetchUser(pokemonName)))
    })
  }

  if (!pokemonResource) {
    return (
      <div className="pokemon-info-app">
        <div
          className={`${cn.root} totally-centered`}
          style={{ height: '100vh' }}
        >
          <PokemonForm onSubmit={handleSubmit} />
        </div>
      </div>
    )
  }

  function handleReset() {
    setPokemonResource(null)
  }

  // 🐨 Use SuspenseList throughout these Suspending components to make
  // them load in a way that is not jarring to the user.
  // 💰 there's not really a specifically "right" answer for this.
  return (
    <div className="pokemon-info-app">
      <div className={cn.root}>
        <PokemonErrorBoundary
          onReset={handleReset}
          resetKeys={[pokemonResource]}
        >
          <SuspenseList revealOrder="forwards" tail="collapsed">
            <Suspense fallback={fallback}>
              <NavBar pokemonResource={pokemonResource} />
            </Suspense>
            <div className={cn.mainContentArea}>
              <SuspenseList revealOrder="backwards">
                <Suspense fallback={<div>LeftNav's Loading fallback</div>}>
                  <LeftNav />
                </Suspense>
                <Suspense fallback={<div>MainContent's Loading fallback</div>}>
                  <MainContent pokemonResource={pokemonResource} />
                </Suspense>
                <Suspense fallback={<div>RightNav's Loading fallback</div>}>
                  <RightNav pokemonResource={pokemonResource} />
                </Suspense>
              </SuspenseList>
            </div>
          </SuspenseList>
        </PokemonErrorBoundary>
      </div>
    </div>
  )
}

export default App
