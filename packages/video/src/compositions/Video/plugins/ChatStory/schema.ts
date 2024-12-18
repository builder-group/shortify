import { z } from 'zod';
import { SVisualMedia } from '@/components';

import { STimelineActionPlugin, STimelineTrackPlugin } from '../../schema';

export { SImageMedia, SVisualMedia } from '@/components';

export const SMessageChatStoryContent = z.discriminatedUnion('type', [
	z.object({
		type: z.literal('Text'),
		text: z.string()
	}),
	z.object({
		type: z.literal('Media'),
		media: SVisualMedia
	})
]);
export type TMessageChatStoryContent = z.infer<typeof SMessageChatStoryContent>;

export const SMessageChatStoryTimelineAction = STimelineActionPlugin.extend({
	pluginId: z.literal('chat-story'),
	props: z.object({
		type: z.literal('Message'),
		messageType: z.enum(['sent', 'received']),
		participant: z.object({
			displayName: z.string(),
			avatar: SVisualMedia.optional()
		}),
		content: SMessageChatStoryContent
	})
});
export type TMessageChatStoryTimelineAction = z.infer<typeof SMessageChatStoryTimelineAction>;

export const SChatStoryTimelineAction = z.discriminatedUnion('type', [
	SMessageChatStoryTimelineAction
]);
export type TChatStoryTimelineAction = z.infer<typeof SChatStoryTimelineAction>;

export const SIMessageChatStoryMessenger = z.object({
	type: z.literal('IMessage'),
	contact: z.object({
		profilePicture: SVisualMedia,
		name: z.string()
	})
});
export type TIMessageChatStoryMessenger = z.infer<typeof SIMessageChatStoryMessenger>;

export const SWhatsAppChatStoryMessenger = z.object({
	type: z.literal('WhatsApp')
});

export const SChatStoryMessenger = z.discriminatedUnion('type', [
	SIMessageChatStoryMessenger,
	SWhatsAppChatStoryMessenger
]);
export type TChatStoryMessenger = z.infer<typeof SChatStoryMessenger>;

export const SChatStoryPlugin = STimelineTrackPlugin.extend({
	pluginId: z.literal('chat-story'),
	props: z.object({
		messenger: SChatStoryMessenger,
		debug: z.boolean().optional()
	})
});
export type TChatStoryPlugin = z.infer<typeof SChatStoryPlugin>;

export function isMessageChatStoryTimelineAction(
	value: unknown
): value is z.infer<typeof SMessageChatStoryTimelineAction> {
	return SMessageChatStoryTimelineAction.safeParse(value).success;
}
