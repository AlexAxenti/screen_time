import { useNavigate } from "@tanstack/react-router";
import AppSearchBar from "../../UI/AppsSearchBar";
import type { ApplicationInfo } from "../../../types/tauriDtos";

const HeaderSearchBar = () => {
	const navigate = useNavigate();

	const handleSelect = (app: ApplicationInfo) => {
		navigate({
			to: "/applications/$exe",
			params: { exe: app.app_id },
			search: { displayName: app.display_name },
		});
	};

	return (
		<AppSearchBar
			onSelect={handleSelect}
			placeholder="Search applications..."
			sx={{
				width: { sm: 200, md: 280, lg: 320 },
				mx: 3,
			}}
			popperModifiers={[
				{
					name: "offset",
					options: {
						offset: [0, 0],
					},
				},
			]}
			dropdownPaperSx={{
				minWidth: 232,
			}}
			showIcons
		/>
	);
};

export default HeaderSearchBar;
