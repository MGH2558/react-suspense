// Render as you fetch
// http://localhost:3000/isolated/exercise/02.js

import * as React from 'react'
import {
  fetchPokemon,
  PokemonInfoFallback,
  PokemonForm,
  PokemonDataView,
  PokemonErrorBoundary
} from '../pokemon'

import { createResource } from '../utils'

// 🐨 Your goal is to refactor this traditional useEffect-style async
// interaction to suspense with resources. Enjoy!

function PokemonInfo({ pokemonResource }) {

  const pokemon = pokemonResource.read();

  return (
    <div>
      <div className="pokemon-info__img-wrapper">
        <img src={pokemon.image} alt={pokemon.name} />
      </div>
      <PokemonDataView pokemon={pokemon} />
    </div>
  )
}

function App() {

  const [pokemonName, setPokemonName] = React.useState('')
  const [pokemonResource, setPokemonResource] = React.useState(null);

  React.useEffect(() => {
    if (!pokemonName) {
      setPokemonResource(null);
      return;
    }
    setPokemonResource(createResource(fetchPokemon(pokemonName)));
  }, [pokemonName])


  function handleSubmit(newPokemonName) {
    setPokemonName(newPokemonName)
  }

  function handleReset() {
    setPokemonName('');
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <div className="pokemon-info">
        {pokemonResource ? (
          <PokemonErrorBoundary onReset={handleReset}>
            <React.Suspense fallback={<PokemonInfoFallback name={pokemonName} />}>
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

export default App