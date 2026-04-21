export const WEATHER_CODES: Record<number, { label: string; icon: string }> = {
  0: { label: 'Céu limpo', icon: '☀️' },
  1: { label: 'Majoritariamente limpo', icon: '🌤️' },
  2: { label: 'Parcialmente nublado', icon: '⛅' },
  3: { label: 'Nublado', icon: '☁️' },
  45: { label: 'Neblina', icon: '🌫️' },
  48: { label: 'Neblina gelada', icon: '🌫️' },
  51: { label: 'Garoa fraca', icon: '🌦️' },
  53: { label: 'Garoa', icon: '🌦️' },
  55: { label: 'Garoa forte', icon: '🌧️' },
  61: { label: 'Chuva fraca', icon: '🌧️' },
  63: { label: 'Chuva', icon: '🌧️' },
  65: { label: 'Chuva forte', icon: '🌧️' },
  71: { label: 'Neve fraca', icon: '🌨️' },
  73: { label: 'Neve', icon: '🌨️' },
  75: { label: 'Neve forte', icon: '❄️' },
  80: { label: 'Pancadas fracas', icon: '🌦️' },
  81: { label: 'Pancadas de chuva', icon: '🌧️' },
  82: { label: 'Pancadas fortes', icon: '⛈️' },
  95: { label: 'Trovoada', icon: '⛈️' },
  96: { label: 'Trovoada c/ granizo', icon: '⛈️' },
  99: { label: 'Trovoada forte', icon: '⛈️' },
};

export function getWeatherInfo(code: number): { label: string; icon: string } {
  return WEATHER_CODES[code] ?? { label: 'Unknown', icon: '🌡️' };
}
