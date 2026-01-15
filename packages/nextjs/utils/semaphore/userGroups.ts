import { createPublicClient, http } from "viem";
import deployedContracts from "~~/contracts/deployedContracts";
import scaffoldConfig from "~~/scaffold.config";
import { getTargetNetworks } from "~~/utils/scaffold-eth/networks";

export type GroupWithRegistryId = {
  registryId: number;
  groupId: bigint;
  creator: string;
  name: string;
  description: string;
  createdAt: bigint;
  exists: boolean;
};

/**
 * Fetch user's joined groups by listening to MemberJoined events
 * @param userAddress - The user's wallet address
 * @returns Array of groups with registryId included
 */
export async function fetchUserGroups(userAddress: string): Promise<GroupWithRegistryId[]> {
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
          member: userAddress as `0x${string}`,
        },
        fromBlock: fromBlock,
        toBlock: toBlock,
      });

      allEvents.push(...events);
    }

    // Extract unique registryIds
    const registryIds = new Set<number>();
    for (const event of allEvents) {
      if (event.args && event.args.registryId !== undefined) {
        registryIds.add(Number(event.args.registryId));
      }
    }

    // Fetch full group data for each registryId
    const groups: GroupWithRegistryId[] = [];
    for (const registryId of registryIds) {
      const groupData = await client.readContract({
        address: pingContract.address as `0x${string}`,
        abi: pingContract.abi,
        functionName: "groups",
        args: [BigInt(registryId)],
      });

      if (groupData) {
        const [groupId, creator, name, description, createdAt, exists] = groupData as [
          bigint,
          string,
          string,
          string,
          bigint,
          boolean,
        ];
        if (exists) {
          groups.push({
            registryId,
            groupId,
            creator,
            name,
            description,
            createdAt,
            exists,
          });
        }
      }
    }

    return groups;
  } catch (error) {
    console.error("Error fetching user groups:", error);
    throw error;
  }
}
