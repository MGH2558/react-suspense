// Cache resources
// http://localhost:3000/isolated/exercise/04.js

import React, { createContext, useState, useEffect, useTransition, useContext, useRef, useCallback } from 'react'
import {
  fetchPokemon,
  PokemonInfoFallback,
  PokemonForm,
  PokemonDataView,
  PokemonErrorBoundary,
} from '../pokemon'
import { createResource } from '../utils'


function PokemonInfo({ pokemonResource }) {
  const pokemon = pokemonResource.read()
  return (
    <div>
      <div className="pokemon-info__img-wrapper">
        <img src={pokemon.image} alt={pokemon.name} />
      </div>
      <PokemonDataView pokemon={pokemon} />
    </div>
  )
}


const SUSPENSE_CONFIG = {
  timeoutMs: 4000,
  busyDelayMs: 300,
  busyMinDurationMs: 700,
}


const pokemonResourceCacheContext = createContext();


function PokemonCacheProvider({ children, cacheTime }) {
  const cache = useRef({});
  const expirations = useRef({});

  useEffect(() => {
    const interval = setInterval(() => {
      for (const [name, time] of Object.entries(expirations.current)) {
        if (time < Date.now()) {
          delete cache.current[name]
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const getPokemonResource = useCallback(name => {
    const lowerName = name.toLowerCase();
    let resource = cache.current[lowerName];
    if (!resource) {
      resource = createPokemonResource(lowerName);
      cache.current[lowerName] = resource;
    }
    expirations.current[lowerName] = Date.now() + cacheTime;
    return resource;
  }, [cacheTime])

  return (
    <pokemonResourceCacheContext.Provider value={getPokemonResource}>
      {children}
    </pokemonResourceCacheContext.Provider>
  )
}


function createPokemonResource(pokemonName) {
  return createResource(fetchPokemon(pokemonName))
}


function usePokemonResourceCache() {
  const context = useContext(pokemonResourceCacheContext);
  if(!context) {
    throw new Error(
      `usePokemonResourceCache should be used within a PokemonCacheProvider.`
    )
  }
  return context;
}


function App() {
  const [pokemonName, setPokemonName] = useState('')
  const [startTransition, isPending] = useTransition(SUSPENSE_CONFIG)
  const [pokemonResource, setPokemonResource] = useState(null)
  const getPokemonResource = usePokemonResourceCache();

  useEffect(() => {
    if (!pokemonName) {
      setPokemonResource(null)
      return
    }
    startTransition(() => {
      setPokemonResource(getPokemonResource(pokemonName))
    })
  }, [getPokemonResource, pokemonName, startTransition])

  function handleSubmit(newPokemonName) {
    setPokemonName(newPokemonName)
  }

  function handleReset() {
    setPokemonName('')
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <div className={`pokemon-info ${isPending ? 'pokemon-loading' : ''}`}>
        {pokemonResource ? (
          <PokemonErrorBoundary
            onReset={handleReset}
            resetKeys={[pokemonResource]}
          >
            <React.Suspense
              fallback={<PokemonInfoFallback name={pokemonName} />}
            >
              <PokemonInfo pokemonResource={pokemonResource} />
            </React.Suspense>
          </PokemonErrorBoundary>
        ) : (
          'Submit a pokemon'
        )}
      </div>
    </div>
  )
}

function AppWithProvider() {
  return (
    <PokemonCacheProvider cacheTime={5000} >
      <App />
    </PokemonCacheProvider>
  )
}

export default AppWithProvider;
