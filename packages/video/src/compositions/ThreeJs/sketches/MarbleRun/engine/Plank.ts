import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';

import { MeshBody } from './MeshBody';

export class Plank extends MeshBody {
	public static init(scene: THREE.Scene, world: RAPIER.World, config: TMarbleConfig) {
		const {
			position,
			angleRad,
			color = 0x808080,
			width = 4,
			height = 1,
			depth = 1,
			restitution = 1,
			debug = false
		} = config;

		// Create visual mesh
		const plankGeometry = new THREE.BoxGeometry(width, height, depth);
		const plankMaterial = new THREE.MeshStandardMaterial({
			color,
			metalness: 0.1,
			roughness: 0.7
		});
		const plankMesh = new THREE.Mesh(plankGeometry, plankMaterial);

		scene.add(plankMesh);

		// Create rotation quaternion
		const quaternion = new THREE.Quaternion();
		quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), angleRad);

		// Create physics body
		const plankDesc = RAPIER.RigidBodyDesc.fixed()
			.setTranslation(position.x, position.y, position.z)
			.setRotation({
				x: quaternion.x,
				y: quaternion.y,
				z: quaternion.z,
				w: quaternion.w
			});
		const plankBody = world.createRigidBody(plankDesc);

		// Create collider
		const colliderDesc = RAPIER.ColliderDesc.cuboid(width / 2, height / 2, depth / 2)
			.setRestitution(restitution)
			.setFriction(0.7);
		world.createCollider(colliderDesc, plankBody);

		if (debug) {
			// Create the red dot to represent the origin point
			const originGeometry = new THREE.SphereGeometry(0.1); // Small sphere
			const originMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red color
			const originMesh = new THREE.Mesh(originGeometry, originMaterial);

			// Set the position of the origin dot to match the plank's position
			originMesh.position.copy(position);

			// Optionally, set the origin dot to be in front of the plank if needed
			originMesh.position.z += depth / 2 + 0.1; // Adjust this if needed

			// Add the origin mesh to the scene
			scene.add(originMesh);
		}

		return new this(plankMesh, plankBody);
	}
}

export interface TMarbleConfig {
	position: THREE.Vector3;
	angleRad: number;
	width?: number;
	height?: number;
	depth?: number;
	restitution?: number; // Bounciness (0-1)
	color?: number; // THREE.js color
	debug?: boolean;
}
