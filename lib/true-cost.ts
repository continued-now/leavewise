/** Common airport pairs with typical ground transport costs and times. */
export interface AirportPairPreset {
  label: string;
  mainAirport: string;
  altAirport: string;
  /** One-way transport cost in USD from alt airport to typical city center */
  altTransportCost: number;
  /** One-way transport time in minutes from alt airport */
  altTransportMinutes: number;
  /** One-way transport cost from main airport for comparison */
  mainTransportCost: number;
  /** One-way transport time from main airport in minutes */
  mainTransportMinutes: number;
  region: 'US' | 'KR' | 'JP' | 'EU';
}

export const AIRPORT_PRESETS: AirportPairPreset[] = [
  // US metro areas
  { label: 'New York: JFK vs Newark (EWR)', mainAirport: 'JFK', altAirport: 'EWR', altTransportCost: 25, altTransportMinutes: 50, mainTransportCost: 30, mainTransportMinutes: 60, region: 'US' },
  { label: 'New York: JFK vs LaGuardia (LGA)', mainAirport: 'JFK', altAirport: 'LGA', altTransportCost: 20, altTransportMinutes: 35, mainTransportCost: 30, mainTransportMinutes: 60, region: 'US' },
  { label: 'SF Bay Area: SFO vs Oakland (OAK)', mainAirport: 'SFO', altAirport: 'OAK', altTransportCost: 15, altTransportMinutes: 40, mainTransportCost: 10, mainTransportMinutes: 25, region: 'US' },
  { label: 'SF Bay Area: SFO vs San Jose (SJC)', mainAirport: 'SFO', altAirport: 'SJC', altTransportCost: 20, altTransportMinutes: 50, mainTransportCost: 10, mainTransportMinutes: 25, region: 'US' },
  { label: 'LA: LAX vs Burbank (BUR)', mainAirport: 'LAX', altAirport: 'BUR', altTransportCost: 15, altTransportMinutes: 30, mainTransportCost: 20, mainTransportMinutes: 40, region: 'US' },
  { label: 'LA: LAX vs Long Beach (LGB)', mainAirport: 'LAX', altAirport: 'LGB', altTransportCost: 18, altTransportMinutes: 35, mainTransportCost: 20, mainTransportMinutes: 40, region: 'US' },
  { label: 'LA: LAX vs Ontario (ONT)', mainAirport: 'LAX', altAirport: 'ONT', altTransportCost: 30, altTransportMinutes: 70, mainTransportCost: 20, mainTransportMinutes: 40, region: 'US' },
  { label: 'Chicago: ORD vs Midway (MDW)', mainAirport: 'ORD', altAirport: 'MDW', altTransportCost: 12, altTransportMinutes: 30, mainTransportCost: 15, mainTransportMinutes: 45, region: 'US' },
  { label: 'DC: DCA vs Dulles (IAD)', mainAirport: 'DCA', altAirport: 'IAD', altTransportCost: 30, altTransportMinutes: 60, mainTransportCost: 10, mainTransportMinutes: 20, region: 'US' },
  { label: 'DC: DCA vs Baltimore (BWI)', mainAirport: 'DCA', altAirport: 'BWI', altTransportCost: 25, altTransportMinutes: 55, mainTransportCost: 10, mainTransportMinutes: 20, region: 'US' },
  { label: 'Houston: IAH vs Hobby (HOU)', mainAirport: 'IAH', altAirport: 'HOU', altTransportCost: 15, altTransportMinutes: 25, mainTransportCost: 25, mainTransportMinutes: 40, region: 'US' },
  { label: 'Dallas: DFW vs Love Field (DAL)', mainAirport: 'DFW', altAirport: 'DAL', altTransportCost: 12, altTransportMinutes: 20, mainTransportCost: 25, mainTransportMinutes: 40, region: 'US' },
  // Japan (relevant for Korean travelers)
  { label: 'Tokyo: Haneda (HND) vs Narita (NRT)', mainAirport: 'HND', altAirport: 'NRT', altTransportCost: 30, altTransportMinutes: 75, mainTransportCost: 12, mainTransportMinutes: 25, region: 'JP' },
  { label: 'Osaka: Itami (ITM) vs Kansai (KIX)', mainAirport: 'ITM', altAirport: 'KIX', altTransportCost: 15, altTransportMinutes: 60, mainTransportCost: 8, mainTransportMinutes: 30, region: 'JP' },
  // Europe
  { label: 'London: Heathrow (LHR) vs Stansted (STN)', mainAirport: 'LHR', altAirport: 'STN', altTransportCost: 20, altTransportMinutes: 70, mainTransportCost: 8, mainTransportMinutes: 30, region: 'EU' },
  { label: 'London: Heathrow (LHR) vs Gatwick (LGW)', mainAirport: 'LHR', altAirport: 'LGW', altTransportCost: 15, altTransportMinutes: 50, mainTransportCost: 8, mainTransportMinutes: 30, region: 'EU' },
  { label: 'Paris: CDG vs Orly (ORY)', mainAirport: 'CDG', altAirport: 'ORY', altTransportCost: 10, altTransportMinutes: 30, mainTransportCost: 12, mainTransportMinutes: 40, region: 'EU' },
  { label: 'Milan: Malpensa (MXP) vs Linate (LIN)', mainAirport: 'MXP', altAirport: 'LIN', altTransportCost: 5, altTransportMinutes: 20, mainTransportCost: 15, mainTransportMinutes: 55, region: 'EU' },
  // Korea (destination context)
  { label: 'Seoul: Incheon (ICN) vs Gimpo (GMP)', mainAirport: 'ICN', altAirport: 'GMP', altTransportCost: 5, altTransportMinutes: 30, mainTransportCost: 12, mainTransportMinutes: 55, region: 'KR' },
];

