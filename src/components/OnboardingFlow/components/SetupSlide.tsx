import {
	Box,
	Button,
	Card,
	Link,
	Switch,
	Typography,
} from "@mui/material";
import type { CloseBehavior } from "../../../types/tauriDtos";

interface SetupSlideProps {
	closeBehavior: CloseBehavior;
	startOnStartup: boolean;
	onCloseBehaviorChange: (value: CloseBehavior) => void;
	onStartOnStartupChange: (value: boolean) => void;
	onStart: () => void;
	isSubmitting: boolean;
}

const SetupSlide = ({
	closeBehavior,
	startOnStartup,
	onCloseBehaviorChange,
	onStartOnStartupChange,
	onStart,
	isSubmitting,
}: SetupSlideProps) => {
	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: 4,
				width: "100%",
				maxWidth: 600,
			}}
		>
			<Typography variant="h4" fontWeight={600}>
				Configure Your Preferences
			</Typography>

			<Card
				elevation={0}
				sx={{ p: 3, borderRadius: 3, width: "100%" }}
			>
				{/* Close behavior */}
				<Box sx={{ mb: 3 }}>
					<Typography variant="h6" fontWeight={500} sx={{ mb: 0.5 }}>
						Window Close Behavior
					</Typography>
					<Typography
						variant="body2"
						color="text.secondary"
						sx={{ mb: 1.5 }}
					>
            Destroy frees up RAM but takes longer to reopen.
						Hide keeps the window in memory for faster reopening, but consumes more RAM.
					</Typography>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 1,
						}}
					>
						<Typography variant="body2" color="text.secondary" sx={{ minWidth: 52, textAlign: "right" }}>
							Hide
						</Typography>
						<Switch
							checked={closeBehavior === "destroy"}
							onChange={() =>
								onCloseBehaviorChange(
									closeBehavior === "destroy"
										? "hide"
										: "destroy"
								)
							}
						/>
						<Typography variant="body2" color="text.secondary">
							Destroy{" "}
							<Typography component="span" variant="caption" color="text.disabled" sx={{ marginLeft: 0.5 }}>
								(recommended)
							</Typography>
						</Typography>
					</Box>
				</Box>

				{/* Start on startup */}
				<Box>
					<Typography variant="h6" fontWeight={500} sx={{ mb: 0.5 }}>
						Open on Startup
					</Typography>
					<Typography
						variant="body2"
						color="text.secondary"
						sx={{ mb: 1.5 }}
					>
						If disabled, you'll need to manually run the executable
						for screen time tracking to begin.
					</Typography>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 1,
						}}
					>
						<Typography variant="body2" color="text.secondary" sx={{ minWidth: 52, textAlign: "right" }}>
							No
						</Typography>
						<Switch
							checked={startOnStartup}
							onChange={() =>
								onStartOnStartupChange(!startOnStartup)
							}
						/>
						<Typography variant="body2" color="text.secondary">
							Yes{" "}
							<Typography component="span" variant="caption" color="text.disabled" sx={{ marginLeft: 0.5 }}>
								(recommended)
							</Typography>
						</Typography>
					</Box>
				</Box>
			</Card>

			<Card
				elevation={0}
				sx={{
					p: 3,
					borderRadius: 3,
					width: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: 2,
				}}
			>
				<Box
					component="img"
					src="/taskbar_example.png"
					alt="Taskbar example"
					sx={{
						maxWidth: "100%",
						borderRadius: 2,
						border: "1px solid",
						borderColor: "divider",
					}}
				/>
				<Typography
					variant="body2"
					color="text.secondary"
					textAlign="center"
				>
					Going forward, the app will start in the taskbar. Click the
					tray icon to{" "}
					<Link component="span" sx={{ cursor: "default" }}>
						Open the Dashboard
					</Link>
					, or{" "}
					<Link component="span" sx={{ cursor: "default" }}>
						Pause / Resume
					</Link>{" "}
					screen time tracking.
				</Typography>
			</Card>

			<Button
				variant="contained"
				size="large"
				onClick={onStart}
				disabled={isSubmitting}
			>
				Start
			</Button>
		</Box>
	);
};

export default SetupSlide;
