import { Box, Button, Card, Typography } from "@mui/material";

const pages = [
	{
		src: "/dashboard.png",
		title: "Dashboard",
		description:
			"Get a quick overview of your daily screen time, top apps, and usage trends at a glance.",
	},
	{
		src: "/applications_list.png",
		title: "Applications List",
		description:
			"Browse all tracked applications, search by name, and see cumulative usage stats.",
	},
	{
		src: "/applications_detail.png",
		title: "Application Detail",
		description:
			"Dive into per-app analytics with session history, daily breakdowns, and usage patterns.",
	},
	{
		src: "/settings.png",
		title: "Settings",
		description:
			"Customize close behavior, startup preferences, idle timeout, and more.",
	},
];

interface FeaturesSlideProps {
	onContinue: () => void;
}

const FeaturesSlide = ({ onContinue }: FeaturesSlideProps) => {
	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: 4,
				width: "100%",
				maxWidth: 900,
			}}
		>
			<Typography variant="h4" fontWeight={600}>
				Welcome to Screen Time
			</Typography>
			<Typography variant="body1" color="text.secondary">
				Here's what you can do with the app.
			</Typography>

			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: "1fr 1fr",
					gap: 3,
					width: "100%",
				}}
			>
				{pages.map((page) => (
					<Card
						key={page.title}
						elevation={0}
						sx={{
							p: 2,
							borderRadius: 3,
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: 1,
						}}
					>
						<Typography variant="h6" fontWeight={500}>
							{page.title}
						</Typography>
						<Box
							component="img"
							src={page.src}
							alt={page.title}
							sx={{
								width: "100%",
								aspectRatio: "16 / 10",
								objectFit: "cover",
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
							{page.description}
						</Typography>
					</Card>
				))}
			</Box>

			<Button variant="contained" size="large" onClick={onContinue}>
				Continue
			</Button>
		</Box>
	);
};

export default FeaturesSlide;
