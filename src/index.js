const formats = {
	combined: ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
	commin: ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length]',
	default: ':remote-addr - :remote-user [:date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
	short: ':remote-addr :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms',
	tiny: ':method :url :status :res[content-length] - :response-time ms',
};

const getValues = {
	'remote-addr': req => req.something,
	method: ({ method }) => method,
	url: ({ url }) => url,
	status: req => req.res.statusCode,
	'response-time': ({ _responseTime }) => _responseTime,
	'res[content-length]': req => '-',
};

/** @param {string} format */
const formatMessage = (format, req = {}) => {
	const items = format.split(' ').filter(item => item.startsWith(':'));

	let message = format;
	items.forEach(item => {
		const key = item.slice(1);
		const formatFunction = getValues[key];
		if (!formatFunction) return;

		message = message.replace(item, formatFunction(req));
	});

	return message;
};

/**
 *
 * @param {('combined'|'common'|'dev'|'short'|'tiny')} format
 */
const main = format => {
	return (req, res, next) => {
		const startTime = Date.now();

		const log = () => {
			req._responseTime = Date.now() - startTime;
			const message = formatMessage(formats[format], req);
			console.log(message);
		};

		res.on('finish', log);
		next();
	};
};

export default main;
