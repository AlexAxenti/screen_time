import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/applications/")({
	component: Index,
});

function Index() {
  return (
    <div>
      <h1>Applications</h1>
      <p>TODO</p>
    </div>
  );
}