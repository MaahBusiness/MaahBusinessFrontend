import { Search } from "lucide-react";

const SearchBarCmpThin = ({ placeholder, searchTerm, setSearchTerm }) => {
  return (
    <div className="" style={{ width: "100%" }}>
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

export default SearchBarCmpThin;
