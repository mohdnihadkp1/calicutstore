import React, { useState, useEffect, useMemo, useRef, useContext, createContext } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { 
  ShoppingCart, Menu, X, ArrowRight, Package, TrendingUp, 
  Shield, Truck, Heart, Search, Award, Filter, Plus, Edit, Trash2, 
  CheckCircle2, LogOut, ChevronDown, ChevronUp, Facebook, Instagram, Twitter,
  Eye, ShoppingBag, ChevronLeft, ChevronRight, Mail, Phone, MapPin,
  Gift, Image as ImageIcon, Layers, ArrowUp, Share2, AlertCircle, Settings,
  Maximize2, Home, MessageCircle, ArrowLeft
} from 'lucide-react';
import { Product, SortOption, FilterState, CATEGORIES, ProductVariant, StoreConfig } from './types';
import { initStore, getProducts, getProductById, saveProduct, deleteProduct, loginOwner, checkAuth, logoutOwner, getStoreConfig, saveStoreConfig } from './services/mockDb';

// --- CONTEXT ---
interface StoreContextType {
  config: StoreConfig;
  refreshConfig: () => void;
}
const StoreContext = createContext<StoreContextType | null>(null);

const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};

// --- SHARED COMPONENTS ---

// SEO Component
interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  schema?: object;
  noindex?: boolean;
}

const SEO: React.FC<SEOProps> = ({ title, description, image, url, type = 'website', schema, noindex = false }) => {
  useEffect(() => {
    document.title = title;
    const updateMeta = (name: string, content: string, attribute = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    if (description) {
      updateMeta('description', description);
      updateMeta('twitter:description', description);
      updateMeta('og:description', description, 'property');
    }

    if (noindex) {
      updateMeta('robots', 'noindex, nofollow');
    } else {
      updateMeta('robots', 'index, follow');
    }

    updateMeta('og:title', title, 'property');
    updateMeta('og:type', type, 'property');
    if (url) updateMeta('og:url', url, 'property');
    if (image) updateMeta('og:image', image, 'property');
    updateMeta('og:site_name', 'CALICUT STORE', 'property');

    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title);
    if (image) updateMeta('twitter:image', image);

    const scriptId = 'json-ld-structured-data';
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    
    if (schema) {
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schema);
    } else if (script) {
      script.textContent = '';
    }

  }, [title, description, image, url, type, schema, noindex]);

  return null;
};

const Logo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center shadow-md">
      <span className="font-serif font-bold text-2xl pb-1">C</span>
    </div>
    <div className="flex flex-col">
      <span className="font-serif font-bold text-lg leading-none tracking-tight">CALICUT</span>
      <span className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">Store</span>
    </div>
  </div>
);

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger', size?: 'sm' | 'md' | 'lg' }>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";
    const variants = {
      primary: "bg-black text-white hover:bg-gray-800 border border-transparent shadow-sm",
      secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-transparent",
      outline: "border-2 border-gray-200 bg-transparent hover:border-black hover:bg-black hover:text-white text-gray-900",
      ghost: "hover:bg-gray-100 text-gray-700 hover:text-black",
      danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
    };
    const sizes = {
      sm: "h-9 px-3 text-xs",
      md: "h-11 px-5 text-sm",
      lg: "h-14 px-8 text-base",
    };
    
    return (
      <button 
        ref={ref} 
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ''}`} 
        {...props} 
      />
    );
  }
);
Button.displayName = "Button";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
  <input
    ref={ref}
    className={`flex h-11 w-full rounded-lg border-2 border-gray-200 !bg-white !text-black px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:border-black focus-visible:ring-0 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${props.className || ''}`}
    {...props}
  />
));
Input.displayName = "Input";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline" | "sale";
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = "default", className }) => {
  const variants = {
    default: "bg-black text-white",
    secondary: "bg-gray-100 text-gray-800",
    destructive: "bg-red-600 text-white",
    sale: "bg-amber-100 text-amber-800 border border-amber-200",
    outline: "border border-gray-200 text-gray-600",
  };
  return (
    <div className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors ${variants[variant]} ${className || ''}`}>
      {children}
    </div>
  );
};

// --- LAZY IMAGE COMPONENT ---
const LazyImage = ({ src, alt, className, imgClassName, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { imgClassName?: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-gray-50 ${className || ''}`}>
      <div className={`absolute inset-0 bg-gray-200 animate-pulse transition-opacity duration-700 ${isLoaded ? 'opacity-0' : 'opacity-100'}`} />
      
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={`transition-all duration-700 ${imgClassName || ''} ${isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-sm'}`}
        onLoad={() => setIsLoaded(true)}
        {...props}
      />
    </div>
  );
};

// Wishlist Helper
const useWishlist = () => {
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('wishlist');
    if (saved) setWishlist(JSON.parse(saved));
  }, []);

  const toggleWishlist = (id: string) => {
    setWishlist(prev => {
      const newWishlist = prev.includes(id) 
        ? prev.filter(x => x !== id) 
        : [...prev, id];
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      return newWishlist;
    });
  };

  return { wishlist, toggleWishlist };
};

// Scroll To Top Component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Back To Top Button
const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button 
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-40 p-3 rounded-full bg-black text-white shadow-xl transition-all duration-300 transform hover:scale-110 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
      aria-label="Back to top"
    >
      <ArrowUp size={20} />
    </button>
  );
};

// --- 404 COMPONENT ---
const NotFoundPage = () => (
  <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center text-center px-4 bg-gray-50">
    <div className="mb-8 relative">
        <h1 className="text-9xl font-bold text-gray-200 select-none">404</h1>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-6xl animate-bounce">🤔</span>
        </div>
    </div>
    <h2 className="text-4xl font-serif font-bold mb-4 text-black">Page Not Found</h2>
    <p className="text-gray-500 mb-8 max-w-md text-lg leading-relaxed">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
    </p>
    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <Link to="/" className="w-full sm:w-auto">
            <Button size="lg" className="rounded-full px-8 w-full">Go Home</Button>
        </Link>
        <Link to="/products" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="rounded-full px-8 w-full border-2">Continue Shopping</Button>
        </Link>
    </div>
  </div>
);

