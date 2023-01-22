// deno-lint-ignore-file no-explicit-any
export default {
	stringify: (x: unknown) => {
		try {
			return JSON.stringify(x);
		} catch (error: any) {
			log.error(error);
			return x;
		}
	},
	parse: (x: any) => {
		try {
			return JSON.parse(x);
		} catch (error: any) {
			log.error(error);
			return x;
		}
	},
};
