import styles from "./Spinner.module.css"

export default function SpinnerMini() {
    return (        
        <div className={[styles.spinner, styles.mini].join(' ')}>O</div>      
    )
}