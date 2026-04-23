export interface MarineData {
  current: MarineCurrent;
  hourly: MarineHourly[];
}

export interface MarineCurrent {
  waveHeight: number;
  wavePeriod: number;
  waveDirection: number;
  swellHeight: number;
  swellPeriod: number;
  swellDirection: number;
  windWaveHeight: number;
}

export interface MarineHourly {
  time: string;
  waveHeight: number;
  wavePeriod: number;
  waveDirection: number;
  swellHeight: number;
}
