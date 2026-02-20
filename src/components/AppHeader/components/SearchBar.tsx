import {
	ClickAwayListener,
	InputAdornment,
	MenuItem,
	MenuList,
	Paper,
	Popper,
	TextField,
	useTheme,
} from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import useSearchApplications from "../../../hooks/queries/useSearchApplications";

const SearchBar = () => {
	const theme = useTheme();
	const navigate = useNavigate();
	const [searchValue, setSearchValue] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const [highlightedIndex, setHighlightedIndex] = useState(-1);
	const anchorRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const menuItemRefs = useRef<(HTMLLIElement | null)[]>([]);

	const debouncedSearch = useDebouncedValue(searchValue, 250);
	const { data: applications } = useSearchApplications(debouncedSearch);

	useEffect(() => {
		setHighlightedIndex(-1);
	}, [applications]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchValue(e.target.value);
		setIsOpen(true);
		setHighlightedIndex(-1);
	};

	const handleSelect = (appId: string, displayName: string) => {
		setIsOpen(false);
		setSearchValue("");
		setHighlightedIndex(-1);
		navigate({
			to: "/applications/$exe",
			params: { exe: appId },
			search: { displayName },
		});
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
					const app = applications[highlightedIndex];
					handleSelect(app.app_id, app.display_name);
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
					placeholder="Search applications..."
					size="small"
					value={searchValue}
					onChange={handleInputChange}
					onFocus={() => setIsOpen(true)}
					onKeyDown={handleKeyDown}
					inputRef={inputRef}
					sx={{
						width: { sm: 200, md: 280, lg: 320 },
						mx: 3,
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
					sx={{ zIndex: theme.zIndex.modal }}
					modifiers={[
						{
							name: "offset",
							options: {
								offset: [24, 0],
							},
						},
					]}
				>
					<Paper
						elevation={8}
						sx={{
							mt: 0.5,
							borderRadius: 2,
							overflow: "hidden",
							minWidth: anchorRef.current
								? anchorRef.current.offsetWidth - 48
								: 280,
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
									onClick={() => handleSelect(app.app_id, app.display_name)}
									selected={index === highlightedIndex}
									sx={{
										fontSize: "0.875rem",
										py: 1,
									}}
								>
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

export default SearchBar;
