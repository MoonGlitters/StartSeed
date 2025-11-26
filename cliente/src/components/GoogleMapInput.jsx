import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export const GoogleMapInput = ({ onLocationSelect, defaultAddress = "" }) => {
  const [address, setAddress] = useState(defaultAddress);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    // Función para cargar Google Maps API
    const loadGoogleMaps = () => {
      return new Promise((resolve, reject) => {
        // Si ya esta cargada, resolver inmediatamente
        if (window.google && window.google.maps && window.google.maps.places) {
          setIsScriptLoaded(true);
          resolve();
          return;
        }

        // Si ya hay un script cargándose, esperar a que termine
        if (document.querySelector('script[src*="maps.googleapis.com"]')) {
          const checkInterval = setInterval(() => {
            if (window.google && window.google.maps && window.google.maps.places) {
              clearInterval(checkInterval);
              setIsScriptLoaded(true);
              resolve();
            }
          }, 100);
          return;
        }

        // Crear y cargar el script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          console.log("Google Maps API cargada correctamente");
          setIsScriptLoaded(true);
          resolve();
        };
        
        script.onerror = (error) => {
          console.error("Error cargando Google Maps API:", error);
          reject(error);
        };

        document.head.appendChild(script);
      });
    };

    // Función para inicializar el autocomplete
    const initializeAutocomplete = () => {
      if (!inputRef.current || !window.google || !window.google.maps.places) {
        console.error("Google Maps Places API no disponible");
        return;
      }

      try {
        console.log("Inicializando Autocomplete...");
        
        // Usar la versión legacy que funciona
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          inputRef.current,
          {
            types: ['establishment'],
            componentRestrictions: { country: 'cl' }
          }
        );

        // Escuchar cuando se selecciona un lugar
        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current.getPlace();
          handlePlaceSelect(place);
        });

        console.log("Autocomplete inicializado correctamente");

      } catch (error) {
        console.error("Error inicializando autocomplete:", error);
      }
    };

    // Función para manejar la selección de lugar
    const handlePlaceSelect = (place) => {
      if (place.geometry && place.formatted_address) {
        const location = place.geometry.location;
        
        const locationData = {
          direccion_texto: place.formatted_address,
          google_place_id: place.place_id || '',
          latitud: location.lat(),
          longitud: location.lng()
        };

        setAddress(place.formatted_address);
        setCoordinates({
          lat: location.lat(),
          lng: location.lng()
        });
        
        // Pasar datos al componente padre
        onLocationSelect(locationData);

        console.log("Ubicación seleccionada:", locationData);
      } else {
        console.log("Lugar seleccionado sin geometría:", place);
      }
    };

    // Cargar e inicializar
    loadGoogleMaps()
      .then(() => {
        // Pequeño delay para asegurar que todo esté listo
        setTimeout(() => {
          initializeAutocomplete();
        }, 100);
      })
      .catch(error => {
        console.error("Error cargando Google Maps:", error);
      });

    // Cleanup
    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onLocationSelect]);

  return (
    <div className="space-y-3">
      <Label htmlFor="direccion" className="font-medium text-gray-700">
        Dirección de la Empresa *
      </Label>
      
      <Input
        ref={inputRef}
        id="direccion"
        name="direccion"
        placeholder="Busca tu dirección (ej: 'Restaurant Santiago Centro')..."
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="w-full"
        required
      />
      
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-3">
          <p className="text-sm text-blue-700">
            Instrucciones: Escribe el nombre o dirección de tu negocio y selecciona de la lista.
          </p>
          {!isScriptLoaded && (
            <p className="text-sm text-orange-600 mt-1">
              Cargando Google Maps...
            </p>
          )}
        </CardContent>
      </Card>

      {/* Mostrar coordenadas seleccionadas */}
      {coordinates.lat && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          Coordenadas: Lat: {coordinates.lat.toFixed(6)}, Lng: {coordinates.lng.toFixed(6)}
        </div>
      )}
    </div>
  );
};