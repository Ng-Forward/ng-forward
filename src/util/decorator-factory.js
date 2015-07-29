import {providerWriter} from '../writers';
import strategy from './strategy';

const randomInt = () => Math.floor(Math.random() * 100);

export default (type, strategyType = 'provider') => {
	let names = new Set();

	const createUniqueName = name => {
		if( names.has(name) )
		{
			return createUniqueName(`${name}${randomInt()}`, type);
		}
		else
		{
			return name;
		}
	};

	const NAME_TAKEN_ERROR = name => {
		return new Error(`A provider with type ${type} and name ${name} has already been registered`);
	};

	// Return the factory
	let decorator = maybeT => {
		if(typeof maybeT === 'string')
		{
			if( names.has(maybeT) )
			{
				throw NAME_TAKEN_ERROR(maybeT);
			}

			return t => {
				providerWriter.set('type', type, t);
				providerWriter.set('name', maybeT, t);
				names.add(maybeT);
				strategy(strategyType, t);
			};
		}
		else
		{
			let name = createUniqueName(maybeT.name);
			providerWriter.set('type', type, maybeT);
			providerWriter.set('name', name, maybeT);
			names.add(name);
			strategy(strategyType, maybeT);
		}
	};

	decorator.clearNameCache = () => names.clear();

	return decorator;
};
