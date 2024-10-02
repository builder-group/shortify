import { staticFile } from 'remotion';

export function getAbsoluteSrc(src: string): string {
	if (src.startsWith('http')) {
		return src;
	}
	return staticFile(src);
}
