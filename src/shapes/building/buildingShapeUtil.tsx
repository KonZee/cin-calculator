import { Rectangle2d, ShapeUtil } from "tldraw";
import type { BuildingShape } from "./buildingShape";
import { BuildingView } from "./buildingView";

export class BuildingShapeUtil extends ShapeUtil<BuildingShape> {
	static override type = "building" as const;

	getDefaultProps(): BuildingShape["props"] {
		return {
			w: 100,
			h: 100,
		};
	}

	getGeometry(shape: BuildingShape) {
		return new Rectangle2d({
			width: shape.props.w,
			height: shape.props.h,
			isFilled: true,
		});
	}

	component() {
		return <BuildingView />;
	}

	indicator(shape: BuildingShape) {
		return <rect width={shape.props.w} height={shape.props.h} />;
	}
}
