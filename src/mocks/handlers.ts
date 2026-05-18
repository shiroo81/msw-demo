import { restHandlers } from './rest';
import { graphqlHandlers } from './graphql';

export const handlers = [...restHandlers, ...graphqlHandlers];
