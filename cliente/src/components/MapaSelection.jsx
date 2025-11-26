import { useState } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

export const MapaSelection = ({
  onLocationSelect,
  defaultLat = -36.6066,
  defaultLng = -72.1034,
  libraries = ["places"], // ahora se puede pasar desde el padre
}) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [selectedLocation, setSelectedLocation] = useState({
    lat: defaultLat,
    lng: defaultLng,
    address: "",
  });

  // Reverse geocoding: de lat/lng a dirección
  const getAddressFromLatLng = async (lat, lng) => {
    const geocoder = new window.google.maps.Geocoder();
    return new Promise((resolve) => {
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results[0]) resolve(results[0].formatted_address);
        else resolve("");
      });
    });
  };

  const handleMapClick = async (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const address = await getAddressFromLatLng(lat, lng);
    setSelectedLocation({ lat, lng, address });
  };

  const handleAceptar = () => {
    onLocationSelect({
      latitud: selectedLocation.lat,
      longitud: selectedLocation.lng,
      direccion_texto: selectedLocation.address,
    });
  };

  if (loadError) return <div>Error al cargar Google Maps</div>;
  if (!isLoaded) return <div>Cargando mapa...</div>;

  return (
    <div>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "400px" }}
        center={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
        zoom={15} // zoom inicial más cercano para direcciones
        onClick={handleMapClick}
      >
        <Marker position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }} />
      </GoogleMap>

      <div className="flex justify-between mt-2 items-center">
        <span className="text-gray-600">
          {selectedLocation.address || "Haz click en el mapa para seleccionar la ubicación"}
        </span>
        <button
          onClick={handleAceptar}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
};
