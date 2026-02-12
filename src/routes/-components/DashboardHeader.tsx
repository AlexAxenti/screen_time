import { Box, Popover, Typography } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { type Dayjs } from "dayjs";
import { useMemo, useState } from "react";

interface DashboardHeaderProps {
	rangeStartMs: number;
	rangeEndMs: number;
	weekStartMs: number;
	weekEndMs: number;
	onWeekChange: (startDate: Date) => void;
}

const DashboardHeader = ({
	rangeStartMs,
	rangeEndMs,
	weekStartMs,
	weekEndMs,
	onWeekChange,
}: DashboardHeaderProps) => {
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const open = Boolean(anchorEl);

	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleDateChange = (value: Dayjs | null) => {
		if (value) {
			onWeekChange(value.toDate());
			handleClose();
		}
	};

	const timeframeLabel = useMemo(() => {
		const startDate = new Date(rangeStartMs);

		const isSingleDay = rangeEndMs - rangeStartMs === 24 * 60 * 60 * 1000;

		if (isSingleDay) {
			return startDate.toLocaleDateString("en-US", {
				weekday: "long",
				month: "short",
				day: "numeric",
			});
		} else {
			const startFormatted = startDate.toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
			});
			const endFormatted = new Date(rangeEndMs - 1).toLocaleDateString(
				"en-US",
				{ month: "short", day: "numeric" },
			);
			return `${startFormatted} - ${endFormatted}`;
		}
	}, [rangeStartMs, rangeEndMs, weekStartMs, weekEndMs]);

	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				marginBottom: 3,
				paddingBottom: 2,
				borderBottom: "1px solid",
				borderColor: "divider",
			}}
		>
			<Typography
				variant="h4"
				sx={{
					fontWeight: 600,
					color: "text.primary",
				}}
			>
				Dashboard
			</Typography>
			<Box
				onClick={handleClick}
				sx={{
					textAlign: "right",
					cursor: "pointer",
					padding: "6px 14px",
					borderRadius: 2,
					transition: "background-color 0.2s",
					"&:hover": {
						backgroundColor: "action.hover",
					},
				}}
			>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "flex-end",
						gap: 0.5,
						marginBottom: 0.25,
					}}
				>
					<Typography
						variant="caption"
						sx={{
							color: "text.secondary",
							letterSpacing: "0.05em",
						}}
					>
						Selected Timeframe
					</Typography>
					<KeyboardArrowDownIcon
						sx={{
							fontSize: 16,
							color: "text.secondary",
							transform: open ? "rotate(180deg)" : "rotate(0deg)",
							transition: "transform 0.2s",
						}}
					/>
				</Box>
				<Typography
					variant="body2"
					sx={{
						fontWeight: 500,
						color: "text.secondary",
					}}
				>
					{timeframeLabel}
				</Typography>
			</Box>
			<Popover
				open={open}
				anchorEl={anchorEl}
				onClose={handleClose}
				disableScrollLock
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "right",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "right",
				}}
				slotProps={{
					paper: {
						sx: {
							border: "1px solid",
							borderColor: "divider",
							borderRadius: 3,
							mt: 1,
							overflow: "hidden",
						},
					},
				}}
			>
				<LocalizationProvider dateAdapter={AdapterDayjs}>
					<DateCalendar
						value={dayjs(weekStartMs)}
						onChange={handleDateChange}
						maxDate={dayjs()}
						sx={{ height: "300px" }}
					/>
				</LocalizationProvider>
			</Popover>
		</Box>
	);
};

export default DashboardHeader;
