import React, {useEffect, useRef, useState} from "react";
import {Player} from "./Player";
import styles from "./Game.module.css"

const rounds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]

export const Game = props => {
    const [players, setPlayers] = useState([])
    const [round, setRound] = useState(-1)
    const [phase, setPhase] = useState("guess")
    const [turn, setTurn] = useState(0)

    const addPlayer = (name) => {
        if (players.some(p => p.name === name)) return;
        const np = {
            id: players.length,
            name: name,
            guesses: [],
            results: []
        }
        setPlayers(players => [...players, np])
    }

    const promptNewPlayer = () => {
        const name = window.prompt("Please enter name:");
        addPlayer(name)
    }

    const addToNextGuess = (name, change) => {
        const player = players.find(p => p.name == name)
        if (player == null) return
        if (player.guesses.length < round + 1) player.guesses.push(0)
        else {
            if (player.guesses[round] + change > rounds[round] || player.guesses[round] + change < 0) return
            player.guesses[round] = player.guesses[round] + change
        }
        setPlayers(players => players.map(p => {
            if (p.name === player.name) return player
            return p
        }))
    }
    const addToNextResult = (name, change) => {
        const player = players.find(p => p.name == name)
        if (player == null) return
        if (player.results.length < round + 1) player.results.push(0)
        else {
            if (player.results[round] + change > rounds[round] || player.results[round] + change < 0) return
            player.results[round] = player.results[round] + change
        }
        setPlayers(players => players.map(p => {
            if (p.name === player.name) return player
            return p
        }))
    }

    const setNextGuess = (name, value) => {
        const player = players.find(p => p.name == name)
        if (player == null) return
        if (value > rounds[round] || value < 0) return
        if (player.guesses.length < round + 1) player.guesses.push(value)
        else {
            player.guesses[round] = value
        }
        setPlayers(players => players.map(p => {
            if (p.name === player.name) return player
            return p
        }))
    }

    const setNextResult = (name, value) => {
        const player = players.find(p => p.name == name)
        if (player == null) return
        if (value > rounds[round] || value < 0) return
        if (player.results.length < round + 1) player.results.push(value)
        else {
            player.results[round] = value
        }
        setPlayers(players => players.map(p => {
            if (p.name === player.name) return player
            return p
        }))
    }

    const nextPhase = () => {
        if (round < 0) return;
        if (phase == "guess") {
            if (!players.every(p => p.guesses.length === round + 1))
                return
            setPlayers(players => {
                return players.map(p => {
                    if (p.results.length < round + 1) p.results.push(0)
                    return p
                })
            })
            setPhase("play")
        } else {
            if (!players.every(p => p.results.length === round + 1))
                return

            setPlayers(players => {
                return players.map(p => {
                    if (p.guesses.length <= round + 1) p.guesses.push(0)
                    return p
                })
            })
            setPhase("guess")
            setRound(round => round + 1)
            if (turn + 1 === players.length) setTurn(0)
            else setTurn(turn => turn + 1)
        }
    }

    const nextPhaseRef = useRef();
    nextPhaseRef.current = nextPhase

    /**
     * Initializes the key listeners
     */
    useEffect(() => {
        function handleKeyDown(e) {
            if (e.key === 'Enter') {
                nextPhaseRef.current()
            }
            else if (e.key === 'F12')
                exportGameRef.current("download")
            else if (e.key === 'F2') {
                localStorage.removeItem("game")
                window.location = "/"
            }
        }

        document.addEventListener('keydown', handleKeyDown);

        // Don't forget to clean up
        return function cleanup() {
            document.removeEventListener('keydown', handleKeyDown);
        }
    }, []);

    /**
     * Saves the game when the state changes
     */
    useEffect(() => {
        if (turn < 0 || players.length == 0) return
        console.log("saving")
        localStorage.setItem("game", exportGame())
    }, [players, turn, phase, round])

    /**
     * Load game from Localstorage after reload
     */
    useEffect(() => {
        const gameJson = localStorage.getItem("game")
        if (gameJson != null) {
            const game = JSON.parse(gameJson)
            setPlayers(game.players)
            setTurn(game.game.turn)
            setPhase(game.game.phase)
            setRound(game.game.round)
        }
    }, [])

    /**
     * Counts the points entered in the current round
     * @param round
     * @returns {number}
     */
    const countRoundPoints = round => {
        let points = 0;
        for (const p of players) {
            if (p.results.length > round) points += p.results[round]
        }
        return points

    }

    /**
     * calculates a players total points
     * @param player
     * @returns {string|*}
     */
    const calculatePlayerPoints = (player) => {
        if (player.results.length > player.guesses.length) return "-"
        return player.results.map((r, index) => {
            const guess = player.guesses[index]
            const result = player.results[index]
            if (guess == r)
                return guess
            else if (guess === 0)
                return -result
            else return -guess
        }).reduce((a,b) => a+b, 0)
    }

    const exportGame = (target) => {
        const gameState = {
            game: {rounds: rounds, round: round, phase: phase, turn: turn},
            players: players
        }
        var gameJson = JSON.stringify(gameState)
        if (target == null || target === "return") return gameJson
        else if (target == "download") {
            const element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(gameState)));
            element.setAttribute('download', "game.json");

            element.style.display = 'none';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);
        }

    }


    const exportGameRef = useRef()
    exportGameRef.current = exportGame

    return <div>
        {round === -1 ? <>
            <button onClick={promptNewPlayer}>Add Player</button>
            <button onClick={() => setRound(0)} disabled={players.length < 2}>Start</button>
        </> : <Header game={{rounds: rounds, round: round, phase: phase, turn: turn}}/>}
        <div className={styles.playersList}>
            {players.map(p => <Player player={p}
                                      points={calculatePlayerPoints(p)}
                                      addToNextGuess={addToNextGuess}
                                      addToNextResult={addToNextResult}
                                      setNextGuess={setNextGuess}
                                      setNextResult={setNextResult}
                                      game={{rounds: rounds, round: round, phase: phase, turn: turn}}/>)}
        </div>
        {players.every(p => p.results.length === round + 1) && countRoundPoints(round) > rounds[round] &&
        <Error>{`Warnung! Mehr Stiche (${countRoundPoints(round)}) als Karten (${rounds[round]}).`}</Error>}
        {players.every(p => p.results.length === round + 1) && countRoundPoints(round) < rounds[round] &&
        <Error>{`Warnung! Weniger Stiche (${countRoundPoints(round)}) als Karten (${rounds[round]}).`}</Error>}
        {round >= 0 && round < rounds.length && <div className={styles.phaseButton} onClick={nextPhase}>NextRound</div>}
    </div>
}

const Header = props => {
    return props.game.round < props.game.rounds.length ? <div>
        <div className={styles.gameHeader}>
                <span>Runde {props.game.round + 1} / {props.game.rounds.length}</span>
                <span>Phase: {props.game.phase === "guess" ? "Ansage" : "Spiel"}</span>
                <span>{props.game.rounds[props.game.round]} {props.game.rounds[props.game.round] > 1 ? "Karten" : "Karte"}</span>
        </div>
        <div className={styles.gameProgress}>
            {props.game.rounds.map((r, round) => <span data-past={props.game.round > round}
                                                       data-current={props.game.round == round}>{r}</span>)}
        </div>
    </div> : <div className={styles.gameHeader}>Game Over.</div>
}

const Error = props => {
    return <div className={styles.gameError}>
        {props.children}
    </div>
}