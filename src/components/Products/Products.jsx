"use client";

import No_image from "../../../public/assets/No_IMG.jpg";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  X,
  Plus,
  AlertCircle,
  ImageIcon,
  Edit,
  Trash2,
  Search,
  List,
  Check,
  Loader,
  Calendar,
  Lock,
  Eye,
} from "lucide-react";
import "./products.css";
import MainContent from "../MainContend";

const Product = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // Changed default to list view
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);

  const [formData, setFormData] = useState({
    id: null,
    name: "",
    description: "",
    unit_price: "",
    purchase_price: "",
    image: "",
    quantity: 0,
    min_quantity: 0,
    is_expired: false,
    expiry_date: "",
    on_promotion: false,
    promotion_start_date: "",
    promotion_end_date: "",
    promo_price: "",
    category_id: "",
    subcategory_id: "",
  });

  const apiBaseUrl =
    "https://victbackendmanagement.onrender.com/api/v1/product";
  const categoryApiBaseUrl =
    "https://victbackendmanagement.onrender.com/api/v1/categories";

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

          // Check if user has access based on role
          const allowedRoles = [
            "manager",
            "cashier",
            "stock_keeper",
            "wholesale_client",
            "sales_agent",
          ];
          if (
            userData.role &&
            allowedRoles.includes(userData.role.toLowerCase())
          ) {
            setHasAccess(true);
          }
        }

        // Fetch latest user information from API
        const response = await fetch(
          "https://victbackendmanagement.onrender.com/api/v1/user-info/",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
          setIsAuthenticated(true);

          // Check if user has access based on role
          const allowedRoles = [
            "manager",
            "cashier",
            "stock_keeper",
            "wholesale_client",
            "sales_agent",
          ];
          if (
            userData.role &&
            allowedRoles.includes(userData.role.toLowerCase())
          ) {
            setHasAccess(true);
          }
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

  // Fetch products and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!hasAccess) return;

      setIsLoading(true);
      try {
        const authAxios = getAuthAxios();

        // Fetch products
        const productsResponse = await authAxios.get(`${apiBaseUrl}/products/`);
        console.log(
          "Products fetched successfully",
          productsResponse.data.results,
        );
        setProducts(productsResponse.data.results || []);

        // Fetch categories
        const categoriesResponse = await authAxios.get(
          `${categoryApiBaseUrl}/categories/`,
        );
        console.log(
          "Categories fetched successfully",
          categoriesResponse.data.results,
        );
        setCategories(categoriesResponse.data.results || []);

        // Fetch all subcategories
        const subcategoriesResponse = await authAxios.get(
          `${categoryApiBaseUrl}/subcategories/`,
        );
        console.log(
          "Subcategories fetched successfully",
          subcategoriesResponse.data.results,
        );
        setSubcategories(subcategoriesResponse.data.results || []);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);

        // Check if error is due to authentication
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return;
        }

        setIsLoading(false);
        setProducts([]);
        setCategories([]);
        setSubcategories([]);
      }
    };

    if (isAuthenticated && hasAccess) {
      fetchData();
    } else if (localStorage.getItem("token")) {
      // If we have a token but haven't confirmed authentication yet, wait
      // The authentication check in the first useEffect will handle this
    } else {
      // No token, redirect to login
      window.location.href = "/login";
    }
  }, [isAuthenticated, hasAccess]);

  // Update filtered subcategories when category changes or when subcategories are loaded
  useEffect(() => {
    if (formData.category_id) {
      setIsLoadingSubcategories(true);
      // Simulate a small delay to show loading state (can be removed in production)
      setTimeout(() => {
        const filtered = subcategories.filter(
          (sub) => sub.category_id === formData.category_id,
        );
        setFilteredSubcategories(filtered);
        setIsLoadingSubcategories(false);
      }, 300);
    } else {
      setFilteredSubcategories([]);
    }
  }, [formData.category_id, subcategories]);

  const fetchProducts = async () => {
    try {
      const authAxios = getAuthAxios();
      const response = await authAxios.get(`${apiBaseUrl}/products/`);
      console.log("Products fetched successfully", response.data.results);
      setProducts(response.data.results || []);
    } catch (error) {
      console.error("Error fetching products:", error);

      // Check if error is due to authentication
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return;
      }

      setProducts([]);
    }
  };

  // Function to fetch products by expiry date
  const fetchProductsByExpiryDate = async () => {
    setIsLoading(true);
    try {
      const authAxios = getAuthAxios();

      // Make the API request to get products by expiry date
      const response = await authAxios.get(`${apiBaseUrl}/expiry_date/`);

      console.log("Expiry date filter response:", response.data);

      // Extract products from the response
      const responseData = response.data;
      const productsToDisplay = [];

      // Process expired products if they exist
      if (
        responseData.expired_products &&
        Array.isArray(responseData.expired_products)
      ) {
        // Transform each product into the expected format
        const formattedExpiredProducts = responseData.expired_products.map(
          (product) => ({
            id: product.id,
            product: product,
            category: { id: product.category_id, name: "Loading..." },
            subcategory: product.subcategory_id
              ? { id: product.subcategory_id, name: "Loading..." }
              : null,
          }),
        );

        productsToDisplay.push(...formattedExpiredProducts);
      }

      // Process near expiry products if they exist
      if (
        responseData.near_expiry_products &&
        Array.isArray(responseData.near_expiry_products)
      ) {
        // Transform each product into the expected format
        const formattedNearExpiryProducts =
          responseData.near_expiry_products.map((product) => ({
            id: product.id,
            product: product,
            category: { id: product.category_id, name: "Loading..." },
            subcategory: product.subcategory_id
              ? { id: product.subcategory_id, name: "Loading..." }
              : null,
          }));

        productsToDisplay.push(...formattedNearExpiryProducts);
      }

      console.log(`Found ${productsToDisplay.length} products by expiry date`);

      // If we have products, try to fetch their category names
      if (productsToDisplay.length > 0) {
        try {
          const authAxios = getAuthAxios();

          // Fetch categories to get names
          const categoriesResponse = await authAxios.get(
            `${categoryApiBaseUrl}/categories/`,
          );
          const categoriesData = categoriesResponse.data.results || [];

          // Create a map of category IDs to names for quick lookup
          const categoryMap = {};
          categoriesData.forEach((category) => {
            categoryMap[category.id] = category.name;
          });

          // Update the category names in our products
          productsToDisplay.forEach((item) => {
            if (
              item.category &&
              item.category.id &&
              categoryMap[item.category.id]
            ) {
              item.category.name = categoryMap[item.category.id];
            }
          });

          // Also try to fetch subcategory names if needed
          const subcategoryIds = productsToDisplay
            .filter((item) => item.subcategory && item.subcategory.id)
            .map((item) => item.subcategory.id);

          if (subcategoryIds.length > 0) {
            const subcategoriesResponse = await authAxios.get(
              `${categoryApiBaseUrl}/subcategories/`,
            );
            const subcategoriesData = subcategoriesResponse.data.results || [];

            // Create a map of subcategory IDs to names
            const subcategoryMap = {};
            subcategoriesData.forEach((subcategory) => {
              subcategoryMap[subcategory.id] = subcategory.name;
            });

            // Update the subcategory names
            productsToDisplay.forEach((item) => {
              if (
                item.subcategory &&
                item.subcategory.id &&
                subcategoryMap[item.subcategory.id]
              ) {
                item.subcategory.name = subcategoryMap[item.subcategory.id];
              }
            });
          }
        } catch (error) {
          console.error("Error fetching category/subcategory names:", error);

          // Check if error is due to authentication
          if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
            return;
          }

          // Continue with the products we have, even without category names
        }
      }

      // Set the products state with our filtered products
      setProducts(productsToDisplay);

      // Show a status message with the count of products found
      const statusElement = document.createElement("div");
      statusElement.className = "status-message info";
      statusElement.textContent = `Found ${productsToDisplay.length} product${
        productsToDisplay.length !== 1 ? "s" : ""
      } by expiry date`;
      document.body.appendChild(statusElement);

      // Remove the status message after 3 seconds
      setTimeout(() => {
        if (document.body.contains(statusElement)) {
          document.body.removeChild(statusElement);
        }
      }, 3000);
    } catch (error) {
      console.error("Error fetching products by expiry date:", error);

      // Check if error is due to authentication
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return;
      }

      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }
      setProducts([]);

      // Show error message
      const statusElement = document.createElement("div");
      statusElement.className = "status-message error";
      statusElement.textContent = "Error fetching products by expiry date";
      document.body.appendChild(statusElement);

      // Remove the status message after 3 seconds
      setTimeout(() => {
        if (document.body.contains(statusElement)) {
          document.body.removeChild(statusElement);
        }
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch product details using the detail API
  const fetchProductDetails = async (productId) => {
    setIsLoading(true);
    try {
      const authAxios = getAuthAxios();
      const response = await authAxios.get(`${apiBaseUrl}/detail/`, {
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear error when user types in name field
    if (name === "name" && errorMessage) {
      setErrorMessage("");
    }

    // When category changes, reset subcategory
    if (name === "category_id") {
      setFormData((prev) => ({
        ...prev,
        subcategory_id: "",
      }));
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      setFormData({
        ...formData,
        image: file,
      });
    }
  };

  // Handle clearing the expiry filter
  const handleClearExpiryFilter = () => {
    console.log("Clearing expiry date filter");
    fetchProducts();

    // Add a status message to inform the user
    const statusElement = document.createElement("div");
    statusElement.className = "status-message info";
    statusElement.textContent = "Cleared expiry date filter";
    document.body.appendChild(statusElement);

    // Remove the status message after 3 seconds
    setTimeout(() => {
      if (document.body.contains(statusElement)) {
        document.body.removeChild(statusElement);
      }
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const authAxios = getAuthAxios();

      if (isEditing) {
        // Update existing product via API
        const productData = new FormData();

        // IMPORTANT: Add product_id to the form data - this is what was missing
        productData.append("product_id", editingProductId);

        // Format dates for API if they exist
        const formattedData = { ...formData };
        if (formData.promotion_start_date) {
          formattedData.promotion_start_date = `${formData.promotion_start_date}T00:00:00Z`;
        }
        if (formData.promotion_end_date) {
          formattedData.promotion_end_date = `${formData.promotion_end_date}T00:00:00Z`;
        }
        if (formData.expiry_date) {
          formattedData.expiry_date = `${formData.expiry_date}T00:00:00Z`;
        }

        // Convert numeric fields to ensure they're sent as numbers
        if (formattedData.unit_price) {
          formattedData.unit_price = Number(formattedData.unit_price);
        }
        if (formattedData.purchase_price) {
          formattedData.purchase_price = Number(formattedData.purchase_price);
        }
        // Only include promo_price if it has a value and product is on promotion
        if (formattedData.on_promotion && formattedData.promo_price) {
          formattedData.promo_price = Number(formattedData.promo_price);
        } else if (!formattedData.on_promotion) {
          // Remove promo_price if product is not on promotion
          delete formattedData.promo_price;
        }
        formattedData.quantity = Number(formattedData.quantity);
        formattedData.min_quantity = Number(formattedData.min_quantity);

        // Then use formattedData instead of formData when adding to FormData
        Object.keys(formattedData).forEach((key) => {
          // Skip undefined, null, or empty string values
          if (
            formattedData[key] === undefined ||
            formattedData[key] === null ||
            formattedData[key] === ""
          ) {
            return;
          }

          if (
            key !== "image" ||
            (key === "image" && typeof formattedData[key] !== "string")
          ) {
            productData.append(key, formattedData[key]);
          }
        });

        // If there's a new image file, append it
        if (formData.image && typeof formData.image !== "string") {
          productData.append("image", formData.image);
        }

        console.log("Updating product with ID:", editingProductId);
        console.log("Form data entries:", [...productData.entries()]);

        // Use the updated API endpoint
        const response = await authAxios.put(
          `${apiBaseUrl}/update/`,
          productData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        );

        console.log("Update response:", response.data);

        // Refresh products from server
        fetchProducts();
        console.log("Product updated successfully");

        // Reset form
        resetForm();
      } else {
        // Check if product name already exists
        const nameExists = products.some(
          (item) =>
            item.product.name &&
            formData.name &&
            item.product.name.toLowerCase() === formData.name.toLowerCase(),
        );

        if (nameExists) {
          setErrorMessage("A product with this name already exists.");
          return;
        }

        // Create a new product via API
        const productData = new FormData();

        // Format dates for API if they exist
        const formattedData = { ...formData };
        if (formData.promotion_start_date) {
          formattedData.promotion_start_date = `${formData.promotion_start_date}T00:00:00Z`;
        }
        if (formData.promotion_end_date) {
          formattedData.promotion_end_date = `${formData.promotion_end_date}T00:00:00Z`;
        }
        if (formData.expiry_date) {
          formattedData.expiry_date = `${formData.expiry_date}T00:00:00Z`;
        }

        // Convert numeric fields to ensure they're sent as numbers
        if (formattedData.unit_price) {
          formattedData.unit_price = Number(formattedData.unit_price);
        }
        if (formattedData.purchase_price) {
          formattedData.purchase_price = Number(formattedData.purchase_price);
        }
        // Only include promo_price if it has a value and product is on promotion
        if (formattedData.on_promotion && formattedData.promo_price) {
          formattedData.promo_price = Number(formattedData.promo_price);
        } else if (!formattedData.on_promotion) {
          // Remove promo_price if product is not on promotion
          delete formattedData.promo_price;
        }
        formattedData.quantity = Number(formattedData.quantity);
        formattedData.min_quantity = Number(formattedData.min_quantity);

        // Then use formattedData instead of formData when adding to FormData
        Object.keys(formattedData).forEach((key) => {
          // Skip undefined, null, or empty string values
          if (
            formattedData[key] === undefined ||
            formattedData[key] === null ||
            formattedData[key] === ""
          ) {
            return;
          }

          if (
            key !== "image" ||
            (key === "image" && typeof formattedData[key] !== "string")
          ) {
            productData.append(key, formattedData[key]);
          }
        });

        // If there's a new image file, append it
        if (formData.image && typeof formData.image !== "string") {
          productData.append("image", formData.image);
        }

        console.log("Creating product with data:", [...productData.entries()]);

        const response = await authAxios.post(
          `${apiBaseUrl}/create/`,
          productData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        );

        console.log("Create response:", response.data);

        // Add the new product to the list
        if (response.data) {
          // Refresh products from server to ensure we have the latest data
          fetchProducts();
          console.log("Product created successfully");

          // Reset form
          resetForm();
        }
      }
    } catch (error) {
      console.error("Error creating/updating product:", error);

      // Check if error is due to authentication
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return;
      }

      if (error.response) {
        console.error("Error response data:", error.response.data);

        // Handle specific error messages
        if (error.response.data.product_id) {
          setErrorMessage(
            `Product ID error: ${error.response.data.product_id}`,
          );
        } else if (error.response.data.message) {
          setErrorMessage(error.response.data.message);
        } else if (error.response.data.error) {
          setErrorMessage(error.response.data.error);
        } else {
          setErrorMessage(
            "Failed to process product. Please check all required fields.",
          );
        }
      } else {
        setErrorMessage("Failed to process product. Please try again.");
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setErrorMessage("");
    setImagePreview(null);
    setIsEditing(false);
    setEditingProductId(null);
    setFormData({
      id: null,
      name: "",
      description: "",
      unit_price: "",
      purchase_price: "",
      image: "",
      quantity: 0,
      min_quantity: 0,
      is_expired: false,
      expiry_date: "",
      on_promotion: false,
      promotion_start_date: "",
      promotion_end_date: "",
      promo_price: "",
      category_id: "",
      subcategory_id: "",
    });
  };

  // Function to handle editing a product - uses the fetchProductDetails API
  const handleEditProduct = async (item, event) => {
    if (event) {
      event.stopPropagation();
    }

    setIsLoading(true);
    try {
      // Get the actual product object from the item
      const productId = item.product.id;

      // Fetch detailed product information
      const productDetails = await fetchProductDetails(productId);

      if (productDetails) {
        setIsEditing(true);
        setEditingProductId(productId);

        // Format dates for form fields (YYYY-MM-DD)
        const formattedProductDetails = {
          ...productDetails,
          expiry_date: productDetails.expiry_date
            ? productDetails.expiry_date.split("T")[0]
            : "",
          promotion_start_date: productDetails.promotion_start_date
            ? productDetails.promotion_start_date.split("T")[0]
            : "",
          promotion_end_date: productDetails.promotion_end_date
            ? productDetails.promotion_end_date.split("T")[0]
            : "",
        };

        setFormData(formattedProductDetails);
        setImagePreview(productDetails.image);
      } else {
        // Fallback to using the product data we already have
        setIsEditing(true);
        setEditingProductId(item.product.id);

        // Format dates for form fields (YYYY-MM-DD)
        const formattedProduct = {
          ...item.product,
          category_id: item.category?.id || "",
          subcategory_id: item.subcategory?.id || "",
          expiry_date: item.product.expiry_date
            ? item.product.expiry_date.split("T")[0]
            : "",
          promotion_start_date: item.product.promotion_start_date
            ? item.product.promotion_start_date.split("T")[0]
            : "",
          promotion_end_date: item.product.promotion_end_date
            ? item.product.promotion_end_date.split("T")[0]
            : "",
        };

        setFormData(formattedProduct);
        setImagePreview(item.product.image);
      }
    } catch (error) {
      console.error("Error preparing product for edit:", error);

      // Check if error is due to authentication
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return;
      }

      // Fallback to using the product data we already have
      setIsEditing(true);
      setEditingProductId(item.product.id);

      // Format dates for form fields (YYYY-MM-DD)
      const formattedProduct = {
        ...item.product,
        category_id: item.category?.id || "",
        subcategory_id: item.subcategory?.id || "",
        expiry_date: item.product.expiry_date
          ? item.product.expiry_date.split("T")[0]
          : "",
        promotion_start_date: item.product.promotion_start_date
          ? item.product.promotion_start_date.split("T")[0]
          : "",
        promotion_end_date: item.product.promotion_end_date
          ? item.product.promotion_end_date.split("T")[0]
          : "",
      };

      setFormData(formattedProduct);
      setImagePreview(item.product.image);
    } finally {
      setIsLoading(false);
      setShowForm(true);
    }
  };

  const handleDelete = async (id, event) => {
    if (event) {
      event.stopPropagation();
    }

    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const authAxios = getAuthAxios();

      // Use the updated delete API endpoint
      const response = await authAxios.delete(`${apiBaseUrl}/delete/`, {
        params: { product_id: id },
      });

      console.log("Delete response:", response);

      if (response.status === 204 || response.status === 200) {
        console.log("Product deleted successfully");
        // Update UI after deletion - filter out the deleted product
        setProducts(products.filter((item) => item.product.id !== id));
        // Close details modal if open
        if (showDetailsModal) {
          setShowDetailsModal(false);
        }
      } else {
        throw new Error("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);

      // Check if error is due to authentication
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return;
      }

      alert("Error deleting product. Please try again.");
    }
  };

  const handleViewProductDetails = async (item) => {
    try {
      // Get the actual product object from the item
      const productId = item.product.id;

      // Fetch detailed product information
      const productDetails = await fetchProductDetails(productId);

      if (productDetails) {
        setSelectedProduct({
          ...productDetails,
          category: item.category,
          subcategory: item.subcategory,
        });
      } else {
        // Fallback to using the product data we already have
        setSelectedProduct({
          ...item.product,
          category: item.category,
          subcategory: item.subcategory,
        });
      }

      // Show the details modal
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Error fetching product details:", error);

      // Check if error is due to authentication
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return;
      }

      // Fallback to using the product data we already have
      setSelectedProduct({
        ...item.product,
        category: item.category,
        subcategory: item.subcategory,
      });
      setShowDetailsModal(true);
    }
  };

  // FIXED: This filter function now accesses the nested product properties correctly
  const filteredProducts = products.filter((item) => {
    if (!item.product) return false;

    return (
      (item.product.name &&
        item.product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.product.description &&
        item.product.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (item.category &&
        item.category.name &&
        item.category.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Calculate pagination values
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct,
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getStockStatus = (product) => {
    if (!product) return "unknown";

    if (product.quantity <= 0) {
      return "out-of-stock";
    } else if (
      product.min_quantity !== undefined &&
      product.quantity <= product.min_quantity
    ) {
      return "low-stock";
    } else {
      return "in-stock";
    }
  };

  // Get category name by id - Simplified since we already have the category object
  const getCategoryName = (categoryObj) => {
    return categoryObj ? categoryObj.name : "Uncategorized";
  };

  // Get subcategory name by id - Simplified since we already have the subcategory object
  const getSubcategoryName = (subcategoryObj) => {
    return subcategoryObj ? subcategoryObj.name : "";
  };

  // If not authenticated and no token, show loading or redirect
  if (!isAuthenticated && !localStorage.getItem("token")) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  // If authenticated but doesn't have access, show access denied message
  if (isAuthenticated && !hasAccess) {
    return (
      <MainContent>
        <div className="access-denied-container">
          <Lock size={48} className="access-denied-icon" />
          <h2>Access Denied</h2>
          <p>You don't have permission to view this page.</p>
          <p>
            This page is only accessible to managers, cashiers, stock keepers,
            wholesale clients, and sales agents.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="back-home-btn"
          >
            Back to Home
          </button>
        </div>
      </MainContent>
    );
  }

  return (
    <MainContent>
      <div className="product-container">
        <div className="product-header">
          <h2>Products Management</h2>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="add-product-btn"
          >
            <Plus size={18} /> Add Product
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="product-toolbar">
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Expiry Date Filter Button */}
          <div className="expiry-filter-container">
            <button
              className="expiry-filter-btn"
              onClick={fetchProductsByExpiryDate}
            >
              <Calendar size={18} /> Expired Products
            </button>
            <button
              className="clear-filter-btn"
              onClick={handleClearExpiryFilter}
            >
              <X size={14} /> Clear Filter
            </button>
          </div>

          <button
            className={`view-btn ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
            aria-label="List view"
          >
            <List size={18} /> List
          </button>
        </div>

        {/* Products Display */}
        {isLoading ? (
          <div className="loading-state">
            <Loader size={48} className="spin" />
            <p>Loading products...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="product-table-container">
            <table className="product-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.map((item, index) => {
                  const product = item.product;
                  const category = item.category;
                  const subcategory = item.subcategory;
                  const stockStatus = getStockStatus(product);

                  return (
                    <tr
                      key={item.id || index}
                      onClick={() => handleViewProductDetails(item)}
                      className="product-row"
                    >
                      <td className="product-image-cell">
                        <div className="product-image-container-small">
                          <img
                            src={product.image || No_image}
                            alt={product.name || "Product"}
                            className="product-image-small"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = No_image;
                            }}
                          />
                          {product.on_promotion && (
                            <div className="promotion-badge-small">Sale</div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="product-name-cell">
                          <div className="product-name">
                            {product.name || "Unnamed Product"}
                          </div>
                          <div className="product-description-small">
                            {product.description
                              ? product.description.length > 50
                                ? `${product.description.substring(0, 50)}...`
                                : product.description
                              : "No description"}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="product-category-cell">
                          {getCategoryName(category)}
                          {subcategory && (
                            <span className="product-subcategory">
                              <br />
                              {getSubcategoryName(subcategory)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="product-price-cell">
                          {product.on_promotion && product.promo_price ? (
                            <>
                              <div className="product-price promo">
                                {product.promo_price || 0} XFA
                              </div>
                              <div className="product-price original">
                                {product.unit_price || 0} XFA
                              </div>
                            </>
                          ) : (
                            <div className="product-price">
                              {product.unit_price || 0} XFA
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="product-stock-cell">
                          {product.quantity || 0}
                        </div>
                      </td>
                      <td>
                        <div className={`stock-status ${stockStatus}`}>
                          {stockStatus === "in-stock" && "In Stock"}
                          {stockStatus === "low-stock" && "Low Stock"}
                          {stockStatus === "out-of-stock" && "Out of Stock"}
                        </div>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="view-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewProductDetails(item);
                            }}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="edit-btn"
                            onClick={(e) => handleEditProduct(item, e)}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="delete-btn"
                            onClick={(e) => handleDelete(product.id, e)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-products">
            <p>
              No products found. Try adjusting your search or add a new product.
            </p>
            <button onClick={handleClearExpiryFilter}>
              <X size={14} /> Clear Filter
            </button>
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && filteredProducts.length > 0 && (
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              &lt;
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="pagination-btn"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              &gt;
            </button>
          </div>
        )}

        {/* Add/Edit Product Modal */}
        {showForm && (
          <div className="product-modal-overlay">
            <div className="product-modal-content">
              <div className="product-modal-header">
                <h3>{isEditing ? "Edit Product" : "Add New Product"}</h3>
                <button
                  className="close-modal-btn"
                  onClick={resetForm}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="product-form">
                <div className="form-grid">
                  {/* Basic Information */}
                  <div className="form-section">
                    <h4>Basic Information</h4>

                    <div className="form-group">
                      <label htmlFor="product-name">Name *</label>
                      <input
                        id="product-name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={errorMessage ? "input-error" : ""}
                        required
                      />
                      {errorMessage && (
                        <div className="error-container">
                          <AlertCircle size={16} />
                          <span className="error-message">{errorMessage}</span>
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="purchase-price">Purchase Price *</label>
                      <input
                        id="purchase-price"
                        name="purchase_price"
                        type="decimal"
                        min="0"
                        value={formData.purchase_price}
                        onChange={handleChange}
                        className={errorMessage ? "input-error" : ""}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="product-description">Description</label>
                      <textarea
                        id="product-description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="product-price">Price *</label>
                        <div className="input-with-prefix">
                          <span className="input-prefix">$</span>
                          <input
                            id="product-price"
                            name="unit_price"
                            type="decimal"
                            min="0"
                            value={formData.unit_price}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="product-category">Category *</label>
                        <select
                          id="product-category"
                          name="category_id"
                          value={formData.category_id}
                          onChange={handleChange}
                          required
                          className="form-select"
                        >
                          <option value="">Select a category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Only show subcategory field when a category is selected */}
                    {formData.category_id && (
                      <div className="form-group subcategory-field">
                        <label htmlFor="product-subcategory">
                          Subcategory
                          {isLoadingSubcategories && (
                            <span className="loading-indicator-inline">
                              <Loader size={14} className="spinner" />
                            </span>
                          )}
                        </label>
                        <select
                          id="product-subcategory"
                          name="subcategory_id"
                          value={formData.subcategory_id}
                          onChange={handleChange}
                          className="form-select"
                          disabled={
                            isLoadingSubcategories ||
                            filteredSubcategories.length === 0
                          }
                        >
                          <option value="">Select a subcategory</option>
                          {filteredSubcategories.map((subcategory) => (
                            <option key={subcategory.id} value={subcategory.id}>
                              {subcategory.name}
                            </option>
                          ))}
                        </select>
                        {!isLoadingSubcategories &&
                          filteredSubcategories.length === 0 && (
                            <div className="subcategory-message">
                              <AlertCircle size={14} />
                              <small>
                                No subcategories available for this category
                              </small>
                            </div>
                          )}
                      </div>
                    )}
                  </div>

                  {/* Inventory Information */}
                  <div className="form-section">
                    <h4>Inventory</h4>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="product-quantity">Quantity *</label>
                        <input
                          id="product-quantity"
                          type="decimal"
                          min="0"
                          name="quantity"
                          value={formData.quantity}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="product-min-quantity">
                          Min Quantity *
                        </label>
                        <input
                          id="product-min-quantity"
                          type="decimal"
                          min="0"
                          name="min_quantity"
                          value={formData.min_quantity}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="product-expiry">Expiry Date</label>
                      <input
                        id="product-expiry"
                        type="date"
                        name="expiry_date"
                        value={formData.expiry_date}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="is_expired"
                          checked={formData.is_expired}
                          onChange={handleChange}
                        />
                        <span>Product is expired</span>
                      </label>
                    </div>

                    <div className="form-group image-upload">
                      <label>Product Image</label>
                      <div className="image-upload-container">
                        {imagePreview ? (
                          <div className="image-preview">
                            <img
                              src={imagePreview || No_image}
                              alt="Product preview"
                            />
                            <button
                              type="button"
                              className="remove-image"
                              onClick={() => {
                                setImagePreview(null);
                                setFormData({ ...formData, image: "" });
                              }}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <label className="upload-label">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden-input"
                            />
                            <div className="upload-placeholder">
                              <ImageIcon size={24} />
                              <span>Click to upload image</span>
                            </div>
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Promotion Information */}
                  <div className="form-section promotion-section">
                    <h4>Promotion Details</h4>

                    <div className="form-group checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="on_promotion"
                          checked={formData.on_promotion}
                          onChange={handleChange}
                        />
                        <span>Product is on promotion</span>
                      </label>
                    </div>

                    {formData.on_promotion && (
                      <>
                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor="promo-start">Start Date *</label>
                            <input
                              id="promo-start"
                              type="date"
                              name="promotion_start_date"
                              value={formData.promotion_start_date}
                              onChange={handleChange}
                              required={formData.on_promotion}
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="promo-end">End Date *</label>
                            <input
                              id="promo-end"
                              type="date"
                              name="promotion_end_date"
                              value={formData.promotion_end_date}
                              onChange={handleChange}
                              required={formData.on_promotion}
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label htmlFor="promo-price">
                            Promotional Price *
                          </label>
                          <div className="input-with-prefix">
                            <span className="input-prefix">$</span>
                            <input
                              id="promo-price"
                              name="promo_price"
                              type="decimal"
                              min="0"
                              value={formData.promo_price}
                              onChange={handleChange}
                              required={formData.on_promotion}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="create-btn">
                    {isEditing ? (
                      <>
                        <Check size={16} /> Update Product
                      </>
                    ) : (
                      <>
                        <Plus size={16} /> Create Product
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Product Details Modal */}
        {showDetailsModal && selectedProduct && (
          <div className="product-modal-overlay">
            <div className="product-modal-content">
              <div className="product-modal-header">
                <h3>Product Details</h3>
                <button
                  className="close-modal-btn"
                  onClick={() => setShowDetailsModal(false)}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="product-details-content">
                <div className="product-details-grid">
                  <div className="product-details-image">
                    <img
                      src={selectedProduct.image || No_image}
                      alt={selectedProduct.name || "Product"}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = No_image;
                      }}
                    />
                    {selectedProduct.on_promotion && (
                      <div className="promotion-badge details-badge">
                        On Sale
                      </div>
                    )}
                  </div>

                  <div className="product-details-info">
                    <h2 className="product-details-name">
                      {selectedProduct.name}
                    </h2>

                    <div className="product-details-meta">
                      <div className="product-details-category">
                        <strong>Category:</strong>{" "}
                        {getCategoryName(selectedProduct.category) ||
                          "Uncategorized"}
                        {selectedProduct.subcategory && (
                          <span>
                            {" "}
                            / {getSubcategoryName(selectedProduct.subcategory)}
                          </span>
                        )}
                      </div>

                      <div
                        className={`stock-status ${getStockStatus(selectedProduct)}`}
                      >
                        {selectedProduct.quantity > 0
                          ? `${selectedProduct.quantity} in stock`
                          : "Out of stock"}
                      </div>
                    </div>

                    <div className="product-details-price">
                      {selectedProduct.on_promotion &&
                      selectedProduct.promo_price ? (
                        <span className="product-price">
                          {selectedProduct.promo_price || 0} XFA
                        </span>
                      ) : (
                        <span className="product-price">
                          {selectedProduct.unit_price || 0} XFA
                        </span>
                      )}
                    </div>

                    <div className="product-details-description">
                      <h4>Description</h4>
                      <p>
                        {selectedProduct.description ||
                          "No description available"}
                      </p>
                    </div>

                    <div className="product-details-specs">
                      <div className="details-spec-item">
                        <strong>Min Quantity:</strong>{" "}
                        {selectedProduct.min_quantity || 0}
                      </div>
                      <div className="details-spec-item">
                        <strong>Expiry Date:</strong>{" "}
                        {selectedProduct.expiry_date
                          ? new Date(
                              selectedProduct.expiry_date,
                            ).toLocaleDateString()
                          : "N/A"}
                      </div>
                      {selectedProduct.on_promotion && (
                        <>
                          <div className="details-spec-item">
                            <strong>Promotion Start:</strong>{" "}
                            {selectedProduct.promotion_start_date
                              ? new Date(
                                  selectedProduct.promotion_start_date,
                                ).toLocaleDateString()
                              : "N/A"}
                          </div>
                          <div className="details-spec-item">
                            <strong>Promotion End:</strong>{" "}
                            {selectedProduct.promotion_end_date
                              ? new Date(
                                  selectedProduct.promotion_end_date,
                                ).toLocaleDateString()
                              : "N/A"}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="product-details-actions">
                      <button
                        className="action-btn edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProduct({
                            product: selectedProduct,
                            category: selectedProduct.category,
                            subcategory: selectedProduct.subcategory,
                          });
                          setShowDetailsModal(false);
                        }}
                      >
                        <Edit size={16} /> Edit
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(selectedProduct.id);
                          setShowDetailsModal(false);
                        }}
                      >
                        <Trash2 size={16} /> Delete
                      </button>
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

export default Product;
