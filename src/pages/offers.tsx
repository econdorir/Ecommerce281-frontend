import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "@/components/Footer";
import { OfferSlideShow } from "@/components/OfferSlideShow";
import axios from "axios";

// Define la interfaz para el producto
interface Image {
  id_imagen: number;
  url_imagen: string;
  id_producto: number;
}

interface Product {
  id_producto: number;
  id_artesano: number;
  id_promocion: number;
  nombre_producto: string;
  precio_producto: number;
  descripcion_producto: string;
  stock_producto: string;
  imagen: Image[];
}

// Define la interfaz para la promoción
interface Offer {
  id_promocion: number;
  descuento_promocion: number;
  fecha_ini: Date;
  fecha_fin: Date;
  nombre_promocion: string;
}

const Offers: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productResponse = await axios.get<Product[]>(
          "http://localhost:5000/api/v1/producto/"
        );
        setProducts(productResponse.data);
        const offerResponse = await axios.get<Offer[]>(
          "http://localhost:5000/api/v1/promocion/"
        );
        setOffers(offerResponse.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getCurrentOffers = () => {
    const today = new Date(); // Fecha para pruebas
    return offers.filter((offer) => {
      const startDate = new Date(offer.fecha_ini);
      const endDate = new Date(offer.fecha_fin);
      return today >= startDate && today <= endDate;
    });
  };

  const currentOffers = getCurrentOffers();

  const filteredProducts = products.filter((product) =>
    currentOffers.some((offer) => offer.id_promocion === product.id_promocion)
  ).map((product) => {
    const offer = currentOffers.find((offer) => offer.id_promocion === product.id_promocion);
    const discountedPrice = offer ? product.precio_producto - (product.precio_producto * (offer.descuento_promocion / 100)) : product.precio_producto;

    return {
      ...product,
      precio_con_descuento: discountedPrice,
    };
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };


  if (loading) return <div className="text-center">Cargando...</div>;
  if (error) return <div className="text-red-500">Error al cargar los productos: {error}</div>;

  return (
    <>
      <Navbar />
      <div className="container mx-auto my-auto pt-40">
        
        {currentOffers.length > 0 ? (
          currentOffers.map((offer) => (
            <div key={offer.id_promocion} className="bg-black text-white text-center p-10 rounded-lg shadow-md mb-6 font-mono">
              <h1 className="text-3xl font-bold my-8">Ofertas Especiales</h1>
              <h1 className="text-3xl font-bold text-red-500 my-5">{offer.nombre_promocion}</h1>
              <h1 className="text-3xl font-bold text-yellow-300 my-5">{offer.descuento_promocion}% DE DESCUENTO EN PRODUCTOS SELECCIONADOS</h1>
              <p className="my-5 text-green-400"> Válido Del {formatDate(offer.fecha_ini)} Al {formatDate(offer.fecha_fin)}</p>
            </div>
          ))
        ) : (
          <h1 className="bg-black text-white text-center p-10 rounded-lg shadow-md mb-6 font-mono">No hay ofertas disponibles en este momento.</h1>
        )}
        {filteredProducts.length > 0 ? (
          
          <OfferSlideShow
            products={filteredProducts}
            className="block max-w-lg mx-auto"
          />
        ) : (
          <h2 className="bg-black text-white text-center p-10 rounded-lg shadow-md mb-6 font-mono">No hay productos relacionados con las ofertas actuales.</h2>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Offers;