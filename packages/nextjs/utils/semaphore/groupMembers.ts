import { createPublicClient, http } from "viem";
import deployedContracts from "~~/contracts/deployedContracts";
import scaffoldConfig from "~~/scaffold.config";
import { getTargetNetworks } from "~~/utils/scaffold-eth/networks";

/**
 * Fetch all members of a group by listening to MemberJoined events
 * @param registryId - The registry ID of the group
 * @returns Array of identity commitments of all members
 */
export async function fetchGroupMembers(registryId: number): Promise<bigint[]> {
  try {
    const targetNetworks = getTargetNetworks();
    const targetNetwork = targetNetworks[0];

    if (!targetNetwork) {
      throw new Error("No target network found");
    }

    const chainId = targetNetwork.id;
    const contracts = deployedContracts[chainId as keyof typeof deployedContracts];

    if (!contracts || !contracts.Ping) {
      throw new Error(`Ping contract not found for chain ${chainId}`);
    }

    const pingContract = contracts.Ping;

    // Create public client for this network
    const rpcUrl =
      scaffoldConfig.rpcOverrides?.[chainId as keyof typeof scaffoldConfig.rpcOverrides] ||
      targetNetwork.rpcUrls.default.http[0];
    const client = createPublicClient({
      chain: targetNetwork,
      transport: http(rpcUrl),
    });

    // Get current block number
    const currentBlock = await client.getBlockNumber();

    // Query logs in chunks to avoid RPC limit (Mantle Sepolia has 10,000 block limit)
    const BLOCK_CHUNK_SIZE = 10000n;
    const allEvents: any[] = [];

    // Start from a reasonable block (e.g., last 100,000 blocks or contract deployment)
    const startBlock = currentBlock > 100000n ? currentBlock - 100000n : 0n;

    for (let fromBlock = startBlock; fromBlock <= currentBlock; fromBlock += BLOCK_CHUNK_SIZE) {
      const toBlock = fromBlock + BLOCK_CHUNK_SIZE - 1n > currentBlock ? currentBlock : fromBlock + BLOCK_CHUNK_SIZE - 1n;

      const events = await client.getLogs({
        address: pingContract.address as `0x${string}`,
        event: {
          type: "event",
          name: "MemberJoined",
          inputs: [
            {
              indexed: true,
              name: "registryId",
              type: "uint256",
            },
            {
              indexed: true,
              name: "member",
              type: "address",
            },
            {
              indexed: false,
              name: "commitment",
              type: "uint256",
            },
          ],
        },
        args: {
          registryId: BigInt(registryId),
        },
        fromBlock: fromBlock,
        toBlock: toBlock,
      });

      allEvents.push(...events);
    }

    // Extract commitments from events
    const commitments: bigint[] = [];

    for (const event of allEvents) {
      if (event.args && event.args.commitment) {
        commitments.push(event.args.commitment as bigint);
      }
    }

    if (commitments.length === 0) {
      throw new Error("No members found in this group. Someone must join before creating posts.");
    }

    return commitments;
  } catch (error) {
    console.error("Error fetching group members:", error);
    throw error;
  }
}
