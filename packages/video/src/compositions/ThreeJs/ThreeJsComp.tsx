import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { TRemotionFC } from '@/types';

import { SThreeJsComp } from './schema';
import { MelodicMarbleRunSketch } from './sketches';

export const ThreeJsComp: TRemotionFC<z.infer<typeof SThreeJsComp>> = (props) => {
	const { width, height } = useVideoConfig();

	return (
		<AbsoluteFill className="bg-blue-500" style={{ width, height }}>
			<ThreeCanvas linear width={width} height={height}>
				<MelodicMarbleRunSketch />
			</ThreeCanvas>
		</AbsoluteFill>
	);
};

ThreeJsComp.schema = SThreeJsComp;
ThreeJsComp.id = 'ThreeJs';
