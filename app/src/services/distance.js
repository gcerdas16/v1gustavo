import axios from "axios";
const API_KEY = "AIzaSyBr6lLXaoC7U4383GVx9CaIj8ofW2knPfQ";
const BASE_URL = "https://maps.googleapis.com/maps/api/distancematrix/json";
async function getDistance(origin, destination) {
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                origins: origin,
                destinations: destination,
                key: API_KEY,
                units: "metric",
            },
        });
        const data = response.data;
        if (data.status !== "OK") {
            throw new Error(`Error en la API: ${data.status}`);
        }
        const element = data.rows[0].elements[0];
        if (element.status !== "OK") {
            throw new Error(`No se pudo calcular la distancia: ${element.status}`);
        }
        return {
            distance_km: element.distance.value / 1000,
            duration_min: element.duration.value / 60,
        };
    }
    catch (error) {
        console.error("Error obteniendo la distancia:", error);
        return null;
    }
}
export { getDistance };