// --- PRODUCT CARD ---
interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isWishlisted, onToggleWishlist }) => {
  const navigate = useNavigate();
  const { config } = useStore();

  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = `Hello CALICUT STORE, I would like to order: ${product.name} with price ₹${product.salePrice || product.price}`;
    window.open(`https://wa.me/${config.contact.whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/product/${product.id}`);
  };

  return (
    <div 
      className="group relative bg-white rounded-xl border border-gray-200 transition-all duration-300 hover:border-black hover:shadow-lg cursor-pointer flex flex-col h-full overflow-hidden"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-50 border-b border-gray-100">
        <LazyImage 
          src={product.imageUrl || `https://picsum.photos/400?random=${product.id}`} 
          alt={product.name}
          className="h-full w-full"
          imgClassName="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
           {product.discountPercent && product.discountPercent > 0 ? (
            <Badge variant="destructive" className="shadow-sm">
              -{product.discountPercent}%
            </Badge>
          ) : null}
          {product.featured && (
            <Badge variant="sale" className="shadow-sm bg-white/90 backdrop-blur">
              Featured
            </Badge>
          )}
        </div>
        
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleWishlist(product.id); }}
          className="absolute top-3 right-3 p-2.5 rounded-full bg-white/90 backdrop-blur shadow-sm hover:bg-white transition-all z-10 hover:scale-110 group-active:scale-95"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={18} className={`transition-colors ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-700"}`} />
        </button>
        
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm tracking-wide shadow-lg transform -rotate-6">OUT OF STOCK</span>
          </div>
        )}

        <button
           onClick={handleWhatsAppOrder}
           disabled={!product.stock}
           className="md:hidden absolute bottom-3 right-3 p-3 bg-black text-white rounded-full shadow-lg z-20 active:scale-90 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
           aria-label="Buy Now"
        >
          <ShoppingCart size={18} />
        </button>

        <div className="hidden md:flex flex-col absolute inset-x-4 bottom-4 gap-2 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20">
          <button 
            className="w-full bg-white !text-black font-bold py-3 rounded-lg shadow-lg border-2 border-transparent hover:border-black transition-all flex items-center justify-center gap-2" 
            onClick={handleViewDetails}
          >
            <Eye size={16} /> View Details
          </button>
          <button 
            className="w-full bg-black text-white font-bold py-3 rounded-lg shadow-lg border-2 border-black flex items-center justify-center gap-2 hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed" 
            onClick={handleWhatsAppOrder}
            disabled={!product.stock}
          >
            <ShoppingCart size={16} /> Buy Now
          </button>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 line-clamp-1">{product.category}</p>
        </div>
        
        <h3 className="font-serif font-bold text-lg leading-tight mb-2 line-clamp-2 group-hover:text-gray-700 transition-colors">{product.name}</h3>
        
        <div className="mt-auto pt-2 flex items-center justify-between">
          <div className="flex flex-col">
             {product.salePrice && (
              <span className="text-xs text-gray-400 line-through font-medium">₹{product.price}</span>
            )}
            <span className="text-lg font-bold text-black">₹{product.salePrice || product.price}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
            <ArrowRight size={16} />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- HEADER ---
