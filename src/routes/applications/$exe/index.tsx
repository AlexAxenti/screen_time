import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/applications/$exe/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { exe } = Route.useParams();

	return <div>{exe} Details</div>;
}
