import Capacity from '@/components/tests/capacity';
import DbTest from '@/components/tests/db';
import Images from '@/components/tests/images';
import { ArrowRightIcon } from 'lucide-react';

export default function Home() {
	return (
		<>
			<a
				href="https://buy.stripe.com/cN2cPLcsc1z9f2U3ce"
				target="_blank"
				className="block text-center w-full custom-gradient border border-transparent text-white p-3"
			>
				Want to create the same VPS that I did?{' '}
				<strong className="underline">
					Check out my guide on how to do it
					<ArrowRightIcon size={24} className="inline-block ml-1" />
				</strong>
			</a>
			<main className="flex min-h-screen flex-col p-10 space-y-6">
				<h1 className="font-bold text-xl">
					VPS vs Vercel - Ashley Rudland's VPS Playground
				</h1>

				<p>
					Source code:{' '}
					<a
						href="https://github.com/ashleyrudland/nextjs_vps"
						target="_blank"
						rel="noreferrer noopener"
						className="underline"
					>
						GitHub
					</a>
				</p>
				<p>
					Do we need Vercel? (
					<a
						className="underline"
						href="https://twitter.com/ashleyrudland/status/1777676883078824151"
						target="_blank"
					>
						it seems not
					</a>
					) Can we just run our NextJS apps on a VM? Maybe all our
					apps on one machine?
				</p>

				<p>
					I love NextJS, but I don't like Vercels pricing. It seems
					nuts to me and it seems many other people do too. So I spent
					a few hours playing with this and{' '}
					<span className="line-through">Digital Ocean</span> Hetzner
					Cloud (€3.30/mo 🤣) to see what was possible.
				</p>

				<div className="flex flex-col gap-6 sm:flex-row sm:gap-10">
					<DbTest />
					<Capacity />
				</div>
			</main>
		</>
	);
}