export interface TrueCostResult {
  /** Total true cost of flying from main airport (round trip transport included) */
  mainTrueCost: number;
  /** Total true cost of flying from alt airport */
  altTrueCost: number;
  /** Cost of time spent on extra transport (alt - main, round trip) */
  timeCostDifference: number;
  /** Transport cost difference (alt - main, round trip) */
  transportCostDifference: number;
  /** Ticket price difference (alt - main) */
  ticketDifference: number;
  /** Net savings of alt airport (negative = alt is more expensive overall) */
  netSavings: number;
  /** Extra round-trip minutes for alt airport */
  extraMinutes: number;
  verdict: 'alt-wins' | 'main-wins' | 'wash';
}

export function calculateTrueCost(
  mainTicket: number,
  altTicket: number,
  mainTransportCost: number,
  mainTransportMinutes: number,
  altTransportCost: number,
  altTransportMinutes: number,
  hourlyRate: number,
  travelers: number,
): TrueCostResult {
  const mainTransportRoundTrip = mainTransportCost * 2 * travelers;
  const altTransportRoundTrip = altTransportCost * 2 * travelers;

  const mainTimeRoundTrip = mainTransportMinutes * 2;
  const altTimeRoundTrip = altTransportMinutes * 2;

  const mainTimeCost = (mainTimeRoundTrip / 60) * hourlyRate;
  const altTimeCost = (altTimeRoundTrip / 60) * hourlyRate;

  const mainTrueCost = (mainTicket * travelers) + mainTransportRoundTrip + mainTimeCost;
  const altTrueCost = (altTicket * travelers) + altTransportRoundTrip + altTimeCost;

  const netSavings = mainTrueCost - altTrueCost;
  const extraMinutes = altTimeRoundTrip - mainTimeRoundTrip;

  return {
    mainTrueCost: Math.round(mainTrueCost),
    altTrueCost: Math.round(altTrueCost),
    timeCostDifference: Math.round(altTimeCost - mainTimeCost),
    transportCostDifference: Math.round(altTransportRoundTrip - mainTransportRoundTrip),
    ticketDifference: Math.round((altTicket - mainTicket) * travelers),
    netSavings: Math.round(netSavings),
    extraMinutes,
    verdict: netSavings > 10 ? 'alt-wins' : netSavings < -10 ? 'main-wins' : 'wash',
  };
}
