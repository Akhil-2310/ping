"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { type GroupWithRegistryId, fetchUserGroups } from "~~/utils/semaphore/userGroups";

export default function MyGroups() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [groups, setGroups] = useState<GroupWithRegistryId[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user's groups from events
  useEffect(() => {
    if (!address || !isConnected) {
      setGroups([]);
      return;
    }

    const loadGroups = async () => {
      setIsLoading(true);
      try {
        const userGroups = await fetchUserGroups(address);
        setGroups(userGroups);
      } catch (error) {
        console.error("Error loading groups:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadGroups();
  }, [address, isConnected]);

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  const handleViewGroup = (registryId: number) => {
    router.push(`/group/${registryId}`);
  };

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-base-200 text-base-content py-10 px-6">
        <section className="max-w-xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-primary text-center mb-6">My Anonymous Groups</h1>
          <div className="p-6 bg-base-100 rounded-lg shadow-lg border border-base-300">
            <p className="text-base-content opacity-70 text-center">Please connect your wallet to see your groups.</p>
          </div>
        </section>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-base-200 text-base-content py-10 px-6">
        <section className="max-w-xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-primary text-center mb-6">My Anonymous Groups</h1>
          <div className="p-6 bg-base-100 rounded-lg shadow-lg border border-base-300">
            <p className="text-base-content opacity-70 text-center">Loading your groups...</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-base-200 text-base-content py-10 px-6">
      <section className="max-w-xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-primary text-center mb-6">My Anonymous Groups</h1>

        {groups.length === 0 ? (
          <div className="p-6 bg-base-100 rounded-lg shadow-lg border border-base-300">
            <p className="text-base-content opacity-70 text-center mb-4">
              You haven&apos;t joined any groups yet. Browse groups to get started!
            </p>
            <div className="text-center">
              <button onClick={() => router.push("/browse-groups")} className="btn btn-primary">
                Browse Groups
              </button>
            </div>
          </div>
        ) : (
          groups.map(group => (
            <div
              key={group.registryId}
              className="card bg-base-100 shadow-xl p-6 space-y-3 border border-base-300 hover:border-primary transition-all duration-300"
            >
              <h2 className="font-bold text-xl text-base-content">{group.name}</h2>
              <p className="text-sm text-base-content opacity-70">{group.description}</p>
              <p className="text-xs text-base-content opacity-50">Joined on: {formatDate(group.createdAt)}</p>

              <div className="flex gap-4 pt-2">
                <button className="btn btn-primary btn-sm" onClick={() => handleViewGroup(group.registryId)}>
                  View Group
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => router.push(`/group/${group.registryId}/create-post`)}
                >
                  Create Post
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
}
