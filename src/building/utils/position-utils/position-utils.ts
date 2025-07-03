import type { Editor } from "tldraw"
import type { Building } from "../../types"
import type { BuildingShape } from "@/shapes/building/buildingShape"
import { cardHeights, cardVerticalGap, cardWidth } from "../../constants"

// Helper function to check if two rectangles intersect
const doRectanglesIntersect = (
	rect1: { x: number; y: number; w: number; h: number },
	rect2: { x: number; y: number; w: number; h: number },
): boolean => {
	return !(
		rect1.x + rect1.w <= rect2.x ||
		rect2.x + rect2.w <= rect1.x ||
		rect1.y + rect1.h <= rect2.y ||
		rect2.y + rect2.h <= rect1.y
	)
}

// Helper function to calculate building dimensions based on recipe
export const calculateBuildingDimensions = (building: Building) => {
	const maxConnections = Math.max(
		building.recipes[0].inputs.length,
		building.recipes[0].outputs.length,
	)

	// Use the same logic as in building-create-utils for height calculation
	const height = cardHeights[Math.max(0, maxConnections - 1)]

	return {
		width: cardWidth,
		height,
	}
}

// Helper function to find a suitable Y position that avoids collisions
export const findSuitableYPosition = (
	editor: Editor,
	targetX: number,
	targetY: number,
	shapeWidth: number,
	shapeHeight: number,
): number => {
	const existingShapes = editor
		.getCurrentPageShapes()
		.filter((shape) => shape.type === "building") as BuildingShape[]

	// Check if the target position is free
	const targetRect = {
		x: targetX,
		y: targetY,
		w: shapeWidth,
		h: shapeHeight,
	}

	const hasCollision = existingShapes.some((shape) => {
		const existingRect = {
			x: shape.x,
			y: shape.y,
			w: shape.props.w,
			h: shape.props.h,
		}
		return doRectanglesIntersect(targetRect, existingRect)
	})

	if (!hasCollision) {
		return targetY
	}

	// Find the lowest Y position of existing shapes in the same X column
	const shapesInColumn = existingShapes.filter((shape) => {
		const existingRect = {
			x: shape.x,
			y: shape.y,
			w: shape.props.w,
			h: shape.props.h,
		}
		// Check if shapes overlap horizontally
		return !(
			targetX + shapeWidth <= existingRect.x ||
			existingRect.x + existingRect.w <= targetX
		)
	})

	if (shapesInColumn.length === 0) {
		return targetY
	}

	// Find the maximum Y + height of shapes in the column
	const maxY = Math.max(
		...shapesInColumn.map((shape) => shape.y + shape.props.h),
	)

	// Return the position below the lowest shape plus gap
	return maxY + cardVerticalGap
}
