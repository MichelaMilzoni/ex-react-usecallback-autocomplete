import { useEffect, useState } from "react"

// La funzione deve accettare 2 parametri 'value' e 'delay'
function useDebounce(value, delay) {
    // Stato per memorizzare il valore ritardato (debounced)
    const [debouncedValue, setDebouncedValue] = useState(value)

    // Logica del timer (si riesegue ogni volta che 'value' o 'delay' cambiano)
    useEffect(() => {
        //* IMPOSTA IL TIMER
        // Dopo il 'delay', questo codice viene eseguito e aggiorna lo stato interno.
        const timerId = setTimeout(() => {
            setDebouncedValue(value)
        }, delay);

        //* FUNZIONE DI CLEANUP (Il cuore del debounce)
        // Se 'value' cambia prima che il timer scada, clearTimeout annulla l'aggiornamento precedente.
        return () => {
            clearTimeout(timerId); 
        };
    },
    // Dipendenze: L'effetto viene eseguito ad ogni cambio di 'value' o 'delay'.
    [value, delay]); 

    //* RESTITUISCE IL VALORE RITARDATO
    return debouncedValue;
}

export default useDebounce;