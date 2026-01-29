import { useState, useRef } from "react";
import {
	InputAdornment,
	TextField,
	useTheme,
	Paper,
	MenuList,
	MenuItem,
	Popper,
	ClickAwayListener,
} from "@mui/material";
import { FiSearch } from "react-icons/fi";
import { useNavigate } from "@tanstack/react-router";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import useSearchApplications from "../../../queries/searchApplications";

const SearchBar = () => {
	const theme = useTheme();
	const navigate = useNavigate();
	const [searchValue, setSearchValue] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const anchorRef = useRef<HTMLDivElement>(null);

	const debouncedSearch = useDebouncedValue(searchValue, 300);
	const { data: applications } = useSearchApplications(debouncedSearch);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchValue(e.target.value);
		setIsOpen(true);
	};

	const handleSelect = (windowExe: string) => {
		setIsOpen(false);
		setSearchValue("");
		navigate({
			to: "/applications/$exe",
			params: { exe: windowExe },
		});
	};

	const handleClose = () => {
		setIsOpen(false);
	};

	const showDropdown =
		isOpen && debouncedSearch.length > 0 && applications && applications.length > 0;

	return (
		<ClickAwayListener onClickAway={handleClose}>
			<div ref={anchorRef}>
				<TextField
					placeholder="Search..."
					size="small"
					value={searchValue}
					onChange={handleInputChange}
					onFocus={() => setIsOpen(true)}
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
							minWidth: anchorRef.current ? anchorRef.current.offsetWidth - 48 : 280,
						}}
					>
						<MenuList dense>
							{applications?.map((app) => (
								<MenuItem
									key={app.window_exe}
									onClick={() => handleSelect(app.window_exe)}
									sx={{
										fontSize: "0.875rem",
										py: 1,
									}}
								>
									{app.window_exe}
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
