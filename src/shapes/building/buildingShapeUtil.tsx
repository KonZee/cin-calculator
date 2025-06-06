import { Rectangle2d, ShapeUtil } from "tldraw";
import type { BuildingShape } from "./buildingShape";
import { BuildingView } from "./buildingView";

export class BuildingShapeUtil extends ShapeUtil<BuildingShape> {
	static override type = "building" as const;

	getDefaultProps(): BuildingShape["props"] {
		return {
			w: 400,
			h: 300,
		};
	}

	getGeometry(shape: BuildingShape) {
		return new Rectangle2d({
			width: shape.props.w,
			height: shape.props.h,
			isFilled: true,
		});
	}

	component(shape: BuildingShape) {
		return <BuildingView shape={shape} />;
	}

	indicator(shape: BuildingShape) {
		return <rect width={shape.props.w} height={shape.props.h} />;
	}
}
