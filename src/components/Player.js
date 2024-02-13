import React from "react";
import {Guess} from "./Guess";
import styles from "./Player.module.css"

export const Player = props => {

    const getGuess = round => props.player.guesses.length > round ? props.player.guesses[round] : null

    const getResult = round => props.player.results.length > round ? props.player.results[round] : null

    const onChangeNumber = (amount) => {
        if (props.game.phase == "guess")
            props.addToNextGuess(props.player.name, amount)
        else props.addToNextResult(props.player.name, amount)
    }

    const onSetNumber = (amount) => {
        if (props.game.phase == "guess")
            props.setNextGuess(props.player.name, amount)
        else props.setNextResult(props.player.name, amount)
    }

    const isTurn = () => props.game.turn == props.player.id

    const createButtons = () => {
        let res = []
        for (let i = 0; i<= props.game.rounds[props.game.round]; i++) {
            let isSelected = false;
            if ((props.game.phase === "guess" && props.player.guesses.length == props.game.round + 1 && props.player.guesses[props.game.round] == i) ||
                (props.game.phase === "play" && props.player.results.length == props.game.round + 1 && props.player.results[props.game.round] == i))
                isSelected = true
            res.push(<span className={styles.number}
                           key={i}
                           data-selected={isSelected}
                           onClick={() => onSetNumber(i)}>{i}</span>)
        }
        return <>{res}</>
    }
    return <div className={`${styles.player} ${isTurn() && styles.turn}`}>
        <div className={styles.heading}>
            <span>{props.player.name} <span className={styles.numberbox}>{createButtons()}</span>{/*<button onClick={() => onChangeNumber(1)}>+</button><button onClick={() => onChangeNumber(-1)}>-</button>*/}</span>
            <span>{props.points} Pkt</span>
        </div>
        <div className={styles.guessbox}>{props.game.rounds.map((r, index) => <Guess key={index} guess={getGuess(index)} result={getResult(index)} round={index} currentRound={props.game.round}/>)}</div>
    </div>
}