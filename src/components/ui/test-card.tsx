import { ReactNode } from 'react';

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

export const TestCard = ({
	name,
	content,
	footer,
}: {
	name: ReactNode;
	content: ReactNode;
	footer?: ReactNode;
}) => {
	return (
		<Card className="sm:col-span-2 flex-1">
			<CardHeader className="pb-3">
				<CardTitle>{name}</CardTitle>
			</CardHeader>

			<CardContent className="max-w-lg text-balance leading-relaxed">
				{content}
			</CardContent>
			{footer && <CardFooter>{footer}</CardFooter>}
		</Card>
	);
};
