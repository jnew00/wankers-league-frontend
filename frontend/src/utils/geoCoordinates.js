import axios from "axios";

export const fetchCoordinates = async (address) => {
    try {
      const encodedApiKey = encodeURIComponent("bdf31d7c763e40f488a56562ebf7cabf");
      const encodeAddress = encodeURIComponent(address);
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeAddress}&key=${encodedApiKey}`;

    const response = await axios.get(url);
    
    if (response.data.results.length === 0) {
        throw new Error("No results found for the given address.");
      }
  
      const { lat, lng } = response.data.results[0].geometry;
      return { lat, lon: lng };
    } catch (error) {
      console.error("Error fetching coordinates:", error.message);
      return null;
    }
  };
  