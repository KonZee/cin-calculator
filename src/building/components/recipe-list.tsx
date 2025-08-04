import type { Building, Product } from "@/building/types"
import { formatNumber } from "@/utils"

interface RecipeListProps {
	title: string
	recipes: Building[]
	onBuildingClick: (building: Building) => void
	getProductData: (name: string) => Product
}

export function RecipeList({
	title,
	recipes,
	onBuildingClick,
	getProductData,
}: RecipeListProps) {
	if (!recipes.length) return null

	return (
		<>
			<div className="text-lg font-bold">{title}: </div>
			{recipes.map((b) => (
				<div
					key={b.uuid}
					className="p-2 cursor-pointer rounded-xl hover:bg-gray-100"
					onClick={() => onBuildingClick(b)}
					onKeyDown={() => onBuildingClick(b)}
				>
					<span>{b.name}</span>
					<div className="flex items-center gap-2">
						<img
							src={b.icon_path}
							alt={b.name}
							title={b.name}
							className="w-10 h-10 object-cover p-1 border border-gray-200 rounded-sm"
						/>
						<span>:</span>
						{b.recipes[0].inputs.map((i, idx) => (
							<div key={i.name} className="flex items-center gap-2 leading-0">
								<span>{!!idx && <span>+</span>}</span>
								<img
									src={getProductData(i.name)?.icon_path}
									alt={i.name}
									title={i.name}
									className="w-10 h-10 object-cover p-1 border border-gray-200 rounded-sm"
								/>
								{" x "}
								<span className="text-sm font-bold">
									{formatNumber((i.quantity * 60) / b.recipes[0].duration)}
								</span>
							</div>
						))}
						<span>=</span>
						{b.recipes[0].outputs.map((i, idx) => (
							<div key={i.name} className="flex items-center gap-2 leading-0">
								<span>{!!idx && <span>+</span>}</span>
								<img
									src={getProductData(i.name)?.icon_path}
									alt={i.name}
									title={i.name}
									className="w-10 h-10 object-cover p-1 border border-gray-200 rounded-sm"
								/>
								{" x "}
								<span className="text-sm font-bold">
									{formatNumber((i.quantity * 60) / b.recipes[0].duration)}
								</span>
							</div>
						))}
					</div>
				</div>
			))}
		</>
	)
}
