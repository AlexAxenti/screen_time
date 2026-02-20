import {
	Avatar,
	Box,
	Button,
	Card,
	CircularProgress,
	ClickAwayListener,
	InputAdornment,
	MenuItem,
	MenuList,
	Paper,
	Popper,
	TextField,
	Typography,
	useTheme,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import useSearchApplications from "../../../hooks/queries/useSearchApplications";
import useGetUntrackedApps from "../../../hooks/queries/useGetUntrackedApps";
import useToggleTrackedApp from "../../../hooks/mutations/useToogleTrackedApp";
import { getIconSrc } from "../../../lib/iconPaths";
import type { ApplicationInfo } from "../../../types/tauriDtos";

const UntrackedAppRow = ({ app }: { app: ApplicationInfo }) => {
	const toggleTracked = useToggleTrackedApp();

	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				py: 1.5,
				px: 2,
				"&:not(:last-child)": {
					borderBottom: "1px solid",
					borderColor: "divider",
				},
			}}
		>
			<Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
				<Avatar
					src={getIconSrc(app.app_id)}
					variant="rounded"
					sx={{ width: 28, height: 28 }}
				/>
				<Typography variant="body2">{app.display_name}</Typography>
			</Box>
			<Button
				size="small"
				variant="outlined"
				onClick={() =>
					toggleTracked.mutate({ appId: app.app_id, isTracked: true })
				}
				disabled={toggleTracked.isPending}
			>
				Resume Tracking
			</Button>
		</Box>
	);
};

const UntrackSearchBar = () => {
	const theme = useTheme();
	const toggleTracked = useToggleTrackedApp();
	const [searchValue, setSearchValue] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const [highlightedIndex, setHighlightedIndex] = useState(-1);
	const anchorRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const menuItemRefs = useRef<(HTMLLIElement | null)[]>([]);

	const debouncedSearch = useDebouncedValue(searchValue, 250);
	const { data: applications } = useSearchApplications(debouncedSearch, true);

	useEffect(() => {
		setHighlightedIndex(-1);
	}, [applications]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchValue(e.target.value);
		setIsOpen(true);
		setHighlightedIndex(-1);
	};

	const handleSelect = (app: ApplicationInfo) => {
		toggleTracked.mutate({ appId: app.app_id, isTracked: false });
		setIsOpen(false);
		setSearchValue("");
		setHighlightedIndex(-1);
	};

	const handleClose = () => {
		setIsOpen(false);
		setHighlightedIndex(-1);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (!applications || applications.length === 0) return;

		const maxIndex = applications.length - 1;

		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				if (!isOpen) {
					setIsOpen(true);
					setHighlightedIndex(0);
				} else {
					setHighlightedIndex((prev) => (prev < maxIndex ? prev + 1 : prev));
				}
				break;
			case "ArrowUp":
				e.preventDefault();
				if (highlightedIndex <= 0) {
					setHighlightedIndex(-1);
					inputRef.current?.focus();
				} else {
					setHighlightedIndex((prev) => prev - 1);
				}
				break;
			case "Enter":
				if (highlightedIndex >= 0 && applications[highlightedIndex]) {
					e.preventDefault();
					handleSelect(applications[highlightedIndex]);
				}
				break;
			case "Escape":
				e.preventDefault();
				handleClose();
				inputRef.current?.focus();
				break;
		}
	};

	useEffect(() => {
		if (highlightedIndex >= 0 && menuItemRefs.current[highlightedIndex]) {
			menuItemRefs.current[highlightedIndex]?.scrollIntoView({
				block: "nearest",
			});
		}
	}, [highlightedIndex]);

	const showDropdown =
		isOpen &&
		debouncedSearch.length > 0 &&
		applications &&
		applications.length > 0;

	return (
		<ClickAwayListener onClickAway={handleClose}>
			<div ref={anchorRef}>
				<TextField
					placeholder="Search apps to untrack..."
					size="small"
					fullWidth
					value={searchValue}
					onChange={handleInputChange}
					onFocus={() => setIsOpen(true)}
					onKeyDown={handleKeyDown}
					inputRef={inputRef}
					sx={{
						"& .MuiOutlinedInput-root": {
							backgroundColor:
								theme.palette.mode === "dark"
									? "rgba(255, 255, 255, 0.05)"
									: "rgba(0, 0, 0, 0.03)",
							borderRadius: 3,
							"& fieldset": {
								borderColor: "transparent",
							},
							"&:hover fieldset": {
								borderColor: theme.palette.divider,
							},
							"&.Mui-focused fieldset": {
								borderColor: "primary.main",
								borderWidth: 1,
							},
						},
						"& .MuiInputBase-input": {
							fontSize: "0.875rem",
							py: 1,
						},
					}}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<FiSearch
									style={{
										color: "text.secondary",
										fontSize: "1.2rem",
									}}
								/>
							</InputAdornment>
						),
					}}
				/>
				<Popper
					open={showDropdown ?? false}
					anchorEl={anchorRef.current}
					placement="bottom-start"
					sx={{ zIndex: theme.zIndex.modal, width: anchorRef.current?.offsetWidth }}
				>
					<Paper
						elevation={8}
						sx={{
							mt: 0.5,
							borderRadius: 2,
							overflow: "hidden",
							maxHeight: 300,
							overflowY: "auto",
						}}
					>
						<MenuList dense>
							{applications?.map((app, index) => (
								<MenuItem
									key={app.app_id}
									ref={(el) => {
										menuItemRefs.current[index] = el;
									}}
									onClick={() => handleSelect(app)}
									selected={index === highlightedIndex}
									sx={{
										fontSize: "0.875rem",
										py: 1,
										display: "flex",
										alignItems: "center",
										gap: 1.5,
									}}
								>
									<Avatar
										src={getIconSrc(app.app_id)}
										variant="rounded"
										sx={{ width: 22, height: 22 }}
									/>
									{app.display_name}
								</MenuItem>
							))}
						</MenuList>
					</Paper>
				</Popper>
			</div>
		</ClickAwayListener>
	);
};

const UntrackedAppsSection = () => {
	const { data: untrackedApps, isLoading, isError } = useGetUntrackedApps();

	return (
		<Card elevation={0} sx={{ p: 3, borderRadius: 3 }}>
			<Typography variant="h5" fontWeight={500}>
				Untracked Applications
			</Typography>
			<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
				Untracked apps will not record future activity. Existing history will remain.
			</Typography>

			<UntrackSearchBar />

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
