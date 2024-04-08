import { Spinner } from './spinner';
import { Button } from './button';

export default function ButtonLoading() {
	return (
		<Button disabled>
			<Spinner />
			Please wait
		</Button>
	);
}
