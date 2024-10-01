export type Server = (req: Request) => Promise<Response>;
export type Context = Record<string, unknown>;
export type Middleware = (
	req: Request,
	res: Response,
	ctx: Context,
) => Promise<Response | null>;

export function app<T>(middleware: Middleware[]): Server {
	const wares = middleware.filter(Boolean);

	return async (req: Request): Promise<Response> => {
		const res = new Response();
		const ctx: T | Context = {};

		const next = async (): Promise<Response> => {
			const fn = wares.shift();
			if (!fn) return Response.json({ ok: true });
			const result = await fn(req, res, ctx);
			if (!result) return next();
			return result;
		};

		return next();
	};
}
