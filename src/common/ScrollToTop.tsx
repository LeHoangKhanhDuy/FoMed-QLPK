import { ChevronUp } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';

const ScrollToTop: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const location = useLocation();

    useEffect(() => {
        window.scrollTo({top: 0, behavior: "smooth"});
    }, [location])

    useEffect(() => {
        const toggleVisibility = () => {
            setIsVisible(window.scrollY > 300);
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({top: 0, behavior: "smooth"});
    };


    return (
      <button
        onClick={scrollToTop}
        className={`fixed bottom-5 right-5 p-3 bg-sky-400 text-white rounded-full shadow-lg transition-opacity duration-300 cursor-pointer ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        aria-label="Scroll to top"
      >
        <ChevronUp size={20} />
      </button>
    );
}

export default ScrollToTop;