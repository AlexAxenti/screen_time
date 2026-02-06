import { getIconSrc } from "../../../lib/iconPaths";
import type { ApplicationUsage } from "../../../types/dto";

export const createCustomYAxisTick = (chartData: ApplicationUsage[]) => {
	return ({ x, y, payload }: any) => {
		const displayName = payload.value;
		if (!displayName) return null;
    
		const appData = chartData.find(
			(item) => item.app_info.display_name === displayName
		);
		
		if (!appData) {
			return null;
		}

		const iconSize = 16;
		const truncate = (s: string, n = 12) =>
			s.length > n ? `${s.slice(0, n - 1)}…` : s;

		return (
			<g transform={`translate(${x},${y})`}>
				<image
					x={-110}
					y={-iconSize / 2}
					width={iconSize}
					height={iconSize}
					href={getIconSrc(appData.app_info.app_id)}
					onError={(e: any) => {
						e.target.href.baseVal = "/app_placeholder.png";
					}}
				/>
				<text
					x={-85}
					y={0}
					dy={4}
					textAnchor="start"
					fontSize={14}
					fill="#666666"
				>
					{truncate(displayName)}
				</text>
			</g>
		);
	};
};