import React, { useEffect, useState, useRef } from 'react';

const getRandomId = () => Math.floor(Math.random() * 151) + 1; // Gen 1 Pokémon

// Type color map for icons
const TYPE_COLORS = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};

function TypeIcon({ type, size = 18 }) {
  return (
    <span
      title={type}
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        background: TYPE_COLORS[type] || '#AAA',
        marginRight: 4,
        verticalAlign: 'middle',
        border: '1px solid #888',
      }}
    />
  );
}

function HPBar({ hp, maxHp = 100 }) {
  const percent = Math.max(0, (hp / maxHp) * 100);
  let color = '#4caf50';
  if (percent < 50) color = '#ffeb3b';
  if (percent < 25) color = '#f44336';
  return (
    <div style={{ width: 120, height: 16, background: '#eee', borderRadius: 8, border: '1px solid #bbb', margin: '0 auto 8px auto', position: 'relative' }}>
      <div style={{ width: `${percent}%`, height: '100%', background: color, borderRadius: 8, transition: 'width 0.7s' }} />
      <span style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, textAlign: 'center', lineHeight: '16px', fontWeight: 600, fontSize: 12 }}>{Math.round(hp)} / {maxHp}</span>
    </div>
  );
}

function PokemonCard({ pokemon, selectedMove, onMoveSelect, disabled, moveDetails, hp, isWinner, isLoser, animateAttack, animateShake }) {
  if (!pokemon) return null;
  // Get up to 4 moves (randomly if more than 4)
  let moves = pokemon.moves.slice(0, 4);
  if (pokemon.moves.length > 4) {
    const shuffled = [...pokemon.moves].sort(() => 0.5 - Math.random());
    moves = shuffled.slice(0, 4);
  }
  return (
    <div
      style={{
        textAlign: 'center',
        margin: '1rem',
        border: isWinner ? '3px solid #4caf50' : isLoser ? '3px solid #f44336' : '3px solid transparent',
        borderRadius: 12,
        boxShadow: isWinner ? '0 0 12px #4caf50' : isLoser ? '0 0 12px #f44336' : undefined,
        position: 'relative',
        background: 'rgba(255,255,255,0.85)',
        transition: 'box-shadow 0.3s, border 0.3s',
        animation: animateShake ? 'shake 0.5s' : undefined,
      }}
    >
      {animateAttack && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(255,255,0,0.25)',
          borderRadius: 12,
          pointerEvents: 'none',
          animation: 'flash 0.5s',
        }} />
      )}
      <HPBar hp={hp} />
      <img src={pokemon.sprites.front_default} alt={pokemon.name} width={120} height={120} />
      <h3 style={{ textTransform: 'capitalize' }}>{pokemon.name}</h3>
      <div style={{ marginBottom: 8 }}>
        {pokemon.types.map((typeObj) => (
          <span key={typeObj.type.name} style={{ marginRight: 4 }}>
            <TypeIcon type={typeObj.type.name} />
            <span style={{ textTransform: 'capitalize', fontSize: 14 }}>{typeObj.type.name}</span>
          </span>
        ))}
      </div>
      <div style={{ textAlign: 'left', display: 'inline-block', marginTop: '1rem' }}>
        {moves.map((moveObj, idx) => {
          const move = moveDetails && moveDetails[idx];
          return (
            <div key={moveObj.move.name} style={{ marginBottom: 4 }}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedMove === idx}
                  onChange={() => onMoveSelect(idx)}
                  disabled={disabled && selectedMove !== idx}
                />
                {move && <TypeIcon type={move.type} size={14} />}
                <span style={{ textTransform: 'capitalize', marginLeft: 4 }}>{moveObj.move.name.replace('-', ' ')}</span>
                {move && (
                  <span style={{ marginLeft: 8, fontSize: '0.9em', color: '#555' }}>
                    [Type: {move.type}, Power: {move.power !== null ? move.power : 'N/A'}]
                  </span>
                )}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}

async function fetchMoveDetails(moves) {
  // moves: array of { move: { name, url } }
  return Promise.all(
    moves.map(async (moveObj) => {
      const res = await fetch(moveObj.move.url);
      const data = await res.json();
      return {
        type: data.type.name,
        power: data.power,
      };
    })
  );
}

// Type effectiveness chart (Gen 1, simplified)
const TYPE_CHART = {
  normal:     { rock: 0.5, ghost: 0, },
  fire:       { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5 },
  water:      { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric:   { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass:      { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5 },
  ice:        { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2 },
  fighting:   { normal: 2, ice: 2, rock: 2, ghost: 0 },
  poison:     { grass: 2, poison: 0.5, ground: 0.5, bug: 2, rock: 0.5, ghost: 0.5 },
  ground:     { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2 },
  flying:     { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5 },
  psychic:    { fighting: 2, poison: 2, psychic: 0.5 },
  bug:        { fire: 0.5, grass: 2, fighting: 0.5, poison: 2, flying: 0.5, psychic: 2, ghost: 0.5 },
  rock:       { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2 },
  ghost:      { normal: 0, psychic: 0 },
  dragon:     { dragon: 2 },
};

function getEffectiveness(moveType, defenderTypes) {
  if (!moveType || !defenderTypes) return 1;
  let multiplier = 1;
  defenderTypes.forEach(typeObj => {
    const type = typeObj.type.name;
    if (TYPE_CHART[moveType] && TYPE_CHART[moveType][type] !== undefined) {
      multiplier *= TYPE_CHART[moveType][type];
    }
  });
  return multiplier;
}

// Add keyframes for shake and flash
const style = document.createElement('style');
style.innerHTML = `
@keyframes shake {
  0% { transform: translateX(0); }
  20% { transform: translateX(-10px); }
  40% { transform: translateX(10px); }
  60% { transform: translateX(-10px); }
  80% { transform: translateX(10px); }
  100% { transform: translateX(0); }
}
@keyframes flash {
  0% { opacity: 1; }
  100% { opacity: 0; }
}
`;
document.head.appendChild(style);

export default function App() {
  const [pokemon1, setPokemon1] = useState(null);
  const [pokemon2, setPokemon2] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedMove1, setSelectedMove1] = useState(null);
  const [selectedMove2, setSelectedMove2] = useState(null);
  const [battleResult, setBattleResult] = useState(null);
  const [moveDetails1, setMoveDetails1] = useState([]);
  const [moveDetails2, setMoveDetails2] = useState([]);
  const [hp1, setHp1] = useState(100);
  const [hp2, setHp2] = useState(100);
  const [animating, setAnimating] = useState(false);
  const animationTimeout = useRef(null);
  const [animate1, setAnimate1] = useState({ attack: false, shake: false });
  const [animate2, setAnimate2] = useState({ attack: false, shake: false });
  const [moveSelections1, setMoveSelections1] = useState([]); // array of 3 indices
  const [moveSelections2, setMoveSelections2] = useState([]); // array of 3 indices
  const [currentRound, setCurrentRound] = useState(0); // 0, 1, 2
  const [roundResults, setRoundResults] = useState([]); // store results for each round

  const fetchPokemon = async () => {
    setLoading(true);
    setBattleResult(null);
    setSelectedMove1(null);
    setSelectedMove2(null);
    setMoveDetails1([]);
    setMoveDetails2([]);
    setHp1(100);
    setHp2(100);
    setAnimating(false);
    setAnimate1({ attack: false, shake: false });
    setAnimate2({ attack: false, shake: false });
    setMoveSelections1([]);
    setMoveSelections2([]);
    setCurrentRound(0);
    setRoundResults([]);
    if (animationTimeout.current) clearTimeout(animationTimeout.current);
    const id1 = getRandomId();
    let id2 = getRandomId();
    while (id2 === id1) id2 = getRandomId();
    const res1 = await fetch(`https://pokeapi.co/api/v2/pokemon/${id1}`);
    const res2 = await fetch(`https://pokeapi.co/api/v2/pokemon/${id2}`);
    const poke1 = await res1.json();
    const poke2 = await res2.json();
    // Pick 4 moves for each
    let moves1 = poke1.moves.slice(0, 4);
    let moves2 = poke2.moves.slice(0, 4);
    if (poke1.moves.length > 4) {
      const shuffled = [...poke1.moves].sort(() => 0.5 - Math.random());
      moves1 = shuffled.slice(0, 4);
    }
    if (poke2.moves.length > 4) {
      const shuffled = [...poke2.moves].sort(() => 0.5 - Math.random());
      moves2 = shuffled.slice(0, 4);
    }
    // Fetch move details
    const [details1, details2] = await Promise.all([
      fetchMoveDetails(moves1),
      fetchMoveDetails(moves2),
    ]);
    setPokemon1(poke1);
    setPokemon2(poke2);
    setMoveDetails1(details1);
    setMoveDetails2(details2);
    setLoading(false);
  };

  useEffect(() => {
    fetchPokemon();
  }, []);

  // Helper to select a move for a round
  const handleMoveSelect = (player, idx) => {
    if (animating) return;
    if (currentRound > 2) return;
    if (player === 1) {
      const newSel = [...moveSelections1];
      newSel[currentRound] = idx;
      setMoveSelections1(newSel);
    } else {
      const newSel = [...moveSelections2];
      newSel[currentRound] = idx;
      setMoveSelections2(newSel);
    }
  };

  // Play a single round
  const handleNextMove = () => {
    if (
      moveSelections1[currentRound] == null ||
      moveSelections2[currentRound] == null
    ) {
      setBattleResult('Please select a move for each Pokémon for this round.');
      return;
    }
    const idx1 = moveSelections1[currentRound];
    const idx2 = moveSelections2[currentRound];
    const move1 = moveDetails1[idx1];
    const move2 = moveDetails2[idx2];
    if (!move1 || !move2) {
      setBattleResult('Move details not loaded.');
      return;
    }
    const p1Types = pokemon1.types;
    const p2Types = pokemon2.types;
    const eff1 = getEffectiveness(move1.type, p2Types);
    const eff2 = getEffectiveness(move2.type, p1Types);
    const power1 = move1.power !== null ? move1.power * eff1 : 0;
    const power2 = move2.power !== null ? move2.power * eff2 : 0;
    setAnimating(true);
    setBattleResult(null);
    let newHp1 = hp1 - power2;
    let newHp2 = hp2 - power1;
    if (newHp1 < 0) newHp1 = 0;
    if (newHp2 < 0) newHp2 = 0;
    setAnimate1({ attack: false, shake: false });
    setAnimate2({ attack: false, shake: false });
    setTimeout(() => {
      setAnimate1({ attack: true, shake: false });
      setAnimate2({ attack: false, shake: true });
      setTimeout(() => {
        setAnimate1({ attack: false, shake: false });
        setAnimate2({ attack: true, shake: false });
        setTimeout(() => {
          setAnimate2({ attack: false, shake: false });
          setHp1(newHp1);
          setHp2(newHp2);
          setAnimating(false);
          // Store round result
          let roundResult = '';
          roundResult += `Round ${currentRound + 1}:\n`;
          roundResult += `${pokemon1.name.charAt(0).toUpperCase() + pokemon1.name.slice(1)} used ${move1.type} (${move1.power !== null ? move1.power : 'N/A'}) x${eff1} = ${power1}\n`;
          roundResult += `${pokemon2.name.charAt(0).toUpperCase() + pokemon2.name.slice(1)} used ${move2.type} (${move2.power !== null ? move2.power : 'N/A'}) x${eff2} = ${power2}\n`;
          if (newHp1 > newHp2) {
            roundResult += `After this round: ${pokemon1.name.charAt(0).toUpperCase() + pokemon1.name.slice(1)} leads!`;
          } else if (newHp2 > newHp1) {
            roundResult += `After this round: ${pokemon2.name.charAt(0).toUpperCase() + pokemon2.name.slice(1)} leads!`;
          } else {
            roundResult += 'It is a tie after this round!';
          }
          setRoundResults((prev) => [...prev, roundResult]);
          // If last round or someone fainted, show final result
          if (currentRound === 2 || newHp1 === 0 || newHp2 === 0) {
            let result = '';
            if (newHp1 > newHp2) {
              result = `Winner: ${pokemon1.name.charAt(0).toUpperCase() + pokemon1.name.slice(1)}!`;
            } else if (newHp2 > newHp1) {
              result = `Winner: ${pokemon2.name.charAt(0).toUpperCase() + pokemon2.name.slice(1)}!`;
            } else {
              result = 'It is a tie!';
            }
            setBattleResult(result);
          } else {
            setCurrentRound((r) => r + 1);
          }
        }, 400);
      }, 400);
    }, 200);
  };

  return (
    <div
      style={{
        fontFamily: 'sans-serif',
        textAlign: 'center',
        padding: '2rem',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #b7e0b7 0%, #e0f7fa 100%)',
        backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.08) 0 2px, transparent 2px 40px), url("/src/assets/landmarks/kanto-map.jpg")',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        filter: 'brightness(0.97)',
      }}
    >
      <h1 style={{ marginBottom: 0 }}>Pokémon Battle!</h1>
      <div style={{ color: '#388e3c', fontWeight: 600, marginBottom: 24, fontSize: 18 }}>Kanto Region</div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
        <PokemonCard
          pokemon={pokemon1}
          selectedMove={moveSelections1[currentRound]}
          onMoveSelect={(idx) => handleMoveSelect(1, idx)}
          disabled={animating}
          moveDetails={moveDetails1}
          hp={hp1}
          isWinner={battleResult && hp1 > hp2}
          isLoser={battleResult && hp1 < hp2}
          animateAttack={animate1.attack}
          animateShake={animate1.shake}
        />
        <div style={{ alignSelf: 'center', fontSize: '2rem' }}>VS</div>
        <PokemonCard
          pokemon={pokemon2}
          selectedMove={moveSelections2[currentRound]}
          onMoveSelect={(idx) => handleMoveSelect(2, idx)}
          disabled={animating}
          moveDetails={moveDetails2}
          hp={hp2}
          isWinner={battleResult && hp2 > hp1}
          isLoser={battleResult && hp2 < hp1}
          animateAttack={animate2.attack}
          animateShake={animate2.shake}
        />
      </div>
      <div style={{ marginTop: '2rem' }}>
        {battleResult ? null : (
          <button
            onClick={handleNextMove}
            disabled={animating || moveSelections1[currentRound] == null || moveSelections2[currentRound] == null}
            style={{ padding: '0.5rem 2rem', fontSize: '1rem', marginBottom: 16 }}
          >
            {currentRound < 2 ? 'Next Move' : 'Finish Battle'}
          </button>
        )}
        <br />
        <button
          onClick={fetchPokemon}
          disabled={loading || animating}
          style={{ padding: '0.5rem 2rem', fontSize: '1rem', marginTop: 8 }}
        >
          {loading ? 'Loading...' : 'Change Pokemon'}
        </button>
      </div>
      <div style={{ marginTop: '2rem', fontSize: '1.1rem', color: '#333', whiteSpace: 'pre-line', maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
        {roundResults.map((r, i) => (
          <div key={i} style={{ marginBottom: 12 }}>{r}</div>
        ))}
        {battleResult && (
          <div style={{ marginTop: '2rem', fontSize: '1.2rem', color: 'darkred', whiteSpace: 'pre-line' }}>{battleResult}</div>
        )}
      </div>
    </div>
  );
} 