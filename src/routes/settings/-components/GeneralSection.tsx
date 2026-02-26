import {
	Box,
	Card,
	Switch,
	TextField,
	Typography,
} from "@mui/material";
import SettingRow from "./SettingRow";
import useGetApplicationSettings from "../../../hooks/queries/useGetApplicationSettings";
import useUpdateSettings from "../../../hooks/mutations/useUpdateSettings";

const GeneralSection = () => {
	const { data: settings } = useGetApplicationSettings();
	const { mutate: updateSettings } = useUpdateSettings();

	const handleToggleCloseBehavior = () => {
		if (!settings) return;
		updateSettings({
			...settings,
			close_behavior:
				settings.close_behavior === "hide" ? "destroy" : "hide",
		});
	};

	const handleToggleStartOnStartup = () => {
		if (!settings) return;
		updateSettings({
			...settings,
			start_on_startup: !settings.start_on_startup,
		});
	};
	
	return (
		<Card elevation={0} sx={{ p: 3, borderRadius: 3 }}>
			<Typography variant="h5" fontWeight={500} sx={{ mb: 2 }}>
				General
			</Typography>

			<SettingRow
				label="Window Close Behavior"
				description="Hide keeps the window in memory for faster reopening. Destroy frees memory but takes longer to reopen."
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
					<Typography variant="body2" color="text.secondary">
						Destroy
					</Typography>
					<Switch
						checked={settings?.close_behavior === "hide"}
						onChange={handleToggleCloseBehavior}
					/>
					<Typography variant="body2" color="text.secondary">
						Hide
					</Typography>
				</Box>
			</SettingRow>

			<SettingRow
				label="Open on Startup"
				description="If disabled, you'll need to manually run the executable for screen time tracking to begin."
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
					<Typography variant="body2" color="text.secondary">
						No
					</Typography>
					<Switch defaultChecked={false} 
						checked={settings?.start_on_startup}
						onChange={handleToggleStartOnStartup}
					/>
					<Typography variant="body2" color="text.secondary">
						Yes
					</Typography>
				</Box>
			</SettingRow>

			<SettingRow
				label="Idle Duration"
				description="After this many minutes without input, tracking will pause automatically."
			>
				<TextField
					type="number"
					size="small"
					defaultValue={2}
					slotProps={{ htmlInput: { min: 1, max: 60 } }}
					sx={{ width: 80 }}
					disabled
				/>
			</SettingRow>
		</Card>
	);
};

export default GeneralSection;
