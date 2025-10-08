import { useState, useEffect } from "react";
import useDebounce from '../hooks/useDebounce'; 
import useProductDetails from '../hooks/useProductDetails'; 

function SmartSearch() {
  //* ---------------------------------- STATI ----------------------------------
  // Stato per il testo digitato (cambia ad ogni battitura)
  const [searchQuery, setSearchQuery] = useState("");
  // Stato per la lista dei suggerimenti API
  const [suggestions, setSuggestions] = useState([]);
  // Stato per il caricamento della lista dei suggerimenti
  const [isLoading, setIsLoading] = useState(false);
  // Nuovo stato per l'ID del prodotto da mostrare (Bonus)
  const [selectedProductId, setSelectedProductId] = useState(null);

  //* ---------------------------------- HOOKS CUSTOM ----------------------------------
  // 1. Uso l'Hook Debounce (Milestone 2) per ritardare la ricerca
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // 2. Uso l'Hook per caricare i dettagli del prodotto selezionato (Bonus)
  const { product: selectedProduct, isLoadingDetails } = useProductDetails(selectedProductId);

  //* ---------------------------------- FUNZIONI GESTIONE ----------------------------------
  // Funzione per aggiornare lo stato di ricerca ad ogni input
  const handleChange = (event) => {
    // Pulisco i dettagli quando l'utente ricomincia a digitare (Bonus)
    setSelectedProductId(null);
    setSearchQuery(event.target.value);
  };

  // Funzione gestisce il click sui suggerimenti (Bonus)
  const handleSuggestionClick = (product) => {
    // 1. Pulisco i suggerimenti per nascondere la tendina
    setSuggestions([]);
    // 2. Imposto la query dell'input al nome del prodotto (UX)
    setSearchQuery(product.name);
    // 3. Imposto l'ID per avviare il fetch dei dettagli nell'Hook useProductDetails
    setSelectedProductId(product.id);
  };

  //* ---------------------------------- LOGICA API (Milestone 1 & 2) ----------------------------------
  // Attivazione dinamica con useEffect: si attiva solo con il valore debounced
  useEffect(() => {
    let isCurrent = true; // Flag per Race Condition

    // Condizione di Pulizia Rapida: pulisco i suggerimenti se la query è vuota (Milestone 1)
    if (!debouncedSearchQuery) {
      setSuggestions([]);
      return;
    }

    // Definisco e invoco la funzione asincrona per accedere a isCurrent
    async function fetchSuggestions() {
      setIsLoading(true);

      try {
        // Uso il valore DEBOUNCED per la ricerca
        const response = await fetch(`/products?search=${debouncedSearchQuery}`);

        if (!response.ok) {
          throw new Error(`Errore HTTP: ${response.status}`);
        }

        const data = await response.json();

        // CONTROLLO DI RACE CONDITION prima di aggiornare lo stato
        if (isCurrent) {
          setSuggestions(data);
        }
      } catch (error) {
        console.error("Errore nella chiamata API:", error);
        if (isCurrent) {
          setSuggestions([]);
        }
      } finally {
        // TERMINO IL CARICAMENTO solo se la richiesta è l'ultima valida
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    fetchSuggestions(); // Invoco la funzione

    // Funzione di Cleanup per disabilitare il flag Race Condition
    return () => {
      isCurrent = false;
    };
  }, [debouncedSearchQuery]); // La dipendenza è corretta: il valore ritardato

  //* ---------------------------------- LOGICA RENDERING ----------------------------------
  // La tendina appare solo se non sto caricando i dettagli (Bonus)
  const showLoading = isLoading && debouncedSearchQuery.length > 0;
  // Suggerimenti appaiono solo se non ho un prodotto selezionato
  const showSuggestions =
    suggestions.length > 0 && searchQuery.length > 0 && !isLoading && selectedProduct === null;

  return (
    <div className="search-container">
      {/* INPUT */}
      <input
        type="text"
        placeholder="Cerca prodotti..."
        value={searchQuery}
        onChange={handleChange}
      />

      {/* 1. VISUALIZZAZIONE CARICAMENTO SUGGERIMENTI */}
      {showLoading && (
        <div className="suggestions-dropdown">
          <p>Caricamento suggerimenti...</p>
        </div>
      )}

      {/* 2. VISUALIZZAZIONE SUGGERIMENTI (Milestone 1) */}
      {showSuggestions && (
        <ul className="suggestions-dropdown">
          {suggestions.map((product) => (
            // Aggiungo l'onClick per il Bonus
            <li key={product.id || product.name} onClick={() => handleSuggestionClick(product)}>
              {product.name}
            </li>
          ))}
        </ul>
      )}

      {/* 3. VISUALIZZAZIONE BONUS: NESSUN RISULTATO */}
      {!isLoading &&
        searchQuery.length > 0 &&
        suggestions.length === 0 &&
        selectedProduct === null && (
          <div className="suggestions-dropdown">
            <p>Nessun risultato trovato.</p>
          </div>
        )}

      {/* 4. VISUALIZZAZIONE BONUS: DETTAGLI PRODOTTO SELEZIONATO */}
      {selectedProduct && (
        <div className="product-details">
          <h2>{selectedProduct.name}</h2>
          {isLoadingDetails ? (
            <p>Caricamento dettagli prodotto...</p>
          ) : (
            <>
              {/* Esempio di visualizzazione dei dettagli */}
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                style={{ maxWidth: "100px" }}
              />
              <p>
                <strong>Descrizione:</strong> {selectedProduct.description}
              </p>
              <p>
                <strong>Prezzo:</strong> €{selectedProduct.price}
              </p>
              {/* Qui potrei aggiungere altri campi come rating, stock, etc. */}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default SmartSearch;
