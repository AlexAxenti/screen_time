import { InputAdornment, TextField, useTheme } from "@mui/material";
import { FiSearch } from "react-icons/fi";

const SearchBar = () => {
	const theme = useTheme();

	return (
		<TextField
			placeholder="Search..."
			size="small"
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
	);
};

export default SearchBar;
