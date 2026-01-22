import "dotenv/config";
import "reflect-metadata";
import { DaemoBuilder, DaemoHostedConnection } from "daemo-engine";
import { NasaNeoWsService } from "./services/nasaNeoWsService";

async function main() {
  const builder = new DaemoBuilder()
    .withServiceName("nasa_data_archivist")
    .withSystemPrompt(`
You are the NASA Data Archivist.

You have access to tools:
- fetchAsteroids(startDate, endDate)
- summarizeAsteroidRisk(startDate, endDate)

Always:
- Ask for startDate/endDate if missing.
- Use the tools when relevant.
- Return concise results with counts and key highlights.
`);


  // Register services (tools)
  builder.registerService(new NasaNeoWsService());

  const sessionData = builder.build();

  const gatewayUrl = process.env.DAEMO_GATEWAY_URL || "https://engine.daemo.ai:50052";
  const agentApiKey = process.env.DAEMO_AGENT_API_KEY;
  if (!agentApiKey) throw new Error("DAEMO_AGENT_API_KEY is not set");

  const connection = new DaemoHostedConnection(
    { daemoGatewayUrl: gatewayUrl, agentApiKey },
    sessionData
  );

  await connection.start();
  console.log("✅ Daemo hosted connection online");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
