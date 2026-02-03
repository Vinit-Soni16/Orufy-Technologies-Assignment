import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


// --- Icons ---
function SearchIcon() {
  return (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}
function HomeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}
function ProductsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
}
function GridPlusIcon() {
  return (
    <svg className="w-20 h-20 text-[#1A2B6D]" viewBox="0 0 80 80" fill="none">
      <rect x="8" y="8" width="28" height="28" rx="4" stroke="currentColor" strokeWidth="2" fill="none" />
      <rect x="44" y="8" width="28" height="28" rx="4" stroke="currentColor" strokeWidth="2" fill="none" />
      <rect x="8" y="44" width="28" height="28" rx="4" stroke="currentColor" strokeWidth="2" fill="none" />
      <rect x="44" y="44" width="28" height="28" rx="4" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M58 66V58M54 62H62" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function ChevronDownIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg className="w-5 h-5 text-gray-500 hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}
function CheckCircleIcon() {
  return (
     <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

// --- Components ---

const ProductModal = ({ isOpen, onClose, onSubmit, initialData = null, title, submitLabel }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    stock: '',
    mrp: '',
    sellingPrice: '',
    brand: '',
    eligibility: 'Yes',
    images: [] // Array of base64 strings
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        type: '',
        stock: '',
        mrp: '',
        sellingPrice: '',
        brand: '',
        eligibility: 'Yes',
        images: []
      });
    }
  }, [initialData, isOpen]);

  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
         setFormData(prev => ({ ...prev, images: [...prev.images, reader.result] }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (index) => {
     setFormData(prev => ({
       ...prev,
       images: prev.images.filter((_, i) => i !== index)
     }));
  }

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  if (!isOpen) return null;

  return (
    // Preserved user's edit: removed bg-black
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <CloseIcon />
          </button>
        </div>

        <form className="p-6 space-y-5" onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Product Name</label>
            <input name="name" value={formData.name} onChange={handleChange} required type="text" placeholder="e.g. CakeZone Walnut Brownie" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3F51B5] focus:border-[#3F51B5] outline-none transition-all placeholder-gray-400" />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Product Type</label>
            <div className="relative">
              <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3F51B5] focus:border-[#3F51B5] outline-none appearance-none bg-white text-gray-700">
                <option value="" disabled>Select product type</option>
                <option value="Food">Food</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothes">Clothes</option>
                <option value="Beauty Products">Beauty Products</option>
                <option value="Others">Others</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"><ChevronDownIcon /></div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Quantity Stock</label>
            <input name="stock" value={formData.stock} onChange={handleChange} required type="number" placeholder="200" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3F51B5] focus:border-[#3F51B5] outline-none transition-all placeholder-gray-400" />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">MRP</label>
            <input name="mrp" value={formData.mrp} onChange={handleChange} required type="number" placeholder="2000" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3F51B5] focus:border-[#3F51B5] outline-none transition-all placeholder-gray-400" />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Selling Price</label>
            <input name="sellingPrice" value={formData.sellingPrice} onChange={handleChange} required type="number" placeholder="1500" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3F51B5] focus:border-[#3F51B5] outline-none transition-all placeholder-gray-400" />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Brand Name</label>
            <input name="brand" value={formData.brand} onChange={handleChange} required type="text" placeholder="e.g. CakeZone" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3F51B5] focus:border-[#3F51B5] outline-none transition-all placeholder-gray-400" />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Upload Product Images</label>
            <div 
              className="border-2 border-dashed border-gray-200 rounded-lg h-24 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-[#3F51B5] transition-all group"
              onClick={triggerFileSelect}
            >
              <p className="text-gray-400 text-sm group-hover:text-[#3F51B5]">Enter Description</p>
              <p className="text-gray-800 font-semibold mt-1 group-hover:text-[#3F51B5]">Browse</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
            </div>
            {/* Image Previews */}
            {formData.images.length > 0 && (
               <div className="flex gap-2 mt-2 overflow-x-auto">
                 {formData.images.map((img, idx) => (
                   <div key={idx} className="relative w-16 h-16 flex-shrink-0 border rounded overflow-hidden">
                     <img src={img} alt="preview" className="w-full h-full object-cover" />
                     <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveImage(idx); }} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-lg">
                       <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                     </button>
                   </div>
                 ))}
               </div>
            )}
            {initialData && <p className="text-xs text-right text-gray-500">Add More Photos</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Exchange or return eligibility</label>
            <div className="relative">
              <select name="eligibility" value={formData.eligibility} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3F51B5] focus:border-[#3F51B5] outline-none appearance-none bg-white text-gray-700">
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"><ChevronDownIcon /></div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-8 py-2.5 bg-[#1F2690] text-white font-medium rounded-lg hover:bg-[#1A2178] transition-colors shadow-sm"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProductCard = ({ product, onEdit, onDelete, onTogglePublish }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Image Carousel Placeholder logic */}
      <div className="relative aspect-[4/3] mb-3 bg-gray-50 rounded-lg overflow-hidden group border border-gray-50">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain mix-blend-multiply p-4" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">No Image</div>
        )}
        {/* Dots */}
        {(product.images?.length > 0 || !product.images) && (
           <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
             <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
           </div>
        )}
      </div>
      
      <h3 className="font-bold text-gray-900 text-sm md:text-base mb-3 leading-tight truncate" title={product.name}>{product.name}</h3>
      
      {/* Details Grid */}
      <div className="space-y-1.5 mb-4">
        <div className="flex justify-between items-baseline gap-2">
          <span className="text-gray-400 text-xs font-medium whitespace-nowrap">Product type -</span>
          <span className="text-gray-600 text-xs font-medium text-right truncate">{product.type || 'Food'}</span>
        </div>
        <div className="flex justify-between items-baseline gap-2">
          <span className="text-gray-400 text-xs font-medium whitespace-nowrap">Quantity Stock -</span>
          <span className="text-gray-700 text-xs font-bold text-right truncate">{product.stock}</span>
        </div>
        <div className="flex justify-between items-baseline gap-2">
          <span className="text-gray-400 text-xs font-medium whitespace-nowrap">MRP-</span>
          <span className="text-gray-700 text-xs font-bold text-right truncate">₹ {product.mrp}</span>
        </div>
         <div className="flex justify-between items-baseline gap-2">
          <span className="text-gray-400 text-xs font-medium whitespace-nowrap">Selling Price -</span>
          <span className="text-gray-700 text-xs font-bold text-right truncate">₹ {product.sellingPrice}</span>
        </div>
        <div className="flex justify-between items-baseline gap-2">
          <span className="text-gray-400 text-xs font-medium whitespace-nowrap">Brand Name -</span>
          <span className="text-gray-700 text-xs font-bold text-right truncate">{product.brand}</span>
        </div>
         <div className="flex justify-between items-baseline gap-2">
          <span className="text-gray-400 text-xs font-medium whitespace-nowrap">Images -</span>
          <span className="text-gray-700 text-xs font-bold text-right truncate">{product.images?.length || 0}</span>
        </div>
        <div className="flex justify-between items-baseline gap-2">
          <span className="text-gray-400 text-xs font-medium whitespace-nowrap">Eligibility -</span>
          <span className="text-gray-700 text-xs font-bold uppercase text-right truncate">{product.eligibility}</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-2">
        <button 
          onClick={() => onTogglePublish(product.id)}
          className={`flex-1 py-1.5 rounded-lg font-medium text-xs transition-colors shadow-sm truncate px-1 ${
            product.published 
              ? 'bg-[#4CAF50] hover:bg-[#43a047] text-white' 
              : 'bg-[#1F2690] hover:bg-[#1a2178] text-white'
          }`}
        >
          {product.published ? 'Unpublish' : 'Publish'} 
        </button>
        <button 
          onClick={() => onEdit(product)}
          className="flex-1 py-1.5 border border-gray-200 rounded-lg font-medium text-xs text-gray-700 hover:bg-gray-50 bg-white truncate px-1"
        >
          Edit
        </button>
        <button 
          onClick={() => onDelete(product.id)}
          className="w-8 h-8 flex-shrink-0 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-100 group flex items-center justify-center bg-white"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [view, setView] = useState('home'); // 'home' | 'products'
  const [activeTab, setActiveTab] = useState('published'); // 'published' | 'unpublished'
  const [search, setSearch] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Products Data: Initialized from LocalStorage or Empty array (no dummy data)
  const [products, setProducts] = useState(() => {
    const savedProducts = localStorage.getItem('products');
    return savedProducts ? JSON.parse(savedProducts) : [];
  });

  // Save to LocalStorage whenever products change
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);
  
  // Toast
  const [toast, setToast] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setUserDropdownOpen(false);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateProduct = (data) => {
    const newProduct = {
      id: Date.now(),
      ...data,
      published: true // Default to published
    };
    setProducts(prev => [newProduct, ...prev]);
    setIsAddModalOpen(false);
    showToast("Product added Successfully");
    setView('products'); // Go to products view
  };

  const handleUpdateProduct = (data) => {
    setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...data } : p));
    setEditingProduct(null);
    showToast("Product updated Successfully");
  };

  const handleDeleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast("Product Deleted Successfully");
  };

  const handleTogglePublish = (id) => {
    const updatedProducts = products.map(p => {
       if (p.id === id) {
          const newStatus = !p.published;
          return { ...p, published: newStatus };
       }
       return p;
    });
    setProducts(updatedProducts);
  };

  // Filter products for Home View (Tabbed)
  const homeFilteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === 'published' ? p.published : !p.published;
    return matchesSearch && matchesTab;
  });

  // Products for Products View (All or Master List)
  const allProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen flex bg-white font-sans text-gray-900">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white border border-gray-200 shadow-lg rounded-xl px-4 py-3 flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
           <div className="bg-green-500 p-1 rounded-full text-white"><CheckCircleIcon /></div>
           <span className="text-gray-800 font-medium text-sm">{toast}</span>
           <button onClick={() => setToast(null)} className="ml-2 text-gray-400 hover:text-gray-600"><CloseIcon /></button>
        </div>
      )}

      {/* Sidebar - responsive: hidden on small screens, toggleable */}
      {/* Backdrop for mobile when sidebar is open */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`bg-[#20232A] flex flex-col flex-shrink-0 z-40 w-64 
        fixed inset-y-0 left-0 h-full transform transition-transform duration-200
        md:sticky md:top-0 md:h-screen md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-4">
           {/* Preserved user's edit: logo Image only */}
           <Link to="/dashboard" className="flex items-center gap-2 mb-8 mt-2">
            <img src="Images/Frame 4-1.WebP" alt="Productr" className="h-6 w-auto object-contain" />
           </Link>
          
          <div className="flex items-center gap-2 rounded-lg bg-[#2d323e] px-3 py-2.5 mb-6 border border-transparent focus-within:border-gray-500 transition-colors">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-gray-200 placeholder-gray-500 w-full text-sm"
            />
          </div>
          
          <nav className="space-y-1">
            <button
              onClick={() => setView('home')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                 view === 'home' ? 'bg-[#2d323e] text-white' : 'text-gray-400 hover:bg-[#2d323e] hover:text-white'
              }`}
            >
              <HomeIcon />
              <span className="font-medium">Home</span>
            </button>
            <button
              onClick={() => setView('products')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                 view === 'products' ? 'bg-[#2d323e] text-white' : 'text-gray-400 hover:bg-[#2d323e] hover:text-white'
              }`}
            >
              <ProductsIcon />
              <span className="font-medium">Products</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 px-4 md:px-8 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-2">
             {/* Mobile menu toggle */}
             <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 mr-2 rounded-lg hover:bg-gray-100 transition-colors">
               <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
             </button>
             {view === 'products' ? (
                <>
                  <ProductsIcon /> 
                  <span className="text-gray-900 font-medium">Products</span>
                </>
             ) : (
                <>
                  <HomeIcon />
                  <span className="text-gray-900 font-medium">Home</span>
                </>
             )}
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex bg-gray-50 rounded-lg px-3 py-2 items-center w-64">
                <SearchIcon />
                <input 
                  type="text" 
                  placeholder="Search Services, Products" 
                  className="bg-transparent border-none outline-none text-sm ml-2 w-full"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
             </div>
             <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200">
                     <span className="text-indigo-600 font-bold text-sm">A</span>
                  </div>
                  <ChevronDownIcon />
                </button>
                {userDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserDropdownOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 py-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-20">
                      <div className="px-4 py-3 border-b border-gray-50">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user?.email}</p>
                        <p className="text-xs text-gray-500 mt-0.5">User</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                )}
             </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 md:p-8 bg-white overflow-y-auto">
          {view === 'home' ? (
            // --- HOME VIEW ---
            <>
              <div className="flex flex-col mb-6">
                {/* Tabs */}
                 <div className="flex gap-8 border-b border-gray-200">
                    <button
                      onClick={() => setActiveTab('published')}
                      className={`pb-3 text-sm font-medium border-b-2 transition-all ${
                        activeTab === 'published'
                          ? 'border-[#1A2B6D] text-[#1A2B6D]'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Published
                    </button>
                    <button
                      onClick={() => setActiveTab('unpublished')}
                      className={`pb-3 text-sm font-medium border-b-2 transition-all ${
                        activeTab === 'unpublished'
                          ? 'border-[#1A2B6D] text-[#1A2B6D]'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Unpublished
                    </button>
                 </div>
              </div>

              {/* Grid or Empty State */}
              {homeFilteredProducts.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 animate-in fade-in duration-500">
                    {homeFilteredProducts.map(product => (
                       <ProductCard 
                         key={product.id} 
                         product={product} 
                         onEdit={setEditingProduct}
                         onDelete={handleDeleteProduct}
                         onTogglePublish={handleTogglePublish}
                       />
                    ))}
                 </div>
              ) : (
                 <div className="flex flex-col items-center justify-center py-20 px-4 animate-in fade-in duration-500">
                    <GridPlusIcon />
                    {activeTab === 'published' ? (
                      <>
                        <h2 className="mt-6 text-xl font-bold text-gray-900">No Published Products</h2>
                        <p className="mt-2 text-gray-500 text-center max-w-sm">
                          Your Published Products will appear here
                        </p>
                        <button
                          onClick={() => { setView('products'); setIsAddModalOpen(true); }}
                          className="mt-4 text-[#3F51B5] font-semibold hover:underline hover:text-[#303f9f] transition-colors"
                        >
                          Create your first product to publish
                        </button>
                      </>
                    ) : (
                      <>
                        <h2 className="mt-6 text-xl font-bold text-gray-900">Feels a little empty over here...</h2>
                        <p className="mt-2 text-gray-500 text-center max-w-sm">
                          You can create products without connecting store
                        </p>
                        <p className="text-gray-500 text-center max-w-sm">you can add products to store anytime</p>
                        <button 
                          onClick={() => { setView('products'); setIsAddModalOpen(true); }}
                          className="mt-8 px-8 py-3 bg-[#1F2690] text-white font-semibold rounded-lg hover:bg-[#1A2178] hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                        >
                          Add your Products
                        </button>
                      </>
                    )}
                 </div>
              )}
            </>
          ) : (
            // --- PRODUCTS VIEW ---
            <>
               <div className="flex justify-between items-center mb-8">
                   <h1 className="text-xl font-semibold text-gray-800">Products</h1>
                   <button 
                     onClick={() => setIsAddModalOpen(true)}
                     className="flex items-center gap-1.5 px-4 py-2 text-gray-500 font-medium hover:text-[#1F2690] transition-colors"
                   >
                     <span className="text-2xl text-[#1F2690] font-light leading-none">+</span> 
                     <span className="text-[#1F2690]">Add Products</span>
                   </button>
               </div>
               
               {/* Master Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 animate-in fade-in duration-500">
                  {allProducts.map(product => (
                      <ProductCard 
                        key={product.id} 
                        product={product} 
                        onEdit={setEditingProduct}
                        onDelete={handleDeleteProduct}
                        onTogglePublish={handleTogglePublish}
                      />
                  ))}
               </div>
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <ProductModal 
         isOpen={isAddModalOpen} 
         onClose={() => setIsAddModalOpen(false)} 
         onSubmit={handleCreateProduct}
         title="Add Product"
         submitLabel="Create"
      />
      
      <ProductModal
         isOpen={!!editingProduct}
         onClose={() => setEditingProduct(null)}
         onSubmit={handleUpdateProduct}
         initialData={editingProduct}
         title="Edit Product"
         submitLabel="Update"
      />
    </div>
  );
};

export default Dashboard;
