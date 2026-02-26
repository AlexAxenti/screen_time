import { Box } from "@mui/material";
import { useState } from "react";
import type { CloseBehavior } from "../../types/tauriDtos";
import useUpdateSettings from "../../hooks/mutations/useUpdateSettings";
import FeaturesSlide from "./components/FeaturesSlide";
import SetupSlide from "./components/SetupSlide";

const OnboardingFlow = () => {
	const [slide, setSlide] = useState(0);
	const [closeBehavior, setCloseBehavior] = useState<CloseBehavior>("destroy");
	const [startOnStartup, setStartOnStartup] = useState(true);

	const { mutate: updateSettings, isPending } = useUpdateSettings();

	const handleStart = () => {
		updateSettings({
			close_behavior: closeBehavior,
			start_on_startup: startOnStartup,
			idle_duration_ms: 120000,
			is_onboarded: true,
		});
	};

	return (
		<Box
			sx={{
				minHeight: "100vh",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				px: { xs: 2, sm: 3 },
				py: 4,
			}}
		>
			{slide === 0 ? (
				<FeaturesSlide onContinue={() => setSlide(1)} />
			) : (
				<SetupSlide
					closeBehavior={closeBehavior}
					startOnStartup={startOnStartup}
					onCloseBehaviorChange={setCloseBehavior}
					onStartOnStartupChange={setStartOnStartup}
					onStart={handleStart}
					isSubmitting={isPending}
				/>
			)}
		</Box>
	);
};

export default OnboardingFlow;
