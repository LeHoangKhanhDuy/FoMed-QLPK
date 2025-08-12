import { Search } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
//import { getSearchProducts } from "@/service/product";

interface ProductSuggestion {
  id: number;
  name: string;
  thumbnail: string;
  price: number;
  discount: number;
}
const Searchbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const currentKeyword = params.get("search") || "";
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [displayText, setDisplayText] = useState("");
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const placeholder = "Tìm dịch vụ y tế...";

  useEffect(() => {
    setInputValue(currentKeyword);
  }, [currentKeyword]);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= placeholder.length) {
        setDisplayText(placeholder.slice(0, index));
        index++;
      } else {
        // Reset sau khi hiển thị hết
        index = 0;
        setDisplayText("");
      }
    }, 200); // tốc độ chạy chữ

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed) {
      const encoded = encodeURIComponent(trimmed);
      navigate(`/search?search=${encoded}&page=1&limit=10`);
      setShowSuggestions(false);
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.trim() === "") {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      // const result = await getSearchProducts({
      //   keyword: value,
      //   page: "1",
      //   limit: "5",
      // });

      //setSuggestions(result);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    const encoded = encodeURIComponent(suggestion);
    navigate(`/search?search=${encoded}&page=1&limit=10`);
  };

  return (
    <div
      className={`relative max-w-5xl mx-auto w-full ${
        showSuggestions ? "z-[110]" : "z-10"
      }`}
    >
      <form
        onSubmit={handleSubmit}
        className={`w-full bg-white rounded-lg shadow-sm ring-1 ring-slate-200 flex items-center px-4 py-4 relative ${
          showSuggestions ? "z-[105]" : "z-10"
        }`}
      >
        <Search className="text-gray-500 w-6 h-6 mr-2" />
        {/* Fake placeholder */}
        {inputValue === "" && (
          <div className="absolute left-12 text-xl text-gray-600 pointer-events-none select-none">
            {displayText}
          </div>
        )}
        {/* Label ẩn cho trình đọc màn hình */}
        <label htmlFor="search-input" className="sr-only">
          Tìm ngôn ngữ lập trình
        </label>
        <input
          id="search-input"
          type="text"
          className="flex-grow outline-none text-xl text-gray-800 bg-transparent"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
        />
      </form>
      {/* Backdrop overlay */}
      {showSuggestions && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-brightness-70 z-10 h-screen"
          onClick={() => setShowSuggestions(false)}
        />
      )}
      {/* Suggestions dropdown */}
      {showSuggestions && (
        <ul className="absolute left-0 right-0 mt-1 bg-white shadow-lg rounded-md border border-gray-200 max-h-80 overflow-y-auto z-20 w-full">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="flex items-center gap-2 px-4 py-2">
                <div className="w-10 h-10 bg-gray-200 rounded-md animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
              </li>
            ))
          ) : suggestions.length > 0 ? (
            suggestions.map((sug) => (
              <li
                key={sug.id}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-slate-100 cursor-pointer"
                onClick={() => handleSuggestionClick(sug.name)}
              >
                <img
                  src={
                    sug.thumbnail.startsWith("http")
                      ? sug.thumbnail
                      : `${import.meta.env.VITE_AUTH_URL}/${sug.thumbnail}`
                  }
                  alt={sug.name}
                  className="w-10 h-10 object-cover rounded-md border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://placehold.co/100x100?text=No+Image";
                  }}
                />

                <div className="flex flex-col overflow-hidden">
                  <span className="truncate font-medium">{sug.name}</span>
                  <span className="text-xs font-semibold">
                    {sug.price === 0 ? (
                      <span className="text-green-600">Miễn phí</span>
                    ) : (
                      <>
                        <span className="text-red-600">
                          {(
                            sug.price *
                            (1 - (sug.discount || 0) / 100)
                          ).toLocaleString("vi-VN")}{" "}
                          ₫
                        </span>
                        {sug.discount > 0 && (
                          <span className="ml-2 text-gray-400 line-through">
                            {sug.price.toLocaleString("vi-VN")} ₫
                          </span>
                        )}
                      </>
                    )}
                  </span>
                </div>
              </li>
            ))
          ) : (
            <li className="text-sm text-gray-500 px-4 py-2">
              Không tìm thấy dịch vụ
            </li>
          )}
          <li
            className="text-sm font-medium text-center text-blue-600 px-4 py-2 cursor-pointer hover:bg-slate-100"
            onClick={() => {
              const trimmed = inputValue.trim();
              if (trimmed) {
                const encoded = encodeURIComponent(trimmed);
                navigate(`/search?search=${encoded}&page=1&limit=10`);
                setShowSuggestions(false);
              }
            }}
          >
            Xem tất cả kết quả "<strong>{inputValue.trim()}</strong>"
          </li>
        </ul>
      )}
    </div>
  );
};

export default Searchbar;
