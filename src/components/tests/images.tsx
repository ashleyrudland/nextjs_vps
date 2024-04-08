'use client';

import { useState } from 'react';
import Image from 'next/image';

import { TestCard } from '@/components/ui/test-card';

const Images = () => {
	const [imageUrl, setImageUrl] = useState('');
	return (
		<TestCard
			name="NextJS Image Optimisation"
			content={
				<>
					<p>
						<Image
							src="/android-chrome-512x512.png"
							width={128}
							height={128}
							alt="Test NextJS Optimised Image"
							onLoad={e => setImageUrl(e.currentTarget.src)}
						/>
					</p>
					<p>
						{imageUrl
							? `✅ NextJS image optimisation works. src: ${imageUrl}`
							: 'Image loading'}
					</p>
				</>
			}
		/>
	);
};

export default Images;
