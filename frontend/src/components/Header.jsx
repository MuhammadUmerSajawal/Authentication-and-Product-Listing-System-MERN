import React from 'react';
import { HiBars3, HiMagnifyingGlass, HiShoppingBag, HiChevronDown, HiArrowRightOnRectangle } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';

const Header = ({ searchTerm, onSearchChange, onSearchSubmit, loggedInUser, loggedInEmail, handleLogout }) => {
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = React.useState(false);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [openDropdown, setOpenDropdown] = React.useState(null); // 'categories' | 'newProduct' | null
    const [allProducts, setAllProducts] = React.useState([]);
    const [filteredResults, setFilteredResults] = React.useState([]);
    const [showResults, setShowResults] = React.useState(false);

    React.useEffect(() => {
        const fetchAllProducts = async () => {
            try {
                const response = await fetch('http://localhost:8080/products');
                const result = await response.json();
                if (result.success) {
                    setAllProducts(result.data);
                }
            } catch (err) {
                console.error("Error fetching products for search:", err);
            }
        };
        fetchAllProducts();
    }, []);

    const categories = React.useMemo(() => {
        const unique = new Set();
        return allProducts
            .map(p => p.category?.trim())
            .filter(cat => {
                if (!cat) return false;
                const lower = cat.toLowerCase();
                if (unique.has(lower)) return false;
                unique.add(lower);
                return true;
            });
    }, [allProducts]);

    const newProducts = React.useMemo(() => {
        return [...allProducts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);
    }, [allProducts]);

    React.useEffect(() => {
        if (!searchTerm || searchTerm.trim() === '') {
            setFilteredResults([]);
            setShowResults(false);
            return;
        }

        const query = searchTerm.toLowerCase();
        const results = allProducts.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.category?.toLowerCase().includes(query)
        ).slice(0, 6);

        setFilteredResults(results);
        setShowResults(results.length > 0);
    }, [searchTerm, allProducts]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (onSearchSubmit) {
            onSearchSubmit(searchTerm);
        } else if (filteredResults.length > 0) {
            navigate(`/productpage/${filteredResults[0]._id}`);
            setShowResults(false);
        }
    };

    const getImageUrl = (product) => {
        const image = product.images?.[0];
        if (!image) return '/main.png';
        if (image.startsWith('http') || image.startsWith('/static')) return image;
        if (image.startsWith('/uploads')) return `http://localhost:8080${image}`;
        return image;
    };

    const toggleDropdown = (name) => {
        setOpenDropdown(openDropdown === name ? null : name);
    };

    return (
        <header className="w-full bg-white px-4 py-3 sm:px-6 lg:px-8 border-b border-gray-100 sticky top-0 z-50">
            <div className="mx-auto max-w-[1600px]">
                {/* Top Row */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 hover:bg-gray-100 rounded-full transition lg:hidden"
                        >
                            <HiBars3 size={24} className="text-gray-700" />
                        </button>
                        <button className="hidden lg:flex p-2 hover:bg-gray-100 rounded-full transition">
                            <HiBars3 size={24} className="text-gray-700" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1f1f1f] text-white font-bold text-xl">
                            N
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-[#1f1f1f]">Nextgen</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-600 mr-4">
                            <button className="hover:text-black transition">About</button>
                            <button className="hover:text-black transition">FAQs</button>
                        </nav>

                        <div className="flex items-center gap-3">
                            <button className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-100 bg-white shadow-sm hover:shadow-md transition">
                                <HiShoppingBag size={20} className="text-gray-700" />
                            </button>

                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-100 bg-white shadow-sm hover:shadow-md transition overflow-hidden"
                                >
                                    <span className="flex h-full w-full items-center justify-center bg-gray-100 text-sm font-bold text-gray-700">
                                        {loggedInUser?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 z-[110] mt-3 w-56 rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl animate-in fade-in slide-in-from-top-5 duration-200">
                                        <div className="px-4 py-3 border-b border-gray-50 mb-1">
                                            <p className="text-sm font-bold text-gray-900 truncate">{loggedInUser || 'User'}</p>
                                            <p className="text-xs font-medium text-gray-500 truncate">{loggedInEmail || 'Logged in'}</p>
                                        </div>
                                        <button
                                            type="button"
                                            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-semibold text-gray-600 transition hover:bg-red-50 hover:text-red-500"
                                            onClick={() => {
                                                handleLogout && handleLogout();
                                                setIsProfileOpen(false);
                                            }}
                                        >
                                            <HiArrowRightOnRectangle size={18} />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 py-2 relative">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative group">
                            <div
                                onClick={() => toggleDropdown('categories')}
                                className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold cursor-pointer transition-all border ${openDropdown === 'categories' ? 'bg-[#1f1f1f] text-white border-[#1f1f1f]' : 'bg-gray-50/80 text-gray-500 border-transparent hover:bg-gray-100'}`}
                            >
                                <span>Categories</span>
                                <HiChevronDown size={14} className={`transition-transform duration-300 ${openDropdown === 'categories' ? 'rotate-180' : ''}`} />
                            </div>

                            {openDropdown === 'categories' && (
                                <div className="absolute left-0 top-full z-[100] mt-3 w-64 rounded-3xl border border-gray-100 bg-white p-3 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="grid gap-1">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => {
                                                    onSearchChange && onSearchChange(cat);
                                                    setOpenDropdown(null);
                                                }}
                                                className="flex items-center justify-between rounded-2xl px-5 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50 hover:text-[#1f1f1f]"
                                            >
                                                {cat}
                                                <div className="h-1.5 w-1.5 rounded-full bg-gray-200" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative group">
                            <div
                                onClick={() => toggleDropdown('newProduct')}
                                className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold cursor-pointer transition-all border ${openDropdown === 'newProduct' ? 'bg-[#1f1f1f] text-white border-[#1f1f1f]' : 'bg-gray-50/80 text-gray-500 border-transparent hover:bg-gray-100'}`}
                            >
                                <span>New Product</span>
                                <HiChevronDown size={14} className={`transition-transform duration-300 ${openDropdown === 'newProduct' ? 'rotate-180' : ''}`} />
                            </div>

                            {openDropdown === 'newProduct' && (
                                <div className="absolute left-0 top-full z-[100] mt-3 w-[340px] rounded-3xl border border-gray-100 bg-white p-3 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
                                    <p className="mb-3 px-4 pt-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Recently Added</p>
                                    <div className="space-y-1">
                                        {newProducts.map((product) => (
                                            <div
                                                key={product._id}
                                                onClick={() => {
                                                    navigate(`/productpage/${product._id}`);
                                                    setOpenDropdown(null);
                                                }}
                                                className="flex items-center gap-3 rounded-2xl p-2.5 cursor-pointer hover:bg-gray-50 transition-all group/item"
                                            >
                                                <div className="h-12 w-12 overflow-hidden rounded-xl bg-gray-100">
                                                    <img src={getImageUrl(product)} alt={product.name} className="h-full w-full object-cover group-hover/item:scale-110 transition-transform" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-gray-800 truncate">{product.name}</p>
                                                    <p className="text-[11px] font-bold text-gray-400">${product.price}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="relative flex-1 max-w-2xl lg:mx-8">
                        <form onSubmit={handleSearchSubmit}>
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchTerm || ''}
                                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                                onFocus={() => searchTerm && setShowResults(true)}
                                className="w-full rounded-full bg-gray-50/80 py-3 pl-6 pr-14 text-sm font-medium outline-none focus:bg-white focus:ring-4 focus:ring-gray-100/50 transition-all border border-transparent focus:border-gray-200"
                            />
                            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-[#1f1f1f] text-white shadow-lg shadow-black/10 hover:scale-105 active:scale-95 transition-all">
                                <HiMagnifyingGlass size={18} />
                            </button>
                        </form>

                        {/* Search Results Dropdown */}
                        {showResults && (
                            <div className="absolute left-0 right-0 top-full z-[120] mt-4 overflow-hidden rounded-[24px] border border-gray-100 bg-white p-3 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
                                <p className="mb-3 px-4 pt-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Search Results</p>
                                <div className="space-y-1">
                                    {filteredResults.map((product) => (
                                        <div
                                            key={product._id}
                                            onClick={() => {
                                                navigate(`/productpage/${product._id}`);
                                                setShowResults(false);
                                                onSearchChange && onSearchChange('');
                                            }}
                                            className="flex items-center gap-4 rounded-2xl p-3 cursor-pointer hover:bg-gray-50 transition-colors group"
                                        >
                                            <div className="h-14 w-14 overflow-hidden rounded-xl bg-gray-100 group-hover:scale-105 transition-transform">
                                                <img src={getImageUrl(product)} alt={product.name} className="h-full w-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-800 truncate">{product.name}</p>
                                                <p className="text-xs font-medium text-gray-400">{product.category}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-[#1f1f1f]">${product.price}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {['Men', 'Women', 'Children', 'Brands'].map((item) => (
                            <button
                                key={item}
                                onClick={() => onSearchChange && onSearchChange(item)}
                                className={`rounded-full border px-7 py-2.5 text-sm font-bold transition-all shadow-sm hover:shadow-md active:scale-95 ${searchTerm === item
                                        ? 'bg-[#1f1f1f] text-white border-[#1f1f1f]'
                                        : 'bg-white text-[#1f1f1f] border-gray-100 hover:bg-gray-50'
                                    }`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md lg:hidden animate-in fade-in duration-300">
                        <div
                            className="fixed inset-0"
                            onClick={() => setIsMenuOpen(false)}
                        />
                        <div className="relative h-full w-[80%] max-w-[300px] bg-white p-8 shadow-2xl animate-in slide-in-from-left duration-500">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1f1f1f] text-white font-bold text-xl">
                                        N
                                    </div>
                                    <span className="text-2xl font-bold tracking-tight text-[#1f1f1f]">Nextgen</span>
                                </div>
                                <button onClick={() => setIsMenuOpen(false)} className="text-gray-400 hover:text-black transition">✕</button>
                            </div>

                            <nav className="space-y-6">
                                {['Home', 'About', 'FAQs', 'Categories', 'New Products', 'Brands'].map((item) => (
                                    <button
                                        key={item}
                                        className="block w-full text-left text-lg font-bold text-gray-800 hover:text-[#1f1f1f] transition"
                                    >
                                        {item}
                                    </button>
                                ))}
                            </nav>

                            <div className="absolute bottom-8 left-8 right-8">
                                <button
                                    onClick={handleLogout}
                                    className="w-full rounded-2xl bg-red-50 py-4 text-sm font-bold text-red-500 hover:bg-red-100 transition"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
