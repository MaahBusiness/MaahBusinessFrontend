import { Search } from "lucide-react";

const SearchBarCmp = ({ placeholder, searchTerm, setSearchTerm }) => {
  return (
    <div className="search-container welcome-search">
      <Search size={16} className="search-icon" />
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
    </div>
  );
};

export default SearchBarCmp;
