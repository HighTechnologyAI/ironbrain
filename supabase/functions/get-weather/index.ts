import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WeatherData {
  temperature: number;
  wind_speed: number;
  wind_direction: number;
  visibility: number;
  pressure: number;
  humidity: number;
  weather_condition: string;
  location: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lon } = await req.json();
    
    // Default to Timarevo Airfield coordinates if not provided
    const latitude = lat || 43.388944;  // 43°23'20.2"N
    const longitude = lon || 26.885444; // 26°53'07.6"E
    
    const apiKey = Deno.env.get('OPENWEATHER_API_KEY');
    
    if (!apiKey) {
      throw new Error('OpenWeather API key not configured');
    }

    console.log(`Fetching weather for coordinates: ${latitude}, ${longitude}`);

    // Fetch current weather data
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=ru`
    );

    if (!weatherResponse.ok) {
      throw new Error(`Weather API error: ${weatherResponse.status}`);
    }

    const weatherData = await weatherResponse.json();
    
    console.log('Weather data received:', weatherData);

    const result: WeatherData = {
      temperature: Math.round(weatherData.main.temp),
      wind_speed: Math.round(weatherData.wind.speed),
      wind_direction: weatherData.wind.deg || 0,
      visibility: Math.round((weatherData.visibility || 10000) / 1000), // Convert to km
      pressure: weatherData.main.pressure,
      humidity: weatherData.main.humidity,
      weather_condition: weatherData.weather[0].description,
      location: weatherData.name || 'Timarevo Airfield'
    };

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );

  } catch (error) {
    console.error('Error fetching weather:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        // Fallback data
        temperature: 12,
        wind_speed: 7,
        wind_direction: 45,
        visibility: 8.5,
        pressure: 1013,
        humidity: 65,
        weather_condition: 'ясно',
        location: 'Timarevo Airfield'
      }),
      {
        status: 200, // Return 200 with fallback data instead of error
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});