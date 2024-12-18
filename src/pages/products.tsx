"use client";
import React, { useState, useEffect, useContext } from "react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { useAppContext } from "@/context";
import Chatbot from "@/components/Chatbot";
import { AddToCartService } from "../services/AddToCartService";
import { Image, Product } from "../types/types";
import Footer from "@/components/Footer";
import { CardBody, CardContainer, CardItem } from "../components/ui/3d-card";
import { API_URL } from "@/libs/constants";

const ProductPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<string>(""); // Estado para el filtro activo
  const [sortOrder, setSortOrder] = useState<string>("");
  const { numberOfProductsInCart, setNumberOfProductsInCart, cart, setCart } =
    useAppContext();

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch(`${API_URL}/producto`);
      const data: Product[] = await response.json();
      console.log(data); // Check the structure here
      setProducts(data);
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (product: Product) => {
    setCart((prevCart: Product[]) => {
      // Verificar si el producto ya está en el carrito
      const existingProduct = prevCart.find(
        (item) => item.id_producto === product.id_producto
      );
  
      if (existingProduct) {
        // Si el producto ya existe, actualizamos su cantidad
        return prevCart.map((item) =>
          item.id_producto === product.id_producto
            ? { ...item, cantidad: item.cantidad + 1 } // Aumentamos la cantidad
            : item
        );
      } else {
        // Si no existe, lo agregamos al carrito
        return [...prevCart, { ...product, cantidad: 1 }];
      }
    });
  
    // Actualizamos el número de productos en el carrito
    setNumberOfProductsInCart((prevCount) => prevCount + 1);
  
    // Guardamos la información del usuario en el localStorage
    const storedUserData: any = localStorage.getItem("userData");
    const userData = JSON.parse(storedUserData);
  
    try {
      // Llamada al servicio para agregar el producto al carrito en el backend
      const result = await AddToCartService(
        product.id_producto,
        userData.id_carrito,
        1 
      );
    } catch (error) {
      console.error("Error during adding to cart:", error);
    }
  };
  

  const filteredProducts = products.filter((product) => {
    const matchesSearchTerm = product.nombre_producto
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    if (activeFilter === "bajo-stock") {
      return matchesSearchTerm && product.stock_producto < 5;
    } else if (activeFilter === "alto-stock") {
      return matchesSearchTerm && product.stock_producto >= 5;
    } else if (activeFilter === "bajo-precio") {
      return matchesSearchTerm && parseFloat(product.precio_producto) < 50;
    } else if (activeFilter === "alto-precio") {
      return matchesSearchTerm && parseFloat(product.precio_producto) >= 50;
    }
    return matchesSearchTerm;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = parseFloat(a.precio_producto);
    const priceB = parseFloat(b.precio_producto);

    if (sortOrder === "asc") {
      return priceA - priceB; // Menor a mayor
    } else if (sortOrder === "desc") {
      return priceB - priceA; // Mayor a menor
    }
    return 0; // Sin orden específico
  });

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4 pt-56">
        <h1 className="text-2xl font-bold mb-4">Productos</h1>

        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border border-tertiarypagecolor bg-buttonpagecolor2 rounded mb-4 w-full focus:text-white"
        />

        <div className="mb-4 flex flex-wrap">
          <button
            onClick={() => setActiveFilter("bajo-stock")}
            className={`px-4 py-2 rounded m-2 sm:sm-0 ${
              activeFilter === "bajo-stock" ? "bg-buttonpagecolor2 text-white" : "bg-buttonpagecolor"
            } text-black font-semibold hover:opacity-90`}
          >
            Bajo Stock
          </button>
          <button
            onClick={() => setActiveFilter("alto-stock")}
            className={`px-4 py-2 rounded m-2 sm:sm-0 ${
              activeFilter === "alto-stock" ? "bg-buttonpagecolor2 text-white" : "bg-buttonpagecolor"
            } text-black font-semibold hover:opacity-90`}
          >
            Alto Stock
          </button>
          <button
            onClick={() => setActiveFilter("bajo-precio")}
            className={`px-4 py-2 rounded m-2 sm:sm-0 ${
              activeFilter === "bajo-precio" ? "bg-buttonpagecolor2 text-white" : "bg-buttonpagecolor"
            } text-black font-semibold hover:opacity-90`}
          >
            Bajo Precio
          </button>
          <button
            onClick={() => setActiveFilter("alto-precio")}
            className={`px-4 py-2 rounded m-2 sm:sm-0 ${
              activeFilter === "alto-precio" ? "bg-buttonpagecolor2 text-white" : "bg-buttonpagecolor"
            } text-black font-semibold hover:opacity-90`}
          >
            Alto Precio
          </button>
          <button
            onClick={() => setActiveFilter("")}
            className="p-2 m-2 sm:sm-0 bg-buttonpagecolor2 text-bgpagecolor font-semibold hover:opacity-90 rounded"
          >
            Limpiar Filtros
          </button>
        </div>

        <div className="mb-4">
          <button
            onClick={() => setSortOrder("asc")}
            className="p-2 m-2 sm:sm-0 bg-buttonpagecolor text-black font-semibold hover:opacity-90 rounded mr-2"
          >
            Precio: Menor a Mayor
          </button>
          <button
            onClick={() => setSortOrder("desc")}
            className="p-2 m-2 sm:m-0 bg-buttonpagecolor text-black font-semibold hover:opacity-90 rounded"
          >
            Precio: Mayor a Menor
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedProducts
            .filter((product) => product.stock_producto > 0) // Filtrar productos con stock >= 0
            .map((product) => (
            <ProductCard
              key={product.id_producto}
              title={product.nombre_producto}
              price={parseFloat(product.precio_producto)}
              imageUrl={
                product.imagen[0]?.url_imagen ||
                "https://img.freepik.com/premium-vector/default-image-icon-vector-missing-picture-page-website-design-mobile-app-no-photo-available_87543-11093.jpg"
              }
              stock={product.stock_producto}
              description={product.descripcion_producto}
              onAddToCart={() => handleAddToCart(product)}
              id={product.id_producto}
            />
          ))}
        </div>
      </div>
      <Chatbot />
      <Footer />
    </>
  );
};

export default ProductPage;
