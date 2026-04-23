export interface HistoricalData {
  year: number;
  months: HistoricalMonth[];
}

export interface HistoricalMonth {
  date: string;
  tempMax: number;
  tempMin: number;
  tempMean: number;
  precipitation: number;
}

export interface HistoricalSummary {
  currentYear: HistoricalData;
  previousYears: HistoricalData[];
}
