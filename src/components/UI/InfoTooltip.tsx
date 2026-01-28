import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { IconButton, Tooltip, type TooltipProps } from "@mui/material";

interface InfoTooltipProps {
	text: string;
	placement?: TooltipProps["placement"];
	iconSize?: "small" | "medium" | "inherit";
}

const InfoTooltip = ({
	text,
	placement = "top",
	iconSize = "small",
}: InfoTooltipProps) => {
	return (
		<Tooltip title={text} placement={placement} arrow>
			<IconButton
				size="small"
				sx={{
					padding: 0.5,
					opacity: 0.6,
					"&:hover": {
						opacity: 1,
						backgroundColor: "transparent",
					},
				}}
			>
				<InfoOutlinedIcon fontSize={iconSize} color="inherit" />
			</IconButton>
		</Tooltip>
	);
};

export default InfoTooltip;
