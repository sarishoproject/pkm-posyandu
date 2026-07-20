import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "src/components/ui/button";
import type { User } from "src/types";

export const Route = createFileRoute("/users/$userId/")({
  component: RouteComponent,
});

const fetchUser = async (id: string) => {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) throw new Error("Gagal memuat data pengguna.");
  return response.json();
};

function RouteComponent() {
  const { userId } = Route.useParams();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["users", userId],
    queryFn: () => fetchUser(userId),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Details Pengguna</h1>
      <p>
        Hello {user?.name} (#{user?.id}), your email is {user?.email}, created
        at {user?.created_at}
      </p>
      <Button>
        <Link to="/users">kembali</Link>
      </Button>
    </div>
  );
}
