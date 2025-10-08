import { useState, useEffect } from "react";

// Il mio hook gestisce il fetch dei dettagli in base all'ID fornito
function useProductDetails(productId) {
    // Stato per memorizzare i dettagli completi
    const [product, setProduct] = useState(null);
    // Stato per il caricamento dei dettagli
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    
    // Lo uso per avviare il fetch ogni volta che l'ID cambia
    useEffect(() => {
        // Se non ho un ID valido, non faccio nulla e pulisco lo stato
        if (!productId) {
            setProduct(null);
            return;
        }

        // Definisco la funzione asincrona per il fetch
        async function fetchDetails() {
            setIsLoadingDetails(true);
            try {
                // Chiamo l'endpoint specifico per l'ID
                const response = await fetch(`/products/${productId}`);

                if (!response.ok) {
                    throw new Error("Dettagli prodotto non trovati.");
                }

                const data = await response.json();
                setProduct(data);
            } catch (error) {
                console.error("Errore nel recupero dettagli:", error);
                setProduct(null);
            } finally {
                setIsLoadingDetails(false);
            }
        }
        
        fetchDetails();
        
        // Questo useEffect non ha bisogno di Race Condition/Cleanup complessi
        // perché l'ID cambia solo al click dell'utente.
    }, [productId]); // L'effetto dipende solo dall'ID

    // Restituisco i dettagli e lo stato di caricamento
    return { product, isLoadingDetails };
}

export default useProductDetails;