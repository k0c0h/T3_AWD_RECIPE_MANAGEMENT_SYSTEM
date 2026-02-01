import { useState } from "react";
import ChefQuoteForm from "../../views/quotations/chef/ChefQuoteForm";
import ChefQuoteHistory from "../../views/quotations/chef/ChefQuoteHistory";

const Quotes = () => {
  const [view, setView] = useState("form");
  const [refreshKey, setRefreshKey] = useState(0);

  return view === "form" ? (
    <ChefQuoteForm
      onShowHistory={() => setView("history")}
      onSaved={() => setRefreshKey((prev) => prev + 1)}
    />
  ) : (
    <ChefQuoteHistory
      onBack={() => setView("form")}
      refreshKey={refreshKey}
    />
  );
};

export default Quotes;
