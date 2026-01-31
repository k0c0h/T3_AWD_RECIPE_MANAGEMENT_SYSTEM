import React, { useState, useEffect } from "react";
import ingredientService from "../../services/ingredient";

function IngredientSearch({ onSelect }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (search.length < 2) {
      setResults([]);
      setShow(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        console.log("Searching for:", search);

        const res = await ingredientService.getByName(search);

        const data = Array.isArray(res?.data)
          ? res.data
          : res?.data
          ? [res.data]
          : [];

        console.log("Rendered results:", data);

        setResults(data);
        setShow(true);
      } catch (err) {
        if (err.response?.status === 404) {
          setResults([]);
          setShow(true);
        } else {
          console.error("Search error:", err);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const handleSelect = (ing) => {
    onSelect(ing);
    setSearch("");
    setResults([]);
    setShow(false);
  };

  return (
    <div className="search-container">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search ingredient... (type at least 2 characters)"
        className="form-input"
      />

      {loading && (
        <div
          style={{ padding: "0.5rem", textAlign: "center", color: "#6b7280" }}
        >
          Searching...
        </div>
      )}

      {show && results.length > 0 && (
        <div className="mt-2 border rounded-lg shadow-sm bg-white overflow-hidden">
          {results.map((ing) => (
            <div
              key={ing._id || ing.productId}
              onClick={() => handleSelect(ing)}
              className="
          cursor-pointer px-4 py-2
          flex justify-between items-center
          hover:bg-[#9FB9B3]/20
          transition
        "
            >
              <div>
                <p className="font-medium text-gray-800">{ing.name}</p>
                <p className="text-xs text-gray-500">
                  {ing.sizeUnit} · ${ing.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {show && results.length === 0 && !loading && search.length >= 2 && (
        <div className="search-results">
          <div style={{ padding: "0.75rem", color: "#6b7280" }}>
            No ingredients found
          </div>
        </div>
      )}
    </div>
  );
}

export default IngredientSearch;
