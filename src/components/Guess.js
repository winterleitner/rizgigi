import React from "react";
import styles from "./Guess.module.css"


export const Guess = props => {
    const getContent = () => {
        if (props.guess == null) return <>-</>
        if (props.result == null) return props.guess
        if (props.guess === props.result) return <span style={{color: "green"}}>{props.guess}</span>
        return <span style={{color: "red"}}>{props.result} ({props.guess})</span>
    }
    return <span className={`${styles.guess} ${props.round == props.currentRound && props.result != null && styles.current}  ${props.round == props.currentRound && props.result == null && styles.guessPhase}`}>{getContent()}</span>
}