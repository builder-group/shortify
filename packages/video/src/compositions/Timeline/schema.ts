import { z } from 'zod';

// =============================================================================
// Basic schemas
// =============================================================================

export const STimelinePosition = z.number().int().min(0);
export const SDuration = z.number().int().min(0);
export const SUrl = z.string().url();
export const SObjectFit = z.enum(['contain', 'cover', 'fill', 'none', 'scale-down']);

function createKeyframeSchema<T extends z.ZodTypeAny>(valueSchema: T) {
	return z.object({
		frame: z.number().int().min(0),
		value: valueSchema
	});
}

function createValueOrKeyframeSchema<T extends z.ZodTypeAny>(valueSchema: T) {
	return z.union([valueSchema, z.array(createKeyframeSchema(valueSchema))]);
}

export type TValueOrKeyframe<GValue> = GValue | { frame: number; value: GValue }[];

// =============================================================================
// Mixin schemas
// =============================================================================

export const STimelineMixin = z.object({
	id: z.string(),
	startFrame: STimelinePosition,
	durationInFrames: SDuration
});

export const SSizeMixin = z.object({
	width: createValueOrKeyframeSchema(z.number()),
	height: createValueOrKeyframeSchema(z.number())
});

export const STransformMixin = z.object({
	x: createValueOrKeyframeSchema(z.number()),
	y: createValueOrKeyframeSchema(z.number())
});

export const SVisibilityMixin = z.object({
	visible: z.boolean()
});

export const SOpacityMixin = z.object({
	opacity: createValueOrKeyframeSchema(z.number().min(0).max(1))
});

export const SVideoFill = z.object({
	type: z.literal('video'),
	src: z.string().url(),
	objectFit: SObjectFit,
	width: z.number().int().positive(),
	height: z.number().int().positive()
});

export const SImageFill = z.object({
	type: z.literal('image'),
	src: z.string().url(),
	objectFit: SObjectFit,
	width: z.number().int().positive(),
	height: z.number().int().positive()
});

export const SSolidFill = z.object({
	type: z.literal('solid'),
	color: z.string()
});

export const SFillMixin = z.object({
	fill: z.discriminatedUnion('type', [SVideoFill, SImageFill, SSolidFill])
});

// =============================================================================
// Item schemas
// =============================================================================

export const SPluginItem = STimelineMixin.merge(SVisibilityMixin).extend({
	type: z.literal('Plugin'),
	pluginId: z.string(),
	content: z.any()
});

export const SAudioItem = STimelineMixin.extend({
	type: z.literal('Audio'),
	src: SUrl,
	volume: z.number().min(0).max(1)
});

export const SRectangleItem = STimelineMixin.merge(SSizeMixin)
	.merge(STransformMixin)
	.merge(SVisibilityMixin)
	.merge(SOpacityMixin)
	.extend({
		type: z.literal('Rectangle')
	});

export const STimelineItem = z.union([SPluginItem, SAudioItem, SRectangleItem]);

// =============================================================================
// Other
// =============================================================================

export const STimelineCompProps = z.object({
	name: z.string(),
	width: z.number().int().positive().optional(),
	height: z.number().int().positive().optional(),
	fps: z.number().positive().optional(),
	durationInFrames: z.number().int().positive().optional(),
	timeline: z.array(STimelineItem),
	plugins: z.array(z.lazy(() => SPlugin))
});

const SPlugin = z.object({
	id: z.string(),
	version: z.string(),
	render: z.function().args(SPluginItem, z.number().int()).returns(z.void())
});
