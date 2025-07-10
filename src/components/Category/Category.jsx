"use client";

import No_image from "/src/assets/No_IMG.jpg";
import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  ArrowLeft,
  Info,
  Package,
  ShoppingBag,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  Eye,
} from "lucide-react";
import axios from "axios";
import "./category.css";
import MainContent from "../MainContend";
import { API_URL } from "../../utils";

const Category = () => {
  // Categories state
  const [categories, setCategories] = useState([]);

  // Subcategories state
  const [subcategories, setSubcategories] = useState([]);

  // Selected category state
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Selected subcategory state
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  // Subcategory details state
  const [subcategoryDetails, setSubcategoryDetails] = useState(null);

  // Subcategory products state
  const [subcategoryProducts, setSubcategoryProducts] = useState([]);

  // Category products state
  const [categoryProducts, setCategoryProducts] = useState([]);

  // Loading states
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingCategoryProducts, setIsLoadingCategoryProducts] =
    useState(false);

  // Modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCategoryProductsModalOpen, setIsCategoryProductsModalOpen] =
    useState(false);
  const [isProductDetailModalOpen, setIsProductDetailModalOpen] =
    useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form states
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [subcategoryDescription, setSubcategoryDescription] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [formError, setFormError] = useState("");
  const [statusMessage, setStatusMessage] = useState({
    show: false,
    text: "",
    type: "success",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshData, setRefreshData] = useState(0);

  // Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [searchSubcategory, setSearchSubcategory] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(6);
  const [totalPages, setTotalPages] = useState(1);

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Add these state variables after the other state declarations
  const [categoryDetails, setCategoryDetails] = useState(null);
  const [isLoadingCategoryDetails, setIsLoadingCategoryDetails] =
    useState(false);

  const apiBaseUrl = `${API_URL}/categories`;
  const productApiBaseUrl = `${API_URL}/product`;

  // Check authentication on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        // Redirect to login if no token is found
        window.location.href = "/login";
        return;
      }

      try {
        // First check if we have cached user data from signup
        const cachedUser = localStorage.getItem("user");
        if (cachedUser) {
          const userData = JSON.parse(cachedUser);
          // Use cached data temporarily while we fetch the latest
          setUser(userData);
        }

        // Fetch latest user information from API
        const response = await fetch(`${API_URL}/user-info/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
          setIsAuthenticated(true);
        } else {
          // If token is invalid, redirect to login
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsAuthenticated(false);
      }
    };

    fetchUserData();
  }, []);

  // Create axios instance with authentication headers
  const getAuthAxios = () => {
    const token = localStorage.getItem("token");
    return axios.create({
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    });
  };

  // Fetch categories and subcategories on component mount or when refreshData changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const authAxios = getAuthAxios();

        // The API send just 10 items by default, so we set a high page size to fetch all categories and subcategories
        // Alternatively, you can just remove the page size parameter in the backend to get all items
        const pageSize = 1000000;

        // Fetch categories
        const response = await authAxios.get(
          `${apiBaseUrl}/categories/?page_size=${pageSize}`,
        );
        console.log("Categories fetched successfully:", response.data.results);
        setCategories(response.data.results || []);

        // Fetch subcategories
        try {
          const subResponse = await authAxios.get(
            `${apiBaseUrl}/subcategories/?page_size=${pageSize}`,
          );
          console.log("Subcategories fetched successfully:", subResponse.data);
          setSubcategories(subResponse.data.results || []);
        } catch (subError) {
          console.error("Error fetching subcategories:", subError);

          // Check if error is due to authentication
          if (subError.response && subError.response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
            return;
          }

          setSubcategories([]);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching categories:", error);

        // Check if error is due to authentication
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return;
        }

        setCategories([]);
        setSubcategories([]);
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    } else if (localStorage.getItem("token")) {
      // If we have a token but haven't confirmed authentication yet, wait
      // The authentication check in the first useEffect will handle this
    } else {
      // No token, redirect to login
      window.location.href = "/login";
    }
  }, [refreshData, isAuthenticated]);

  // Fetch subcategory details when a subcategory is selected
  const fetchSubcategoryDetails = async (subcategoryId) => {
    if (!subcategoryId) return;

    setIsLoadingDetails(true);
    try {
      const authAxios = getAuthAxios();
      const response = await authAxios.get(
        `${apiBaseUrl}/${subcategoryId}/subcategory/detail/`,
      );
      console.log("Subcategory details fetched successfully:", response.data);
      setSubcategoryDetails(response.data);
      setIsLoadingDetails(false);
    } catch (error) {
      console.error("Error fetching subcategory details:", error);

      // Check if error is due to authentication
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return;
      }

      setSubcategoryDetails(null);
      setIsLoadingDetails(false);
    }
  };

  // Fetch products for a subcategory
  const fetchSubcategoryProducts = async (subcategoryId) => {
    if (!subcategoryId) return;

    setIsLoadingProducts(true);
    try {
      const authAxios = getAuthAxios();
      const response = await authAxios.get(`${apiBaseUrl}/sub/products/`, {
        params: { subcategory_id: subcategoryId },
      });
      console.log("Subcategory products fetched successfully:", response.data);
      setSubcategoryProducts(response.data.results || []);

      // Calculate total pages for pagination
      const total = response.data.results ? response.data.results.length : 0;
      setTotalPages(Math.ceil(total / productsPerPage));
      setCurrentPage(1); // Reset to first page when fetching new products

      setIsLoadingProducts(false);
    } catch (error) {
      console.error("Error fetching subcategory products:", error);

      // Check if error is due to authentication
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return;
      }

      setSubcategoryProducts([]);
      setTotalPages(1);
      setIsLoadingProducts(false);
    }
  };

  // Fetch products for a category
  const fetchCategoryProducts = async (categoryId) => {
    if (!categoryId) return;

    setIsLoadingCategoryProducts(true);
    try {
      const authAxios = getAuthAxios();

      // First try the categories API endpoint
      const response = await authAxios.get(`${apiBaseUrl}/products/`, {
        params: { category_id: categoryId },
      });
      console.log("Category products fetched successfully:", response.data);
      setCategoryProducts(response.data.results || []);

      // Calculate total pages for pagination
      const total = response.data.results ? response.data.results.length : 0;
      setTotalPages(Math.ceil(total / productsPerPage));
      setCurrentPage(1); // Reset to first page when fetching new products
    } catch (error) {
      console.error("Error fetching category products:", error);

      // Check if error is due to authentication
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return;
      }

      // Fallback to fetching from product API if category API fails
      try {
        const authAxios = getAuthAxios();
        const productResponse = await authAxios.get(
          `${productApiBaseUrl}/products/by-category/${categoryId}/`,
        );
        console.log("Products fetched by category:", productResponse.data);
        setCategoryProducts(productResponse.data.results || []);

        // Calculate total pages for pagination
        const total = productResponse.data.results
          ? productResponse.data.results.length
          : 0;
        setTotalPages(Math.ceil(total / productsPerPage));
        setCurrentPage(1); // Reset to first page when fetching new products
      } catch (productError) {
        console.error("Error fetching from product API:", productError);

        // Check if error is due to authentication
        if (productError.response && productError.response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return;
        }

        setCategoryProducts([]);
        setTotalPages(1);
      }
    } finally {
      setIsLoadingCategoryProducts(false);
    }
  };

  // Fetch product details
  const fetchProductDetails = async (productId) => {
    if (!productId) return;

    try {
      const authAxios = getAuthAxios();
      const response = await authAxios.get(`${productApiBaseUrl}/detail/`, {
        params: { product_id: productId },
      });
      console.log("Product details fetched successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching product details:", error);

      // Check if error is due to authentication
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return null;
      }

      return null;
    }
  };

  // Fetch category details
  const fetchCategoryDetails = async (categoryId) => {
    if (!categoryId) return;

    setIsLoadingCategoryDetails(true);
    try {
      const authAxios = getAuthAxios();
      const response = await authAxios.get(
        `${apiBaseUrl}/${categoryId}/category/detail/`,
      );
      console.log("Category details fetched successfully:", response.data);
      setCategoryDetails(response.data);
      setIsLoadingCategoryDetails(false);
    } catch (error) {
      console.error("Error fetching category details:", error);

      // Check if error is due to authentication
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return;
      }

      setCategoryDetails(null);
      setIsLoadingCategoryDetails(false);
    }
  };

  // Handle subcategory selection
  const handleSubcategorySelect = (subcategory) => {
    setSelectedSubcategory(subcategory);
    fetchSubcategoryDetails(subcategory.id);
    fetchSubcategoryProducts(subcategory.id);
    setIsDetailsModalOpen(true);
  };

  // Handle viewing category products
  const handleViewCategoryProducts = () => {
    if (selectedCategory) {
      fetchCategoryProducts(selectedCategory.id);
      setIsCategoryProductsModalOpen(true);
    }
  };

  // Handle product selection for details view
  const handleProductSelect = async (product) => {
    setIsLoading(true);
    const productDetails = await fetchProductDetails(product.id);
    setSelectedProduct(productDetails || product);
    setIsProductDetailModalOpen(true);
    setIsLoading(false);
  };

  // Function to show status messages
  const showStatusMessage = (text, type = "success") => {
    setStatusMessage({ show: true, text, type });

    // Auto-hide the message after 3 seconds
    setTimeout(() => {
      setStatusMessage({ show: false, text: "", type: "success" });
    }, 3000);
  };

  // Category modal functions
  const openCategoryModal = (category = null) => {
    setIsCategoryModalOpen(true);
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
      setCategoryDescription(category.description);
    } else {
      setEditingCategory(null);
      setCategoryName("");
      setCategoryDescription("");
    }
    setFormError("");
  };

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setCategoryName("");
    setCategoryDescription("");
    setEditingCategory(null);
    setFormError("");
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedSubcategory(null);
    setSubcategoryDetails(null);
    setSubcategoryProducts([]);
  };

  const closeCategoryProductsModal = () => {
    setIsCategoryProductsModalOpen(false);
    setCategoryProducts([]);
  };

  const closeProductDetailModal = () => {
    setIsProductDetailModalOpen(false);
    setSelectedProduct(null);
  };

  const addOrUpdateCategory = async () => {
    if (!categoryName.trim()) {
      setFormError("Category name is required");
      return;
    }

    if (!categoryDescription.trim()) {
      setFormError("Category description is required");
      return;
    }

    const isDuplicate = categories.some(
      (cat) =>
        cat.name &&
        cat.name.toLowerCase() === categoryName.toLowerCase() &&
        cat.id !== editingCategory?.id,
    );

    if (isDuplicate) {
      setFormError("Category name must be unique!");
      return;
    }

    try {
      const authAxios = getAuthAxios();

      if (editingCategory) {
        // Update existing category via API
        const categoryData = {
          name: categoryName,
          description: categoryDescription,
        };

        await authAxios.put(
          `${apiBaseUrl}/${editingCategory.id}/category/update/`,
          categoryData,
        );

        console.log("Category updated successfully");

        // Refresh categories from API
        setRefreshData((prev) => prev + 1);
        showStatusMessage("Category updated successfully!");
      } else {
        // Create a new category via API
        const categoryData = {
          name: categoryName,
          description: categoryDescription,
        };

        const response = await authAxios.post(
          `${apiBaseUrl}/category/create/`,
          categoryData,
        );

        console.log("Category created successfully:", response.data);

        // Refresh categories from API
        setRefreshData((prev) => prev + 1);
        showStatusMessage("Category created successfully!");
      }
      closeCategoryModal();
    } catch (error) {
      console.error("Error creating/updating category:", error);

      // Check if error is due to authentication
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return;
      }

      setFormError(
        error.response?.data?.message ||
          "Failed to process category. Please try again.",
      );
    }
  };

  const deleteCategory = async (id) => {
    // Check if category has subcategories
    const hasSubcategories = subcategories.some(
      (sub) => sub.category_id === id,
    );

    if (hasSubcategories) {
      alert(
        "Cannot delete category that has subcategories. Please delete the subcategories first.",
      );
      return;
    }

    // Check if category has products
    try {
      const authAxios = getAuthAxios();
      const response = await authAxios.get(`${productApiBaseUrl}/products/`);
      const hasProducts = response.data.results.some(
        (product) => product.category_id === id,
      );

      if (hasProducts) {
        alert(
          "Cannot delete category that has products. Please remove or reassign the products first.",
        );
        return;
      }
    } catch (error) {
      console.error("Error checking for products:", error);

      // Check if error is due to authentication
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return;
      }
    }

    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        const authAxios = getAuthAxios();
        // Delete category via API
        await authAxios.delete(`${apiBaseUrl}/${id}/category/delete/`);

        // Update local state
        setCategories(categories.filter((cat) => cat.id !== id));
        setSelectedCategory(null); // Reset selected category if it was deleted
        showStatusMessage("Category deleted successfully!", "warning");
      } catch (error) {
        console.error("Error deleting category:", error);

        // Check if error is due to authentication
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return;
        }

        showStatusMessage(
          "Failed to delete category. Please try again.",
          "error",
        );
      }
    }
  };

  // Subcategory modal functions
  const openSubcategoryModal = (categoryId, subcategory = null) => {
    setIsSubcategoryModalOpen(true);

    if (subcategory) {
      setEditingSubcategory(subcategory);
      setSubcategoryName(subcategory.name);
      setSubcategoryDescription(subcategory.description);
    } else {
      setEditingSubcategory(null);
      setSubcategoryName("");
      setSubcategoryDescription("");
    }
    setFormError("");
  };

  const closeSubcategoryModal = () => {
    setIsSubcategoryModalOpen(false);
    setSubcategoryName("");
    setSubcategoryDescription("");
    setEditingSubcategory(null);
    setFormError("");
  };

  const addOrUpdateSubcategory = async () => {
    if (!subcategoryName.trim()) {
      setFormError("Subcategory name is required");
      return;
    }

    if (!subcategoryDescription.trim()) {
      setFormError("Subcategory description is required");
      return;
    }

    const isDuplicate = subcategories.some(
      (sub) =>
        sub.name &&
        sub.name.toLowerCase() === subcategoryName.toLowerCase() &&
        sub.category_id === selectedCategory.id &&
        sub.id !== editingSubcategory?.id,
    );

    if (isDuplicate) {
      setFormError(
        "A subcategory with this name already exists in this category!",
      );
      return;
    }

    try {
      const authAxios = getAuthAxios();

      if (editingSubcategory) {
        // Update existing subcategory via API
        const subcategoryData = {
          name: subcategoryName,
          description: subcategoryDescription,
          category_id: selectedCategory.id,
        };

        const response = await authAxios.put(
          `${apiBaseUrl}/${editingSubcategory.id}/subcategory/update/`,
          subcategoryData,
        );

        console.log("Subcategory updated successfully:", response.data);

        // Update the subcategory in local state
        const updatedSubcategory = response.data;
        setSubcategories(
          subcategories.map((sub) =>
            sub.id === editingSubcategory.id ? updatedSubcategory : sub,
          ),
        );

        showStatusMessage("Subcategory updated successfully!");
      } else {
        // Create a new subcategory via API
        const subcategoryData = {
          name: subcategoryName,
          description: subcategoryDescription,
          category_id: selectedCategory.id,
        };

        const response = await authAxios.post(
          `${apiBaseUrl}/subcategory/create/`,
          subcategoryData,
        );

        console.log("Subcategory created successfully:", response.data);

        // Add the new subcategory to the local state
        const newSubcategory = response.data;
        setSubcategories([...subcategories, newSubcategory]);

        showStatusMessage("Subcategory created successfully!");
      }
      closeSubcategoryModal();
    } catch (error) {
      console.error("Error creating/updating subcategory:", error);

      // Check if error is due to authentication
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return;
      }

      setFormError(
        error.response?.data?.message ||
          "Failed to process subcategory. Please try again.",
      );
    }
  };

  const deleteSubcategory = async (id) => {
    // Check if subcategory has products
    try {
      const authAxios = getAuthAxios();
      const response = await authAxios.get(`${productApiBaseUrl}/products/`);
      const hasProducts = response.data.results.some(
        (product) => product.subcategory_id === id,
      );

      if (hasProducts) {
        alert(
          "Cannot delete subcategory that has products. Please remove or reassign the products first.",
        );
        return;
      }
    } catch (error) {
      console.error("Error checking for products:", error);

      // Check if error is due to authentication
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return;
      }
    }

    if (window.confirm("Are you sure you want to delete this subcategory?")) {
      try {
        const authAxios = getAuthAxios();
        // Delete subcategory via API
        await authAxios.delete(`${apiBaseUrl}/${id}/subcategory/delete/`);

        // Update local state
        setSubcategories(subcategories.filter((sub) => sub.id !== id));
        showStatusMessage("Subcategory deleted successfully!", "warning");
      } catch (error) {
        console.error("Error deleting subcategory:", error);

        // Check if error is due to authentication
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return;
        }

        showStatusMessage(
          "Failed to delete subcategory. Please try again.",
          "error",
        );
      }
    }
  };

  // Update the handleCategorySelect function to fetch category details
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    fetchCategoryDetails(category.id);
    // Reset subcategory selection when changing categories
    setSelectedSubcategory(null);
    setSubcategoryDetails(null);
    setSubcategoryProducts([]);
  };

  // Update the handleBackToCategories function to reset category details
  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setCategoryDetails(null);
    setSelectedSubcategory(null);
    setSubcategoryDetails(null);
    setSubcategoryProducts([]);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format date with time for display
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Format price for display
  const formatPrice = (price) => {
    if (price === undefined || price === null) return "N/A";
    return `$${Number.parseFloat(price).toFixed(2)}`;
  };

  // Pagination functions
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Get current products for pagination
  const getCurrentProducts = (products) => {
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    return products.slice(indexOfFirstProduct, indexOfLastProduct);
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Filter subcategories based on search term and selected category
  const filteredSubcategories = selectedCategory
    ? subcategories.filter(
        (sub) =>
          sub.category_id === selectedCategory.id &&
          (searchSubcategory === "" ||
            sub.name.toLowerCase().includes(searchSubcategory.toLowerCase()) ||
            sub.description
              .toLowerCase()
              .includes(searchSubcategory.toLowerCase())),
      )
    : [];

  // Filter category products based on search term
  const filteredCategoryProducts = categoryProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchCategory.toLowerCase()) ||
      product.description.toLowerCase().includes(searchCategory.toLowerCase()),
  );

  // Get paginated products
  const paginatedCategoryProducts = getCurrentProducts(
    filteredCategoryProducts,
  );

  // If not authenticated and no token, show loading or redirect
  if (!isAuthenticated && !localStorage.getItem("token")) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  return (
    <MainContent>
      <div className="category-dashboard">
        {/* Status Message */}
        {statusMessage.show && (
          <div className={`status-message ${statusMessage.type}`}>
            {statusMessage.text}
          </div>
        )}

        <div className="category-sidebar">
          <div className="sidebar-headerr">
            <h2>Categories</h2>
            <button
              className="add-category-btn"
              onClick={() => openCategoryModal()}
            >
              <Package size={16} /> Add New Category
            </button>
          </div>

          <div className="category-list">
            {isLoading ? (
              <div className="loading-indicator">Loading categories...</div>
            ) : filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className={`category-item ${selectedCategory?.id === category.id ? "active" : ""}`}
                >
                  <div
                    className="category-item-content"
                    onClick={() => handleCategorySelect(category)}
                  >
                    <span className="category-name">{category.name}</span>
                    <span className="category-count">
                      {
                        subcategories.filter(
                          (sub) => sub.category_id === category.id,
                        ).length
                      }{" "}
                      subcategories
                    </span>
                  </div>
                  <button
                    className="category-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCategory(category.id);
                    }}
                    title="Delete category"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            ) : (
              <div className="no-categories">No categories found</div>
            )}
          </div>
        </div>

        <div className="category-content">
          {!selectedCategory ? (
            <div className="welcome-section">
              <h1>Category Management</h1>
              <p>Select a category to view details or manage subcategories</p>

              {/* Search for categories - moved to welcome section */}
              <div className="search-container welcome-search">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
          ) : (
            <div className="selected-category-details">
              <div className="category-details-header">
                <button className="back-btn" onClick={handleBackToCategories}>
                  <ArrowLeft size={16} /> Back to Categories
                </button>
                <div className="category-actions">
                  <button
                    className="view-products-btn"
                    onClick={handleViewCategoryProducts}
                  >
                    <ShoppingBag size={16} /> View Products
                  </button>
                  <button
                    className="edit-btn"
                    onClick={() => openCategoryModal(selectedCategory)}
                  >
                    <Edit size={16} /> Edit
                  </button>
                  <button
                    className="add-subcategory-btn"
                    onClick={() => openSubcategoryModal(selectedCategory.id)}
                  >
                    <Plus size={16} /> Add Subcategory
                  </button>
                </div>
              </div>

              <div className="category-info">
                {isLoadingCategoryDetails ? (
                  <div className="loading-indicator">
                    Loading category details...
                  </div>
                ) : categoryDetails ? (
                  <div className="category-details-container">
                    <h2>{categoryDetails.name}</h2>
                    <p className="category-description">
                      {categoryDetails.description}
                    </p>

                    <div className="category-meta-info">
                      <div className="category-meta-item">
                        <span className="meta-label">Created:</span>
                        <span className="meta-value">
                          <div className="date-time-display">
                            <Calendar size={14} />
                            <span>
                              {formatDate(categoryDetails.created_at)}
                            </span>
                          </div>
                          <div className="date-time-display">
                            <Clock size={14} />
                            <span>
                              {new Date(
                                categoryDetails.created_at,
                              ).toLocaleTimeString()}
                            </span>
                          </div>
                        </span>
                      </div>
                      {categoryDetails.updated_at && (
                        <div className="category-meta-item">
                          <span className="meta-label">Last Updated:</span>
                          <span className="meta-value">
                            <div className="date-time-display">
                              <Calendar size={14} />
                              <span>
                                {formatDate(categoryDetails.updated_at)}
                              </span>
                            </div>
                            <div className="date-time-display">
                              <Clock size={14} />
                              <span>
                                {new Date(
                                  categoryDetails.updated_at,
                                ).toLocaleTimeString()}
                              </span>
                            </div>
                          </span>
                        </div>
                      )}
                      <div className="category-meta-item">
                        <span className="meta-label">Subcategories:</span>
                        <span className="meta-value">
                          {
                            subcategories.filter(
                              (sub) => sub.category_id === selectedCategory.id,
                            ).length
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2>{selectedCategory.name}</h2>
                    <p>{selectedCategory.description}</p>
                  </div>
                )}
              </div>

              <div className="subcategories-section">
                <div className="subcategories-header">
                  {/* Search for subcategories */}
                  <div className="search-container subcategory-search">
                    <Search size={16} className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search subcategories..."
                      value={searchSubcategory}
                      onChange={(e) => setSearchSubcategory(e.target.value)}
                      className="search-input"
                    />
                  </div>
                </div>

                <div className="subcategories-list">
                  {filteredSubcategories.length > 0 ? (
                    filteredSubcategories.map((subcategory) => (
                      <div key={subcategory.id} className="subcategory-item">
                        <div
                          className="subcategory-info"
                          onClick={() => handleSubcategorySelect(subcategory)}
                        >
                          <h4>{subcategory.name}</h4>
                          <p>{subcategory.description}</p>
                          <button className="view-details-btnn">
                            <Info size={16} />
                            <span>View Details</span>
                          </button>
                        </div>
                        <div className="subcategory-actions">
                          <button
                            className="edit-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              openSubcategoryModal(
                                selectedCategory.id,
                                subcategory,
                              );
                            }}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="delete-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSubcategory(subcategory.id);
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-subcategories">
                      {searchSubcategory
                        ? "No subcategories match your search"
                        : "No subcategories found"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Category Modal */}
        {isCategoryModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h3>
                <button
                  className="close-modal-btn"
                  onClick={closeCategoryModal}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                {formError && (
                  <div className="form-error">
                    <AlertCircle size={16} />
                    {formError}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="category-name">Category Name</label>
                  <input
                    id="category-name"
                    type="text"
                    placeholder="Enter category name"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className={
                      formError && !categoryName.trim() ? "input-error" : ""
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category-description">Description</label>
                  <textarea
                    id="category-description"
                    placeholder="Enter category description"
                    value={categoryDescription}
                    onChange={(e) => setCategoryDescription(e.target.value)}
                    className={
                      formError && !categoryDescription.trim()
                        ? "input-error"
                        : ""
                    }
                    rows="3"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button className="cancel-btn" onClick={closeCategoryModal}>
                  Cancel
                </button>
                <button className="save-btn" onClick={addOrUpdateCategory}>
                  {editingCategory ? (
                    <>
                      <Check size={16} /> Update
                    </>
                  ) : (
                    <>
                      <Plus size={16} /> Create
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Subcategory Modal */}
        {isSubcategoryModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>
                  {editingSubcategory
                    ? "Edit Subcategory"
                    : "Add New Subcategory"}
                </h3>
                <button
                  className="close-modal-btn"
                  onClick={closeSubcategoryModal}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                {formError && (
                  <div className="form-error">
                    <AlertCircle size={16} />
                    {formError}
                  </div>
                )}

                <div className="form-group">
                  <label>Parent Category</label>
                  <input
                    type="text"
                    value={selectedCategory.name}
                    disabled
                    className="disabled-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subcategory-name">Subcategory Name</label>
                  <input
                    id="subcategory-name"
                    type="text"
                    placeholder="Enter subcategory name"
                    value={subcategoryName}
                    onChange={(e) => setSubcategoryName(e.target.value)}
                    className={
                      formError && !subcategoryName.trim() ? "input-error" : ""
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subcategory-description">Description</label>
                  <textarea
                    id="subcategory-description"
                    placeholder="Enter subcategory description"
                    value={subcategoryDescription}
                    onChange={(e) => setSubcategoryDescription(e.target.value)}
                    className={
                      formError && !subcategoryDescription.trim()
                        ? "input-error"
                        : ""
                    }
                    rows="3"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button className="cancel-btn" onClick={closeSubcategoryModal}>
                  Cancel
                </button>
                <button className="save-btn" onClick={addOrUpdateSubcategory}>
                  {editingSubcategory ? (
                    <>
                      <Check size={16} /> Update
                    </>
                  ) : (
                    <>
                      <Plus size={16} /> Create
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Subcategory Details Modal */}
        {isDetailsModalOpen && selectedSubcategory && (
          <div className="modal-overlay">
            <div className="modal-content details-modal">
              <div className="modal-header">
                <h3>Subcategory Details: {selectedSubcategory.name}</h3>
                <button className="close-modal-btn" onClick={closeDetailsModal}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                {isLoadingDetails ? (
                  <div className="loading-indicator">
                    Loading subcategory details...
                  </div>
                ) : subcategoryDetails ? (
                  <div className="subcategory-details-container">
                    <div className="details-section">
                      <h4>Basic Information</h4>
                      <div className="details-grid">
                        <div className="detail-item">
                          <span className="detail-label">Name:</span>
                          <span className="detail-value">
                            {subcategoryDetails.name}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Description:</span>
                          <span className="detail-value">
                            {subcategoryDetails.description}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Created:</span>
                          <span className="detail-value">
                            {formatDateTime(subcategoryDetails.created_at)}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Parent Category:</span>
                          <span className="detail-value">
                            {categories.find(
                              (cat) =>
                                cat.id === subcategoryDetails.category_id,
                            )?.name || "Unknown"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="details-section">
                      <h4>Products in this Subcategory</h4>
                      {isLoadingProducts ? (
                        <div className="loading-indicator">
                          Loading products...
                        </div>
                      ) : subcategoryProducts.length > 0 ? (
                        <>
                          <div className="subcategory-products">
                            {getCurrentProducts(subcategoryProducts).map(
                              (product) => (
                                <div
                                  key={product.id}
                                  className="product-item"
                                  onClick={() => handleProductSelect(product)}
                                >
                                  <div className="product-image">
                                    <img
                                      src={product.image || No_image}
                                      alt={product.name}
                                    />
                                  </div>
                                  <div className="product-info">
                                    <h5>{product.name}</h5>
                                    <p className="product-description">
                                      {product.description}
                                    </p>
                                    <div className="product-meta">
                                      <span className="product-price">
                                        {formatPrice(product.unit_price)}
                                      </span>
                                      <span className="product-stock">
                                        Stock: {product.quantity}
                                      </span>
                                    </div>
                                    <button className="view-product-btn">
                                      <Eye size={14} /> View Details
                                    </button>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>

                          {/* Pagination controls */}
                          {subcategoryProducts.length > productsPerPage && (
                            <div className="pagination">
                              <button
                                onClick={prevPage}
                                disabled={currentPage === 1}
                                className="pagination-btn"
                              >
                                <ChevronLeft size={16} />
                              </button>
                              {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                  key={i + 1}
                                  onClick={() => paginate(i + 1)}
                                  className={`pagination-btn ${currentPage === i + 1 ? "active" : ""}`}
                                >
                                  {i + 1}
                                </button>
                              ))}
                              <button
                                onClick={nextPage}
                                disabled={currentPage === totalPages}
                                className="pagination-btn"
                              >
                                <ChevronRight size={16} />
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="no-products">
                          No products found in this subcategory
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="error-message">
                    Failed to load subcategory details
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Category Products Modal */}
        {isCategoryProductsModalOpen && selectedCategory && (
          <div className="modal-overlay">
            <div className="modal-content details-modal">
              <div className="modal-header">
                <h3>Products in {selectedCategory.name}</h3>
                <button
                  className="close-modal-btn"
                  onClick={closeCategoryProductsModal}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                {/* Search for products */}
                <div className="search-container product-search">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="search-input"
                  />
                </div>

                {isLoadingCategoryProducts ? (
                  <div className="loading-indicator">
                    Loading category products...
                  </div>
                ) : filteredCategoryProducts.length > 0 ? (
                  <div className="category-products-container">
                    <div className="category-products-grid">
                      {paginatedCategoryProducts.map((product) => (
                        <div
                          key={product.id}
                          className="product-card"
                          onClick={() => handleProductSelect(product)}
                        >
                          <div className="product-card-image">
                            <img
                              src={product.image || No_image}
                              alt={product.name}
                            />
                            {product.on_promotion && (
                              <span className="promotion-tag">On Sale</span>
                            )}
                          </div>
                          <div className="product-card-content">
                            <h4 className="product-card-title">
                              {product.name}
                            </h4>
                            <p className="product-card-description">
                              {product.description}
                            </p>
                            <div className="product-card-details">
                              <div className="product-card-price">
                                {product.on_promotion ? (
                                  <>
                                    <span className="original-price">
                                      {formatPrice(product.unit_price)}
                                    </span>
                                    <span className="sale-price">
                                      {formatPrice(product.promo_price)}
                                    </span>
                                  </>
                                ) : (
                                  <span>{formatPrice(product.unit_price)}</span>
                                )}
                              </div>
                              <div className="product-card-stock">
                                <span
                                  className={`stock-indicator ${product.quantity > 0 ? "in-stock" : "out-of-stock"}`}
                                >
                                  {product.quantity > 0
                                    ? `${product.quantity} in stock`
                                    : "Out of stock"}
                                </span>
                              </div>
                            </div>
                            <div className="product-card-subcategory">
                              {product.subcategory_id ? (
                                <span>
                                  {subcategories.find(
                                    (sub) => sub.id === product.subcategory_id,
                                  )?.name || "Unknown subcategory"}
                                </span>
                              ) : (
                                <span>No subcategory</span>
                              )}
                            </div>
                            <button className="view-product-btn">
                              <Eye size={14} /> View Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination controls */}
                    {filteredCategoryProducts.length > productsPerPage && (
                      <div className="pagination">
                        <button
                          onClick={prevPage}
                          disabled={currentPage === 1}
                          className="pagination-btn"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => paginate(i + 1)}
                            className={`pagination-btn ${currentPage === i + 1 ? "active" : ""}`}
                          >
                            {i + 1}
                          </button>
                        ))}
                        <button
                          onClick={nextPage}
                          disabled={currentPage === totalPages}
                          className="pagination-btn"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="no-products-message">
                    <Package size={48} />
                    <p>
                      {searchCategory
                        ? "No products match your search"
                        : "No products found in this category"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Product Detail Modal */}
        {isProductDetailModalOpen && selectedProduct && (
          <div className="modal-overlay">
            <div className="modal-content product-detail-modal">
              <div className="modal-header">
                <h3>Product Details</h3>
                <button
                  className="close-modal-btn"
                  onClick={closeProductDetailModal}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <div className="product-detail-container">
                  <div className="product-detail-image">
                    <img
                      src={selectedProduct.image || No_image}
                      alt={selectedProduct.name}
                    />
                    {selectedProduct.on_promotion && (
                      <span className="promotion-tag large">On Sale</span>
                    )}
                  </div>
                  <div className="product-detail-info">
                    <h2 className="product-detail-title">
                      {selectedProduct.name}
                    </h2>
                    <p className="product-detail-description">
                      {selectedProduct.description}
                    </p>

                    <div className="product-detail-meta">
                      <div className="product-detail-price">
                        <span className="detail-label">Price:</span>
                        {selectedProduct.on_promotion ? (
                          <div className="price-container">
                            <span className="original-price large">
                              {formatPrice(selectedProduct.unit_price)}
                            </span>
                            <span className="sale-price large">
                              {formatPrice(selectedProduct.promo_price)}
                            </span>
                          </div>
                        ) : (
                          <span className="price-value">
                            {formatPrice(selectedProduct.unit_price)}
                          </span>
                        )}
                      </div>

                      <div className="product-detail-stock">
                        <span className="detail-label">Stock Status:</span>
                        <span
                          className={`stock-indicator large ${selectedProduct.quantity > 0 ? "in-stock" : "out-of-stock"}`}
                        >
                          {selectedProduct.quantity > 0
                            ? `${selectedProduct.quantity} in stock`
                            : "Out of stock"}
                        </span>
                      </div>

                      {selectedProduct.category_id && (
                        <div className="product-detail-category">
                          <span className="detail-label">Category:</span>
                          <span className="category-value">
                            {categories.find(
                              (cat) => cat.id === selectedProduct.category_id,
                            )?.name || "Unknown"}
                          </span>
                        </div>
                      )}

                      {selectedProduct.subcategory_id && (
                        <div className="product-detail-subcategory">
                          <span className="detail-label">Subcategory:</span>
                          <span className="subcategory-value">
                            {subcategories.find(
                              (sub) =>
                                sub.id === selectedProduct.subcategory_id,
                            )?.name || "Unknown"}
                          </span>
                        </div>
                      )}

                      {selectedProduct.created_at && (
                        <div className="product-detail-date">
                          <span className="detail-label">Added on:</span>
                          <span className="date-value">
                            {formatDateTime(selectedProduct.created_at)}
                          </span>
                        </div>
                      )}

                      {selectedProduct.expiry_date && (
                        <div className="product-detail-expiry">
                          <span className="detail-label">Expiry Date:</span>
                          <span className="expiry-value">
                            {formatDate(selectedProduct.expiry_date)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainContent>
  );
};

export default Category;

// i want u to work on the segmentation so that the charts can get values according to days which are the 24h , week which are the values of days, months which are the value of the weeks and year which are the values of the months and I want u to check that if the segmentation is already working if not implement it so it can do it on this dashboard
