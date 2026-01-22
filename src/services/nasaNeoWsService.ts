import axios from "axios";
import { z } from "zod";
import { DaemoFunction } from "daemo-engine";
import { calculateRiskLevel, RiskLevel } from "../lib/hazard";

type OutAsteroid = {
  id: string;
  name: string;
  hazardous: boolean;
  diameterMeters: number;
  relativeVelocityKps: number;
  missDistanceKm: number;
  closeApproachDate: string;
  riskLevel: RiskLevel;
};

const InputSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("YYYY-MM-DD"),
});

const AsteroidSchema = z.object({
  id: z.string(),
  name: z.string(),
  hazardous: z.boolean(),
  diameterMeters: z.number(),
  relativeVelocityKps: z.number(),
  missDistanceKm: z.number(),
  closeApproachDate: z.string(),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

export class NasaNeoWsService {
  @DaemoFunction({
    description:
      "Fetch Near-Earth Objects from NASA NeoWs feed for a date range. Returns enriched asteroid list with diameter, velocity, miss distance, close approach date, and computed risk level.",
    tags: ["NASA", "NeoWs", "asteroids", "risk"],
    category: "NASA",
    inputSchema: InputSchema,
    outputSchema: z.object({
      count: z.number(),
      asteroids: z.array(AsteroidSchema),
    }),
  })
  async fetchAsteroids(input: { startDate: string; endDate: string }) {
    const apiKey = process.env.NASA_API_KEY;
    if (!apiKey) throw new Error("NASA_API_KEY is not set");

    const res = await axios.get("https://api.nasa.gov/neo/rest/v1/feed", {
      params: { start_date: input.startDate, end_date: input.endDate, api_key: apiKey },
      timeout: 15000,
    });

    const neos = res.data?.near_earth_objects ?? {};
    const out: OutAsteroid[] = [];

    for (const date of Object.keys(neos)) {
      for (const neo of neos[date] ?? []) {
        const diameterMeters = Number(
          neo?.estimated_diameter?.meters?.estimated_diameter_max ?? 0
        );

        const ca = Array.isArray(neo?.close_approach_data)
          ? neo.close_approach_data[0]
          : null;

        const relativeVelocityKps = Number(
          ca?.relative_velocity?.kilometers_per_second ?? 0
        );

        const missDistanceKm = Number(ca?.miss_distance?.kilometers ?? 0);

        const closeApproachDate = String(ca?.close_approach_date ?? date);

        const hazardous = Boolean(neo?.is_potentially_hazardous_asteroid);

        const riskLevel = calculateRiskLevel({
          hazardousFlag: hazardous,
          diameterMeters,
          relativeVelocityKps,
          missDistanceKm,
        });

        out.push({
          id: String(neo.id),
          name: String(neo.name),
          hazardous,
          diameterMeters,
          relativeVelocityKps,
          missDistanceKm,
          closeApproachDate,
          riskLevel,
        });
      }
    }

    out.sort((a, b) => {
      const rank = (r: RiskLevel) => (r === "HIGH" ? 3 : r === "MEDIUM" ? 2 : 1);
      const dr = rank(b.riskLevel) - rank(a.riskLevel);
      if (dr !== 0) return dr;
      return b.diameterMeters - a.diameterMeters;
    });

    return { count: out.length, asteroids: out };
  }

  @DaemoFunction({
    description:
      "Summarize asteroid risk levels for a date range. Returns counts by risk level and the top 5 highest-risk asteroids.",
    tags: ["NASA", "NeoWs", "risk", "summary"],
    category: "NASA",
    inputSchema: InputSchema,
    outputSchema: z.object({
      total: z.number(),
      byRisk: z.object({
        LOW: z.number(),
        MEDIUM: z.number(),
        HIGH: z.number(),
      }),
      topHighRisk: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          diameterMeters: z.number(),
          relativeVelocityKps: z.number(),
          missDistanceKm: z.number(),
        })
      ),
    }),
  })
  async summarizeAsteroidRisk(input: { startDate: string; endDate: string }) {
    const { asteroids } = await this.fetchAsteroids(input);

    const byRisk: Record<RiskLevel, number> = { LOW: 0, MEDIUM: 0, HIGH: 0 };
    for (const a of asteroids) byRisk[a.riskLevel]++;

    const topHighRisk = asteroids
      .filter((a) => a.riskLevel === "HIGH")
      .slice(0, 5)
      .map((a) => ({
        id: a.id,
        name: a.name,
        diameterMeters: a.diameterMeters,
        relativeVelocityKps: a.relativeVelocityKps,
        missDistanceKm: a.missDistanceKm,
      }));

    return { total: asteroids.length, byRisk, topHighRisk };
  }
}
