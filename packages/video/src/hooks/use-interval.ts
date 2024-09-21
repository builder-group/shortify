import React from 'react';

export function useInterval(callback: () => void, delay: number | null) {
	const savedCallback = React.useRef(callback);

	// Remember the latest callback if it changes
	React.useEffect(() => {
		savedCallback.current = callback;
	}, [callback]);

	// Set up the interval
	React.useEffect(() => {
		// Don't schedule if no delay is specified
		// Note: 0 is a valid value for delay
		if (delay == null) {
			return;
		}

		const id = setInterval(() => {
			savedCallback.current();
		}, delay);

		return () => {
			clearInterval(id);
		};
	}, [delay]);
}