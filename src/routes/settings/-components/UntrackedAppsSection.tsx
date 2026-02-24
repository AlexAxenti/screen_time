import {
	Box,
	Card,
	CircularProgress,
	Typography,
} from "@mui/material";
import useGetUntrackedApps from "../../../hooks/queries/useGetUntrackedApps";
import useToggleTrackedApp from "../../../hooks/mutations/useToggleTrackedApp";
import type { ApplicationInfo } from "../../../types/tauriDtos";
import AppSearchBar from "../../../components/UI/AppsSearchBar";
import UntrackedAppRow from "./UntrackedAppRow";

const UntrackedAppsSection = () => {
	const { data: untrackedApps, isLoading, isError } = useGetUntrackedApps();
	const toggleTracked = useToggleTrackedApp();

	const handleUntrack = (app: ApplicationInfo) => {
		toggleTracked.mutate({ appId: app.app_id, isTracked: false });
	};

	return (
		<Card elevation={0} sx={{ p: 3, borderRadius: 3 }}>
			<Typography variant="h5" fontWeight={500}>
				Untracked Applications
			</Typography>
			<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
				Untracked apps will not record future activity. Existing history will remain.
			</Typography>

			<AppSearchBar
				onSelect={handleUntrack}
				tracked={true}
				placeholder="Search apps to untrack..."
				showIcons
				fullWidth
			/>

			<Box
				sx={{
					mt: 2,
					maxHeight: 400,
					overflowY: "auto",
					border: "1px solid",
					borderColor: "divider",
					borderRadius: 2,
				}}
			>
				{isLoading && (
					<Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
						<CircularProgress size={24} />
					</Box>
				)}

				{isError && (
					<Typography color="error" sx={{ p: 2 }}>
						Failed to load untracked applications.
					</Typography>
				)}

				{!isLoading && !isError && (!untrackedApps || untrackedApps.length === 0) && (
					<Typography color="text.secondary" sx={{ p: 2, textAlign: "center" }}>
						No untracked applications. Use the search bar above to untrack an app.
					</Typography>
				)}

				{untrackedApps?.map((app) => (
					<UntrackedAppRow key={app.app_id} app={app} />
				))}
			</Box>
		</Card>
	);
};

export default UntrackedAppsSection;
