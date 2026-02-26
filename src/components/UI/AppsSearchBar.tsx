import {
	Avatar,
	ClickAwayListener,
	InputAdornment,
	MenuItem,
	MenuList,
	Paper,
	Popper,
	type PopperProps,
	type SxProps,
	TextField,
	type Theme,
	useTheme,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import useSearchApplicationTitles from "../../hooks/queries/useSearchApplicationTitles";
import { getIconSrc } from "../../lib/iconPaths";
import type { ApplicationInfo } from "../../types/tauriDtos";

interface AppSearchBarProps {
	onSelect: (app: ApplicationInfo) => void;
	tracked?: boolean;
	placeholder?: string;
	showIcons?: boolean;
	sx?: SxProps<Theme>;
	fullWidth?: boolean;
	popperModifiers?: PopperProps["modifiers"];
	popperSx?: SxProps<Theme>;
	dropdownPaperSx?: SxProps<Theme>;
}

const AppSearchBar = ({
	onSelect,
	tracked,
	placeholder = "Search applications...",
	showIcons = false,
	sx: sxOverride,
	fullWidth = false,
	popperModifiers,
	popperSx,
	dropdownPaperSx,
}: AppSearchBarProps) => {
	const theme = useTheme();
	const [searchValue, setSearchValue] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const [highlightedIndex, setHighlightedIndex] = useState(-1);
	const anchorRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const menuItemRefs = useRef<(HTMLLIElement | null)[]>([]);

	const debouncedSearch = useDebouncedValue(searchValue, 250);
	const { data: applications } = useSearchApplicationTitles(
		debouncedSearch,
		tracked,
	);

	useEffect(() => {
		setHighlightedIndex(-1);
	}, [applications]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchValue(e.target.value);
		setIsOpen(true);
		setHighlightedIndex(-1);
	};

	const handleSelect = (app: ApplicationInfo) => {
		onSelect(app);
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
					setHighlightedIndex((prev) =>
						prev < maxIndex ? prev + 1 : prev,
					);
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
					placeholder={placeholder}
					size="small"
					fullWidth={fullWidth}
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
						...((sxOverride ?? {}) as Record<string, unknown>),
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
					sx={{
						zIndex: theme.zIndex.modal,
						width: anchorRef.current?.offsetWidth,
						...((popperSx ?? {}) as Record<string, unknown>),
					}}
					modifiers={popperModifiers}
				>
					<Paper
						elevation={8}
						sx={{
							mt: 0.5,
							borderRadius: 2,
							overflow: "hidden",
							maxHeight: 300,
							overflowY: "auto",
							...((dropdownPaperSx ?? {}) as Record<string, unknown>),
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
										...(showIcons && {
											display: "flex",
											alignItems: "center",
											gap: 1.5,
										}),
									}}
								>
									{showIcons && (
										<Avatar
											src={getIconSrc(app.app_id)}
											variant="rounded"
											sx={{ width: 22, height: 22 }}
										/>
									)}
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

export default AppSearchBar;