const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const navigate = useNavigate();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const { config } = useStore();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim().length > 1) {
      const allProducts = getProducts();
      const filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) && p.active
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery("");
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (productId: string) => {
    navigate(`/product/${productId}`);
    setIsSearchOpen(false);
    setSearchQuery("");
    setSuggestions([]);
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${isScrolled ? 'bg-white/95 backdrop-blur-md border-gray-200 shadow-sm py-3' : 'bg-white border-transparent py-5'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex-shrink-0 z-50 relative" onClick={() => setIsMobileMenuOpen(false)}>
              <Logo />
            </Link>

            <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2 font-medium text-sm">
              {[
                { label: 'Home', path: '/' },
                { label: 'Shop All', path: '/products' },
                { label: 'Featured', path: '/products?featured=true' },
                { label: 'Wishlist', path: '/wishlist' },
                { label: 'Owner Panel', path: '/owner' }
              ].map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  className="relative py-1 text-gray-600 hover:text-black transition-colors group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2 md:gap-3">
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2.5 rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              <Link to="/wishlist" className="hidden md:flex p-2.5 rounded-full hover:bg-gray-100 text-gray-700 transition-colors">
                 <Heart size={20} />
              </Link>
              
              <Link to="/products" className="p-2.5 rounded-full hover:bg-gray-100 text-gray-700 transition-colors relative">
                <ShoppingBag size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </Link>
              
              <button 
                className="md:hidden p-2.5 rounded-full hover:bg-gray-100 text-black"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu size={24} />
              </button>
              
            </div>
          </div>
          
          <div className={`overflow-visible transition-all duration-300 ease-in-out ${isSearchOpen ? 'max-h-20 mt-4 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
            <div className="relative max-w-2xl mx-auto" ref={searchContainerRef}>
              <form onSubmit={handleSearchSubmit}>
                <Input 
                  autoFocus={isSearchOpen}
                  placeholder="What are you looking for?" 
                  className="w-full pl-12 pr-4 h-12 text-lg border-2 border-gray-200 focus:border-black rounded-xl shadow-inner !bg-white !text-black"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <Search className="absolute left-4 top-6 -translate-y-1/2 text-gray-400" size={20} />
                <button 
                  type="button" 
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-4 top-6 -translate-y-1/2 text-xs font-bold text-gray-500 hover:text-black uppercase tracking-wider"
                >
                  Close
                </button>
              </form>
              
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[60] animate-fade-in-down">
                  {suggestions.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => handleSuggestionClick(item.id)}
                      className="flex items-center gap-4 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        <LazyImage 
                          src={item.imageUrl || ''} 
                          alt={item.name} 
                          className="w-full h-full"
                          imgClassName="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500 font-medium">₹{item.salePrice || item.price}</p>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  ))}
                  <button 
                    onClick={handleSearchSubmit}
                    className="w-full py-3 text-xs font-bold text-center bg-gray-50 hover:bg-gray-100 transition-colors border-t border-gray-100"
                  >
                    VIEW ALL RESULTS
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Menu Drawer */}
      <div className={`fixed inset-y-0 right-0 z-[61] w-[300px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 flex justify-between items-center border-b border-gray-100">
          <span className="font-serif font-bold text-xl">Menu</span>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <nav className="flex flex-col gap-6 text-lg font-medium">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between group">
              Home <ArrowRight size={16} className="-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
            </Link>
            <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between group">
              Shop All <ArrowRight size={16} className="-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
            </Link>
             <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between group">
              Wishlist <ArrowRight size={16} className="-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
            </Link>
            <div className="h-px bg-gray-100 my-2"></div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Categories</p>
            {CATEGORIES.slice(0, 4).map(cat => (
              <Link 
                key={cat} 
                to={`/products?category=${encodeURIComponent(cat)}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-800 hover:text-black pl-2 border-l-2 border-transparent hover:border-black transition-colors"
              >
                {cat}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <Link to="/owner" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black mb-4">
            <Shield size={16} /> Owner Login
          </Link>
          <div className="flex gap-4">
             {config.contact.instagram && (
                <a href={config.contact.instagram} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:border-black hover:text-black transition-colors"><Instagram size={18} /></a>
             )}
             {config.contact.twitter && (
                <a href={config.contact.twitter} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:border-black hover:text-black transition-colors"><Twitter size={18} /></a>
             )}
          </div>
        </div>
      </div>
    </>
  );
};

const Footer = () => {
  const { config } = useStore();
  
  return (
    <footer className="bg-white text-gray-900 border-t border-gray-200">
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">Join our Newsletter</h2>
            <p className="text-gray-500 mb-8 text-lg">Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <div className="flex-grow relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <Input placeholder="Enter your email address" className="pl-12 h-12 rounded-full border-gray-300 !bg-white !text-black" />
              </div>
              <Button size="lg" className="rounded-full px-8 h-12 whitespace-nowrap">Subscribe</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          <div className="space-y-6">
            <Logo />
            <p className="text-gray-500 leading-relaxed text-sm">
              Premium quality products delivered directly to your doorstep. We prioritize customer satisfaction and authentic products.
            </p>
            <div className="flex items-center gap-2 text-sm font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Active Now on WhatsApp
            </div>
            <div className="flex gap-4 pt-4">
              {config.contact.instagram && (
                <a href={config.contact.instagram} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:border-black hover:text-black transition-all"><Instagram size={18} /></a>
              )}
              {config.contact.twitter && (
                <a href={config.contact.twitter} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:border-black hover:text-black transition-all"><Twitter size={18} /></a>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-6">Shop</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><Link to="/products" className="hover:text-black transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 bg-gray-300 rounded-full hover:bg-black"></span> All Products</Link></li>
              <li><Link to="/products?featured=true" className="hover:text-black transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 bg-gray-300 rounded-full hover:bg-black"></span> Featured</Link></li>
              <li><Link to="/products?category=Electronics" className="hover:text-black transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 bg-gray-300 rounded-full hover:bg-black"></span> Electronics</Link></li>
              <li><Link to="/products?category=Fashion" className="hover:text-black transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 bg-gray-300 rounded-full hover:bg-black"></span> Fashion</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-6">Support</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><Link to="/wishlist" className="hover:text-black transition-colors">My Wishlist</Link></li>
              <li><Link to="#" className="hover:text-black transition-colors">Order Tracking</Link></li>
              <li><Link to="#" className="hover:text-black transition-colors">Terms & Conditions</Link></li>
              <li><Link to="#" className="hover:text-black transition-colors">Privacy Policy</Link></li>
              <li><Link to="/owner" className="hover:text-black transition-colors">Owner Login</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-6">Contact</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li className="flex items-start gap-3">
                <Phone size={18} className="mt-0.5 text-black shrink-0" />
                <span>{config.contact.phone}<br/><span className="text-xs text-gray-400">Mon - Sat, 9am - 6pm</span></span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-black shrink-0" />
                {config.contact.email}
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 text-black shrink-0" />
                <span>{config.contact.address.split(',').map((line, i) => <span key={i} className="block">{line}</span>)}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 bg-gray-50">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Calicut Store. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-black">Privacy Policy</a>
            <a href="#" className="hover:text-black">Terms of Service</a>
            <a href="#" className="hover:text-black">Cookies Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- PAGES ---

// --- PAGE: HOME PAGE ---
const HomePage = ({ wishlist, toggleWishlist }: { wishlist: string[], toggleWishlist: (id: string) => void }) => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const { config } = useStore();
  
  useEffect(() => {
    const all = getProducts();
    setFeaturedProducts(all.filter(p => p.featured && p.active).slice(0, 4));
  }, []);

  return (
    <div className="min-h-screen">
      <SEO 
        title="CALICUT STORE | Premium Online Shopping" 
        description={config.heroSubtitle || "Discover exclusive premium products at Calicut Store."}
        url={window.location.href}
      />
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-36 overflow-hidden">
        <div className="absolute inset-0 bg-white">
          <div className="absolute top-0 right-0 w-[50%] h-full bg-gray-50"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 max-w-2xl animate-fade-in-up">
              <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm uppercase tracking-widest border-black text-black bg-transparent rounded-full">
                New Collection 2026
              </Badge>
              <h1 className="font-serif text-5xl md:text-7xl font-bold leading-[1.1] mb-8 text-black">
                {config.heroTitle} <br/>
                <span className="italic relative inline-block">
                  {config.heroHighlight}
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-yellow-400 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                     <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" opacity="0.6" />
                  </svg>
                </span>
              </h1>
              <p className="text-gray-600 text-lg md:text-xl mb-10 leading-relaxed max-w-lg">
                {config.heroSubtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/products">
                  <Button size="lg" className="rounded-full w-full sm:w-auto text-lg h-14 px-10">
                    Start Shopping
                  </Button>
                </Link>
                <Link to="/products?featured=true">
                  <Button variant="outline" size="lg" className="rounded-full w-full sm:w-auto text-lg h-14 px-10 border-2">
                    View Featured
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="flex-1 relative hidden lg:block h-[500px]">
               <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full relative z-10">
                 {config.heroImages.slice(0, 4).map((img, index) => (
                    <div 
                        key={index}
                        className="relative rounded-2xl overflow-hidden shadow-lg border-4 border-white transition-transform duration-300 hover:scale-[1.02]"
                    >
                        <LazyImage src={img} className="w-full h-full" imgClassName="w-full h-full object-cover" />
                    </div>
                 ))}
               </div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gray-100 rounded-full -z-0 blur-3xl opacity-60"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-gray-200 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200">
            {[
              { title: "Authentic Products", icon: CheckCircle2 },
              { title: "Premium Packaging", icon: Gift },
              { title: "Secure Checkout", icon: Shield },
              { title: "24/7 Support", icon: Phone }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center justify-center py-8 px-4 text-center group hover:bg-gray-50 transition-colors">
                <feature.icon className="text-gray-400 group-hover:text-black mb-3 transition-colors" size={28} />
                <h3 className="font-bold text-sm md:text-base">{feature.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-5xl font-bold mb-4">Shop by Category</h2>
            <div className="w-24 h-1 bg-black mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {CATEGORIES.slice(0, 6).map((cat, idx) => (
              <Link 
                key={idx} 
                to={`/products?category=${encodeURIComponent(cat)}`}
                className="group flex flex-col items-center p-8 bg-white rounded-xl border border-gray-200 hover:border-black hover:shadow-lg transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-black group-hover:text-white transition-colors duration-300">
                  <Package size={28} />
                </div>
                <h3 className="font-bold text-center group-hover:text-primary transition-colors text-sm">{cat}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <span className="text-gray-500 font-bold uppercase tracking-widest text-sm mb-2 block">Curated For You</span>
              <h2 className="font-serif text-3xl md:text-5xl font-bold">Featured Collection</h2>
            </div>
            <Link to="/products" className="group flex items-center gap-2 font-bold border-b-2 border-black pb-1 hover:text-gray-600 hover:border-gray-600 transition-colors">
              View All Products <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  isWishlisted={wishlist.includes(product.id)}
                  onToggleWishlist={toggleWishlist}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">No featured products available at the moment.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

// --- PAGE: PRODUCTS PAGE ---
const ProductsPage = ({ wishlist, toggleWishlist }: { wishlist: string[], toggleWishlist: (id: string) => void }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // URL Params
  const searchParams = new URLSearchParams(location.search);
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');
  const featuredParam = searchParams.get('featured');

  // Filter State
  const [category, setCategory] = useState(categoryParam || '');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [sort, setSort] = useState<SortOption>('newest');
  
  useEffect(() => {
    setProducts(getProducts());
  }, []);

  useEffect(() => {
    setCategory(categoryParam || '');
  }, [categoryParam]);

  useEffect(() => {
    let result = products.filter(p => p.active);

    // Search
    if (searchParam) {
      const q = searchParam.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }

    // Category
    if (category) {
      result = result.filter(p => p.category === category);
    }

    // Featured
    if (featuredParam === 'true') {
      result = result.filter(p => p.featured);
    }

    // Price
    result = result.filter(p => {
       const price = p.salePrice || p.price;
       return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort
    if (sort === 'price-low') {
      result.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
    } else if (sort === 'price-high') {
      result.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
    } else {
      result.sort((a, b) => b.createdAt - a.createdAt);
    }

    setFilteredProducts(result);
  }, [products, category, searchParam, featuredParam, priceRange, sort]);

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
       <SEO title="Shop All Products | CALICUT STORE" />
       <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
             <div>
                <h1 className="text-3xl font-serif font-bold">
                   {searchParam ? `Search: "${searchParam}"` : categoryParam ? categoryParam : featuredParam ? 'Featured Collection' : 'All Products'}
                </h1>
                <p className="text-gray-500 text-sm mt-1">{filteredProducts.length} items found</p>
             </div>
             
             <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none">
                  <select 
                    value={sort} 
                    onChange={(e) => setSort(e.target.value as SortOption)}
                    className="appearance-none w-full md:w-48 pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-black cursor-pointer"
                  >
                    <option value="newest">Newest Arrivals</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
                </div>
                
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`p-2.5 rounded-lg border transition-colors ${isFilterOpen ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-200 hover:border-black'}`}
                >
                  <Filter size={20} />
                </button>
             </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
             {/* Filters Sidebar */}
             <div className={`w-full lg:w-64 flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-300 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
                <div className="flex justify-between items-center mb-6 lg:hidden">
                   <span className="font-bold text-lg">Filters</span>
                   <button onClick={() => setIsFilterOpen(false)}><X size={20} /></button>
                </div>

                <div className="space-y-8">
                   <div>
                      <h3 className="font-bold text-sm mb-3 uppercase tracking-wider text-gray-500">Categories</h3>
                      <div className="space-y-2">
                         <button 
                            onClick={() => { setCategory(''); navigate('/products'); }} 
                            className={`block text-sm w-full text-left transition-colors ${!category ? 'font-bold text-black' : 'text-gray-600 hover:text-black'}`}
                         >
                            All Categories
                         </button>
                         {CATEGORIES.map(c => (
                            <button 
                               key={c}
                               onClick={() => { setCategory(c); navigate(`/products?category=${encodeURIComponent(c)}`); }} 
                               className={`block text-sm w-full text-left transition-colors ${category === c ? 'font-bold text-black' : 'text-gray-600 hover:text-black'}`}
                            >
                               {c}
                            </button>
                         ))}
                      </div>
                   </div>

                   <div>
                      <h3 className="font-bold text-sm mb-3 uppercase tracking-wider text-gray-500">Price Range</h3>
                      <div className="flex items-center gap-2 text-sm">
                         <Input 
                           type="number" 
                           placeholder="Min" 
                           value={priceRange[0] === 0 ? '' : priceRange[0]} 
                           onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])} 
                           className="w-full"
                         />
                         <span className="text-gray-400">-</span>
                         <Input 
                           type="number" 
                           placeholder="Max" 
                           value={priceRange[1] === 100000 ? '' : priceRange[1]} 
                           onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])} 
                           className="w-full"
                         />
                      </div>
                   </div>
                   
                   <Button 
                     variant="outline" 
                     className="w-full" 
                     onClick={() => { setCategory(''); setPriceRange([0, 100000]); setSort('newest'); navigate('/products'); }}
                   >
                     Reset Filters
                   </Button>
                </div>
             </div>

             {/* Product Grid */}
             <div className="flex-1 w-full">
                {filteredProducts.length > 0 ? (
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredProducts.map(product => (
                         <ProductCard 
                           key={product.id} 
                           product={product} 
                           isWishlisted={wishlist.includes(product.id)} 
                           onToggleWishlist={toggleWishlist} 
                         />
                      ))}
                   </div>
                ) : (
                   <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                         <Search size={24} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">No products found</h3>
                      <p className="text-gray-500">Try changing your filters or search terms.</p>
                      <Button variant="outline" className="mt-4" onClick={() => { setCategory(''); setPriceRange([0, 100000]); navigate('/products'); }}>
                         Clear All Filters
                      </Button>
                   </div>
                )}
             </div>
          </div>
       </div>
    </div>
  );
};

// --- PAGE: PRODUCT DETAIL PAGE ---
const ProductDetailPage = ({ wishlist, toggleWishlist }: { wishlist: string[], toggleWishlist: (id: string) => void }) => {
   const { id } = useParams();
   const navigate = useNavigate();
   const [product, setProduct] = useState<Product | undefined>();
   const [selectedImage, setSelectedImage] = useState<string>('');
   const [selectedVariantId, setSelectedVariantId] = useState<string>('');
   const { config } = useStore();
   
   useEffect(() => {
     if (id) {
       const p = getProductById(id);
       if (p) {
         setProduct(p);
         setSelectedImage(p.imageUrl || '');
         if (p.variants && p.variants.length > 0) {
            setSelectedVariantId(p.variants[0].id);
         }
       }
     }
   }, [id]);
   
   if (!product) {
      return (
         <div className="min-h-screen pt-32 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4"></div>
            <p>Loading product...</p>
         </div>
      );
   }

   const activeVariant = product.variants?.find(v => v.id === selectedVariantId);
   const currentPrice = activeVariant ? activeVariant.price : (product.salePrice || product.price);
   const currentStock = activeVariant ? activeVariant.stock : product.stock;
   const displayImages = [product.imageUrl, ...(product.images || [])].filter(Boolean) as string[];

   const handleWhatsAppOrder = () => {
      const variantText = activeVariant ? ` (Variant: ${activeVariant.name})` : '';
      const text = `Hello! I would like to purchase: ${product.name}${variantText}. Price: ₹${currentPrice}.`;
      window.open(`https://wa.me/${config.contact.whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
   };

   return (
      <div className="min-h-screen pt-24 pb-12 bg-white">
         <SEO title={`${product.name} | CALICUT STORE`} description={product.description} image={product.imageUrl} />
         
         <div className="container mx-auto px-4">
            <div className="mb-8 flex items-center gap-2 text-sm text-gray-500">
               <Link to="/" className="hover:text-black">Home</Link>
               <ChevronRight size={14} />
               <Link to="/products" className="hover:text-black">Products</Link>
               <ChevronRight size={14} />
               <span className="text-black font-medium truncate max-w-[200px]">{product.name}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
               {/* Image Gallery */}
               <div className="space-y-4">
                  <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 relative group">
                     <LazyImage 
                        src={selectedImage} 
                        alt={product.name} 
                        className="w-full h-full" 
                        imgClassName="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-zoom-in" 
                     />
                     <button 
                        onClick={() => toggleWishlist(product.id)}
                        className="absolute top-4 right-4 p-3 rounded-full bg-white shadow-md hover:scale-110 transition-transform z-10"
                     >
                        <Heart size={20} className={wishlist.includes(product.id) ? "fill-red-500 text-red-500" : "text-gray-600"} />
                     </button>
                  </div>
                  {displayImages.length > 1 && (
                     <div className="grid grid-cols-4 gap-4">
                        {displayImages.map((img, idx) => (
                           <div 
                              key={idx} 
                              className={`aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${selectedImage === img ? 'border-black opacity-100' : 'border-transparent opacity-70 hover:opacity-100'}`}
                              onClick={() => setSelectedImage(img)}
                           >
                              <LazyImage src={img} className="w-full h-full" imgClassName="w-full h-full object-cover" />
                           </div>
                        ))}
                     </div>
                  )}
               </div>

               {/* Product Info */}
               <div>
                  <div className="mb-6">
                     <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2 text-gray-900">{product.name}</h1>
                     <div className="flex items-center gap-4 mb-4">
                        <span className="text-2xl font-bold">₹{currentPrice}</span>
                        {product.salePrice && !activeVariant && (
                           <span className="text-lg text-gray-400 line-through">₹{product.price}</span>
                        )}
                        {product.discountPercent && product.discountPercent > 0 && !activeVariant && (
                           <Badge variant="destructive">-{product.discountPercent}% OFF</Badge>
                        )}
                     </div>
                     <p className="text-gray-600 leading-relaxed">{product.description}</p>
                  </div>

                  {product.variants && product.variants.length > 0 && (
                     <div className="mb-8">
                        <h3 className="font-bold text-sm mb-3">Select Option</h3>
                        <div className="flex flex-wrap gap-3">
                           {product.variants.map(v => (
                              <button
                                 key={v.id}
                                 onClick={() => { setSelectedVariantId(v.id); if(v.image) setSelectedImage(v.image); }}
                                 className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${selectedVariantId === v.id ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'}`}
                              >
                                 {v.name}
                              </button>
                           ))}
                        </div>
                     </div>
                  )}

                  <div className="space-y-4 pt-6 border-t border-gray-100">
                     <Button 
                        size="lg" 
                        className="w-full h-14 text-lg gap-2"
                        onClick={handleWhatsAppOrder}
                        disabled={currentStock <= 0}
                     >
                        {currentStock > 0 ? (
                           <><ShoppingCart size={20} /> Buy Now (WhatsApp)</>
                        ) : (
                           'Out of Stock'
                        )}
                     </Button>
                     <p className="text-xs text-center text-gray-500 flex items-center justify-center gap-1">
                        <Shield size={12} /> Secure transaction via WhatsApp
                     </p>
                  </div>

                  <div className="mt-8 grid grid-cols-2 gap-4">
                     <div className="p-4 bg-gray-50 rounded-xl">
                        <Truck className="text-black mb-2" size={20} />
                        <h4 className="font-bold text-sm">Fast Delivery</h4>
                        <p className="text-xs text-gray-500">All over India</p>
                     </div>
                     <div className="p-4 bg-gray-50 rounded-xl">
                        <CheckCircle2 className="text-black mb-2" size={20} />
                        <h4 className="font-bold text-sm">Genuine Product</h4>
                        <p className="text-xs text-gray-500">100% Authentic</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

// --- PAGE: WISHLIST PAGE ---
const WishlistPage = ({ wishlist, toggleWishlist }: { wishlist: string[], toggleWishlist: (id: string) => void }) => {
   const [products, setProducts] = useState<Product[]>([]);

   useEffect(() => {
      const all = getProducts();
      setProducts(all.filter(p => wishlist.includes(p.id)));
   }, [wishlist]);

   return (
      <div className="min-h-screen pt-24 pb-12 bg-white">
         <SEO title="My Wishlist | CALICUT STORE" />
         <div className="container mx-auto px-4">
            <h1 className="font-serif text-3xl font-bold mb-8">My Wishlist</h1>
            
            {products.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {products.map(product => (
                     <ProductCard 
                        key={product.id} 
                        product={product} 
                        isWishlisted={true} 
                        onToggleWishlist={toggleWishlist} 
                     />
                  ))}
               </div>
            ) : (
               <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 shadow-sm">
                     <Heart size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Your wishlist is empty</h3>
                  <p className="text-gray-500 mb-6">Start saving your favorite items to build your collection.</p>
                  <Link to="/products">
                     <Button>Browse Products</Button>
                  </Link>
               </div>
            )}
         </div>
      </div>
   );
};

// --- PAGE: OWNER PANEL ---
const OwnerPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [secretCode, setSecretCode] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [view, setView] = useState<'list' | 'create' | 'edit' | 'settings'>('list');
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [error, setError] = useState('');
  const { config, refreshConfig } = useStore();
  const [storeConfig, setStoreConfigState] = useState<StoreConfig>(config);

  const [tempImageUrl, setTempImageUrl] = useState('');
  const [tempVariant, setTempVariant] = useState<Partial<ProductVariant>>({});

  useEffect(() => {
    if (checkAuth()) {
      setIsAuthenticated(true);
      refreshProducts();
    }
  }, []);

  const refreshProducts = () => {
    setProducts(getProducts());
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginOwner(secretCode)) {
      setIsAuthenticated(true);
      refreshProducts();
      setError('');
    } else {
      setError('Invalid Secret Code');
    }
  };

  const handleLogout = () => {
    logoutOwner();
    setIsAuthenticated(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const p = currentProduct as Product;
    if (!p.name || !p.price) {
      alert("Name and Price are required");
      return;
    }
    const toSave: Product = {
      ...p,
      id: p.id || crypto.randomUUID(),
      stock: Number(p.stock) || 0,
      price: Number(p.price) || 0,
      salePrice: p.salePrice ? Number(p.salePrice) : undefined,
      createdAt: p.createdAt || Date.now(),
      images: p.images || [],
      variants: p.variants || []
    };
    saveProduct(toSave);
    refreshProducts();
    setView('list');
  };

  const handleConfigSave = (e: React.FormEvent) => {
      e.preventDefault();
      saveStoreConfig(storeConfig);
      refreshConfig();
      alert('Store settings saved successfully!');
      setView('list');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this product?')) {
      // 1. Immediately update UI to remove the item (optimistic update)
      setProducts(prev => prev.filter(p => String(p.id) !== String(id)));
      // 2. Update storage in background
      deleteProduct(id);
    }
  };

  const addImage = () => {
      if(tempImageUrl) {
          const newImages = [...(currentProduct.images || []), tempImageUrl];
          setCurrentProduct({...currentProduct, images: newImages});
          setTempImageUrl('');
      }
  };

  const removeImage = (index: number) => {
      const newImages = [...(currentProduct.images || [])];
      newImages.splice(index, 1);
      setCurrentProduct({...currentProduct, images: newImages});
  };

  const addVariant = () => {
      if(tempVariant.name && tempVariant.price) {
          const newVariant: ProductVariant = {
              id: crypto.randomUUID(),
              name: tempVariant.name,
              price: Number(tempVariant.price),
              stock: Number(tempVariant.stock || 0),
              image: tempVariant.image
          };
          const newVariants = [...(currentProduct.variants || []), newVariant];
          setCurrentProduct({...currentProduct, variants: newVariants});
          setTempVariant({});
      }
  };

  const removeVariant = (id: string) => {
      const newVariants = (currentProduct.variants || []).filter(v => v.id !== id);
      setCurrentProduct({...currentProduct, variants: newVariants});
  };

  const updateVariant = (id: string, field: keyof ProductVariant, value: any) => {
    const newVariants = (currentProduct.variants || []).map(v => {
        if (v.id === id) {
            return { ...v, [field]: value };
        }
        return v;
    });
    setCurrentProduct({...currentProduct, variants: newVariants});
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20 px-4">
        <SEO title="Owner Login | CALICUT STORE" noindex={true} />
        <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-bold mb-2">Owner Access</h2>
            <p className="text-gray-500">Please enter your secret code to continue</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Input 
                type="password" 
                value={secretCode} 
                onChange={(e) => setSecretCode(e.target.value)} 
                placeholder="Enter secret code..."
                className="text-center text-lg tracking-widest h-14 !bg-white !text-black"
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</p>}
            <Button type="submit" size="lg" className="w-full h-14 text-base">Access Panel</Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50">
      <SEO title="Dashboard | Owner Panel" noindex={true} />
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-serif font-bold">Dashboard</h1>
          <div className="flex gap-4 w-full md:w-auto">
            <Button variant="outline" onClick={handleLogout} className="flex-1 md:flex-none"><LogOut size={16} className="mr-2" /> Logout</Button>
            {view === 'list' && (
             <>
               <Button onClick={() => setView('settings')} className="flex-1 md:flex-none" variant="secondary">
                 <Settings size={16} className="mr-2" /> Settings
               </Button>
               <Button onClick={() => { setCurrentProduct({ active: true, featured: false, category: 'Electronics', images: [], variants: [] }); setView('create'); }} className="flex-1 md:flex-none">
                <Plus size={16} className="mr-2" /> Add Product
               </Button>
             </>
            )}
            {view !== 'list' && (
              <Button variant="secondary" onClick={() => setView('list')} className="flex-1 md:flex-none">Cancel</Button>
            )}
          </div>
        </div>

        {view === 'settings' && (
             <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-8 font-serif">Store Settings</h2>
                <form onSubmit={handleConfigSave} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                             <label className="text-sm font-bold text-gray-700">Hero Headline (Top)</label>
                             <Input 
                                value={storeConfig.heroTitle} 
                                onChange={e => setStoreConfigState({...storeConfig, heroTitle: e.target.value})}
                                required
                             />
                        </div>
                        <div className="space-y-2">
                             <label className="text-sm font-bold text-gray-700">Hero Highlight (Bottom)</label>
                             <Input 
                                value={storeConfig.heroHighlight} 
                                onChange={e => setStoreConfigState({...storeConfig, heroHighlight: e.target.value})}
                                required
                             />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                             <label className="text-sm font-bold text-gray-700">Hero Subtitle</label>
                             <Input 
                                value={storeConfig.heroSubtitle} 
                                onChange={e => setStoreConfigState({...storeConfig, heroSubtitle: e.target.value})}
                                required
                             />
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <h3 className="font-bold text-gray-700 flex justify-between">
                            Homepage Grid Images
                            <span className="text-xs text-gray-400 font-normal">Recommended Size: 600x800px (Portrait)</span>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {storeConfig.heroImages.map((url, idx) => (
                                <div key={idx} className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500">Image {idx + 1}</label>
                                    <Input 
                                        value={url}
                                        onChange={e => {
                                            const newImages = [...storeConfig.heroImages];
                                            newImages[idx] = e.target.value;
                                            setStoreConfigState({...storeConfig, heroImages: newImages});
                                        }}
                                        placeholder="Image URL"
                                    />
                                    {url && (
                                        <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                            <LazyImage src={url} className="w-full h-full" imgClassName="w-full h-full object-cover" alt="Preview" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <h3 className="font-bold text-gray-700">Contact & Social</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                 <label className="text-sm font-bold text-gray-700">Display Phone</label>
                                 <Input 
                                    value={storeConfig.contact.phone}
                                    onChange={e => setStoreConfigState({...storeConfig, contact: {...storeConfig.contact, phone: e.target.value}})}
                                 />
                             </div>
                             <div className="space-y-2">
                                 <label className="text-sm font-bold text-gray-700">WhatsApp Number (e.g. 919846750898)</label>
                                 <Input 
                                    value={storeConfig.contact.whatsapp}
                                    onChange={e => setStoreConfigState({...storeConfig, contact: {...storeConfig.contact, whatsapp: e.target.value}})}
                                 />
                             </div>
                             <div className="space-y-2">
                                 <label className="text-sm font-bold text-gray-700">Email Address</label>
                                 <Input 
                                    value={storeConfig.contact.email}
                                    onChange={e => setStoreConfigState({...storeConfig, contact: {...storeConfig.contact, email: e.target.value}})}
                                 />
                             </div>
                             <div className="space-y-2">
                                 <label className="text-sm font-bold text-gray-700">Instagram Link</label>
                                 <Input 
                                    value={storeConfig.contact.instagram}
                                    onChange={e => setStoreConfigState({...storeConfig, contact: {...storeConfig.contact, instagram: e.target.value}})}
                                 />
                             </div>
                             <div className="space-y-2">
                                 <label className="text-sm font-bold text-gray-700">Twitter Link</label>
                                 <Input 
                                    value={storeConfig.contact.twitter}
                                    onChange={e => setStoreConfigState({...storeConfig, contact: {...storeConfig.contact, twitter: e.target.value}})}
                                 />
                             </div>
                              <div className="space-y-2">
                                 <label className="text-sm font-bold text-gray-700">Address</label>
                                 <Input 
                                    value={storeConfig.contact.address}
                                    onChange={e => setStoreConfigState({...storeConfig, contact: {...storeConfig.contact, address: e.target.value}})}
                                 />
                             </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button type="submit" size="lg">Save Settings</Button>
                    </div>
                </form>
             </div>
        )}

        {view === 'list' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left border-b border-gray-200">
                  <tr>
                    <th className="p-5 font-bold text-gray-600 uppercase text-xs tracking-wider">Product</th>
                    <th className="p-5 font-bold text-gray-600 uppercase text-xs tracking-wider">Price</th>
                    <th className="p-5 font-bold text-gray-600 uppercase text-xs tracking-wider">Stock</th>
                    <th className="p-5 font-bold text-gray-600 uppercase text-xs tracking-wider">Category</th>
                    <th className="p-5 font-bold text-gray-600 uppercase text-xs tracking-wider">Status</th>
                    <th className="p-5 font-bold text-gray-600 uppercase text-xs tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-md bg-gray-100 overflow-hidden flex-shrink-0">
                                <LazyImage src={p.imageUrl || ''} className="w-full h-full" imgClassName="w-full h-full object-cover" />
                            </div>
                            <div>
                                <div className="font-bold text-base">{p.name}</div>
                                {p.featured && <span className="inline-block mt-1 text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded border border-yellow-200 uppercase font-bold tracking-wide">Featured</span>}
                                {p.variants && p.variants.length > 0 && <span className="inline-block ml-2 text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded uppercase font-bold tracking-wide">{p.variants.length} Variants</span>}
                            </div>
                        </div>
                      </td>
                      <td className="p-5 font-medium">₹{p.salePrice || p.price}</td>
                      <td className="p-5">
                        <span className={`font-bold ${p.stock < 10 ? 'text-red-500' : 'text-gray-700'}`}>{p.stock}</span>
                      </td>
                      <td className="p-5 text-gray-500">{p.category}</td>
                      <td className="p-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${p.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {p.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-5 text-right space-x-2">
                        <div className="flex justify-end gap-2">
                          <button 
                            className="h-8 w-8 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 flex items-center justify-center transition-colors"
                            onClick={() => { setCurrentProduct(p); setView('edit'); }}
                            title="Edit Product"
                          >
                            <Edit size={14} className="pointer-events-none" />
                          </button>
                          <button 
                            type="button"
                            className="h-8 w-8 rounded-full border border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-300 flex items-center justify-center transition-colors"
                            onClick={(e) => handleDelete(p.id, e)}
                            title="Delete Product"
                          >
                            <Trash2 size={14} className="pointer-events-none" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-10 text-center text-gray-400">No products found. Add your first product to get started!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(view === 'create' || view === 'edit') && (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 font-serif">{view === 'create' ? 'Create New Product' : 'Edit Product'}</h2>
            <form onSubmit={handleSave} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Product Name</label>
                  <Input 
                    value={currentProduct.name || ''} 
                    onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})} 
                    required 
                    placeholder="e.g. Premium Leather Wallet"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Category</label>
                  <div className="relative">
                    <select 
                      value={currentProduct.category || 'Electronics'} 
                      onChange={e => setCurrentProduct({...currentProduct, category: e.target.value})}
                      className="w-full h-11 pl-4 pr-10 rounded-lg border-2 border-gray-200 bg-white text-black text-sm font-medium focus:border-black focus:outline-none appearance-none cursor-pointer"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
                  </div>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-gray-700">Description</label>
                  <textarea 
                    value={currentProduct.description || ''} 
                    onChange={e => setCurrentProduct({...currentProduct, description: e.target.value})} 
                    className="w-full min-h-[120px] rounded-lg border-2 border-gray-200 p-4 text-sm focus:border-black focus:outline-none transition-colors bg-white text-black resize-y"
                    placeholder="Describe your product..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Price (₹)</label>
                  <Input 
                    type="number" 
                    value={currentProduct.price || ''} 
                    onChange={e => setCurrentProduct({...currentProduct, price: Number(e.target.value)})} 
                    required 
                    min="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Sale Price (Optional)</label>
                  <Input 
                    type="number" 
                    value={currentProduct.salePrice || ''} 
                    onChange={e => setCurrentProduct({...currentProduct, salePrice: e.target.value ? Number(e.target.value) : undefined})} 
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Stock Quantity</label>
                  <Input 
                    type="number" 
                    value={currentProduct.stock || ''} 
                    onChange={e => setCurrentProduct({...currentProduct, stock: Number(e.target.value)})} 
                    required 
                    min="0"
                  />
                </div>

                <div className="flex flex-col gap-4 justify-end">
                   <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={currentProduct.active !== false} 
                      onChange={e => setCurrentProduct({...currentProduct, active: e.target.checked})} 
                      className="w-5 h-5 text-black rounded focus:ring-black border-gray-300"
                    />
                    <span className="font-medium">Active (Visible in store)</span>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={currentProduct.featured || false} 
                      onChange={e => setCurrentProduct({...currentProduct, featured: e.target.checked})} 
                      className="w-5 h-5 text-black rounded focus:ring-black border-gray-300"
                    />
                    <span className="font-medium">Featured (Highlighted on homepage)</span>
                  </label>
                </div>
              </div>

              {/* Images Section */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="font-bold text-gray-700">Product Images</h3>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Main Image URL</label>
                    <Input 
                        value={currentProduct.imageUrl || ''} 
                        onChange={e => setCurrentProduct({...currentProduct, imageUrl: e.target.value})} 
                        placeholder="https://..."
                    />
                    {currentProduct.imageUrl && (
                        <div className="mt-2 w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                             <LazyImage src={currentProduct.imageUrl} className="w-full h-full" imgClassName="w-full h-full object-cover" />
                        </div>
                    )}
                </div>
                
                <div className="flex gap-2">
                   <Input 
                      value={tempImageUrl} 
                      onChange={e => setTempImageUrl(e.target.value)} 
                      placeholder="Add Image URL..."
                      className="flex-1"
                   />
                   <Button type="button" onClick={addImage} variant="secondary">Add</Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(currentProduct.images || []).map((img, idx) => (
                    <div key={idx} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                      <LazyImage src={img} alt="" className="w-full h-full" imgClassName="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {(!currentProduct.images || currentProduct.images.length === 0) && (
                      <div className="text-gray-400 text-sm flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg aspect-square">
                          No additional images
                      </div>
                  )}
                </div>
              </div>

              {/* Variants Section */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="font-bold text-gray-700">Variants</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end bg-gray-50 p-4 rounded-lg">
                   <div className="md:col-span-1">
                      <label className="text-xs font-bold text-gray-500 mb-1 block">Name</label>
                      <Input value={tempVariant.name || ''} onChange={e => setTempVariant({...tempVariant, name: e.target.value})} placeholder="e.g. Size L" />
                   </div>
                   <div className="md:col-span-1">
                      <label className="text-xs font-bold text-gray-500 mb-1 block">Price</label>
                      <Input type="number" value={tempVariant.price || ''} onChange={e => setTempVariant({...tempVariant, price: Number(e.target.value)})} placeholder="Price" />
                   </div>
                   <div className="md:col-span-1">
                      <label className="text-xs font-bold text-gray-500 mb-1 block">Stock</label>
                      <Input type="number" value={tempVariant.stock || ''} onChange={e => setTempVariant({...tempVariant, stock: Number(e.target.value)})} placeholder="Stock" />
                   </div>
                   <div className="md:col-span-1">
                      <Button type="button" onClick={addVariant} className="w-full">Add Variant</Button>
                   </div>
                </div>

                <div className="space-y-2">
                    {(currentProduct.variants || []).map((v) => (
                        <div key={v.id} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg bg-white">
                            <div className="flex-1 grid grid-cols-3 gap-4">
                                <div>
                                    <span className="text-xs text-gray-400 block">Name</span>
                                    <span className="font-bold text-sm">{v.name}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-400 block">Price</span>
                                    <span className="font-bold text-sm">₹{v.price}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-400 block">Stock</span>
                                    <span className="font-bold text-sm">{v.stock}</span>
                                </div>
                            </div>
                            <button type="button" onClick={() => removeVariant(v.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={16} /></button>
                        </div>
                    ))}
                    {(!currentProduct.variants || currentProduct.variants.length === 0) && (
                        <div className="text-center text-gray-400 text-sm py-4">No variants added.</div>
                    )}
                </div>
              </div>

              <div className="pt-8 flex justify-end gap-4 border-t border-gray-200">
                <Button type="button" variant="secondary" onClick={() => setView('list')} size="lg">Cancel</Button>
                <Button type="submit" size="lg">Save Product</Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

const App = () => {
  const { wishlist, toggleWishlist } = useWishlist();
  const [config, setConfig] = useState<StoreConfig>(getStoreConfig());

  useEffect(() => {
    initStore();
  }, []);

  const refreshConfig = () => {
      setConfig(getStoreConfig());
  };

  return (
    <StoreContext.Provider value={{ config, refreshConfig }}>
      <Router>
        <ScrollToTop />
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
            <Route path="/products" element={<ProductsPage wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
            <Route path="/product/:id" element={<ProductDetailPage wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
            <Route path="/wishlist" element={<WishlistPage wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
            <Route path="/owner" element={<OwnerPanel />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
        <BackToTopButton />
      </Router>
    </StoreContext.Provider>
  );
};

export default App;