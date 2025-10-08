import { useState, useEffect } from "react";
import useDebounce from "../hooks/useDebounce";

function SmartSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  //* DEBOUNCE
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Definisco la Funzione handleChange
  const handleChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Attivazione dinamica con useEffect e Logica di Race Condition
  useEffect(() => {
    let isCurrent = true; // Flag per Race Condition

    // Condizione di Pulizia Rapida (Scomparsa Tendina)
    if (!debouncedSearchQuery) {
      setSuggestions([]);
      return;
    }

    // Definisco e invoco la funzione asincrona all'interno per accedere a isCurrent
    async function fetchSuggestions() {
      // Usiamo isCurrent per gestire l'aggiornamento dello stato anche in caso di fetch successivi.
      setIsLoading(true);

      try {
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
        // TERMINA IL CARICAMENTO solo se la richiesta è l'ultima valida
        if (isCurrent) {
          setIsLoading(false);
        }
        // console.log("Operazione completata"); // Rimosso log per pulizia
      }
    }

    fetchSuggestions(); // Invoco la funzione immediatamente

    // Funzione di Cleanup per disabilitare il flag
    return () => {
      isCurrent = false;
    };
  }, [debouncedSearchQuery]); // Dipendenza dalla query di ricerca

  // Logica di rendering per la tendina
  const showLoading = isLoading && searchQuery.length > 0;
  const showSuggestions = suggestions.length > 0 && searchQuery.length > 0 && !isLoading;

  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Cerca prodotti..."
        value={searchQuery}
        onChange={handleChange}
      />

      {/* Visualizzazione Caricamento */}
      {showLoading && (
        <div className="suggestions-dropdown">
          <p>Caricamento...</p>
        </div>
      )}

      {/* Visualizzazione Suggerimenti */}
      {showSuggestions && (
        <ul className="suggestions-dropdown">
          {suggestions.map((product, index) => (
            // Assumendo che ogni prodotto abbia una proprietà 'name' e 'id'
            <li key={index}>{product.name}</li>
          ))}
        </ul>
      )}

      {/* BONUS: Nessun risultato */}
      {!isLoading && searchQuery.length > 0 && suggestions.length === 0 && (
        <div className="suggestions-dropdown">
          <p>Nessun risultato trovato.</p>
        </div>
      )}
    </div>
  );
}

export default SmartSearch;
